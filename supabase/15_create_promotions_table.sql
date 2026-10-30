-- ============================================================================
-- CENTRALBO — MIGRACIÓN CANÓNICA: FASE 2 (PARTE 1)
-- 15_create_promotions_table.sql: Tabla Canónica de Promociones y Cupones
-- Objetivo: Persistencia canónica y administración multi-tenant de promociones
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

-- 1. TABLA: public.promotions
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    min_purchase NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_purchase >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_promotions_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT chk_promotions_dates CHECK (end_date >= start_date)
);

-- 2. ÍNDICES DE RENDIMIENTO Y FILTRADO MULTI-TENANT
CREATE INDEX IF NOT EXISTS idx_promotions_tenant_id 
    ON public.promotions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_promotions_tenant_code 
    ON public.promotions(tenant_id, code);

CREATE INDEX IF NOT EXISTS idx_promotions_tenant_active 
    ON public.promotions(tenant_id, is_active);

-- 3. TRIGGER AUTOMÁTICO DE ACTUALIZACIÓN updated_at
DROP TRIGGER IF EXISTS trg_promotions_updated_at ON public.promotions;
CREATE TRIGGER trg_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 4.1 SELECT: Administrador / Miembros del Comercio o SuperAdmin
DROP POLICY IF EXISTS "promotions_tenant_select" ON public.promotions;
CREATE POLICY "promotions_tenant_select"
    ON public.promotions FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- 4.2 INSERT: Administrador / Miembros del Comercio o SuperAdmin (con CHECK estricto)
DROP POLICY IF EXISTS "promotions_tenant_insert" ON public.promotions;
CREATE POLICY "promotions_tenant_insert"
    ON public.promotions FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- 4.3 UPDATE: Administrador / Miembros del Comercio o SuperAdmin (con USING y CHECK)
DROP POLICY IF EXISTS "promotions_tenant_update" ON public.promotions;
CREATE POLICY "promotions_tenant_update"
    ON public.promotions FOR UPDATE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    )
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- 4.4 DELETE: Administrador / Miembros del Comercio o SuperAdmin
DROP POLICY IF EXISTS "promotions_tenant_delete" ON public.promotions;
CREATE POLICY "promotions_tenant_delete"
    ON public.promotions FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );
