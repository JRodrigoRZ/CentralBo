/**
 * CentralBo — Cliente Supabase Seguro (Solo Credenciales Públicas Anon)
 * 
 * SEGURIDAD:
 * - Utiliza exclusivamente la publishable/anon key pública en el cliente web.
 * - NUNCA utilices ni importes la clave service_role en el frontend del navegador.
 * - Las políticas RLS de PostgreSQL de la Fase 1 garantizan el aislamiento multi-tenant.
 */

import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as Record<string, string>);
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://wuerdwkcpurbtcwyqjep.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CaupILScNyFk_Kwk-oda_Q_gWniqb4g';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[CentralBo] Supabase client initialized with missing environment credentials. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Función de diagnóstico no destructiva para verificar conectividad con Supabase CentralBo
 * Consulta únicamente el catálogo público para confirmar que la API responde.
 */
export async function testCentralBoConnection(): Promise<{
  connected: boolean;
  message: string;
  endpoint: string;
  latencyMs?: number;
}> {
  const start = performance.now();
  try {
    const { error } = await supabase
      .from('stores')
      .select('id, name, status')
      .limit(1);

    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      // Incluso si la tabla estuviera vacía o con RLS restrictivo, una respuesta HTTP 200/400 de Supabase indica conectividad
      return {
        connected: false,
        message: `Error de respuesta: ${error.message}`,
        endpoint: supabaseUrl,
        latencyMs,
      };
    }

    return {
      connected: true,
      message: 'Conexión activa y validada con Supabase CentralBo',
      endpoint: supabaseUrl,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const errorMessage = err instanceof Error ? err.message : 'Fallo de red desconocido';
    return {
      connected: false,
      message: `No se pudo alcanzar el endpoint: ${errorMessage}`,
      endpoint: supabaseUrl,
      latencyMs,
    };
  }
}
