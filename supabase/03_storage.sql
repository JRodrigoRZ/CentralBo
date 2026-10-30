-- ============================================================================
-- FASE 1: BASE DE DATOS Y SEGURIDAD — SAAS MARKETPLACE VERTICALIZADO
-- 03_storage.sql: Buckets de Almacenamiento y Políticas de Acceso
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CREACIÓN DE BUCKETS EN SUPABASE STORAGE
-- ----------------------------------------------------------------------------

-- Bucket 1: Logos de los comercios (Público para renderizado en catálogo/tiendas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'store-logos',
    'store-logos',
    TRUE,
    2097152, -- Límite de 2MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket 2: Imágenes de productos (Público para catálogo y navegación)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    TRUE,
    5242880, -- Límite de 5MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket 3: Comprobantes de pago / pedidos (PRIVADO por confidencialidad financiera)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts',
    'receipts',
    FALSE,
    10485760, -- Límite de 10MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 2. POLÍTICAS DE SEGURIDAD EN STORAGE.OBJECTS (MULTI-TENANT POR CARPETA)
-- La convención multi-tenant en storage organiza los archivos por tenant_id:
--   store-logos/{tenant_id}/logo.webp
--   product-images/{tenant_id}/{product_id}/imagen.jpg
--   receipts/{tenant_id}/{order_id}/comprobante.pdf
-- ----------------------------------------------------------------------------

-- A) POLÍTICAS: LOGOS DE COMERCIOS (store-logos)
CREATE POLICY "store_logos_public_read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'store-logos');

CREATE POLICY "store_logos_tenant_upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'store-logos'
        AND (
            (storage.foldername(name))[1]::uuid IN (SELECT get_user_tenant_ids())
            OR is_superadmin()
        )
    );

CREATE POLICY "store_logos_tenant_modify"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'store-logos'
        AND (
            (storage.foldername(name))[1]::uuid IN (SELECT get_user_tenant_ids())
            OR is_superadmin()
        )
    );

CREATE POLICY "store_logos_tenant_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'store-logos'
        AND (
            (storage.foldername(name))[1]::uuid IN (SELECT get_user_tenant_ids())
            OR is_superadmin()
        )
    );

-- B) POLÍTICAS: IMÁGENES DE PRODUCTOS (product-images)
CREATE POLICY "product_images_public_read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'product-images');

CREATE POLICY "product_images_tenant_upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'product-images'
        AND (
            (storage.foldername(name))[1]::uuid IN (SELECT get_user_tenant_ids())
            OR is_superadmin()
        )
    );

CREATE POLICY "product_images_tenant_modify"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'product-images'
        AND (
            (storage.foldername(name))[1]::uuid IN (SELECT get_user_tenant_ids())
            OR is_superadmin()
        )
    );

CREATE POLICY "product_images_tenant_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'product-images'
        AND (
            (storage.foldername(name))[1]::uuid IN (SELECT get_user_tenant_ids())
            OR is_superadmin()
        )
    );

-- C) POLÍTICAS: COMPROBANTES DE PAGO (receipts - PRIVADO)
-- Solo el administrador del comercio propietario y el cliente pueden ver o subir comprobantes.
CREATE POLICY "receipts_tenant_read"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'receipts'
        AND (
            (storage.foldername(name))[1]::uuid IN (SELECT get_user_tenant_ids())
            OR is_superadmin()
        )
    );

CREATE POLICY "receipts_upload"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        bucket_id = 'receipts'
        AND (
            -- Si es admin del comercio
            (storage.foldername(name))[1]::uuid IN (SELECT get_user_tenant_ids())
            -- O si es una subida asociada a un comercio válido
            OR EXISTS (
                SELECT 1 FROM stores s
                WHERE s.id = (storage.foldername(name))[1]::uuid
                  AND s.status IN ('activo', 'prueba')
            )
        )
    );
