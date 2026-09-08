-- ============================================================================
-- FASE 1: BASE DE DATOS Y SEGURIDAD — SAAS MARKETPLACE VERTICALIZADO
-- 02_security_rls.sql: Row Level Security (RLS) y Políticas Multi-Tenant
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FUNCIONES HELPER DE SEGURIDAD (SECURITY DEFINER)
-- Se ejecutan con los privilegios del creador para evitar bucles recursivos en RLS.
-- ----------------------------------------------------------------------------

-- Retorna el conjunto de tenant_id asociados al usuario autenticado actual
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS TABLE (tenant_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT su.tenant_id
    FROM store_users su
    WHERE su.user_id = auth.uid()
      AND su.is_active = TRUE;
END;
$$;

-- Verifica si el usuario actual es SuperAdmin de la plataforma
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN (
        -- Verificación por registro explícito en store_users
        EXISTS (
            SELECT 1
            FROM store_users su
            WHERE su.user_id = auth.uid()
              AND su.role = 'superadmin'
              AND su.is_active = TRUE
        )
        -- O mediante claim/role en el JWT de Supabase
        OR (coalesce(auth.jwt()->>'role', '') = 'superadmin')
    );
END;
$$;

-- Verifica si el usuario actual es administrador de un comercio específico
CREATE OR REPLACE FUNCTION is_tenant_admin(check_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN (
        is_superadmin()
        OR EXISTS (
            SELECT 1
            FROM store_users su
            WHERE su.tenant_id = check_tenant_id
              AND su.user_id = auth.uid()
              AND su.role IN ('admin', 'superadmin')
              AND su.is_active = TRUE
        )
    );
END;
$$;

-- Verifica si el usuario actual pertenece a un comercio específico (cualquier rol activo)
CREATE OR REPLACE FUNCTION is_tenant_member(check_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN (
        is_superadmin()
        OR EXISTS (
            SELECT 1
            FROM store_users su
            WHERE su.tenant_id = check_tenant_id
              AND su.user_id = auth.uid()
              AND su.is_active = TRUE
        )
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ----------------------------------------------------------------------------
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. POLÍTICAS: COMERCIOS (stores)
-- ----------------------------------------------------------------------------

-- Público: Puede consultar comercios activos o en prueba para mostrarlos en el marketplace
CREATE POLICY "stores_public_read"
    ON stores FOR SELECT
    TO anon, authenticated
    USING (status IN ('activo', 'prueba'));

-- Administrador del comercio: Puede consultar los datos completos de su comercio
CREATE POLICY "stores_tenant_select"
    ON stores FOR SELECT
    TO authenticated
    USING (id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Administrador del comercio: Puede actualizar la información de su propio comercio
CREATE POLICY "stores_tenant_update"
    ON stores FOR UPDATE
    TO authenticated
    USING (id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
    WITH CHECK (id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- SuperAdmin: Gestión total de inserción y borrado
CREATE POLICY "stores_superadmin_insert"
    ON stores FOR INSERT
    TO authenticated
    WITH CHECK (is_superadmin() OR auth.uid() IS NOT NULL);

CREATE POLICY "stores_superadmin_delete"
    ON stores FOR DELETE
    TO authenticated
    USING (is_superadmin());

-- ----------------------------------------------------------------------------
-- 4. POLÍTICAS: USUARIOS DEL COMERCIO (store_users)
-- Ningún usuario no autenticado ni de otro comercio puede ver esta información.
-- ----------------------------------------------------------------------------

-- Miembros del comercio: Solo pueden consultar usuarios de su mismo comercio
CREATE POLICY "store_users_tenant_select"
    ON store_users FOR SELECT
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Administrador del comercio: Puede registrar usuarios en su propio comercio
CREATE POLICY "store_users_tenant_insert"
    ON store_users FOR INSERT
    TO authenticated
    WITH CHECK (is_tenant_admin(tenant_id) OR is_superadmin());

-- Administrador del comercio: Puede modificar usuarios de su propio comercio
CREATE POLICY "store_users_tenant_update"
    ON store_users FOR UPDATE
    TO authenticated
    USING (is_tenant_admin(tenant_id) OR is_superadmin())
    WITH CHECK (is_tenant_admin(tenant_id) OR is_superadmin());

-- Administrador del comercio: Puede eliminar la vinculación de usuarios de su comercio
CREATE POLICY "store_users_tenant_delete"
    ON store_users FOR DELETE
    TO authenticated
    USING (is_tenant_admin(tenant_id) OR is_superadmin());

-- ----------------------------------------------------------------------------
-- 5. POLÍTICAS: CATEGORÍAS (categories)
-- ----------------------------------------------------------------------------

-- Público: Puede consultar categorías activas de comercios habilitados
CREATE POLICY "categories_public_read"
    ON categories FOR SELECT
    TO anon, authenticated
    USING (
        status = 'activo'
        AND EXISTS (
            SELECT 1 FROM stores s
            WHERE s.id = categories.tenant_id
              AND s.status IN ('activo', 'prueba')
        )
    );

-- Miembros del comercio: Lectura de todas sus categorías (activas o inactivas)
CREATE POLICY "categories_tenant_select"
    ON categories FOR SELECT
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Miembros del comercio: Creación de categorías para su propio tenant
CREATE POLICY "categories_tenant_insert"
    ON categories FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Miembros del comercio: Modificación exclusiva de categorías propias
CREATE POLICY "categories_tenant_update"
    ON categories FOR UPDATE
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Miembros del comercio: Eliminación de categorías propias
CREATE POLICY "categories_tenant_delete"
    ON categories FOR DELETE
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- ----------------------------------------------------------------------------
-- 6. POLÍTICAS: PRODUCTOS (products)
-- ----------------------------------------------------------------------------

-- Público: Consulta de productos activos y disponibles en tiendas habilitadas
CREATE POLICY "products_public_read"
    ON products FOR SELECT
    TO anon, authenticated
    USING (
        status = 'activo'
        AND is_available = TRUE
        AND EXISTS (
            SELECT 1 FROM stores s
            WHERE s.id = products.tenant_id
              AND s.status IN ('activo', 'prueba')
        )
    );

-- Miembros del comercio: Lectura de todo el inventario de su comercio
CREATE POLICY "products_tenant_select"
    ON products FOR SELECT
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Miembros del comercio: Inserción de productos exclusivamente en su tenant_id
CREATE POLICY "products_tenant_insert"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Miembros del comercio: Actualización exclusiva de sus productos
CREATE POLICY "products_tenant_update"
    ON products FOR UPDATE
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Miembros del comercio: Eliminación de sus propios productos
CREATE POLICY "products_tenant_delete"
    ON products FOR DELETE
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- ----------------------------------------------------------------------------
-- 7. POLÍTICAS: PEDIDOS (orders)
-- ----------------------------------------------------------------------------

-- Miembros del comercio: Ver todos los pedidos de su comercio
CREATE POLICY "orders_tenant_select"
    ON orders FOR SELECT
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Miembros del comercio: Actualizar estado de pedidos de su comercio
CREATE POLICY "orders_tenant_update"
    ON orders FOR UPDATE
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Clientes autenticados: Ver únicamente sus propios pedidos
CREATE POLICY "orders_customer_select"
    ON orders FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- Clientes / Visitantes: Crear pedidos para un comercio activo
CREATE POLICY "orders_insert"
    ON orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores s
            WHERE s.id = orders.tenant_id
              AND s.status IN ('activo', 'prueba')
        )
    );

-- ----------------------------------------------------------------------------
-- 8. POLÍTICAS: DETALLE DE PEDIDOS (order_items)
-- ----------------------------------------------------------------------------

-- Miembros del comercio: Ver los ítems de los pedidos de su propio comercio
CREATE POLICY "order_items_tenant_select"
    ON order_items FOR SELECT
    TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin());

-- Clientes autenticados: Ver ítems de sus propios pedidos
CREATE POLICY "order_items_customer_select"
    ON order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
              AND o.customer_id = auth.uid()
        )
    );

-- Inserción de ítems de pedido: Validar coherencia con la cabecera del pedido y tenant
CREATE POLICY "order_items_insert"
    ON order_items FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
              AND o.tenant_id = order_items.tenant_id
        )
    );
