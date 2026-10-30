-- ============================================================================
-- CENTRALBO — MIGRACIÓN: CITAS, BLOQUEOS Y DISPONIBILIDAD (H-02 PARTE 2)
-- Objetivo: Persistencia centralizada de citas y bloqueos manuales en Supabase
-- Incluye: Integridad FK con products, privacidad estricta RLS y función atómica
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

-- 1. TABLA: public.appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    service_name VARCHAR(255) NOT NULL,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    professional_name VARCHAR(150) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150) NOT NULL DEFAULT '',
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABLA: public.appointment_blocks
CREATE TABLE IF NOT EXISTS public.appointment_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    reason VARCHAR(255) NOT NULL DEFAULT '',
    is_external BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ÍNDICES DE RENDIMIENTO Y FILTRADO MULTI-TENANT
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id 
    ON public.appointments(tenant_id);

CREATE INDEX IF NOT EXISTS idx_appointments_prof_date 
    ON public.appointments(professional_id, date);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date 
    ON public.appointments(tenant_id, date);

CREATE INDEX IF NOT EXISTS idx_appointment_blocks_tenant_id 
    ON public.appointment_blocks(tenant_id);

CREATE INDEX IF NOT EXISTS idx_appointment_blocks_prof_date 
    ON public.appointment_blocks(professional_id, date);

-- 4. TRIGGERS AUTOMÁTICOS DE ACTUALIZACIÓN updated_at
DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_appointment_blocks_updated_at ON public.appointment_blocks;
CREATE TRIGGER trg_appointment_blocks_updated_at
    BEFORE UPDATE ON public.appointment_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. ROW LEVEL SECURITY (RLS) EN AMBAS TABLAS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_blocks ENABLE ROW LEVEL SECURITY;

-- 5.1 POLÍTICAS: public.appointments
-- PRIVACIDAD: Las filas completas de appointments (nombre, teléfono, email, notas)
-- NUNCA son legibles directamente por visitantes anónimos.
DROP POLICY IF EXISTS "appointments_public_read" ON public.appointments;

-- Lectura completa EXCLUSIVA para el administrador del tenant y SuperAdmin
DROP POLICY IF EXISTS "appointments_tenant_select" ON public.appointments;
CREATE POLICY "appointments_tenant_select"
    ON public.appointments FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- Inserción directa (solo si se ejecuta authenticated para su tenant, la inserción pública se canaliza por el endpoint server-side)
DROP POLICY IF EXISTS "appointments_public_insert" ON public.appointments;
DROP POLICY IF EXISTS "appointments_tenant_insert" ON public.appointments;
CREATE POLICY "appointments_tenant_insert"
    ON public.appointments FOR INSERT
    TO authenticated
    WITH CHECK (
        status = 'pending'
        AND (
            tenant_id IN (SELECT get_user_tenant_ids()) 
            OR is_superadmin()
        )
    );

-- Actualización por parte del administrador del comercio (confirmar, rechazar)
DROP POLICY IF EXISTS "appointments_tenant_update" ON public.appointments;
CREATE POLICY "appointments_tenant_update"
    ON public.appointments FOR UPDATE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    )
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- Eliminación por parte del administrador del comercio
DROP POLICY IF EXISTS "appointments_tenant_delete" ON public.appointments;
CREATE POLICY "appointments_tenant_delete"
    ON public.appointments FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- 5.2 POLÍTICAS: public.appointment_blocks
-- PRIVACIDAD: La tabla appointment_blocks y su columna 'reason' e 'is_external'
-- NUNCA son legibles directamente por visitantes anónimos.
DROP POLICY IF EXISTS "appointment_blocks_public_read" ON public.appointment_blocks;

-- Lectura completa EXCLUSIVA para el administrador del tenant y SuperAdmin
DROP POLICY IF EXISTS "appointment_blocks_tenant_select" ON public.appointment_blocks;
CREATE POLICY "appointment_blocks_tenant_select"
    ON public.appointment_blocks FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- Inserción exclusiva del administrador del tenant
DROP POLICY IF EXISTS "appointment_blocks_tenant_insert" ON public.appointment_blocks;
CREATE POLICY "appointment_blocks_tenant_insert"
    ON public.appointment_blocks FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- Modificación exclusiva del administrador del tenant
DROP POLICY IF EXISTS "appointment_blocks_tenant_update" ON public.appointment_blocks;
CREATE POLICY "appointment_blocks_tenant_update"
    ON public.appointment_blocks FOR UPDATE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    )
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- Eliminación exclusiva del administrador del tenant
DROP POLICY IF EXISTS "appointment_blocks_tenant_delete" ON public.appointment_blocks;
CREATE POLICY "appointment_blocks_tenant_delete"
    ON public.appointment_blocks FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids()) 
        OR is_superadmin()
    );

