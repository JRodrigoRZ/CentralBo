import React, { useState } from 'react';
import { Download, ShieldCheck, CheckCircle2, Smartphone, X, ExternalLink, Copy, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface StoreAdminPWAInstallButtonProps {
  storeName: string;
  tenantId: string;
  className?: string;
}

export const StoreAdminPWAInstallButton: React.FC<StoreAdminPWAInstallButtonProps> = ({
  storeName,
  tenantId,
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const adminUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#/admin/${tenantId}`
    : `/#/admin/${tenantId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(adminUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpenNewTab = () => {
    window.open(adminUrl, '_blank', 'noopener,noreferrer');
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

  // 1. Si ya está instalada y ejecutándose en modo standalone
  if (isInstalled) {
    return (
      <div
        id={`admin-pwa-installed-badge-${tenantId.slice(0, 8)}`}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold ${className}`}
        title={`Panel administrativo instalado para ${storeName}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Admin instalado</span>
      </div>
    );
  }

  // 2. Si el dispositivo permite instalación directa o iOS Safari
  if (isInstallable || isIOS) {
    return (
      <>
        <button
          id={`admin-pwa-install-btn-${tenantId.slice(0, 8)}`}
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${className}`}
          title={`Instalar app administrativa para ${storeName}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isInstalling ? 'Instalando...' : 'Instalar Panel'}</span>
        </button>

        {showIOSModal && (
          <div
            id="admin-ios-pwa-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowIOSModal(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">Instalar Admin — {storeName}</h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Instala el acceso directo administrativo de <strong className="text-white">{storeName}</strong>:
              </p>

              <ol className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Toca Compartir en Safari</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      Botón <Share2 className="w-3.5 h-3.5 inline text-sky-400" /> en la barra inferior.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">Agregar a pantalla de inicio</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      Elige <PlusSquare className="w-3.5 h-3.5 inline text-indigo-400" />.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">Confirmar</p>
                    <p className="text-[11px] text-slate-400">
                      Se instalará "Administración — {storeName}".
                    </p>
                  </div>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // 3. Indicación adecuada cuando no está disponible la instalación directa
  return (
    <>
      <button
        type="button"
        id={`admin-pwa-compat-btn-${tenantId.slice(0, 8)}`}
        onClick={() => setShowHelpModal(true)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition cursor-pointer ${className}`}
        title="Instalar panel administrativo en tu dispositivo"
      >
        <ShieldCheck className="w-3 h-3 text-indigo-400" />
        <span className="hidden sm:inline">Instalar Admin</span>
      </button>

      {showHelpModal && (
        <div
          id="admin-pwa-help-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Admin — {storeName}</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Puedes instalar este panel administrativo como aplicación de escritorio o móvil abriéndolo directamente en Google Chrome, Edge o Safari:
            </p>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Identidad Exclusiva:</p>
              <p className="text-[11px] text-slate-400">
                La app se instalará como <strong className="text-indigo-300">Administración — {storeName}</strong> y abrirá siempre la gestión exclusiva de este comercio.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleOpenNewTab}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
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
