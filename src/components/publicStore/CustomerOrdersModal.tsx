import React, { useState } from 'react';
import { History, ShoppingBag, Calendar, MessageCircle, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { getCustomerPlacedOrders, getCustomerAppointments } from './cartStorage';
import { PlacedOrderRecord } from './types';
import { AppointmentRequest } from '../../types';

interface CustomerOrdersModalProps {
  tenantId: string;
  storeName: string;
  storeWhatsapp: string;
  onClose: () => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  tenantId,
  storeName,
  storeWhatsapp,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'appointments'>('orders');

  const allOrders = getCustomerPlacedOrders();
  const storeOrders = allOrders.filter((o) => o.tenantId === tenantId);

  const allAppointments = getCustomerAppointments();
  const storeAppointments = allAppointments.filter((a) => a.tenant_id === tenantId);

  const cleanWhatsapp = (storeWhatsapp || '').replace(/\D/g, '');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmado / Completado</span>
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Pendiente de Confirmación</span>
          </span>
        );
      case 'rechazada':
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>Cancelado / Rechazado</span>
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Clock className="w-3 h-3" />
            <span>En Preparación</span>
          </span>
        );
      case 'despachado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Despachado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Mis Pedidos & Reservas ({storeName})</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-semibold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Pestañas Pedidos vs Citas */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pedidos Realizados ({storeOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Citas Solicitadas ({storeAppointments.length})</span>
          </button>
        </div>

        {/* Lista con scroll */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'orders' && (
            storeOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-300">Aún no tienes pedidos en este comercio</p>
                <p className="text-xs text-slate-500">Tus compras realizadas como invitado se guardarán aquí automáticamente.</p>
              </div>
            ) : (
              storeOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {order.orderNumber}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {new Date(order.createdAt).toLocaleString('es-BO')}
                      </p>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Resumen de artículos */}
                  <div className="space-y-1 text-xs text-slate-300 border-t border-b border-slate-800/60 py-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {it.quantity}x {it.name}
                          {it.selectedSize ? ` (Talla: ${it.selectedSize})` : ''}
                          {it.selectedColor ? ` (Color: ${it.selectedColor.name})` : ''}
                        </span>
                        <span className="font-mono font-medium">Bs {(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Total: </span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        Bs {order.total.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        ({order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup en Tienda'})
                      </span>
                    </div>

                    {cleanWhatsapp && (
                      <a
                        href={`https://wa.me/${cleanWhatsapp.startsWith('591') ? cleanWhatsapp : '591' + cleanWhatsapp}?text=${encodeURIComponent(`Hola ${storeName}, consulto por el estado de mi pedido ${order.orderNumber}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-medium transition"
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
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-300">No tienes citas solicitadas en este comercio</p>
                <p className="text-xs text-slate-500">Al solicitar una cita para un servicio, podrás consultar su confirmación aquí.</p>
              </div>
            ) : (
              storeAppointments.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">
                      {app.serviceName}
                    </span>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <p>
                      <span className="text-slate-400">Profesional: </span>
                      <span className="font-semibold text-slate-200">{app.professionalName}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Fecha y Hora: </span>
                      <span className="font-mono text-indigo-300 font-semibold">{app.date} a las {app.time}</span>
                    </p>
                    {app.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        "{app.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[10px] text-amber-400/90 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Sujeto a confirmación por el profesional</span>
                    </span>

                    {cleanWhatsapp && (
                      <a
                        href={`https://wa.me/${cleanWhatsapp.startsWith('591') ? cleanWhatsapp : '591' + cleanWhatsapp}?text=${encodeURIComponent(`Hola ${storeName}, consulto por mi solicitud de cita para ${app.serviceName} el día ${app.date} a las ${app.time}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-medium transition"
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
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
