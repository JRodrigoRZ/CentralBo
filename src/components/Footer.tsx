import React from 'react';
import { ShieldCheck, Smartphone, Globe, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="centralbo-main-footer"
      className="w-full border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 mt-12"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-xs border border-indigo-500/30">
            CB
          </div>
          <div>
            <p className="text-slate-200 font-semibold text-xs">
              CentralBo — Plataforma Web PWA
            </p>
            <p className="text-[11px] text-slate-500">
              SaaS Marketplace Multi-Tenant Verticalizado • Preparación & Base Arquitectónica
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fase 1: PostgreSQL & RLS OK</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Web Responsive (Móvil / Tablet / PC)</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>PWA Instalable</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
