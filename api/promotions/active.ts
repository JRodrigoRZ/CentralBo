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

  if (!tenantId || !isValidUUID(tenantId)) {
    return res.status(400).json({
      success: false,
      error: 'Identificador de comercio (tenantId) no válido.',
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
        error: 'El comercio no está habilitado.',
      });
    }

    // 2. Consultar promociones activas y vigentes
    const todayStr = new Date().toISOString().split('T')[0];

    const { data: promos, error: promoErr } = await supabase
      .from('promotions')
      .select('id, tenant_id, code, discount_type, discount_value, start_date, end_date, min_purchase, is_active, created_at, updated_at')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .lte('start_date', todayStr)
      .gte('end_date', todayStr)
      .order('discount_value', { ascending: false });

    if (promoErr) {
      console.error('[API Promotions] Error al consultar promotions en Supabase:', promoErr.message);
      return res.status(500).json({
        success: false,
        error: 'Error al consultar promociones en la base de datos.',
      });
    }

    const mappedPromotions = (promos || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      code: row.code,
      discountType: row.discount_type === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(row.discount_value),
      startDate: row.start_date,
      endDate: row.end_date,
      minPurchase: Number(row.min_purchase || 0),
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.status(200).json({
      success: true,
      promotions: mappedPromotions,
    });
  } catch (err: any) {
    console.error('[API Promotions] Excepción no controlada:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar la solicitud.',
    });
  }
}
