import React from 'react';
import { CheckCircle2, Circle, Clock, ShieldCheck, Lock, Store, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { ProjectPhase } from '../types';

const phases: ProjectPhase[] = [
  {
    id: 1,
    title: 'Base de Datos y Seguridad',
    description: 'Esquema PostgreSQL, RLS multi-tenant, funciones de seguridad y storage completados en Supabase CentralBo.',
    status: 'completed',
    badge: 'Completado (Fase 1)',
  },
  {
    id: 2,
    title: 'Autenticación y Router Multi-tenant',
    description: 'Acceso por 3 perfiles oficiales, aislamiento de comercio por tenant_id y resolución pública por slug.',
    status: 'completed',
    badge: 'Implementado (Módulo 2)',
  },
  {
    id: 3,
    title: 'Panel SuperAdmin Global',
    description: 'Dashboard global, gestión de comercios con detalle, usuarios por perfil, planes Basic/Pro, suscripciones, actividad y configuración.',
    status: 'completed',
    badge: 'Implementado (Módulo 3)',
  },
  {
    id: 4,
    title: 'Panel Admin de Tienda',
    description: 'Gestión completa de tienda: resumen, perfil, apariencia, horarios, envíos, pedidos programados, catálogo por vertical, promociones y estadísticas.',
    status: 'completed',
    badge: 'Implementado (Módulo 4)',
  },
  {
    id: 5,
    title: 'Tienda Pública, Carrito y Checkout',
    description: 'Catálogo de cliente adaptativo por vertical (restaurante, moda, servicios), carrito con variantes, checkout como invitado y solicitud de citas.',
    status: 'completed',
    badge: 'Implementado (Módulo 5)',
  },
];

const phaseIcons = [
  ShieldCheck,
  Lock,
  LayoutDashboard,
  Store,
  ShoppingBag,
];

export const PhaseTracker: React.FC = () => {
  return (
    <section
      id="centralbo-phase-tracker"
      className="w-full rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 lg:p-7 backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Arquitectura de Fases CentralBo
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              5 Módulos Oficiales
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Fase 1 conservada intacta en <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">/supabase</code>. Proyecto web preparado para las siguientes fases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-medium bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            <span>Etapa actual: Preparación Web PWA</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {phases.map((phase, idx) => {
          const Icon = phaseIcons[idx];
          const isCompleted = phase.status === 'completed';
          const isNext = phase.id === 2;

          return (
            <div
              key={phase.id}
              id={`phase-card-${phase.id}`}
              className={`relative rounded-xl p-4 transition-all flex flex-col justify-between border ${
                isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                  : isNext
                  ? 'bg-slate-900/90 border-indigo-500/30'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isNext
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : isNext
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                    }`}
                  >
                    {phase.badge}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    0{phase.id}.
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                    {phase.title}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {phase.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Estado</span>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Listo</span>
                  </span>
                ) : isNext ? (
                  <span className="inline-flex items-center gap-1 text-indigo-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Siguiente</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Circle className="w-3 h-3" />
                    <span>En cola</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
