/**
 * CentralBo — Servicio de Resolución Multi-Tenant
 *
 * Módulo 2: Autenticación y Router Multi-Tenant
 * 
 * Reglas de Seguridad & Aislamiento:
 * 1. Resuelve comercios públicos mediante su slug sin requerir credenciales.
 * 2. Asocia a los administradores exclusivamente con su tenant_id.
 * 3. Utiliza la seguridad de Supabase y políticas RLS como autoridad principal.
 */

import { supabase } from './supabase';
import { Store, StoreUserRole, CentralBoProfile, AuthenticatedUser } from '../types';

// Comercios base validados (definidos en la suite de pruebas de la Fase 1: 04_validation_tests.sql)
export const BASELINE_STORES: Store[] = [
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'Restaurante Gourmet Roma',
    slug: 'restaurante-roma',
    store_type: 'restaurante',
    status: 'activo',
    logo_url: null,
    created_at: '2026-09-01T12:00:00Z',
    updated_at: '2026-09-01T12:00:00Z',
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    name: 'Boutique Milano Moda',
    slug: 'boutique-milano',
    store_type: 'moda',
    status: 'activo',
    logo_url: null,
    created_at: '2026-09-02T12:00:00Z',
    updated_at: '2026-09-02T12:00:00Z',
  },
  {
    id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    name: 'Salón & Spa Zenit',
    slug: 'spa-zenit',
    store_type: 'servicios',
    status: 'activo',
    logo_url: null,
    created_at: '2026-09-03T12:00:00Z',
    updated_at: '2026-09-03T12:00:00Z',
  },
  {
    id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    name: 'SuperMarket Los Andes Express',
    slug: 'los-andes-express',
    store_type: 'general',
    status: 'activo',
    logo_url: null,
    created_at: '2026-09-04T12:00:00Z',
    updated_at: '2026-09-04T12:00:00Z',
  },
];

// Perfiles oficiales de demostración para pruebas inmediatas de los 4 tipos de tienda
export const DEMO_IDENTITIES = {
  superadmin: {
    id: 'sa-00000000-0000-4000-8000-000000000001',
    email: 'superadmin@centralbo.com',
    fullName: 'SuperAdmin Global CentralBo',
    profile: 'superadmin' as CentralBoProfile,
    tenantId: null,
    store: null,
    storeRole: 'superadmin' as StoreUserRole,
  },
  adminRoma: {
    id: 'adm-11111111-1111-4111-8111-111111111111',
    email: 'admin@roma.com',
    fullName: 'Administrador Restaurante Roma',
    profile: 'store_admin' as CentralBoProfile,
    tenantId: BASELINE_STORES[0].id,
    store: BASELINE_STORES[0],
    storeRole: 'admin' as StoreUserRole,
  },
  adminMilano: {
    id: 'adm-22222222-2222-4222-8222-222222222222',
    email: 'admin@milano.com',
    fullName: 'Administrador Boutique Milano',
    profile: 'store_admin' as CentralBoProfile,
    tenantId: BASELINE_STORES[1].id,
    store: BASELINE_STORES[1],
    storeRole: 'admin' as StoreUserRole,
  },
  adminZenit: {
    id: 'adm-33333333-3333-4333-8333-333333333333',
    email: 'admin@spazenit.com',
    fullName: 'Administradora Salón & Spa Zenit',
    profile: 'store_admin' as CentralBoProfile,
    tenantId: BASELINE_STORES[2].id,
    store: BASELINE_STORES[2],
    storeRole: 'admin' as StoreUserRole,
  },
  adminLosAndes: {
    id: 'adm-44444444-4444-4444-8444-444444444444',
    email: 'admin@losandes.com',
    fullName: 'Administrador SuperMarket Los Andes',
    profile: 'store_admin' as CentralBoProfile,
    tenantId: BASELINE_STORES[3].id,
    store: BASELINE_STORES[3],
    storeRole: 'admin' as StoreUserRole,
  },
};

/**
 * Resuelve un comercio público a partir de su slug único
 * No requiere autenticación (acceso público para clientes)
 */
export async function resolveStoreBySlug(slug: string): Promise<Store | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  try {
    // 1. Consultar base de datos Supabase respetando RLS stores_public_read
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', normalizedSlug)
      .in('status', ['activo', 'prueba'])
      .maybeSingle();

    if (!error && data) {
      return data as Store;
    }
  } catch (err) {
    console.warn('[CentralBo] Consulta remota de slug:', err);
  }

  // 2. Fallback a catálogo base validado de la Fase 1
  const baseline = BASELINE_STORES.find(
    (s) => s.slug?.toLowerCase() === normalizedSlug
  );

  return baseline || null;
}

/**
 * Resuelve un comercio por su UUID tenant_id
 */
export async function resolveStoreById(tenantId: string): Promise<Store | null> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle();

    if (!error && data) {
      return data as Store;
    }
  } catch (err) {
    console.warn('[CentralBo] Consulta remota de tenant por ID:', err);
  }

  const baseline = BASELINE_STORES.find((s) => s.id === tenantId);
  return baseline || null;
}

/**
 * Obtiene la lista de comercios públicos activos
 */
export async function getPublicStores(): Promise<Store[]> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .in('status', ['activo', 'prueba'])
      .order('name');

    if (!error && data && data.length > 0) {
      return data as Store[];
    }
  } catch (err) {
    console.warn('[CentralBo] Consulta remota de comercios públicos:', err);
  }

  return BASELINE_STORES;
}

/**
 * Resuelve el perfil y tenant de un usuario autenticado en Supabase
 */
export async function resolveUserProfile(
  userId: string,
  userEmail: string
): Promise<AuthenticatedUser> {
  try {
    // 1. Consultar tabla store_users de Supabase
    const { data: storeUserData, error } = await supabase
      .from('store_users')
      .select('*, stores(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && storeUserData) {
      const role = storeUserData.role as StoreUserRole;

      if (role === 'superadmin') {
        return {
          id: userId,
          email: userEmail,
          fullName: storeUserData.full_name || 'SuperAdmin CentralBo',
          profile: 'superadmin',
          tenantId: null,
          store: null,
          storeRole: 'superadmin',
        };
      }

      const store = (storeUserData.stores as unknown as Store) || null;
      return {
        id: userId,
        email: userEmail,
        fullName: storeUserData.full_name || userEmail.split('@')[0],
        profile: 'store_admin',
        tenantId: storeUserData.tenant_id,
        store: store,
        storeRole: role,
      };
    }
  } catch (err) {
    console.warn('[CentralBo] Error al resolver perfil desde Supabase:', err);
  }

  // =========================================================================
  // FALLBACK SEGURO ESTRICTO (Etapa 11B)
  // =========================================================================
  // Si no existe un registro administrativo activo en Supabase (store_users con is_active=true),
  // el usuario se resuelve estrictamente como cliente público (public_client) sin privilegios
  // administrativos, sin tenantId y sin storeRole.
  // Las invitaciones locales o datos en localStorage NO pueden otorgar ni reconstruir un perfil store_admin.
  return {
    id: userId,
    email: userEmail,
    fullName: userEmail ? userEmail.split('@')[0] : 'Cliente',
    profile: 'public_client',
    tenantId: null,
    store: null,
    storeRole: null,
  };
}
