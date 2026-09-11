import { CartItem, CustomerSavedProfile, PlacedOrderRecord, CheckoutPaymentMethod } from './types';
import { AppointmentRequest, StoreType } from '../../types';

const CART_PREFIX = 'centralbo_cart_v5_';
const PROFILE_KEY = 'centralbo_customer_profile_v5';
const PROFILE_KEY_PREFIX = 'centralbo_customer_profile_v5_';
const ORDERS_KEY_PREFIX = 'centralbo_customer_orders_v5_';
const APPOINTMENTS_KEY_PREFIX = 'centralbo_customer_appointments_v5_';
const LEGACY_ORDERS_KEY = 'centralbo_customer_orders_v5';
const LEGACY_APPOINTMENTS_KEY = 'centralbo_customer_appointments_v5';

function isValidTenantId(tenantId: string | undefined | null): boolean {
  return (
    typeof tenantId === 'string' &&
    tenantId.trim().length > 0 &&
    tenantId !== 'undefined' &&
    tenantId !== 'null'
  );
}

function sanitizeCartItem(item: any): CartItem | null {
  if (
    !item ||
    typeof item !== 'object' ||
    typeof item.productId !== 'string' ||
    !item.productId.trim() ||
    typeof item.name !== 'string' ||
    !item.name.trim() ||
    typeof item.price !== 'number' ||
    !Number.isFinite(item.price) ||
    item.price < 0 ||
    typeof item.quantity !== 'number' ||
    !Number.isFinite(item.quantity) ||
    item.quantity <= 0
  ) {
    return null;
  }

  const validStoreTypes: StoreType[] = ['general', 'restaurante', 'moda', 'servicios'];
  const storeType: StoreType = validStoreTypes.includes(item.storeType) ? item.storeType : 'general';

  return {
    id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `${item.productId}-${Date.now()}`,
    productId: String(item.productId).trim(),
    name: String(item.name).trim().slice(0, 150),
    price: Number(item.price),
    basePrice: typeof item.basePrice === 'number' && Number.isFinite(item.basePrice) && item.basePrice >= 0 ? Number(item.basePrice) : Number(item.price),
    quantity: Math.min(Math.max(1, Math.floor(item.quantity)), 999),
    imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl.slice(0, 500) : null,
    storeType: storeType,
    kitchenNotes: typeof item.kitchenNotes === 'string' ? item.kitchenNotes.slice(0, 300) : undefined,
    selectedSize: typeof item.selectedSize === 'string' ? item.selectedSize.slice(0, 50) : undefined,
    selectedColor: item.selectedColor && typeof item.selectedColor === 'object' && typeof item.selectedColor.name === 'string'
      ? { name: String(item.selectedColor.name).slice(0, 50), hex: String(item.selectedColor.hex || '#000000').slice(0, 20) }
      : undefined,
    selectedModifiers: Array.isArray(item.selectedModifiers)
      ? item.selectedModifiers
          .filter((m: any) => m && typeof m === 'object' && typeof m.name === 'string' && typeof m.price === 'number')
          .map((m: any) => ({ name: String(m.name).slice(0, 100), price: Number(m.price) }))
      : undefined,
    isCombo: typeof item.isCombo === 'boolean' ? item.isCombo : undefined,
    comboItems: Array.isArray(item.comboItems) ? item.comboItems.map((c: any) => String(c).slice(0, 100)) : undefined,
    isService: typeof item.isService === 'boolean' ? item.isService : undefined,
    serviceDetails: item.serviceDetails && typeof item.serviceDetails === 'object'
      ? {
          durationMinutes: typeof item.serviceDetails.durationMinutes === 'number' ? item.serviceDetails.durationMinutes : 60,
          specialty: typeof item.serviceDetails.specialty === 'string' ? item.serviceDetails.specialty.slice(0, 100) : '',
          professionalId: typeof item.serviceDetails.professionalId === 'string' ? item.serviceDetails.professionalId : undefined,
          professionalName: typeof item.serviceDetails.professionalName === 'string' ? item.serviceDetails.professionalName.slice(0, 100) : undefined,
        }
      : undefined,
  };
}

