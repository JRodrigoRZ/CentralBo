import React from 'react';
import {
  Store as StoreIcon,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  ArrowUpRight,
  ShieldCheck,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { getSuperAdminDashboardMetrics } from '../../lib/superadminService';
import { SuperAdminSection } from '../../types';

interface SuperAdminDashboardProps {
  onNavigateSection: (section: SuperAdminSection) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onNavigateSection,
}) => {
  const metrics = getSuperAdminDashboardMetrics();

  return (
    <div className="space-y-6">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Resumen Global de la Plataforma</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              CentralBo Core
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo en tiempo real de comercios, usuarios, planes, suscripciones y actividad.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Estado general: <strong className="text-emerald-400">Operativo</strong></span>
        </div>
      </div>

      {/* 1. Métricas Principales de Comercios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <StoreIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>1. Comercios Registrados</span>
          </h3>
          <button
            onClick={() => onNavigateSection('comercios')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition cursor-pointer"
          >
            <span>Ver listado completo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Comercios */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Total Comercios</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{metrics.stores.total}</span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">100%</span>
            </div>
          </div>

          {/* Activos */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col justify-between">
            <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Activos
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{metrics.stores.activos}</span>
              <span className="text-[10px] text-emerald-400/80 font-mono">
                {Math.round((metrics.stores.activos / metrics.stores.total) * 100)}%
              </span>
            </div>
          </div>

          {/* En Prueba */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex flex-col justify-between">
            <span className="text-[11px] text-cyan-300 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> En Prueba
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-cyan-400">{metrics.stores.prueba}</span>
              <span className="text-[10px] text-cyan-400/80 font-mono">Trial</span>
            </div>
          </div>

          {/* Inactivos */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-400" /> Inactivos
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-300">{metrics.stores.inactivos}</span>
              <span className="text-[10px] text-amber-400/80 font-mono">Pausados</span>
            </div>
          </div>

          {/* Suspendidos */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] text-rose-300 font-medium flex items-center gap-1">
              <Ban className="w-3 h-3 text-rose-400" /> Suspendidos
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-400">{metrics.stores.suspendidos}</span>
              <span className="text-[10px] text-rose-400/80 font-mono">Bloqueo</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid de Usuarios, Planes y Suscripciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta de Usuarios */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Users className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Usuarios
                </h3>
              </div>
              <span className="text-xl font-bold text-white">{metrics.users.total}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Desglose de los 3 perfiles oficiales de CentralBo:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/60">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> SuperAdmin Global
                </span>
                <span className="font-bold text-indigo-400">{metrics.users.superadmins}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/60">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <StoreIcon className="w-3.5 h-3.5 text-cyan-400" /> Admin de Comercio
                </span>
                <span className="font-bold text-cyan-400">{metrics.users.storeAdmins}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/60">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Cliente / Comprador
                </span>
                <span className="font-bold text-emerald-400">{metrics.users.publicClients}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('usuarios')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center justify-between w-full transition cursor-pointer"
          >
            <span>Administrar usuarios</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tarjeta de Planes */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <CreditCard className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  3. Planes
                </h3>
              </div>
              <span className="text-xl font-bold text-white">{metrics.plans.total} Planes</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Estructura tarifaria definida para CentralBo:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Plan Basic</span>
                  <span className="text-[11px] text-slate-400">Funciones esenciales</span>
                </div>
                <span className="font-bold text-cyan-300 font-mono">Bs 49/mes</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Plan Pro</span>
                  <span className="text-[11px] text-slate-400">Personalización + Dominio</span>
                </div>
                <span className="font-bold text-indigo-300 font-mono">Bs 99/mes</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('planes')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center justify-between w-full transition cursor-pointer"
          >
            <span>Ver detalles y descuentos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tarjeta de Suscripciones */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  4. Suscripciones
                </h3>
              </div>
              <span className="text-xl font-bold text-white">{metrics.subscriptions.total}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Estado de cobros y periodos de suscripción:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                <span className="text-emerald-300">Activas al Día</span>
                <span className="font-bold text-emerald-400">{metrics.subscriptions.activas}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
                <span className="text-cyan-300">Periodo de Prueba</span>
                <span className="font-bold text-cyan-400">{metrics.subscriptions.prueba}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/60">
                <span className="text-slate-400">Vencidas / Canceladas</span>
                <span className="font-bold text-rose-400">{metrics.subscriptions.vencidas}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('suscripciones')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center justify-between w-full transition cursor-pointer"
          >
            <span>Ver historial de suscripciones</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Estado de Actividad General */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>5. Estado de Actividad General (Métricas MVP)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Última actividad registrada: <span className="text-white font-medium">{metrics.activity.ultimaActividadGeneral}</span>
            </p>
          </div>

          <button
            onClick={() => onNavigateSection('actividad')}
            className="self-start sm:self-auto text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition cursor-pointer"
          >
            <span>Ver desglose por comercio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Visitas Totales</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white">
              {metrics.activity.totalVisitas.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Pedidos Realizados</span>
            <span className="text-xl sm:text-2xl font-extrabold text-cyan-400">
              {metrics.activity.totalPedidos}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Productos Registrados</span>
            <span className="text-xl sm:text-2xl font-extrabold text-indigo-400">
              {metrics.activity.totalProductos}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Ventas Acumuladas</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
              Bs {metrics.activity.totalVentasBs.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
