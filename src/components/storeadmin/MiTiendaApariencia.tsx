import React, { useState } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import { Store, StoreAppearanceSettings } from '../../types';
import {
  getStoreAppearance,
  saveStoreAppearance,
  getStorePlan,
} from '../../lib/storeAdminService';
import { useTheme } from '../../context/ThemeContext';

interface MiTiendaAparienciaProps {
  store: Store;
}

export const MiTiendaApariencia: React.FC<MiTiendaAparienciaProps> = ({ store }) => {
  const plan = getStorePlan(store.id);
  const isPro = plan === 'pro';
  const { setTheme: setAppTheme } = useTheme();

  const [appearance, setAppearance] = useState<StoreAppearanceSettings>(() =>
    getStoreAppearance(store.id)
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);

  const handleSelectTheme = (thm: 'light' | 'dark') => {
    setAppearance({ ...appearance, theme: thm });
    setAppTheme(thm);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const result = saveStoreAppearance(store.id, appearance);
    if (result.success) {
      setSavedSuccess(true);
      setAppTheme(appearance.theme);
      setTimeout(() => setSavedSuccess(false), 3000);
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

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <span>Apariencia y Estilo Visual</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza el tema, la paleta cromática y la experiencia de instalación de tu tienda
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              isPro
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            Plan: {plan.toUpperCase()}
          </span>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Ajustes</span>
          </button>
        </div>
      </div>

      {/* Alerta de bloqueo de plan */}
      {blockedAlert && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-300">Función Exclusiva del Plan Pro</p>
            <p className="text-slate-300">{blockedAlert}</p>
          </div>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Configuración visual guardada correctamente.</span>
        </div>
      )}

      {/* 1. Tema Claro / Oscuro (Disponible en ambos planes) */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Modo de Visualización (Disponible para todos los planes)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Selecciona el fondo visual predeterminado para tus clientes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
              appearance.theme === 'dark'
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-xs font-bold">Modo Oscuro</p>
              <p className="text-[10px] text-slate-400">Elegante y descansado</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
              appearance.theme === 'light'
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs font-bold">Modo Claro</p>
              <p className="text-[10px] text-slate-400">Luminoso y despejado</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Colores de Marca (Exclusivo Plan Pro) */}
      <div
        className={`p-5 rounded-2xl border space-y-4 relative overflow-hidden ${
          isPro
            ? 'bg-slate-950/60 border-slate-800'
            : 'bg-slate-950/30 border-slate-800/60 opacity-90'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>2. Colores de Marca</span>
              {isPro ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Desbloqueado (Pro)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Exclusivo Plan Pro</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Personaliza el color primario, secundario y de acento de los botones y destacados
            </p>
          </div>
        </div>

        {!isPro && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-3">
            <span>
              En el <strong>Plan Basic</strong>, tu tienda utiliza la paleta estándar de CentralBo.
              Actualiza a Pro para personalizar tu identidad cromática.
            </span>
            <button
              type="button"
              onClick={() => handleProFeatureAttempt('Colores de Marca')}
              className="text-[11px] font-bold underline hover:text-amber-200 flex-shrink-0"
            >
              Ver más
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Color Primario */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer disabled:opacity-40"
              />
              <input
                type="text"
                disabled={!isPro}
                value={appearance.brandPrimaryColor}
                onChange={(e) =>
                  isPro && setAppearance({ ...appearance, brandPrimaryColor: e.target.value })
                }
                className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Color Secundario */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer disabled:opacity-40"
              />
              <input
                type="text"
                disabled={!isPro}
                value={appearance.brandSecondaryColor}
                onChange={(e) =>
                  isPro && setAppearance({ ...appearance, brandSecondaryColor: e.target.value })
                }
                className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Color de Acento */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer disabled:opacity-40"
              />
              <input
                type="text"
                disabled={!isPro}
                value={appearance.brandAccentColor}
                onChange={(e) =>
                  isPro && setAppearance({ ...appearance, brandAccentColor: e.target.value })
                }
                className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dominio Propio (Exclusivo Plan Pro) */}
      <div
        className={`p-5 rounded-2xl border space-y-4 ${
          isPro
            ? 'bg-slate-950/60 border-slate-800'
            : 'bg-slate-950/30 border-slate-800/60 opacity-90'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>3. Dominio Propio</span>
              {isPro ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Incluido en Pro
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Exclusivo Plan Pro</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Conecta tu propio dominio .bo o .com sin referencias de subdominio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Subdominio Oficial CentralBo (Gratuito en todos los planes)
            </label>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
              centralbo.com/tienda/{store.slug}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
              />
              {isPro && appearance.customDomain && (
                <span className="px-2.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>DNS Activo</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PWA (Disponible para ambos planes) */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>4. Aplicación Web Progresiva (PWA Instalable)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tus clientes pueden instalar tu tienda como icono en su pantalla de inicio en Android, iOS y PC
            </p>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Habilitada (Basic & Pro)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-300">Modo Pantalla Completa</span>
            <p className="text-[10px] text-slate-400">
              Se ejecuta sin barras de navegador simulando una aplicación nativa.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-300">Caché Offline Seguro</span>
            <p className="text-[10px] text-slate-400">
              Carga instantánea de catálogo e imágenes incluso con señal intermitente.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-300">Icono y Manifest PWA</span>
            <p className="text-[10px] text-slate-400">
              Compatible con Google Chrome, Safari Mobile y Microsoft Edge.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};
