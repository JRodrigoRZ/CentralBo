-- ============================================================================
-- CENTRALBO — MIGRACIÓN CANÓNICA: CORRECCIÓN PUNTUAL RLS STORAGE
-- Archivo: supabase/17_add_product_images_delete_rls.sql
-- Objetivo: Permitir eliminación física de imágenes de producto por parte del
--           comerciante autenticado propietario, garantizando aislamiento multi-tenant.
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

-- 1. LIMPIEZA IDEMPOTENTE
DROP POLICY IF EXISTS "product_images_tenant_delete"
ON storage.objects;

-- 2. POLÍTICA DE ELIMINACIÓN (DELETE) EN storage.objects
-- Permite que un usuario autenticado elimine únicamente objetos cuyo primer
-- segmento de ruta corresponda a un tenant_id que el usuario administra, o si es SuperAdmin.
CREATE POLICY "product_images_tenant_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND (
        (storage.foldername(name))[1]::uuid IN (
            SELECT tenant_id
            FROM get_user_tenant_ids()
        )
        OR is_superadmin()
    )
);

-- NOTA DE INTEGRIDAD Y NO REGRESIÓN:
-- Las políticas existentes:
--   - product_images_public_read (SELECT)
--   - product_images_tenant_upload (INSERT)
-- permanecen 100% inalteradas.
-- NO se crea política UPDATE ni ALL.
-- ============================================================================
