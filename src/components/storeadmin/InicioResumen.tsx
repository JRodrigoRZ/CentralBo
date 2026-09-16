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
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  recibido: {
    label: 'Recibido',
    icon: AlertCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  pagado: {
    label: 'Pagado',
    icon: CreditCard,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  en_preparacion: {
    label: 'En preparación',
    icon: ChefHat,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  despachado: {
    label: 'Despachado',
    icon: Truck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  completado: {
    label: 'Completado',
    icon: CheckCircle2,
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
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
    <div className="space-y-6">
      {/* Encabezado con contextualización y botón de sincronización */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <span>Resumen Operativo de la Tienda</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de actividad, volumen comercial y estado de pedidos de{' '}
            <strong className="text-indigo-300">{store.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
            Moneda: Bolivianos (Bs)
          </span>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Actualizar datos desde base de datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Estados de Carga y Error */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-3">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Cargando métricas y pedidos reales del comercio...</p>
        </div>
      ) : loadError ? (
        <div className="p-8 text-center rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3 text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm font-semibold">Error al cargar el resumen del comercio</p>
          <p className="text-xs text-rose-300/80">{loadError}</p>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs hover:border-slate-500 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Tarjetas Principales de Resumen (Solo métricas reales trazables) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Pedidos */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pedidos</span>
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {orders.length}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {completedOrdersCount} completados
              </p>
            </div>

            {/* 2. Ventas Totales */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider">Ventas Totales</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                Bs {totalSales.toLocaleString('es-BO')}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Pedidos no cancelados</p>
            </div>

            {/* 3. Ticket Promedio */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider">Ticket Promedio</span>
                <BadgePercent className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                Bs {avgTicket.toFixed(1)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Promedio por orden válida</p>
            </div>
          </div>

          {/* Estados de Pedidos (7 estados canónicos con datos reales) */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Estados de Pedidos</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({orders.length} {orders.length === 1 ? 'registrado' : 'totales registrados'})
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Control de flujo de atención y despacho de compras
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('pedidos')}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-medium"
              >
                <span>Gestionar Pedidos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
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
                    className={`p-3 rounded-xl border ${meta.bg} flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                      <span className="text-base sm:text-lg font-extrabold text-white">
                        {count}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 truncate">
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Últimos Pedidos Recientes Reales */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span>Últimos Pedidos Recientes</span>
              </h3>
              {orders.length > 0 && (
                <button
                  onClick={() => onNavigateTab('pedidos')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  Ver Todos
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800/80 space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-semibold text-white">No hay pedidos recientes registrados</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Cuando tus clientes completen pedidos desde la tienda pública, se sincronizarán aquí automáticamente.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
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
                      className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-indigo-300 font-semibold">
                            #{ord.id.slice(-4).toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {ord.customer_name || 'Cliente'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Hora: {dateFormatted} • Tel: {ord.customer_phone || 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="text-xs font-bold text-white">
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

