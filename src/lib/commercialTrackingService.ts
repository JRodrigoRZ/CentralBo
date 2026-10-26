/**
 * CentralBo / MAXINEGO — MÓDULO 7: MEDICIÓN DE CLICS Y SOLICITUDES COMERCIALES
 * PERSISTENCIA Y CONSOLIDACIÓN CENTRALIZADA
 *
 * Principios rectores:
 * 1. Persistencia Central: Los eventos se envían y consolidan en el servidor central de MAXINEGO
 *    (/api/commercial/events y /api/commercial/metrics), no solo en el navegador local.
 * 2. Continuidad Multi-Dispositivo: Las métricas representan la actividad global de todos los
 *    visitantes, persistiendo aunque el usuario cierre el navegador o use distintos dispositivos.
 * 3. Distinción Estricta: Mantiene la diferenciación aprobada entre clics, intentos de formulario,
 *    validaciones fallidas, solicitudes comerciales válidas y aperturas de WhatsApp.
 * 4. Cero Almacenamiento de Datos Personales: Cumplimiento riguroso de privacidad. NUNCA se guardan
 *    nombres, teléfonos, correos, contraseñas ni textos de consultas.
 * 5. Prevención de Duplicados: Protección de 600ms contra doble clic accidental.
 */

export type CommercialActionType =
  | 'click_crear_mi_tienda'
  | 'click_explorar_tiendas'
  | 'click_ver_tienda_catalogo'
  | 'click_solicitar_informacion'
  | 'intento_formulario_comercial'
  | 'validacion_formulario_fallida'
  | 'solicitud_comercial_valida'
  | 'apertura_whatsapp_comercial';

export type CommercialOrigin =
  | 'header_desktop'
  | 'header_mobile'
  | 'vitrina_empty_state'
  | 'vitrina_filtered_empty'
  | 'asi_se_ve_tu_tienda'
  | 'hero_mockup'
  | 'hero_cta'
  | 'hero_secundario'
  | 'vitrina_card'
  | 'planes_basic'
  | 'planes_pro'
  | 'formulario_contacto'
  | 'formulario_contacto_reabrir';

export interface CommercialEventMetadata {
  origin: CommercialOrigin | string;
  storeSlug?: string;
  storeName?: string;
  planId?: 'basic' | 'pro' | string;
  reason?: string;
  [key: string]: any;
}

export interface CommercialEvent {
  id: string;
  type: CommercialActionType;
  origin: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CommercialMetricsSummary {
  // Clics
  crear_mi_tienda_total: number;
  crear_mi_tienda_por_origen: Record<string, number>;

  explorar_tiendas_total: number;
  explorar_tiendas_por_origen: Record<string, number>;

  ver_tienda_catalogo_total: number;
  ver_tienda_por_comercio: Record<string, number>;

  solicitar_info_clics_total: number;
  solicitar_info_por_origen: Record<string, number>;

  // Formulario y conversión comercial
  formulario_intentos_total: number;
  formulario_validaciones_fallidas_total: number;
  solicitudes_comerciales_validas_total: number;
  aperturas_whatsapp_comercial_total: number;

  distribucion_por_origen?: Record<string, number>;
  ultimo_evento: CommercialEvent | null;
  total_eventos_registrados: number;
  actualizado_en?: string;
  fuente?: string;
}

const STORAGE_EVENTS_KEY = 'maxinego_commercial_events_v1';
const STORAGE_SUMMARY_KEY = 'maxinego_commercial_summary_v1';

// Memoria para evitar duplicaciones por doble clic rápido (< 600ms)
let lastTrackedSignature = '';
let lastTrackedTime = 0;

// Caché en memoria de las métricas consolidadas
let consolidatedMetricsCache: CommercialMetricsSummary | null = null;

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Envía el evento al backend central persistente de MAXINEGO
 */
async function sendToCentralServer(
  type: CommercialActionType,
  origin: string,
  sanitizedMetadata: Record<string, any>
): Promise<CommercialMetricsSummary | null> {
  if (typeof window === 'undefined') return null;

  try {
    const payload = JSON.stringify({
      type,
      origin,
      metadata: sanitizedMetadata,
    });

    const response = await fetch('/api/commercial/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
      keepalive: true, // Asegura que se complete incluso ante redirección o apertura externa
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.metrics) {
        consolidatedMetricsCache = data.metrics;
        try {
          localStorage.setItem(STORAGE_SUMMARY_KEY, JSON.stringify(data.metrics));
        } catch {}
        return data.metrics;
      }
    }
  } catch (err) {
    // Si la red falla temporalmente, el evento ya se guardó localmente y se conservará
    console.warn('[CommercialTracking] Envío central en segundo plano:', err);
  }