function sanitizeCustomerProfile(data: any): CustomerSavedProfile | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  return {
    name: typeof data.name === 'string' ? data.name.trim().slice(0, 100) : '',
    phone: typeof data.phone === 'string' ? data.phone.trim().slice(0, 25) : '',
    whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp.trim().slice(0, 25) : '',
    email: typeof data.email === 'string' ? data.email.trim().slice(0, 120) : '',
    address: typeof data.address === 'string' ? data.address.trim().slice(0, 250) : '',
    reference: typeof data.reference === 'string' ? data.reference.trim().slice(0, 250) : '',
    city: typeof data.city === 'string' ? data.city.trim().slice(0, 60) : 'Santa Cruz',
  };
}

function sanitizePlacedOrder(data: any, tenantId?: string): PlacedOrderRecord | null {
  if (
    !data ||
    typeof data !== 'object' ||
    typeof data.id !== 'string' ||
    !data.id.trim() ||
    typeof data.total !== 'number' ||
    !Number.isFinite(data.total) ||
    data.total < 0
  ) {
    return null;
  }
  const tId = typeof data.tenantId === 'string' && data.tenantId.trim() ? data.tenantId.trim() : (tenantId || '');
  if (!tId) return null;

  const validItems = Array.isArray(data.items)
    ? data.items.map(sanitizeCartItem).filter((i: CartItem | null): i is CartItem => i !== null)
    : [];

  const validStatuses = ['pendiente', 'recibido', 'pagado', 'en_preparacion', 'despachado', 'completado', 'cancelado'] as const;
  const status = validStatuses.includes(data.status) ? data.status : 'pendiente';

  const validPaymentMethods: CheckoutPaymentMethod[] = ['transferencia', 'qr', 'acordado', 'contra_entrega'];
  const paymentMethod: CheckoutPaymentMethod = validPaymentMethods.includes(data.paymentMethod) ? data.paymentMethod : 'acordado';

  return {
    id: String(data.id).trim(),
    orderNumber: typeof data.orderNumber === 'string' ? data.orderNumber.slice(0, 50) : `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    tenantId: tId,
    storeName: typeof data.storeName === 'string' ? data.storeName.slice(0, 100) : '',
    storeSlug: typeof data.storeSlug === 'string' ? data.storeSlug.slice(0, 100) : '',
    storePhone: typeof data.storePhone === 'string' ? data.storePhone.slice(0, 25) : '',
    storeWhatsapp: typeof data.storeWhatsapp === 'string' ? data.storeWhatsapp.slice(0, 25) : '',
    items: validItems,
    subtotal: typeof data.subtotal === 'number' && Number.isFinite(data.subtotal) ? Number(data.subtotal) : Number(data.total),
    discount: typeof data.discount === 'number' && Number.isFinite(data.discount) ? Number(data.discount) : 0,
    shippingCost: typeof data.shippingCost === 'number' && Number.isFinite(data.shippingCost) ? Number(data.shippingCost) : 0,
    total: Number(data.total),
    deliveryMethod: data.deliveryMethod === 'pickup' ? 'pickup' : 'delivery',
    deliveryAddress: typeof data.deliveryAddress === 'string' ? data.deliveryAddress.slice(0, 200) : undefined,
    deliveryReference: typeof data.deliveryReference === 'string' ? data.deliveryReference.slice(0, 200) : undefined,
    pickupNotes: typeof data.pickupNotes === 'string' ? data.pickupNotes.slice(0, 300) : undefined,
    isScheduled: Boolean(data.isScheduled),
    scheduledDate: typeof data.scheduledDate === 'string' ? data.scheduledDate : undefined,
    scheduledSlot: typeof data.scheduledSlot === 'string' ? data.scheduledSlot : undefined,
    paymentMethod: paymentMethod,
    customerName: typeof data.customerName === 'string' ? data.customerName.slice(0, 100) : '',
    customerPhone: typeof data.customerPhone === 'string' ? data.customerPhone.slice(0, 25) : '',
    customerEmail: typeof data.customerEmail === 'string' ? data.customerEmail.slice(0, 120) : '',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    status: status,
  };
}

function sanitizeAppointmentRequest(data: any, tenantId?: string): AppointmentRequest | null {
  if (
    !data ||
    typeof data !== 'object' ||
    typeof data.id !== 'string' ||
    !data.id.trim() ||
    typeof data.serviceName !== 'string' ||
    !data.serviceName.trim() ||
    typeof data.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
    typeof data.time !== 'string'
  ) {
    return null;
  }
  const tId = typeof data.tenant_id === 'string' && data.tenant_id.trim() ? data.tenant_id.trim() : (tenantId || '');
  if (!tId) return null;

  const validStatuses = ['pendiente', 'confirmada', 'rechazada'] as const;
  const status = validStatuses.includes(data.status) ? data.status : 'pendiente';

  return {
    id: String(data.id).trim(),
    tenant_id: tId,
    serviceId: typeof data.serviceId === 'string' ? data.serviceId : '',
    serviceName: data.serviceName.trim().slice(0, 150),
    professionalId: typeof data.professionalId === 'string' ? data.professionalId : '',
    professionalName: typeof data.professionalName === 'string' ? data.professionalName.slice(0, 100) : '',
    customerName: typeof data.customerName === 'string' ? data.customerName.trim().slice(0, 100) : '',
    customerPhone: typeof data.customerPhone === 'string' ? data.customerPhone.trim().slice(0, 25) : '',
    customerEmail: typeof data.customerEmail === 'string' ? data.customerEmail.trim().slice(0, 120) : 'cliente@centralbo.bo',
    date: data.date,
    time: data.time.slice(0, 10),
    status: status,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    notes: typeof data.notes === 'string' ? data.notes.slice(0, 300) : undefined,
  };
}

export function getTenantCart(tenantId: string): CartItem[] {
  if (!isValidTenantId(tenantId)) return [];
  try {
    const raw = localStorage.getItem(`${CART_PREFIX}${tenantId.trim()}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(sanitizeCartItem)
        .filter((item): item is CartItem => item !== null);
    }
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al leer carrito (JSON inválido o corrupto):', e);
  }
  return [];
}

