-- ============================================================================
-- CENTRALBO — MIGRACIÓN AUTORIZADA: MÓDULO MI TIENDA → HORARIOS
-- Objetivo: Persistencia centralizada de datos de horarios en stores
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '[]'::jsonb;
