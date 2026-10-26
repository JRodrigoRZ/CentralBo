import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type CommercialActionType =
  | 'click_crear_mi_tienda'
  | 'click_explorar_tiendas'
  | 'click_ver_tienda_catalogo'
  | 'click_solicitar_informacion'
  | 'intento_formulario_comercial'
  | 'validacion_formulario_fallida'
  | 'solicitud_comercial_valida'
  | 'apertura_whatsapp_comercial';

export interface CommercialEventMetadata {
  origin: string;
  storeSlug?: string;
  storeName?: string;
  planId?: string;
  reason?: string;
  [key: string]: any;
}

export interface CommercialEvent {
  id: string;
  type: CommercialActionType;
  origin: string;
  timestamp: string;
  metadata?: CommercialEventMetadata;
}

export interface ConsolidatedCommercialMetrics {
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

  distribucion_por_origen: Record<string, number>;
  total_eventos_registrados: number;
  ultimo_evento: CommercialEvent | null;
  actualizado_en: string;
}

export interface StoreOptions {
  storageFile?: string;
  journalDir?: string;
  localFile?: string;
}

const PRIMARY_DATA_DIR = path.join(process.cwd(), 'data');
const BUCKET_NAME = 'platform-metrics';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClient) {
    const url = process.env.VITE_SUPABASE_URL || 'https://wuerdwkcpurbtcwyqjep.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (url && key) {
      supabaseClient = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
  }
  return supabaseClient;
}

export function resolveStoragePaths(options?: StoreOptions) {
  const storageFile = options?.storageFile || process.env.COMMERCIAL_STORAGE_FILE || 'commercial_metrics.json';
  const journalDir = options?.journalDir || process.env.COMMERCIAL_JOURNAL_DIR || 'journal';
  const localFileName = options?.localFile || process.env.COMMERCIAL_LOCAL_FILE || path.basename(storageFile);
  const localFilePath = path.join(PRIMARY_DATA_DIR, localFileName);
  return { storageFile, journalDir, localFilePath };
}

function getActiveFilePath(localFilePath: string): string {
  try {
    if (!fs.existsSync(PRIMARY_DATA_DIR)) {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    }
    return localFilePath;
  } catch (err) {
    console.warn('[Commercial Central Store] Usando ruta temporal para métricas:', err);
    return path.join('/tmp', path.basename(localFilePath));
  }
}

export function createDefaultMetrics(): ConsolidatedCommercialMetrics {
  return {
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
    total_eventos_registrados: 0,
    ultimo_evento: null,
    actualizado_en: new Date().toISOString(),
  };
}

/**
 * Calcula de forma matemáticamente exacta y determinista las métricas a partir
 * de la lista unificada y deduplicada de eventos.
 */
export function computeMetricsFromEvents(
  events: CommercialEvent[],
  existingMetrics?: ConsolidatedCommercialMetrics
): ConsolidatedCommercialMetrics {
  const m = createDefaultMetrics();

  // Ordenar cronológicamente (más antiguo al más reciente)
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const ev of sorted) {
    m.total_eventos_registrados += 1;
    m.actualizado_en = ev.timestamp;
    m.ultimo_evento = ev;

    const origin = ev.origin || 'desconocido';
    m.distribucion_por_origen[origin] = (m.distribucion_por_origen[origin] || 0) + 1;

    switch (ev.type) {
      case 'click_crear_mi_tienda':
        m.crear_mi_tienda_total += 1;
        m.crear_mi_tienda_por_origen[origin] = (m.crear_mi_tienda_por_origen[origin] || 0) + 1;
        break;

      case 'click_explorar_tiendas':
        m.explorar_tiendas_total += 1;
        m.explorar_tiendas_por_origen[origin] = (m.explorar_tiendas_por_origen[origin] || 0) + 1;
        break;

      case 'click_ver_tienda_catalogo':
        m.ver_tienda_catalogo_total += 1;
        const commerceKey = ev.metadata?.storeSlug || ev.metadata?.storeName || 'desconocido';
        m.ver_tienda_por_comercio[commerceKey] = (m.ver_tienda_por_comercio[commerceKey] || 0) + 1;
        break;

      case 'click_solicitar_informacion':
        m.solicitar_info_clics_total += 1;
        m.solicitar_info_por_origen[origin] = (m.solicitar_info_por_origen[origin] || 0) + 1;
        break;

      case 'intento_formulario_comercial':
        m.formulario_intentos_total += 1;
        break;

      case 'validacion_formulario_fallida':
        m.formulario_validaciones_fallidas_total += 1;
        break;

      case 'solicitud_comercial_valida':
        m.solicitudes_comerciales_validas_total += 1;
        break;

      case 'apertura_whatsapp_comercial':
        m.aperturas_whatsapp_comercial_total += 1;
        break;
    }
  }

  // Si no hay eventos pero se proporcionó un estado previo, preservarlo
  if (events.length === 0 && existingMetrics) {
    return { ...existingMetrics };
  }

  return m;
}