export function saveTenantCart(tenantId: string, items: CartItem[]): void {
  if (!isValidTenantId(tenantId)) return;
  if (!Array.isArray(items)) {
    console.warn('[CentralBo PublicStore] Intento de guardar carrito con tipo no array');
    return;
  }
  try {
    const cleanItems = items
      .map(sanitizeCartItem)
      .filter((i): i is CartItem => i !== null);
    localStorage.setItem(`${CART_PREFIX}${tenantId.trim()}`, JSON.stringify(cleanItems));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al guardar carrito:', e);
  }
}

export function clearTenantCart(tenantId: string): void {
  if (!isValidTenantId(tenantId)) return;
  try {
    localStorage.removeItem(`${CART_PREFIX}${tenantId.trim()}`);
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al limpiar carrito:', e);
  }
}

export function getSavedCustomerProfile(tenantId?: string): CustomerSavedProfile | null {
  try {
    // 1. Si se proporciona tenantId, consultar primero el perfil específico del tenant
    if (isValidTenantId(tenantId)) {
      const tenantRaw = localStorage.getItem(`${PROFILE_KEY_PREFIX}${tenantId!.trim()}`);
      if (tenantRaw) {
        const parsed = JSON.parse(tenantRaw);
        const clean = sanitizeCustomerProfile(parsed);
        if (clean) return clean;
      }
    }
    // 2. Fallback al perfil global del comprador
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizeCustomerProfile(parsed);
    }
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al leer perfil guardado:', e);
  }
  return null;
}

export function saveCustomerProfile(profile: CustomerSavedProfile, tenantId?: string): void {
  const cleanProfile = sanitizeCustomerProfile(profile);
  if (!cleanProfile) return;

  try {
    // Si se provee tenantId, aislar también el perfil para este tenant
    if (isValidTenantId(tenantId)) {
      localStorage.setItem(`${PROFILE_KEY_PREFIX}${tenantId!.trim()}`, JSON.stringify(cleanProfile));
    }
    // Guardar en el perfil global del cliente para conveniencia de autocompletado general
    localStorage.setItem(PROFILE_KEY, JSON.stringify(cleanProfile));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al guardar perfil:', e);
  }
}

