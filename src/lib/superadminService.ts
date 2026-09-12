/**
 * CentralBo — Servicio de Datos para el Panel SuperAdmin Global
 * Módulo 3 — Panel SuperAdmin Global
 * 
 * Centraliza la información general de comercios, usuarios, planes,
 * suscripciones, actividad y configuración global para el MVP.
 */

import {
  PlanDefinition,
  SuperAdminStoreRecord,
  SuperAdminUserRecord,
  StoreStatus,
  StoreType,
  PlanId,
} from '../types';
import { supabase } from './supabase';

// ----------------------------------------------------------------------------
// 4. PLANES OFICIALES DE CENTRALBO
// ----------------------------------------------------------------------------
export const CENTRALBO_PLANS: PlanDefinition[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 49,
    description: 'Plan esencial para iniciar ventas online con tienda PWA rápida y ligera.',
    features: [
      'Funciones básicas de catálogo y venta',
      'PWA instalable (Web App móvil y escritorio)',
      'Tema claro / oscuro integrado',
      'Acceso al panel de administración del comercio',
      'Soporte estándar de la plataforma',
    ],
    restrictions: [
      'Sin personalización avanzada',
      'Sin colores personalizados',
      'Sin dominio propio (acceso vía slug CentralBo)',
    ],
    semiannualDiscountPercent: 10,
    annualDiscountPercent: 20,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 99,
    description: 'Plan profesional con identidad visual de marca y mayor potencia.',
    features: [
      'Todo lo incluido en el plan Basic',
      'Personalización avanzada de tienda',
      'Colores de marca y estilos adaptativos',
      'Soporte para dominio propio',
      'Mayor personalización visual',
      'PWA instalable (Web App móvil y escritorio)',
      'Tema claro / oscuro integrado',
      'Soporte prioritario CentralBo',
    ],
    restrictions: [],
    semiannualDiscountPercent: 10,
    annualDiscountPercent: 20,
  },
];

// ----------------------------------------------------------------------------
// 2. COMERCIOS REGISTRADOS (CON DETALLE COMPLETO)
// ----------------------------------------------------------------------------
export const INITIAL_SUPERADMIN_STORES: SuperAdminStoreRecord[] = [];

const SUPERADMIN_STORES_STORAGE_KEY = 'centralbo_superadmin_stores_v2';

const MOCK_STORE_IDS = new Set([
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
]);
const MOCK_SLUGS = new Set([
  'restaurante-roma',
  'boutique-milano',
  'spa-zenit',
  'los-andes-express',
  'calzados-altiplano',
]);

function loadStoresFromStorage(): SuperAdminStoreRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(SUPERADMIN_STORES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter(
          (s) => s && !MOCK_STORE_IDS.has(s.id) && !MOCK_SLUGS.has(s.slug)
        );
        return filtered;
      }
    }
  } catch (e) {
    console.warn('[CentralBo SuperAdmin] Error al cargar comercios:', e);
  }
  return [];
}

function persistStores(stores: SuperAdminStoreRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUPERADMIN_STORES_STORAGE_KEY, JSON.stringify(stores));
      window.dispatchEvent(new CustomEvent('centralbo:superadmin_stores_changed'));
    }
  } catch (e) {
    console.warn('[CentralBo SuperAdmin] Error al persistir comercios:', e);
  }
  // Sincronizar array en memoria para compatibilidad global
  SUPERADMIN_STORES.splice(0, SUPERADMIN_STORES.length, ...stores);
}

export const SUPERADMIN_STORES: SuperAdminStoreRecord[] = loadStoresFromStorage();

/**
 * Consulta la base de datos Supabase para cargar los comercios reales existentes
 * y los combina con la configuración local sin inyectar datos ficticios.
 */
