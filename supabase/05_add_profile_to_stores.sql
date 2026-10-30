-- ============================================================================
-- CENTRALBO — MIGRACIÓN AUTORIZADA: MÓDULO MI TIENDA → PERFIL
-- Objetivo: Persistencia centralizada de datos de perfil en stores
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}'::jsonb;
