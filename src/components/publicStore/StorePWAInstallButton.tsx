import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, Share2, PlusSquare, ExternalLink, Copy, Check, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { useTheme } from '../../context/ThemeContext';
import { getStorePlan } from '../../lib/storeAdminService';

interface StorePWAInstallButtonProps {
  storeName: string;
  storeSlug: string;
  tenantId?: string;
  isPro?: boolean;
  primaryColor?: string;
  className?: string;
  variant?: 'header' | 'hero' | 'compact';
}

function isLightColor(hexColor: string): boolean {
  try {
    const hex = hexColor.replace('#', '');
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 165;
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 165;
    }
  } catch {
    // fallback
  }
  return false;
}

export const StorePWAInstallButton: React.FC<StorePWAInstallButtonProps> = ({
  storeName,
  storeSlug,
  tenantId,
  isPro: propIsPro,
  primaryColor = '#4f46e5',
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWA(`/tienda/${storeSlug}`);
  const { isDark } = useTheme();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determinar si la instancia instalada corresponde específicamente a esta tienda
  const isThisStoreInstalled =
    isInstalled &&
    (typeof window !== 'undefined'
      ? (!new URLSearchParams(window.location.search).get('pwa_slug') ||
         new URLSearchParams(window.location.search).get('pwa_slug') === storeSlug)
      : true);

  // Determinar si el comercio cuenta con personalización Pro
  const isProStore = propIsPro !== undefined
    ? propIsPro
    : tenantId
    ? getStorePlan(tenantId) === 'pro'
    : false;

  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#/tienda/${storeSlug}`
    : `/#/tienda/${storeSlug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpenNewTab = () => {
    window.open(storeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!isInstallable) {
      setShowHelpModal(true);
      return;
    }

    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // 1. Si la aplicación ya está instalada y ejecutándose en modo standalone para este comercio
  if (isThisStoreInstalled) {
    return (
      <div
        id={`pwa-installed-badge-${storeSlug}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold select-none shrink-0 ${
          isDark
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-emerald-50 border border-emerald-300 text-emerald-700'
        } ${className}`}
        title={`Aplicación instalada para ${storeName}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">App instalada</span>
        <span className="sm:hidden">Instalada</span>
      </div>
    );
  }

  // Estilos visuales adaptados según Plan Pro (colores de marca) o Basic (estilo estándar existente)
  const isLightTextNeeded = isProStore ? !isLightColor(primaryColor) : false;
  const textColor = isLightTextNeeded ? '#ffffff' : '#0f172a';

  const proStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    color: textColor,
  };

  const proClasses =
    'border border-black/10 dark:border-white/10 shadow-sm hover:brightness-110 active:scale-95 text-white';

  const basicClasses = isDark
    ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 shadow-sm active:scale-95'
    : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 border border-slate-300 hover:border-slate-400 shadow-sm active:scale-95';

  return (
    <>
      <button
        type="button"
        id={`pwa-install-btn-${storeSlug}`}
        onClick={handleInstallClick}
        disabled={isInstalling}
        style={isProStore ? proStyle : undefined}
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none shrink-0 disabled:opacity-60 ${
          isProStore ? proClasses : basicClasses
        } ${className}`}
        title={`Instalar la app oficial de ${storeName} en este dispositivo`}
      >
        <Download
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
            isProStore
              ? isLightTextNeeded
                ? 'text-white'
                : 'text-slate-900'
              : className && className.includes('text-')
              ? 'text-current'
              : isDark
              ? 'text-indigo-400'
              : 'text-indigo-600'
          }`}
        />
        <span>{isInstalling ? 'Instalando...' : 'Instalar app'}</span>
      </button>

      {/* Modal de instrucciones para iOS Safari */}
      {showIOSModal && (
        <div
          id="ios-pwa-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Instalar {storeName}</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Para instalar la app de <strong className="text-white">{storeName}</strong> en tu iPhone o iPad:
            </p>

            <ol className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Toca Compartir en Safari</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    Busca el botón <Share2 className="w-3.5 h-3.5 inline text-sky-400" /> en la barra inferior.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Agregar a pantalla de inicio</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    Desliza hacia abajo y elige <PlusSquare className="w-3.5 h-3.5 inline text-indigo-400" />.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Confirma "Agregar"</p>
                  <p className="text-[11px] text-slate-400">
                    Se creará el icono oficial de {storeName} en tu pantalla.
                  </p>
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              style={isProStore ? { backgroundColor: primaryColor, color: textColor } : undefined}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                !isProStore ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'hover:brightness-110'
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal explicativo para navegadores o entornos sin prompt directo */}
      {showHelpModal && (
        <div
          id="pwa-help-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Instalar {storeName}</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              La instalación de la app oficial de <strong className="text-white">{storeName}</strong> está disponible abriendo esta tienda en una ventana o pestaña directa de tu navegador preferido:
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <span className="font-semibold text-white">Google Chrome / Edge (PC o Android):</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Haz clic en el icono de instalación en la barra de direcciones o menú ⋮ &gt; "Instalar aplicación".
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <span className="font-semibold text-white">Safari (iPhone / iPad):</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Toca Compartir &gt; "Agregar a pantalla de inicio".
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleOpenNewTab}
                style={isProStore ? { backgroundColor: primaryColor, color: textColor } : undefined}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition cursor-pointer ${
                  !isProStore ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'hover:brightness-110'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en pestaña</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
