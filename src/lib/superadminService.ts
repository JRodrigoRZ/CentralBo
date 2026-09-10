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
import { BASELINE_STORES } from './multiTenantService';
import { MOCK_SUPERADMIN_USERS } from './mockUsersData';

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
export const INITIAL_SUPERADMIN_STORES: SuperAdminStoreRecord[] = [
  {
    ...BASELINE_STORES[0], // Restaurante Gourmet Roma
    status: 'activo' as StoreStatus,
    owner: {
      name: 'Marco Antonio Rossi',
      email: 'admin@roma.com',
      phone: '+591 71023456',
      socials: {
        whatsapp: '+591 71023456',
        instagram: '@roma_gourmet_bo',
        facebook: 'RomaGourmetBolivia',
      },
    },
    subscription: {
      planId: 'pro',
      planName: 'Pro',
      status: 'activa',
      startDate: '2026-08-01',
      renewalDate: '2026-09-01',
      billingCycle: 'mensual',
      paymentHistory: [
        {
          id: 'pay-roma-01',
          date: '2026-08-01',
          amount: 99,
          currency: 'Bs',
          period: 'Agosto 2026',
          status: 'completado',
          reference: 'TRANS-BOB-90211',
        },
        {
          id: 'pay-roma-02',
          date: '2026-07-01',
          amount: 99,
          currency: 'Bs',
          period: 'Julio 2026',
          status: 'completado',
          reference: 'TRANS-BOB-81452',
        },
      ],
    },
    activity: {
      visitas: 3420,
      pedidos: 184,
      productos: 36,
      ventas: 14850,
      ultimaActividad: 'Hace 12 minutos',
    },
  },
  {
    ...BASELINE_STORES[1], // Boutique Milano Moda
    status: 'activo' as StoreStatus,
    owner: {
      name: 'Lucía Fernández Soria',
      email: 'admin@milano.com',
      phone: '+591 72198765',
      socials: {
        whatsapp: '+591 72198765',
        instagram: '@milanomoda_bo',
      },
    },
    subscription: {
      planId: 'basic',
      planName: 'Basic',
      status: 'activa',
      startDate: '2026-07-15',
      renewalDate: '2026-09-15',
      billingCycle: 'mensual',
      paymentHistory: [
        {
          id: 'pay-milano-01',
          date: '2026-08-15',
          amount: 49,
          currency: 'Bs',
          period: 'Agosto - Septiembre 2026',
          status: 'completado',
          reference: 'TRANS-BOB-92301',
        },
        {
          id: 'pay-milano-02',
          date: '2026-07-15',
          amount: 49,
          currency: 'Bs',
          period: 'Julio - Agosto 2026',
          status: 'completado',
          reference: 'TRANS-BOB-84719',
        },
      ],
    },
    activity: {
      visitas: 2150,
      pedidos: 92,
      productos: 64,
      ventas: 9800,
      ultimaActividad: 'Hace 45 minutos',
    },
  },
  {
    ...BASELINE_STORES[2], // Salón & Spa Zenit
    status: 'prueba' as StoreStatus,
    owner: {
      name: 'Valeria Domínguez',
      email: 'valeria@spazenit.com',
      phone: '+591 73456123',
      socials: {
        whatsapp: '+591 73456123',
        instagram: '@spazenit_bo',
        facebook: 'SpaZenitBolivia',
      },
    },
    subscription: {
      planId: 'pro',
      planName: 'Pro (Periodo de Prueba)',
      status: 'prueba',
      startDate: '2026-08-25',
      renewalDate: '2026-09-08',
      billingCycle: 'mensual',
      paymentHistory: [
        {
          id: 'pay-zenit-01',
          date: '2026-08-25',
          amount: 0,
          currency: 'Bs',
          period: 'Prueba Gratuita 14 días',
          status: 'completado',
          reference: 'TRIAL-ZENIT-001',
        },
      ],
    },
    activity: {
      visitas: 620,
      pedidos: 18,
      productos: 14,
      ventas: 2300,
      ultimaActividad: 'Hace 2 horas',
    },
  },
  {
    id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    name: 'Calzados Altiplano & Cuero',
    slug: 'calzados-altiplano',
    store_type: 'moda',
    status: 'inactivo' as StoreStatus,
    logo_url: null,
    created_at: '2026-07-10T10:00:00Z',
    updated_at: '2026-08-15T15:00:00Z',
    owner: {
      name: 'Jorge Alarcón',
      email: 'jorge@calzadosaltiplano.bo',
      phone: '+591 76543210',
    },
    subscription: {
      planId: 'basic',
      planName: 'Basic',
      status: 'vencida',
      startDate: '2026-07-10',
      renewalDate: '2026-08-10',
      billingCycle: 'mensual',
      paymentHistory: [
        {
          id: 'pay-altiplano-01',
          date: '2026-07-10',
          amount: 49,
          currency: 'Bs',
          period: 'Julio 2026',
          status: 'completado',
          reference: 'TRANS-BOB-78100',
        },
      ],
    },
    activity: {
      visitas: 410,
      pedidos: 9,
      productos: 22,
      ventas: 1150,
      ultimaActividad: 'Hace 2 semanas',
    },
  },
  {
    id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    name: 'SuperMarket Los Andes Express',
    slug: 'los-andes-express',
    store_type: 'general',
    status: 'suspendido' as StoreStatus,
    logo_url: null,
    created_at: '2026-06-01T08:30:00Z',
    updated_at: '2026-08-20T11:00:00Z',
    owner: {
      name: 'Gonzalo Peñaranda',
      email: 'admin@losandesexpress.com',
      phone: '+591 79812345',
    },
    subscription: {
      planId: 'pro',
      planName: 'Pro',
      status: 'cancelada',
      startDate: '2026-06-01',
      renewalDate: '2026-08-01',
      billingCycle: 'mensual',
      paymentHistory: [
        {
          id: 'pay-andes-01',
          date: '2026-07-01',
          amount: 99,
          currency: 'Bs',
          period: 'Julio 2026',
          status: 'completado',
          reference: 'TRANS-BOB-80911',
        },
        {
          id: 'pay-andes-02',
          date: '2026-06-01',
          amount: 99,
          currency: 'Bs',
          period: 'Junio 2026',
          status: 'completado',
          reference: 'TRANS-BOB-72144',
        },
      ],
    },
    activity: {
      visitas: 1200,
      pedidos: 45,
      productos: 110,
      ventas: 5400,
      ultimaActividad: 'Hace 1 mes',
    },
  },
];

