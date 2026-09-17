/**
 * CentralBo — Servicio del Panel Admin de Tienda
 * Módulo 4 — Panel Admin de Tienda
 * 
 * Reglas de Seguridad & Aislamiento:
 * 1. Todos los métodos exigen y filtran estrictamente por tenant_id.
 * 2. Un administrador solo puede leer y alterar los datos de su propio comercio.
 * 3. Se respeta la discriminación de capacidades según el plan (Basic vs Pro).
 * 4. Persiste en almacenamiento local del tenant y sincroniza con Supabase.
 */

import {
  Category,
  Product,
  Order,
  StoreProfileSettings,
  StoreAppearanceSettings,
  StoreScheduleDay,
  StoreShippingSettings,
  StoreScheduledOrdersSettings,
  StorePaymentSettings,
  RestaurantSettings,
  FashionSettings,
  GeneralSettings,
  ServiceItem,
  ProfessionalItem,
  ProfessionalDaySchedule,
  ProfessionalAgendaSlot,
  AgendaSlotStatus,
  ReservedTimeSlot,
  AppointmentRequest,
  PromotionCode,
  StoreStatistics,
  OrderStatus,
  StoreType,
  StoreHighlightItem,
  StoreHighlightsLayout,
} from '../types';
import { SUPERADMIN_STORES } from './superadminService';
import { supabase } from './supabase';

// ----------------------------------------------------------------------------
// ESTADO Y PLAN DEL COMERCIO
// ----------------------------------------------------------------------------
export function getStorePlan(tenantId: string): 'basic' | 'pro' {
  const adminStore = SUPERADMIN_STORES.find((s) => s.id === tenantId);
  if (adminStore) {
    return adminStore.subscription.planId;
  }
  // Por defecto, asignar basic si no está registrado en el superadmin
  return 'basic';
}

// ----------------------------------------------------------------------------
// DATOS SEMILLA POR TENANT (Módulo 4)
// ----------------------------------------------------------------------------

const TENANT_STORAGE_PREFIX = 'centralbo_store_data_v4_';

function isValidTenantId(tenantId: string | undefined | null): boolean {
  return (
    typeof tenantId === 'string' &&
    tenantId.trim().length > 0 &&
    tenantId !== 'undefined' &&
    tenantId !== 'null'
  );
}

function getStorageKey(tenantId: string, section: string): string {
  return `${TENANT_STORAGE_PREFIX}${tenantId.trim()}_${section.trim()}`;
}

export const CANONICAL_ORDER_STATUSES: readonly string[] = [
  'pendiente',
  'recibido',
  'pagado',
  'en_preparacion',
  'despachado',
  'completado',
  'cancelado',
];

function cloneFallback<T>(fallback: T): T {
  if (typeof fallback === 'object' && fallback !== null) {
    try {
      return JSON.parse(JSON.stringify(fallback)) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function sanitizeProductItem(item: any, tenantId: string): Product | null {
  if (
    !item ||
    typeof item !== 'object' ||
    typeof item.id !== 'string' ||
    !item.id.trim() ||
    typeof item.name !== 'string' ||
    !item.name.trim() ||
    typeof item.price !== 'number' ||
    !Number.isFinite(item.price) ||
    item.price < 0
  ) {
    return null;
  }

  // Sanear atributos descartando propiedades arbitrarias
  const rawAttrs = (item.attributes && typeof item.attributes === 'object' && !Array.isArray(item.attributes))
    ? item.attributes
    : {};
  
  const cleanAttrs: Record<string, unknown> = {};
  if (typeof rawAttrs.is_featured === 'boolean') cleanAttrs.is_featured = rawAttrs.is_featured;
  if (typeof rawAttrs.previous_price === 'number' && Number.isFinite(rawAttrs.previous_price) && rawAttrs.previous_price >= 0) {
    cleanAttrs.previous_price = rawAttrs.previous_price;
  } else {
    cleanAttrs.previous_price = null;
  }
  if (typeof rawAttrs.offer_price === 'number' && Number.isFinite(rawAttrs.offer_price) && rawAttrs.offer_price >= 0) {
    cleanAttrs.offer_price = rawAttrs.offer_price;
  } else {
    cleanAttrs.offer_price = null;
  }
  if (Array.isArray(rawAttrs.sizes)) {
    cleanAttrs.sizes = rawAttrs.sizes.filter((s: unknown) => typeof s === 'string').slice(0, 20);
  }
  if (Array.isArray(rawAttrs.colors)) {
    cleanAttrs.colors = rawAttrs.colors.filter((c: any) => c && typeof c === 'object' && typeof c.name === 'string').slice(0, 20);
  }
  if (typeof rawAttrs.kitchen_notes_allowed === 'boolean') cleanAttrs.kitchen_notes_allowed = rawAttrs.kitchen_notes_allowed;
  if (Array.isArray(rawAttrs.modifiers)) cleanAttrs.modifiers = rawAttrs.modifiers.slice(0, 30);
  if (typeof rawAttrs.is_combo === 'boolean') cleanAttrs.is_combo = rawAttrs.is_combo;
  if (typeof rawAttrs.duration_minutes === 'number' && Number.isFinite(rawAttrs.duration_minutes) && rawAttrs.duration_minutes > 0) {
    cleanAttrs.duration_minutes = rawAttrs.duration_minutes;
  }
  if (typeof rawAttrs.professional_id === 'string') cleanAttrs.professional_id = rawAttrs.professional_id;

  return {
    id: String(item.id).trim(),
    tenant_id: typeof item.tenant_id === 'string' && item.tenant_id.trim() ? item.tenant_id.trim() : tenantId,
    category_id: typeof item.category_id === 'string' ? item.category_id : null,
    name: String(item.name).trim().slice(0, 150),
    description: typeof item.description === 'string' ? item.description.slice(0, 1000) : null,
    price: Number(item.price),
    is_available: Boolean(item.is_available),
    image_url: typeof item.image_url === 'string' ? item.image_url : null,
    status: (item.status === 'inactivo' || item.status === 'agotado') ? item.status : 'activo',
    attributes: cleanAttrs,
    created_at: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
    updated_at: typeof item.updated_at === 'string' ? item.updated_at : new Date().toISOString(),
  };
}

function sanitizeOrderItem(item: any, tenantId: string): Order | null {
  if (
    !item ||
    typeof item !== 'object' ||
    typeof item.id !== 'string' ||
    !item.id.trim() ||
    typeof item.total !== 'number' ||
    !Number.isFinite(item.total) ||
    item.total < 0
  ) {
    return null;
  }

  const validStatus = (typeof item.status === 'string' && CANONICAL_ORDER_STATUSES.includes(item.status))
    ? (item.status as OrderStatus)
    : 'pendiente';

  return {
    id: String(item.id).trim(),
    tenant_id: typeof item.tenant_id === 'string' && item.tenant_id.trim() ? item.tenant_id.trim() : tenantId,
    customer_id: typeof item.customer_id === 'string' ? item.customer_id : null,
    customer_name: typeof item.customer_name === 'string' ? item.customer_name.slice(0, 100) : null,
    customer_email: typeof item.customer_email === 'string' ? item.customer_email.slice(0, 120) : null,
    customer_phone: typeof item.customer_phone === 'string' ? item.customer_phone.slice(0, 25) : null,
    status: validStatus,
    total: Number(item.total),
    created_at: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
    updated_at: typeof item.updated_at === 'string' ? item.updated_at : new Date().toISOString(),
  };
}

function sanitizeCategoryItem(item: any, tenantId: string): Category | null {
  if (
    !item ||
    typeof item !== 'object' ||
    typeof item.id !== 'string' ||
    !item.id.trim() ||
    typeof item.name !== 'string' ||
    !item.name.trim()
  ) {
    return null;
  }

  return {
    id: String(item.id).trim(),
    tenant_id: typeof item.tenant_id === 'string' && item.tenant_id.trim() ? item.tenant_id.trim() : tenantId,
    name: String(item.name).trim().slice(0, 100),
    status: item.status === 'inactivo' ? 'inactivo' : 'activo',
    created_at: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
    updated_at: typeof item.updated_at === 'string' ? item.updated_at : new Date().toISOString(),
  };
}

function loadFromStorage<T>(tenantId: string, section: string, fallback: T): T {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return cloneFallback(fallback);
  }
  if (!isValidTenantId(tenantId)) {
    console.warn(`[CentralBo StoreAdmin] Intento de acceso a sección "${section}" con tenantId inválido: "${tenantId}"`);
    return cloneFallback(fallback);
  }
  try {
    const raw = localStorage.getItem(getStorageKey(tenantId, section));
    if (raw) {
      const parsed = JSON.parse(raw);

      // Si el fallback esperado es un Array, validar que parsed sea Array y descartar corruptos
      if (Array.isArray(fallback)) {
        if (!Array.isArray(parsed)) {
          console.warn(`[CentralBo StoreAdmin] Se esperaba un array para "${section}", recibido:`, typeof parsed);
          return cloneFallback(fallback);
        }

        if (section === 'products') {
          const sanitizedProducts = parsed
            .map((item) => sanitizeProductItem(item, tenantId))
            .filter((p): p is Product => p !== null);
          return (sanitizedProducts.length > 0 ? sanitizedProducts : cloneFallback(fallback)) as unknown as T;
        }

        if (section === 'orders') {
          const sanitizedOrders = parsed
            .map((item) => sanitizeOrderItem(item, tenantId))
            .filter((o): o is Order => o !== null);
          return sanitizedOrders as unknown as T;
        }

        if (section === 'categories') {
          const sanitizedCategories = parsed
            .map((item) => sanitizeCategoryItem(item, tenantId))
            .filter((c): c is Category => c !== null);
          return (sanitizedCategories.length > 0 ? sanitizedCategories : cloneFallback(fallback)) as unknown as T;
        }

        // Para otras colecciones (schedule, promotions, professionals, appointments):
        // descartar elementos que no sean objetos válidos
        const cleanList = parsed.filter(
          (item) => item !== null && typeof item === 'object' && !Array.isArray(item)
        );
        return cleanList as unknown as T;
      }

      // Si el fallback es un objeto individual, validar tipo objeto no nulo y no array
      if (typeof fallback === 'object' && fallback !== null) {
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          console.warn(`[CentralBo StoreAdmin] Se esperaba un objeto para "${section}", recibido:`, typeof parsed);
          return cloneFallback(fallback);
        }
        return parsed as T;
      }

      return parsed as T;
    }
  } catch (e) {
    console.warn(`[CentralBo StoreAdmin] Error al cargar ${section} (JSON inválido o corrupto):`, e);
  }
  return cloneFallback(fallback);
}

function saveToStorage<T>(tenantId: string, section: string, data: T): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  if (!isValidTenantId(tenantId)) {
    console.warn(`[CentralBo StoreAdmin] Intento de persistir sección "${section}" con tenantId inválido: "${tenantId}"`);
    return;
  }
  try {
    localStorage.setItem(getStorageKey(tenantId, section), JSON.stringify(data));
  } catch (e) {
    console.warn(`[CentralBo StoreAdmin] Error al guardar ${section}:`, e);
  }
}

