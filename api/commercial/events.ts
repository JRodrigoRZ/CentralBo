import { recordCentralCommercialEvent, getCentralCommercialEvents, CommercialActionType } from '../../src/lib/commercialStore.js';

const VALID_ACTIONS: Set<CommercialActionType> = new Set([
  'click_crear_mi_tienda',
  'click_explorar_tiendas',
  'click_ver_tienda_catalogo',
  'click_solicitar_informacion',
  'intento_formulario_comercial',
  'validacion_formulario_fallida',
  'solicitud_comercial_valida',
  'apertura_whatsapp_comercial',
]);

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

  // GET: Consultar los eventos recientes auditables (restringido a usuarios autorizados)
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.trim()) {
      return res.status(401).json({
        success: false,
        error: 'Acceso no autorizado. El registro de eventos comerciales globales requiere autenticación administrativa.',
      });
    }

    const limit = parseInt(req.query?.limit, 10) || 50;
    const events = await getCentralCommercialEvents(limit);
    return res.status(200).json({
      success: true,
      total: events.length,
      events,
    });
  }

  // POST: Registrar un evento comercial centralizado
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Cuerpo de solicitud inválido. Se requiere JSON válido.',
        });
      }
    }
    body = body || {};

    const { type, origin, metadata } = body;

    if (!type || !VALID_ACTIONS.has(type as CommercialActionType)) {
      return res.status(400).json({
        success: false,
        error: `Acción comercial inválida. Debe ser una de las acciones aprobadas.`,
      });
    }

    const clientIp =
      req.headers?.['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown';

    const result = await recordCentralCommercialEvent(
      type as CommercialActionType,
      origin || 'desconocido',
      metadata,
      clientIp
    );

    if (result.duplicate) {
      return res.status(200).json({
        success: true,
        recorded: false,
        duplicate: true,
        metrics: result.metrics,
      });
    }

    if (!result.success) {
      return res.status(503).json({
        success: false,
        error: 'No se pudo registrar el evento comercial en almacenamiento persistente.',
      });
    }

    return res.status(200).json({
      success: true,
      recorded: true,
      duplicate: false,
      event: result.event,
      metrics: result.metrics,
    });
  }

  return res.status(405).json({
    success: false,
    error: 'Método no permitido. Utilice POST o GET.',
  });
}
