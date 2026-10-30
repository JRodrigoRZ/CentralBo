-- ============================================================================
-- CENTRALBO — MIGRACIÓN AUTORIZADA: CORRECCIÓN FINAL RLS STORAGE / LOGO
-- Archivo: supabase/11_fix_store_logos_storage_rls.sql
-- Objetivo: Establecer con precisión las políticas RLS sobre storage.objects
--           para el bucket 'store-logos'.
--           Permite subida (INSERT), modificación/reemplazo (UPDATE con USING y WITH CHECK)
--           y borrado (DELETE con USING) autorizados por tenant y SuperAdmin.
--           Garantiza estricto aislamiento multi-tenant y mantiene lectura pública intacta.
-- Ejecutar MANUALMENTE en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. LIMPIEZA IDEMPOTENTE DE POLÍTICAS OBJETIVO
-- ----------------------------------------------------------------------------
-- Solo se eliminan y recrean las políticas de escritura del bucket store-logos.
-- NO se elimina store_logos_public_read ni políticas de otros buckets.
DROP POLICY IF EXISTS "store_logos_tenant_upload" ON storage.objects;
DROP POLICY IF EXISTS "store_logos_tenant_modify" ON storage.objects;
DROP POLICY IF EXISTS "store_logos_tenant_delete" ON storage.objects;

-- ----------------------------------------------------------------------------
-- 2. POLÍTICA DE SUBIDA (INSERT)
-- ----------------------------------------------------------------------------
-- Permite insertar objetos en 'store-logos' únicamente si el primer segmento de la ruta
-- (tenantId) pertenece a un comercio donde el usuario autenticado es miembro activo,
-- o si el usuario autenticado posee rol de SuperAdmin.
CREATE POLICY "store_logos_tenant_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'store-logos'
    AND (
        (storage.foldername(name))[1]::uuid IN (
            SELECT tenant_id FROM get_user_tenant_ids()
        )
        OR is_superadmin()
    )
);

-- ----------------------------------------------------------------------------
-- 3. POLÍTICA DE MODIFICACIÓN / REEMPLAZO (UPDATE / UPSERT)
-- ----------------------------------------------------------------------------
-- Contiene explícitamente tanto USING como WITH CHECK:
--   - USING: autoriza la mutación únicamente si el objeto preexistente pertenece al tenant.
--   - WITH CHECK: garantiza que el objeto resultante continúe perteneciendo al tenant
--     del usuario y bloquea cualquier intento de transferirlo a la carpeta de otro tenant.
CREATE POLICY "store_logos_tenant_modify"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'store-logos'
    AND (
        (storage.foldername(name))[1]::uuid IN (
            SELECT tenant_id FROM get_user_tenant_ids()
        )
        OR is_superadmin()
    )
)
WITH CHECK (
    bucket_id = 'store-logos'
    AND (
        (storage.foldername(name))[1]::uuid IN (
            SELECT tenant_id FROM get_user_tenant_ids()
        )
        OR is_superadmin()
    )
);

-- ----------------------------------------------------------------------------
-- 4. POLÍTICA DE ELIMINACIÓN (DELETE)
-- ----------------------------------------------------------------------------
-- Permite que un usuario autenticado elimine únicamente objetos cuyo primer
-- segmento de ruta corresponda a un tenant_id que el usuario administra, o si es SuperAdmin.
CREATE POLICY "store_logos_tenant_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'store-logos'
    AND (
        (storage.foldername(name))[1]::uuid IN (
            SELECT tenant_id FROM get_user_tenant_ids()
        )
        OR is_superadmin()
    )
);

-- ----------------------------------------------------------------------------
-- 5. LECTURA PÚBLICA (SELECT) — INTACTA
-- ----------------------------------------------------------------------------
-- La política existente 'store_logos_public_read' NO se modifica ni se elimina:
--   CREATE POLICY "store_logos_public_read"
--   ON storage.objects FOR SELECT
--   TO anon, authenticated
--   USING (bucket_id = 'store-logos');
-- ============================================================================
