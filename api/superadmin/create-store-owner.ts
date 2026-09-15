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
  // Encabezados CORS
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
    const body = req.body || {};
    const {
      name,
      storeName,
      slug,
      vertical,
      plan,
      subscriptionPlan,
      status,
      ownerName,
      owner_name,
      email,
      phone
    } = body;

    const targetEmail = email || body.correo;
    const finalStoreName = name || storeName || body.nombreComercio;
    const finalSlug = slug || (finalStoreName ? finalStoreName.toLowerCase().replace(/\s+/g, '-') : 'tienda');
    const finalOwnerName = ownerName || owner_name || body.nombreDueno || 'Administrador';

    if (!targetEmail) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const tempPassword = generateSecurePassword();

    // 1. Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: finalOwnerName,
        phone: phone || '',
        role: 'store_admin'
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authUser?.user?.id;

    // 2. Registrar el comercio en la base de datos
    const storePayload = {
      name: finalStoreName,
      slug: finalSlug,
      vertical: vertical || 'Comercio General',
      plan: plan || subscriptionPlan || 'basic',
      status: status || 'active',
      owner_id: userId,
      created_at: new Date().toISOString()
    };

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([storePayload])
      .select()
      .single();

    if (storeError) {
      // Intento de fallback si la tabla se llama comercios
      await supabase.from('comercios').insert([storePayload]);
    }

    return res.status(200).json({
      success: true,
      message: 'Comercio y administrador creados con éxito',
      store: store || storePayload,
      user: authUser?.user,
      tempPassword
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
