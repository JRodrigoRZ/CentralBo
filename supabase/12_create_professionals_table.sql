-- ============================================================================
-- CENTRALBO — MIGRACIÓN: CENTRALIZACIÓN DE PROFESIONALES (H-02 PARTE 1)
-- Objetivo: Persistencia centralizada de profesionales, horarios y relación con servicios
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

-- 1. TABLA: public.professionals
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    specialty VARCHAR(150) NOT NULL DEFAULT '',
    phone VARCHAR(50) NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    service_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
    schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ÍNDICES DE RENDIMIENTO Y FILTRADO MULTI-TENANT
CREATE INDEX IF NOT EXISTS idx_professionals_tenant_id 
    ON public.professionals(tenant_id);

CREATE INDEX IF NOT EXISTS idx_professionals_tenant_active 
    ON public.professionals(tenant_id, is_active);

-- 3. TRIGGER AUTOMÁTICO DE ACTUALIZACIÓN updated_at
DROP TRIGGER IF EXISTS trg_professionals_updated_at ON public.professionals;
CREATE TRIGGER trg_professionals_updated_at
    BEFORE UPDATE ON public.professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- 4.1 Público (anon y authenticated): Lectura de profesionales activos en tiendas activas
DROP POLICY IF EXISTS "professionals_public_read" ON public.professionals;
CREATE POLICY "professionals_public_read"
    ON public.professionals FOR SELECT
    TO anon, authenticated
    USING (
        is_active = TRUE
        AND EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = professionals.tenant_id
              AND s.status IN ('activo', 'prueba')
        )
    );

-- 4.2 Administrador / Miembros del Comercio: Consulta de todos los profesionales de su tenant
DROP POLICY IF EXISTS "professionals_tenant_select" ON public.professionals;
CREATE POLICY "professionals_tenant_select"
    ON public.professionals FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- 4.3 Administrador / Miembros del Comercio: Inserción exclusiva en su propio tenant
DROP POLICY IF EXISTS "professionals_tenant_insert" ON public.professionals;
CREATE POLICY "professionals_tenant_insert"
    ON public.professionals FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- 4.4 Administrador / Miembros del Comercio: Modificación de profesionales de su propio tenant
DROP POLICY IF EXISTS "professionals_tenant_update" ON public.professionals;
CREATE POLICY "professionals_tenant_update"
    ON public.professionals FOR UPDATE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    )
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- 4.5 Administrador / Miembros del Comercio: Eliminación de profesionales de su propio tenant
DROP POLICY IF EXISTS "professionals_tenant_delete" ON public.professionals;
CREATE POLICY "professionals_tenant_delete"
    ON public.professionals FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );
