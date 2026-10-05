import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wuerdwkcpurbtcwyqjep.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const ALLOWED_STATUSES = ['activo', 'prueba', 'inactivo', 'suspendido'] as const;
type StoreStatus = (typeof ALLOWED_STATUSES)[number];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Se requiere POST.' });
  }

  // Verificación estricta de credencial de servicio administrativo
  if (!supabaseServiceRoleKey) {
    return res.status(500).json({
      success: false,
      error: 'Error de configuración del servidor: SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno.'
    });
  }

  // 1. Extraer y verificar el token Bearer
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      success: false,
      error: 'Cabecera de autorización ausente o inválida'
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de autorización ausente'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // 2. Validar que el usuario esté autenticado en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        error: 'Sesión no válida o expirada. Por favor inicia sesión nuevamente.'
      });
    }

    const userId = authData.user.id;

    // 3. Validar que el usuario tenga rol SuperAdmin
    const { data: storeUserData, error: roleError } = await supabase
      .from('store_users')
      .select('role, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    const isSuperAdmin =
      storeUserData?.role === 'superadmin' ||
      authData.user.user_metadata?.role === 'superadmin';

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado: Solo usuarios con rol SuperAdmin tienen permiso para cambiar el estado de un comercio.'
      });
    }

    // 4. Parsear y validar el cuerpo de la petición
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const storeId = body.storeId;
    const newStatus = body.newStatus as StoreStatus;

    if (!storeId || typeof storeId !== 'string' || !storeId.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El identificador del comercio (storeId) es obligatorio.'
      });
    }

    const cleanStoreId = storeId.trim();

    // 5. Validar que newStatus sea estrictamente uno de los permitidos
    if (!newStatus || !ALLOWED_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido: "${newStatus}". Los estados permitidos son exclusivamente: ${ALLOWED_STATUSES.join(', ')}.`
      });
    }

    // 6. Verificar que la tienda existe en public.stores
    const { data: existingStore, error: findError } = await supabase
      .from('stores')
      .select('id, name, slug, status')
      .eq('id', cleanStoreId)
      .maybeSingle();

    if (findError) {
      return res.status(500).json({
        success: false,
        error: `Error al consultar el comercio: ${findError.message}`
      });
    }

    if (!existingStore) {
      return res.status(404).json({
        success: false,
        error: `Comercio con id "${cleanStoreId}" no encontrado en public.stores.`
      });
    }

    // 7. Ejecutar ÚNICAMENTE la actualización de status y updated_at
    const now = new Date().toISOString();
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update({
        status: newStatus,
        updated_at: now
      })
      .eq('id', cleanStoreId)
      .select('id, name, slug, status, updated_at')
      .single();

    if (updateError || !updatedStore) {
      return res.status(500).json({
        success: false,
        error: `Error al persistir el nuevo estado en Supabase: ${updateError?.message || 'Fallo desconocido'}`
      });
    }

    // 8. Devolver éxito confirmado
    return res.status(200).json({
      success: true,
      store: updatedStore,
      previousStatus: existingStore.status,
      newStatus: updatedStore.status
    });
  } catch (err: any) {
    console.error('[CentralBo API] Error en update-store-status:', err);
    return res.status(500).json({
      success: false,
      error: `Error interno del servidor: ${err.message || 'Error desconocido'}`
    });
  }
}