export async function fetchSuperAdminStores(): Promise<SuperAdminStoreRecord[]> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, slug, store_type, status, logo_url, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[CentralBo SuperAdmin] Error al consultar comercios en Supabase:', error);
      return loadStoresFromStorage();
    }

    if (!data || data.length === 0) {
      persistStores([]);
      return [];
    }

    const localStores = loadStoresFromStorage();
    const localMap = new Map(localStores.map((s) => [s.id, s]));

    const merged: SuperAdminStoreRecord[] = data.map((st) => {
      const existing = localMap.get(st.id);
      if (existing) {
        return {
          ...st,
          name: st.name,
          slug: st.slug,
          store_type: st.store_type,
          status: st.status as StoreStatus,
          logo_url: st.logo_url,
          created_at: st.created_at,
          updated_at: st.updated_at,
          owner: existing.owner,
          subscription: existing.subscription,
          activity: existing.activity,
        };
      }
      return {
        id: st.id,
        name: st.name,
        slug: st.slug,
        store_type: st.store_type,
        status: st.status as StoreStatus,
        logo_url: st.logo_url,
        created_at: st.created_at,
        updated_at: st.updated_at,
        owner: {
          name: 'Dueño de Comercio',
          email: 'contacto@centralbo.com',
          phone: '+591 70000000',
        },
        subscription: {
          planId: 'basic',
          planName: 'Basic',
          status: st.status === 'activo' ? 'activa' : st.status === 'prueba' ? 'prueba' : 'cancelada',
          startDate: st.created_at ? st.created_at.slice(0, 10) : '2026-09-01',
          renewalDate: '2026-10-01',
          billingCycle: 'mensual',
          paymentHistory: [],
        },
        activity: {
          visitas: 0,
          pedidos: 0,
          productos: 0,
          ventas: 0,
          ultimaActividad: 'Sin actividad registrada',
        },
      };
    });

    persistStores(merged);
    return merged;
  } catch (err) {
    console.warn('[CentralBo SuperAdmin] Excepción al sincronizar comercios:', err);
    return loadStoresFromStorage();
  }
}

export interface CreateStoreInput {
  name: string;
  store_type: StoreType;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  planId: PlanId;
  status: StoreStatus;
  slug?: string;
}

export interface UpdateStoreInput {
  name?: string;
  store_type?: StoreType;
  planId?: PlanId;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  socials?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
}

export function getSuperAdminStores(): SuperAdminStoreRecord[] {
  return loadStoresFromStorage();
}

export function getSuperAdminStoreById(id: string): SuperAdminStoreRecord | undefined {
  return getSuperAdminStores().find((s) => s.id === id);
}