// ----------------------------------------------------------------------------
// 1. HORARIOS SEMILLA (Lunes a Domingo con múltiples períodos)
// ----------------------------------------------------------------------------
export const DEFAULT_WEEK_SCHEDULE: StoreScheduleDay[] = [
  {
    dayOfWeek: 1,
    dayName: 'Lunes',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '20:30' },
    ],
  },
  {
    dayOfWeek: 2,
    dayName: 'Martes',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '20:30' },
    ],
  },
  {
    dayOfWeek: 3,
    dayName: 'Miércoles',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '20:30' },
    ],
  },
  {
    dayOfWeek: 4,
    dayName: 'Jueves',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '20:30' },
    ],
  },
  {
    dayOfWeek: 5,
    dayName: 'Viernes',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '21:30' },
    ],
  },
  {
    dayOfWeek: 6,
    dayName: 'Sábado',
    isOpen: true,
    periods: [{ open: '09:00', close: '18:00' }],
  },
  {
    dayOfWeek: 0,
    dayName: 'Domingo',
    isOpen: false,
    periods: [{ open: '10:00', close: '14:00' }],
  },
];

// Cálculo de estado en vivo del comercio: "Abierto ahora", "Cerrado", "Próxima apertura"
export function calculateScheduleStatus(schedule: StoreScheduleDay[]): {
  isOpenNow: boolean;
  statusLabel: 'Abierto ahora' | 'Cerrado';
  nextOpeningInfo: string;
} {
  const now = new Date();
  // Hora de Bolivia GMT-4 aproximada
  const currentDayOfWeek = now.getDay(); // 0 a 6
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const todayConfig = schedule.find((s) => s.dayOfWeek === currentDayOfWeek);

  if (todayConfig && todayConfig.isOpen) {
    for (const period of todayConfig.periods) {
      if (currentTimeStr >= period.open && currentTimeStr <= period.close) {
        return {
          isOpenNow: true,
          statusLabel: 'Abierto ahora',
          nextOpeningInfo: `Cierra hoy a las ${period.close}`,
        };
      }
    }
  }

  // Buscar próxima apertura
  // Revisar si hoy tiene un período posterior
  if (todayConfig && todayConfig.isOpen) {
    for (const period of todayConfig.periods) {
      if (currentTimeStr < period.open) {
        return {
          isOpenNow: false,
          statusLabel: 'Cerrado',
          nextOpeningInfo: `Abre hoy a las ${period.open}`,
        };
      }
    }
  }

  // Buscar en los siguientes días
  for (let offset = 1; offset <= 7; offset++) {
    const nextDayIndex = (currentDayOfWeek + offset) % 7;
    const nextDayConfig = schedule.find((s) => s.dayOfWeek === nextDayIndex);
    if (nextDayConfig && nextDayConfig.isOpen && nextDayConfig.periods.length > 0) {
      const firstPeriod = nextDayConfig.periods[0];
      const prefix = offset === 1 ? 'mañana' : `el ${nextDayConfig.dayName}`;
      return {
        isOpenNow: false,
        statusLabel: 'Cerrado',
        nextOpeningInfo: `Próxima apertura: ${prefix} a las ${firstPeriod.open}`,
      };
    }
  }

  return {
    isOpenNow: false,
    statusLabel: 'Cerrado',
    nextOpeningInfo: 'Sin horario próximo definido',
  };
}

// ----------------------------------------------------------------------------
// 2. PERFIL DE TIENDA
// ----------------------------------------------------------------------------
export function getStoreProfile(tenantId: string): StoreProfileSettings {
  const adminRecord = SUPERADMIN_STORES.find((s) => s.id === tenantId);

  const defaultProfile: StoreProfileSettings = {
    logoUrl: adminRecord?.logo_url || '',
    name: adminRecord?.name || 'Mi Comercio',
    description: 'Comercio registrado en la plataforma CentralBo.',
    address: 'Bolivia',
    phone: adminRecord?.owner.phone || '+591 70000000',
    whatsapp: adminRecord?.owner.socials?.whatsapp || '+591 70000000',
    email: adminRecord?.owner.email || 'contacto@comercio.bo',
    attentionInfo: 'Atención presencial y pedidos online.',
    socials: {
      whatsapp: adminRecord?.owner.socials?.whatsapp || '+591 70000000',
      instagram: adminRecord?.owner.socials?.instagram || '@comercio_bo',
      facebook: adminRecord?.owner.socials?.facebook || 'ComercioBolivia',
      tiktok: '@comercio.bolivia',
      youtube: 'https://youtube.com/@comerciobo',
    },
  };

  return loadFromStorage<StoreProfileSettings>(tenantId, 'profile', defaultProfile);
}

/**
 * Consulta la información oficial del comercio desde Supabase (tabla 'stores').
 * Extrae name y logo_url desde sus columnas nativas, y el resto desde stores.profile.
 * Mantiene sincronizada la caché local del tenant.
 */
