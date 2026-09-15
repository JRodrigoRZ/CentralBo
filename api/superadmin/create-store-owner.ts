import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wuerdwkcpurbtcwyqjep.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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

export default async function handler(req: any, res: any) {
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

    // Extracción de datos según el Payload real
    const targetEmail = body.ownerEmail || body.email || body.adminEmail || body.correo;
    const targetStoreName = body.name || body.storeName || 'Comercio';
    const targetSlug = body.slug || targetStoreName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const targetOwnerName = body.ownerName || body.adminName || body.fullName || 'Administrador';
    const targetPhone = body.ownerPhone || body.phone || body.telefono || '';
    const targetStoreType = body.store_type || body.vertical || 'general';
    const targetPlanId = body.planId || body.plan || 'basic';
    const targetStatus = body.status || 'active';

    if (!targetEmail) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const tempPassword = generateSecurePassword();

    // 1. Crear usuario en Supabase Auth
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

    // 2. Detectar dinámicamente las columnas reales de la tabla 'stores'
    const { data: sampleList } = await supabase.from('stores').select('*').limit(1);
    const existingColumns = sampleList && sampleList.length > 0 ? Object.keys(sampleList[0]) : [];

    const candidateStoreData: Record<string, any> = {
      name: targetStoreName,
      slug: targetSlug,
      status: targetStatus,
      store_type: targetStoreType,
      type: targetStoreType,
      vertical: targetStoreType,
      plan_id: targetPlanId,
      planId: targetPlanId,
      plan: targetPlanId,
      owner_id: userId,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const storeInsertPayload: Record<string, any> = {};
    if (existingColumns.length > 0) {
      for (const col of existingColumns) {
        if (col === 'id') continue; // El UUID lo genera Supabase
        if (candidateStoreData[col] !== undefined) {
          storeInsertPayload[col] = candidateStoreData[col];
        }
      }
    } else {
      storeInsertPayload.name = targetStoreName;
      storeInsertPayload.slug = targetSlug;
      storeInsertPayload.status = targetStatus;
    }

    // Insertar en 'stores'
    const { data: insertedStore, error: storeError } = await supabase
      .from('stores')
      .insert([storeInsertPayload])
      .select()
      .single();

    if (storeError) {
      return res.status(500).json({ error: `Error guardando en stores: ${storeError.message}` });
    }

    const createdStoreId = insertedStore?.id;

    // 3. Vincular dueño en 'store_users' si existe la tabla
    try {
      const { data: sampleUsers } = await supabase.from('store_users').select('*').limit(1);
      if (sampleUsers !== null) {
        const userCols = sampleUsers.length > 0 ? Object.keys(sampleUsers[0]) : ['store_id', 'user_id', 'role'];
        const storeUserPayload: Record<string, any> = {};
        const candidateUserData: Record<string, any> = {
          store_id: createdStoreId,
          user_id: userId,
          role: 'store_admin',
          created_at: new Date().toISOString()
        };
        for (const col of userCols) {
          if (col === 'id') continue;
          if (candidateUserData[col] !== undefined) {
            storeUserPayload[col] = candidateUserData[col];
          }
        }
        if (storeUserPayload.store_id && storeUserPayload.user_id) {
          await supabase.from('store_users').insert([storeUserPayload]);
        }
      }
    } catch (linkError) {
      console.warn('Advertencia en store_users:', linkError);
    }

    // Estructuras de respuesta para el modal y frontend
    const resultStore = {
      ...(insertedStore || {}),
      id: createdStoreId,
      name: targetStoreName,
      storeName: targetStoreName,
      store_name: targetStoreName,
      slug: targetSlug,
      storeSlug: targetSlug,
      store_slug: targetSlug,
      status: targetStatus,
      store_type: targetStoreType,
      planId: targetPlanId,
      plan_id: targetPlanId,
      initialPassword: tempPassword,
      ownerName: targetOwnerName,
      ownerEmail: targetEmail,
      ownerPhone: targetPhone
    };

    const resultOwner = {
      id: userId,
      email: targetEmail,
      ownerEmail: targetEmail,
      owner_email: targetEmail,
      name: targetOwnerName,
      ownerName: targetOwnerName,
      owner_name: targetOwnerName,
      fullName: targetOwnerName,
      full_name: targetOwnerName,
      phone: targetPhone,
      ownerPhone: targetPhone,
      owner_phone: targetPhone,
      role: 'store_admin',
      initialPassword: tempPassword,
      password: tempPassword,
      tempPassword: tempPassword,
      ...(authResponseUser || {})
    };

    const resultCredentials = {
      email: targetEmail,
      initialPassword: tempPassword,
      password: tempPassword,
      tempPassword: tempPassword
    };

    return res.status(200).json({
      success: true,
      message: 'Comercio y administrador creados con éxito',
      name: targetStoreName,
      storeName: targetStoreName,
      store_name: targetStoreName,
      slug: targetSlug,
      storeSlug: targetSlug,
      store_slug: targetSlug,
      ownerName: targetOwnerName,
      owner_name: targetOwnerName,
      fullName: targetOwnerName,
      full_name: targetOwnerName,
      ownerEmail: targetEmail,
      owner_email: targetEmail,
      email: targetEmail,
      ownerPhone: targetPhone,
      owner_phone: targetPhone,
      phone: targetPhone,
      initialPassword: tempPassword,
      password: tempPassword,
      tempPassword: tempPassword,
      store: resultStore,
      owner: resultOwner,
      admin: resultOwner,
      user: resultOwner,
      storeOwner: resultOwner,
      store_owner: resultOwner,
      credentials: resultCredentials,
      auth: {
        user: resultOwner,
        initialPassword: tempPassword,
        credentials: resultCredentials
      },
      data: {
        success: true,
        name: targetStoreName,
        storeName: targetStoreName,
        slug: targetSlug,
        ownerName: targetOwnerName,
        ownerEmail: targetEmail,
        ownerPhone: targetPhone,
        initialPassword: tempPassword,
        store: resultStore,
        owner: resultOwner,
        credentials: resultCredentials
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
