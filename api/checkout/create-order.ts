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
  // Configuración de encabezados CORS y de respuesta
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

  // FASE 2: Únicamente se acepta el método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se admite POST.',
    });
  }

  // Verificación estricta de credencial de servicio en entorno del servidor
  if (!supabaseServiceRoleKey) {
    console.error('[CentralBo Checkout API] Error crítico: SUPABASE_SERVICE_ROLE_KEY no está configurada.');
    return res.status(500).json({
      success: false,
      error: 'Error de configuración del servidor. No se pueden procesar pedidos en este momento.',
    });
  }

  // Parseo del cuerpo de la petición
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Cuerpo de solicitud inválido. Se requiere formato JSON válido.',
      });
    }
  }
  body = body || {};

  const {
    orderId,
    tenantId,
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    total,
    status,
    items,
  } = body;

  // FASE 4: Validaciones básicas de estructura
  if (!orderId || !isValidUUID(orderId)) {
    return res.status(400).json({
      success: false,
      error: 'El identificador del pedido (orderId) es obligatorio y debe ser un UUID válido.',
    });
  }

  if (!tenantId || !isValidUUID(tenantId)) {
    return res.status(400).json({
      success: false,
      error: 'El identificador del comercio (tenantId) es obligatorio y debe ser un UUID válido.',
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'El pedido debe contener al menos un producto (items no puede estar vacío).',
    });
  }

  const cleanTotal = Number(total);
  if (isNaN(cleanTotal) || !Number.isFinite(cleanTotal) || cleanTotal < 0) {
    return res.status(400).json({
      success: false,
      error: 'El total del pedido debe ser un número válido mayor o igual a 0.',
    });
  }

  const cleanCustomerName = typeof customerName === 'string' ? customerName.trim() : '';
  if (!cleanCustomerName || cleanCustomerName.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'El nombre del cliente es obligatorio y no puede exceder 100 caracteres.',
    });
  }

  const cleanCustomerPhone = typeof customerPhone === 'string' ? customerPhone.trim() : '';
  if (!cleanCustomerPhone || cleanCustomerPhone.length < 7 || cleanCustomerPhone.length > 25) {
    return res.status(400).json({
      success: false,
      error: 'El teléfono del cliente es obligatorio y debe tener entre 7 y 25 caracteres.',
    });
  }

  const cleanCustomerEmail =
    typeof customerEmail === 'string' && customerEmail.trim()
      ? customerEmail.trim().toLowerCase().slice(0, 120)
      : null;

  const cleanCustomerId = customerId && isValidUUID(customerId) ? String(customerId).trim() : null;
  const cleanStatus = typeof status === 'string' && status.trim() ? status.trim() : 'pendiente';

  // Validación de cada item
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const pid = it.productId || it.product_id;
    const qty = Number(it.quantity);
    const price = Number(it.unitPrice ?? it.unit_price ?? it.price);

    if (!isValidUUID(pid)) {
      return res.status(400).json({
        success: false,
        error: `El producto en posición ${i + 1} posee un identificador (productId) inválido.`,
      });
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        error: `La cantidad del producto en posición ${i + 1} debe ser un número entero mayor a 0.`,
      });
    }

    if (isNaN(price) || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        error: `El precio unitario del producto en posición ${i + 1} debe ser un número mayor o igual a 0.`,
      });
    }
  }

  // Cliente privilegiado Supabase con Service Role
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // FASE 4 & 16: Validación del comercio (tenant)
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, status')
      .eq('id', tenantId)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'El comercio indicado no existe.',
      });
    }

    if (store.status !== 'activo' && store.status !== 'prueba') {
      return res.status(400).json({
        success: false,
        error: 'El comercio no se encuentra disponible para recibir pedidos actualmente.',
      });
    }

    // FASE 5 & 16: Validación estricta de productos pertenecientes al tenant
    const uniqueProductIds = Array.from(
      new Set(items.map((it: any) => String(it.productId || it.product_id).trim()))
    );

    const { data: dbProducts, error: prodsError } = await supabase
      .from('products')
      .select('id, tenant_id, name, status')
      .eq('tenant_id', tenantId)
      .in('id', uniqueProductIds);

    if (prodsError) {
      console.error('[CentralBo Checkout API] Error al validar productos del tenant:', prodsError);
      return res.status(500).json({
        success: false,
        error: 'Error al verificar la disponibilidad de los productos del comercio.',
      });
    }

    const foundProductMap = new Map((dbProducts || []).map((p: any) => [p.id, p]));
    const missingOrInvalid = uniqueProductIds.filter((pid) => !foundProductMap.has(pid));

    if (missingOrInvalid.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Uno o más productos no existen o no pertenecen a este comercio.',
      });
    }

    // FASE 6: Creación del registro en public.orders
    const cleanOrderId = String(orderId).trim();
    const cleanTenantId = String(tenantId).trim();

    const { data: orderData, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        id: cleanOrderId,
        tenant_id: cleanTenantId,
        customer_id: cleanCustomerId,
        customer_name: cleanCustomerName.slice(0, 100),
        customer_email: cleanCustomerEmail,
        customer_phone: cleanCustomerPhone.slice(0, 25),
        status: cleanStatus,
        total: Number(cleanTotal.toFixed(2)),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderInsertError || !orderData) {
      console.error('[CentralBo Checkout API] Error al insertar en orders:', orderInsertError);
      return res.status(500).json({
        success: false,
        error: 'No se pudo registrar la cabecera del pedido en el comercio.',
      });
    }

    // FASE 7: Creación en lote (batch) de public.order_items
    const orderItemsPayload = items.map((it: any) => ({
      tenant_id: cleanTenantId,
      order_id: cleanOrderId,
      product_id: String(it.productId || it.product_id).trim(),
      quantity: Math.floor(Number(it.quantity)),
      unit_price: Number(Number(it.unitPrice ?? it.unit_price ?? it.price).toFixed(2)),
    }));

    const { error: itemsInsertError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    // FASE 8: Rollback real y verificado si falla la inserción de order_items
    if (itemsInsertError) {
      console.error(
        '[CentralBo Checkout API] Error al registrar order_items, iniciando rollback de order:',
        itemsInsertError
      );

      let rollbackVerified = false;
      try {
        const { error: deleteOrderError } = await supabase
          .from('orders')
          .delete()
          .eq('id', cleanOrderId)
          .eq('tenant_id', cleanTenantId);

        if (!deleteOrderError) {
          const { data: verifyRow } = await supabase
            .from('orders')
            .select('id')
            .eq('id', cleanOrderId)
            .maybeSingle();

          if (!verifyRow) {
            rollbackVerified = true;
            console.log(
              `[CentralBo Checkout API] Rollback verificado exitosamente para orden huérfana ${cleanOrderId}`
            );
          }
        }
      } catch (rbEx) {
        console.error('[CentralBo Checkout API] Excepción al ejecutar rollback de orden:', rbEx);
      }

      if (rollbackVerified) {
        return res.status(500).json({
          success: false,
          error:
            'No se pudo registrar el detalle de los productos del pedido. La operación fue revertida de forma segura.',
        });
      } else {
        console.error(
          `[CentralBo Checkout API] ALERTA CRÍTICA: Fallo al confirmar eliminación de orden huérfana ${cleanOrderId}`
        );
        return res.status(500).json({
          success: false,
          error: 'No se pudo completar la creación del pedido.',
        });
      }
    }

    // FASE 9: Respuesta exitosa estructurada
    return res.status(200).json({
      success: true,
      message: 'Pedido registrado con éxito',
      orderId: cleanOrderId,
      order: orderData,
    });
  } catch (error: any) {
    console.error('[CentralBo Checkout API] Excepción no controlada en endpoint checkout:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar el pedido.',
    });
  }
}