-- ============================================================================
-- 6. FUNCIÓN DE CONSULTA PÚBLICA SEGURA DE INTERVALOS OCUPADOS (PRIVACIDAD 100%)
-- Retorna ÚNICAMENTE start_time y duration_minutes.
-- Cero datos personales de clientes ni motivos de bloqueo administrativo.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_public_occupied_intervals(
    p_tenant_id UUID,
    p_professional_id UUID,
    p_date DATE
)
RETURNS TABLE (
    start_time VARCHAR(10),
    duration_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Validar que la tienda exista y esté activa o en prueba
    IF NOT EXISTS (
        SELECT 1 FROM public.stores s 
        WHERE s.id = p_tenant_id AND s.status IN ('activo', 'prueba')
    ) THEN
        RETURN;
    END IF;

    -- 2. Validar que el profesional pertenezca al tenant y esté activo
    IF NOT EXISTS (
        SELECT 1 FROM public.professionals p 
        WHERE p.id = p_professional_id AND p.tenant_id = p_tenant_id AND p.is_active = true
    ) THEN
        RETURN;
    END IF;

    -- 3. Retornar franja y duración de citas activas (pending, confirmed)
    RETURN QUERY
    SELECT a.start_time, a.duration_minutes
    FROM public.appointments a
    WHERE a.tenant_id = p_tenant_id
      AND a.professional_id = p_professional_id
      AND a.date = p_date
      AND a.status IN ('pending', 'confirmed')

    UNION ALL

    -- 4. Retornar franja y duración de bloqueos manuales
    SELECT b.start_time, b.duration_minutes
    FROM public.appointment_blocks b
    WHERE b.tenant_id = p_tenant_id
      AND b.professional_id = p_professional_id
      AND b.date = p_date;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_occupied_intervals(UUID, UUID, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_occupied_intervals(UUID, UUID, DATE) TO anon, authenticated, service_role;

-- ============================================================================
-- 7. FUNCIÓN ATÓMICA DE CREACIÓN DE CITAS CON PROTECCIÓN DE CONCURRENCIA
-- Utiliza pg_advisory_xact_lock para serializar reservas sobre el mismo
-- profesional y fecha a nivel del motor relacional de Postgres.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_appointment_atomic(
    p_id UUID,
    p_tenant_id UUID,
    p_service_id UUID,
    p_service_name VARCHAR(255),
    p_professional_id UUID,
    p_professional_name VARCHAR(150),
    p_customer_name VARCHAR(150),
    p_customer_phone VARCHAR(50),
    p_customer_email VARCHAR(150),
    p_date DATE,
    p_start_time VARCHAR(10),
    p_duration_minutes INTEGER,
    p_notes TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lock_key BIGINT;
    v_req_start_m INTEGER;
    v_req_end_m INTEGER;
    v_inserted_row public.appointments%ROWTYPE;
    v_h INTEGER;
    v_m INTEGER;
BEGIN
    -- 1. Bloqueo transaccional exclusivo para el par (profesional, fecha)
    v_lock_key := ('x' || substr(md5(p_professional_id::text || p_date::text), 1, 15))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- 2. Minutos de inicio y fin solicitados
    v_h := split_part(p_start_time, ':', 1)::integer;
    v_m := split_part(p_start_time, ':', 2)::integer;
    v_req_start_m := v_h * 60 + v_m;
    v_req_end_m := v_req_start_m + p_duration_minutes;

    -- 3. Comprobar solapamiento contra citas existentes activas (pending, confirmed)
    IF EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.professional_id = p_professional_id
          AND a.date = p_date
          AND a.status IN ('pending', 'confirmed')
          AND (
              v_req_start_m < (split_part(a.start_time, ':', 1)::integer * 60 + split_part(a.start_time, ':', 2)::integer + a.duration_minutes)
              AND v_req_end_m > (split_part(a.start_time, ':', 1)::integer * 60 + split_part(a.start_time, ':', 2)::integer)
          )
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'OVERLAP_CONFLICT_APPOINTMENT',
            'message', 'El horario seleccionado ya no está disponible (ha sido reservado por otro cliente).'
        );
    END IF;

    -- 4. Comprobar solapamiento contra bloqueos manuales
    IF EXISTS (
        SELECT 1 FROM public.appointment_blocks b
        WHERE b.professional_id = p_professional_id
          AND b.date = p_date
          AND (
              v_req_start_m < (split_part(b.start_time, ':', 1)::integer * 60 + split_part(b.start_time, ':', 2)::integer + b.duration_minutes)
              AND v_req_end_m > (split_part(b.start_time, ':', 1)::integer * 60 + split_part(b.start_time, ':', 2)::integer)
          )
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'OVERLAP_CONFLICT_BLOCK',
            'message', 'El horario seleccionado se encuentra bloqueado por la administración.'
        );
    END IF;

    -- 5. Inserción atómica garantizada libre de colisiones concurrentes
    INSERT INTO public.appointments (
        id,
        tenant_id,
        service_id,
        service_name,
        professional_id,
        professional_name,
        customer_name,
        customer_phone,
        customer_email,
        date,
        start_time,
        duration_minutes,
        status,
        notes
    ) VALUES (
        COALESCE(p_id, gen_random_uuid()),
        p_tenant_id,
        p_service_id,
        p_service_name,
        p_professional_id,
        p_professional_name,
        p_customer_name,
        p_customer_phone,
        COALESCE(p_customer_email, ''),
        p_date,
        p_start_time,
        p_duration_minutes,
        'pending',
        COALESCE(p_notes, '')
    ) RETURNING * INTO v_inserted_row;

    RETURN jsonb_build_object(
        'success', true,
        'appointment', to_jsonb(v_inserted_row)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.create_appointment_atomic(UUID, UUID, UUID, VARCHAR, UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, VARCHAR, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_appointment_atomic(UUID, UUID, UUID, VARCHAR, UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, VARCHAR, INTEGER, TEXT) TO service_role;