interface InMemoryStoreInstance {
  metrics: ConsolidatedCommercialMetrics;
  events: CommercialEvent[];
  eventIds: Set<string>;
  lastSignatures: Map<string, number>;
  lastSyncTime: number;
}

// Almacén en memoria indexado por ruta de archivo para admitir pruebas aisladas y producción
const storesByFile = new Map<string, InMemoryStoreInstance>();
const consolidationLocks = new Map<string, { inProgress: boolean; queued: boolean }>();

function getStoreForFile(localFilePath: string): InMemoryStoreInstance {
  let store = storesByFile.get(localFilePath);
  if (!store) {
    const { metrics, events } = loadFromDisk(localFilePath);
    store = {
      metrics,
      events,
      eventIds: new Set(events.map((e) => e.id)),
      lastSignatures: new Map<string, number>(),
      lastSyncTime: 0,
    };
    storesByFile.set(localFilePath, store);
  }
  return store;
}

function loadFromDisk(localFilePath: string): { metrics: ConsolidatedCommercialMetrics; events: CommercialEvent[] } {
  const filePath = getActiveFilePath(localFilePath);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.metrics === 'object') {
        const events: CommercialEvent[] = Array.isArray(parsed.events) ? parsed.events : [];
        const metrics = computeMetricsFromEvents(events, parsed.metrics);
        return { metrics, events };
      }
    }
  } catch (err) {
    console.warn(`[Commercial Central Store] Error al leer archivo local ${filePath}:`, err);
  }

  return {
    metrics: createDefaultMetrics(),
    events: [],
  };
}

