import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://wuerdwkcpurbtcwyqjep.supabase.co';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: unknown): boolean {
  return typeof str === 'string' && UUID_REGEX.test(str.trim());
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se admite GET o POST.',
    });
  }

  const tenantId = req.query?.tenantId || req.body?.tenantId;
  const professionalId = req.query?.professionalId || req.body?.professionalId;
  const date = req.query?.date || req.body?.date;

  if (!tenantId || !isValidUUID(tenantId)) {
    return res.status(400).json({
      success: false,
      error: 'Identificador de comercio (tenantId) no válido.',
    });
  }

  if (!professionalId || !isValidUUID(professionalId)) {
    return res.status(400).json({
      success: false,
      error: 'Identificador de profesional no válido.',
    });
  }

  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      error: 'Fecha no válida. Debe tener formato YYYY-MM-DD.',
    });
  }

  if (!supabaseServiceRoleKey) {
    return res.status(500).json({
      success: false,
      error: 'Error de configuración del servidor.',
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // 1. Validar que la tienda exista y esté activa o en prueba
    const { data: storeData, error: storeErr } = await supabase
      .from('stores')
      .select('id, status')
      .eq('id', tenantId)
      .maybeSingle();

    if (storeErr || !storeData) {
      return res.status(404).json({
        success: false,
        error: 'El comercio no existe.',
      });
    }

    if (!['activo', 'prueba'].includes(storeData.status)) {
      return res.status(403).json({
        success: false,
        error: 'El comercio no está habilitado para recibir citas.',
      });
    }

    // 2. Validar que el profesional exista en este tenant y esté activo
    const { data: profData, error: profErr } = await supabase
      .from('professionals')
      .select('id, is_active')
      .eq('id', professionalId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (profErr || !profData) {
      return res.status(404).json({
        success: false,
        error: 'El profesional no existe o no pertenece a este comercio.',
      });
    }

    if (!profData.is_active) {
      return res.status(400).json({
        success: false,
        error: 'El profesional no se encuentra activo.',
      });
    }

    // 3. Intentar consultar mediante RPC seguro de Postgres si existe
    const { data: rpcIntervals, error: rpcErr } = await supabase.rpc(
      'get_public_occupied_intervals',
      {
        p_tenant_id: tenantId,
        p_professional_id: professionalId,
        p_date: date,
      }
    );

    if (!rpcErr && Array.isArray(rpcIntervals)) {
      const sanitized = rpcIntervals.map((row: any) => ({
        startTime: row.start_time,
        durationMinutes: Number(row.duration_minutes) || 60,
      }));
      return res.status(200).json({
        success: true,
        intervals: sanitized,
      });
    }

    // 4. Fallback directo seguro con service_role (seleccionando ÚNICAMENTE start_time y duration_minutes)
    // NUNCA se seleccionan ni retornan nombres, teléfonos, emails, notas ni motivos de bloqueo.
    const [apptsRes, blocksRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('start_time, duration_minutes, status')
        .eq('tenant_id', tenantId)
        .eq('professional_id', professionalId)
        .eq('date', date)
        .in('status', ['pending', 'confirmed', 'pendiente', 'confirmada']),
      supabase
        .from('appointment_blocks')
        .select('start_time, duration_minutes')
        .eq('tenant_id', tenantId)
        .eq('professional_id', professionalId)
        .eq('date', date),
    ]);

    const intervals: Array<{ startTime: string; durationMinutes: number }> = [];

    if (Array.isArray(apptsRes.data)) {
      for (const row of apptsRes.data) {
        if (row.start_time) {
          intervals.push({
            startTime: row.start_time,
            durationMinutes: Number(row.duration_minutes) || 60,
          });
        }
      }
    }

    if (Array.isArray(blocksRes.data)) {
      for (const row of blocksRes.data) {
        if (row.start_time) {
          intervals.push({
            startTime: row.start_time,
            durationMinutes: Number(row.duration_minutes) || 60,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      intervals,
    });
  } catch (err: any) {
    console.error('[CentralBo Availability API] Excepción:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al consultar disponibilidad.',
    });
  }
}
