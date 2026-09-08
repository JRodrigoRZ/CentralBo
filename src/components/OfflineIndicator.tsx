import React from 'react';
import { WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-alert"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/95 text-slate-950 font-medium text-xs shadow-2xl backdrop-blur-xs border border-amber-400/30 animate-fade-in"
    >
      <div className="p-1.5 rounded-lg bg-amber-600/30 text-slate-950">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="font-semibold leading-tight">Modo Sin Conexión</p>
        <p className="text-[11px] opacity-90 leading-tight mt-0.5">
          La PWA de CentralBo sigue disponible localmente con caché de recursos.
        </p>
      </div>
    </div>
  );
};