function persistToDisk(localFilePath: string): void {
  const store = storesByFile.get(localFilePath);
  if (!store) return;

  const filePath = getActiveFilePath(localFilePath);
  try {
    const payload = {
      metrics: store.metrics,
      events: store.events.slice(0, 1000),
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[Commercial Central Store] Error al escribir en disco local ${filePath}:`, err);
  }
}

/**
 * Escribe un registro inmutable por evento (Write-Ahead Journal) en Supabase Storage.
 * Cada archivo tiene el nombre único del evento `journal/<id>.json`, evitando colisiones
 * cuando múltiples instancias escriben simultáneamente.
 */
async function writeEventToJournal(
  event: CommercialEvent,
  journalDir: string,
  client: SupabaseClient
): Promise<boolean> {
  const journalPath = `${journalDir}/${event.id}.json`;
  const buffer = Buffer.from(JSON.stringify(event, null, 2), 'utf-8');

  try {
    const { error } = await client.storage.from(BUCKET_NAME).upload(journalPath, buffer, {
      upsert: true,
      contentType: 'application/json',
    });
    if (error) {
      console.warn(`[Commercial Central Store] Error al escribir evento en journal ${journalPath}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Commercial Central Store] Error de red en journal ${journalPath}:`, err);
    return false;
  }
}

/**
 * Lee y descarga todos los eventos pendientes del journal de Supabase Storage.
 */
async function fetchJournalEvents(
  journalDir: string,
  client: SupabaseClient
): Promise<{ events: CommercialEvent[]; filePaths: string[] }> {
  try {
    const { data: listData, error: listError } = await client.storage.from(BUCKET_NAME).list(journalDir);
    if (listError || !listData || listData.length === 0) {
      return { events: [], filePaths: [] };
    }

    const journalFiles = listData.filter((item) => item.name.endsWith('.json'));
    if (journalFiles.length === 0) {
      return { events: [], filePaths: [] };
    }

    const events: CommercialEvent[] = [];
    const filePaths: string[] = [];

    // Descargar en lotes de 10 concurrentes
    const BATCH_SIZE = 10;
    for (let i = 0; i < journalFiles.length; i += BATCH_SIZE) {
      const slice = journalFiles.slice(i, i + BATCH_SIZE);
      await Promise.all(
        slice.map(async (file) => {
          const filePath = `${journalDir}/${file.name}`;
          try {
            const { data, error } = await client.storage.from(BUCKET_NAME).download(filePath);
            if (!error && data) {
              const text = await data.text();
              const parsed = JSON.parse(text);
              if (parsed && parsed.id && parsed.type) {
                events.push(parsed as CommercialEvent);
                filePaths.push(filePath);
              }
            }
          } catch (err) {
            console.warn(`[Commercial Central Store] Error al leer archivo de journal ${filePath}:`, err);
          }
        })
      );
    }

    return { events, filePaths };
  } catch (err) {
    console.warn(`[Commercial Central Store] Error al listar journal ${journalDir}:`, err);
    return { events: [], filePaths: [] };
  }
}

/**
 * Consolidación atómica:
 * 1. Descarga el estado remoto actual de Supabase Storage (commercial_metrics.json).
 * 2. Recopila eventos pendientes del journal (Write-Ahead Log).
 * 3. Une todos los eventos únicos (remotos + journal + memoria local) sin pérdidas ni duplicados.
 * 4. Recalcula matemáticamente las métricas consolidadas sobre el conjunto unificado de eventos únicos.
 * 5. Sube la instantánea consolidada a Supabase Storage con atomicidad.
 * 6. Compacta el journal eliminando los archivos ya incluidos en la instantánea.
 */
export async function consolidateAndPush(options?: StoreOptions): Promise<void> {
  const { storageFile, journalDir, localFilePath } = resolveStoragePaths(options);
  const client = getSupabaseClient();
  if (!client) return;

  const lockKey = storageFile;
  let lock = consolidationLocks.get(lockKey);
  if (!lock) {
    lock = { inProgress: false, queued: false };
    consolidationLocks.set(lockKey, lock);
  }

  if (lock.inProgress) {
    lock.queued = true;
    return;
  }

  lock.inProgress = true;

  try {
    const store = getStoreForFile(localFilePath);

    // 1. Descargar instantánea remota actual si existe
    let remoteEvents: CommercialEvent[] = [];
    try {
      const { data: remoteData, error: downloadError } = await client.storage
        .from(BUCKET_NAME)
        .download(storageFile);

      if (!downloadError && remoteData) {
        const text = await remoteData.text();
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.events)) {
          remoteEvents = parsed.events;
        }
      }
    } catch (err) {
      console.warn(`[Commercial Central Store] Nota: archivo remoto ${storageFile} no disponible aún o vacío:`, err);
    }

    // 2. Descargar eventos pendientes del journal
    const { events: journalEvents, filePaths: journalFilesToCompact } = await fetchJournalEvents(
      journalDir,
      client
    );

    // 3. Unir todos los eventos por ID único (sin duplicados y sin pérdidas)
    const unifiedEventsMap = new Map<string, CommercialEvent>();

    // Primero remotos previos
    for (const ev of remoteEvents) {
      if (ev && ev.id) unifiedEventsMap.set(ev.id, ev);
    }

    // Segundo journal pendientes
    for (const ev of journalEvents) {
      if (ev && ev.id) unifiedEventsMap.set(ev.id, ev);
    }

    // Tercero memoria local
    for (const ev of store.events) {
      if (ev && ev.id) unifiedEventsMap.set(ev.id, ev);
    }

    // Ordenar de más reciente a más antiguo
    const allUnifiedEvents = Array.from(unifiedEventsMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 4. Calcular métricas consolidadas exactas
    const consolidatedMetrics = computeMetricsFromEvents(allUnifiedEvents, store.metrics);

    // 5. Actualizar almacén en memoria
    store.events = allUnifiedEvents.slice(0, 1000);
    store.eventIds = new Set(allUnifiedEvents.map((e) => e.id));
    store.metrics = consolidatedMetrics;
    store.lastSyncTime = Date.now();

    // 6. Subir instantánea consolidada a Supabase Storage
    const snapshotPayload = {
      metrics: store.metrics,
      events: store.events.slice(0, 1000),
      synchronized_at: new Date().toISOString(),
    };

    const buffer = Buffer.from(JSON.stringify(snapshotPayload, null, 2), 'utf-8');
    const { error: uploadError } = await client.storage
      .from(BUCKET_NAME)
      .upload(storageFile, buffer, {
        upsert: true,
        contentType: 'application/json',
      });

    if (uploadError) {
      console.warn(`[Commercial Central Store] Error al subir instantánea ${storageFile}:`, uploadError);
    } else {
      // 7. Compactación: Eliminar del journal los archivos que ya están en la instantánea
      if (journalFilesToCompact.length > 0) {
        try {
          await client.storage.from(BUCKET_NAME).remove(journalFilesToCompact);
        } catch (cleanupErr) {
          console.warn('[Commercial Central Store] Limpieza de journal post-consolidación:', cleanupErr);
        }
      }
    }

    // 8. Reflejar inmediatamente en disco local
    persistToDisk(localFilePath);
  } catch (err) {
    console.warn('[Commercial Central Store] Excepción en consolidateAndPush:', err);
  } finally {
    lock.inProgress = false;
    if (lock.queued) {
      lock.queued = false;
      // Ejecutar la consolidación encolada para recoger eventos recién ingresados
      consolidateAndPush(options).catch((e) =>
        console.warn('[Commercial Central Store] Error en consolidación encolada:', e)
      );
    }
  }
}

/**
 * Carga o sincroniza con el almacenamiento en la nube de Supabase Storage
 */
export async function syncWithCloudStorage(options?: StoreOptions): Promise<void> {
  const { storageFile, journalDir, localFilePath } = resolveStoragePaths(options);
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const store = getStoreForFile(localFilePath);

    // Descargar instantánea consolidada
    const { data, error } = await client.storage.from(BUCKET_NAME).download(storageFile);

    let remoteEvents: CommercialEvent[] = [];
    let remoteMetrics: ConsolidatedCommercialMetrics | null = null;

    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (parsed && parsed.metrics) {
        remoteMetrics = parsed.metrics;
        remoteEvents = Array.isArray(parsed.events) ? parsed.events : [];
      }
    }

    // Descargar eventos pendientes del journal
    const { events: journalEvents } = await fetchJournalEvents(journalDir, client);

    // Unir eventos
    const map = new Map<string, CommercialEvent>();
    for (const e of remoteEvents) {
      if (e && e.id) map.set(e.id, e);
    }
    for (const e of journalEvents) {
      if (e && e.id) map.set(e.id, e);
    }
    for (const e of store.events) {
      if (e && e.id) map.set(e.id, e);
    }

    const allEvents = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    store.events = allEvents.slice(0, 1000);
    store.eventIds = new Set(allEvents.map((e) => e.id));
    store.metrics = computeMetricsFromEvents(allEvents, remoteMetrics || store.metrics);
    store.lastSyncTime = Date.now();

    persistToDisk(localFilePath);
  } catch (err) {
    console.warn('[Commercial Central Store] Advertencia en syncWithCloudStorage:', err);
  }
}

export async function recordCentralCommercialEvent(
  type: CommercialActionType,
  origin: string,
  rawMetadata?: Record<string, any>,
  clientIp?: string,
  customEventId?: string,
  options?: StoreOptions
): Promise<{
  success: boolean;
  duplicate?: boolean;
  event?: CommercialEvent;
  metrics: ConsolidatedCommercialMetrics;
  error?: string;
}> {
  const { journalDir, localFilePath } = resolveStoragePaths(options);
  const store = getStoreForFile(localFilePath);

  const safeOrigin = typeof origin === 'string' && origin.trim() ? origin.trim().slice(0, 50) : 'desconocido';
  const storeSlug = typeof rawMetadata?.storeSlug === 'string' ? rawMetadata.storeSlug.trim().slice(0, 60) : undefined;
  const storeName = typeof rawMetadata?.storeName === 'string' ? rawMetadata.storeName.trim().slice(0, 80) : undefined;
  const planId = typeof rawMetadata?.planId === 'string' ? rawMetadata.planId.trim().slice(0, 20) : undefined;
  const reason = typeof rawMetadata?.reason === 'string' ? rawMetadata.reason.trim().slice(0, 60) : undefined;

  // 1. Detección de duplicado por ID explícito único
  const finalId = typeof customEventId === 'string' && customEventId.trim()
    ? customEventId.trim().slice(0, 120)
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (store.eventIds.has(finalId)) {
    return {
      success: false,
      duplicate: true,
      metrics: store.metrics,
    };
  }

  // 2. Anti-duplicados por doble clic (< 600ms) por cliente si no se envió un ID explícito
  const isExplicitId = typeof customEventId === 'string' && customEventId.trim().length > 0;
  if (!isExplicitId) {
    const ipKey = clientIp || 'global';
    const signature = `${ipKey}:${type}:${safeOrigin}:${storeSlug || ''}:${planId || ''}`;
    const now = Date.now();
    const lastTime = store.lastSignatures.get(signature) || 0;

    if (now - lastTime < 600) {
      return {
        success: false,
        duplicate: true,
        metrics: store.metrics,
      };
    }
    store.lastSignatures.set(signature, now);

    // Limpieza periódica de firmas de deduplicación mayores a 10 segundos
    if (store.lastSignatures.size > 200) {
      for (const [key, timestamp] of store.lastSignatures.entries()) {
        if (now - timestamp > 10000) {
          store.lastSignatures.delete(key);
        }
      }
    }
  }

  // Sanitización estricta: NUNCA se admiten datos de formularios personales
  const sanitizedMetadata: CommercialEventMetadata = {
    origin: safeOrigin,
    ...(storeSlug ? { storeSlug } : {}),
    ...(storeName ? { storeName } : {}),
    ...(planId ? { planId } : {}),
    ...(reason ? { reason } : {}),
  };

  const event: CommercialEvent = {
    id: finalId,
    type,
    origin: safeOrigin,
    timestamp: new Date().toISOString(),
    metadata: sanitizedMetadata,
  };

  // 1. Persistir al Write-Ahead Journal inmutable de Supabase Storage
  const client = getSupabaseClient();
  if (!client) {
    console.warn('[Commercial Central Store] Cliente de Supabase no disponible para journal comercial');
    return {
      success: false,
      error: 'Servicio de persistencia no disponible',
      metrics: store.metrics,
    };
  }

  const journalOk = await writeEventToJournal(event, journalDir, client);
  if (!journalOk) {
    console.warn(`[Commercial Central Store] Fallo al escribir evento en journal ${event.id}`);
    return {
      success: false,
      error: 'Fallo al escribir en almacenamiento inmutable',
      metrics: store.metrics,
    };
  }

  // 2. Registrar en memoria local una vez confirmada la persistencia en el journal
  store.events.unshift(event);
  store.eventIds.add(finalId);
  if (store.events.length > 1000) {
    store.events = store.events.slice(0, 1000);
  }

  // 3. Recalcular métricas exactas
  store.metrics = computeMetricsFromEvents(store.events, store.metrics);

  // 4. Persistir a disco local
  persistToDisk(localFilePath);

  // 5. Iniciar consolidación asíncrona de la instantánea compartida
  consolidateAndPush(options).catch((err) =>
    console.warn('[Commercial Central Store] Error en consolidación asíncrona:', err)
  );

  return {
    success: true,
    event,
    metrics: store.metrics,
  };
}

export async function getCentralCommercialMetrics(
  options?: StoreOptions
): Promise<ConsolidatedCommercialMetrics> {
  const { localFilePath } = resolveStoragePaths(options);
  const store = getStoreForFile(localFilePath);

  // Sincronizar periódicamente con la nube si pasaron más de 5 segundos
  if (store.lastSyncTime === 0 || Date.now() - store.lastSyncTime > 5000) {
    await syncWithCloudStorage(options);
  }

  return { ...store.metrics };
}

export async function getCentralCommercialEvents(
  limit = 100,
  options?: StoreOptions
): Promise<CommercialEvent[]> {
  const { localFilePath } = resolveStoragePaths(options);
  const store = getStoreForFile(localFilePath);

  if (store.lastSyncTime === 0 || Date.now() - store.lastSyncTime > 5000) {
    await syncWithCloudStorage(options);
  }

  return store.events.slice(0, Math.min(limit, 1000));
}

// Mantener compatibilidad con llamadas existentes
export async function pushToCloudStorage(options?: StoreOptions): Promise<void> {
  return consolidateAndPush(options);
}
