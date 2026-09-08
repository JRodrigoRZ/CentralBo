import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Building2,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  CreditCard,
  Banknote,
  ShieldCheck,
} from 'lucide-react';
import {
  Store as StoreModel,
  StoreProfileSettings,
  StoreShippingSettings,
  StoreScheduledOrdersSettings,
  StorePaymentSettings,
  PromotionCode,
  Order,
  OrderStatus,
} from '../../types';
import { CartItem, CheckoutDeliveryMethod, CheckoutPaymentMethod, PlacedOrderRecord } from './types';
import {
  getStorePromotions,
  getStoreOrders,
  saveStoreOrders,
  getStorePaymentSettings,
} from '../../lib/storeAdminService';
import {
  getSavedCustomerProfile,
  saveCustomerProfile,
  recordCustomerPlacedOrder,
  clearTenantCart,
} from './cartStorage';

interface CheckoutModalProps {
  store: StoreModel;
  profile: StoreProfileSettings;
  shippingSettings: StoreShippingSettings;
  scheduledSettings: StoreScheduledOrdersSettings;
  paymentSettings?: StorePaymentSettings | null;
  items: CartItem[];
  onClose: () => void;
  onOrderCompleted: () => void;
  primaryColor?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  store,
  profile,
  shippingSettings,
  scheduledSettings,
  paymentSettings,
  items,
  onClose,
  onOrderCompleted,
  primaryColor = '#4f46e5',
}) => {
  const savedProfile = getSavedCustomerProfile();

  const effectivePaymentSettings = paymentSettings || getStorePaymentSettings(store.id);

  // Opciones de pago configuradas y habilitadas por el comercio
  // Solo son configurables: QR Simple, Transferencia Bancaria, Efectivo Contraentrega.
  // WhatsApp NO es un método de pago, es canal obligatorio de coordinación.
  const availablePaymentOptions: {
    id: CheckoutPaymentMethod;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }[] = [];

  if (effectivePaymentSettings.qrSimple) {
    availablePaymentOptions.push({
      id: 'qr',
      label: 'QR Simple',
      sub: 'Cobro por código QR',
      icon: <QrCode className="w-5 h-5 text-indigo-400 shrink-0" />,
    });
  }

  if (effectivePaymentSettings.bankTransfer) {
    availablePaymentOptions.push({
      id: 'transferencia',
      label: 'Transferencia Bancaria',
      sub: 'Transferencia directa',
      icon: <CreditCard className="w-5 h-5 text-cyan-400 shrink-0" />,
    });
  }

  if (effectivePaymentSettings.cashOnDelivery) {
    availablePaymentOptions.push({
      id: 'contra_entrega',
      label: 'Efectivo Contraentrega',
      sub: 'Pago en efectivo al recibir',
      icon: <Banknote className="w-5 h-5 text-emerald-400 shrink-0" />,
    });
  }

  // Datos del cliente
  const [customerName, setCustomerName] = useState(savedProfile?.name || '');
  const [phone, setPhone] = useState(savedProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(savedProfile?.whatsapp || savedProfile?.phone || '');
  const [email, setEmail] = useState(savedProfile?.email || '');
  const [saveProfile, setSaveProfile] = useState(true);

  // Método de entrega
  const [deliveryMethod, setDeliveryMethod] = useState<CheckoutDeliveryMethod>(
    shippingSettings.offersShipping ? 'delivery' : 'pickup'
  );
  const [deliveryAddress, setDeliveryAddress] = useState(savedProfile?.address || '');
  const [deliveryReference, setDeliveryReference] = useState(savedProfile?.reference || '');
  const [pickupNotes, setPickupNotes] = useState('');

  // Pedidos programados
  const [isScheduled, setIsScheduled] = useState(false);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(defaultDateStr);
  const [scheduledSlot, setScheduledSlot] = useState(
    scheduledSettings.availableSlots[0] || '12:00 - 13:00'
  );

  // Método de pago (solo métodos habilitados por este comercio; WhatsApp no es un método configurable)
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(() => {
    return availablePaymentOptions.length > 0 ? availablePaymentOptions[0].id : 'acordado';
  });

  useEffect(() => {
    if (availablePaymentOptions.length > 0) {
      if (!availablePaymentOptions.some((opt) => opt.id === paymentMethod)) {
        setPaymentMethod(availablePaymentOptions[0].id);
      }
    } else {
      setPaymentMethod('acordado');
    }
  }, [
    effectivePaymentSettings.qrSimple,
    effectivePaymentSettings.bankTransfer,
    effectivePaymentSettings.cashOnDelivery,
  ]);

  // Promociones
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromotionCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  // Notas adicionales
  const [generalNotes, setGeneralNotes] = useState('');

  // Estado del proceso
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Cálculo de importes
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  // Costo de envío según configuración del comercio (sin cálculos automáticos externos)
  let shippingCost = 0;
  if (deliveryMethod === 'delivery' && shippingSettings.offersShipping) {
    if (shippingSettings.shippingType === 'fixed') {
      // Si configuró mínimo para envío gratis
      if (
        shippingSettings.minOrderAmount > 0 &&
        subtotal >= shippingSettings.minOrderAmount
      ) {
        shippingCost = 0; // Envío gratuito por superar monto mínimo
      } else {
        shippingCost = shippingSettings.fixedCost;
      }
    } else {
      shippingCost = 0;
    }
  }

  // Cálculo de descuento
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discountAmount = (subtotal * appliedPromo.discountValue) / 100;
    } else {
      discountAmount = Math.min(appliedPromo.discountValue, subtotal);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Aplicar código promocional
  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccessMsg(null);

    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Ingresa un código promocional.');
      return;
    }

    const promos = getStorePromotions(store.id);
    const found = promos.find((p) => p.code.toUpperCase() === code && p.isActive);

    if (!found) {
      setPromoError('El código promocional no existe o ya no está activo.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (found.startDate && todayStr < found.startDate) {
      setPromoError('Esta promoción aún no ha iniciado.');
      return;
    }
    if (found.endDate && todayStr > found.endDate) {
      setPromoError('Esta promoción ha vencido.');
      return;
    }

    if (found.minPurchase > 0 && subtotal < found.minPurchase) {
      setPromoError(`Compra mínima requerida de Bs ${found.minPurchase.toFixed(2)} para aplicar este cupón.`);
      return;
    }

    setAppliedPromo(found);
    setPromoSuccessMsg(
      found.discountType === 'percentage'
        ? `¡Descuento del ${found.discountValue}% aplicado con éxito!`
        : `¡Descuento de Bs ${found.discountValue.toFixed(2)} aplicado con éxito!`
    );
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
    setPromoSuccessMsg(null);
  };

  // Enviar pedido
  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Por favor ingresa tu nombre.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Por favor ingresa un número de teléfono de contacto.');
      return;
    }
    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      setFormError('Por favor ingresa la dirección de entrega.');
      return;
    }
    if (availablePaymentOptions.length > 0 && !availablePaymentOptions.some((opt) => opt.id === paymentMethod)) {
      setFormError('Por favor selecciona un método de pago disponible.');
      return;
    }

    setIsProcessing(true);

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = `order-${Date.now()}`;

    // Crear registro en la persistencia del tenant
    const newTenantOrder: Order = {
      id: orderId,
      tenant_id: store.id,
      customer_id: null, // Compra como invitado
      customer_name: customerName.trim(),
      customer_email: email.trim() || null,
      customer_phone: phone.trim(),
      status: 'pendiente' as OrderStatus,
      total: Number(finalTotal.toFixed(2)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existingOrders = getStoreOrders(store.id);
    saveStoreOrders(store.id, [newTenantOrder, ...existingOrders]);

    // Crear registro completo para el cliente local
    const clientOrderRecord: PlacedOrderRecord = {
      id: orderId,
      orderNumber: orderNumber,
      tenantId: store.id,
      storeName: store.name,
      storeSlug: store.slug || '',
      storePhone: profile.phone || '',
      storeWhatsapp: profile.whatsapp || profile.phone || '',
      items: items,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discountAmount.toFixed(2)),
      shippingCost: Number(shippingCost.toFixed(2)),
      total: Number(finalTotal.toFixed(2)),
      deliveryMethod: deliveryMethod,
      deliveryAddress: deliveryAddress.trim() || undefined,
      deliveryReference: deliveryReference.trim() || undefined,
      pickupNotes: pickupNotes.trim() || undefined,
      isScheduled: isScheduled,
      scheduledDate: isScheduled ? scheduledDate : undefined,
      scheduledSlot: isScheduled ? scheduledSlot : undefined,
      paymentMethod: paymentMethod,
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim(),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
    };

    recordCustomerPlacedOrder(clientOrderRecord);

    // Guardar perfil local si está tildado
    if (saveProfile) {
      saveCustomerProfile({
        name: customerName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        address: deliveryAddress.trim(),
        reference: deliveryReference.trim(),
        city: 'La Paz',
      });
    }

    // Limpiar carrito del tenant
    clearTenantCart(store.id);

    setPlacedOrder(clientOrderRecord);
    setIsProcessing(false);
    onOrderCompleted();
  };

  // Generar texto para WhatsApp
  const cleanWhatsapp = (profile.whatsapp || profile.phone || '').replace(/\D/g, '');

  const generateWhatsAppMessage = (order: PlacedOrderRecord) => {
    let text = `¡Hola *${order.storeName}*! 👋 Acabo de realizar el pedido *#${order.orderNumber}* a través de su tienda en CentralBo:\n\n`;

    text += `📋 *DETALLE DEL PEDIDO:*\n`;
    order.items.forEach((it) => {
      text += `• ${it.quantity}x ${it.name}`;
      if (it.selectedSize) text += ` (Talla: ${it.selectedSize})`;
      if (it.selectedColor) text += ` (Color: ${it.selectedColor.name})`;
      if (it.selectedModifiers && it.selectedModifiers.length > 0) {
        text += ` [${it.selectedModifiers.map((m) => m.name).join(', ')}]`;
      }
      text += ` - Bs ${(it.price * it.quantity).toFixed(2)}\n`;
      if (it.kitchenNotes) {
        text += `  └ Nota: "${it.kitchenNotes}"\n`;
      }
    });

    text += `\n💵 *RESUMEN DE PAGO:*\n`;
    text += `• Subtotal: Bs ${order.subtotal.toFixed(2)}\n`;
    if (order.discount > 0) {
      text += `• Descuento: -Bs ${order.discount.toFixed(2)}\n`;
    }
    if (order.deliveryMethod === 'delivery') {
      text += `• Envío a Domicilio: Bs ${order.shippingCost.toFixed(2)}\n`;
    } else {
      text += `• Retiro en Local: Gratis\n`;
    }
    text += `*TOTAL A PAGAR: Bs ${order.total.toFixed(2)}*\n\n`;

    text += `📍 *MÉTODO DE ENTREGA:*\n`;
    if (order.deliveryMethod === 'delivery') {
      text += `Delivery a Domicilio\n`;
      text += `Dirección: ${order.deliveryAddress}\n`;
      if (order.deliveryReference) text += `Referencia: ${order.deliveryReference}\n`;
    } else {
      text += `Retiro en Tienda Física / Pickup\n`;
      if (order.pickupNotes) text += `Detalle: ${order.pickupNotes}\n`;
    }

    if (order.isScheduled) {
      text += `\n⏰ *PEDIDO PROGRAMADO:*\nFecha: ${order.scheduledDate}\nHorario: ${order.scheduledSlot}\n`;
    }

    text += `\n👤 *DATOS DEL CLIENTE:*\n`;
    text += `Nombre: ${order.customerName}\n`;
    text += `Teléfono: ${order.customerPhone}\n`;

    text += `\n💳 *MÉTODO DE PAGO INDICADO:*\n`;
    switch (order.paymentMethod) {
      case 'qr':
        text += `Pago con QR Simple\n`;
        break;
      case 'transferencia':
        text += `Transferencia Bancaria Directa\n`;
        break;
      case 'contra_entrega':
        text += `Pago Contra Entrega (Efectivo)\n`;
        break;
      case 'acordado':
        text += `Pago a Coordinar por WhatsApp\n`;
        break;
    }

    text += `\n¡Quedo atento a su confirmación para coordinar el pago y la entrega! Muchas gracias.`;

    return text;
  };

  // Pantalla de Confirmación de Pedido (Sección 8)
  if (placedOrder) {
    const waText = generateWhatsAppMessage(placedOrder);
    const waUrl = cleanWhatsapp
      ? `https://wa.me/${cleanWhatsapp.startsWith('591') ? cleanWhatsapp : '591' + cleanWhatsapp}?text=${encodeURIComponent(waText)}`
      : null;

    const copySummary = () => {
      navigator.clipboard.writeText(waText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 text-center max-h-[92vh] overflow-y-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Pedido #{placedOrder.orderNumber}
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              ¡Pedido Registrado con Éxito!
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Tu pedido ha sido registrado en el sistema de <strong>{store.name}</strong>. Para finalizar la coordinación y el despacho, comunícate directamente con el comercio mediante WhatsApp.
            </p>
          </div>

          {/* Resumen del pedido */}
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400">Total a Pagar:</span>
              <span className="font-mono font-extrabold text-emerald-400 text-base">
                Bs {placedOrder.total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <p>
                <span className="text-slate-500">Entrega: </span>
                <span className="font-semibold text-white">
                  {placedOrder.deliveryMethod === 'delivery' ? 'Delivery a Domicilio' : 'Retiro en Local (Pickup)'}
                </span>
              </p>
              {placedOrder.deliveryAddress && (
                <p>
                  <span className="text-slate-500">Dirección: </span>
                  <span>{placedOrder.deliveryAddress}</span>
                </p>
              )}
              {placedOrder.isScheduled && (
                <p className="text-indigo-400 font-semibold">
                  Pedido Programado: {placedOrder.scheduledDate} ({placedOrder.scheduledSlot})
                </p>
              )}
              <p>
                <span className="text-slate-500">Método de Pago: </span>
                <span className="capitalize font-semibold text-slate-200">
                  {placedOrder.paymentMethod === 'qr' ? 'Cobro con QR Simple' :
                   placedOrder.paymentMethod === 'transferencia' ? 'Transferencia Bancaria Directa' :
                   placedOrder.paymentMethod === 'contra_entrega' ? 'Efectivo Contraentrega' : 'Coordinación por WhatsApp'}
                </span>
              </p>
            </div>

            {/* Ítems */}
            <div className="border-t border-slate-800 pt-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Artículos:</span>
              {placedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                  <span>
                    {it.quantity}x {it.name}
                    {it.selectedSize ? ` (${it.selectedSize})` : ''}
                  </span>
                  <span className="font-mono">Bs {(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Información y botón principal de WhatsApp */}
          <div className="space-y-3 pt-2">
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Pedido por WhatsApp al Comercio</span>
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                El comercio no tiene configurado número de WhatsApp directo. Por favor contacta al teléfono {profile.phone}.
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copySummary}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Resumen Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Resumen</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Cabecera modal */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white">Checkout — Finalizar Pedido</h3>
            <p className="text-[11px] text-emerald-400 font-medium">
              Compra como Invitado • Sin Registro Obligatorio
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-6">
            {/* 1. INFORMACIÓN DEL CLIENTE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                1. Información de Contacto
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-semibold">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Rodrigo Mendoza"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-semibold">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!whatsapp) setWhatsapp(e.target.value);
                    }}
                    placeholder="Ej. 77234567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">
                  Email (Opcional para comprobante)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.bo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveProfile}
                  onChange={(e) => setSaveProfile(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-0 cursor-pointer"
                />
                <span>Recordar mis datos en este navegador para futuras compras rápidas</span>
              </label>
            </div>

            {/* 2. MÉTODO DE ENTREGA */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                2. Método de Entrega
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                    deliveryMethod === 'delivery'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Truck className="w-4 h-4 text-indigo-400" />
                    <span>Envío a Domicilio</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {shippingSettings.shippingType === 'fixed'
                      ? `Costo fijado por tienda: Bs ${shippingSettings.fixedCost.toFixed(2)}`
                      : 'Envío gratuito'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                    deliveryMethod === 'pickup'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span>Retiro en Local (Pickup)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Sin costo adicional • Gratis
                  </span>
                </button>
              </div>

              {/* Campos específicos de Delivery */}
              {deliveryMethod === 'delivery' && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-semibold">
                      Dirección de Entrega Completa *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Ej. Calle 21 de Calacoto #450, Edif. Los Pinos Dpto 3B"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">
                      Punto de Referencia / Indicaciones
                    </label>
                    <input
                      type="text"
                      value={deliveryReference}
                      onChange={(e) => setDeliveryReference(e.target.value)}
                      placeholder="Ej. Frente a la plaza principal, portón negro"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Campos de Pickup */}
              {deliveryMethod === 'pickup' && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Dirección de Retiro:</p>
                  <p className="text-slate-400">{profile.address || 'Consultar dirección exacta por WhatsApp'}</p>
                  <div className="pt-1">
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Hora estimada o persona que retira:
                    </label>
                    <input
                      type="text"
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                      placeholder="Ej. Paso en 40 minutos / Retira mi hermano Juan"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. PEDIDOS PROGRAMADOS (Si el comercio los tiene habilitados) */}
            {scheduledSettings.enabled && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      3. Programación de Pedido
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ¿Deseas recibir o retirar tu pedido en una fecha y franja horaria específica?
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                {isScheduled && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3 animate-in fade-in duration-150">
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Configurar Pedido Programado</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Fecha de Entrega/Retiro:</label>
                        <input
                          type="date"
                          min={today.toISOString().split('T')[0]}
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Franja Horaria Disponible:</label>
                        <select
                          value={scheduledSlot}
                          onChange={(e) => setScheduledSlot(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                        >
                          {scheduledSettings.availableSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {scheduledSettings.specialConditions && (
                      <p className="text-[10px] text-slate-400 italic">
                        Nota del comercio: {scheduledSettings.specialConditions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. MÉTODO DE PAGO */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  4. Método de Pago Aceptado
                </h4>
                {availablePaymentOptions.length > 0 && (
                  <span className="text-[10px] text-slate-400">
                    {availablePaymentOptions.length} método{availablePaymentOptions.length > 1 ? 's' : ''} disponible{availablePaymentOptions.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {availablePaymentOptions.length > 0 ? (
                <div
                  className={`grid gap-2.5 ${
                    availablePaymentOptions.length === 1
                      ? 'grid-cols-1'
                      : 'grid-cols-1 sm:grid-cols-2'
                  }`}
                >
                  {availablePaymentOptions.map((opt) => {
                    const isSelected = paymentMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {opt.icon}
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-white truncate">{opt.label}</p>
                            <p className="text-[10px] text-slate-400 truncate">{opt.sub}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Pago a Coordinar por WhatsApp</span>
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Este comercio coordina el método y los detalles de pago directamente a través de WhatsApp al confirmar tu pedido.
                  </p>
                </div>
              )}

              {/* Información complementaria de Transferencia si está activa y configurada */}
              {paymentMethod === 'transferencia' &&
                effectivePaymentSettings.bankTransfer &&
                effectivePaymentSettings.bankDetails &&
                (effectivePaymentSettings.bankDetails.bankName ||
                  effectivePaymentSettings.bankDetails.accountNumber ||
                  effectivePaymentSettings.bankDetails.accountHolder) && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs text-slate-300 space-y-1.5">
                    <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Datos para Transferencia Bancaria Directa:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      {effectivePaymentSettings.bankDetails.bankName && (
                        <div>
                          <span className="text-slate-500 block">Banco:</span>
                          <span className="font-semibold text-white">
                            {effectivePaymentSettings.bankDetails.bankName}
                          </span>
                        </div>
                      )}
                      {effectivePaymentSettings.bankDetails.accountNumber && (
                        <div>
                          <span className="text-slate-500 block">Nº de Cuenta:</span>
                          <span className="font-mono font-semibold text-white">
                            {effectivePaymentSettings.bankDetails.accountNumber}
                          </span>
                        </div>
                      )}
                      {effectivePaymentSettings.bankDetails.accountHolder && (
                        <div>
                          <span className="text-slate-500 block">Titular:</span>
                          <span className="font-semibold text-white">
                            {effectivePaymentSettings.bankDetails.accountHolder}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Información de QR */}
              {paymentMethod === 'qr' && effectivePaymentSettings.qrSimple && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-indigo-500/20 text-[11px] text-slate-400 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>El comercio te proporcionará el código QR para realizar el cobro al confirmar el pedido.</span>
                </div>
              )}

              {/* Información de Contraentrega */}
              {paymentMethod === 'contra_entrega' && effectivePaymentSettings.cashOnDelivery && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-[11px] text-slate-400 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pagarás en efectivo al momento de recibir o retirar tu pedido.</span>
                </div>
              )}

              {/* WhatsApp Permanente: Canal de coordinación obligatorio */}
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs flex items-center gap-2 text-emerald-300">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>WhatsApp permanente:</strong> Al confirmar, enviarás el detalle completo del pedido directamente a WhatsApp ({profile.whatsapp || profile.phone || 'del comercio'}) para coordinar y hacer seguimiento.
                </span>
              </div>
            </div>

            {/* 5. CÓDIGO PROMOCIONAL */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>¿Tienes un Código de Promoción?</span>
              </label>

              {appliedPromo ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                  <div>
                    <span className="font-bold font-mono text-white">{appliedPromo.code}</span>
                    <span className="ml-2 text-[11px]">
                      {appliedPromo.discountType === 'percentage'
                        ? `(${appliedPromo.discountValue}% OFF)`
                        : `(-Bs ${appliedPromo.discountValue.toFixed(2)})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Ej. BIENVENIDO10"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs uppercase focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-rose-400">{promoError}</p>
              )}
              {promoSuccessMsg && (
                <p className="text-[11px] text-emerald-400">{promoSuccessMsg}</p>
              )}
            </div>

            {/* Resumen de Importes */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({items.length} productos):</span>
                <span className="font-mono text-slate-200">Bs {subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Descuento ({appliedPromo?.code}):</span>
                  <span className="font-mono">-Bs {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Envío ({deliveryMethod === 'delivery' ? 'Delivery' : 'Retiro en tienda'}):</span>
                <span className="font-mono text-slate-200">
                  {shippingCost > 0 ? `Bs ${shippingCost.toFixed(2)}` : 'Gratis'}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm font-extrabold text-white">
                <span>Total a Pagar:</span>
                <span className="font-mono text-base text-emerald-400">
                  Bs {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Pie del modal: Confirmación */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Volver al Carrito
          </button>

          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            style={{ backgroundColor: primaryColor }}
            className="flex-1 py-3 px-6 rounded-xl text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <span>{isProcessing ? 'Registrando Pedido...' : `Confirmar Pedido • Bs ${finalTotal.toFixed(2)}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
