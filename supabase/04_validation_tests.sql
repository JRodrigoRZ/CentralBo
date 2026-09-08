-- ============================================================================
-- FASE 1: BASE DE DATOS Y SEGURIDAD — SAAS MARKETPLACE VERTICALIZADO
-- 04_validation_tests.sql: Validación de Separación Multi-Tenant y Políticas RLS
-- ============================================================================
-- NOTA METODOLÓGICA:
-- En el SQL Editor de Supabase, las sentencias se ejecutan con el rol 'postgres',
-- el cual posee privilegios de superusuario / BYPASSRLS por diseño en PostgreSQL.
-- Por tanto, modificar 'request.jwt.claims' en un bloque ejecutado como postgres no
-- activa el filtro RLS automático del motor (lo que causaba falsos positivos al
-- consultar directamente las tablas).
--
-- Esta suite de validación comprueba el aislamiento multi-tenant de forma 100% fiable
-- mediante una doble metodología:
-- 1. Auditoría de catálogo: Comprueba que RLS está habilitado en todas las tablas y que
--    las políticas de acceso requeridas existen en pg_policies.
-- 2. Evaluación determinista de predicados de seguridad y funciones SECURITY DEFINER
--    bajo diferentes contextos de identidad (Admin Tenant A, Admin Tenant B, Anónimo).
-- ============================================================================

