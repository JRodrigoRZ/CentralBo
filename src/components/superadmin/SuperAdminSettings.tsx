import React from 'react';
import {
  Settings,
  ShieldCheck,
  Globe,
  Coins,
  Clock,
  Layers,
  Smartphone,
  CheckCircle2,
  Database,
} from 'lucide-react';

export const SuperAdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span>Configuración Global</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Parámetros del MVP
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Parámetros globales del sistema aprobados para el funcionamiento de CentralBo.
        </p>
      </div>

      {/* Grid de Parámetros Globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identidad y Versión de la Plataforma */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Identidad de la Plataforma</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Nombre del Sistema</span>
              <span className="font-bold text-white">CentralBo</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Versión de la Plataforma</span>
              <span className="font-mono text-cyan-300">v1.3.0 (Módulo 3)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Arquitectura</span>
              <span className="text-slate-200">SaaS Multi-Tenant Aislado</span>
            </div>
          </div>
        </div>

        {/* Localización y Moneda */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Coins className="w-4 h-4" />
            <span>Localización & Moneda</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Moneda Oficial</span>
              <span className="font-bold text-emerald-400">BOB — Bolivianos (Bs)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Zona Horaria Estándar</span>
              <span className="font-mono text-slate-200">America/La_Paz (GMT-4)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Idioma Principal</span>
              <span className="text-slate-200">Español (es-BO)</span>
            </div>
          </div>
        </div>

        {/* Seguridad y Aislamiento Multi-Tenant */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Seguridad & Multi-Tenant</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Aislamiento de Datos</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Row Level Security (RLS)
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Guardia de Enrutador</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Validación de tenant_id
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Perfiles Aprobados</span>
              <span className="text-white font-mono">3 (SuperAdmin, Admin, Cliente)</span>
            </div>
          </div>
        </div>

        {/* Entorno PWA & Service Worker */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Capacidades PWA</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Web App Manifest</span>
              <span className="text-emerald-400 font-medium">Activo (/manifest.json)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Service Worker</span>
              <span className="text-emerald-400 font-medium">Habilitado (/sw.js)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Instalabilidad</span>
              <span className="text-slate-200">Móvil, Tablet y Escritorio</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
        <p>
          <strong className="text-white">Delimitación del Módulo 3:</strong> La configuración global únicamente incluye los parámetros definidos para el MVP de CentralBo, evitando agregar configuraciones no especificadas.
        </p>
      </div>
    </div>
  );
};
