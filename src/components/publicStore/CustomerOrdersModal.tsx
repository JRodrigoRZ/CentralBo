import React, { useState } from 'react';
import { History, ShoppingBag, Calendar, MessageCircle, Clock, CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';
import { getCustomerPlacedOrders, getCustomerAppointments } from './cartStorage';
import { PlacedOrderRecord } from './types';
import { AppointmentRequest } from '../../types';

interface CustomerOrdersModalProps {
  tenantId: string;
  storeName: string;
  storeWhatsapp: string;
  onClose: () => void;
  primaryColor?: string;
}

// Cálculo de contraste WCAG AA
function getContrastColor(hexColor?: string): '#ffffff' | '#18181b' {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  let c = hexColor.substring(1);
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return '#ffffff';
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#18181b' : '#ffffff';
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  tenantId,
  storeName,
  storeWhatsapp,
  onClose,
  primaryColor = '#4f46e5',
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'appointments'>('orders');

  const storeOrders = getCustomerPlacedOrders(tenantId);
  const storeAppointments = getCustomerAppointments(tenantId);
  const contrastColor = getContrastColor(primaryColor);

  const cleanWhatsapp = (storeWhatsapp || '').replace(/\D/g, '');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmado / Completado</span>
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Pendiente de Confirmación</span>
          </span>
        );
      case 'rechazada':
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>Cancelado / Rechazado</span>
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">
            <Clock className="w-3 h-3" />
            <span>En Preparación</span>
          </span>
        );
      case 'despachado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Despachado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/80 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-sm sm:text-base">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
            >
              <History className="w-4 h-4" />
            </div>
            <span className="truncate">Mis Pedidos & Reservas ({storeName})</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas Pedidos vs Citas */}
        <div className="flex items-center gap-2 p-1 bg-stone-100 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'orders'
                ? 'shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
            style={
              activeTab === 'orders'
                ? { backgroundColor: primaryColor, color: contrastColor }
                : undefined
            }
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pedidos Realizados ({storeOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'appointments'
                ? 'shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
            style={
              activeTab === 'appointments'
                ? { backgroundColor: primaryColor, color: contrastColor }
                : undefined
            }
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Citas Solicitadas ({storeAppointments.length})</span>
          </button>
        </div>

        {/* Lista con scroll */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'orders' && (
            storeOrders.length === 0 ? (
              <div className="py-12 text-center text-stone-400 dark:text-stone-500 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Aún no tienes pedidos en este comercio</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">Tus compras realizadas como invitado se guardarán aquí automáticamente en este navegador.</p>
              </div>
            ) : (
              storeOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-stone-50/80 dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: primaryColor }}
                      >
                        {order.orderNumber}
                      </span>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {new Date(order.createdAt).toLocaleString('es-BO')}
                      </p>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Resumen de artículos */}
                  <div className="space-y-1 text-xs text-stone-700 dark:text-stone-300 border-t border-b border-stone-200/80 dark:border-stone-800/80 py-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="truncate">
                          {it.quantity}x {it.name}
                          {it.selectedSize ? ` (Talla: ${it.selectedSize})` : ''}
                          {it.selectedColor ? ` (Color: ${it.selectedColor.name})` : ''}
                        </span>
                        <span className="font-mono font-medium shrink-0">Bs {(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">Total: </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        Bs {order.total.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-2">
                        ({order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup en Tienda'})
                      </span>
                    </div>

                    {cleanWhatsapp && (
                      <a
                        href={`https://wa.me/${cleanWhatsapp.startsWith('591') ? cleanWhatsapp : '591' + cleanWhatsapp}?text=${encodeURIComponent(`Hola ${storeName}, consulto por el estado de mi pedido ${order.orderNumber}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition border border-emerald-500/30"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Consultar por WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'appointments' && (
            storeAppointments.length === 0 ? (
              <div className="py-12 text-center text-stone-400 dark:text-stone-500 space-y-2">
                <Calendar className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">No tienes citas solicitadas en este comercio</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">Al solicitar una cita para un servicio, podrás consultar su estado y confirmación aquí.</p>
              </div>
            ) : (
              storeAppointments.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl bg-stone-50/80 dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-white">
                      {app.serviceName}
                    </span>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>

                  <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1">
                    <p>
                      <span className="text-stone-500 dark:text-stone-400">Profesional: </span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">{app.professionalName}</span>
                    </p>
                    <p>
                      <span className="text-stone-500 dark:text-stone-400">Fecha y Hora: </span>
                      <span className="font-mono font-semibold" style={{ color: primaryColor }}>{app.date} a las {app.time}</span>
                    </p>
                    {app.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                        "{app.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Sujeto a confirmación por el profesional</span>
                    </span>

                    {cleanWhatsapp && (
                      <a
                        href={`https://wa.me/${cleanWhatsapp.startsWith('591') ? cleanWhatsapp : '591' + cleanWhatsapp}?text=${encodeURIComponent(`Hola ${storeName}, consulto por mi solicitud de cita para ${app.serviceName} el día ${app.date} a las ${app.time}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition border border-emerald-500/30"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Consultar Cita</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Pie */}
        <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