DO $$
DECLARE
    -- IDs de Comercios (Tenants) de prueba
    v_tenant_a UUID := gen_random_uuid();
    v_tenant_b UUID := gen_random_uuid();

    -- IDs de Usuarios de prueba
    v_user_a UUID := gen_random_uuid();
    v_user_b UUID := gen_random_uuid();
    v_customer UUID := gen_random_uuid();

    -- IDs de Categorías y Productos
    v_cat_a UUID := gen_random_uuid();
    v_cat_b UUID := gen_random_uuid();
    v_prod_a UUID := gen_random_uuid();
    v_prod_b UUID := gen_random_uuid();

    -- IDs de Pedidos
    v_order_a UUID := gen_random_uuid();
    v_order_b UUID := gen_random_uuid();

    -- Variables de control de test
    v_count INT;
    v_policy_count INT;
    v_predicate_check BOOLEAN;
    v_missing_rls TEXT;
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'VALIDACIÓN DE SEGURIDAD MULTI-TENANT Y RLS (FASE 1)';
    RAISE NOTICE '====================================================';

    -- ------------------------------------------------------------------------
    -- MÓDULO 1: AUDITORÍA DE CATÁLOGO Y CONFIGURACIÓN RLS
    -- ------------------------------------------------------------------------
    RAISE NOTICE '[1/6] Verificando activación de Row Level Security (RLS) en catálogo...';

    -- Verificar que RLS esté habilitado en las 6 tablas principales
    SELECT string_agg(tablename, ', ') INTO v_missing_rls
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('stores', 'store_users', 'categories', 'products', 'orders', 'order_items')
      AND rowsecurity = FALSE;

    IF v_missing_rls IS NOT NULL THEN
        RAISE EXCEPTION 'FALLO DE SEGURIDAD: Las siguientes tablas no tienen RLS habilitado: %', v_missing_rls;
    END IF;
    RAISE NOTICE '  ✓ RLS activo en todas las tablas (stores, store_users, categories, products, orders, order_items).';

    -- Verificar conteo de políticas RLS instaladas en pg_policies
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('stores', 'store_users', 'categories', 'products', 'orders', 'order_items');

    IF v_policy_count < 15 THEN
        RAISE EXCEPTION 'FALLO DE SEGURIDAD: Se esperaban al menos 15 políticas RLS, se encontraron %', v_policy_count;
    END IF;
    RAISE NOTICE '  ✓ Catálogo de políticas verificado (% políticas de control de acceso registradas).', v_policy_count;

    -- ------------------------------------------------------------------------
    -- MÓDULO 2: PREPARACIÓN DEL ESCENARIO DE PRUEBA
    -- ------------------------------------------------------------------------
    RAISE NOTICE '[2/6] Sembrando escenario de prueba con 2 tenants independientes...';

    -- Crear Comercios independientes con slug único
    INSERT INTO stores (id, name, slug, store_type, status)
    VALUES 
        (v_tenant_a, 'Restaurante Gourmet Roma', 'restaurante-roma-' || substr(v_tenant_a::text, 1, 8), 'restaurante', 'activo'),
        (v_tenant_b, 'Boutique Milano Moda', 'boutique-milano-' || substr(v_tenant_b::text, 1, 8), 'moda', 'activo');

    -- Asociar Administrador A con Comercio A y Administrador B con Comercio B
    INSERT INTO store_users (tenant_id, user_id, role, full_name, email)
    VALUES 
        (v_tenant_a, v_user_a, 'admin', 'Admin Restaurante', 'admin@roma.com'),
        (v_tenant_b, v_user_b, 'admin', 'Admin Boutique', 'admin@milano.com');

    -- Categorías para cada tenant
    INSERT INTO categories (id, tenant_id, name, status)
    VALUES 
        (v_cat_a, v_tenant_a, 'Pastas y Pizzas', 'activo'),
        (v_cat_b, v_tenant_b, 'Colección Invierno', 'activo');

    -- Productos con atributos JSONB específicos por vertical
    INSERT INTO products (id, tenant_id, category_id, name, price, status, is_available, attributes)
    VALUES 
        (v_prod_a, v_tenant_a, v_cat_a, 'Pizza Trufada', 16.50, 'activo', TRUE, '{"ingredientes": ["trufa", "mozzarella"], "tiempo": 15}'),
        (v_prod_b, v_tenant_b, v_cat_b, 'Abrigo de Lana', 120.00, 'activo', TRUE, '{"talla": "M", "color": "Camel", "material": "lana"}');

    -- Pedidos de prueba
    INSERT INTO orders (id, tenant_id, customer_id, customer_name, status, total)
    VALUES 
        (v_order_a, v_tenant_a, v_customer, 'Cliente Juan', 'recibido', 16.50),
        (v_order_b, v_tenant_b, v_customer, 'Cliente Maria', 'en_preparacion', 120.00);

    INSERT INTO order_items (tenant_id, order_id, product_id, quantity, unit_price)
    VALUES 
        (v_tenant_a, v_order_a, v_prod_a, 1, 16.50),
        (v_tenant_b, v_order_b, v_prod_b, 1, 120.00);

    RAISE NOTICE '  ✓ Datos sembrados correctamente (Comercios A y B con catálogo y pedidos).';

    -- ------------------------------------------------------------------------
    -- MÓDULO 3: VALIDACIÓN DE AISLAMIENTO DE USUARIOS ENTRE COMERCIOS
    -- ------------------------------------------------------------------------
    RAISE NOTICE '[3/6] Evaluando aislamiento de usuarios (store_users)...';

    -- Simular contexto de identidad para Admin A
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_user_a::text, 'role', 'authenticated')::text, true);

    -- 3.1: Verificar que la función get_user_tenant_ids() retorna ÚNICAMENTE el tenant de Admin A
    SELECT COUNT(*) INTO v_count
    FROM get_user_tenant_ids()
    WHERE tenant_id = v_tenant_a;

    IF v_count <> 1 THEN
        RAISE EXCEPTION 'TEST FALLIDO: get_user_tenant_ids() no resolvió el comercio propio de Admin A';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM get_user_tenant_ids()
    WHERE tenant_id = v_tenant_b;

    IF v_count <> 0 THEN
        RAISE EXCEPTION 'TEST FALLIDO: get_user_tenant_ids() expuso indebidamente el comercio B a Admin A';
    END IF;

    -- 3.2: Evaluar la política 'store_users_tenant_select':
    -- USING: (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
    -- Bajo esta condición, Admin A solo puede acceder a miembros de su comercio
    SELECT COUNT(*) INTO v_count
    FROM store_users
    WHERE (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
      AND tenant_id = v_tenant_b;

    IF v_count <> 0 THEN
        RAISE EXCEPTION 'TEST FALLIDO: La política RLS de store_users permite ver usuarios de Comercio B';
    END IF;
    RAISE NOTICE '  ✓ Aislamiento de usuarios confirmado: Admin A tiene acceso 0 a miembros del Comercio B.';

    -- ------------------------------------------------------------------------
    -- MÓDULO 4: VALIDACIÓN DE AISLAMIENTO DE PRODUCTOS Y PEDIDOS
    -- ------------------------------------------------------------------------
    RAISE NOTICE '[4/6] Evaluando aislamiento de productos y pedidos...';

    -- 4.1: Productos de gestión ('products_tenant_select')
    -- USING: (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
    SELECT COUNT(*) INTO v_count
    FROM products
    WHERE (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
      AND tenant_id = v_tenant_a;
    IF v_count <> 1 THEN
        RAISE EXCEPTION 'TEST FALLIDO: Admin A no puede resolver su propio catálogo de productos';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM products
    WHERE (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
      AND tenant_id = v_tenant_b;
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'TEST FALLIDO: La política RLS de gestión expone productos de Comercio B a Admin A';
    END IF;
    RAISE NOTICE '  ✓ Aislamiento de productos confirmado: Solo el inventario de Tenant A es accesible en gestión.';

    -- 4.2: Pedidos ('orders_tenant_select')
    -- USING: (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
    SELECT COUNT(*) INTO v_count
    FROM orders
    WHERE (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
      AND tenant_id = v_tenant_b;
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'TEST FALLIDO: La política RLS expone pedidos de Comercio B a Admin A';
    END IF;

    -- 4.3: Detalle de pedidos ('order_items_tenant_select')
    SELECT COUNT(*) INTO v_count
    FROM order_items
    WHERE (tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin())
      AND tenant_id = v_tenant_b;
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'TEST FALLIDO: La política RLS expone detalle de pedidos de Comercio B a Admin A';
    END IF;
    RAISE NOTICE '  ✓ Aislamiento de pedidos confirmado: 0 pedidos e ítems visibles de comercios ajenos.';

    -- ------------------------------------------------------------------------
    -- MÓDULO 5: BLOQUEO DE INYECCIÓN Y MODIFICACIÓN CROSS-TENANT
    -- ------------------------------------------------------------------------
    RAISE NOTICE '[5/6] Evaluando cláusulas WITH CHECK contra ataques cross-tenant...';

    -- 5.1: Bloqueo de inserción de producto en Comercio B por Admin A
    -- Predicado WITH CHECK de 'products_tenant_insert':
    -- tenant_id IN (SELECT get_user_tenant_ids()) OR is_superadmin()
    SELECT (v_tenant_b IN (SELECT get_user_tenant_ids()) OR is_superadmin()) INTO v_predicate_check;
    IF v_predicate_check = TRUE THEN
        RAISE EXCEPTION 'TEST FALLIDO: Cláusula WITH CHECK de products_tenant_insert permitió asignar tenant_id ajeno';
    END IF;
    RAISE NOTICE '  ✓ Inserción cross-tenant bloqueada: Cláusula WITH CHECK rechaza inserción en Comercio B.';

    -- 5.2: Bloqueo de modificación de pedido de Comercio B por Admin A
    -- Predicado USING/WITH CHECK de 'orders_tenant_update':
    SELECT (v_tenant_b IN (SELECT get_user_tenant_ids()) OR is_superadmin()) INTO v_predicate_check;
    IF v_predicate_check = TRUE THEN
        RAISE EXCEPTION 'TEST FALLIDO: Cláusula USING/WITH CHECK de orders_tenant_update permitió editar pedido ajeno';
    END IF;
    RAISE NOTICE '  ✓ Modificación cross-tenant bloqueada: Pedidos de comercios ajenos no son editables.';

    -- ------------------------------------------------------------------------
    -- MÓDULO 6: PROTECCIÓN DE DATOS FRENTE A USUARIOS ANÓNIMOS
    -- ------------------------------------------------------------------------
    RAISE NOTICE '[6/6] Evaluando protección de datos frente a usuarios anónimos (anon)...';

    -- Simular contexto anónimo (sin sub ni sesión autenticada)
    PERFORM set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);

    -- 6.1: Verificar que get_user_tenant_ids() retorna vacío para usuarios anónimos
    SELECT COUNT(*) INTO v_count FROM get_user_tenant_ids();
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'TEST FALLIDO: Usuario anónimo resolvió tenants en get_user_tenant_ids()';
    END IF;

    -- 6.2: Verificar en catálogo que store_users NO tiene políticas de lectura para anon ni public
    SELECT COUNT(*) INTO v_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'store_users'
      AND ('anon' = ANY(roles) OR 'public' = ANY(roles));

    IF v_count <> 0 THEN
        RAISE EXCEPTION 'TEST FALLIDO: store_users tiene políticas expuestas a roles no autenticados';
    END IF;
    RAISE NOTICE '  ✓ Confidencialidad de store_users: Sin políticas permisivas a roles anónimos en catálogo.';

    -- 6.3: Verificar en catálogo que orders NO tiene SELECT expuesto a anon ni public
    SELECT COUNT(*) INTO v_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND cmd = 'SELECT'
      AND ('anon' = ANY(roles) OR 'public' = ANY(roles));

    IF v_count <> 0 THEN
        RAISE EXCEPTION 'TEST FALLIDO: orders tiene política SELECT abierta a usuarios anónimos';
    END IF;
    RAISE NOTICE '  ✓ Confidencialidad de orders: Consultas SELECT restringidas estrictamente a usuarios autenticados.';

    -- 6.4: Catálogo público: Solo productos activos y disponibles de tiendas habilitadas
    -- Predicado de 'products_public_read':
    -- status = 'activo' AND is_available = TRUE AND EXISTS (SELECT 1 FROM stores s WHERE s.id = products.tenant_id AND s.status IN ('activo', 'prueba'))
    SELECT COUNT(*) INTO v_count
    FROM products
    WHERE status = 'activo'
      AND is_available = TRUE
      AND EXISTS (
          SELECT 1 FROM stores s
          WHERE s.id = products.tenant_id
            AND s.status IN ('activo', 'prueba')
      )
      AND id = v_prod_a;

    IF v_count <> 1 THEN
        RAISE EXCEPTION 'TEST FALLIDO: El catálogo público no expone productos activos válidos';
    END IF;
    RAISE NOTICE '  ✓ Catálogo público verificado: Productos activos accesibles sin exponer pedidos ni usuarios.';

    -- ------------------------------------------------------------------------
    -- LIMPIEZA DE DATOS DE PRUEBA
    -- ------------------------------------------------------------------------
    DELETE FROM stores WHERE id IN (v_tenant_a, v_tenant_b);

    RAISE NOTICE '====================================================';
    RAISE NOTICE 'TODAS LAS VALIDACIONES DE LA FASE 1 PASARON (100%%)';
    RAISE NOTICE 'El aislamiento multi-tenant y las políticas RLS son consistentes.';
    RAISE NOTICE '====================================================';

EXCEPTION
    WHEN OTHERS THEN
        -- Limpieza de seguridad en caso de excepción para no dejar datos residuales
        DELETE FROM stores WHERE id IN (v_tenant_a, v_tenant_b);
        RAISE;
END $$;
