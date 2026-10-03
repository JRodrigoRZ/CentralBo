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
    promoCode,
    shippingCost,
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

  // Normalización estricta de promoCode (opcional)
  let cleanPromoCode: string | null = null;
  if (typeof promoCode === 'string' && promoCode.trim().length > 0) {
    cleanPromoCode = promoCode.trim().toUpperCase();
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

    // FASE 5 & 16: Validación estricta de productos pertenecientes al tenant y obtención de precio canónico
    const uniqueProductIds = Array.from(
      new Set(items.map((it: any) => String(it.productId || it.product_id).trim()))
    );

    const { data: dbProducts, error: prodsError } = await supabase
      .from('products')
      .select('id, tenant_id, name, status, price')
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

    // Cálculo canónico del subtotal server-side basado exclusivamente en public.products.price
    let serverItemsSubtotal = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const pid = String(it.productId || it.product_id).trim();
      const qty = Math.floor(Number(it.quantity));
      const dbProd = foundProductMap.get(pid);
      const canonicalPrice = Number(Number(dbProd.price).toFixed(2));
      serverItemsSubtotal += qty * canonicalPrice;
    }
    serverItemsSubtotal = Number(serverItemsSubtotal.toFixed(2));

    // FASE PROMOCIONES: Validación server-side y aplicación real del descuento (Parte 3)
    let discountAmount = 0;
    let promoRecord: any = null;

    if (cleanPromoCode) {
      // 1. Consultar public.promotions restringida simultáneamente por tenant_id y code
      const { data: promoData, error: promoError } = await supabase
        .from('promotions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('code', cleanPromoCode)
        .maybeSingle();

      if (promoError) {
        console.error('[CentralBo Checkout API] Error al consultar promoción:', promoError);
        return res.status(500).json({
          success: false,
          error: 'Error al verificar el cupón de descuento en el comercio.',
        });
      }

      // Si no existe la promoción para este comercio
      if (!promoData) {
        return res.status(400).json({
          success: false,
          error: 'El cupón no es válido para este comercio.',
        });
      }

      // 2. Validar que la promoción esté activa
      if (!promoData.is_active) {
        return res.status(400).json({
          success: false,
          error: 'La promoción ya no se encuentra activa.',
        });
      }

      // 3. Validar vigencia de fechas (formato YYYY-MM-DD en hora de Bolivia / UTC)
      const now = new Date();
      const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(now);

      if (promoData.start_date && todayStr < promoData.start_date) {
        return res.status(400).json({
          success: false,
          error: 'La promoción todavía no ha iniciado.',
        });
      }

      if (promoData.end_date && todayStr > promoData.end_date) {
        return res.status(400).json({
          success: false,
          error: 'La promoción ha expirado.',
        });
      }

      // 4. Validar compra mínima requerida (min_purchase) contra subtotal del servidor
      const minPurchase = Number(promoData.min_purchase || 0);
      if (minPurchase > 0 && serverItemsSubtotal < minPurchase) {
        return res.status(400).json({
          success: false,
          error: `El pedido no alcanza la compra mínima de Bs ${minPurchase.toFixed(2)} requerida para este cupón.`,
        });
      }

      // 5. Calcular discountAmount de forma autoritativa en servidor
      const discountVal = Number(promoData.discount_value || 0);
      if (promoData.discount_type === 'percentage') {
        discountAmount = (serverItemsSubtotal * discountVal) / 100;
      } else if (promoData.discount_type === 'fixed') {
        discountAmount = discountVal;
      }

      // Limitar descuento a no exceder el subtotal de productos ni ser negativo
      discountAmount = Math.max(0, Math.min(discountAmount, serverItemsSubtotal));
      discountAmount = Number(discountAmount.toFixed(2));
      promoRecord = promoData;
    }

    // Costo de envío informado
    const cleanShippingCost =
      typeof shippingCost === 'number' && !isNaN(shippingCost) && shippingCost >= 0
        ? Number(Number(shippingCost).toFixed(2))
        : 0;

    // Determinación autoritativa del total confirmado basado estrictamente en el subtotal canónico
    const confirmedTotal = Number(
      Math.max(0, serverItemsSubtotal - discountAmount + cleanShippingCost).toFixed(2)
    );

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
        total: confirmedTotal,
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

    // FASE 7: Creación en lote (batch) de public.order_items utilizando el precio canónico de public.products.price
    const orderItemsPayload = items.map((it: any) => {
      const pid = String(it.productId || it.product_id).trim();
      const dbProd = foundProductMap.get(pid);
      const canonicalUnitPrice = Number(Number(dbProd.price).toFixed(2));
      return {
        tenant_id: cleanTenantId,
        order_id: cleanOrderId,
        product_id: pid,
        quantity: Math.floor(Number(it.quantity)),
        unit_price: canonicalUnitPrice,
      };
    });

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

    // FASE 9: Respuesta exitosa estructurada con montos confirmados autoritativamente
    return res.status(200).json({
      success: true,
      message: 'Pedido registrado con éxito',
      orderId: cleanOrderId,
      order: orderData,
      confirmedSubtotal: Number(serverItemsSubtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      confirmedTotal: confirmedTotal,
      appliedPromotion: promoRecord
        ? {
            id: promoRecord.id,
            code: promoRecord.code,
            discountType: promoRecord.discount_type,
            discountValue: Number(promoRecord.discount_value),
            minPurchase: Number(promoRecord.min_purchase || 0),
          }
        : null,
    });
  } catch (error: any) {
    console.error('[CentralBo Checkout API] Excepción no controlada en endpoint checkout:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar el pedido.',
    });
  }
}
