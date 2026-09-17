import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  MessageCircle,
  Instagram,
  Facebook,
  Video,
  Youtube,
  ExternalLink,
  CheckCircle2,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Store, StoreProfileSettings } from '../../types';
import {
  getStoreProfile,
  fetchStoreProfile,
  saveStoreProfile,
} from '../../lib/storeAdminService';

interface MiTiendaContactoProps {
  store: Store;
}

export const MiTiendaContacto: React.FC<MiTiendaContactoProps> = ({ store }) => {
  // 1. Carga inicial rápida desde caché local existente
  const [profile, setProfile] = useState<StoreProfileSettings>(() =>
    getStoreProfile(store.id)
  );

  // Referencia para resguardar la base canónica completa de Supabase
  const remoteProfileRef = useRef<StoreProfileSettings | null>(null);

  // Estados de interfaz
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // 2. Consulta asíncrona a Supabase para sincronizar con la fuente canónica
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setLoadingError(null);

    fetchStoreProfile(store.id)
      .then((remoteProfile) => {
        if (mounted && remoteProfile) {
          remoteProfileRef.current = remoteProfile;
          setProfile(remoteProfile);
        }
      })
      .catch((err) => {
        console.warn('[MiTiendaContacto] Error al sincronizar con Supabase:', err);
        if (mounted) {
          setLoadingError('No se pudo sincronizar con Supabase. Se muestra la configuración local.');
        }
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

  // 3. Guardado seguro asíncrono con protección contra sobrescritura
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSavedSuccess(false);
    setSaveError(null);

    try {
      // Obtener la base canónica más reciente para proteger name, logoUrl, description, address, etc.
      let baseProfile: StoreProfileSettings = remoteProfileRef.current || profile;
      try {
        const freshProfile = await fetchStoreProfile(store.id);
        if (freshProfile) {
          baseProfile = freshProfile;
          remoteProfileRef.current = freshProfile;
        }
      } catch (err) {
        // Continuar con la última base remota conocida en memoria si hay problema transitorio de red
      }

      // Preservar estrictamente los campos que Contacto y Redes no administra
      const updatedProfile: StoreProfileSettings = {
        ...baseProfile,
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        socials: {
          ...(baseProfile.socials || {}),
          instagram: profile.socials?.instagram || '',
          facebook: profile.socials?.facebook || '',
          tiktok: profile.socials?.tiktok || '',
          youtube: profile.socials?.youtube || '',
        },
      };

      // Guardar en Supabase y esperar confirmación real
      const result = await saveStoreProfile(store.id, updatedProfile);

      if (result.success) {
        setProfile(updatedProfile);
        remoteProfileRef.current = updatedProfile;
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setSaveError(result.error || 'No se pudieron guardar los canales de contacto en Supabase.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Error inesperado al guardar canales de contacto.');
    } finally {
      setIsSaving(false);
    }
  };

  const openTestLink = (url: string | undefined, type: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'youtube') => {
    if (!url) return;
    let finalUrl = url;
    if (type === 'whatsapp') {
      const cleanNumber = url.replace(/[^0-9]/g, '');
      finalUrl = `https://wa.me/${cleanNumber}`;
    } else if (type === 'instagram') {
      const handle = url.replace('@', '').trim();
      finalUrl = url.startsWith('http') ? url : `https://instagram.com/${handle}`;
    } else if (type === 'tiktok') {
      const handle = url.replace('@', '').trim();
      finalUrl = url.startsWith('http') ? url : `https://tiktok.com/@${handle}`;
    } else if (!url.startsWith('http')) {
      finalUrl = `https://${url}`;
    }
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <span>Canales de Contacto y Redes Sociales</span>
            {isLoading && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-normal">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span>Sincronizando...</span>
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra y prueba los botones directos que verán los clientes en tu tienda
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Guardando...' : 'Guardar Canales'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Canales de contacto actualizados correctamente en Supabase.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{saveError}</span>
        </div>
      )}

      {loadingError && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>{loadingError}</span>
        </div>
      )}

      {/* WhatsApp (Canal Crítico de Ventas en Bolivia) */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">WhatsApp de Pedidos y Atención</h3>
              <p className="text-[11px] text-slate-400">Canal principal de confirmación y envíos en Bolivia</p>
            </div>
          </div>

          {profile.whatsapp && (
            <button
              type="button"
              onClick={() => openTestLink(profile.whatsapp, 'whatsapp')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 text-xs font-semibold transition cursor-pointer"
            >
              <span>Abrir WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Número con Código de País (+591)
            </label>
            <input
              type="text"
              value={profile.whatsapp || ''}
              onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
              placeholder="+591 71023456"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Teléfono Fijo / Centralita
            </label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
              placeholder="+591 2 2789012"
            />
          </div>
        </div>
      </div>

      {/* Redes Sociales Principales */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Redes Sociales Oficiales
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instagram */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold text-white">Instagram</span>
              </div>
              {profile.socials?.instagram && (
                <button
                  type="button"
                  onClick={() => openTestLink(profile.socials.instagram, 'instagram')}
                  className="text-pink-400 hover:text-pink-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={profile.socials?.instagram || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...(profile.socials || {}), instagram: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
              placeholder="@usuario_instagram"
            />
          </div>

          {/* Facebook */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Facebook</span>
              </div>
              {profile.socials?.facebook && (
                <button
                  type="button"
                  onClick={() => openTestLink(profile.socials.facebook, 'facebook')}
                  className="text-blue-400 hover:text-blue-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={profile.socials?.facebook || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...(profile.socials || {}), facebook: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              placeholder="NombrePaginaFacebook"
            />
          </div>

          {/* TikTok */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">TikTok</span>
              </div>
              {profile.socials?.tiktok && (
                <button
                  type="button"
                  onClick={() => openTestLink(profile.socials.tiktok, 'tiktok')}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={profile.socials?.tiktok || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...(profile.socials || {}), tiktok: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              placeholder="@usuario_tiktok"
            />
          </div>

          {/* YouTube */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-white">Canal de YouTube</span>
              </div>
              {profile.socials?.youtube && (
                <button
                  type="button"
                  onClick={() => openTestLink(profile.socials.youtube, 'youtube')}
                  className="text-rose-400 hover:text-rose-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={profile.socials?.youtube || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: { ...(profile.socials || {}), youtube: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              placeholder="https://youtube.com/@micanal"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
