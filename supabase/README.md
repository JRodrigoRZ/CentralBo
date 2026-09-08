# FASE 1 — BASE DE DATOS Y SEGURIDAD (SaaS Marketplace Multi-Tenant)

Esta fase implementa la arquitectura de base de datos PostgreSQL y seguridad con Row Level Security (RLS) en Supabase para el SaaS Marketplace Verticalizado.

---

## 1. Estructura de Archivos

* **`01_schema.sql`**: Tablas, tipos enumerados, restricciones, claves foráneas, índices de alto rendimiento y triggers para `updated_at`.
* **`02_security_rls.sql`**: Funciones auxiliares de seguridad (`SECURITY DEFINER`), activación de RLS en todas las tablas y políticas de acceso multi-tenant.
* **`03_storage.sql`**: Configuración de buckets en Supabase Storage (`store-logos`, `product-images`, `receipts`) y políticas de acceso organizadas por `{tenant_id}/*`.
* **`04_validation_tests.sql`**: Batería de pruebas automatizada para validar el aislamiento multi-tenant y la prevención de inyección cruzada.
* **`complete_phase1_database.sql`**: Script único consolidado para ejecutar todo en un solo clic desde el SQL Editor de Supabase.

---

## 2. Modelo de Datos y Entidades

### 2.1 Comercios (`stores`)
Identifica de forma única cada comercio (tenant):
* `id` (UUID, PK)
* `name` (Nombre del comercio)
* `slug` (Identificador URL amigable)
* `store_type` (`general`, `restaurante`, `moda`, `servicios`)
* `status` (`activo`, `inactivo`, `suspendido`, `prueba`)
* `logo_url` (Ruta en storage)
* `created_at`, `updated_at` (Timestamps automáticos)

### 2.2 Usuarios del Comercio (`store_users`)
Vincula cuentas de usuario (`auth.users`) con comercios:
* `id` (UUID, PK)
* `tenant_id` (UUID, FK a `stores`)
* `user_id` (UUID, FK a `auth.users`)
* `role` (`admin`, `staff`, `superadmin`)
* `full_name`, `email`, `is_active`
* Restricción única: `(tenant_id, user_id)`

### 2.3 Categorías (`categories`)
* `id` (UUID, PK)
* `tenant_id` (UUID, FK a `stores`)
* `name` (Nombre de la categoría)
* `status` (`activo`, `inactivo`)

### 2.4 Productos (`products`)
Soporta las particularidades de diferentes verticales mediante JSONB:
* `id` (UUID, PK)
* `tenant_id` (UUID, FK a `stores`)
* `category_id` (UUID, FK opcional a `categories`)
* `name`, `description`
* `price` (NUMERIC(12,2) con CHECK >= 0)
* `is_available` (BOOLEAN)
* `image_url` (TEXT)
* `status` (`activo`, `inactivo`, `borrador`)
* `attributes` (JSONB):
  * **Restaurante**: `{"ingredientes": [...], "alergenos": [...], "tiempo_preparacion": 15}`
  * **Moda**: `{"talla": "M", "color": "Azul", "guia_tallas": "..."}`
  * **Servicios**: `{"duracion_minutos": 60, "modalidad": "presencial"}`

### 2.5 Pedidos (`orders`)
* `id` (UUID, PK)
* `tenant_id` (UUID, FK a `stores`)
* `customer_id` (UUID, cliente opcional o autenticado)
* `customer_name`, `customer_email`, `customer_phone`
* `status` (`pendiente`, `recibido`, `pagado`, `en_preparacion`, `despachado`, `completado`, `cancelado`)
* `total` (NUMERIC(12,2) con CHECK >= 0)

### 2.6 Detalle de Pedidos (`order_items`)
* `id` (UUID, PK)
* `tenant_id` (UUID, FK a `stores` para control multi-tenant directo)
* `order_id` (UUID, FK a `orders`)
* `product_id` (UUID, FK a `products`)
* `quantity` (INT con CHECK > 0)
* `unit_price` (NUMERIC(12,2) con CHECK >= 0, precio congelado al momento de la compra)

---

## 3. Modelo de Seguridad Multi-Tenant y RLS

1. **Aislamiento por Tenant (`tenant_id`)**:
   Todas las tablas de negocio incluyen `tenant_id`. La función `get_user_tenant_ids()` evalúa qué comercios pertenecen al usuario logueado en `auth.uid()`.
2. **Políticas RLS**:
   * **Lectura/Escritura de Administrador**: Solamente puede consultar, insertar, modificar o eliminar registros con su propio `tenant_id`.
   * **Bloqueo Cross-Tenant**: Intentar insertar o actualizar un registro con el `tenant_id` de otro comercio es rechazado a nivel de base de datos por la cláusula `WITH CHECK`.
   * **Catálogo Público**: Usuarios anónimos o clientes pueden consultar tiendas y productos siempre y cuando `status = 'activo'` e `is_available = true`.
   * **Privacidad de Usuarios y Pedidos**: Tablas como `store_users` y `orders` están completamente bloqueadas para consultas anónimas.
   * **SuperAdmin**: Permisos globales basados en `is_superadmin()`.

---

## 4. Estructura de Storage

| Bucket | Visibilidad | Tipos Permitidos | Propósito | Regla de Carpetas |
|---|---|---|---|---|
| `store-logos` | Público | png, jpeg, webp, svg | Logos de comercios | `{tenant_id}/*` |
| `product-images` | Público | png, jpeg, webp | Fotos de productos | `{tenant_id}/*` |
| `receipts` | **Privado** | png, jpeg, webp, pdf | Comprobantes de pago | `{tenant_id}/*` (Solo admin del comercio y cliente) |

---

## 5. Instancia de Supabase Configurada

* **URL del Proyecto**: `https://wuerdwkcpurbtcwyqjep.supabase.co`
* **Public/Publishable Key**: `sb_publishable_CaupILScNyFk_Kwk-oda_Q_gWniqb4g`
* Las variables han sido configuradas de manera segura en el entorno (`.env` y `BuildConfig.SUPABASE_URL`, `BuildConfig.SUPABASE_PUBLISHABLE_KEY`).

---

## 6. Instrucciones de Despliegue y Pruebas

### Paso 1: Ejecutar la Migración
1. Abre tu proyecto en Supabase Dashboard (`https://wuerdwkcpurbtcwyqjep.supabase.co`).
2. Ve a **SQL Editor**.
3. Copia y pega el contenido de `complete_phase1_database.sql`.
4. Haz clic en **Run**.

### Paso 2: Ejecutar las Pruebas de Validación
1. En el mismo **SQL Editor**, abre una nueva consulta.
2. Pega el contenido de `04_validation_tests.sql`.
3. Haz clic en **Run**.
4. En el panel de **Messages** (Logs) de PostgreSQL verás:
   * Creación de 2 comercios de prueba (`v_tenant_a` y `v_tenant_b`).
   * Validación de aislamiento para Admin A (solo ve sus productos).
   * Verificación de acceso denegado a usuarios y pedidos de Tenant B.
   * Rechazo exitoso de inyecciones cruzadas de `tenant_id`.
   * Protección de datos confidenciales ante clientes anónimos.

