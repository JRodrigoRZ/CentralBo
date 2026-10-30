import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { useTheme } from '../../context/ThemeContext';

interface StorePWAInstallButtonProps {
  storeName: string;
  storeSlug: string;
  tenantId?: string;
  isPro?: boolean;
  primaryColor?: string;
  className?: string;
  variant?: 'header' | 'hero' | 'compact';
}

export const StorePWAInstallButton: React.FC<StorePWAInstallButtonProps> = ({
  storeName,
  storeSlug,
  primaryColor = '#4f46e5',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWA(`/tienda/${storeSlug}`);
  const { isDark } = useTheme();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Determinar si la instancia instalada corresponde específicamente a esta tienda
  const isThisStoreInstalled =
    isInstalled &&
    (typeof window !== 'undefined'
      ? (!new URLSearchParams(window.location.search).get('pwa_slug') ||
         new URLSearchParams(window.location.search).get('pwa_slug') === storeSlug)
      : true);

  // 1. Si la tienda ya está instalada: ocultar completamente
  if (isInstalled || isThisStoreInstalled) {
    return null;
  }

  // 2. Visibilidad condicional estricta: mostrar SOLO cuando exista capacidad real de instalación
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!isInstallable) {
      return;
    }

    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      <button
        type="button"
        id={`pwa-install-btn-${storeSlug}`}
        onClick={handleInstallClick}
        disabled={isInstalling}
        style={{
          borderColor: primaryColor ? `${primaryColor}40` : undefined,
        }}
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none shrink-0 disabled:opacity-60 border shadow-xs ${
          isDark
            ? 'bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white border-stone-800'
            : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border-stone-200'
        } ${className}`}
        title={`Instalar tienda oficial de ${storeName}`}
      >
        <Download
          className="w-3.5 h-3.5 shrink-0 transition-transform"
          style={{ color: primaryColor }}
        />
        <span>{isInstalling ? 'Instalando...' : 'Instalar tienda'}</span>
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
              className="w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
