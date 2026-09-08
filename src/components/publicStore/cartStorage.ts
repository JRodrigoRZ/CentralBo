import { CartItem, CustomerSavedProfile, PlacedOrderRecord } from './types';
import { AppointmentRequest } from '../../types';

const CART_PREFIX = 'centralbo_cart_v5_';
const PROFILE_KEY = 'centralbo_customer_profile_v5';
const ORDERS_KEY = 'centralbo_customer_orders_v5';
const APPOINTMENTS_KEY = 'centralbo_customer_appointments_v5';

export function getTenantCart(tenantId: string): CartItem[] {
  try {
    const raw = localStorage.getItem(`${CART_PREFIX}${tenantId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al leer carrito:', e);
  }
  return [];
}

export function saveTenantCart(tenantId: string, items: CartItem[]): void {
  try {
    localStorage.setItem(`${CART_PREFIX}${tenantId}`, JSON.stringify(items));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al guardar carrito:', e);
  }
}

export function clearTenantCart(tenantId: string): void {
  try {
    localStorage.removeItem(`${CART_PREFIX}${tenantId}`);
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al limpiar carrito:', e);
  }
}

export function getSavedCustomerProfile(): CustomerSavedProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al leer perfil guardado:', e);
  }
  return null;
}

export function saveCustomerProfile(profile: CustomerSavedProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al guardar perfil:', e);
  }
}

export function getCustomerPlacedOrders(): PlacedOrderRecord[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al leer pedidos guardados:', e);
  }
  return [];
}

export function recordCustomerPlacedOrder(order: PlacedOrderRecord): void {
  try {
    const existing = getCustomerPlacedOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id)].slice(0, 30);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al registrar pedido del cliente:', e);
  }
}

export function getCustomerAppointments(): AppointmentRequest[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al leer citas guardadas:', e);
  }
  return [];
}

export function recordCustomerAppointment(appointment: AppointmentRequest): void {
  try {
    const existing = getCustomerAppointments();
    const updated = [appointment, ...existing.filter((a) => a.id !== appointment.id)].slice(0, 30);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[CentralBo PublicStore] Error al registrar cita del cliente:', e);
  }
}
