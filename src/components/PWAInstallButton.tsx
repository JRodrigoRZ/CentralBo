import React, { useState } from 'react';
import { Download, Share, CheckCircle2, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWA('/');
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Si ya se está ejecutando como PWA instalada
  if (isInstalled) {
    return (
      <div
        id="pwa-installed-badge"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>PWA Instalada</span>
      </div>
    );
  }

  // Flujo Chrome / Edge / Android / Escritorio compatible
  if (isInstallable) {
    return (
      <button
        id="pwa-install-action-btn"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span>{isInstalling ? 'Instalando...' : 'Instalar CentralBo'}</span>
      </button>
    );
  }

  // Flujo iOS Safari (explicación de Agregar a pantalla de inicio)
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-guide-btn"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
        >
          <Share className="w-3.5 h-3.5 text-indigo-400" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div
            id="pwa-ios-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Instalar CentralBo en iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                    1
                  </span>
                  <p>
                    Toca el botón <strong>Compartir</strong> (<Share className="inline w-3 h-3 text-indigo-400" />) en la barra inferior de Safari.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                    2
                  </span>
                  <p>
                    Baja en el menú y selecciona <strong>Agregar a pantalla de inicio</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                    3
                  </span>
                  <p>
                    Presiona <strong>Agregar</strong> en la esquina superior derecha para usar CentralBo como app nativa.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // En navegadores de escritorio que no emiten evento antes de interacción
  return (
    <div
      id="pwa-ready-badge"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 text-xs font-medium"
      title="CentralBo es una PWA compatible con Chrome, Edge, Safari y navegadores móviles"
    >
      <Download className="w-3.5 h-3.5 text-indigo-400" />
      <span>PWA Habilitada</span>
    </div>
  );
};
