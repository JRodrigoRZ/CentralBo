-- ============================================================================
-- CENTRALBO — MIGRACIÓN CANÓNICA: FASE 2 (PARTE 2)
-- 16_add_promotions_public_rls.sql: Política RLS de Lectura Pública de Promociones
-- Objetivo: Permitir consulta pública de cupones activos y vigentes a clientes anónimos
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

-- 1. POLÍTICA PÚBLICA DE LECTURA (SELECT) EN public.promotions
-- Permite a usuarios anónimos (anon) y autenticados (authenticated) consultar
-- exclusivamente promociones activas y dentro del rango de vigencia por fecha,
-- pertenecientes a comercios activos o en prueba.
DROP POLICY IF EXISTS "promotions_public_read" ON public.promotions;

CREATE POLICY "promotions_public_read"
    ON public.promotions FOR SELECT
    TO anon, authenticated
    USING (
        is_active = TRUE
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
        AND EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = promotions.tenant_id
              AND s.status IN ('activo', 'prueba')
        )
    );

-- NOTA DE AISLAMIENTO:
-- Las políticas administrativas existentes (promotions_tenant_select,
-- promotions_tenant_insert, promotions_tenant_update, promotions_tenant_delete)
-- se mantienen 100% intactas.
-- NO se permite INSERT, UPDATE ni DELETE para usuarios públicos o anónimos.
