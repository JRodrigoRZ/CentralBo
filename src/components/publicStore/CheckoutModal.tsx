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
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
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
import { getModalMotionProps } from './motionSystem';

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

// SEC-14A-02: Rate Limiting & Cooldown para Checkout y Creación de Pedidos
const CHECKOUT_RATE_LIMIT_KEY = 'cb_checkout_ratelimit';
const ORDER_COOLDOWN_MS = 15000; // 15 segundos entre pedidos
const MAX_ORDERS_PER_SESSION_WINDOW = 8; // Máximo 8 pedidos en 30 minutos
const SESSION_WINDOW_MS = 30 * 60 * 1000; // 30 minutos

interface CheckoutRateLimitRecord {
  lastOrderTimestamp: number;
  ordersInWindow: number;
  windowStartTime: number;
}

function getCheckoutRateLimit(): CheckoutRateLimitRecord {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_RATE_LIMIT_KEY);
    if (!raw) return { lastOrderTimestamp: 0, ordersInWindow: 0, windowStartTime: 0 };
    const parsed = JSON.parse(raw);
    return {
      lastOrderTimestamp: typeof parsed.lastOrderTimestamp === 'number' ? parsed.lastOrderTimestamp : 0,
      ordersInWindow: typeof parsed.ordersInWindow === 'number' ? parsed.ordersInWindow : 0,
      windowStartTime: typeof parsed.windowStartTime === 'number' ? parsed.windowStartTime : 0,
    };
  } catch {
    return { lastOrderTimestamp: 0, ordersInWindow: 0, windowStartTime: 0 };
  }
}