  return null;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const { supabase } = await import('./supabase');
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {}
  return {};
}

/**
 * Consulta las métricas globales consolidadas en el servidor central
 * Protegido: Solo se ejecuta si existe una sesión administrativa activa
 */
export async function fetchCentralCommercialMetrics(): Promise<CommercialMetricsSummary> {
  try {
    const authHeader = await getAuthHeader();
    // Protección estricta: visitantes anónimos no deben acceder a métricas globales de la plataforma
    if (!authHeader.Authorization) {
      return getCommercialMetricsSummary();
    }

    const response = await fetch('/api/commercial/metrics', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...authHeader,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.metricas) {
        consolidatedMetricsCache = data.metricas;
        try {
          localStorage.setItem(STORAGE_SUMMARY_KEY, JSON.stringify(data.metricas));
        } catch {}
        return data.metricas;
      }
    }
  } catch (err) {
    // Silencioso para no ensuciar consola si no hay permisos
  }

  return getCommercialMetricsSummary();
}

/**
 * Consulta el listado reciente de eventos registrados en el servidor central
 * Protegido: Solo se ejecuta si existe una sesión administrativa activa
 */
export async function fetchCentralCommercialEvents(limit = 50): Promise<CommercialEvent[]> {
  try {
    const authHeader = await getAuthHeader();
    if (!authHeader.Authorization) {
      return getCommercialEventsLog(limit);
    }

    const response = await fetch(`/api/commercial/events?limit=${limit}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...authHeader,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.events)) {
        return data.events;
      }
    }
  } catch (err) {
    // Silencioso
  }

  return getCommercialEventsLog(limit);
}

/**
 * Registra un evento de interacción comercial en la landing pública.
 * Guarda de forma centralizada y persistente, preservando la privacidad del usuario.
 */
export function trackCommercialEvent(
  type: CommercialActionType,
  metadata: CommercialEventMetadata
): boolean {
  if (typeof window === 'undefined') return false;

  const now = Date.now();
  const signature = `${type}:${metadata.origin}:${metadata.storeSlug || ''}:${metadata.planId || ''}`;

  // Prevención estricta de duplicación accidental por doble clic rápido (< 600ms)
  if (signature === lastTrackedSignature && now - lastTrackedTime < 600) {
    return false;
  }

  lastTrackedSignature = signature;
  lastTrackedTime = now;

  try {
    // Sanitización estricta de privacidad: NUNCA se extraen nombres, correos ni teléfonos
    const sanitizedMetadata: Record<string, string | number | boolean> = {
      origin: metadata.origin,
    };

    if (metadata.storeSlug) sanitizedMetadata.storeSlug = String(metadata.storeSlug).slice(0, 60);
    if (metadata.storeName) sanitizedMetadata.storeName = String(metadata.storeName).slice(0, 80);
    if (metadata.planId) sanitizedMetadata.planId = String(metadata.planId).slice(0, 20);
    if (metadata.reason) sanitizedMetadata.reason = String(metadata.reason).slice(0, 60);

    const event: CommercialEvent = {
      id: generateEventId(),
      type,
      origin: String(metadata.origin),
      timestamp: new Date().toISOString(),
      metadata: sanitizedMetadata,
    };

    // 1. Respaldo local en el navegador
    let events: CommercialEvent[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
      if (raw) events = JSON.parse(raw);
    } catch {
      events = [];
    }

    events.unshift(event);
    if (events.length > 300) {
      events = events.slice(0, 300);
    }
    try {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    } catch {}

    // 2. Actualización optimista de contadores locales
    updateLocalOptimisticSummary(event);

    // 3. PERSISTENCIA CENTRAL: Envío asíncrono no bloqueante al servidor central
    sendToCentralServer(type, String(metadata.origin), sanitizedMetadata);

    // 4. Emitir evento en el navegador para escuchas reactivas si se requiere
    window.dispatchEvent(
      new CustomEvent('maxinego:commercial_event', { detail: event })
    );

    return true;
  } catch (err) {
    console.warn('[CommercialTracking] Error al registrar evento:', err);
    return false;
  }
}

/**
 * Actualiza el resumen optimista local mientras el servidor central responde.
 */
function updateLocalOptimisticSummary(event: CommercialEvent): void {
  const summary = getCommercialMetricsSummary();

  summary.total_eventos_registrados += 1;
  summary.ultimo_evento = event;

  switch (event.type) {
    case 'click_crear_mi_tienda':
      summary.crear_mi_tienda_total += 1;
      summary.crear_mi_tienda_por_origen[event.origin] =
        (summary.crear_mi_tienda_por_origen[event.origin] || 0) + 1;
      break;

    case 'click_explorar_tiendas':
      summary.explorar_tiendas_total += 1;
      summary.explorar_tiendas_por_origen[event.origin] =
        (summary.explorar_tiendas_por_origen[event.origin] || 0) + 1;
      break;

    case 'click_ver_tienda_catalogo':
      summary.ver_tienda_catalogo_total += 1;
      const storeKey =
        (event.metadata?.storeSlug as string) ||
        (event.metadata?.storeName as string) ||
        'desconocido';
      summary.ver_tienda_por_comercio[storeKey] =
        (summary.ver_tienda_por_comercio[storeKey] || 0) + 1;
      break;

    case 'click_solicitar_informacion':
      summary.solicitar_info_clics_total += 1;
      summary.solicitar_info_por_origen[event.origin] =
        (summary.solicitar_info_por_origen[event.origin] || 0) + 1;
      break;

    case 'intento_formulario_comercial':
      summary.formulario_intentos_total += 1;
      break;

    case 'validacion_formulario_fallida':
      summary.formulario_validaciones_fallidas_total += 1;
      break;

    case 'solicitud_comercial_valida':
      summary.solicitudes_comerciales_validas_total += 1;
      break;

    case 'apertura_whatsapp_comercial':
      summary.aperturas_whatsapp_comercial_total += 1;
      break;
  }

  consolidatedMetricsCache = summary;

  try {
    localStorage.setItem(STORAGE_SUMMARY_KEY, JSON.stringify(summary));
  } catch {}
}

/**
 * Devuelve el resumen acumulado actual de métricas comerciales.
 */
export function getCommercialMetricsSummary(): CommercialMetricsSummary {
  const defaultSummary: CommercialMetricsSummary = {
    crear_mi_tienda_total: 0,
    crear_mi_tienda_por_origen: {},
    explorar_tiendas_total: 0,
    explorar_tiendas_por_origen: {},
    ver_tienda_catalogo_total: 0,
    ver_tienda_por_comercio: {},
    solicitar_info_clics_total: 0,
    solicitar_info_por_origen: {},
    formulario_intentos_total: 0,
    formulario_validaciones_fallidas_total: 0,
    solicitudes_comerciales_validas_total: 0,
    aperturas_whatsapp_comercial_total: 0,
    distribucion_por_origen: {},
    ultimo_evento: null,
    total_eventos_registrados: 0,
    fuente: 'consolidada_persistente',
  };

  if (consolidatedMetricsCache) {
    return { ...defaultSummary, ...consolidatedMetricsCache };
  }

  if (typeof window === 'undefined') return defaultSummary;

  try {
    const raw = localStorage.getItem(STORAGE_SUMMARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      consolidatedMetricsCache = {
        ...defaultSummary,
        ...parsed,
        crear_mi_tienda_por_origen: parsed.crear_mi_tienda_por_origen || {},
        explorar_tiendas_por_origen: parsed.explorar_tiendas_por_origen || {},
        ver_tienda_por_comercio: parsed.ver_tienda_por_comercio || {},
        solicitar_info_por_origen: parsed.solicitar_info_por_origen || {},
        distribucion_por_origen: parsed.distribucion_por_origen || {},
      };
      return consolidatedMetricsCache;
    }
  } catch {}

  return defaultSummary;
}

/**
 * Devuelve la lista reciente de eventos registrados para verificación.
 */
export function getCommercialEventsLog(limit = 50): CommercialEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, limit);
    }
  } catch {}
  return [];
}

/**
 * Limpia los eventos y contadores locales.
 */
export function clearCommercialMetrics(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_EVENTS_KEY);
    localStorage.removeItem(STORAGE_SUMMARY_KEY);
    consolidatedMetricsCache = null;
  } catch {}
}

// Sincronización inicial automática con el servidor central al cargar la landing
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchCentralCommercialMetrics().catch(() => {});
  }, 200);

  // Exposición en el entorno global para auditoría y verificación por consola
  (window as any).__MAXINEGO_TRACKING__ = {
    track: trackCommercialEvent,
    getMetrics: getCommercialMetricsSummary,
    getCentralMetrics: fetchCentralCommercialMetrics,
    getEvents: getCommercialEventsLog,
    getCentralEvents: fetchCentralCommercialEvents,
    clearLocal: clearCommercialMetrics,
  };
}
