-- ============================================================================
-- CENTRALBO — MIGRACIÓN AUTORIZADA: MÓDULO MI TIENDA → PEDIDOS PROGRAMADOS
-- Objetivo: Persistencia centralizada de pedidos programados en stores
-- Ejecutar en el SQL Editor de Supabase (https://wuerdwkcpurbtcwyqjep.supabase.co)
-- ============================================================================

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS scheduled_orders JSONB DEFAULT '{}'::jsonb;
