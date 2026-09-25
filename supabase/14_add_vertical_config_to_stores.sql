-- ============================================================================
-- CENTRALBO — MIGRACIÓN AUTORIZADA: MÓDULO H-03A
-- Objetivo: Persistencia centralizada de configuraciones específicas por vertical
-- (Gastronomía, Moda, General) en public.stores
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

-- 1. Agregar columna vertical_config si no existe
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS vertical_config JSONB DEFAULT '{}'::jsonb;

-- 2. Asegurar que filas existentes no queden con NULL
UPDATE stores
SET vertical_config = '{}'::jsonb
WHERE vertical_config IS NULL;
