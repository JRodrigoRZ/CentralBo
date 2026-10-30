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
  Compass,
  ExternalLink,
  Edit2,
  Trash2,
  Navigation,
} from 'lucide-react';
import { Store, StoreProfileSettings, StoreLocationSettings } from '../../types';
import {
  getStoreProfile,
  fetchStoreProfile,
  saveStoreProfile,
  uploadStoreLogo,
  buildGoogleMapsLocation,
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

  // Estados dedicados para Módulo 5: Ubicación de mi comercio (Google Maps)
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [locationQueryInput, setLocationQueryInput] = useState<string>('');
  const [locationNotesInput, setLocationNotesInput] = useState<string>('');
  const [locationPreview, setLocationPreview] = useState<StoreLocationSettings | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState<string | null>(null);

  const handleStartAddOrEditLocation = () => {
    setIsEditingLocation(true);
    const existing = profile.location;
    setLocationQueryInput(existing?.query || profile.address || '');
    setLocationNotesInput(existing?.referenceNotes || '');
    setLocationPreview(existing || null);
    setLocationError(null);
    setLocationSuccess(null);
  };

  const handlePreviewLocation = () => {
    setLocationError(null);
    if (!locationQueryInput || !locationQueryInput.trim()) {
      setLocationError('Por favor ingresa una referencia válida: coordenadas (ej. -16.5321, -68.0865), dirección o enlace de Google Maps.');
      return;
    }
    const built = buildGoogleMapsLocation(locationQueryInput, locationNotesInput);
    if (!built) {
      setLocationError('No se pudo interpretar la ubicación. Asegúrate de ingresar coordenadas, enlace o dirección válida.');
      return;
    }
    setLocationPreview(built);
  };

  const handleConfirmLocation = async () => {
    if (!locationPreview) {
      handlePreviewLocation();
      return;
    }

    const updatedProfile: StoreProfileSettings = {
      ...profile,
      location: locationPreview,
    };

    setProfile(updatedProfile);
    setIsEditingLocation(false);
    setLocationSuccess('Ubicación de Google Maps confirmada.');
    setTimeout(() => setLocationSuccess(null), 4000);

    // Guardar inmediatamente en Supabase
    saveStoreProfile(store.id, updatedProfile).catch((err) => {
      console.warn('[MiTiendaPerfil] Error guardando ubicación de mapa:', err);
    });
  };

  const handleRemoveLocation = async () => {
    const updatedProfile: StoreProfileSettings = {
      ...profile,
      location: undefined,
    };

    setProfile(updatedProfile);
    setIsEditingLocation(false);
    setLocationPreview(null);
    setLocationSuccess('Ubicación de Google Maps retirada. Tu dirección escrita se conserva intacta.');
    setTimeout(() => setLocationSuccess(null), 4000);

    // Guardar inmediatamente en Supabase
    saveStoreProfile(store.id, updatedProfile).catch((err) => {
      console.warn('[MiTiendaPerfil] Error retirando ubicación de mapa:', err);
    });
  };

  const handleCopyFromTextAddress = () => {
    if (profile.address && profile.address.trim()) {
      setLocationQueryInput(profile.address.trim());
      setLocationError(null);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DEE7F2] dark:border-[#263653]">
        <div>
          <h2 className="text-lg font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-[#1769FF] dark:text-[#3B82F6]" />
            <span>Perfil del Comercio</span>
            {isLoading && (
              <Loader2 className="w-4 h-4 text-[#1769FF] dark:text-[#3B82F6] animate-spin ml-2" title="Sincronizando con Supabase..." />
            )}
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#B8C6DA] mt-0.5">
            Información de identidad pública, ubicación y canales de contacto directo
          </p>
        </div>

        <button
          type="submit"
          id="btn-guardar-perfil-comercio"
          disabled={isSaving || isUploadingLogo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
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
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-[#102A24] dark:border-[#34D399]/40 dark:text-[#34D399] text-xs flex items-center gap-2 animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-[#34D399]" />
          <span>Información de perfil actualizada exitosamente en Supabase para {profile.name}.</span>
        </div>
      )}

      {errorMessage && (
        <div
          id="alerta-perfil-error-guardado"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-[#2E141E] dark:border-[#F87171]/40 dark:text-[#F87171] text-xs flex items-start gap-2 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-[#F87171] mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">No se pudo guardar el perfil en Supabase</span>
            <span className="text-[11px] text-rose-700/90 dark:text-[#F87171]/90">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Identidad del Comercio (Logo, Nombre, Descripción) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] uppercase tracking-wider">
            1. Identidad Principal
          </h3>
          <span className="text-[11px] text-[#475569] dark:text-[#B8C6DA] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1769FF] dark:text-[#3B82F6]" />
            <span>Un único logo vigente por comercio</span>
          </span>
        </div>

        {/* Nombre de la Tienda */}
        <div>
          <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5">
            Nombre de la Tienda / Negocio
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
            placeholder="Ej. Restaurante Gourmet Roma"
            required
          />
        </div>

        {/* Sección Especializada: Logo del Comercio */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#1769FF] dark:text-[#3B82F6]" />
              <span className="text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC]">Logo del Comercio</span>
            </div>
            <span className="text-[11px] text-[#475569] dark:text-[#B8C6DA]">
              Formatos: PNG, JPG, WEBP, SVG • Máx. 2 MB
            </span>
          </div>

          {/* Feedback específico para acciones del logo */}
          {logoActionSuccess && (
            <div
              id="alerta-logo-exito"
              className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-[#102A24] dark:border-[#34D399]/40 dark:text-[#34D399] text-xs flex items-center gap-2 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-[#34D399]" />
              <span>{logoActionSuccess}</span>
            </div>
          )}

          {logoActionError && (
            <div
              id="alerta-logo-error"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-[#2E141E] dark:border-[#F87171]/40 dark:text-[#F87171] text-xs flex items-start gap-2 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-[#F87171] mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Error en el logo</span>
                <span className="text-[11px] text-rose-700/90 dark:text-[#F87171]/90">{logoActionError}</span>
              </div>
            </div>
          )}

          {/* Comparador Visual: Logo Actual vs Previsualización */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Visualizador del Logo Oficial Vigente */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile.logoUrl && !logoImgError ? (
                  <img
                    id="img-logo-oficial"
                    src={profile.logoUrl}
                    alt={`Logo de ${profile.name}`}
                    onError={() => setLogoImgError(true)}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#94A3B8] dark:text-[#7E90B0]">
                    <StoreIcon className="w-7 h-7" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC]">Logo Actual</span>
                  {profile.logoUrl && !logoImgError && (
                    <span className="text-[10px] text-emerald-700 dark:text-[#34D399] bg-emerald-50 dark:bg-[#102A24] px-1.5 py-0.2 rounded border border-emerald-200 dark:border-[#34D399]/30 font-medium">
                      Vigente
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#475569] dark:text-[#B8C6DA] truncate">
                  {profile.logoUrl && !logoImgError
                    ? profile.logoUrl.includes('supabase.co/storage')
                      ? 'Alojado en Supabase Storage'
                      : 'URL Externa configurada'
                    : 'Sin logo oficial configurado'}
                </p>
                {logoImgError && profile.logoUrl && (
                  <p className="text-[10px] text-rose-600 dark:text-[#F87171] mt-0.5">
                    No se pudo cargar la imagen desde la URL.
                  </p>
                )}
              </div>
            </div>

            {/* Previsualizador de Archivo Seleccionado (si existe) o Indicador */}
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${
                selectedLogoFile && previewLogoUrl
                  ? 'bg-blue-50/50 dark:bg-[#17243D] border-[#1769FF]/50 dark:border-[#3B82F6]/60'
                  : 'bg-white/60 dark:bg-[#101B32]/60 border-dashed border-[#DEE7F2] dark:border-[#263653]'
              }`}
            >
              {selectedLogoFile && previewLogoUrl ? (
                <>
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-[#17243D] border-2 border-[#1769FF] dark:border-[#3B82F6] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      id="img-logo-preview"
                      src={previewLogoUrl}
                      alt="Previsualización del logo seleccionado"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-[#1769FF] dark:text-[#3B82F6] truncate">
                        Previsualización
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-[#FBBF24] bg-amber-50 dark:bg-[#241C12] px-1.5 py-0.2 rounded border border-amber-200 dark:border-[#FBBF24]/30 font-medium">
                        Pendiente
                      </span>
                    </div>
                    <p className="text-[11px] text-[#14213D] dark:text-[#F8FAFC] truncate font-mono">
                      {selectedLogoFile.name}
                    </p>
                    <p className="text-[10px] text-[#475569] dark:text-[#B8C6DA]">
                      {(selectedLogoFile.size / 1024).toFixed(1)} KB • Listo para subir
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-[#475569] dark:text-[#B8C6DA] w-full py-1">
                  <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] flex items-center justify-center flex-shrink-0">
                    <UploadCloud className="w-6 h-6 text-[#94A3B8] dark:text-[#7E90B0]" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-medium text-[#14213D] dark:text-[#F8FAFC] block">
                      Nuevo Logo
                    </span>
                    <span className="text-[11px] text-[#475569] dark:text-[#B8C6DA]">
                      Selecciona un archivo para previsualizar antes de subir.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Opciones de Carga: 1. Subir archivo y 2. URL Manual */}
          <div className="space-y-3 pt-2 border-t border-[#DEE7F2] dark:border-[#263653]">
            {/* Opción 1: Selector de Archivo Local */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-[#1769FF] dark:text-[#3B82F6]" />
                  <span>Opción A: Subir imagen desde tu dispositivo</span>
                </span>
                <span className="text-[10px] text-[#1769FF] dark:text-[#3B82F6] font-medium">
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EEF4FF] dark:bg-[#101B32] dark:hover:bg-[#1E2D4A] disabled:opacity-50 disabled:cursor-not-allowed text-[#14213D] dark:text-[#F8FAFC] text-xs font-medium border border-[#DEE7F2] dark:border-[#263653] transition cursor-pointer shadow-2xs"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#1769FF] dark:text-[#3B82F6]" />
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
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
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
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EEF4FF] dark:bg-[#101B32] dark:hover:bg-[#1E2D4A] text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC] border border-[#DEE7F2] dark:border-[#263653] text-xs transition cursor-pointer"
                      title="Cancelar selección de archivo"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Descartar</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Opción 2: URL Manual de Imagen */}
            <div className="pt-2">
              <label
                htmlFor="input-url-logo"
                className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5 text-[#94A3B8] dark:text-[#7E90B0]" />
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
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition disabled:opacity-60"
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-[10px] text-[#52627A] dark:text-[#B8C6DA] mt-1">
                Puedes pegar directamente un enlace HTTPS externo si tu imagen ya está alojada en otro servidor.
              </p>
            </div>
          </div>
        </div>

        {/* Descripción Comercial */}
        <div>
          <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5">
            Descripción Comercial del Negocio
          </label>
          <textarea
            rows={3}
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition resize-none"
            placeholder="Describe tu propuesta de valor, productos estelares o historia..."
          />
        </div>
      </div>

      {/* 2. Ubicación y Canales de Contacto Directo */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] uppercase tracking-wider">
          2. Ubicación y Contacto Oficial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Dirección Física / Sucursal</span>
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="Ej. Av. Ballivián #1234, Calacoto, La Paz - Bolivia"
            />
          </div>

          {/* Ubicación de mi comercio (Google Maps - Módulo 5) */}
          <div className="sm:col-span-2 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#17243D]/60 border border-[#DEE7F2] dark:border-[#263653] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#1769FF] dark:text-[#3B82F6]" />
                  <span>Ubicación de mi comercio</span>
                  {profile.location?.isConfigured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                      Ubicación confirmada
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-[#52627A] dark:text-[#B8C6DA] mt-0.5">
                  Indica dónde se encuentra tu negocio para que tus clientes puedan verlo en Google Maps.
                </p>
              </div>

              {!isEditingLocation && (
                <div className="flex items-center gap-2">
                  {profile.location?.isConfigured ? (
                    <>
                      <a
                        href={profile.location.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EEF4FF] dark:bg-[#101B32] dark:hover:bg-[#1E2D4A] text-[#1769FF] dark:text-[#3B82F6] text-xs font-semibold border border-[#DEE7F2] dark:border-[#263653] shadow-2xs transition"
                        title="Abrir en Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver en Maps</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleStartAddOrEditLocation}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Actualizar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLocation}
                        className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Retirar ubicación del mapa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartAddOrEditLocation}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer active:scale-95"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Agregar ubicación</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mensajes de retroalimentación */}
            {locationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{locationSuccess}</span>
              </div>
            )}
            {locationError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Caso 1: Ubicación confirmada y NO en modo edición */}
            {!isEditingLocation && profile.location?.isConfigured && (
              <div className="space-y-3">
                <div className="text-xs text-[#52627A] dark:text-[#B8C6DA] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>Punto confirmado: <strong>{profile.location.query}</strong></span>
                  {profile.location.referenceNotes && (
                    <span className="italic text-[11px]">«{profile.location.referenceNotes}»</span>
                  )}
                </div>
                <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-[#DEE7F2] dark:border-[#263653] bg-white dark:bg-[#101B32]">
                  <iframe
                    title="Vista previa del mapa del comercio"
                    src={profile.location.embedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Caso 2: Sin ubicación registrada y NO en modo edición */}
            {!isEditingLocation && !profile.location?.isConfigured && (
              <div className="p-6 rounded-xl border border-dashed border-[#DEE7F2] dark:border-[#263653] text-center flex flex-col items-center justify-center space-y-2 bg-white/60 dark:bg-[#101B32]/40">
                <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  Todavía no se ha definido una ubicación en el mapa
                </p>
                <p className="text-[11px] text-[#52627A] dark:text-[#B8C6DA] max-w-sm">
                  Indica las coordenadas o dirección de tu establecimiento para que tus clientes puedan verlo en Google Maps.
                </p>
                <button
                  type="button"
                  onClick={handleStartAddOrEditLocation}
                  className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Agregar ubicación</span>
                </button>
              </div>
            )}

            {/* Caso 3: Modo edición / configuración activa */}
            {isEditingLocation && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                      Referencia o coordenadas para Google Maps
                    </label>
                    {profile.address && profile.address.trim() && (
                      <button
                        type="button"
                        onClick={handleCopyFromTextAddress}
                        className="text-[11px] text-[#1769FF] dark:text-[#3B82F6] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Copiar mi dirección escrita</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={locationQueryInput}
                    onChange={(e) => setLocationQueryInput(e.target.value)}
                    placeholder="Ej. -16.5321, -68.0865 ó Av. Ballivián #1234, Calacoto, La Paz"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#1769FF] shadow-2xs"
                  />
                  <p className="text-[10px] text-[#52627A] dark:text-[#B8C6DA]">
                    Puedes ingresar coordenadas numéricas (latitud, longitud), un enlace copiado de Google Maps o la dirección exacta.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                    Referencia visual complementaria (opcional)
                  </label>
                  <input
                    type="text"
                    value={locationNotesInput}
                    onChange={(e) => setLocationNotesInput(e.target.value)}
                    placeholder="Ej. Frente a la plaza principal, planta baja, puerta azul"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#1769FF] shadow-2xs"
                  />
                </div>

                {/* Acciones de Previsualización */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePreviewLocation}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Previsualizar en el mapa</span>
                  </button>

                  {locationPreview && (
                    <button
                      type="button"
                      onClick={handleConfirmLocation}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmar ubicación</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingLocation(false);
                      setLocationPreview(profile.location || null);
                      setLocationError(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EEF4FF] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] text-[#52627A] dark:text-[#B8C6DA] border border-[#DEE7F2] dark:border-[#263653] text-xs font-medium transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Vista previa en vivo del mapa mientras edita */}
                {locationPreview && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                      <span>Vista previa de Google Maps:</span>
                      <a
                        href={locationPreview.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#1769FF] dark:text-[#3B82F6] hover:underline flex items-center gap-1"
                      >
                        <span>Abrir en nueva pestaña</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-[#DEE7F2] dark:border-[#263653] bg-white dark:bg-[#101B32]">
                      <iframe
                        title="Previsualización de Google Maps"
                        src={locationPreview.embedUrl}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#1769FF] dark:text-[#3B82F6]" />
              <span>Teléfono Fijo / Móvil</span>
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="+591 2 2789012"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp de Atención Oficial (Prioritario)</span>
            </label>
            <input
              type="text"
              value={profile.whatsapp}
              onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="+591 71023456"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-500" />
              <span>Email de Contacto</span>
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="contacto@mitienda.bo"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Información Breve de Atención</span>
            </label>
            <input
              type="text"
              value={profile.attentionInfo}
              onChange={(e) => setProfile({ ...profile, attentionInfo: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="Lunes a Sábado de 08:30 a 20:30"
            />
          </div>
        </div>
      </div>

      {/* 3. Redes Sociales */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] uppercase tracking-wider">
            3. Redes Sociales (Prioridad Oficial)
          </h3>
          <span className="text-[10px] text-[#1769FF] dark:text-[#3B82F6] font-semibold bg-[#EEF4FF] dark:bg-[#17243D] px-2 py-0.5 rounded border border-[#DEE7F2] dark:border-[#263653]">
            Instagram • Facebook • TikTok
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instagram */}
          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="@mitienda_bo"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <Facebook className="w-3.5 h-3.5 text-blue-500" />
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="MiTiendaBolivia"
            />
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-cyan-500" />
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="@mitienda.bolivia"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#7E90B0] text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#1769FF]/20 shadow-2xs transition"
              placeholder="https://youtube.com/@mitiendabo"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
