import React from 'react';
import { ShieldCheck, Smartphone, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="centralbo-main-footer"
      className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            CB
          </div>
          <div>
            <p className="text-slate-900 dark:text-slate-200 font-semibold text-xs">
              CentralBo — Plataforma de Comercio Digital
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comercio electrónico y gestión integral para tiendas en Bolivia
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Conexión Segura & Datos Protegidos</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Web Responsive</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>PWA Instalable</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
