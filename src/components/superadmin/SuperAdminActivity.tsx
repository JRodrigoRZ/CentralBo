import React from 'react';
import {
  Activity as ActivityIcon,
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  Eye,
  Store as StoreIcon,
} from 'lucide-react';
import { SUPERADMIN_STORES, getSuperAdminDashboardMetrics } from '../../lib/superadminService';

export const SuperAdminActivity: React.FC = () => {
  const metrics = getSuperAdminDashboardMetrics();

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Actividad General</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              En Tiempo Real
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas esenciales de interacción y transacciones globales en CentralBo.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Último evento: <strong className="text-white">Hace 12 min</strong></span>
        </div>
      </div>

      {/* Resumen de 4 Métricas Clave */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Visitas Globales</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {metrics.activity.totalVisitas.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Interacciones en catálogo</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Pedidos Totales</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400">
            {metrics.activity.totalPedidos.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Órdenes generadas</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Productos Activos</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-indigo-400">
            {metrics.activity.totalProductos.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">En catálogo de tiendas</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Ventas Acumuladas</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            Bs {metrics.activity.totalVentasBs.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Volumen transaccional</span>
        </div>
      </div>

      {/* Tabla Desglosada por Comercio */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <StoreIcon className="w-4 h-4 text-indigo-400" />
            <span>Actividad Registrada por Comercio</span>
          </h3>
          <span className="text-xs text-slate-500">
            {SUPERADMIN_STORES.length} Comercios analizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Comercio</th>
                <th className="py-3 px-3 text-right">Visitas</th>
                <th className="py-3 px-3 text-right">Pedidos</th>
                <th className="py-3 px-3 text-right">Productos</th>
                <th className="py-3 px-3 text-right">Ventas Totales</th>
                <th className="py-3 px-4 text-right">Última Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SUPERADMIN_STORES.map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{st.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">/{st.slug}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200">
                    {st.activity.visitas.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-cyan-400">
                    {st.activity.pedidos}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-400">
                    {st.activity.productos}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    Bs {st.activity.ventas.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {st.activity.ultimaActividad}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Resumen consolidado de interacciones, visitas y pedidos de los comercios registrados.</span>
      </div>
    </div>
  );
};
