-- ============================================================================
-- FASE 1: BASE DE DATOS Y SEGURIDAD — SAAS MARKETPLACE VERTICALIZADO
-- 01_schema.sql: Tipos, Tablas, Relaciones e Índices
-- ============================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS
-- ----------------------------------------------------------------------------

-- Tipos de tienda (Verticales del marketplace)
DO $$ BEGIN
    CREATE TYPE store_type AS ENUM (
        'general',
        'restaurante',
        'moda',
        'servicios'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estados del comercio
DO $$ BEGIN
    CREATE TYPE store_status AS ENUM (
        'activo',
        'inactivo',
        'suspendido',
        'prueba'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Roles de usuario dentro del comercio
DO $$ BEGIN
    CREATE TYPE store_user_role AS ENUM (
        'admin',
        'staff',
        'superadmin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estado de categorías
DO $$ BEGIN
    CREATE TYPE category_status AS ENUM (
        'activo',
        'inactivo'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estado de productos
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM (
        'activo',
        'inactivo',
        'borrador'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estados de pedidos
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pendiente',
        'recibido',
        'pagado',
        'en_preparacion',
        'despachado',
        'completado',
        'cancelado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. FUNCIÓN PARA ACTUALIZACIÓN AUTOMÁTICA DE updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. TABLA: COMERCIOS (stores)
-- Cada comercio representa un tenant único en la plataforma.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    store_type store_type NOT NULL DEFAULT 'general',
    status store_status NOT NULL DEFAULT 'prueba',
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. TABLA: USUARIOS DEL COMERCIO (store_users)
-- Asocia un usuario de auth.users con un comercio (multi-tenant).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Referencia a auth.users(id) en Supabase
    role store_user_role NOT NULL DEFAULT 'admin',
    full_name VARCHAR(255),
    email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_user UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_store_users_tenant ON store_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_users_user ON store_users(user_id);
CREATE INDEX IF NOT EXISTS idx_store_users_role ON store_users(tenant_id, role);

CREATE TRIGGER trg_store_users_updated_at
    BEFORE UPDATE ON store_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 5. TABLA: CATEGORÍAS (categories)
-- Cada categoría pertenece a un único comercio (tenant_id).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status category_status NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_status ON categories(tenant_id, status);

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. TABLA: PRODUCTOS (products)
-- Cada producto pertenece a un comercio y opcionalmente a una categoría del mismo comercio.
-- El campo attributes (JSONB) permite particularidades por vertical (tallas/colores para moda,
-- alérgenos/ingredientes para restaurantes, duración para servicios) sin romper el esquema.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    status product_status NOT NULL DEFAULT 'activo',
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_status ON products(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_products_tenant_category ON products(tenant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_attributes ON products USING gin(attributes);

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7. TABLA: PEDIDOS (orders)
-- Cada pedido pertenece a un comercio y a un comprador/cliente.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID, -- Opcional: ID del cliente si está autenticado
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    status order_status NOT NULL DEFAULT 'pendiente',
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON orders(tenant_id, created_at DESC);

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 8. TABLA: DETALLE DE PEDIDOS (order_items)
-- Incluye tenant_id para reforzar la consulta directa multi-tenant y aislamiento estricto.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_tenant ON order_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
