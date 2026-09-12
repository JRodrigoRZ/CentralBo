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

/**
 * Resuelve un comercio público a partir de su slug único
 * Consulta directamente Supabase respetando RLS y devuelve null si no existe.
 */
export async function resolveStoreBySlug(slug: string): Promise<Store | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, slug, store_type, status, logo_url, created_at, updated_at')
      .eq('slug', normalizedSlug)
      .in('status', ['activo', 'prueba'])
      .maybeSingle();

    if (!error && data) {
      return data as Store;
    }
  } catch (err) {
    console.warn('[CentralBo] Consulta remota de slug:', err);
  }

  return null;
}

/**
 * Resuelve un comercio por su UUID tenant_id
 * Consulta directamente Supabase y devuelve null si no existe.
 */
export async function resolveStoreById(tenantId: string): Promise<Store | null> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, slug, store_type, status, logo_url, created_at, updated_at')
      .eq('id', tenantId)
      .maybeSingle();

    if (!error && data) {
      return data as Store;
    }
  } catch (err) {
    console.warn('[CentralBo] Consulta remota de tenant por ID:', err);
  }

  return null;
}

/**
 * Obtiene la lista de comercios públicos activos desde Supabase.
 * Si no existen comercios en la base de datos, devuelve un arreglo vacío [].
 */
export async function getPublicStores(): Promise<Store[]> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, slug, store_type, status, logo_url, created_at, updated_at')
      .in('status', ['activo', 'prueba'])
      .order('name');

    if (!error && data) {
      return data as Store[];
    }
  } catch (err) {
    console.warn('[CentralBo] Consulta remota de comercios públicos:', err);
  }

  return [];
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