const SUPERADMIN_STORES_STORAGE_KEY = 'centralbo_superadmin_stores_v2';

function loadStoresFromStorage(): SuperAdminStoreRecord[] {
  if (typeof window === 'undefined') {
    return [...INITIAL_SUPERADMIN_STORES];
  }
  try {
    const raw = localStorage.getItem(SUPERADMIN_STORES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[CentralBo SuperAdmin] Error al cargar comercios:', e);
  }
  return [...INITIAL_SUPERADMIN_STORES];
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
export const SUPERADMIN_USERS: SuperAdminUserRecord[] = [...MOCK_SUPERADMIN_USERS];

// ----------------------------------------------------------------------------
// MÉTRICAS Y RESUMEN DEL DASHBOARD
// ----------------------------------------------------------------------------
export function getSuperAdminDashboardMetrics() {
  const totalStores = SUPERADMIN_STORES.length;
  const activeStores = SUPERADMIN_STORES.filter((s) => s.status === 'activo').length;
  const inactiveStores = SUPERADMIN_STORES.filter((s) => s.status === 'inactivo').length;
  const suspendedStores = SUPERADMIN_STORES.filter((s) => s.status === 'suspendido').length;
  const trialStores = SUPERADMIN_STORES.filter((s) => s.status === 'prueba').length;

  const totalUsers = SUPERADMIN_USERS.length;
  const superAdminUsers = SUPERADMIN_USERS.filter((u) => u.profile === 'superadmin').length;
  const storeAdminUsers = SUPERADMIN_USERS.filter((u) => u.profile === 'store_admin').length;
  const publicClientUsers = SUPERADMIN_USERS.filter((u) => u.profile === 'public_client').length;

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
      ultimaActividadGeneral: 'Hace 12 minutos (Restaurante Gourmet Roma)',
    },
  };
}
