import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  BadgePercent,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  XCircle,
  CreditCard,
  ChefHat,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Store, OrderStatus, Order } from '../../types';
import { fetchStoreOrders } from '../../lib/storeAdminService';

interface InicioResumenProps {
  store: Store;
  onNavigateTab: (tab: 'pedidos' | 'catalogo' | 'estadisticas') => void;
}

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  pendiente: {
    label: 'Pendiente',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/40',
  },
  recibido: {
    label: 'Recibido',
    icon: AlertCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/40',
  },
  pagado: {
    label: 'Pagado',
    icon: CreditCard,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/40',
  },
  en_preparacion: {
    label: 'En preparación',
    icon: ChefHat,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-800/40',
  },
  despachado: {
    label: 'Despachado',
    icon: Truck,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-200/80 dark:border-cyan-800/40',
  },
  completado: {
    label: 'Completado',
    icon: CheckCircle2,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-200/80 dark:border-teal-800/40',
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/40',
  },
};

export const InicioResumen: React.FC<InicioResumenProps> = ({ store, onNavigateTab }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const storeOrders = await fetchStoreOrders(store.id);
      setOrders(storeOrders);
    } catch (err: any) {
      console.error('[InicioResumen] Error al cargar pedidos reales:', err);
      setLoadError(err?.message || 'No se pudieron sincronizar los pedidos del comercio.');
    } finally {
      setIsLoading(false);
    }
  }, [store.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ventas totales en Bs (pedidos no cancelados)
  const totalSales = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.total, 0);

  // Total de pedidos no cancelados
  const validOrdersCount = orders.filter((o) => o.status !== 'cancelado').length;

  // Ticket promedio en Bolivianos
  const avgTicket = validOrdersCount > 0 ? totalSales / validOrdersCount : 0;

  // Pedidos completados
  const completedOrdersCount = orders.filter((o) => o.status === 'completado').length;

  // Conteo por cada estado canónico de pedido
  const ordersByStatus: Record<OrderStatus, number> = {
    pendiente: 0,
    recibido: 0,
    pagado: 0,
    en_preparacion: 0,
    despachado: 0,
    completado: 0,
    cancelado: 0,
  };

  orders.forEach((o) => {
    if (ordersByStatus[o.status] !== undefined) {
      ordersByStatus[o.status] += 1;
    }
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Encabezado con contextualización y botón de sincronización */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Resumen Operativo de la Tienda</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas de actividad, volumen comercial y estado de pedidos de{' '}
            <strong className="text-blue-600 dark:text-blue-400 font-semibold">{store.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/40 font-medium">
            Moneda: Bolivianos (Bs)
          </span>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Actualizar datos desde base de datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Estados de Carga y Error */}
      {isLoading ? (
        <div className="p-10 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Cargando métricas y pedidos reales del comercio...</p>
        </div>
      ) : loadError ? (
        <div className="p-6 text-center rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 space-y-2.5 text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-7 h-7 text-rose-500 mx-auto" />
          <p className="text-sm font-semibold">Error al cargar el resumen del comercio</p>
          <p className="text-xs text-rose-700/80 dark:text-rose-300/80">{loadError}</p>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Tarjetas Principales de Resumen (Solo métricas reales trazables) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Pedidos (Acento azul suave) */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-200 dark:hover:border-blue-900/60 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pedidos
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {orders.length}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {completedOrdersCount} completados
              </p>
            </div>

            {/* 2. Ventas Totales (Acento verde suave) */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-200 dark:hover:border-emerald-900/60 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ventas Totales
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                Bs {totalSales.toLocaleString('es-BO')}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pedidos no cancelados</p>
            </div>

            {/* 3. Ticket Promedio (Acento amarillo/ámbar suave) */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-200 dark:hover:border-amber-900/60 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ticket Promedio
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BadgePercent className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Bs {avgTicket.toFixed(1)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Promedio por orden válida</p>
            </div>
          </div>

          {/* Estados de Pedidos (7 estados canónicos con datos reales) */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Estados de Pedidos</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    ({orders.length} {orders.length === 1 ? 'registrado' : 'totales registrados'})
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Control de flujo de atención y despacho de compras
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('pedidos')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition cursor-pointer"
              >
                <span>Gestionar Pedidos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
              {(
                [
                  'pendiente',
                  'recibido',
                  'pagado',
                  'en_preparacion',
                  'despachado',
                  'completado',
                  'cancelado',
                ] as OrderStatus[]
              ).map((st) => {
                const meta = ORDER_STATUS_META[st];
                const Icon = meta.icon;
                const count = ordersByStatus[st] || 0;

                return (
                  <div
                    key={st}
                    className={`p-2.5 rounded-xl border ${meta.bg} flex flex-col justify-between transition-shadow hover:shadow-2xs`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Últimos Pedidos Recientes Reales */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Últimos Pedidos Recientes</span>
              </h3>
              {orders.length > 0 && (
                <button
                  onClick={() => onNavigateTab('pedidos')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition cursor-pointer"
                >
                  Ver Todos
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
                <ShoppingBag className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">No hay pedidos recientes registrados</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Cuando tus clientes completen pedidos desde la tienda pública, se sincronizarán aquí automáticamente.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {orders.slice(0, 5).map((ord) => {
                  const meta = ORDER_STATUS_META[ord.status] || ORDER_STATUS_META.pendiente;
                  const dateFormatted = ord.created_at
                    ? new Date(ord.created_at).toLocaleTimeString('es-BO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--';

                  return (
                    <div
                      key={ord.id}
                      className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                            #{ord.id.slice(-4).toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {ord.customer_name || 'Cliente'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Hora: {dateFormatted} • Tel: {ord.customer_phone || 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Bs {ord.total}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${meta.bg} ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

