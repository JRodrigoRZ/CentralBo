import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wuerdwkcpurbtcwyqjep.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CaupILScNyFk_Kwk-oda_Q_gWniqb4g';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Generador de contraseña inicial segura para el dueño del comercio
function generateSecurePassword(): string {
  const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const charsLower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#*';

  let pwd = 'CB$';
  for (let i = 0; i < 3; i++) {
    pwd += charsUpper.charAt(Math.floor(Math.random() * charsUpper.length));
  }
  for (let i = 0; i < 3; i++) {
    pwd += charsLower.charAt(Math.floor(Math.random() * charsLower.length));
  }
  for (let i = 0; i < 2; i++) {
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));
  return pwd;
}

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    serviceRoleConfigured: !!supabaseServiceRoleKey,
    supabaseUrl,
    timestamp: new Date().toISOString(),
  });
});

// 2. Creación Real de Comercio + Dueño (SuperAdmin)
app.post('/api/superadmin/create-store-owner', async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    store_type,
    status = 'prueba',
    slug,
    ownerName,
    ownerEmail,
    ownerPhone,
    initialPassword: customPassword,
  } = req.body || {};

  // Validación rigurosa de entradas
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ success: false, error: 'El nombre del comercio es requerido' });
    return;
  }
  if (!ownerName || typeof ownerName !== 'string' || !ownerName.trim()) {
    res.status(400).json({ success: false, error: 'El nombre del propietario es requerido' });
    return;
  }
  if (!ownerEmail || typeof ownerEmail !== 'string' || !ownerEmail.includes('@')) {
    res.status(400).json({ success: false, error: 'El correo del propietario es inválido' });
    return;
  }
  if (!ownerPhone || typeof ownerPhone !== 'string' || !ownerPhone.trim()) {
    res.status(400).json({ success: false, error: 'El teléfono del propietario es requerido' });
    return;
  }

  const cleanEmail = ownerEmail.trim().toLowerCase();
  const cleanOwnerName = ownerName.trim();
  const cleanPhone = ownerPhone.trim();
  const cleanStoreName = name.trim();
  const initialPassword = customPassword && customPassword.length >= 6
    ? customPassword
    : generateSecurePassword();

  // Inicialización de cliente Supabase de servidor
  const adminClient = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

  // Extraer token de autorización del SuperAdmin si viene en headers
  const authHeader = req.headers.authorization;
  const userToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  const dbClient = adminClient || createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: userToken ? { headers: { Authorization: `Bearer ${userToken}` } } : undefined,
  });

  let authUserId: string | null = null;
  let createdStoreId: string | null = null;

  try {
    // ------------------------------------------------------------------------
    // PASO 1: CREAR USUARIO REAL EN SUPABASE AUTH
    // ------------------------------------------------------------------------
    if (adminClient) {
      // Flujo con service_role: Permite creación administrativa confirmada instantáneamente
      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password: initialPassword,
        email_confirm: true,
        user_metadata: { full_name: cleanOwnerName },
      });

      if (createError) {
        // Si el usuario ya existe en Supabase Auth, actualizar contraseña y confirmar
        const isExisting =
          createError.message?.toLowerCase().includes('already') ||
          createError.message?.toLowerCase().includes('registered') ||
          (createError as unknown as { code?: string })?.code === 'email_exists';

        if (isExisting) {
          const { data: userList, error: listError } = await adminClient.auth.admin.listUsers();
          if (listError) {
            throw new Error(`Error al consultar usuarios de Auth: ${listError.message}`);
          }
          const existingUser = userList?.users?.find(
            (u) => u.email?.toLowerCase() === cleanEmail
          );
          if (!existingUser) {
            throw new Error(`El usuario ya existe pero no se pudo recuperar su identidad: ${createError.message}`);
          }
          authUserId = existingUser.id;
          // Actualizar contraseña y forzar confirmación de correo
          await adminClient.auth.admin.updateUserById(existingUser.id, {
            password: initialPassword,
            email_confirm: true,
            user_metadata: { full_name: cleanOwnerName },
          });
        } else {
          throw new Error(`Error al crear usuario en Supabase Auth: ${createError.message}`);
        }
      } else if (createData?.user) {
        authUserId = createData.user.id;
      }
    } else {
      // Fallback seguro sin service_role: signUp mediante cliente anon
      const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
      const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
        email: cleanEmail,
        password: initialPassword,
        options: {
          data: { full_name: cleanOwnerName },
        },
      });

      if (signUpError) {
        throw new Error(`Error al registrar usuario en Supabase Auth: ${signUpError.message}`);
      }
      if (!signUpData?.user?.id) {
        throw new Error('No se obtuvo el identificador (user_id) del usuario registrado en Supabase Auth');
      }
      authUserId = signUpData.user.id;
    }

    if (!authUserId) {
      throw new Error('No se pudo determinar el user_id del nuevo usuario de autenticación.');
    }

    // ------------------------------------------------------------------------
    // PASO 2: GENERAR SLUG ÚNICO Y PERSISTIR COMERCIO EN public.stores
    // ------------------------------------------------------------------------
    const baseSlug = (slug || cleanStoreName)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `comercio-${Date.now().toString().slice(-4)}`;

    let uniqueSlug = baseSlug;
    let suffix = 1;
    while (true) {
      const { data: existingStore } = await dbClient
        .from('stores')
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle();

      if (!existingStore) {
        break;
      }
      uniqueSlug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const { data: store, error: storeError } = await dbClient
      .from('stores')
      .insert({
        name: cleanStoreName,
        slug: uniqueSlug,
        store_type: store_type || 'general',
        status: status || 'prueba',
        logo_url: null,
      })
      .select('id, name, slug, store_type, status, logo_url, created_at, updated_at')
      .single();

    if (storeError || !store) {
      throw new Error(`Error al persistir en public.stores: ${storeError?.message || 'Fallo desconocido'}`);
    }

    createdStoreId = store.id;

    // ------------------------------------------------------------------------
    // PASO 3: PERSISTIR ASOCIACIÓN EN public.store_users
    // ------------------------------------------------------------------------
    const { data: storeUser, error: storeUserError } = await dbClient
      .from('store_users')
      .insert({
        tenant_id: store.id,
        user_id: authUserId,
        role: 'admin', // Enum store_user_role en esquema Fase 1 ('admin' | 'staff' | 'superadmin')
        full_name: cleanOwnerName,
        email: cleanEmail,
        is_active: true,
      })
      .select('id, tenant_id, user_id, role, full_name, email, is_active, created_at')
      .single();

    if (storeUserError || !storeUser) {
      throw new Error(`Error al persistir la asociación en public.store_users: ${storeUserError?.message || 'Fallo desconocido'}`);
    }

    // ------------------------------------------------------------------------
    // OPERACIÓN COMPLETADA CON ÉXITO
    // ------------------------------------------------------------------------
    res.json({
      success: true,
      store,
      storeUser,
      credentials: {
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
        ownerName: cleanOwnerName,
        ownerEmail: cleanEmail,
        ownerPhone: cleanPhone,
        initialPassword,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al procesar la creación del comercio';
    console.error('[CentralBo Server] Fallo en creación de comercio:', message);

    // Rollback: limpiar comercio huérfano si fue creado antes de la falla
    if (createdStoreId) {
      try {
        await dbClient.from('stores').delete().eq('id', createdStoreId);
        console.log(`[CentralBo Server] Rollback exitoso de store huérfano: ${createdStoreId}`);
      } catch (rbErr) {
        console.warn('[CentralBo Server] Error durante rollback de store:', rbErr);
      }
    }

    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE VITE / PRODUCCIÓN
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CentralBo Server] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