export function getCustomerPlacedOrders(tenantId?: string): PlacedOrderRecord[] {
  // Si no se especifica tenantId válido, devolver array vacío para garantizar aislamiento estricto
  if (!isValidTenantId(tenantId)) {
    return [];
  }

  const cleanTenantId = tenantId!.trim();
  try {
    // 1. Leer almacenamiento estrictamente aislado del tenant
    const scopedRaw = localStorage.getItem(`${ORDERS_KEY_PREFIX}${cleanTenantId}`);
    if (scopedRaw) {
      const parsed = JSON.parse(scopedRaw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((o) => sanitizePlacedOrder(o, cleanTenantId))
          .filter((o): o is PlacedOrderRecord => o !== null);
      }
      return [];
    }

    // 2. Migración suave desde la clave legacy para no perder pedidos previos
    const legacyRaw = localStorage.getItem(LEGACY_ORDERS_KEY);
    if (legacyRaw) {
      const legacyOrders = JSON.parse(legacyRaw);
      if (Array.isArray(legacyOrders)) {
        const tenantOrders = legacyOrders
          .filter((o) => o && o.tenantId === cleanTenantId)
          .map((o) => sanitizePlacedOrder(o, cleanTenantId))
          .filter((o): o is PlacedOrderRecord => o !== null);
        if (tenantOrders.length > 0) {
          localStorage.setItem(`${ORDERS_KEY_PREFIX}${cleanTenantId}`, JSON.stringify(tenantOrders));
          return tenantOrders;
        }
      }
    }
  } catch (e) {
    console.warn(`[CentralBo PublicStore] Error al leer pedidos del tenant ${cleanTenantId}:`, e);
  }
  return [];
}

export function recordCustomerPlacedOrder(order: PlacedOrderRecord): void {
  if (!order || !isValidTenantId(order.tenantId)) {
    console.warn('[CentralBo PublicStore] Intento de registrar pedido con tenantId inválido');
    return;
  }
  const cleanTenantId = order.tenantId.trim();
  const cleanOrder = sanitizePlacedOrder(order, cleanTenantId);
  if (!cleanOrder) {
    console.warn('[CentralBo PublicStore] Estructura de pedido inválida para persistencia');
    return;
  }

  try {
    const existing = getCustomerPlacedOrders(cleanTenantId);
    const updated = [cleanOrder, ...existing.filter((o) => o.id !== cleanOrder.id)].slice(0, 30);
    localStorage.setItem(`${ORDERS_KEY_PREFIX}${cleanTenantId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al registrar pedido del cliente:', e);
  }
}

export function getCustomerAppointments(tenantId?: string): AppointmentRequest[] {
  // Si no se especifica tenantId válido, devolver array vacío para garantizar aislamiento estricto
  if (!isValidTenantId(tenantId)) {
    return [];
  }

  const cleanTenantId = tenantId!.trim();
  try {
    // 1. Leer almacenamiento estrictamente aislado del tenant
    const scopedRaw = localStorage.getItem(`${APPOINTMENTS_KEY_PREFIX}${cleanTenantId}`);
    if (scopedRaw) {
      const parsed = JSON.parse(scopedRaw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((a) => sanitizeAppointmentRequest(a, cleanTenantId))
          .filter((a): a is AppointmentRequest => a !== null);
      }
      return [];
    }

    // 2. Migración suave desde la clave legacy
    const legacyRaw = localStorage.getItem(LEGACY_APPOINTMENTS_KEY);
    if (legacyRaw) {
      const legacyAppointments = JSON.parse(legacyRaw);
      if (Array.isArray(legacyAppointments)) {
        const tenantAppointments = legacyAppointments
          .filter((a) => a && a.tenant_id === cleanTenantId)
          .map((a) => sanitizeAppointmentRequest(a, cleanTenantId))
          .filter((a): a is AppointmentRequest => a !== null);
        if (tenantAppointments.length > 0) {
          localStorage.setItem(`${APPOINTMENTS_KEY_PREFIX}${cleanTenantId}`, JSON.stringify(tenantAppointments));
          return tenantAppointments;
        }
      }
    }
  } catch (e) {
    console.warn(`[CentralBo PublicStore] Error al leer citas del tenant ${cleanTenantId}:`, e);
  }
  return [];
}

export function recordCustomerAppointment(appointment: AppointmentRequest): void {
  if (!appointment || !isValidTenantId(appointment.tenant_id)) {
    console.warn('[CentralBo PublicStore] Intento de registrar cita con tenant_id inválido');
    return;
  }
  const cleanTenantId = appointment.tenant_id.trim();
  const cleanAppt = sanitizeAppointmentRequest(appointment, cleanTenantId);
  if (!cleanAppt) {
    console.warn('[CentralBo PublicStore] Estructura de cita inválida para persistencia');
    return;
  }

  try {
    const existing = getCustomerAppointments(cleanTenantId);
    const updated = [cleanAppt, ...existing.filter((a) => a.id !== cleanAppt.id)].slice(0, 30);
    localStorage.setItem(`${APPOINTMENTS_KEY_PREFIX}${cleanTenantId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al registrar cita del cliente:', e);
  }
}