export async function fetchStoreProfile(tenantId: string): Promise<StoreProfileSettings> {
  if (!tenantId) {
    return getStoreProfile(tenantId);
  }

  const cachedProfile = getStoreProfile(tenantId);

  try {
    // 1. Intentar consultar stores con columna profile
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, logo_url, profile')
      .eq('id', tenantId)
      .maybeSingle();

    if (!error && data) {
      const rawProfile = (data.profile && typeof data.profile === 'object') ? data.profile : {};
      const remoteProfile: StoreProfileSettings = {
        name: data.name !== undefined && data.name !== null ? String(data.name) : cachedProfile.name,
        logoUrl: data.logo_url !== undefined && data.logo_url !== null ? String(data.logo_url) : cachedProfile.logoUrl,
        description: rawProfile.description !== undefined ? String(rawProfile.description) : cachedProfile.description,
        address: rawProfile.address !== undefined ? String(rawProfile.address) : cachedProfile.address,
        phone: rawProfile.phone !== undefined ? String(rawProfile.phone) : cachedProfile.phone,
        whatsapp: rawProfile.whatsapp !== undefined ? String(rawProfile.whatsapp) : cachedProfile.whatsapp,
        email: rawProfile.email !== undefined ? String(rawProfile.email) : cachedProfile.email,
        attentionInfo: rawProfile.attentionInfo !== undefined ? String(rawProfile.attentionInfo) : cachedProfile.attentionInfo,
        socials: {
          instagram: rawProfile.socials?.instagram !== undefined ? String(rawProfile.socials.instagram) : (cachedProfile.socials?.instagram || ''),
          facebook: rawProfile.socials?.facebook !== undefined ? String(rawProfile.socials.facebook) : (cachedProfile.socials?.facebook || ''),
          tiktok: rawProfile.socials?.tiktok !== undefined ? String(rawProfile.socials.tiktok) : (cachedProfile.socials?.tiktok || ''),
          youtube: rawProfile.socials?.youtube !== undefined ? String(rawProfile.socials.youtube) : (cachedProfile.socials?.youtube || ''),
          whatsapp: rawProfile.socials?.whatsapp !== undefined ? String(rawProfile.socials.whatsapp) : (cachedProfile.socials?.whatsapp || cachedProfile.whatsapp || ''),
        },
      };

      saveToStorage(tenantId, 'profile', remoteProfile);
      return remoteProfile;
    }

    // 2. Si la columna 'profile' no existe aún en el esquema (PGRST204 o 42703), consultar columnas nativas
    if (error && (error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('profile'))) {
      const { data: baseData, error: baseErr } = await supabase
        .from('stores')
        .select('id, name, logo_url')
        .eq('id', tenantId)
        .maybeSingle();

      if (!baseErr && baseData) {
        const merged: StoreProfileSettings = {
          ...cachedProfile,
          name: baseData.name !== undefined && baseData.name !== null ? String(baseData.name) : cachedProfile.name,
          logoUrl: baseData.logo_url !== undefined && baseData.logo_url !== null ? String(baseData.logo_url) : cachedProfile.logoUrl,
        };
        saveToStorage(tenantId, 'profile', merged);
        return merged;
      }
    }

    if (error) {
      console.warn('[CentralBo StoreAdmin] Error al consultar perfil en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('[CentralBo StoreAdmin] Excepción al consultar perfil en Supabase:', err);
  }

  return cachedProfile;
}

/**
 * Persiste los datos del perfil de forma centralizada en Supabase:
 * - name -> stores.name
 * - logoUrl -> stores.logo_url
 * - resto de campos -> stores.profile (JSONB)
 * La actualización queda estrictamente aislada por tenantId (store.id).
 */
export async function saveStoreProfile(
  tenantId: string,
  settings: StoreProfileSettings
): Promise<{ success: boolean; error?: string }> {
  if (!tenantId || typeof tenantId !== 'string') {
    return { success: false, error: 'Identificador de comercio (tenantId) no válido.' };
  }

  if (!settings.name || !settings.name.trim()) {
    return { success: false, error: 'El nombre del comercio es obligatorio.' };
  }

  const cleanName = settings.name.trim();
  const cleanLogo = settings.logoUrl && settings.logoUrl.trim() ? settings.logoUrl.trim() : null;

  const profilePayload = {
    description: settings.description || '',
    address: settings.address || '',
    phone: settings.phone || '',
    whatsapp: settings.whatsapp || '',
    email: settings.email || '',
    attentionInfo: settings.attentionInfo || '',
    socials: {
      instagram: settings.socials?.instagram || '',
      facebook: settings.socials?.facebook || '',
      tiktok: settings.socials?.tiktok || '',
      youtube: settings.socials?.youtube || '',
      whatsapp: settings.socials?.whatsapp || settings.whatsapp || '',
    },
  };

  const now = new Date().toISOString();

  try {
    // 1. Intentar actualizar stores con profile JSONB + name + logo_url
    const { error: fullUpdateError } = await supabase
      .from('stores')
      .update({
        name: cleanName,
        logo_url: cleanLogo,
        profile: profilePayload,
        updated_at: now,
      })
      .eq('id', tenantId);

    if (!fullUpdateError) {
      // Guardado exitoso en Supabase: actualizar caché local
      saveToStorage(tenantId, 'profile', settings);
      return { success: true };
    }

    // 2. Si la columna 'profile' no existe en el esquema remoto (PGRST204 o 42703)
    if (
      fullUpdateError.code === 'PGRST204' ||
      fullUpdateError.code === '42703' ||
      fullUpdateError.message?.includes('profile')
    ) {
      // Guardar name y logo_url en las columnas existentes en Supabase
      const { error: baseUpdateError } = await supabase
        .from('stores')
        .update({
          name: cleanName,
          logo_url: cleanLogo,
          updated_at: now,
        })
        .eq('id', tenantId);

      if (baseUpdateError) {
        return {
          success: false,
          error: `Error al actualizar stores en Supabase: ${baseUpdateError.message}`,
        };
      }

      // Guardar en almacenamiento local
      saveToStorage(tenantId, 'profile', settings);

      return {
        success: false,
        error: "Columna 'profile' no detectada en la base de datos de Supabase. Ejecuta en el SQL Editor: ALTER TABLE stores ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}'::jsonb;",
      };
    }

    return {
      success: false,
      error: fullUpdateError.message || 'Error desconocido al guardar en Supabase.',
    };
  } catch (err: any) {
    console.error('[CentralBo StoreAdmin] Excepción al guardar perfil en Supabase:', err);
    return {
      success: false,
      error: err?.message || 'Error de conexión con Supabase.',
    };
  }
}

// ----------------------------------------------------------------------------
// 2.1 GESTIÓN DE ALMACENAMIENTO DE LOGO (Supabase Storage: bucket 'store-logos')
// ----------------------------------------------------------------------------

export const ALLOWED_LOGO_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
];

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export interface UploadLogoResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Sube el archivo de logo del comercio al bucket público 'store-logos' de Supabase Storage.
 * 
 * Reglas y Garantías:
 * 1. Valida estrictamente el tenantId y el archivo.
 * 2. Valida formatos permitidos (PNG, JPEG, WEBP, SVG) y tamaño máximo (2 MB).
 * 3. Aislamiento por tenant: ruta canónica '{tenantId}/logo.{ext}'.
 * 4. Garantiza UN SOLO LOGO VIGENTE: tras subir con upsert, elimina cualquier archivo
 *    obsoleto con otra extensión dentro del directorio del tenant.
 * 5. Obtiene la URL pública mediante supabase.storage.from('store-logos').getPublicUrl().
 * 6. NO utiliza URLs temporales ni base64 persistente.
 */
export async function uploadStoreLogo(
  tenantId: string,
  file: File
): Promise<UploadLogoResult> {
  if (!tenantId || typeof tenantId !== 'string' || !tenantId.trim()) {
    return { success: false, error: 'Identificador de comercio (tenantId) no válido.' };
  }

  if (!file) {
    return { success: false, error: 'No se ha seleccionado ningún archivo de imagen.' };
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return {
      success: false,
      error: 'El archivo supera el tamaño máximo permitido de 2 MB (límite del bucket store-logos).',
    };
  }

  const normalizedType = file.type?.toLowerCase() || '';
  if (!ALLOWED_LOGO_MIME_TYPES.includes(normalizedType)) {
    return {
      success: false,
      error: 'Formato no permitido. Solo se aceptan archivos PNG, JPEG/JPG, WEBP o SVG.',
    };
  }

  // Determinar extensión limpia según MIME type
  let ext = 'png';
  if (normalizedType === 'image/jpeg') ext = 'jpg';
  else if (normalizedType === 'image/webp') ext = 'webp';
  else if (normalizedType === 'image/svg+xml') ext = 'svg';
  else if (normalizedType === 'image/png') ext = 'png';
  else {
    const parts = file.name.split('.');
    if (parts.length > 1) {
      const candidateExt = parts.pop()?.toLowerCase();
      if (candidateExt === 'jpeg' || candidateExt === 'jpg') ext = 'jpg';
      else if (candidateExt === 'webp') ext = 'webp';
      else if (candidateExt === 'svg') ext = 'svg';
      else if (candidateExt === 'png') ext = 'png';
    }
  }

  const cleanTenantId = tenantId.trim();
  const targetFileName = `logo.${ext}`;
  const targetPath = `${cleanTenantId}/${targetFileName}`;

  try {
    // 1. Subir archivo al bucket store-logos (upsert reemplaza si es idéntico nombre)
    const { error: uploadError } = await supabase.storage
      .from('store-logos')
      .upload(targetPath, file, {
        contentType: normalizedType,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Error al subir el archivo a Supabase Storage: ${uploadError.message}`,
      };
    }

    // 2. Garantizar un solo logo vigente:
    // Limpiar cualquier archivo previo con extensión diferente en la carpeta del tenant
    try {
      const { data: existingFiles } = await supabase.storage
        .from('store-logos')
        .list(cleanTenantId);

      if (existingFiles && Array.isArray(existingFiles) && existingFiles.length > 0) {
        const obsoleteFiles = existingFiles
          .filter((item) => item.name !== targetFileName)
          .map((item) => `${cleanTenantId}/${item.name}`);

        if (obsoleteFiles.length > 0) {
          await supabase.storage.from('store-logos').remove(obsoleteFiles);
        }
      }
    } catch (cleanupErr) {
      console.warn('[uploadStoreLogo] Advertencia no bloqueante al limpiar logos obsoletos:', cleanupErr);
    }

    // 3. Obtener URL pública oficial generada por Supabase Storage
    const { data: urlData } = supabase.storage
      .from('store-logos')
      .getPublicUrl(targetPath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'No se pudo resolver la URL pública del logo en Supabase Storage.',
      };
    }

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (err: any) {
    console.error('[CentralBo StoreAdmin] Excepción en uploadStoreLogo:', err);
    return {
      success: false,
      error: err?.message || 'Error de red inesperado al comunicarse con Supabase Storage.',
    };
  }
}

// ----------------------------------------------------------------------------
// 3. APARIENCIA Y PLAN (Basic vs Pro)
// ----------------------------------------------------------------------------
export function getDefaultStoreHighlights(tenantId: string): StoreHighlightItem[] {
  const items: StoreHighlightItem[] = [];

  // 1. Envíos reales configurados
  try {
    const shipping = getCachedStoreShipping(tenantId);
    if (shipping && shipping.offersShipping) {
      items.push({
        id: 'shipping',
        icon: '📦',
        title: 'Envíos a Domicilio',
        description:
          shipping.shippingType === 'free'
            ? 'Envíos sin costo adicional según monto'
            : `Tarifa fija de envío Bs ${shipping.fixedCost}`,
        badge: shipping.shippingType === 'free' ? 'Gratis' : 'Delivery',
      });
    }
  } catch (e) {
    // ignore
  }

  // 2. Pedidos programados o citas
  try {
    const scheduled = getStoreScheduledOrders(tenantId);
    if (scheduled && scheduled.enabled) {
      items.push({
        id: 'scheduled',
        icon: '📅',
        title: 'Pedidos Programados',
        description: `Coordina tu entrega con hasta ${scheduled.maxAdvanceDays} días de anticipación`,
        badge: 'Planifica',
      });
    }
  } catch (e) {
    // ignore
  }

  // 3. Atención directa por WhatsApp
  try {
    const prof = getStoreProfile(tenantId);
    if (prof && (prof.whatsapp || prof.phone)) {
      items.push({
        id: 'whatsapp',
        icon: '💬',
        title: 'Atención Directa',
        description: 'Consultas y confirmación de pedidos vía WhatsApp',
        badge: 'Respuesta Rápida',
      });
    }
  } catch (e) {
    // ignore
  }

  // 4. Métodos de pago
  try {
    const payment = getStorePaymentSettings(tenantId);
    if (payment && payment.qrSimple) {
      items.push({
        id: 'payment',
        icon: '📱',
        title: 'Pago Rápido con QR',
        description: 'Aceptamos transferencias y cobro QR directo',
        badge: 'QR Simple',
      });
    }
  } catch (e) {
    // ignore
  }

  // Si no hay suficientes elementos basados en configuración específica, proveer un destacado neutro y verídico
  if (items.length === 0) {
    items.push({
      id: 'store-direct',
      icon: '✨',
      title: 'Venta Directa',
      description: 'Precios directos del comercio sin intermediarios',
      badge: 'Oficial',
    });
    items.push({
      id: 'online-catalog',
      icon: '🛒',
      title: 'Catálogo en Línea',
      description: 'Explora y haz tu pedido directamente desde tu dispositivo',
      badge: '24/7',
    });
  }

  return items;
}

export function getCachedStoreAppearance(tenantId: string): StoreAppearanceSettings {
  const plan = getStorePlan(tenantId);
  const defaultAppearance: StoreAppearanceSettings = {
    theme: 'dark',
    brandPrimaryColor: plan === 'pro' ? '#4f46e5' : '#4f46e5',
    brandSecondaryColor: plan === 'pro' ? '#06b6d4' : '#06b6d4',
    brandAccentColor: plan === 'pro' ? '#f59e0b' : '#f59e0b',
    customDomain: '',
    domainVerified: plan === 'pro',
    visualStyle: 'modern',
    showHighlights: true,
    highlightsLayout: 'balanced',
    highlights: getDefaultStoreHighlights(tenantId),
  };

  const stored = loadFromStorage<StoreAppearanceSettings>(tenantId, 'appearance', defaultAppearance);

  // Asegurar que si stored no tiene highlights definidos, reciba los highlights por defecto reales
  if (!stored.highlights || stored.highlights.length === 0) {
    stored.highlights = getDefaultStoreHighlights(tenantId);
  }
  if (!stored.highlightsLayout) {
    stored.highlightsLayout = 'balanced';
  }
  if (stored.showHighlights === undefined) {
    stored.showHighlights = true;
  }

  return stored;
}

/**
 * Consulta la configuración de apariencia oficial desde Supabase (tabla 'stores.appearance').
 * Supabase actúa como Fuente de Verdad Canónica.
 * Si existe configuración en Supabase, prevalece sobre localStorage y actualiza la caché local.
 * Si la columna no existe o falla la red, utiliza la caché local como fallback.
 */
export async function getStoreAppearance(tenantId: string): Promise<StoreAppearanceSettings> {
  if (!tenantId || typeof tenantId !== 'string') {
    return getCachedStoreAppearance(tenantId);
  }

  const cached = getCachedStoreAppearance(tenantId);
  const plan = getStorePlan(tenantId);

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, appearance')
      .eq('id', tenantId)
      .maybeSingle();

    if (!error && data && data.appearance && typeof data.appearance === 'object' && Object.keys(data.appearance).length > 0) {
      const raw = data.appearance as Record<string, any>;
      const isPro = plan === 'pro';

      const remoteAppearance: StoreAppearanceSettings = {
        theme: raw.theme === 'light' ? 'light' : 'dark',
        brandPrimaryColor: isPro && typeof raw.brandPrimaryColor === 'string' && raw.brandPrimaryColor
          ? raw.brandPrimaryColor
          : (isPro ? (cached.brandPrimaryColor || '#4f46e5') : '#4f46e5'),
        brandSecondaryColor: isPro && typeof raw.brandSecondaryColor === 'string' && raw.brandSecondaryColor
          ? raw.brandSecondaryColor
          : (isPro ? (cached.brandSecondaryColor || '#06b6d4') : '#06b6d4'),
        brandAccentColor: isPro && typeof raw.brandAccentColor === 'string' && raw.brandAccentColor
          ? raw.brandAccentColor
          : (isPro ? (cached.brandAccentColor || '#f59e0b') : '#f59e0b'),
        customDomain: isPro && typeof raw.customDomain === 'string' ? raw.customDomain : '',
        domainVerified: isPro && Boolean(raw.domainVerified),
        visualStyle: (raw.visualStyle === 'minimal' || raw.visualStyle === 'elegant') ? raw.visualStyle : 'modern',
        showHighlights: raw.showHighlights !== undefined ? Boolean(raw.showHighlights) : true,
        highlightsLayout: ['balanced', 'featured', 'horizontal', 'editorial', 'minimal'].includes(raw.highlightsLayout)
          ? raw.highlightsLayout
          : 'balanced',
        highlights: Array.isArray(raw.highlights) && raw.highlights.length > 0
          ? raw.highlights
          : getDefaultStoreHighlights(tenantId),
      };

      // Actualizar caché local con la fuente canónica de Supabase
      saveToStorage(tenantId, 'appearance', remoteAppearance);
      return remoteAppearance;
    }

    if (error) {
      console.warn('[CentralBo StoreAdmin] Aviso al consultar appearance en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('[CentralBo StoreAdmin] Excepción al consultar appearance en Supabase:', err);
  }

  // Fallback a caché local o valores predeterminados
  return cached;
}

// Alias para consistencia de API
export const fetchStoreAppearance = getStoreAppearance;

/**
 * Persiste la configuración de apariencia de forma centralizada en Supabase (stores.appearance).
 * Aplica reglas estrictas de planes (Basic vs Pro) y aislamiento multi-tenant por tenantId.
 * Únicamente retorna success=true tras la confirmación real de Supabase.
 */
export async function saveStoreAppearance(
  tenantId: string,
  settings: StoreAppearanceSettings
): Promise<{ success: boolean; error?: string }> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return { success: false, error: 'Identificador de comercio (tenantId) no válido.' };
  }

  const plan = getStorePlan(tenantId);

  // Respetar estrictamente la política Basic vs Pro
  let appearancePayload: StoreAppearanceSettings;

  if (plan === 'basic') {
    const existing = await getStoreAppearance(tenantId);
    appearancePayload = {
      ...existing,
      theme: settings.theme === 'light' ? 'light' : 'dark',
      brandPrimaryColor: '#4f46e5',
      brandSecondaryColor: '#06b6d4',
      brandAccentColor: '#f59e0b',
      customDomain: '',
      domainVerified: false,
      visualStyle: (settings.visualStyle === 'minimal' || settings.visualStyle === 'elegant') ? settings.visualStyle : 'modern',
      showHighlights: settings.showHighlights !== undefined ? Boolean(settings.showHighlights) : true,
      highlightsLayout: ['balanced', 'featured', 'horizontal', 'editorial', 'minimal'].includes(settings.highlightsLayout || '')
        ? settings.highlightsLayout!
        : 'balanced',
      highlights: Array.isArray(settings.highlights) && settings.highlights.length > 0
        ? settings.highlights
        : (existing.highlights && existing.highlights.length > 0 ? existing.highlights : getDefaultStoreHighlights(tenantId)),
    };
  } else {
    appearancePayload = {
      theme: settings.theme === 'light' ? 'light' : 'dark',
      brandPrimaryColor: settings.brandPrimaryColor || '#4f46e5',
      brandSecondaryColor: settings.brandSecondaryColor || '#06b6d4',
      brandAccentColor: settings.brandAccentColor || '#f59e0b',
      customDomain: settings.customDomain || '',
      domainVerified: Boolean(settings.domainVerified),
      visualStyle: (settings.visualStyle === 'minimal' || settings.visualStyle === 'elegant') ? settings.visualStyle : 'modern',
      showHighlights: settings.showHighlights !== undefined ? Boolean(settings.showHighlights) : true,
      highlightsLayout: ['balanced', 'featured', 'horizontal', 'editorial', 'minimal'].includes(settings.highlightsLayout || '')
        ? settings.highlightsLayout!
        : 'balanced',
      highlights: Array.isArray(settings.highlights) && settings.highlights.length > 0
        ? settings.highlights
        : getDefaultStoreHighlights(tenantId),
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: updatedRows, error } = await supabase
      .from('stores')
      .update({
        appearance: appearancePayload,
        updated_at: now,
      })
      .eq('id', tenantId)
      .select('id');

    if (error) {
      console.error('[CentralBo StoreAdmin] Error al persistir appearance en Supabase:', error);
      return {
        success: false,
        error: error.message || 'Error al persistir la configuración de apariencia en Supabase.',
      };
    }

    if (!updatedRows || updatedRows.length === 0) {
      return {
        success: false,
        error: 'No se pudo actualizar el comercio en Supabase. Verifique permisos de administrador o sesión activa.',
      };
    }

    // Persistencia remota confirmada: sincronizar la caché local de este tenant
    saveToStorage(tenantId, 'appearance', appearancePayload);
    return { success: true };
  } catch (err: any) {
    console.error('[CentralBo StoreAdmin] Excepción al persistir appearance en Supabase:', err);
    return {
      success: false,
      error: err?.message || 'Error de conexión al guardar apariencia en el servidor.',
    };
  }
}

// ----------------------------------------------------------------------------
// 4. HORARIOS
// ----------------------------------------------------------------------------

function isValidScheduleArray(data: any): data is StoreScheduleDay[] {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.dayOfWeek === 'number' &&
      typeof item.isOpen === 'boolean' &&
      Array.isArray(item.periods)
  );
}

/**
 * Obtiene la configuración de horarios en caché local o el valor por defecto.
 * Operación sincrónica segura para inicializaciones de interfaz y fallbacks inmediatos.
 */
export function getCachedStoreSchedule(tenantId: string): StoreScheduleDay[] {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return JSON.parse(JSON.stringify(DEFAULT_WEEK_SCHEDULE));
  }
  const cached = loadFromStorage<StoreScheduleDay[]>(tenantId, 'schedule', DEFAULT_WEEK_SCHEDULE);
  if (isValidScheduleArray(cached)) {
    return cached;
  }
  return JSON.parse(JSON.stringify(DEFAULT_WEEK_SCHEDULE));
}

/**
 * Consulta los horarios del comercio con Supabase como fuente canónica de verdad.
 * Flujo:
 * 1. Valida tenantId.
 * 2. Consulta stores.schedule filtrando estrictamente por stores.id = tenantId.
 * 3. Si Supabase devuelve un schedule válido: lo utiliza, actualiza la caché local del tenant y lo retorna.
 * 4. Si la consulta falla o aún no tiene datos configurados: recurre al valor existente de localStorage.
 * 5. Si tampoco existe localStorage válido, utiliza DEFAULT_WEEK_SCHEDULE.
 * 6. Actualiza la caché local con el valor en uso sin sobrescribir Supabase automáticamente.
 */
export async function getStoreSchedule(tenantId: string): Promise<StoreScheduleDay[]> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return JSON.parse(JSON.stringify(DEFAULT_WEEK_SCHEDULE));
  }

  const cached = getCachedStoreSchedule(tenantId);

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, schedule')
      .eq('id', tenantId)
      .maybeSingle();

    if (!error && data && isValidScheduleArray(data.schedule)) {
      const remoteSchedule = data.schedule as StoreScheduleDay[];
      // Sincronizar la caché local del tenant con el valor canónico
      saveToStorage(tenantId, 'schedule', remoteSchedule);
      return remoteSchedule;
    }

    if (error) {
      console.warn('[CentralBo StoreAdmin] Aviso al consultar schedule en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('[CentralBo StoreAdmin] Excepción al consultar schedule en Supabase:', err);
  }

  // Fallback seguro: caché local existente o DEFAULT_WEEK_SCHEDULE
  return cached;
}

// Alias para consistencia de API con fetchStoreProfile y fetchStoreAppearance
export const fetchStoreSchedule = getStoreSchedule;

/**
 * Persiste los horarios de atención comercial de forma centralizada en Supabase (stores.schedule).
 * Aislamiento estricto por tenantId (stores.id = tenantId).
 * Solo actualiza la caché local tras la confirmación exitosa de Supabase.
 */
export async function saveStoreSchedule(
  tenantId: string,
  schedule: StoreScheduleDay[]
): Promise<{ success: boolean; error?: string }> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return { success: false, error: 'Identificador de comercio (tenantId) no válido.' };
  }

  if (!isValidScheduleArray(schedule)) {
    return { success: false, error: 'Formato de horarios inválido o incompleto.' };
  }

  const now = new Date().toISOString();

  try {
    const { data: updatedRows, error } = await supabase
      .from('stores')
      .update({
        schedule: schedule,
        updated_at: now,
      })
      .eq('id', tenantId)
      .select('id');

    if (error) {
      console.error('[CentralBo StoreAdmin] Error al persistir schedule en Supabase:', error);
      return {
        success: false,
        error: error.message || 'Error al persistir la configuración de horarios en Supabase.',
      };
    }

    if (!updatedRows || updatedRows.length === 0) {
      return {
        success: false,
        error: 'No se pudo actualizar el comercio en Supabase. Verifique permisos de administrador o sesión activa.',
      };
    }

    // Persistencia remota confirmada: actualizar la caché local de este tenant
    saveToStorage(tenantId, 'schedule', schedule);
    return { success: true };
  } catch (err: any) {
    console.error('[CentralBo StoreAdmin] Excepción al persistir schedule en Supabase:', err);
    return {
      success: false,
      error: err?.message || 'Error de conexión al guardar horarios en el servidor.',
    };
  }
}

// ----------------------------------------------------------------------------
// 5. ENVÍOS (La plataforma NO calcula automáticamente el costo)
// ----------------------------------------------------------------------------
export const DEFAULT_STORE_SHIPPING: StoreShippingSettings = {
  offersShipping: true,
  shippingType: 'fixed',
  fixedCost: 15, // Bs 15 tarifa fija
  minOrderAmount: 50, // Bs 50 mínimo
  maxOrderAmount: 0, // Sin límite
  availableDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  availableHours: '11:00 a 20:30',
};

function isValidShippingSettings(data: any): data is StoreShippingSettings {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  if (typeof data.offersShipping !== 'boolean') {
    return false;
  }
  if (data.shippingType !== 'free' && data.shippingType !== 'fixed') {
    return false;
  }
  if (typeof data.fixedCost !== 'number' || isNaN(data.fixedCost)) {
    return false;
  }
  if (typeof data.minOrderAmount !== 'number' || isNaN(data.minOrderAmount)) {
    return false;
  }
  if (typeof data.maxOrderAmount !== 'number' || isNaN(data.maxOrderAmount)) {
    return false;
  }
  if (!Array.isArray(data.availableDays)) {
    return false;
  }
  if (typeof data.availableHours !== 'string') {
    return false;
  }
  return true;
}

/**
 * Retorna la configuración de envíos desde caché local (síncrono).
 * Aislamiento estricto por tenantId.
 * Fallback a DEFAULT_STORE_SHIPPING si no hay caché válida.
 */
export function getCachedStoreShipping(tenantId: string): StoreShippingSettings {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return JSON.parse(JSON.stringify(DEFAULT_STORE_SHIPPING));
  }
  const cached = loadFromStorage<StoreShippingSettings>(tenantId, 'shipping', DEFAULT_STORE_SHIPPING);
  if (isValidShippingSettings(cached)) {
    return cached;
  }
  return JSON.parse(JSON.stringify(DEFAULT_STORE_SHIPPING));
}

/**
 * Consulta la configuración de envíos del comercio con Supabase como fuente canónica.
 * Flujo:
 * 1. Valida tenantId.
 * 2. Consulta stores.shipping filtrando por stores.id = tenantId.
 * 3. Si Supabase devuelve un StoreShippingSettings válido: lo utiliza, actualiza la caché local del tenant y lo retorna.
 * 4. Si la consulta falla o aún no tiene datos configurados: recurre al valor existente de localStorage (fallback).
 * 5. Si tampoco existe localStorage válido, utiliza DEFAULT_STORE_SHIPPING.
 * 6. NO sobrescribe Supabase automáticamente durante la lectura (migración conservadora).
 */
export async function fetchStoreShipping(tenantId: string): Promise<StoreShippingSettings> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return JSON.parse(JSON.stringify(DEFAULT_STORE_SHIPPING));
  }

  const cached = getCachedStoreShipping(tenantId);

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, shipping')
      .eq('id', tenantId)
      .maybeSingle();

    if (!error && data && isValidShippingSettings(data.shipping)) {
      const remoteShipping = data.shipping as StoreShippingSettings;
      // Actualizar la caché local del tenant con el valor canónico
      saveToStorage(tenantId, 'shipping', remoteShipping);
      return remoteShipping;
    }

    if (error) {
      console.warn('[CentralBo StoreAdmin] Aviso al consultar shipping en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('[CentralBo StoreAdmin] Excepción al consultar shipping en Supabase:', err);
  }

  // Fallback seguro: caché local existente o DEFAULT_STORE_SHIPPING
  return cached;
}

// Alias para compatibilidad de API con getStoreSchedule / fetchStoreSchedule
export const getStoreShipping = fetchStoreShipping;

/**
 * Persiste la configuración de envíos de forma centralizada en Supabase (stores.shipping).
 * Aislamiento estricto por tenantId (stores.id = tenantId).
 * Solo actualiza la caché local tras la confirmación exitosa de Supabase.
 */
export async function saveStoreShipping(
  tenantId: string,
  settings: StoreShippingSettings
): Promise<{ success: boolean; error?: string }> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return { success: false, error: 'Identificador de comercio (tenantId) no válido.' };
  }

  if (!isValidShippingSettings(settings)) {
    return { success: false, error: 'Formato de configuración de envíos inválido o incompleto.' };
  }

  const now = new Date().toISOString();

  try {
    const { data: updatedRows, error } = await supabase
      .from('stores')
      .update({
        shipping: settings,
        updated_at: now,
      })
      .eq('id', tenantId)
      .select('id');

    if (error) {
      console.error('[CentralBo StoreAdmin] Error al persistir shipping en Supabase:', error);
      return {
        success: false,
        error: error.message || 'Error al persistir la configuración de envíos en Supabase.',
      };
    }

    if (!updatedRows || updatedRows.length === 0) {
      return {
        success: false,
        error: 'No se pudo actualizar el comercio en Supabase. Verifique permisos de administrador o sesión activa.',
      };
    }

    // Persistencia remota confirmada: actualizar la caché local de este tenant
    saveToStorage(tenantId, 'shipping', settings);
    return { success: true };
  } catch (err: any) {
    console.error('[CentralBo StoreAdmin] Excepción al persistir shipping en Supabase:', err);
    return {
      success: false,
      error: err?.message || 'Error de conexión al guardar configuración de envíos en el servidor.',
    };
  }
}

// ----------------------------------------------------------------------------
// 6. PEDIDOS PROGRAMADOS
// ----------------------------------------------------------------------------
export const DEFAULT_STORE_SCHEDULED_ORDERS: StoreScheduledOrdersSettings = {
  enabled: true,
  minAdvanceHours: 2, // Mínimo 2 horas de anticipación
  maxAdvanceDays: 7, // Hasta 7 días a futuro
  availableSlots: [
    '11:30 - 12:30',
    '12:30 - 13:30',
    '13:30 - 14:30',
    '18:30 - 19:30',
    '19:30 - 20:30',
    '20:30 - 21:30',
  ],
  specialConditions:
    'Para pedidos con entrega programada, solicitamos confirmar su dirección con pin de WhatsApp al momento de coordinar el despacho.',
};

function isValidScheduledOrdersSettings(data: any): data is StoreScheduledOrdersSettings {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  if (typeof data.enabled !== 'boolean') {
    return false;
  }
  if (typeof data.minAdvanceHours !== 'number' || isNaN(data.minAdvanceHours)) {
    return false;
  }
  if (typeof data.maxAdvanceDays !== 'number' || isNaN(data.maxAdvanceDays)) {
    return false;
  }
  if (!Array.isArray(data.availableSlots)) {
    return false;
  }
  if (typeof data.specialConditions !== 'string') {
    return false;
  }
  return true;
}

/**
 * Retorna la configuración de pedidos programados desde caché local (síncrono).
 * Aislamiento estricto por tenantId.
 * Fallback a DEFAULT_STORE_SCHEDULED_ORDERS si no hay caché válida.
 */
export function getCachedStoreScheduledOrders(tenantId: string): StoreScheduledOrdersSettings {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return JSON.parse(JSON.stringify(DEFAULT_STORE_SCHEDULED_ORDERS));
  }
  const cached = loadFromStorage<StoreScheduledOrdersSettings>(
    tenantId,
    'scheduled_orders',
    DEFAULT_STORE_SCHEDULED_ORDERS
  );
  if (isValidScheduledOrdersSettings(cached)) {
    return cached;
  }
  return JSON.parse(JSON.stringify(DEFAULT_STORE_SCHEDULED_ORDERS));
}

// Alias para compatibilidad con código existente
export const getStoreScheduledOrders = getCachedStoreScheduledOrders;

/**
 * Consulta la configuración de pedidos programados del comercio con Supabase como fuente canónica.
 * Flujo:
 * 1. Valida tenantId.
 * 2. Consulta stores.scheduled_orders filtrando por stores.id = tenantId.
 * 3. Si Supabase devuelve un StoreScheduledOrdersSettings válido: lo utiliza, actualiza la caché local del tenant y lo retorna.
 * 4. Si la consulta falla o aún no tiene datos configurados: recurre al valor existente de localStorage (fallback).
 * 5. Si tampoco existe localStorage válido, utiliza DEFAULT_STORE_SCHEDULED_ORDERS.
 * 6. NO sobrescribe Supabase automáticamente durante la lectura (migración conservadora).
 */
export async function fetchStoreScheduledOrders(
  tenantId: string
): Promise<StoreScheduledOrdersSettings> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return JSON.parse(JSON.stringify(DEFAULT_STORE_SCHEDULED_ORDERS));
  }

  const cached = getCachedStoreScheduledOrders(tenantId);

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, scheduled_orders')
      .eq('id', tenantId)
      .maybeSingle();

    if (!error && data && isValidScheduledOrdersSettings(data.scheduled_orders)) {
      const remoteScheduled = data.scheduled_orders as StoreScheduledOrdersSettings;
      // Actualizar la caché local del tenant con el valor canónico
      saveToStorage(tenantId, 'scheduled_orders', remoteScheduled);
      return remoteScheduled;
    }

    if (error) {
      console.warn(
        '[CentralBo StoreAdmin] Aviso al consultar scheduled_orders en Supabase:',
        error.message
      );
    }
  } catch (err) {
    console.warn(
      '[CentralBo StoreAdmin] Excepción al consultar scheduled_orders en Supabase:',
      err
    );
  }

  // Fallback seguro: caché local existente o DEFAULT_STORE_SCHEDULED_ORDERS
  return cached;
}

/**
 * Persiste la configuración de pedidos programados de forma centralizada en Supabase (stores.scheduled_orders).
 * Aislamiento estricto por tenantId (stores.id = tenantId).
 * Solo actualiza la caché local tras la confirmación exitosa de Supabase.
 */
export async function saveStoreScheduledOrders(
  tenantId: string,
  settings: StoreScheduledOrdersSettings
): Promise<{ success: boolean; error?: string }> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return { success: false, error: 'Identificador de comercio (tenantId) no válido.' };
  }

  if (!isValidScheduledOrdersSettings(settings)) {
    return {
      success: false,
      error: 'Formato de configuración de pedidos programados inválido o incompleto.',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: updatedRows, error } = await supabase
      .from('stores')
      .update({
        scheduled_orders: settings,
        updated_at: now,
      })
      .eq('id', tenantId)
      .select('id');

    if (error) {
      console.error(
        '[CentralBo StoreAdmin] Error al persistir scheduled_orders en Supabase:',
        error
      );
      return {
        success: false,
        error: error.message || 'Error al persistir la configuración de pedidos programados en Supabase.',
      };
    }

    if (!updatedRows || updatedRows.length === 0) {
      return {
        success: false,
        error:
          'No se pudo actualizar el comercio en Supabase. Verifique permisos de administrador o sesión activa.',
      };
    }

    // Persistencia remota confirmada: actualizar la caché local de este tenant
    saveToStorage(tenantId, 'scheduled_orders', settings);
    return { success: true };
  } catch (err: any) {
    console.error(
      '[CentralBo StoreAdmin] Excepción al persistir scheduled_orders en Supabase:',
      err
    );
    return {
      success: false,
      error:
        err?.message ||
        'Error de conexión al guardar configuración de pedidos programados en el servidor.',
    };
  }
}

// ----------------------------------------------------------------------------
// 6.1 MÉTODOS DE PAGO CONFIGURABLES POR EL COMERCIO (Fase 1 / CentralBo)
// WhatsApp es canal obligatorio y permanente de comunicación, no un método de pago.
// Los 3 métodos configurables son: Efectivo contraentrega, Transferencia, QR Simple.
// El efectivo contraentrega NO aparece automáticamente; solo cuando el admin lo activa.
// ----------------------------------------------------------------------------
export const DEFAULT_PAYMENT_SETTINGS: StorePaymentSettings = {
  cashOnDelivery: false, // NO aparece automáticamente
  bankTransfer: true,
  qrSimple: true,
  bankDetails: {
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  },
};

/**
 * Valida la integridad estructural de un objeto StorePaymentSettings.
 * Rechaza null, arrays, tipos incompatibles y objetos sin los booleanos obligatorios.
 */
export function isValidPaymentSettings(data: unknown): data is StorePaymentSettings {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  if (
    typeof obj.cashOnDelivery !== 'boolean' ||
    typeof obj.bankTransfer !== 'boolean' ||
    typeof obj.qrSimple !== 'boolean'
  ) {
    return false;
  }
  if (obj.bankDetails !== undefined && obj.bankDetails !== null) {
    if (typeof obj.bankDetails !== 'object' || Array.isArray(obj.bankDetails)) {
      return false;
    }
    const bd = obj.bankDetails as Record<string, unknown>;
    if (bd.bankName !== undefined && typeof bd.bankName !== 'string') return false;
    if (bd.accountNumber !== undefined && typeof bd.accountNumber !== 'string') return false;
    if (bd.accountHolder !== undefined && typeof bd.accountHolder !== 'string') return false;
  }
  return true;
}

/**
 * Retorna la configuración de métodos de pago desde caché local (síncrono).
 * Aislamiento estricto por tenantId.
 * Fallback a DEFAULT_PAYMENT_SETTINGS si no hay caché válida.
 * NO escribe en localStorage durante la lectura.
 */
export function getCachedStorePaymentSettings(tenantId: string): StorePaymentSettings {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return JSON.parse(JSON.stringify(DEFAULT_PAYMENT_SETTINGS));
  }
  const cached = loadFromStorage<Partial<StorePaymentSettings>>(tenantId, 'payment_settings', {});
  if (isValidPaymentSettings(cached)) {
    return cached;
  }
  return JSON.parse(JSON.stringify(DEFAULT_PAYMENT_SETTINGS));
}

// Alias para compatibilidad con código existente
export const getStorePaymentSettings = getCachedStorePaymentSettings;

/**
 * Consulta la configuración de métodos de pago del comercio con Supabase como fuente canónica.
 * Flujo:
 * 1. Valida tenantId.
 * 2. Consulta stores.payment_settings filtrando por stores.id = tenantId.
 * 3. Si Supabase devuelve un StorePaymentSettings válido: lo utiliza, actualiza la caché local del tenant y lo retorna.
 * 4. Si la consulta falla o aún no tiene datos configurados (o {}): recurre al valor existente de localStorage (fallback).
 * 5. Si tampoco existe localStorage válido, utiliza DEFAULT_PAYMENT_SETTINGS.
 * 6. NO sobrescribe Supabase automáticamente durante la lectura (migración conservadora).
 */
export async function fetchStorePaymentSettings(
  tenantId: string
): Promise<StorePaymentSettings> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return JSON.parse(JSON.stringify(DEFAULT_PAYMENT_SETTINGS));
  }

  const cached = getCachedStorePaymentSettings(tenantId);

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, payment_settings')
      .eq('id', tenantId)
      .maybeSingle();

    if (!error && data && isValidPaymentSettings(data.payment_settings)) {
      const remoteSettings = data.payment_settings as StorePaymentSettings;
      // Actualizar la caché local del tenant con el valor canónico
      saveToStorage(tenantId, 'payment_settings', remoteSettings);
      return remoteSettings;
    }

    if (error) {
      console.warn(
        '[CentralBo StoreAdmin] Aviso al consultar payment_settings en Supabase:',
        error.message
      );
    }
  } catch (err) {
    console.warn(
      '[CentralBo StoreAdmin] Excepción al consultar payment_settings en Supabase:',
      err
    );
  }

  // Fallback seguro: caché local existente o DEFAULT_PAYMENT_SETTINGS
  return cached;
}

/**
 * Persiste la configuración de métodos de pago de forma centralizada en Supabase (stores.payment_settings).
 * Aislamiento estricto por tenantId (stores.id = tenantId).
 * Solo actualiza la caché local tras la confirmación exitosa de Supabase.
 */
export async function saveStorePaymentSettings(
  tenantId: string,
  settings: StorePaymentSettings
): Promise<{ success: boolean; error?: string }> {
  if (!tenantId || typeof tenantId !== 'string' || !isValidTenantId(tenantId)) {
    return { success: false, error: 'Identificador de comercio (tenantId) no válido.' };
  }

  if (!isValidPaymentSettings(settings)) {
    return {
      success: false,
      error: 'Formato de configuración de métodos de pago inválido o incompleto.',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: updatedRows, error } = await supabase
      .from('stores')
      .update({
        payment_settings: settings,
        updated_at: now,
      })
      .eq('id', tenantId)
      .select('id');

    if (error) {
      console.error(
        '[CentralBo StoreAdmin] Error al persistir payment_settings en Supabase:',
        error
      );
      return {
        success: false,
        error: error.message || 'Error al persistir la configuración de métodos de pago en Supabase.',
      };
    }

    if (!updatedRows || updatedRows.length === 0) {
      return {
        success: false,
        error:
          'No se pudo actualizar el comercio en Supabase. Verifique permisos de administrador o sesión activa.',
      };
    }

    // Persistencia remota confirmada: actualizar la caché local de este tenant
    saveToStorage(tenantId, 'payment_settings', settings);
    return { success: true };
  } catch (err: any) {
    console.error(
      '[CentralBo StoreAdmin] Excepción al persistir payment_settings en Supabase:',
      err
    );
    return {
      success: false,
      error:
        err?.message ||
        'Error de conexión al guardar configuración de métodos de pago en el servidor.',
    };
  }
}

// ----------------------------------------------------------------------------
// 7. CONFIGURACIÓN ESPECÍFICA POR VERTICAL
// ----------------------------------------------------------------------------

export function getRestaurantSettings(tenantId: string): RestaurantSettings {
  const defaults: RestaurantSettings = {
    allowDineIn: true,
    allowDelivery: true,
    allowPickup: true,
    allowKitchenNotes: true,
    avgPrepTimeMinutes: 30,
    whatsappDirectOrders: true,
  };
  return loadFromStorage<RestaurantSettings>(tenantId, 'restaurant_config', defaults);
}

export function saveRestaurantSettings(
  tenantId: string,
  settings: RestaurantSettings
): void {
  saveToStorage(tenantId, 'restaurant_config', settings);
}

export function getFashionSettings(tenantId: string): FashionSettings {
  const defaults: FashionSettings = {
    exchangePolicy:
      'Cambios permitidos dentro de los 7 días hábiles posteriores a la entrega presentando el comprobante y la prenda sin uso con etiqueta original. No se realizan devoluciones en efectivo.',
    sizeGuide: [
      { size: 'XS', chest: '82 - 86 cm', waist: '62 - 66 cm', hips: '88 - 92 cm' },
      { size: 'S', chest: '86 - 90 cm', waist: '66 - 70 cm', hips: '92 - 96 cm' },
      { size: 'M', chest: '90 - 96 cm', waist: '70 - 76 cm', hips: '96 - 102 cm' },
      { size: 'L', chest: '96 - 102 cm', waist: '76 - 82 cm', hips: '102 - 108 cm' },
      { size: 'XL', chest: '102 - 108 cm', waist: '82 - 88 cm', hips: '108 - 114 cm' },
    ],
    enableColorSwatches: true,
  };
  return loadFromStorage<FashionSettings>(tenantId, 'fashion_config', defaults);
}

export function saveFashionSettings(
  tenantId: string,
  settings: FashionSettings
): void {
  saveToStorage(tenantId, 'fashion_config', settings);
}

export function getGeneralSettings(tenantId: string): GeneralSettings {
  const defaults: GeneralSettings = {
    catalogLayout: 'grid',
    showStockBadges: true,
  };
  return loadFromStorage<GeneralSettings>(tenantId, 'general_config', defaults);
}

export function saveGeneralSettings(
  tenantId: string,
  settings: GeneralSettings
): void {
  saveToStorage(tenantId, 'general_config', settings);
}

// ----------------------------------------------------------------------------
// SERVICIOS (Profesionales, Disponibilidad, Horarios Reservados, Citas)
// ----------------------------------------------------------------------------

export function createDefaultProfessionalSchedule(
  openDays: number[] = [1, 2, 3, 4, 5],
  startTime: string = '09:00',
  endTime: string = '18:00',
  satEndTime: string = '13:00'
): ProfessionalDaySchedule[] {
  const daysDefinition: Array<{ dayOfWeek: number; dayName: string }> = [
    { dayOfWeek: 1, dayName: 'Lunes' },
    { dayOfWeek: 2, dayName: 'Martes' },
    { dayOfWeek: 3, dayName: 'Miércoles' },
    { dayOfWeek: 4, dayName: 'Jueves' },
    { dayOfWeek: 5, dayName: 'Viernes' },
    { dayOfWeek: 6, dayName: 'Sábado' },
    { dayOfWeek: 0, dayName: 'Domingo' },
  ];

  return daysDefinition.map((d) => {
    const isOpen = openDays.includes(d.dayOfWeek);
    const dayEnd = d.dayOfWeek === 6 ? satEndTime : endTime;
    return {
      dayOfWeek: d.dayOfWeek,
      dayName: d.dayName,
      isOpen,
      startTime,
      endTime: dayEnd,
    };
  });
}

export function getStoreProfessionals(tenantId: string): ProfessionalItem[] {
  const defaults: ProfessionalItem[] = [
    {
      id: 'prof-1',
      tenant_id: tenantId,
      name: 'Lic. Claudia Morales',
      specialty: 'Cosmetología y Cuidado Facial',
      phone: '+591 70192837',
      avatarUrl: '',
      isActive: true,
      workDays: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
      shiftHours: '09:00 - 18:00 (Sáb 09:00 - 13:00)',
      serviceIds: ['srv-2'], // Limpieza Facial
      schedule: createDefaultProfessionalSchedule([1, 3, 5, 6], '09:00', '18:00', '13:00'),
    },
    {
      id: 'prof-2',
      tenant_id: tenantId,
      name: 'Dr. Roberto Mendoza',
      specialty: 'Fisioterapia y Masajes Terapéuticos',
      phone: '+591 71283940',
      avatarUrl: '',
      isActive: true,
      workDays: ['Martes', 'Jueves', 'Viernes', 'Sábado'],
      shiftHours: '10:00 - 19:00 (Sáb 10:00 - 14:00)',
      serviceIds: ['srv-1'], // Masaje Descontracturante
      schedule: createDefaultProfessionalSchedule([2, 4, 5, 6], '10:00', '19:00', '14:00'),
    },
  ];

  const loaded = loadFromStorage<ProfessionalItem[]>(tenantId, 'professionals', defaults);

  // Normalizar para garantizar que serviceIds y schedule siempre existan
  return loaded.map((prof) => ({
    ...prof,
    serviceIds:
      Array.isArray(prof.serviceIds) && prof.serviceIds.length > 0
        ? prof.serviceIds
        : prof.id === 'prof-1'
        ? ['srv-2']
        : prof.id === 'prof-2'
        ? ['srv-1']
        : [],
    schedule:
      Array.isArray(prof.schedule) && prof.schedule.length === 7
        ? prof.schedule
        : prof.id === 'prof-1'
        ? createDefaultProfessionalSchedule([1, 3, 5, 6], '09:00', '18:00', '13:00')
        : createDefaultProfessionalSchedule([2, 4, 5, 6], '10:00', '19:00', '14:00'),
  }));
}

export function saveStoreProfessionals(
  tenantId: string,
  professionals: ProfessionalItem[]
): void {
  saveToStorage(tenantId, 'professionals', professionals);
}

/**
 * Genera la grilla de turnos de un profesional para una fecha específica (YYYY-MM-DD),
 * calculando los 4 estados canónicos: 'disponible', 'pendiente', 'confirmada', 'bloqueada'.
 * Respeta rigurosamente los días y horas de atención configurados para ese día.
 */
export function getProfessionalAgendaSlots(
  tenantId: string,
  professional: ProfessionalItem,
  dateStr: string
): ProfessionalAgendaSlot[] {
  if (!professional || !professional.schedule) {
    return [];
  }

  // Extraer día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day, 12, 0, 0);
  const dayOfWeek = targetDate.getDay();

  const daySchedule = professional.schedule.find((s) => s.dayOfWeek === dayOfWeek);

  // Si no atiende este día de la semana, no hay horarios disponibles
  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
  const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

  const startTotalMinutes = (isNaN(startHour) ? 9 : startHour) * 60 + (isNaN(startMin) ? 0 : startMin);
  const endTotalMinutes = (isNaN(endHour) ? 18 : endHour) * 60 + (isNaN(endMin) ? 0 : endMin);

  // Intervalos de 60 minutos por sesión
  const intervalMinutes = 60;
  const rawTimes: string[] = [];

  for (let m = startTotalMinutes; m + intervalMinutes <= endTotalMinutes; m += intervalMinutes) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    rawTimes.push(`${hh}:${mm}`);
  }

  // Cargar bloqueos manuales / citas externas y citas del comercio
  const reservedSlots = getStoreReservedTimeSlots(tenantId);
  const appointments = getStoreAppointments(tenantId);

  return rawTimes.map((time) => {
    // 1. Bloqueo manual o cita externa
    const reserved = reservedSlots.find(
      (r) =>
        r.date === dateStr &&
        r.time === time &&
        (r.professionalId === professional.id || !r.professionalId)
    );

    if (reserved) {
      return {
        time,
        status: 'bloqueada' as AgendaSlotStatus,
        reason: reserved.reason || 'Bloqueo manual / Cita externa',
        reservedSlot: reserved,
      };
    }

    // 2. Cita solicitada en el sistema (excluyendo rechazadas)
    const apt = appointments.find(
      (a) =>
        a.professionalId === professional.id &&
        a.date === dateStr &&
        a.time === time &&
        a.status !== 'rechazada'
    );

    if (apt) {
      return {
        time,
        status: apt.status as AgendaSlotStatus, // 'pendiente' | 'confirmada'
        appointment: apt,
      };
    }

    // 3. Disponible
    return {
      time,
      status: 'disponible' as AgendaSlotStatus,
    };
  });
}

export function getStoreReservedTimeSlots(tenantId: string): ReservedTimeSlot[] {
  const today = new Date().toISOString().split('T')[0];
  const defaults: ReservedTimeSlot[] = [
    {
      id: 'res-1',
      tenant_id: tenantId,
      professionalId: 'prof-1',
      date: today,
      time: '11:00',
      reason: 'Cita Externa en Domicilio',
      isExternal: true,
    },
    {
      id: 'res-2',
      tenant_id: tenantId,
      professionalId: 'prof-2',
      date: today,
      time: '16:00',
      reason: 'Mantenimiento de Cabina de Masajes',
      isExternal: false,
    },
  ];
  return loadFromStorage<ReservedTimeSlot[]>(tenantId, 'reserved_slots', defaults);
}

export function saveStoreReservedTimeSlots(
  tenantId: string,
  slots: ReservedTimeSlot[]
): void {
  saveToStorage(tenantId, 'reserved_slots', slots);
}

export function getStoreAppointments(tenantId: string): AppointmentRequest[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const defaults: AppointmentRequest[] = [
    {
      id: 'cita-101',
      tenant_id: tenantId,
      serviceId: 'srv-1',
      serviceName: 'Masaje Descontracturante Profundo (60 min)',
      professionalId: 'prof-2',
      professionalName: 'Dr. Roberto Mendoza',
      customerName: 'Silvia Vargas',
      customerPhone: '+591 78912345',
      customerEmail: 'silvia.vargas@email.bo',
      date: today,
      time: '15:00',
      status: 'pendiente',
      createdAt: '2026-09-07T08:15:00Z',
      notes: 'Sufro de tensión en cuello y hombros por trabajo sedentario.',
    },
    {
      id: 'cita-102',
      tenant_id: tenantId,
      serviceId: 'srv-2',
      serviceName: 'Limpieza Facial Hidratante con Ácido Hialurónico (45 min)',
      professionalId: 'prof-1',
      professionalName: 'Lic. Claudia Morales',
      customerName: 'Carlos Paredes',
      customerPhone: '+591 76543219',
      customerEmail: 'cparedes@gmail.com',
      date: tomorrow,
      time: '10:30',
      status: 'confirmada',
      createdAt: '2026-09-06T19:40:00Z',
      notes: 'Primera sesión facial.',
    },
  ];
  return loadFromStorage<AppointmentRequest[]>(tenantId, 'appointments', defaults);
}

export function saveStoreAppointments(
  tenantId: string,
  appointments: AppointmentRequest[]
): void {
  saveToStorage(tenantId, 'appointments', appointments);
}

// ----------------------------------------------------------------------------
// 8. CATEGORÍAS (Por Tenant)
// ----------------------------------------------------------------------------
export function getStoreCategories(tenantId: string, storeType: StoreType): Category[] {
  const defaultCategories: Category[] =
    storeType === 'restaurante'
      ? [
          {
            id: 'cat-rest-1',
            tenant_id: tenantId,
            name: 'Pizzas Artesanales',
            status: 'activo',
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'cat-rest-2',
            tenant_id: tenantId,
            name: 'Pastas Frescas',
            status: 'activo',
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'cat-rest-3',
            tenant_id: tenantId,
            name: 'Bebidas y Vinos',
            status: 'activo',
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'cat-rest-4',
            tenant_id: tenantId,
            name: 'Postres Clásicos',
            status: 'activo',
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
        ]
      : storeType === 'moda'
      ? [
          {
            id: 'cat-moda-1',
            tenant_id: tenantId,
            name: 'Vestidos & Enterizos',
            status: 'activo',
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
          {
            id: 'cat-moda-2',
            tenant_id: tenantId,
            name: 'Abrigos & Chaquetas',
            status: 'activo',
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
          {
            id: 'cat-moda-3',
            tenant_id: tenantId,
            name: 'Calzado & Botines',
            status: 'activo',
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
        ]
      : storeType === 'servicios'
      ? [
          {
            id: 'cat-serv-1',
            tenant_id: tenantId,
            name: 'Masoterapia & Relajación',
            status: 'activo',
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
          {
            id: 'cat-serv-2',
            tenant_id: tenantId,
            name: 'Cuidado Facial',
            status: 'activo',
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
          {
            id: 'cat-serv-3',
            tenant_id: tenantId,
            name: 'Paquetes de Spa',
            status: 'activo',
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
        ]
      : [
          {
            id: 'cat-gen-1',
            tenant_id: tenantId,
            name: 'Despensa & Abarrotes',
            status: 'activo',
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
          {
            id: 'cat-gen-2',
            tenant_id: tenantId,
            name: 'Lácteos & Refrigerados',
            status: 'activo',
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
          {
            id: 'cat-gen-3',
            tenant_id: tenantId,
            name: 'Limpieza del Hogar',
            status: 'activo',
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
        ];

  return loadFromStorage<Category[]>(tenantId, 'categories', defaultCategories);
}

export function saveStoreCategories(
  tenantId: string,
  categories: Category[]
): void {
  saveToStorage(tenantId, 'categories', categories);
}

// ----------------------------------------------------------------------------
// 9. PRODUCTOS (Por Tenant con particularidades por vertical)
// ----------------------------------------------------------------------------
export function getStoreProducts(tenantId: string, storeType: StoreType): Product[] {
  const defaultProducts: Product[] =
    storeType === 'restaurante'
      ? [
          {
            id: 'prod-rest-1',
            tenant_id: tenantId,
            category_id: 'cat-rest-1',
            name: 'Pizza Margherita Di Bufala',
            description: 'Masa madre fermentada 48h, salsa de tomate San Marzano, mozzarella di bufala y albahaca fresca.',
            price: 65,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 75,
              offer_price: 65,
              modifiers: [
                { name: 'Extra Mozzarella di Bufala', price: 12 },
                { name: 'Jamón Prosciutto Di Parma', price: 18 },
                { name: 'Champiñones Salteados', price: 8 },
              ],
              is_combo: false,
              kitchen_notes_allowed: true,
              allow_pickup: true,
              allow_delivery: true,
            },
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'prod-rest-2',
            tenant_id: tenantId,
            category_id: 'cat-rest-2',
            name: 'Fettuccine Al Tartufo Nero',
            description: 'Pasta artesanal al huevo salteada con mantequilla de trufa negra, parmesano reggiano de 24 meses.',
            price: 80,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 80,
              offer_price: null,
              modifiers: [
                { name: 'Extra Parmesano Reggiano', price: 10 },
                { name: 'Pechuga de Pollo Grillada', price: 15 },
              ],
              is_combo: false,
              kitchen_notes_allowed: true,
              allow_pickup: true,
              allow_delivery: true,
            },
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'prod-rest-3',
            tenant_id: tenantId,
            category_id: 'cat-rest-1',
            name: 'Combo Especial Pareja',
            description: '1 Pizza Familiar a elección + 2 Pastas clásicas + 2 Bebidas artesanales y 1 Tiramisú para compartir.',
            price: 155,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 180,
              offer_price: 155,
              is_combo: true,
              combo_items: ['1 Pizza Familiar', '2 Pastas Clásicas', '2 Bebidas', '1 Tiramisú'],
              modifiers: [],
              kitchen_notes_allowed: true,
              allow_pickup: true,
              allow_delivery: true,
            },
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'prod-rest-4',
            tenant_id: tenantId,
            category_id: 'cat-rest-4',
            name: 'Tiramisú Tradizionale',
            description: 'Bizcochos savoiardi embebidos en café expreso italiano con crema de mascarpone y cacao amargo.',
            price: 32,
            is_available: false, // Agotado
            image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: false,
              previous_price: 32,
              offer_price: null,
              modifiers: [],
              is_combo: false,
              kitchen_notes_allowed: false,
              allow_pickup: true,
              allow_delivery: true,
            },
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
        ]
      : storeType === 'moda'
      ? [
          {
            id: 'prod-moda-1',
            tenant_id: tenantId,
            category_id: 'cat-moda-1',
            name: 'Vestido Midi Plisado Clásico',
            description: 'Vestido midi con caída fluida, escote en V y cinto ajustable. Tejido transpirable de alta resistencia.',
            price: 240,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 280,
              offer_price: 240,
              sizes: ['S', 'M', 'L'],
              colors: [
                { name: 'Azul Marino', hex: '#1e3a8a' },
                { name: 'Verde Esmeralda', hex: '#065f46' },
                { name: 'Terracota', hex: '#9a3412' },
              ],
              gallery_images: [
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80',
              ],
              size_guide: 'Corte regular estándar. Consultar tabla de medidas.',
              exchange_policy: 'Cambio disponible por talla hasta 7 días hábiles.',
            },
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
          {
            id: 'prod-moda-2',
            tenant_id: tenantId,
            category_id: 'cat-moda-2',
            name: 'Abrigo Lana Premium Altiplano',
            description: 'Confeccionado en mezcla de lana de alpaca suave con forro térmico satinado. Estilo elegante con botones cruzados.',
            price: 490,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 520,
              offer_price: 490,
              sizes: ['M', 'L', 'XL'],
              colors: [
                { name: 'Camel Clásico', hex: '#c2884a' },
                { name: 'Gris Grafito', hex: '#374151' },
              ],
              gallery_images: [
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
              ],
              size_guide: 'Holgado para uso sobre jersey.',
              exchange_policy: 'Garantía de confección 15 días.',
            },
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
          {
            id: 'prod-moda-3',
            tenant_id: tenantId,
            category_id: 'cat-moda-1',
            name: 'Blusa Seda Satín Elegante',
            description: 'Blusa en seda satinada de tacto sutil con cuello camisero atelier y puños drapeados. Confección refinada para eventos.',
            price: 195,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 220,
              offer_price: 195,
              sizes: ['XS', 'S', 'M', 'L'],
              colors: [
                { name: 'Champagne Perla', hex: '#f7f1e5' },
                { name: 'Rosa Empolvado', hex: '#d4a59a' },
                { name: 'Negro Carbón', hex: '#1c1917' },
              ],
              gallery_images: [
                'https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&auto=format&fit=crop&q=80',
              ],
              size_guide: 'Caída suelta estándar.',
              exchange_policy: 'Cambio hasta 7 días con etiqueta.',
            },
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
          {
            id: 'prod-moda-4',
            tenant_id: tenantId,
            category_id: 'cat-moda-3',
            name: 'Botines Cuero Nappa Atelier',
            description: 'Botines artesanales en cuero nappa flexible con tacón medio bloque y cierre lateral invisible. Acabado de lujo.',
            price: 360,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: false,
              sizes: ['36', '37', '38', '39'],
              colors: [
                { name: 'Negro Atelier', hex: '#18181b' },
                { name: 'Camel Nuez', hex: '#a27035' },
              ],
              gallery_images: [
                'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
              ],
              size_guide: 'Horma estándar boliviana.',
              exchange_policy: 'Cambio por número sin costo.',
            },
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
        ]
      : storeType === 'servicios'
      ? [
          {
            id: 'srv-1',
            tenant_id: tenantId,
            category_id: 'cat-serv-1',
            name: 'Masaje Descontracturante Profundo',
            description: 'Terapia manual enfocada en aliviar tensiones musculares crónicas, espalda y cuello con aceites botánicos.',
            price: 180,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_service: true,
              duration_minutes: 60,
              specialty: 'Fisioterapia y Masajes',
              professional_id: 'prof-2',
              professional_name: 'Dr. Roberto Mendoza',
              is_featured: true,
              previous_price: 200,
              offer_price: 180,
            },
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
          {
            id: 'srv-2',
            tenant_id: tenantId,
            category_id: 'cat-serv-2',
            name: 'Limpieza Facial Hidratante Profunda',
            description: 'Exfoliación suave, extracción de impurezas, vapor de ozono y máscara de ácido hialurónico hidratante.',
            price: 150,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_service: true,
              duration_minutes: 45,
              specialty: 'Cosmetología y Cuidado Facial',
              professional_id: 'prof-1',
              professional_name: 'Lic. Claudia Morales',
              is_featured: true,
              previous_price: 150,
              offer_price: null,
            },
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
        ]
      : [
          {
            id: 'prod-gen-1',
            tenant_id: tenantId,
            category_id: 'cat-gen-1',
            name: 'Café Yungas Tostado Especial 500g',
            description: 'Granos de café arábica seleccionados de los valles de Los Yungas, tostado medio aromático.',
            price: 45,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 50,
              offer_price: 45,
              sku: 'CAF-YUNG-500',
              stock_units: 34,
            },
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
          {
            id: 'prod-gen-2',
            tenant_id: tenantId,
            category_id: 'cat-gen-2',
            name: 'Queso Menonita Artesanal 1kg',
            description: 'Queso semi-maduro tradicional de excelente fundición para preparaciones típicas.',
            price: 38,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: false,
              previous_price: 38,
              offer_price: null,
              sku: 'QUE-MEN-1000',
              stock_units: 18,
            },
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
        ];

  return loadFromStorage<Product[]>(tenantId, 'products', defaultProducts);
}

export function saveStoreProducts(
  tenantId: string,
  products: Product[]
): void {
  if (!Array.isArray(products)) {
    console.warn('[CentralBo StoreAdmin] Intento de guardar productos con valor no válido.');
    return;
  }
  const sanitized = products
    .map((p) => sanitizeProductItem(p, tenantId))
    .filter((p): p is Product => p !== null);
  saveToStorage(tenantId, 'products', sanitized);
}

// ----------------------------------------------------------------------------
// 10. PEDIDOS (Por Tenant con los 7 estados canónicos y sincronización Supabase)
// ----------------------------------------------------------------------------

/**
 * Obtiene los pedidos del tenant desde la caché local o estado inicial limpio.
 * NO inyecta pedidos demo/ficticios. Comercios nuevos comienzan con [].
 */
export function getStoreOrders(tenantId: string): Order[] {
  const loaded = loadFromStorage<Order[]>(tenantId, 'orders', []);
  // Filtrar pedidos demo residuales de pruebas previas ('ord-100X')
  return Array.isArray(loaded) ? loaded.filter((o) => !o.id.startsWith('ord-100')) : [];
}

/**
 * Consulta de forma centralizada los pedidos reales en Supabase filtrando exclusivamente por tenant_id.
 * Sincroniza la caché local y retorna la lista ordenada descendentemente por fecha.
 */
export async function fetchStoreOrders(tenantId: string): Promise<Order[]> {
  if (!tenantId) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, tenant_id, customer_id, customer_name, customer_email, customer_phone, status, total, created_at, updated_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const sanitizedOrders: Order[] = data.map((o: any) => ({
        id: String(o.id),
        tenant_id: String(o.tenant_id),
        customer_id: o.customer_id ? String(o.customer_id) : null,
        customer_name: o.customer_name ? String(o.customer_name) : null,
        customer_email: o.customer_email ? String(o.customer_email) : null,
        customer_phone: o.customer_phone ? String(o.customer_phone) : null,
        status: (o.status || 'pendiente') as OrderStatus,
        total: Number(o.total) || 0,
        created_at: o.created_at || new Date().toISOString(),
        updated_at: o.updated_at || new Date().toISOString(),
      }));

      // Mantener sincronizado el almacenamiento local del tenant sin pedidos mock
      saveStoreOrders(tenantId, sanitizedOrders);
      return sanitizedOrders;
    }

    if (error) {
      console.warn('[CentralBo StoreAdmin] Error al consultar pedidos en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('[CentralBo StoreAdmin] Excepción remota al consultar pedidos en Supabase:', err);
  }

  // Respaldo de pedidos en caché local
  return getStoreOrders(tenantId);
}

export function saveStoreOrders(tenantId: string, orders: Order[]): void {
  if (!Array.isArray(orders)) {
    console.warn('[CentralBo StoreAdmin] Intento de guardar pedidos con valor no válido.');
    return;
  }
  const sanitized = orders
    .map((o) => sanitizeOrderItem(o, tenantId))
    .filter((o): o is Order => o !== null && !o.id.startsWith('ord-100'));
  saveToStorage(tenantId, 'orders', sanitized);
}

export async function updateOrderStatus(
  tenantId: string,
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; order?: Order; error?: string }> {
  // Validación estricta en runtime: debe pertenecer exclusivamente al conjunto canónico
  if (
    !newStatus ||
    typeof newStatus !== 'string' ||
    !CANONICAL_ORDER_STATUSES.includes(newStatus)
  ) {
    console.warn(`[CentralBo StoreAdmin] Estado de pedido rechazado por no ser canónico: "${newStatus}"`);
    return { success: false, error: 'Estado no canónico' };
  }

  const now = new Date().toISOString();

  // 1. Persistencia centralizada en Supabase (tabla 'orders')
  try {
    const { error: remoteError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: now,
      })
      .eq('id', orderId)
      .eq('tenant_id', tenantId);

    if (remoteError) {
      console.warn('[CentralBo StoreAdmin] Error al actualizar estado en Supabase:', remoteError.message);
    }
  } catch (err: any) {
    console.warn('[CentralBo StoreAdmin] Excepción remota al actualizar estado en Supabase:', err);
  }

  // 2. Actualizar caché local del tenant
  const orders = getStoreOrders(tenantId);
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) {
    return { success: false, error: 'Pedido no encontrado en la lista local' };
  }

  orders[index] = {
    ...orders[index],
    status: newStatus,
    updated_at: now,
  };

  saveStoreOrders(tenantId, orders);
  return { success: true, order: orders[index] };
}

// ----------------------------------------------------------------------------
// 11. PROMOCIONES
// ----------------------------------------------------------------------------
export function getStorePromotions(tenantId: string): PromotionCode[] {
  const defaultPromotions: PromotionCode[] = [
    {
      id: 'promo-1',
      tenant_id: tenantId,
      code: 'BIENVENIDO10',
      discountType: 'percentage',
      discountValue: 10,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      minPurchase: 50,
      isActive: true,
    },
    {
      id: 'promo-2',
      tenant_id: tenantId,
      code: 'ENVIOGRATIS20',
      discountType: 'fixed',
      discountValue: 15,
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      minPurchase: 100,
      isActive: true,
    },
  ];

  return loadFromStorage<PromotionCode[]>(tenantId, 'promotions', defaultPromotions);
}

export function saveStorePromotions(
  tenantId: string,
  promos: PromotionCode[]
): void {
  saveToStorage(tenantId, 'promotions', promos);
}

// ----------------------------------------------------------------------------
// 12. ESTADÍSTICAS Y ANTI-INFLACIÓN DE VISITAS
// ----------------------------------------------------------------------------
const VISIT_SESSION_KEY = 'centralbo_last_visit_timestamp_';

export function getStoreStatistics(tenantId: string): StoreStatistics {
  const superStore = SUPERADMIN_STORES.find((s) => s.id === tenantId);
  const baseVisits = superStore?.activity.visitas || 1200;
  const orders = getStoreOrders(tenantId);
  const completedOrders = orders.filter((o) => o.status === 'completado').length;

  const products = getStoreProducts(
    tenantId,
    (superStore?.store_type || 'general') as StoreType
  );

  const mostViewed = products.slice(0, 4).map((p, idx) => {
    const views = Math.round(baseVisits * (0.35 - idx * 0.08));
    return {
      id: p.id,
      name: p.name,
      category: 'General',
      views: Math.max(views, 20),
      percentage: Math.round(((views || 20) / baseVisits) * 100),
    };
  });

  const totalOrdersCount = orders.length;
  const conversionRate = Number(((totalOrdersCount / baseVisits) * 100).toFixed(1));

  const stats: StoreStatistics = {
    totalVisits: baseVisits,
    todayVisits: Math.round(baseVisits * 0.08),
    last7DaysVisits: Math.round(baseVisits * 0.38),
    last30DaysVisits: baseVisits,
    mostViewedProducts: mostViewed,
    totalOrders: totalOrdersCount,
    completedOrders: completedOrders,
    conversionRate: conversionRate,
    antiInflationWindowMinutes: 30,
  };

  return loadFromStorage<StoreStatistics>(tenantId, 'statistics', stats);
}

// Mecanismo anti-inflación de visitas (Deduplicación por ventana de 30 minutos)
export function recordStoreVisitSafely(tenantId: string): boolean {
  if (!isValidTenantId(tenantId)) {
    return false;
  }
  const now = Date.now();
  const sessionKey = `${VISIT_SESSION_KEY}${tenantId.trim()}`;
  const lastRecorded = localStorage.getItem(sessionKey);

  if (lastRecorded) {
    const elapsedMinutes = (now - Number(lastRecorded)) / (1000 * 60);
    // Si la última visita fue hace menos de 30 minutos, evitar conteo duplicado
    if (elapsedMinutes < 30) {
      return false; // Visita descartada por anti-inflación
    }
  }

  localStorage.setItem(sessionKey, String(now));
  // Incrementar estadística
  const stats = getStoreStatistics(tenantId);
  stats.totalVisits += 1;
  stats.todayVisits += 1;
  stats.last7DaysVisits += 1;
  stats.last30DaysVisits += 1;
  stats.conversionRate = Number(((stats.totalOrders / stats.totalVisits) * 100).toFixed(1));
  saveToStorage(tenantId, 'statistics', stats);
  return true;
}
