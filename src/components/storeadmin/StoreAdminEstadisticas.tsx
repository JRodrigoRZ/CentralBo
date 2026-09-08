import React from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Eye,
  ShieldCheck,
  Calendar,
  Percent,
  Info,
} from 'lucide-react';
import { Store } from '../../types';
import { getStoreStatistics } from '../../lib/storeAdminService';

interface StoreAdminEstadisticasProps {
  store: Store;
}

export const StoreAdminEstadisticas: React.FC<StoreAdminEstadisticasProps> = ({
  store,
}) => {
  const stats = getStoreStatistics(store.id);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Estadísticas de Tráfico y Rendimiento</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analítica de audiencia, popularidad de catálogo y tasa de conversión de{' '}
            <strong className="text-indigo-300">{store.name}</strong>
          </p>
        </div>

        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Filtro Anti-inflación Activo (30 min)</span>
        </span>
      </div>

      {/* Nota del mecanismo Anti-inflación de visitas */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Mecanismo Anti-Inflación de Visitas de CentralBo</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Las recargas consecutivas de página o visitas repetidas de un mismo cliente en un lapso
            menor a <strong>30 minutos</strong> se consolidan como una única sesión. Esto previene
            que métricas artificiales inflen tu volumen y garantiza datos fidedignos de clientes reales.
          </p>
        </div>
      </div>

      {/* Tarjetas de Visitas en Horizontes Temporales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Hoy */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Hoy</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.todayVisits.toLocaleString('es-BO')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Visitas únicas registradas</p>
        </div>

        {/* Últimos 7 Días */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Últimos 7 Días</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.last7DaysVisits.toLocaleString('es-BO')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Tráfico semanal acumulado</p>
        </div>

        {/* Últimos 30 Días */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Últimos 30 Días</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.last30DaysVisits.toLocaleString('es-BO')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Alcance mensual</p>
        </div>

        {/* Tasa de Conversión */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Conversión</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {stats.conversionRate}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {stats.totalOrders} compras / {stats.totalVisits} visitas
          </p>
        </div>
      </div>

      {/* Productos Más Vistos */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Productos Más Vistos por tus Clientes
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Interés y apertura de ficha de producto en tu tienda
          </p>
        </div>

        <div className="space-y-3">
          {stats.mostViewedProducts.map((p, idx) => (
            <div
              key={p.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-white">{p.name}</span>
                </div>
                <span className="font-mono text-indigo-300 font-bold">
                  {p.views.toLocaleString('es-BO')} vistas
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                  style={{ width: `${Math.min(p.percentage * 2, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
