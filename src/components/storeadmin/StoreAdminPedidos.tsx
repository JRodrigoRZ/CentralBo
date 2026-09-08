import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  AlertCircle,
  CreditCard,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  User,
  Filter,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Store, Order, OrderStatus } from '../../types';
import {
  getStoreOrders,
  updateOrderStatus,
} from '../../lib/storeAdminService';

interface StoreAdminPedidosProps {
  store: Store;
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

const ALL_STATUSES: OrderStatus[] = [
  'pendiente',
  'recibido',
  'pagado',
  'en_preparacion',
  'despachado',
  'completado',
  'cancelado',
];

export const StoreAdminPedidos: React.FC<StoreAdminPedidosProps> = ({ store }) => {
  const [orders, setOrders] = useState<Order[]>(() => getStoreOrders(store.id));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_phone && o.customer_phone.includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const result = updateOrderStatus(store.id, orderId, newStatus);
    if (result.success && result.order) {
      const updatedList = orders.map((o) => (o.id === orderId ? result.order! : o));
      setOrders(updatedList);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(result.order);
      }
      setNotification(`Pedido #${orderId.slice(-4).toUpperCase()} actualizado a "${ORDER_STATUS_META[newStatus].label}".`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <span>Gestión de Pedidos de la Tienda</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {orders.length} pedidos
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Control de órdenes y actualización de los 7 estados de despacho para{' '}
            <strong className="text-indigo-300">{store.name}</strong>
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filtros por Estado */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Todos ({orders.length})
            </button>

            {ALL_STATUSES.map((st) => {
              const meta = ORDER_STATUS_META[st];
              const count = orders.filter((o) => o.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1 ${
                    statusFilter === st
                      ? `${meta.bg} ${meta.color} font-bold`
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{meta.label}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-950/30 border border-dashed border-slate-800 space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-white">No hay pedidos en este estado</p>
          <p className="text-xs text-slate-400">
            Ajusta los filtros para visualizar pedidos anteriores o completados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const meta = ORDER_STATUS_META[ord.status];
            const Icon = meta.icon;
            const dateStr = new Date(ord.created_at).toLocaleString('es-BO', {
              dateStyle: 'short',
              timeStyle: 'short',
            });

            return (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Datos del Pedido */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-black text-indigo-300">
                      #{ord.id.slice(-4).toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {ord.customer_name || 'Cliente Particular'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${meta.bg} ${meta.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{meta.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span>
                      Fecha: <strong className="text-slate-300">{dateStr}</strong>
                    </span>
                    {ord.customer_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <strong className="text-emerald-300">{ord.customer_phone}</strong>
                      </span>
                    )}
                    {ord.customer_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-cyan-400" />
                        <span>{ord.customer_email}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Importe y Selector Rápido de Estado */}
                <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-base font-black text-emerald-400">
                      Bs {ord.total}
                    </span>
                  </div>

                  {/* Selector del nuevo estado */}
                  <div className="flex items-center gap-2">
                    <select
                      value={ord.status}
                      onChange={(e) =>
                        handleStatusChange(ord.id, e.target.value as OrderStatus)
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {ORDER_STATUS_META[st].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
