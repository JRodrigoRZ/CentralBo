-- ============================================================================
-- CENTRALBO — MIGRACIÓN AUTORIZADA: MÓDULO MI TIENDA → APARIENCIA
-- Objetivo: Persistencia centralizada de datos de apariencia en stores
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS appearance JSONB DEFAULT '{}'::jsonb;
