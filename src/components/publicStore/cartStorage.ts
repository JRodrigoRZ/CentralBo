import { CartItem, CustomerSavedProfile, PlacedOrderRecord } from './types';
import { AppointmentRequest } from '../../types';

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

export function getTenantCart(tenantId: string): CartItem[] {
  if (!isValidTenantId(tenantId)) return [];
  try {
    const raw = localStorage.getItem(`${CART_PREFIX}${tenantId.trim()}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al leer carrito:', e);
  }
  return [];
}

export function saveTenantCart(tenantId: string, items: CartItem[]): void {
  if (!isValidTenantId(tenantId)) return;
  try {
    localStorage.setItem(`${CART_PREFIX}${tenantId.trim()}`, JSON.stringify(items));
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
        return JSON.parse(tenantRaw);
      }
    }
    // 2. Fallback al perfil global del comprador
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al leer perfil guardado:', e);
  }
  return null;
}

export function saveCustomerProfile(profile: CustomerSavedProfile, tenantId?: string): void {
  try {
    // Si se provee tenantId, aislar también el perfil para este tenant
    if (isValidTenantId(tenantId)) {
      localStorage.setItem(`${PROFILE_KEY_PREFIX}${tenantId!.trim()}`, JSON.stringify(profile));
    }
    // Guardar en el perfil global del cliente para conveniencia de autocompletado general
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al guardar perfil:', e);
  }
}

export function getCustomerPlacedOrders(tenantId?: string): PlacedOrderRecord[] {
  // Si no se especifica tenantId, devolver historial legacy por compatibilidad
  if (!isValidTenantId(tenantId)) {
    try {
      const raw = localStorage.getItem(LEGACY_ORDERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[CentralBo PublicStore] Error al leer pedidos legacy:', e);
    }
    return [];
  }

  const cleanTenantId = tenantId!.trim();
  try {
    // 1. Leer almacenamiento estrictamente aislado del tenant
    const scopedRaw = localStorage.getItem(`${ORDERS_KEY_PREFIX}${cleanTenantId}`);
    if (scopedRaw) {
      return JSON.parse(scopedRaw);
    }

    // 2. Migración suave desde la clave legacy para no perder pedidos previos
    const legacyRaw = localStorage.getItem(LEGACY_ORDERS_KEY);
    if (legacyRaw) {
      const legacyOrders: PlacedOrderRecord[] = JSON.parse(legacyRaw);
      const tenantOrders = legacyOrders.filter((o) => o.tenantId === cleanTenantId);
      if (tenantOrders.length > 0) {
        localStorage.setItem(`${ORDERS_KEY_PREFIX}${cleanTenantId}`, JSON.stringify(tenantOrders));
        return tenantOrders;
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
  try {
    const existing = getCustomerPlacedOrders(cleanTenantId);
    const updated = [order, ...existing.filter((o) => o.id !== order.id)].slice(0, 30);
    localStorage.setItem(`${ORDERS_KEY_PREFIX}${cleanTenantId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al registrar pedido del cliente:', e);
  }
}

export function getCustomerAppointments(tenantId?: string): AppointmentRequest[] {
  // Si no se especifica tenantId, devolver historial legacy por compatibilidad
  if (!isValidTenantId(tenantId)) {
    try {
      const raw = localStorage.getItem(LEGACY_APPOINTMENTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[CentralBo PublicStore] Error al leer citas legacy:', e);
    }
    return [];
  }

  const cleanTenantId = tenantId!.trim();
  try {
    // 1. Leer almacenamiento estrictamente aislado del tenant
    const scopedRaw = localStorage.getItem(`${APPOINTMENTS_KEY_PREFIX}${cleanTenantId}`);
    if (scopedRaw) {
      return JSON.parse(scopedRaw);
    }

    // 2. Migración suave desde la clave legacy
    const legacyRaw = localStorage.getItem(LEGACY_APPOINTMENTS_KEY);
    if (legacyRaw) {
      const legacyAppointments: AppointmentRequest[] = JSON.parse(legacyRaw);
      const tenantAppointments = legacyAppointments.filter((a) => a.tenant_id === cleanTenantId);
      if (tenantAppointments.length > 0) {
        localStorage.setItem(`${APPOINTMENTS_KEY_PREFIX}${cleanTenantId}`, JSON.stringify(tenantAppointments));
        return tenantAppointments;
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
  try {
    const existing = getCustomerAppointments(cleanTenantId);
    const updated = [appointment, ...existing.filter((a) => a.id !== appointment.id)].slice(0, 30);
    localStorage.setItem(`${APPOINTMENTS_KEY_PREFIX}${cleanTenantId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al registrar cita del cliente:', e);
  }
}
