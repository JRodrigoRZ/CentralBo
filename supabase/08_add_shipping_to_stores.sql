-- ============================================================================
-- CENTRALBO — MIGRACIÓN AUTORIZADA: MÓDULO MI TIENDA → ENVÍOS
-- Objetivo: Persistencia centralizada de configuración de envíos en stores
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS shipping JSONB DEFAULT '{}'::jsonb;
