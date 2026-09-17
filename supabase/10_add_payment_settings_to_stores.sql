-- ============================================================================
-- CENTRALBO — MIGRACIÓN AUTORIZADA: MÓDULO MI TIENDA → MÉTODOS DE PAGO
-- Objetivo: Persistencia centralizada de métodos de pago en stores
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS payment_settings JSONB DEFAULT '{}'::jsonb;
