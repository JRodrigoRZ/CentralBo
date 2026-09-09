import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
  ChevronDown,
  ChevronUp,
  Receipt,
  Store as StoreIcon,
} from 'lucide-react';
import { SUPERADMIN_STORES } from '../../lib/superadminService';
import { SubscriptionStatus } from '../../types';

const statusBadgeStyles: Record<SubscriptionStatus, { label: string; bg: string; text: string; border: string }> = {
  activa: { label: 'Activa / Al Día', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  prueba: { label: 'Periodo de Prueba', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  vencida: { label: 'Vencida', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  cancelada: { label: 'Cancelada', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export const SuperAdminSubscriptions: React.FC = () => {
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const toggleExpand = (storeId: string) => {
    setExpandedStoreId(expandedStoreId === storeId ? null : storeId);
  };

  const filteredStores = SUPERADMIN_STORES.filter((store) => {
    if (statusFilter !== 'todos' && store.subscription.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado y Filtro de Suscripciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Suscripciones de Comercios</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {filteredStores.length} Registros
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Seguimiento de planes, vigencia, estado de renovación e historial de pagos.
          </p>
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="subscription-status-filter" className="text-slate-400">Estado:</label>
          <select
            id="subscription-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="activa">Activas / Al Día</option>
            <option value="prueba">En Prueba</option>
            <option value="vencida">Vencidas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Lista de Suscripciones con Acordeón de Historial de Pagos */}
      <div className="space-y-3">
        {filteredStores.map((store) => {
          const sub = store.subscription;
          const badge = statusBadgeStyles[sub.status] || statusBadgeStyles.activa;
          const isExpanded = expandedStoreId === store.id;

          return (
            <div
              key={store.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
            >
              {/* Fila Principal */}
              <div
                onClick={() => toggleExpand(store.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{store.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-indigo-400 font-medium">Plan {sub.planName}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-slate-400">Ciclo {sub.billingCycle}</span>
                    </div>
                  </div>
                </div>

                {/* Datos de Fechas y Estado */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Inicio</span>
                    <span className="font-mono text-slate-300">{sub.startDate}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Renovación</span>
                    <span className="font-mono text-cyan-300 font-semibold">{sub.renewalDate}</span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Detalle Desplegable: Historial de Pagos */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/60">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Historial de Pagos Registrados</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {sub.paymentHistory.length} comprobante(s)
                    </span>
                  </div>

                  {sub.paymentHistory.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      Sin registros de pago aún.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">Fecha</th>
                            <th className="py-2.5 px-3">Período</th>
                            <th className="py-2.5 px-3">Monto</th>
                            <th className="py-2.5 px-3">Referencia</th>
                            <th className="py-2.5 px-3 text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {sub.paymentHistory.map((pay) => (
                            <tr key={pay.id} className="hover:bg-slate-900/40">
                              <td className="py-2.5 px-3 font-mono text-[11px]">{pay.date}</td>
                              <td className="py-2.5 px-3 text-slate-200">{pay.period}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                                {pay.currency} {pay.amount}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                                {pay.reference}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completado
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-3 text-[11px] text-slate-500">
                    * Registro informativo de facturación y conciliación manual de suscripciones.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
