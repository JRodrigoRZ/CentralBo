import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Lock,
  Globe,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Save,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  Video as VideoIcon,
  Film,
  Play,
  Eye,
  Upload,
  ArrowUp,
  ArrowDown,
  Loader2,
  X,
} from 'lucide-react';
import {
  Store,
  StoreAppearanceSettings,
  StoreHighlightItem,
  StoreHighlightsLayout,
  StoreBannerItem,
  StoreStoryItem,
} from '../../types';
import {
  getStoreAppearance,
  getCachedStoreAppearance,
  saveStoreAppearance,
  getStorePlan,
  getDefaultStoreHighlights,
  uploadStoreBanner,
  uploadStoreStoryMedia,
} from '../../lib/storeAdminService';
import { useTheme } from '../../context/ThemeContext';

import { StoreTemplateGallery } from './StoreTemplateGallery';

interface MiTiendaAparienciaProps {
  store: Store;
}

export const MiTiendaApariencia: React.FC<MiTiendaAparienciaProps> = ({ store }) => {
  const plan = getStorePlan(store.id);
  const isPro = plan === 'pro';
  const canUseBanners = plan === 'basic' || plan === 'pro';
  const { setTheme: setAppTheme } = useTheme();

  const [appearance, setAppearance] = useState<StoreAppearanceSettings>(() =>
    getCachedStoreAppearance(store.id)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);

  // Estados del Módulo 2: Banners de mi tienda
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!canUseBanners) {
      setBlockedAlert(
        'La función "Banners de mi tienda" es exclusiva de los planes BASIC y PRO.'
      );
      setTimeout(() => setBlockedAlert(null), 6000);
      return;
    }

    setBannerError(null);
    setBannerSuccess(null);
    setIsUploadingBanner(true);

    try {
      const res = await uploadStoreBanner(store.id, file);
      if (res.success && res.publicUrl) {
        const currentBanners = appearance.banners || [];
        const newBanner: StoreBannerItem = {
          id: `banner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          imageUrl: res.publicUrl,
          title: '',
          order: currentBanners.length,
          createdAt: new Date().toISOString(),
        };
        const updated = {
          ...appearance,
          banners: [...currentBanners, newBanner],
        };
        setAppearance(updated);
        // Persistir inmediatamente para que no se pierda al recargar
        saveStoreAppearance(store.id, updated).catch((err) => {
          console.warn('[MiTiendaApariencia] Error al guardar banner en segundo plano:', err);
        });
        setBannerSuccess('Banner agregado correctamente. Recuerda guardar ajustes para confirmar cambios.');
        setTimeout(() => setBannerSuccess(null), 4000);
      } else {
        setBannerError(res.error || 'No se pudo subir la imagen del banner.');
      }
    } catch (err: any) {
      setBannerError(err?.message || 'Error inesperado al subir el banner.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBanner = (bannerId: string) => {
    const current = appearance.banners || [];
    const updatedBanners = current.filter((b) => b.id !== bannerId);
    const updated = { ...appearance, banners: updatedBanners };
    setAppearance(updated);
    saveStoreAppearance(store.id, updated).catch((err) => {
      console.warn('[MiTiendaApariencia] Error al eliminar banner:', err);
    });
    setBannerSuccess('Banner eliminado.');
    setTimeout(() => setBannerSuccess(null), 3000);
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const current = [...(appearance.banners || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;

    // Actualizar orden numérico
    const reordered = current.map((item, idx) => ({ ...item, order: idx }));
    const updated = { ...appearance, banners: reordered };
    setAppearance(updated);
    saveStoreAppearance(store.id, updated).catch((err) => {
      console.warn('[MiTiendaApariencia] Error al reordenar banners:', err);
    });
  };

  const handleUpdateBannerTitle = (bannerId: string, title: string) => {
    const current = (appearance.banners || []).map((b) =>
      b.id === bannerId ? { ...b, title } : b
    );
    setAppearance({ ...appearance, banners: current });
  };

  // Estados del Módulo 4: Estados multimedia de mi tienda (Exclusivo Plan PRO)
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storySuccess, setStorySuccess] = useState<string | null>(null);
  const [previewStory, setPreviewStory] = useState<StoreStoryItem | null>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const handleStoryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!isPro) {
      setBlockedAlert(
        'La función "Estados de mi tienda" es exclusiva del Plan PRO. Actualiza a PRO para publicar fotos y videos cortos.'
      );
      setTimeout(() => setBlockedAlert(null), 6000);
      return;
    }

    setStoryError(null);
    setStorySuccess(null);
    setIsUploadingStory(true);

    try {
      const res = await uploadStoreStoryMedia(store.id, file);
      if (res.success && res.publicUrl) {
        const currentStories = appearance.stories || [];
        const newStory: StoreStoryItem = {
          id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          mediaType: res.mediaType || (file.type.startsWith('video/') ? 'video' : 'image'),
          mediaUrl: res.publicUrl,
          title: '',
          createdAt: new Date().toISOString(),
        };
        const updated = {
          ...appearance,
          stories: [...currentStories, newStory],
        };
        setAppearance(updated);
        // Persistir inmediatamente para que no se pierda al recargar
        saveStoreAppearance(store.id, updated).catch((err) => {
          console.warn('[MiTiendaApariencia] Error al guardar estado en segundo plano:', err);
        });
        setStorySuccess(
          `Estado (${newStory.mediaType === 'video' ? 'video corto' : 'fotografía'}) publicado correctamente.`
        );
        setTimeout(() => setStorySuccess(null), 4000);
      } else {
        setStoryError(res.error || 'No se pudo subir el archivo multimedia del estado.');
      }
    } catch (err: any) {
      setStoryError(err?.message || 'Error inesperado al subir el estado multimedia.');
    } finally {
      setIsUploadingStory(false);
    }
  };

  const handleRemoveStory = (storyId: string) => {
    const current = appearance.stories || [];
    const updatedStories = current.filter((s) => s.id !== storyId);
    const updated = { ...appearance, stories: updatedStories };
    setAppearance(updated);
    saveStoreAppearance(store.id, updated).catch((err) => {
      console.warn('[MiTiendaApariencia] Error al retirar estado:', err);
    });
    setStorySuccess('Estado retirado correctamente.');
    setTimeout(() => setStorySuccess(null), 3000);
  };

  const handleUpdateStoryTitle = (storyId: string, title: string) => {
    const current = (appearance.stories || []).map((s) =>
      s.id === storyId ? { ...s, title } : s
    );
    setAppearance({ ...appearance, stories: current });
  };

  const handleMoveStory = (index: number, direction: 'up' | 'down') => {
    const current = [...(appearance.stories || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;

    const updated = { ...appearance, stories: current };
    setAppearance(updated);
    saveStoreAppearance(store.id, updated).catch((err) => {
      console.warn('[MiTiendaApariencia] Error al reordenar estados:', err);
    });
  };

  // Sincronizar con la fuente de verdad central en Supabase
  useEffect(() => {
    let mounted = true;
    getStoreAppearance(store.id)
      .then((remote) => {
        if (mounted && remote) {
          setAppearance(remote);
        }
      })
      .catch((err) => {
        console.warn('[CentralBo] Error al sincronizar apariencia desde Supabase:', err);
      });

    return () => {
      mounted = false;
    };
  }, [store.id]);

  const handleSelectTheme = (thm: 'light' | 'dark') => {
    setAppearance({ ...appearance, theme: thm });
    setAppTheme(thm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    try {
      const result = await saveStoreAppearance(store.id, appearance);
      if (result.success) {
        setSavedSuccess(true);
        setAppTheme(appearance.theme);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'No se pudo guardar la configuración en el servidor.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Error inesperado al guardar en Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProFeatureAttempt = (featureName: string) => {
    if (!isPro) {
      setBlockedAlert(
        `La función "${featureName}" está restringida en el Plan Basic (Bs 49/mes). Requiere actualizar al Plan Pro (Bs 99/mes) para personalizar colores de marca y conectar dominio propio.`
      );
      setTimeout(() => setBlockedAlert(null), 6000);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const updated = { ...appearance, templateId };
    setAppearance(updated);
    saveStoreAppearance(store.id, updated).catch((err) => {
      console.warn('[MiTiendaApariencia] Error al persistir modelo de tienda:', err);
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DEE7F2] dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#14213D] dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#1769FF] dark:text-indigo-400" />
            <span>Apariencia y Estilo Visual</span>
          </h2>
          <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
            Personaliza el tema, la paleta cromática y la experiencia de instalación de tu tienda
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              isPro
                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                : 'bg-[#EEF4FF] text-[#1769FF] border border-[#DEE7F2] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            Plan: {plan.toUpperCase()}
          </span>

          <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition cursor-pointer ${
              isSaving
                ? 'bg-blue-400 opacity-60 cursor-not-allowed'
                : 'bg-[#1769FF] hover:bg-blue-700 active:scale-[0.98]'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando...' : 'Guardar Ajustes'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de error de guardado */}
      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 text-xs flex items-center gap-2 animate-fadeIn shadow-2xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-red-400" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Alerta de bloqueo de plan */}
      {blockedAlert && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/70 dark:border-amber-500/40 dark:text-amber-200 text-xs flex items-start gap-3 animate-fadeIn shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-800 dark:text-amber-300">Función Exclusiva del Plan Pro</p>
            <p className="text-amber-900/90 dark:text-slate-300 leading-relaxed">{blockedAlert}</p>
          </div>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Configuración visual guardada correctamente en Supabase.</span>
        </div>
      )}

      {/* 1. Tema Claro / Oscuro (Disponible en ambos planes) */}
      <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider">
            1. Modo de Visualización (Disponible para todos los planes)
          </h3>
          <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
            Selecciona el fondo visual predeterminado para tus clientes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
              appearance.theme === 'dark'
                ? 'bg-[#EEF4FF] border-[#1769FF] text-[#14213D] shadow-2xs dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white'
                : 'bg-white border-[#DEE7F2] text-[#52627A] hover:text-[#14213D] hover:border-[#CBD5E1] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${appearance.theme === 'dark' ? 'bg-[#1769FF]/10 text-[#1769FF] dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-[#F1F5FB] text-[#64748B] dark:bg-slate-800 dark:text-slate-400'}`}>
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Modo Oscuro</p>
              <p className={`text-[10px] ${appearance.theme === 'dark' ? 'text-[#1769FF] dark:text-indigo-300' : 'text-[#64748B] dark:text-slate-400'}`}>
                Elegante y descansado
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
              appearance.theme === 'light'
                ? 'bg-[#EEF4FF] border-[#1769FF] text-[#14213D] shadow-2xs dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white'
                : 'bg-white border-[#DEE7F2] text-[#52627A] hover:text-[#14213D] hover:border-[#CBD5E1] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${appearance.theme === 'light' ? 'bg-[#1769FF]/10 text-amber-500 dark:bg-indigo-500/20 dark:text-amber-400' : 'bg-[#F1F5FB] text-[#64748B] dark:bg-slate-800 dark:text-slate-400'}`}>
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Modo Claro</p>
              <p className={`text-[10px] ${appearance.theme === 'light' ? 'text-[#1769FF] dark:text-indigo-300' : 'text-[#64748B] dark:text-slate-400'}`}>
                Luminoso y despejado
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* MÓDULO 6: MODELO DE MI TIENDA (SELECCIÓN DE MODELOS ESPECIALES DE TIENDA) */}
      <StoreTemplateGallery
        store={store}
        appearance={appearance}
        onSelectTemplate={handleSelectTemplate}
        onProAttempt={handleProFeatureAttempt}
        isSaving={isSaving}
      />

      {/* 2. Banners de mi tienda (Exclusivo Planes BASIC y PRO) */}
      <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#1769FF] dark:text-indigo-400" />
              <span>Banners de mi tienda</span>
              {canUseBanners ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                  Habilitado (Basic & Pro)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Exclusivo Basic & Pro</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
              Agrega imágenes para destacar visualmente tu negocio en tu tienda digital
            </p>
          </div>

          {canUseBanners && (
            <div className="flex items-center gap-2">
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleBannerFileSelect}
              />
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isUploadingBanner ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir banner</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mensajes de éxito / error de banner */}
        {bannerSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{bannerSuccess}</span>
          </div>
        )}
        {bannerError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-red-400" />
            <span>{bannerError}</span>
          </div>
        )}

        {/* Bloque de aviso para comercios con Plan FREE */}
        {!canUseBanners ? (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-500/30 dark:text-amber-300 text-xs flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold">Función Exclusiva de Planes BASIC y PRO</p>
              <p className="text-[11px] text-amber-900/90 dark:text-slate-300 leading-relaxed">
                El diseño actual de tu tienda corresponde a la versión <strong>FREE</strong> aprobada. Los banners comerciales están disponibles exclusivamente en los planes Basic (Bs 49/mes) y Pro (Bs 99/mes).
              </p>
            </div>
          </div>
        ) : (appearance.banners?.length || 0) === 0 ? (
          /* Estado vacío amigable cuando el comercio aún no tenga banners */
          <div className="p-8 rounded-2xl border-2 border-dashed border-[#DEE7F2] dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900/50">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] dark:bg-slate-800 border border-[#DEE7F2] dark:border-slate-700 flex items-center justify-center text-[#1769FF] dark:text-indigo-400 shadow-2xs">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <p className="text-xs font-bold text-[#14213D] dark:text-white">
                Todavía no tienes banners registrados
              </p>
              <p className="text-[11px] text-[#52627A] dark:text-slate-400 leading-relaxed">
                Sube imágenes para destacar promociones, productos estrella o novedades.
              </p>
            </div>
            <button
              type="button"
              onClick={() => bannerFileInputRef.current?.click()}
              disabled={isUploadingBanner}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-60"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingBanner ? 'Subiendo...' : 'Subir banner'}</span>
            </button>
          </div>
        ) : (
          /* Lista de banners registrados */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#52627A] dark:text-slate-400 font-medium">
              <span>Banners activos ({appearance.banners?.length || 0})</span>
              <span className="text-[11px]">Formatos recomendados: PNG, JPG, WEBP</span>
            </div>

            <div className="space-y-2.5">
              {(appearance.banners || []).map((banner, idx) => (
                <div
                  key={banner.id || idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-[#DEE7F2] dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition"
                >
                  {/* Vista previa miniatura */}
                  <div className="relative w-full sm:w-36 h-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shrink-0">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || `Banner ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white font-mono">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Campos de título / información */}
                  <div className="flex-1 w-full space-y-1">
                    <label className="block text-[10px] font-medium text-[#64748B] dark:text-slate-400">
                      Título o etiqueta destacada (opcional)
                    </label>
                    <input
                      type="text"
                      value={banner.title || ''}
                      onChange={(e) => handleUpdateBannerTitle(banner.id, e.target.value)}
                      placeholder="Ej. Especial de la semana, 2x1 en Rollos..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700 text-xs text-[#14213D] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#1769FF] shadow-2xs"
                    />
                  </div>

                  {/* Acciones de reordenar y eliminar */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveBanner(idx, 'up')}
                      title="Mover arriba"
                      className="p-1.5 rounded-lg border border-[#DEE7F2] dark:border-slate-700 text-[#52627A] hover:text-[#14213D] hover:bg-[#F1F5FB] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (appearance.banners?.length || 0) - 1}
                      onClick={() => handleMoveBanner(idx, 'down')}
                      title="Mover abajo"
                      className="p-1.5 rounded-lg border border-[#DEE7F2] dark:border-slate-700 text-[#52627A] hover:text-[#14213D] hover:bg-[#F1F5FB] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBanner(banner.id)}
                      title="Eliminar banner"
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estados de mi tienda (Exclusivo Plan PRO) */}
      <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Estados de mi tienda</span>
              {isPro ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                  Habilitado (Pro)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Exclusivo Plan Pro</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
              Comparte fotografías y videos cortos para mostrar visualmente tu negocio a tus clientes.
            </p>
          </div>

          {isPro && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={storyFileInputRef}
                onChange={handleStoryFileSelect}
                accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4,video/webm,video/quicktime"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => storyFileInputRef.current?.click()}
                disabled={isUploadingStory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-60"
              >
                {isUploadingStory ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Subiendo estado...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar estado</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mensajes de feedback */}
        {storyError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{storyError}</span>
          </div>
        )}

        {storySuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{storySuccess}</span>
          </div>
        )}

        {!isPro ? (
          /* Bloque informativo cuando el comercio está en Basic o Free */
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-500/20 flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <p className="font-semibold">Función exclusiva del Plan PRO</p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-400/90 leading-relaxed">
                La publicación y visualización de estados multimedia (fotografías y videos cortos) está reservada para comercios con suscripción PRO. Los planes Free y Basic conservan su diseño y funciones comerciales intactas.
              </p>
            </div>
          </div>
        ) : (appearance.stories?.length || 0) === 0 ? (
          /* Estado vacío amigable cuando el comercio PRO aún no tenga estados publicados */
          <div className="p-8 rounded-2xl border-2 border-dashed border-[#DEE7F2] dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900/50">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-2xs">
              <Film className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <p className="text-xs font-bold text-[#14213D] dark:text-white">
                Todavía no tienes estados publicados
              </p>
              <p className="text-[11px] text-[#52627A] dark:text-slate-400 leading-relaxed">
                Comparte fotografías y videos cortos para mostrar visualmente tu negocio a tus clientes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => storyFileInputRef.current?.click()}
              disabled={isUploadingStory}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isUploadingStory ? 'Subiendo estado...' : 'Agregar estado'}</span>
            </button>
          </div>
        ) : (
          /* Lista de estados publicados */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#52627A] dark:text-slate-400 font-medium">
              <span>Estados activos ({appearance.stories?.length || 0})</span>
              <span className="text-[11px]">Formatos: Fotos (PNG, JPG, WEBP) o Videos (MP4, WEBM)</span>
            </div>

            <div className="space-y-2.5">
              {(appearance.stories || []).map((story, idx) => {
                const isVideo = story.mediaType === 'video';

                return (
                  <div
                    key={story.id || idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-[#DEE7F2] dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition"
                  >
                    {/* Vista previa miniatura */}
                    <div className="relative w-full sm:w-28 h-24 sm:h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shrink-0 flex items-center justify-center">
                      {isVideo ? (
                        <>
                          <video
                            src={story.mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <VideoIcon className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={story.mediaUrl}
                          alt={story.title || `Estado ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white font-mono flex items-center gap-1">
                        {isVideo ? <VideoIcon className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                        <span>#{idx + 1}</span>
                      </div>
                    </div>

                    {/* Campos de título / información */}
                    <div className="flex-1 w-full space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-medium text-[#64748B] dark:text-slate-400">
                          Título o pie de contenido (opcional)
                        </label>
                        <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                          {isVideo ? '🎥 Video corto' : '📷 Fotografía'}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={story.title || ''}
                        onChange={(e) => handleUpdateStoryTitle(story.id, e.target.value)}
                        placeholder="Ej. Nuevo menú de almuerzos, Detalle del producto..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700 text-xs text-[#14213D] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-purple-600 shadow-2xs"
                      />
                    </div>

                    {/* Acciones de previsualizar, reordenar y retirar */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewStory(story)}
                        title="Ver estado"
                        className="p-1.5 rounded-lg border border-[#DEE7F2] dark:border-slate-700 text-[#52627A] hover:text-purple-600 hover:bg-[#F1F5FB] dark:text-slate-400 dark:hover:text-purple-300 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStory(idx, 'up')}
                        title="Mover arriba"
                        className="p-1.5 rounded-lg border border-[#DEE7F2] dark:border-slate-700 text-[#52627A] hover:text-[#14213D] hover:bg-[#F1F5FB] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === (appearance.stories?.length || 0) - 1}
                        onClick={() => handleMoveStory(idx, 'down')}
                        title="Mover abajo"
                        className="p-1.5 rounded-lg border border-[#DEE7F2] dark:border-slate-700 text-[#52627A] hover:text-[#14213D] hover:bg-[#F1F5FB] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStory(story.id)}
                        title="Retirar estado"
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Previsualización Rápida en Admin */}
      {previewStory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl flex flex-col">
            <div className="p-3 border-b border-neutral-800 flex items-center justify-between text-white">
              <span className="text-xs font-semibold">
                {previewStory.mediaType === 'video' ? 'Video del estado' : 'Fotografía del estado'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewStory(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-96 bg-black flex items-center justify-center overflow-hidden">
              {previewStory.mediaType === 'video' ? (
                <video
                  src={previewStory.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewStory.mediaUrl}
                  alt={previewStory.title || 'Vista previa'}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            {previewStory.title && (
              <div className="p-3 bg-neutral-900 text-white text-xs text-center border-t border-neutral-800">
                {previewStory.title}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Colores de Marca (Exclusivo Plan Pro) */}
      <div
        className={`p-5 rounded-2xl border space-y-4 relative overflow-hidden ${
          isPro
            ? 'bg-[#F8FAFC] dark:bg-slate-950/60 border-[#DEE7F2] dark:border-slate-800'
            : 'bg-[#F8FAFC]/70 dark:bg-slate-950/30 border-[#DEE7F2] dark:border-slate-800/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>3. Colores de Marca</span>
              {isPro ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                  Desbloqueado (Pro)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Exclusivo Plan Pro</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
              Personaliza el color primario, secundario y de acento de los botones y destacados
            </p>
          </div>
        </div>

        {!isPro && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-500/30 dark:text-amber-300 flex items-center justify-between gap-3 shadow-2xs">
            <span>
              En el <strong>Plan Basic</strong>, tu tienda utiliza la paleta estándar de MAXINEGO.
              Actualiza a Pro para personalizar tu identidad cromática.
            </span>
            <button
              type="button"
              onClick={() => handleProFeatureAttempt('Colores de Marca')}
              className="text-[11px] font-bold underline text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-200 flex-shrink-0 cursor-pointer"
            >
              Ver más
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Color Primario */}
          <div>
            <label className="block text-xs font-medium text-[#14213D] dark:text-slate-300 mb-1.5">
              Color Primario (Botones y Enlaces)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                disabled={!isPro}
                value={appearance.brandPrimaryColor}
                onChange={(e) =>
                  isPro
                    ? setAppearance({ ...appearance, brandPrimaryColor: e.target.value })
                    : handleProFeatureAttempt('Color Primario')
                }
                className="w-10 h-10 rounded-xl bg-white dark:bg-transparent border border-[#DEE7F2] dark:border-slate-700 cursor-pointer disabled:opacity-40 p-0.5 shadow-2xs"
              />
              <input
                type="text"
                disabled={!isPro}
                value={appearance.brandPrimaryColor}
                onChange={(e) =>
                  isPro && setAppearance({ ...appearance, brandPrimaryColor: e.target.value })
                }
                className="w-28 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs font-mono shadow-2xs focus:outline-none focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF]/20 disabled:opacity-50 transition"
              />
            </div>
          </div>

          {/* Color Secundario */}
          <div>
            <label className="block text-xs font-medium text-[#14213D] dark:text-slate-300 mb-1.5">
              Color Secundario (Insignias)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                disabled={!isPro}
                value={appearance.brandSecondaryColor}
                onChange={(e) =>
                  isPro
                    ? setAppearance({ ...appearance, brandSecondaryColor: e.target.value })
                    : handleProFeatureAttempt('Color Secundario')
                }
                className="w-10 h-10 rounded-xl bg-white dark:bg-transparent border border-[#DEE7F2] dark:border-slate-700 cursor-pointer disabled:opacity-40 p-0.5 shadow-2xs"
              />
              <input
                type="text"
                disabled={!isPro}
                value={appearance.brandSecondaryColor}
                onChange={(e) =>
                  isPro && setAppearance({ ...appearance, brandSecondaryColor: e.target.value })
                }
                className="w-28 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs font-mono shadow-2xs focus:outline-none focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF]/20 disabled:opacity-50 transition"
              />
            </div>
          </div>

          {/* Color de Acento */}
          <div>
            <label className="block text-xs font-medium text-[#14213D] dark:text-slate-300 mb-1.5">
              Color de Acento (Ofertas)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                disabled={!isPro}
                value={appearance.brandAccentColor}
                onChange={(e) =>
                  isPro
                    ? setAppearance({ ...appearance, brandAccentColor: e.target.value })
                    : handleProFeatureAttempt('Color de Acento')
                }
                className="w-10 h-10 rounded-xl bg-white dark:bg-transparent border border-[#DEE7F2] dark:border-slate-700 cursor-pointer disabled:opacity-40 p-0.5 shadow-2xs"
              />
              <input
                type="text"
                disabled={!isPro}
                value={appearance.brandAccentColor}
                onChange={(e) =>
                  isPro && setAppearance({ ...appearance, brandAccentColor: e.target.value })
                }
                className="w-28 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs font-mono shadow-2xs focus:outline-none focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF]/20 disabled:opacity-50 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dominio Propio (Exclusivo Plan Pro) */}
      <div
        className={`p-5 rounded-2xl border space-y-4 ${
          isPro
            ? 'bg-[#F8FAFC] dark:bg-slate-950/60 border-[#DEE7F2] dark:border-slate-800'
            : 'bg-[#F8FAFC]/70 dark:bg-slate-950/30 border-[#DEE7F2] dark:border-slate-800/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1769FF] dark:text-cyan-400" />
              <span>4. Dominio Propio</span>
              {isPro ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                  Incluido en Pro
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Exclusivo Plan Pro</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
              Conecta tu propio dominio .bo o .com sin referencias de subdominio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#14213D] dark:text-slate-300 mb-1.5">
              Subdominio Oficial MAXINEGO (Gratuito en todos los planes)
            </label>
            <div className="px-3.5 py-2.5 rounded-xl bg-[#EEF4FF] dark:bg-slate-900/80 border border-[#DEE7F2] dark:border-slate-800 text-[#14213D] dark:text-slate-300 text-xs font-mono shadow-2xs select-all">
              maxinego.app/tienda/{store.slug}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#14213D] dark:text-slate-300 mb-1.5">
              Dominio Propio Personalizado (Solo Plan Pro)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={!isPro}
                value={appearance.customDomain}
                onChange={(e) =>
                  isPro
                    ? setAppearance({ ...appearance, customDomain: e.target.value })
                    : handleProFeatureAttempt('Dominio Propio')
                }
                placeholder="ejemplo: www.mitienda.bo"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white placeholder-[#94A3B8] text-xs font-mono focus:outline-none focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF]/20 transition shadow-2xs disabled:opacity-50"
              />
              {isPro && appearance.customDomain && (
                <span className="px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>DNS Activo</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Destacados del Comercio (Vitrina Superior) */}
      <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>5. Destacados del Comercio (Vitrina Superior)</span>
            </h3>
            <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
              Personaliza los sellos, compromisos o atributos clave que resaltan en la parte superior de tu tienda
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-[#14213D] dark:text-slate-300 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={appearance.showHighlights ?? true}
                onChange={(e) =>
                  setAppearance({ ...appearance, showHighlights: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#1769FF] focus:ring-[#1769FF] bg-white border-[#CBD5E1] dark:bg-slate-900 dark:border-slate-700 cursor-pointer"
              />
              <span>Mostrar destacados</span>
            </label>

            <button
              type="button"
              onClick={() => {
                const real = getDefaultStoreHighlights(store.id);
                setAppearance({ ...appearance, highlights: real });
              }}
              title="Restablecer con datos reales configurados (envíos, WhatsApp, pagos)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-[11px] font-medium text-[#52627A] hover:text-[#14213D] dark:text-slate-300 dark:hover:text-white transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3 h-3 text-[#64748B] dark:text-slate-400" />
              <span>Sincronizar Datos Reales</span>
            </button>
          </div>
        </div>

        {/* Selector de Composición Visual */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#14213D] dark:text-slate-300">
            Composición Visual de los Destacados
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {[
              {
                id: 'balanced',
                name: 'Equilibrada',
                desc: 'Cuadrícula armónica adaptable',
              },
              {
                id: 'featured',
                name: '1 Principal + N',
                desc: 'Jerarquía con foco prioritario',
              },
              {
                id: 'horizontal',
                name: 'Horizontal',
                desc: 'Fila deslizable continua',
              },
              {
                id: 'editorial',
                name: 'Editorial',
                desc: 'Estilo elegante con divisores',
              },
              {
                id: 'minimal',
                name: 'Minimalista',
                desc: 'Insignias limpias y compactas',
              },
            ].map((comp) => {
              const isSelected = (appearance.highlightsLayout || 'balanced') === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() =>
                    setAppearance({
                      ...appearance,
                      highlightsLayout: comp.id as StoreHighlightsLayout,
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#EEF4FF] border-[#1769FF] text-[#14213D] shadow-2xs dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white'
                      : 'bg-white border-[#DEE7F2] text-[#52627A] hover:text-[#14213D] hover:border-[#CBD5E1] dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">{comp.name}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-[#1769FF] dark:text-indigo-300' : 'text-[#64748B] dark:text-slate-400'
                    }`}
                  >
                    {comp.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Destacados Editables */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#14213D] dark:text-slate-300">
              Elementos configurados ({appearance.highlights?.length || 0}/6)
            </span>

            {(appearance.highlights?.length || 0) < 6 && (
              <button
                type="button"
                onClick={() => {
                  const current = appearance.highlights || [];
                  const newItem: StoreHighlightItem = {
                    id: `h-${Date.now()}`,
                    icon: '⭐',
                    title: 'Nuevo Destacado',
                    description: 'Detalle o beneficio directo de tu comercio',
                    badge: 'Beneficio',
                  };
                  setAppearance({ ...appearance, highlights: [...current, newItem] });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EEF4FF] text-[#1769FF] hover:bg-[#E0ECFF] text-xs font-semibold border border-[#BFDBFE] transition cursor-pointer shadow-2xs dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30 dark:hover:bg-indigo-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Elemento</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {(appearance.highlights || []).map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-[#DEE7F2] dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition"
              >
                {/* Icono / Emoji */}
                <div className="w-14">
                  <label className="block text-[10px] font-medium text-[#64748B] dark:text-slate-500 mb-1">
                    Icono
                  </label>
                  <input
                    type="text"
                    value={item.icon || '✨'}
                    maxLength={4}
                    onChange={(e) => {
                      const current = [...(appearance.highlights || [])];
                      current[idx] = { ...current[idx], icon: e.target.value };
                      setAppearance({ ...appearance, highlights: current });
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700 text-center text-sm text-[#14213D] dark:text-white focus:outline-none focus:border-[#1769FF] shadow-2xs"
                  />
                </div>

                {/* Título */}
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[10px] font-medium text-[#64748B] dark:text-slate-500 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const current = [...(appearance.highlights || [])];
                      current[idx] = { ...current[idx], title: e.target.value };
                      setAppearance({ ...appearance, highlights: current });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700 text-xs text-[#14213D] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#1769FF] shadow-2xs"
                    placeholder="Ej. Envíos Rápidos"
                  />
                </div>

                {/* Descripción */}
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[10px] font-medium text-[#64748B] dark:text-slate-500 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => {
                      const current = [...(appearance.highlights || [])];
                      current[idx] = { ...current[idx], description: e.target.value };
                      setAppearance({ ...appearance, highlights: current });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700 text-xs text-[#14213D] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#1769FF] shadow-2xs"
                    placeholder="Ej. Despacho directo a tu puerta"
                  />
                </div>

                {/* Badge opcional */}
                <div className="w-24">
                  <label className="block text-[10px] font-medium text-[#64748B] dark:text-slate-500 mb-1">
                    Insignia
                  </label>
                  <input
                    type="text"
                    value={item.badge || ''}
                    onChange={(e) => {
                      const current = [...(appearance.highlights || [])];
                      current[idx] = { ...current[idx], badge: e.target.value };
                      setAppearance({ ...appearance, highlights: current });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700 text-xs text-[#14213D] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#1769FF] shadow-2xs"
                    placeholder="Ej. Gratis"
                  />
                </div>

                {/* Botón eliminar */}
                <div className="self-end sm:self-center pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const current = (appearance.highlights || []).filter((_, i) => i !== idx);
                      setAppearance({ ...appearance, highlights: current });
                    }}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Eliminar este destacado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. PWA (Disponible para ambos planes) */}
      <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>6. Aplicación Web Progresiva (PWA Instalable)</span>
            </h3>
            <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
              Tus clientes pueden instalar tu tienda como icono en su pantalla de inicio en Android, iOS y PC
            </p>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
            Habilitada (Basic & Pro)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-[#DEE7F2] dark:border-slate-800 space-y-1 shadow-2xs">
            <span className="text-[11px] font-bold text-[#14213D] dark:text-slate-300">
              Modo Pantalla Completa
            </span>
            <p className="text-[10px] text-[#52627A] dark:text-slate-400 leading-relaxed">
              Se ejecuta sin barras de navegador simulando una aplicación nativa.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-[#DEE7F2] dark:border-slate-800 space-y-1 shadow-2xs">
            <span className="text-[11px] font-bold text-[#14213D] dark:text-slate-300">
              Caché Offline Seguro
            </span>
            <p className="text-[10px] text-[#52627A] dark:text-slate-400 leading-relaxed">
              Carga instantánea de catálogo e imágenes incluso con señal intermitente.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-[#DEE7F2] dark:border-slate-800 space-y-1 shadow-2xs">
            <span className="text-[11px] font-bold text-[#14213D] dark:text-slate-300">
              Icono y Manifest PWA
            </span>
            <p className="text-[10px] text-[#52627A] dark:text-slate-400 leading-relaxed">
              Compatible con Google Chrome, Safari Mobile y Microsoft Edge.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};
