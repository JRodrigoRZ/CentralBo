import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://wuerdwkcpurbtcwyqjep.supabase.co';

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZXJkd2tjcHVyYnRjd3lxamVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDk3NjksImV4cCI6MjEwNDMyNTc2OX0.H-lIv4hMO8ER3JhosGy6FSlNceWEvSEdja9FWBVfN8c';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: unknown): boolean {
  return typeof str === 'string' && UUID_REGEX.test(str.trim());
}

export default async function handler(req: any, res: any) {
  // Configuración de encabezados CORS y seguridad
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

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se admite POST.',
    });
  }

  try {
    const body = req.body || {};
    const storeIdentifier =
      body.store_id || body.storeId || body.tenant_id || body.tenantId || body.slug || req.query?.store_id;
    const userMessage =
      body.message || (Array.isArray(body.messages) ? body.messages[body.messages.length - 1]?.content : null);
    const history = Array.isArray(body.history)
      ? body.history
      : Array.isArray(body.messages) && body.messages.length > 1
      ? body.messages.slice(0, -1)
      : [];

    if (!storeIdentifier || typeof storeIdentifier !== 'string' || !storeIdentifier.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Identificador de la tienda (store_id) es obligatorio.',
      });
    }

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje del usuario es obligatorio.',
      });
    }

    // 1. Inicializar cliente de Supabase
    const clientKey = supabaseServiceRoleKey || supabaseAnonKey;
    const supabase = createClient(supabaseUrl, clientKey);

    // 2. Consultar información de la tienda en Supabase
    let storeQuery = supabase
      .from('stores')
      .select('id, name, slug, store_type, status, logo_url, profile, appearance, schedule, shipping, payment_settings, vertical_config');

    if (isValidUUID(storeIdentifier)) {
      storeQuery = storeQuery.eq('id', storeIdentifier.trim());
    } else {
      storeQuery = storeQuery.eq('slug', storeIdentifier.trim().toLowerCase());
    }

    const { data: store, error: storeError } = await storeQuery.maybeSingle();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Tienda no encontrada en la plataforma.',
      });
    }

    if (!['activo', 'prueba'].includes(store.status)) {
      return res.status(403).json({
        success: false,
        error: 'La tienda se encuentra temporalmente inactiva o deshabilitada.',
      });
    }

    // 3. Consultar categorías activas de la tienda
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('tenant_id', store.id)
      .eq('status', 'activo');

    const categoryMap = new Map<string, string>();
    if (categories && Array.isArray(categories)) {
      categories.forEach((cat: any) => categoryMap.set(cat.id, cat.name));
    }

    // 4. Consultar productos activos y disponibles de la tienda
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, description, price, is_available, status, attributes, category_id')
      .eq('tenant_id', store.id)
      .eq('status', 'activo')
      .eq('is_available', true)
      .order('name', { ascending: true })
      .limit(80);

    if (prodError) {
      console.warn('[Chat API] Advertencia al obtener productos:', prodError.message);
    }

    // 5. Consultar promociones vigentes (opcional y seguro)
    const todayStr = new Date().toISOString().split('T')[0];
    let promotionsSummary = '';
    try {
      const { data: promos } = await supabase
        .from('promotions')
        .select('code, discount_type, discount_value, min_purchase')
        .eq('tenant_id', store.id)
        .eq('is_active', true)
        .lte('start_date', todayStr)
        .gte('end_date', todayStr);

      if (promos && promos.length > 0) {
        promotionsSummary = '\nPROMOCIONES ACTIVAS DISPONIBLES:\n' + promos.map((p: any) => 
          `- Código: "${p.code}" -> ${p.discount_type === 'percentage' ? `${p.discount_value}% de descuento` : `Bs. ${p.discount_value} de descuento`} (Compra mínima: Bs. ${p.min_purchase || 0})`
        ).join('\n');
      }
    } catch {
      // Si la tabla no existe o falla, continuar sin interrumpir
    }

    // 6. Preparar datos de perfil y configuración
    // 6. Preparar datos de perfil y configuración
    const profile = (store.profile && typeof store.profile === 'object' ? store.profile : {}) as Record<string, any>;
    const payment = (store.payment_settings && typeof store.payment_settings === 'object' ? store.payment_settings : {}) as Record<string, any>;

    const nombre_tienda = store.name || profile.name || 'la tienda';
    const rawWhatsapp =
      profile.whatsapp ||
      profile.phone ||
      (store as any).whatsapp ||
      (store as any).phone ||
      payment.whatsapp ||
      '';

    const cleanWhatsapp = typeof rawWhatsapp === 'string' ? rawWhatsapp.replace(/\D/g, '') : '';
    const hasWhatsapp = cleanWhatsapp.length >= 7;
    const whatsapp_tienda = hasWhatsapp ? rawWhatsapp : '';

    const rawQr =
      payment.qr_image_url ||
      payment.qr_url ||
      payment.qrImageUrl ||
      payment.qrUrl ||
      profile.qr_image_url ||
      profile.qr_url ||
      profile.qrImageUrl ||
      profile.qrUrl ||
      (store as any).qr_image_url ||
      (store as any).qr_url ||
      '';

    const hasQr = typeof rawQr === 'string' && rawQr.trim().startsWith('http');
    const qr_url_tienda = hasQr ? rawQr.trim() : '';

    // Formatear catálogo de productos para {lista_productos}
    const lista_productos = (products && products.length > 0)
      ? products.map((p: any) => {
          const catName = p.category_id ? categoryMap.get(p.category_id) || 'General' : 'General';
          const desc = p.description ? ` - ${p.description.replace(/\n/g, ' ')}` : '';
          return `• ${p.name} | Precio: Bs. ${p.price} | Categoría: ${catName}${desc}`;
        }).join('\n')
      : 'Actualmente no hay productos registrados en el catálogo.';

    const qrInstruction = hasQr
      ? `4. GESTIÓN DE PAGO POR QR:
   - Si el cliente elige pagar con QR o pregunta por los datos de pago:
     * La tienda TIENE un QR configurado (${qr_url_tienda}): Muestra la imagen del QR usando formato Markdown:
       ![Código QR de Pago](${qr_url_tienda})
       Y acompáñalo con: "Aquí tienes el código QR para realizar tu pago por el total de Bs. [monto]."`
      : `4. GESTIÓN DE PAGO POR QR:
   - Si el cliente elige pagar con QR o pregunta por los datos de pago:
     * La tienda NO tiene un código QR configurado.
     * ESTÁ ESTRICTAMENTE PROHIBIDO generar imágenes rotas en Markdown como ![Código QR de Pago]() o inventar URLs de imagen.
     * Indica cordialmente: "Para pago por transferencia o QR, el comercio te proporcionará los datos directos al confirmar tu pedido."`;

    const cierreInstruction = hasWhatsapp
      ? `5. CIERRE DE PEDIDO Y DERIVACIÓN A WHATSAPP:
   - Una vez confirmados los productos, la entrega y el método de pago, genera un resumen final limpio y claro con:
     * Resumen de productos y total en Bs.
     * Modalidad (Retiro o Delivery con su dirección).
     * Método de pago.
   - Instrucción obligatoria final: Pídele al cliente que envíe ese pedido directamente al WhatsApp oficial del comercio (${whatsapp_tienda}) para que el local comience a prepararlo de inmediato. Incluye el enlace directo formateado de WhatsApp:
     https://wa.me/${cleanWhatsapp}?text=[mensaje_codificado_del_pedido]`
      : `5. CIERRE DE PEDIDO (TIENDA SIN WHATSAPP REGISTRADO):
   - Una vez confirmados los productos, la entrega y el método de pago, genera un resumen final limpio y claro con:
     * Resumen de productos y total en Bs.
     * Modalidad (Retiro o Delivery con su dirección).
     * Método de pago.
   - ESTÁ ESTRICTAMENTE PROHIBIDO generar enlaces rotos de WhatsApp como "https://wa.me/" o inventar números de teléfono.
   - Instrucción obligatoria final: Como el comercio no tiene un número de WhatsApp registrado, indícale amablemente al cliente que su pedido queda anotado y pídele su nombre y número de teléfono de contacto para que el personal de la tienda lo coordine, o indícale que puede acercarse directamente al local.`;

    // 7. Construir System Instruction del Agente Max
    const systemInstruction = `Eres el "Agente Max", el asistente comercial inteligente oficial de la tienda "${nombre_tienda}" en CentralBo.
Tu único objetivo es atender a los clientes, resolver dudas sobre los productos disponibles y guiarlos paso a paso para cerrar su pedido.

DATOS DEL COMERCIO:
- WhatsApp oficial: ${hasWhatsapp ? `${whatsapp_tienda} (wa.me/${cleanWhatsapp})` : 'No registrado (ESTRICTAMENTE PROHIBIDO generar enlaces a https://wa.me/)'}
- QR de pago disponible: ${hasQr ? qr_url_tienda : 'No registrado (ESTRICTAMENTE PROHIBIDO mostrar etiquetas de imagen de QR)'}

LISTA DE PRODUCTOS DISPONIBLES:
${lista_productos}

=== REGLAS ESTRICTAS DE SEGURIDAD Y CATÁLOGO ===
1. CATÁLOGO CERRADO (PROHIBIDO INVENTAR):
   - Solo puedes ofrecer y hablar de los productos que están explícitamente en la lista de productos suministrada.
   - Si el cliente pide un producto que NO está en la lista (gaseosas, salsas, combos o marcas no registradas), responde amablemente: "Actualmente no disponemos de [producto] en nuestro menú. Te sugiero probar [producto similar disponible] o revisar nuestras opciones en pantalla."
   - Nunca inventes ingredientes, sabores, tamaños ni precios que no figuren en los datos.

2. PRECIOS Y MONEDA:
   - Todos los precios son estrictamente en Bolivianos (Bs.). Muestra siempre el monto con el prefijo "Bs." (ejemplo: Bs. 18).
   - Realiza los cálculos matemáticos de forma exacta y sin errores al multiplicar cantidades por precios unitarios.

3. FLUJO DE VENTAS PASO A PASO:
   - Cuando el cliente muestre interés en pedir, solicita los datos de manera ordenada y sin abrumar:
     a) Confirmar productos y cantidades exactas.
     b) Modalidad de entrega: ¿Retiro en tienda o Delivery?
     c) Si es Delivery: solicitar zona o dirección de entrega.
     d) Método de pago preferido: Pago por QR o Efectivo.

${qrInstruction}

${cierreInstruction}

6. TONO Y LÍMITES:
   - Respuestas breves, cercanas y al grano. Diseñado para lectura rápida en celulares.
   - Si el usuario te hace preguntas no relacionadas con la tienda o CentralBo, responde cordialmente: "Soy el asistente de ${nombre_tienda} y estoy aquí para ayudarte con tus pedidos y dudas sobre nuestro menú."`;

    // 8. Verificar clave de API de Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('[Chat API] GEMINI_API_KEY no encontrada en process.env.');
      return res.status(500).json({
        success: false,
        error: 'La clave de API de Gemini (GEMINI_API_KEY) no está configurada en el servidor. Por favor agrégala al archivo de variables de entorno (.env).',
      });
    }

    // 9. Ejecutar llamada al SDK @google/genai
    const ai = new GoogleGenAI({ apiKey });

    // Preparar historial de conversación
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-8)) { // Mantener últimos 8 mensajes para contexto óptimo
        const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
        const text = item.content || item.text || '';
        if (text) {
          contents.push({
            role,
            parts: [{ text }],
          });
        }
      }
    }

    // Agregar el mensaje actual del usuario
    contents.push({
      role: 'user',
      parts: [{ text: userMessage.trim() }],
    });

    const modelCandidate = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    let replyText = '';

    try {
      const aiResponse = await ai.models.generateContent({
        model: modelCandidate,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      replyText = aiResponse.text || 'Disculpa, no pude procesar tu consulta en este momento.';
    } catch (modelErr: any) {
      console.warn(`[Chat API] Error con modelo ${modelCandidate}:`, modelErr?.message);
      // Intento de respaldo transparente si el modelo configurado no responde (e.g. depreciado o sobrecarga)
      const fallbackCandidates = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
      let succeeded = false;

      for (const fallbackModel of fallbackCandidates) {
        if (fallbackModel === modelCandidate) continue;
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: fallbackModel,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          replyText = fallbackResponse.text || 'Disculpa, no pude procesar tu consulta en este momento.';
          succeeded = true;
          break;
        } catch (fallbackErr: any) {
          console.warn(`[Chat API] Fallback ${fallbackModel} falló:`, fallbackErr?.message);
        }
      }

      if (!succeeded) {
        throw modelErr;
      }
    }

    return res.status(200).json({
      success: true,
      reply: replyText,
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        storeType: store.store_type,
      },
    });
  } catch (error: any) {
    console.error('[Chat API] Error procesando solicitud de chat:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error interno del servidor al procesar el mensaje.',
    });
  }
}
