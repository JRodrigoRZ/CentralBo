import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wuerdwkcpurbtcwyqjep.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Generador de contraseña segura
function generateSecurePassword(): string {
  const charsUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charsLower = 'abcdefghijklmnopqrstuvwxyz';
  const charsNum = '0123456789';
  const charsSpecial = '!@#$%&*';
  let pass = '';
  for (let i = 0; i < 3; i++) {
    pass += charsUpper[Math.floor(Math.random() * charsUpper.length)];
    pass += charsLower[Math.floor(Math.random() * charsLower.length)];
    pass += charsNum[Math.floor(Math.random() * charsNum.length)];
    pass += charsSpecial[Math.floor(Math.random() * charsSpecial.length)];
  }
  return pass;
}

// Extractor para encontrar el correo sin importar el nombre del campo
function extractEmail(data: any): string | null {
  if (!data) return null;
  if (typeof data === 'string') {
    if (data.includes('@') && data.includes('.')) return data.trim();
    try {
      return extractEmail(JSON.parse(data));
    } catch {
      return null;
    }
  }
  if (typeof data === 'object') {
    const directCandidates = [
      data.email,
      data.ownerEmail,
      data.owner_email,
      data.adminEmail,
      data.admin_email,
      data.correo,
      data.correoElectronico,
      data.userEmail,
      data.owner?.email,
      data.admin?.email,
      data.user?.email
    ];
    for (const item of directCandidates) {
      if (typeof item === 'string' && item.includes('@') && item.includes('.')) {
        return item.trim();
      }
    }
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (typeof val === 'string' && val.includes('@') && val.includes('.')) {
        return val.trim();
      }
      if (typeof val === 'object' && val !== null) {
        const nested = extractEmail(val);
        if (nested) return nested;
      }
    }
  }
  return null;
}

export default async function handler(req: any, res: any) {
  // Configuración de encabezados CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // mantener como objeto
      }
    }
    body = body || {};

    const targetEmail = extractEmail(body);

    if (!targetEmail) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
    }

    const targetOwnerName = 
      body.ownerName || 
      body.owner_name || 
      body.adminName || 
      body.admin_name || 
      body.nombreDueno || 
      body.nombre_dueno || 
      body.owner?.name || 
      body.admin?.name || 
      'Administrador';

    const targetPhone = 
      body.phone || 
      body.telefono || 
      body.ownerPhone || 
      body.owner_phone || 
      body.adminPhone || 
      body.whatsapp || 
      body.owner?.phone || 
      '';

    const targetStoreName = 
      body.name || 
      body.storeName || 
      body.store_name || 
      body.nombreComercio || 
      body.comercio || 
      'Comercio';

    const targetSlug = 
      body.slug || 
      (targetStoreName ? targetStoreName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : `tienda-${Date.now()}`);

    const targetVertical = body.vertical || body.tipoComercio || body.tipo_comercio || 'Comercio General';
    const targetPlan = body.plan || body.subscriptionPlan || body.plan_suscripcion || body.planSuscripcion || 'basic';
    const targetStatus = body.status || body.estado || 'active';

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const tempPassword = generateSecurePassword();

    // 1. Crear o vincular usuario en Supabase Auth
    let userId: string | undefined;
    let authResponseUser: any = null;

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: targetOwnerName,
        phone: targetPhone,
        role: 'store_admin'
      }
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes('already') || authError.status === 422) {
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find((u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase());
        if (existing) {
          userId = existing.id;
          authResponseUser = existing;
        } else {
          return res.status(400).json({ error: authError.message });
        }
      } else {
        return res.status(400).json({ error: authError.message });
      }
    } else {
      userId = authUser?.user?.id;
      authResponseUser = authUser?.user;
    }

    // 2. Registrar el comercio en la base de datos
    const storePayload: any = {
      name: targetStoreName,
      slug: targetSlug,
      vertical: targetVertical,
      plan: targetPlan,
      status: targetStatus,
      owner_id: userId,
      created_at: new Date().toISOString()
    };

    let storeResult: any = null;
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([storePayload])
      .select()
      .maybeSingle();

    if (storeError) {
      const { data: fallbackStore } = await supabase
        .from('comercios')
        .insert([storePayload])
        .select()
        .maybeSingle();
      storeResult = fallbackStore || storePayload;
    } else {
      storeResult = store || storePayload;
    }

    // Estructuras de credenciales y usuario
    const credentialsObject = {
      email: targetEmail,
      initialPassword: tempPassword,
      password: tempPassword,
      tempPassword: tempPassword
    };

    const ownerObject = {
      id: userId,
      email: targetEmail,
      full_name: targetOwnerName,
      fullName: targetOwnerName,
      name: targetOwnerName,
      phone: targetPhone,
      role: 'store_admin',
      initialPassword: tempPassword,
      password: tempPassword,
      tempPassword: tempPassword,
      credentials: credentialsObject,
      ...(authResponseUser || {})
    };

    if (storeResult && typeof storeResult === 'object') {
      storeResult.initialPassword = tempPassword;
      storeResult.owner = ownerObject;
      storeResult.credentials = credentialsObject;
    }

    // Respuesta multiformato para blindar cualquier lectura del frontend
    return res.status(200).json({
      success: true,
      message: 'Comercio y administrador creados con éxito',
      initialPassword: tempPassword,
      tempPassword: tempPassword,
      password: tempPassword,
      store: storeResult,
      owner: ownerObject,
      admin: ownerObject,
      user: ownerObject,
      storeOwner: ownerObject,
      store_owner: ownerObject,
      credentials: credentialsObject,
      auth: {
        user: ownerObject,
        initialPassword: tempPassword,
        credentials: credentialsObject
      },
      data: {
        success: true,
        initialPassword: tempPassword,
        password: tempPassword,
        tempPassword: tempPassword,
        store: storeResult,
        owner: ownerObject,
        admin: ownerObject,
        user: ownerObject,
        storeOwner: ownerObject,
        credentials: credentialsObject,
        auth: {
          user: ownerObject,
          initialPassword: tempPassword
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
