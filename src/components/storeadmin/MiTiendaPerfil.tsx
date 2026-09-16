import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Store, StoreProfileSettings } from '../../types';
import {
  getStoreProfile,
  fetchStoreProfile,
  saveStoreProfile,
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

  // Cargar datos reales desde Supabase garantizando persistencia centralizada
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetchStoreProfile(store.id)
      .then((remoteProfile) => {
        if (mounted) {
          setProfile(remoteProfile);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    try {
      const result = await saveStoreProfile(store.id, profile);
      if (result.success) {
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
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          {isSaving ? (
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
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          1. Identidad Principal
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>URL del Logo</span>
            </label>
            <input
              type="url"
              value={profile.logoUrl}
              onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

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