export function createSuperAdminStore(input: CreateStoreInput): SuperAdminStoreRecord {
  const current = getSuperAdminStores();

  // Generación de slug limpio y único
  const baseSlug = (input.slug || input.name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `comercio-${Date.now().toString().slice(-4)}`;

  let uniqueSlug = baseSlug;
  let counter = 1;
  while (current.some((s) => s.slug === uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();
  const dateOnly = now.split('T')[0];
  const newId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `store-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const planName = input.planId === 'pro' ? 'Pro' : 'Basic';
  const planPrice = input.planId === 'pro' ? 99 : 49;
  const subStatus =
    input.status === 'prueba' ? 'prueba' : input.status === 'activo' ? 'activa' : 'vencida';

  const newStore: SuperAdminStoreRecord = {
    id: newId,
    name: input.name.trim(),
    slug: uniqueSlug,
    store_type: input.store_type,
    status: input.status,
    logo_url: null,
    created_at: now,
    updated_at: now,
    owner: {
      name: input.ownerName.trim(),
      email: input.ownerEmail.trim().toLowerCase(),
      phone: input.ownerPhone.trim(),
      socials: {
        whatsapp: input.ownerPhone.trim(),
      },
    },
    subscription: {
      planId: input.planId,
      planName: input.status === 'prueba' ? `${planName} (Prueba 14d)` : planName,
      status: subStatus,
      startDate: dateOnly,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      billingCycle: 'mensual',
      paymentHistory: [
        {
          id: `pay-${Date.now()}`,
          date: dateOnly,
          amount: input.status === 'prueba' ? 0 : planPrice,
          currency: 'Bs',
          period: input.status === 'prueba' ? 'Prueba Inicial 14 días' : 'Primer Mes',
          status: 'completado',
          reference: `REG-BOB-${Math.floor(10000 + Math.random() * 90000)}`,
        },
      ],
    },
    activity: {
      visitas: 0,
      pedidos: 0,
      productos: 0,
      ventas: 0,
      ultimaActividad: 'Recién creado',
    },
  };

  const updatedList = [newStore, ...current];
  persistStores(updatedList);
  return newStore;
}

export function updateSuperAdminStore(id: string, updates: UpdateStoreInput): SuperAdminStoreRecord {
  const current = getSuperAdminStores();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error(`Comercio con id ${id} no encontrado`);
  }

  const existing = current[index];
  const now = new Date().toISOString();

  const updatedSubscription = { ...existing.subscription };
  if (updates.planId && updates.planId !== existing.subscription.planId) {
    const planName = updates.planId === 'pro' ? 'Pro' : 'Basic';
    updatedSubscription.planId = updates.planId;
    updatedSubscription.planName =
      existing.status === 'prueba' ? `${planName} (Prueba)` : planName;
  }

  const updatedStore: SuperAdminStoreRecord = {
    ...existing,
    name: updates.name ? updates.name.trim() : existing.name,
    store_type: updates.store_type || existing.store_type,
    updated_at: now,
    owner: {
      ...existing.owner,
      name: updates.ownerName ? updates.ownerName.trim() : existing.owner.name,
      email: updates.ownerEmail ? updates.ownerEmail.trim().toLowerCase() : existing.owner.email,
      phone: updates.ownerPhone ? updates.ownerPhone.trim() : existing.owner.phone,
      socials: {
        ...existing.owner.socials,
        ...(updates.socials || {}),
      },
    },
    subscription: updatedSubscription,
  };

  current[index] = updatedStore;
  persistStores(current);
  return updatedStore;
}

export function setStoreStatus(id: string, newStatus: StoreStatus): SuperAdminStoreRecord {
  const current = getSuperAdminStores();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error(`Comercio con id ${id} no encontrado`);
  }

  const existing = current[index];
  const now = new Date().toISOString();

  let subStatus = existing.subscription.status;
  if (newStatus === 'activo' && (subStatus === 'cancelada' || subStatus === 'vencida')) {
    subStatus = 'activa';
  }

  const updatedStore: SuperAdminStoreRecord = {
    ...existing,
    status: newStatus,
    updated_at: now,
    subscription: {
      ...existing.subscription,
      status: subStatus,
    },
  };

  current[index] = updatedStore;
  persistStores(current);
  return updatedStore;
}

export function activateStore(id: string): SuperAdminStoreRecord {
  return setStoreStatus(id, 'activo');
}

export function deactivateStore(id: string): SuperAdminStoreRecord {
  return setStoreStatus(id, 'inactivo');
}

export function suspendStore(id: string): SuperAdminStoreRecord {
  return setStoreStatus(id, 'suspendido');
}

export function deleteSuperAdminStorePermanently(id: string): boolean {
  const current = getSuperAdminStores();
  const filtered = current.filter((s) => s.id !== id);
  if (filtered.length === current.length) {
    return false;
  }
  persistStores(filtered);

  // Limpiar almacenamiento del comercio si existía
  try {
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(id)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Limpiar invitaciones asociadas al comercio eliminado para evitar registros huérfanos
      const rawInv = localStorage.getItem('centralbo_store_owner_invitations_v1');
      if (rawInv) {
        const parsedInv = JSON.parse(rawInv);
        if (Array.isArray(parsedInv)) {
          const remainingInv = parsedInv.filter((inv: { storeId?: string }) => inv.storeId !== id);
          localStorage.setItem('centralbo_store_owner_invitations_v1', JSON.stringify(remainingInv));
          window.dispatchEvent(new CustomEvent('centralbo:store_owner_invitation_changed'));
        }
      }
    }
  } catch {
    // Ignorar fallos menores de limpieza local
  }

  return true;
}

// ----------------------------------------------------------------------------
// 3. USUARIOS REGISTRADOS (CON DISTINCIÓN CLARA DE LOS 3 PERFILES OFICIALES)
// ----------------------------------------------------------------------------
export const SUPERADMIN_USERS: SuperAdminUserRecord[] = [];

// ----------------------------------------------------------------------------
// MÉTRICAS Y RESUMEN DEL DASHBOARD
// ----------------------------------------------------------------------------
export function getSuperAdminDashboardMetrics() {
  const totalStores = SUPERADMIN_STORES.length;
  const activeStores = SUPERADMIN_STORES.filter((s) => s.status === 'activo').length;
  const inactiveStores = SUPERADMIN_STORES.filter((s) => s.status === 'inactivo').length;
  const suspendedStores = SUPERADMIN_STORES.filter((s) => s.status === 'suspendido').length;
  const trialStores = SUPERADMIN_STORES.filter((s) => s.status === 'prueba').length;

  const baseUsers = SUPERADMIN_USERS;
  const storeOwnersCount = SUPERADMIN_STORES.filter((s) => s.owner?.email).length;
  const totalUsers = baseUsers.length > 0 ? baseUsers.length : storeOwnersCount;
  const superAdminUsers = baseUsers.filter((u) => u.profile === 'superadmin').length;
  const storeAdminUsers = baseUsers.length > 0
    ? baseUsers.filter((u) => u.profile === 'store_admin').length
    : storeOwnersCount;
  const publicClientUsers = baseUsers.filter((u) => u.profile === 'public_client').length;

  const totalPlans = CENTRALBO_PLANS.length;
  const totalSubscriptions = SUPERADMIN_STORES.length;
  const activeSubscriptions = SUPERADMIN_STORES.filter(
    (s) => s.subscription.status === 'activa'
  ).length;
  const trialSubscriptions = SUPERADMIN_STORES.filter(
    (s) => s.subscription.status === 'prueba'
  ).length;
  const expiredSubscriptions = SUPERADMIN_STORES.filter(
    (s) => s.subscription.status === 'vencida' || s.subscription.status === 'cancelada'
  ).length;

  // Actividad general acumulada
  const totalVisitas = SUPERADMIN_STORES.reduce((sum, s) => sum + s.activity.visitas, 0);
  const totalPedidos = SUPERADMIN_STORES.reduce((sum, s) => sum + s.activity.pedidos, 0);
  const totalProductos = SUPERADMIN_STORES.reduce((sum, s) => sum + s.activity.productos, 0);
  const totalVentasBs = SUPERADMIN_STORES.reduce((sum, s) => sum + s.activity.ventas, 0);

  return {
    stores: {
      total: totalStores,
      activos: activeStores,
      inactivos: inactiveStores,
      suspendidos: suspendedStores,
      prueba: trialStores,
    },
    users: {
      total: totalUsers,
      superadmins: superAdminUsers,
      storeAdmins: storeAdminUsers,
      publicClients: publicClientUsers,
    },
    plans: {
      total: totalPlans,
      basicName: 'Basic (Bs 49/mes)',
      proName: 'Pro (Bs 99/mes)',
    },
    subscriptions: {
      total: totalSubscriptions,
      activas: activeSubscriptions,
      prueba: trialSubscriptions,
      vencidas: expiredSubscriptions,
    },
    activity: {
      totalVisitas,
      totalPedidos,
      totalProductos,
      totalVentasBs,
      ultimaActividadGeneral:
        SUPERADMIN_STORES.length > 0
          ? `Actividad reciente (${SUPERADMIN_STORES[0].name})`
          : 'Sin actividad registrada',
    },
  };
}
