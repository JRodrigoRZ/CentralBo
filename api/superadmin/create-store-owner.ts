import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wuerdwkcpurbtcwyqjep.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

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
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  // Verificación estricta de credencial de servicio administrativo
  if (!supabaseServiceRoleKey) {
    return res.status(500).json({
      success: false,
      error: 'Error de configuración del servidor: SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno.'
    });
  }

  let createdStoreId: string | null = null;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

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
      return res.status(400).json({ success: false, error: 'El correo electrónico es obligatorio' });
    }

    const cleanEmail = targetEmail.trim().toLowerCase();
    const cleanOwnerName = targetOwnerName.trim();
    const tempPassword = generateSecurePassword();

    // 1. Crear usuario en Supabase Auth
    let userId: string | undefined;
    let authResponseUser: any = null;

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanOwnerName,
        phone: targetPhone,
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes('already') || authError.status === 422) {
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          return res.status(500).json({
            success: false,
            error: `Error al consultar usuarios de Supabase Auth: ${listError.message}`
          });
        }
        const existing = listData?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
        if (existing) {
          userId = existing.id;
          authResponseUser = existing;

          // Sincronizar contraseña del usuario existente con la credencial generada
          const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              full_name: cleanOwnerName,
              phone: targetPhone,
              role: 'admin'
            }
          });

          if (updateError) {
            return res.status(500).json({
              success: false,
              error: `Error al actualizar credenciales del usuario existente: ${updateError.message}`
            });
          }
        } else {
          return res.status(400).json({ success: false, error: authError.message });
        }
      } else {
        return res.status(400).json({ success: false, error: authError.message });
      }
    } else {
      userId = authUser?.user?.id;
      authResponseUser = authUser?.user;
    }

    if (!userId) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo obtener el identificador (user_id) del usuario en Supabase Auth.'
      });
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

    if (storeError || !insertedStore) {
      return res.status(500).json({
        success: false,
        error: `Error guardando en stores: ${storeError?.message || 'Fallo desconocido'}`
      });
    }

    createdStoreId = insertedStore.id;

    // 3. Vincular dueño en 'store_users' utilizando el contrato real de CentralBo
    const { data: storeUserData, error: storeUserError } = await supabase
      .from('store_users')
      .insert({
        tenant_id: createdStoreId,
        user_id: userId,
        role: 'admin',
        full_name: cleanOwnerName,
        email: cleanEmail,
        is_active: true
      })
      .select()
      .single();

    if (storeUserError || !storeUserData) {
      // 4. RESTAURAR ROLLBACK: eliminar tienda para no dejarla huérfana
      if (createdStoreId) {
        try {
          await supabase.from('stores').delete().eq('id', createdStoreId);
        } catch (rollbackErr) {
          console.error('[CentralBo API] Error en rollback de stores:', rollbackErr);
        }
      }

      return res.status(500).json({
        success: false,
        error: `Error al vincular el administrador en store_users: ${storeUserError?.message || 'Fallo al asociar usuario con comercio'}`
      });
    }

    // Estructuras de respuesta compatibles para el modal y frontend
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
      ownerName: cleanOwnerName,
      ownerEmail: cleanEmail,
      ownerPhone: targetPhone
    };

    const resultOwner = {
      id: userId,
      email: cleanEmail,
      ownerEmail: cleanEmail,
      owner_email: cleanEmail,
      name: cleanOwnerName,
      ownerName: cleanOwnerName,
      owner_name: cleanOwnerName,
      fullName: cleanOwnerName,
      full_name: cleanOwnerName,
      phone: targetPhone,
      ownerPhone: targetPhone,
      owner_phone: targetPhone,
      role: 'admin',
      initialPassword: tempPassword,
      password: tempPassword,
      tempPassword: tempPassword,
      ...(authResponseUser || {})
    };

    const resultCredentials = {
      email: cleanEmail,
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
      ownerName: cleanOwnerName,
      owner_name: cleanOwnerName,
      fullName: cleanOwnerName,
      full_name: cleanOwnerName,
      ownerEmail: cleanEmail,
      owner_email: cleanEmail,
      email: cleanEmail,
      ownerPhone: targetPhone,
      owner_phone: targetPhone,
      phone: targetPhone,
      initialPassword: tempPassword,
      password: tempPassword,
      tempPassword: tempPassword,
      store: resultStore,
      storeUser: storeUserData,
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
        ownerName: cleanOwnerName,
        ownerEmail: cleanEmail,
        ownerPhone: targetPhone,
        initialPassword: tempPassword,
        store: resultStore,
        storeUser: storeUserData,
        owner: resultOwner,
        credentials: resultCredentials
      }
    });
  } catch (error: any) {
    // Rollback en caso de excepción general
    if (createdStoreId) {
      try {
        await supabase.from('stores').delete().eq('id', createdStoreId);
      } catch (rollbackErr) {
        console.error('[CentralBo API] Error en rollback:', rollbackErr);
      }
    }
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
}
