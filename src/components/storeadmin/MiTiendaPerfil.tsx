import React, { useState, useEffect, useRef } from 'react';
import {
  Store as StoreIcon,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Video,
  Youtube,
  CheckCircle2,
  Save,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  UploadCloud,
  X,
  Link as LinkIcon,
  ShieldCheck,
} from 'lucide-react';
import { Store, StoreProfileSettings } from '../../types';
import {
  getStoreProfile,
  fetchStoreProfile,
  saveStoreProfile,
  uploadStoreLogo,
  ALLOWED_LOGO_MIME_TYPES,
  MAX_LOGO_SIZE_BYTES,
} from '../../lib/storeAdminService';

interface MiTiendaPerfilProps {
  store: Store;
}

export const MiTiendaPerfil: React.FC<MiTiendaPerfilProps> = ({ store }) => {
  const [profile, setProfile] = useState<StoreProfileSettings>(() =>
    getStoreProfile(store.id)
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados dedicados para la gestión del logo (Subida, Previsualización y Validación)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [logoActionError, setLogoActionError] = useState<string | null>(null);
  const [logoActionSuccess, setLogoActionSuccess] = useState<string | null>(null);
  const [logoImgError, setLogoImgError] = useState<boolean>(false);

  // Limpiar memoria de objeto URL en desmontaje o cambio de archivo
  useEffect(() => {
    return () => {
      if (previewLogoUrl) {
        URL.revokeObjectURL(previewLogoUrl);
      }
    };
  }, [previewLogoUrl]);

  // Cargar datos reales desde Supabase garantizando persistencia centralizada
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetchStoreProfile(store.id)
      .then((remoteProfile) => {
        if (mounted) {
          setProfile(remoteProfile);
          setLogoImgError(false);
        }
      })
      .catch((err) => {
        console.warn('[MiTiendaPerfil] Error cargando perfil remoto:', err);
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [store.id]);

  // Manejador de selección de archivo local para el logo
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoActionError(null);
    setLogoActionSuccess(null);

    if (!file) return;

    // Validación 1: Tamaño máximo (2 MB)
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setLogoActionError(
        `El archivo "${file.name}" supera el límite de 2 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor elige un archivo más liviano.`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validación 2: Formatos permitidos por el bucket store-logos
    const mime = file.type?.toLowerCase() || '';
    if (!ALLOWED_LOGO_MIME_TYPES.includes(mime)) {
      setLogoActionError(
        'Formato no permitido. Solo se aceptan imágenes en formato PNG, JPEG/JPG, WEBP o SVG.'
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Crear previsualización local reactiva sin alterar stores.logo_url
    if (previewLogoUrl) {
      URL.revokeObjectURL(previewLogoUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setSelectedLogoFile(file);
    setPreviewLogoUrl(localUrl);
  };

  // Descartar archivo seleccionado y su previsualización
  const handleCancelSelectedLogo = () => {
    if (previewLogoUrl) {
      URL.revokeObjectURL(previewLogoUrl);
    }
    setSelectedLogoFile(null);
    setPreviewLogoUrl(null);
    setLogoActionError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Subir archivo al bucket 'store-logos' y persistir inmediatamente en stores.logo_url
  const handleUploadAndSaveLogo = async () => {
    if (!selectedLogoFile) return;

    setIsUploadingLogo(true);
    setLogoActionError(null);
    setLogoActionSuccess(null);
    setErrorMessage(null);

    try {
      // 1. Subir archivo al bucket store-logos con aislamiento por tenant {tenantId}/logo.{ext}
      const uploadRes = await uploadStoreLogo(store.id, selectedLogoFile);
      if (!uploadRes.success || !uploadRes.publicUrl) {
        setLogoActionError(uploadRes.error || 'Error al subir el archivo a Supabase Storage.');
        setIsUploadingLogo(false);
        return;
      }

      const newLogoUrl = uploadRes.publicUrl;

      // 2. Persistir en stores.logo_url vía saveStoreProfile manteniendo el resto del perfil intacto
      const updatedProfile: StoreProfileSettings = {
        ...profile,
        logoUrl: newLogoUrl,
      };

      const saveRes = await saveStoreProfile(store.id, updatedProfile);
      if (!saveRes.success) {
        setLogoActionError(
          `El archivo se subió a Storage pero ocurrió un error al asociarlo a stores.logo_url: ${saveRes.error || 'Error desconocido'}`
        );
        setIsUploadingLogo(false);
        return;
      }

      // 3. Confirmar éxito y actualizar estado oficial
      setProfile(updatedProfile);
      if (previewLogoUrl) {
        URL.revokeObjectURL(previewLogoUrl);
      }
      setSelectedLogoFile(null);
      setPreviewLogoUrl(null);
      setLogoImgError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setLogoActionSuccess(
        'Logo actualizado exitosamente. Ahora es el único logo vigente de tu comercio.'
      );
      setTimeout(() => setLogoActionSuccess(null), 5000);
    } catch (err: any) {
      setLogoActionError(err?.message || 'Error inesperado al procesar la subida del logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Guardado general del formulario de perfil
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);
    setLogoActionError(null);

    try {
      let profileToSave = { ...profile };

      // Si el comerciante seleccionó un archivo y pulsó guardar sin haber hecho clic en el botón individual:
      if (selectedLogoFile) {
        setIsUploadingLogo(true);
        const uploadRes = await uploadStoreLogo(store.id, selectedLogoFile);
        setIsUploadingLogo(false);

        if (!uploadRes.success || !uploadRes.publicUrl) {
          setErrorMessage(`Error al subir el logo: ${uploadRes.error || 'Fallo de almacenamiento'}`);
          setIsSaving(false);
          return;
        }

        profileToSave.logoUrl = uploadRes.publicUrl;
      }

      const result = await saveStoreProfile(store.id, profileToSave);
      if (result.success) {
        setProfile(profileToSave);
        if (selectedLogoFile) {
          if (previewLogoUrl) URL.revokeObjectURL(previewLogoUrl);
          setSelectedLogoFile(null);
          setPreviewLogoUrl(null);
          setLogoImgError(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(result.error || 'No se pudo guardar la información en Supabase.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error inesperado al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-indigo-400" />
            <span>Perfil del Comercio</span>
            {isLoading && (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin ml-2" title="Sincronizando con Supabase..." />
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Información de identidad pública, ubicación y canales de contacto directo (almacenamiento centralizado en Supabase)
          </p>
        </div>

        <button
          type="submit"
          id="btn-guardar-perfil-comercio"
          disabled={isSaving || isUploadingLogo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          {isSaving || isUploadingLogo ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div
          id="alerta-perfil-guardado-exitoso"
          className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Información de perfil actualizada exitosamente en Supabase para {profile.name}.</span>
        </div>
      )}

      {errorMessage && (
        <div
          id="alerta-perfil-error-guardado"
          className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">No se pudo guardar el perfil en Supabase</span>
            <span className="text-[11px] text-rose-200/90">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Identidad del Comercio (Logo, Nombre, Descripción) */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Identidad Principal
          </h3>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Un único logo vigente por comercio</span>
          </span>
        </div>

        {/* Nombre de la Tienda */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Nombre de la Tienda / Negocio
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
            placeholder="Ej. Restaurante Gourmet Roma"
            required
          />
        </div>

        {/* Sección Especializada: Logo del Comercio */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white">Logo del Comercio</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Formatos: PNG, JPG, WEBP, SVG • Máx. 2 MB
            </span>
          </div>

          {/* Feedback específico para acciones del logo */}
          {logoActionSuccess && (
            <div
              id="alerta-logo-exito"
              className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{logoActionSuccess}</span>
            </div>
          )}

          {logoActionError && (
            <div
              id="alerta-logo-error"
              className="p-3 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Error en el logo</span>
                <span className="text-[11px] text-rose-200/90">{logoActionError}</span>
              </div>
            </div>
          )}

          {/* Comparador Visual: Logo Actual vs Previsualización */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Visualizador del Logo Oficial Vigente */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile.logoUrl && !logoImgError ? (
                  <img
                    id="img-logo-oficial"
                    src={profile.logoUrl}
                    alt={`Logo de ${profile.name}`}
                    onError={() => setLogoImgError(true)}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <StoreIcon className="w-7 h-7 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-white">Logo Actual</span>
                  {profile.logoUrl && !logoImgError && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-medium">
                      Vigente
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {profile.logoUrl && !logoImgError
                    ? profile.logoUrl.includes('supabase.co/storage')
                      ? 'Alojado en Supabase Storage'
                      : 'URL Externa configurada'
                    : 'Sin logo oficial configurado'}
                </p>
                {logoImgError && profile.logoUrl && (
                  <p className="text-[10px] text-rose-400 mt-0.5">
                    No se pudo cargar la imagen desde la URL.
                  </p>
                )}
              </div>
            </div>

            {/* Previsualizador de Archivo Seleccionado (si existe) o Indicador */}
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${
                selectedLogoFile && previewLogoUrl
                  ? 'bg-indigo-950/20 border-indigo-500/50'
                  : 'bg-slate-950/40 border-dashed border-slate-800'
              }`}
            >
              {selectedLogoFile && previewLogoUrl ? (
                <>
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border-2 border-indigo-500/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      id="img-logo-preview"
                      src={previewLogoUrl}
                      alt="Previsualización del logo seleccionado"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-indigo-300 truncate">
                        Previsualización
                      </span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium">
                        Pendiente
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate font-mono">
                      {selectedLogoFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(selectedLogoFile.size / 1024).toFixed(1)} KB • Listo para subir
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-slate-400 w-full py-1">
                  <div className="w-16 h-16 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center flex-shrink-0">
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-medium text-slate-400 block">
                      Nuevo Logo
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Selecciona un archivo para ver la previsualización antes de subir.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Opciones de Carga: 1. Subir archivo (Recomendado) y 2. URL Manual */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            {/* Opción 1: Selector de Archivo Local */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Opción A: Subir imagen desde tu dispositivo</span>
                </span>
                <span className="text-[10px] text-indigo-400/90 font-medium">
                  Recomendado para máxima resolución y PWA
                </span>
              </div>

              {/* Input file nativo oculto */}
              <input
                type="file"
                id="input-logo-file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                disabled={isUploadingLogo || isSaving}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-seleccionar-logo"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo || isSaving}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {selectedLogoFile ? 'Cambiar archivo seleccionado' : 'Seleccionar logo desde dispositivo'}
                  </span>
                </button>

                {selectedLogoFile && (
                  <>
                    <button
                      type="button"
                      id="btn-subir-guardar-logo"
                      onClick={handleUploadAndSaveLogo}
                      disabled={isUploadingLogo || isSaving}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-xs font-semibold shadow transition cursor-pointer"
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Subiendo a Storage...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Subir y Guardar como Logo Vigente</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      id="btn-descartar-logo"
                      onClick={handleCancelSelectedLogo}
                      disabled={isUploadingLogo || isSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs transition cursor-pointer"
                      title="Cancelar selección de archivo"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Descartar</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Opción 2: URL Manual de Imagen (Preservando funcionalidad existente) */}
            <div className="pt-2">
              <label
                htmlFor="input-url-logo"
                className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Opción B: URL del Logo (Enlace HTTPS manual)</span>
              </label>
              <input
                type="url"
                id="input-url-logo"
                value={profile.logoUrl}
                onChange={(e) => {
                  setProfile({ ...profile, logoUrl: e.target.value });
                  setLogoImgError(false);
                }}
                disabled={isUploadingLogo || isSaving}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition disabled:opacity-60"
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Puedes pegar directamente un enlace HTTPS externo si tu imagen ya está alojada en otro servidor.
              </p>
            </div>
          </div>
        </div>

        {/* Descripción Comercial */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Descripción Comercial del Negocio
          </label>
          <textarea
            rows={3}
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition resize-none"
            placeholder="Describe tu propuesta de valor, productos estelares o historia..."
          />
        </div>
      </div>

      {/* Ubicación y Canales de Contacto Directo */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          2. Ubicación y Contacto Oficial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Dirección Física / Sucursal</span>
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="Ej. Av. Ballivián #1234, Calacoto, La Paz - Bolivia"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Teléfono Fijo / Móvil</span>
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="+591 2 2789012"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp de Atención Oficial (Prioritario)</span>
            </label>
            <input
              type="text"
              value={profile.whatsapp}
              onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="+591 71023456"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email de Contacto</span>
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="contacto@mitienda.bo"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Información Breve de Atención</span>
            </label>
            <input
              type="text"
              value={profile.attentionInfo}
              onChange={(e) => setProfile({ ...profile, attentionInfo: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="Lunes a Sábado de 08:30 a 20:30"
            />
          </div>
        </div>
      </div>

      {/* Redes Sociales (Priorizando Instagram, Facebook, TikTok, además YouTube y WhatsApp) */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            3. Redes Sociales (Prioridad Oficial)
          </h3>
          <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Instagram • Facebook • TikTok
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instagram */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>Instagram (Prioritario)</span>
            </label>
            <input
              type="text"
              value={profile.socials.instagram || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...profile.socials, instagram: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="@mitienda_bo"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Facebook className="w-3.5 h-3.5 text-blue-400" />
              <span>Facebook (Prioritario)</span>
            </label>
            <input
              type="text"
              value={profile.socials.facebook || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...profile.socials, facebook: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="MiTiendaBolivia"
            />
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>TikTok (Prioritario)</span>
            </label>
            <input
              type="text"
              value={profile.socials.tiktok || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...profile.socials, tiktok: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="@mitienda.bolivia"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-rose-500" />
              <span>YouTube (Opcional)</span>
            </label>
            <input
              type="text"
              value={profile.socials.youtube || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...profile.socials, youtube: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="https://youtube.com/@mitiendabo"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