function recordOrderIssued(): void {
  try {
    const now = Date.now();
    const current = getCheckoutRateLimit();
    const isWindowValid = current.windowStartTime > 0 && now - current.windowStartTime < SESSION_WINDOW_MS;
    const ordersInWindow = isWindowValid ? current.ordersInWindow + 1 : 1;
    const windowStartTime = isWindowValid ? current.windowStartTime : now;

    sessionStorage.setItem(
      CHECKOUT_RATE_LIMIT_KEY,
      JSON.stringify({
        lastOrderTimestamp: now,
        ordersInWindow,
        windowStartTime,
      })
    );
  } catch {}
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

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  store,
  profile,
  shippingSettings,
  scheduledSettings,
  paymentSettings,
  items,
  onClose,
  onOrderCompleted,
  primaryColor = '#2563eb',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const contrastColor = getContrastColor(primaryColor);
  const savedProfile = getSavedCustomerProfile(store.id);
  const effectivePaymentSettings = paymentSettings || getStorePaymentSettings(store.id);

  // Opciones de pago configuradas y habilitadas por el comercio
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
      sub: 'Cobro rápido por código QR',
      icon: <QrCode className="w-5 h-5 text-indigo-500 shrink-0" />,
    });
  }

  if (effectivePaymentSettings.bankTransfer) {
    availablePaymentOptions.push({
      id: 'transferencia',
      label: 'Transferencia Bancaria',
      sub: 'Transferencia directa a cuenta de la tienda',
      icon: <CreditCard className="w-5 h-5 text-sky-500 shrink-0" />,
    });
  }

  if (effectivePaymentSettings.cashOnDelivery) {
    availablePaymentOptions.push({
      id: 'contra_entrega',
      label: 'Efectivo Contraentrega',
      sub: 'Pago en efectivo al recibir o retirar',
      icon: <Banknote className="w-5 h-5 text-emerald-500 shrink-0" />,
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

  // Método de pago
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

  // SEC-14A-02: Cooldown entre pedidos
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => {
    const rl = getCheckoutRateLimit();
    const elapsed = Date.now() - rl.lastOrderTimestamp;
    if (elapsed < ORDER_COOLDOWN_MS) {
      return Math.ceil((ORDER_COOLDOWN_MS - elapsed) / 1000);
    }
    return 0;
  });

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      const rl = getCheckoutRateLimit();
      const elapsed = Date.now() - rl.lastOrderTimestamp;
      const remaining = Math.ceil((ORDER_COOLDOWN_MS - elapsed) / 1000);
      if (remaining <= 0) {
        setCooldownRemaining(0);
        clearInterval(timer);
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Cálculo de importes
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  // Costo de envío según configuración real del comercio
  let shippingCost = 0;
  if (deliveryMethod === 'delivery' && shippingSettings.offersShipping) {
    if (shippingSettings.shippingType === 'fixed') {
      if (
        shippingSettings.minOrderAmount > 0 &&
        subtotal >= shippingSettings.minOrderAmount
      ) {
        shippingCost = 0;
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

  // Aplicar cupón
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

  // Confirmar y registrar pedido
  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // SEC-14A-02: Rate limit checks
    const rl = getCheckoutRateLimit();
    const elapsed = Date.now() - rl.lastOrderTimestamp;
    if (elapsed < ORDER_COOLDOWN_MS) {
      const remainingSecs = Math.ceil((ORDER_COOLDOWN_MS - elapsed) / 1000);
      setCooldownRemaining(remainingSecs);
      setFormError(`Por favor espera ${remainingSecs} segundo${remainingSecs === 1 ? '' : 's'} antes de emitir un nuevo pedido.`);
      return;
    }

    const isWindowValid = rl.windowStartTime > 0 && Date.now() - rl.windowStartTime < SESSION_WINDOW_MS;
    if (isWindowValid && rl.ordersInWindow >= MAX_ORDERS_PER_SESSION_WINDOW) {
      setFormError(
        'Has alcanzado el límite de pedidos permitidos para esta sesión (8 pedidos). Por favor espera unos minutos antes de emitir más pedidos.'
      );
      return;
    }

    if (isProcessing) return;

    // Validación de Nombre
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setFormError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (trimmedName.length > 100) {
      setFormError('El nombre no puede exceder 100 caracteres.');
      return;
    }

    // Validación de Teléfono
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setFormError('Por favor ingresa un número de teléfono de contacto.');
      return;
    }
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/;
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (
      trimmedPhone.length < 7 ||
      trimmedPhone.length > 25 ||
      !phoneRegex.test(trimmedPhone) ||
      digitsOnly.length < 7
    ) {
      setFormError('Por favor ingresa un número de teléfono válido (mínimo 7 dígitos, ej. 71234567 o +591 71234567).');
      return;
    }

    // Validación de Dirección si es Delivery
    const trimmedAddress = deliveryAddress.trim();
    if (deliveryMethod === 'delivery') {
      if (!trimmedAddress) {
        setFormError('Por favor ingresa la dirección de entrega.');
        return;
      }
      if (trimmedAddress.length > 200) {
        setFormError('La dirección de entrega no puede exceder 200 caracteres.');
        return;
      }
    }

    const cleanGeneralNotes = generalNotes.trim().slice(0, 300);
    const cleanPickupNotes = pickupNotes.trim().slice(0, 300);

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
      customer_id: null,
      customer_name: trimmedName.slice(0, 100),
      customer_email: email.trim().slice(0, 120) || null,
      customer_phone: trimmedPhone.slice(0, 25),
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
      deliveryAddress: trimmedAddress || undefined,
      deliveryReference: deliveryReference.trim().slice(0, 200) || undefined,
      pickupNotes: (deliveryMethod === 'pickup' ? cleanPickupNotes : cleanGeneralNotes) || undefined,
      isScheduled: isScheduled,
      scheduledDate: isScheduled ? scheduledDate : undefined,
      scheduledSlot: isScheduled ? scheduledSlot : undefined,
      paymentMethod: paymentMethod,
      customerName: trimmedName.slice(0, 100),
      customerPhone: trimmedPhone.slice(0, 25),
      customerEmail: email.trim().slice(0, 120),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
    };

    recordCustomerPlacedOrder(clientOrderRecord);

    if (saveProfile) {
      saveCustomerProfile(
        {
          name: trimmedName.slice(0, 100),
          phone: trimmedPhone.slice(0, 25),
          whatsapp: whatsapp.trim().slice(0, 25) || trimmedPhone.slice(0, 25),
          email: email.trim().slice(0, 120),
          address: trimmedAddress.slice(0, 200),
          reference: deliveryReference.trim().slice(0, 200),
          city: 'La Paz',
        },
        store.id
      );
    }

    clearTenantCart(store.id);
    recordOrderIssued();
    setCooldownRemaining(Math.ceil(ORDER_COOLDOWN_MS / 1000));

    setPlacedOrder(clientOrderRecord);
    setIsProcessing(false);
    onOrderCompleted();
  };

  // WhatsApp del comercio real
  const cleanWhatsapp = (profile.whatsapp || profile.phone || '').replace(/\D/g, '');

  const generateWhatsAppMessage = (order: PlacedOrderRecord) => {
    let text = `¡Hola *${order.storeName}*! 👋 Acabo de realizar el pedido *#${order.orderNumber}* a través de su tienda online:\n\n`;

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

    text += `\n¡Quedo atento/a a su confirmación para coordinar el pago y la entrega! Muchas gracias.`;

    return text;
  };

  // Perfil de movimiento del modal por vertical
  const modalMotionProps = getModalMotionProps(store.store_type, shouldReduceMotion);

  // PANTALLA DE ÉXITO Y ENVÍO A WHATSAPP
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          {...modalMotionProps}
          className="w-full max-w-xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-2xl space-y-6 text-center max-h-[92vh] overflow-y-auto"
        >
          {/* Badge & Icono de Éxito */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner"
            style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
          >
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700">
              Pedido #{placedOrder.orderNumber}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              ¡Pedido Registrado con Éxito!
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              Tu pedido ha sido guardado en el sistema de <strong className="text-stone-900 dark:text-white">{store.name}</strong>. Para finalizar la coordinación y el despacho, comunícate directamente mediante WhatsApp.
            </p>
          </div>

          {/* Resumen del pedido con diseño limpio */}
          <div className="rounded-2xl bg-stone-50/80 dark:bg-stone-950/80 border border-stone-200/80 dark:border-stone-800 p-4 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-stone-200/80 dark:border-stone-800 pb-2.5">
              <span className="text-stone-500 dark:text-stone-400">Total a Pagar:</span>
              <span className="text-base font-black text-stone-900 dark:text-white">
                Bs {placedOrder.total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-1.5 text-stone-600 dark:text-stone-300">
              <p>
                <span className="text-stone-400 dark:text-stone-500">Entrega: </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {placedOrder.deliveryMethod === 'delivery' ? 'Delivery a Domicilio' : 'Retiro en Local (Pickup)'}
                </span>
              </p>
              {placedOrder.deliveryAddress && (
                <p>
                  <span className="text-stone-400 dark:text-stone-500">Dirección: </span>
                  <span className="text-stone-700 dark:text-stone-300">{placedOrder.deliveryAddress}</span>
                </p>
              )}
              {placedOrder.isScheduled && (
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  Pedido Programado: {placedOrder.scheduledDate} ({placedOrder.scheduledSlot})
                </p>
              )}
              <p>
                <span className="text-stone-400 dark:text-stone-500">Método de Pago: </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {placedOrder.paymentMethod === 'qr' ? 'Cobro con QR Simple' :
                   placedOrder.paymentMethod === 'transferencia' ? 'Transferencia Bancaria Directa' :
                   placedOrder.paymentMethod === 'contra_entrega' ? 'Efectivo Contraentrega' : 'Coordinación por WhatsApp'}
                </span>
              </p>
            </div>

            {/* Ítems del pedido */}
            <div className="border-t border-stone-200/80 dark:border-stone-800 pt-2.5 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">
                Artículos ({placedOrder.items.length}):
              </span>
              {placedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px] text-stone-700 dark:text-stone-300">
                  <span className="truncate pr-2">
                    {it.quantity}x {it.name}
                    {it.selectedSize ? ` (${it.selectedSize})` : ''}
                  </span>
                  <span className="font-bold shrink-0">Bs {(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTÓN PRINCIPAL DE WHATSAPP */}
          <div className="space-y-3 pt-1">
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2.5 transition-all duration-200 hover:brightness-105 active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>Enviar Pedido a {store.name} por WhatsApp</span>
              </a>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                El comercio no tiene configurado un número de WhatsApp directo. Por favor comunícate con la tienda al teléfono {profile.phone || 'indicado en su perfil'}.
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={copySummary}
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">¡Resumen Copiado!</span>
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
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // PANTALLA PRINCIPAL DE FORMULARIO DE CHECKOUT
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        {...modalMotionProps}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"
      >
        {/* Cabecera del modal con identidad del comercio */}
        <div className="px-5 py-3.5 bg-stone-50/90 dark:bg-stone-950/90 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Finalizar Pedido • {store.name}
              </h3>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              Compra directa como invitado • Sin registro obligatorio
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {cooldownRemaining > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>
                Protección contra pedidos duplicados: Por favor espera{' '}
                <strong className="underline">{cooldownRemaining}s</strong> antes de confirmar otro pedido.
              </span>
            </div>
          )}

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-5">
            {/* 1. INFORMACIÓN DEL CLIENTE */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  1
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Información de Contacto
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-stone-700 dark:text-stone-300 font-semibold">
                      Nombre Completo *
                    </label>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500">
                      {customerName.length}/100
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tu nombre y apellido"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-stone-700 dark:text-stone-300 font-semibold">
                      Teléfono / WhatsApp *
                    </label>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500">
                      {phone.length}/25
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={25}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!whatsapp) setWhatsapp(e.target.value);
                    }}
                    placeholder="Ej. 71234567 o +591 71234567"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-stone-500 dark:text-stone-400">
                  Email (Opcional para comprobante de compra)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                />
              </div>

              <label className="flex items-center gap-2 pt-0.5 text-[11px] text-stone-600 dark:text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveProfile}
                  onChange={(e) => setSaveProfile(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-stone-50 dark:bg-stone-950 border-stone-300 dark:border-stone-700 focus:ring-0 cursor-pointer"
                />
                <span>Recordar mis datos en este navegador para futuras compras en {store.name}</span>
              </label>
            </div>

            {/* 2. MÉTODO DE ENTREGA */}
            <div className="space-y-3 pt-3 border-t border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  2
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Método de Entrega
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                    deliveryMethod === 'delivery'
                      ? 'bg-stone-100 dark:bg-stone-800 border-stone-400 dark:border-stone-600 text-stone-900 dark:text-white shadow-2xs'
                      : 'bg-stone-50/70 dark:bg-stone-950/70 border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Truck className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                    <span className="text-stone-900 dark:text-white">Envío a Domicilio</span>
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">
                    {shippingSettings.shippingType === 'fixed'
                      ? `Costo de envío: Bs ${shippingSettings.fixedCost.toFixed(2)}`
                      : 'Envío gratuito'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                    deliveryMethod === 'pickup'
                      ? 'bg-stone-100 dark:bg-stone-800 border-stone-400 dark:border-stone-600 text-stone-900 dark:text-white shadow-2xs'
                      : 'bg-stone-50/70 dark:bg-stone-950/70 border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Building2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-stone-900 dark:text-white">Retiro en Tienda</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Sin costo • Gratis
                  </span>
                </button>
              </div>

              {/* Campos específicos de Delivery */}
              {deliveryMethod === 'delivery' && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] text-stone-700 dark:text-stone-300 font-semibold">
                        Dirección de Entrega Completa *
                      </label>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">
                        {deliveryAddress.length}/200
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Calle, número, edificio o zona"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] text-stone-500 dark:text-stone-400">
                        Punto de Referencia / Indicaciones
                      </label>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">
                        {deliveryReference.length}/200
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={200}
                      value={deliveryReference}
                      onChange={(e) => setDeliveryReference(e.target.value)}
                      placeholder="Ej. Casa de rejas blancas, frente a la farmacia"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] text-stone-500 dark:text-stone-400">
                        Notas Generales para el Despacho
                      </label>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">
                        {generalNotes.length}/300
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={300}
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      placeholder="Instrucciones adicionales para el repartidor..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 resize-none transition"
                    />
                  </div>
                </div>
              )}

              {/* Campos de Pickup */}
              {deliveryMethod === 'pickup' && (
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-2">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">Dirección de Retiro en Tienda:</p>
                    <p className="text-stone-500 dark:text-stone-400">{profile.address || 'Consultar dirección exacta por WhatsApp'}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-stone-500 dark:text-stone-400 block">
                        Hora estimada o persona que retira:
                      </label>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">
                        {pickupNotes.length}/300
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={300}
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                      placeholder="Ej. Retiro a las 17:00 / Pasa mi hermano Juan"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. PEDIDOS PROGRAMADOS (Si la tienda los configuró) */}
            {scheduledSettings.enabled && (
              <div className="space-y-3 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      3
                    </span>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                        Programación de Pedido
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        ¿Deseas programar tu entrega o retiro para una fecha específica?
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-300 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-stone-900 dark:peer-checked:bg-white" />
                  </label>
                </div>

                {isScheduled && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 space-y-3 animate-in fade-in duration-150">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Seleccionar Fecha y Horario</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-500 dark:text-stone-400">Fecha de Entrega/Retiro:</label>
                        <input
                          type="date"
                          min={today.toISOString().split('T')[0]}
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-500 dark:text-stone-400">Franja Horaria:</label>
                        <select
                          value={scheduledSlot}
                          onChange={(e) => setScheduledSlot(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-stone-400"
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
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 italic">
                        Condición del comercio: {scheduledSettings.specialConditions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. MÉTODO DE PAGO */}
            <div className="space-y-3 pt-3 border-t border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    4
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Método de Pago Aceptado
                  </h4>
                </div>
                {availablePaymentOptions.length > 0 && (
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
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
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-stone-800 border-stone-400 dark:border-stone-600 text-stone-900 dark:text-white shadow-2xs'
                            : 'bg-stone-50/70 dark:bg-stone-950/70 border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {opt.icon}
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-stone-900 dark:text-white truncate">{opt.label}</p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{opt.sub}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: primaryColor }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                  <p className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Pago a Coordinar por WhatsApp</span>
                  </p>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
                    Este comercio coordina el método y los detalles de pago directamente a través de WhatsApp al confirmar tu pedido.
                  </p>
                </div>
              )}

              {/* Datos de Transferencia si está activa y configurada */}
              {paymentMethod === 'transferencia' &&
                effectivePaymentSettings.bankTransfer &&
                effectivePaymentSettings.bankDetails &&
                (effectivePaymentSettings.bankDetails.bankName ||
                  effectivePaymentSettings.bankDetails.accountNumber ||
                  effectivePaymentSettings.bankDetails.accountHolder) && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-1.5">
                    <p className="text-[11px] font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Datos para Transferencia Bancaria:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      {effectivePaymentSettings.bankDetails.bankName && (
                        <div>
                          <span className="text-stone-400 dark:text-stone-500 block">Banco:</span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200">
                            {effectivePaymentSettings.bankDetails.bankName}
                          </span>
                        </div>
                      )}
                      {effectivePaymentSettings.bankDetails.accountNumber && (
                        <div>
                          <span className="text-stone-400 dark:text-stone-500 block">Nº Cuenta:</span>
                          <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                            {effectivePaymentSettings.bankDetails.accountNumber}
                          </span>
                        </div>
                      )}
                      {effectivePaymentSettings.bankDetails.accountHolder && (
                        <div>
                          <span className="text-stone-400 dark:text-stone-500 block">Titular:</span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200">
                            {effectivePaymentSettings.bankDetails.accountHolder}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Información de QR */}
              {paymentMethod === 'qr' && effectivePaymentSettings.qrSimple && (
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-stone-700 dark:text-stone-300 shrink-0" />
                  <span>El comercio te proporcionará el código QR para el cobro al confirmar el pedido por WhatsApp.</span>
                </div>
              )}

              {/* Información de Contraentrega */}
              {paymentMethod === 'contra_entrega' && effectivePaymentSettings.cashOnDelivery && (
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Pagarás en efectivo al momento de recibir o retirar tu pedido.</span>
                </div>
              )}

              {/* Aviso de coordinación por WhatsApp */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>Coordinación por WhatsApp:</strong> Al confirmar, enviarás el detalle completo del pedido directamente a WhatsApp ({profile.whatsapp || profile.phone || 'del comercio'}) para coordinar el pago y el envío.
                </span>
              </div>
            </div>

            {/* 5. CÓDIGO PROMOCIONAL */}
            <div className="space-y-2 pt-3 border-t border-stone-200/80 dark:border-stone-800">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>¿Tienes un Código de Promoción?</span>
              </label>

              {appliedPromo ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <div>
                    <span className="font-bold font-mono">{appliedPromo.code}</span>
                    <span className="ml-2 text-[11px]">
                      {appliedPromo.discountType === 'percentage'
                        ? `(${appliedPromo.discountValue}% OFF)`
                        : `(-Bs ${appliedPromo.discountValue.toFixed(2)})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
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
                    placeholder="Ingresa tu cupón"
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white font-mono text-xs uppercase focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400">{promoError}</p>
              )}
              {promoSuccessMsg && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{promoSuccessMsg}</p>
              )}
            </div>

            {/* Resumen de Importes */}
            <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-950/90 border border-stone-200/80 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'}):</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">Bs {subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Descuento ({appliedPromo?.code}):</span>
                  <span className="font-mono">-Bs {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>Envío ({deliveryMethod === 'delivery' ? 'Delivery' : 'Retiro en tienda'}):</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {shippingCost > 0 ? `Bs ${shippingCost.toFixed(2)}` : 'Gratis'}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-sm font-black text-stone-900 dark:text-white">
                <span>Total a Pagar:</span>
                <span className="text-base tracking-tight">
                  Bs {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Pie del modal: Botones de Acción */}
        <div className="p-4 bg-stone-50/90 dark:bg-stone-950/90 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all duration-150 hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            Volver a la Canasta
          </button>

          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing || cooldownRemaining > 0}
            style={{ backgroundColor: primaryColor, color: contrastColor }}
            className="flex-1 py-3 px-6 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {cooldownRemaining > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Espera ({cooldownRemaining}s)</span>
              </span>
            ) : isProcessing ? (
              <span>Registrando Pedido...</span>
            ) : (
              <>
                <span>{`Confirmar Pedido • Bs ${finalTotal.toFixed(2)}`}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
