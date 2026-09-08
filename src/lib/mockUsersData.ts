/**
 * CentralBo — Conjunto de Datos Simulados (Mock Data) para Testing de Usuarios
 * 
 * Diseñado específicamente para auditar y verificar a fondo el módulo SuperAdmin → Usuarios:
 * 1. 2 SuperAdmins Globales (sin tenantId, acceso plataforma).
 * 2. 6 Administradores de Comercio distribuidos entre 3 comercios reales con tenantId UUID v4:
 *    - Inmobiliaria Central (9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d)
 *    - Propiedades del Valle (8f3a56e2-9c1d-4b8a-b5e7-2c9d0e1f3a5b)
 *    - Urban Rentals (7e2c4b1a-8f9d-4c3e-a1b2-3d4e5f6a7b8c)
 * 3. 4 Clientes públicos vinculados a diferentes comercios.
 * 
 * Casos de borde incluidos:
 * - Nombres largos con títulos profesionales para verificar que no desborde tabla ni tarjeta móvil.
 * - Correos electrónicos extensos con dominios corporativos.
 * - Formato estándar y homogéneo de tenantId en formato UUID v4 para validar la función de copiado.
 */

import { SuperAdminUserRecord } from '../types';

export const MOCK_TENANTS = {
  INMOBILIARIA_CENTRAL: {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    name: 'Inmobiliaria Central',
    slug: 'inmobiliaria-central',
  },
  PROPIEDADES_DEL_VALLE: {
    id: '8f3a56e2-9c1d-4b8a-b5e7-2c9d0e1f3a5b',
    name: 'Propiedades del Valle',
    slug: 'propiedades-valle',
  },
  URBAN_RENTALS: {
    id: '7e2c4b1a-8f9d-4c3e-a1b2-3d4e5f6a7b8c',
    name: 'Urban Rentals',
    slug: 'urban-rentals',
  },
} as const;

export const MOCK_SUPERADMIN_USERS: SuperAdminUserRecord[] = [
  // ==========================================================================
  // GRUPO 1: SUPERADMINS GLOBALES (2) — Acceso Global, sin tenantId
  // ==========================================================================
  {
    id: 'usr-sa-01',
    fullName: 'SuperAdmin CentralBo Principal',
    email: 'superadmin@centralbo.com',
    profile: 'superadmin',
    tenantId: null,
    storeName: null,
    storeSlug: null,
    createdAt: '2026-05-01',
    lastActive: 'En línea ahora',
  },
  {
    id: 'usr-sa-02',
    // Caso de borde: Nombre largo y correo extenso para pruebas de wrapping y no desborde
    fullName: 'Ing. Alejandro Sebastián Montenegro y De La Riva',
    email: 'alejandro.montenegro.auditoria.seguridad.global@centralbo-compliance-systems.bo',
    phone: '+591 71099881',
    profile: 'superadmin',
    tenantId: null,
    storeName: null,
    storeSlug: null,
    createdAt: '2026-05-15',
    lastActive: 'Hace 18 minutos',
  },

  // ==========================================================================
  // GRUPO 2: ADMINISTRADORES DE COMERCIO (6) — Distribuidos en 3 Comercios
  // ==========================================================================

  // Comercio 1: Inmobiliaria Central (2 Administradores)
  {
    id: 'usr-adm-ic-01',
    fullName: 'Lic. María Fernanda Quiroga Zalles',
    email: 'fernanda.quiroga@inmobiliariacentral.bo',
    phone: '+591 77210982',
    profile: 'store_admin',
    tenantId: MOCK_TENANTS.INMOBILIARIA_CENTRAL.id,
    storeName: MOCK_TENANTS.INMOBILIARIA_CENTRAL.name,
    storeSlug: MOCK_TENANTS.INMOBILIARIA_CENTRAL.slug,
    createdAt: '2026-06-10',
    lastActive: 'Hace 12 minutos',
  },
  {
    id: 'usr-adm-ic-02',
    fullName: 'Rodrigo Ignacio Morales Beltrán',
    email: 'rodrigo.morales@inmobiliariacentral.bo',
    phone: '+591 76543219',
    profile: 'store_admin',
    tenantId: MOCK_TENANTS.INMOBILIARIA_CENTRAL.id,
    storeName: MOCK_TENANTS.INMOBILIARIA_CENTRAL.name,
    storeSlug: MOCK_TENANTS.INMOBILIARIA_CENTRAL.slug,
    createdAt: '2026-06-15',
    lastActive: 'Hace 2 horas',
  },

  // Comercio 2: Propiedades del Valle (2 Administradores)
  {
    id: 'usr-adm-pv-01',
    fullName: 'Camila Andrea Torrico Villarroel',
    email: 'camila.torrico@propiedadesdelvalle.com.bo',
    phone: '+591 71298453',
    profile: 'store_admin',
    tenantId: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.id,
    storeName: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.name,
    storeSlug: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.slug,
    createdAt: '2026-07-02',
    lastActive: 'Hace 45 minutos',
  },
  {
    id: 'usr-adm-pv-02',
    // Caso de borde: Nombre muy extenso con doble apellido compuesto y correo largo de gerencia
    fullName: 'Bernardo Francisco de Borja Justiniano y Castedo',
    email: 'bernardo.justiniano.gerencia.operaciones@propiedadesdelvalle.com.bo',
    phone: '+591 73391204',
    profile: 'store_admin',
    tenantId: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.id,
    storeName: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.name,
    storeSlug: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.slug,
    createdAt: '2026-07-08',
    lastActive: 'Hace 1 día',
  },

  // Comercio 3: Urban Rentals (2 Administradores)
  {
    id: 'usr-adm-ur-01',
    fullName: 'Gonzalo Javier Soliz Aramayo',
    email: 'gonzalo.soliz@urbanrentals.bo',
    phone: '+591 78912340',
    profile: 'store_admin',
    tenantId: MOCK_TENANTS.URBAN_RENTALS.id,
    storeName: MOCK_TENANTS.URBAN_RENTALS.name,
    storeSlug: MOCK_TENANTS.URBAN_RENTALS.slug,
    createdAt: '2026-08-01',
    lastActive: 'Hace 5 minutos',
  },
  {
    id: 'usr-adm-ur-02',
    fullName: 'Valeria Stefanie Peñaranda Osinaga',
    email: 'valeria.penaranda@urbanrentals.bo',
    phone: '+591 70182736',
    profile: 'store_admin',
    tenantId: MOCK_TENANTS.URBAN_RENTALS.id,
    storeName: MOCK_TENANTS.URBAN_RENTALS.name,
    storeSlug: MOCK_TENANTS.URBAN_RENTALS.slug,
    createdAt: '2026-08-12',
    lastActive: 'Hace 3 horas',
  },

  // ==========================================================================
  // GRUPO 3: CLIENTES PÚBLICOS (4) — Vinculados a diferentes Comercios
  // ==========================================================================
  {
    id: 'usr-cli-01',
    fullName: 'Carlos Daniel Mendoza Paredes',
    email: 'carlos.mendoza.inquilino.premium@gmail.com',
    phone: '+591 76019283',
    profile: 'public_client',
    tenantId: MOCK_TENANTS.INMOBILIARIA_CENTRAL.id,
    storeName: MOCK_TENANTS.INMOBILIARIA_CENTRAL.name,
    storeSlug: MOCK_TENANTS.INMOBILIARIA_CENTRAL.slug,
    createdAt: '2026-08-10',
    lastActive: 'Hace 35 minutos',
  },
  {
    id: 'usr-cli-02',
    fullName: 'Mariana Lucía Suárez Paz',
    email: 'mariana.suarez.inversionista@outlook.com',
    phone: '+591 71928374',
    profile: 'public_client',
    tenantId: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.id,
    storeName: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.name,
    storeSlug: MOCK_TENANTS.PROPIEDADES_DEL_VALLE.slug,
    createdAt: '2026-08-18',
    lastActive: 'Ayer',
  },
  {
    id: 'usr-cli-03',
    fullName: 'Guillermo Roberto Vaca Díez Cuéllar',
    email: 'guillermo.vaca.diez@corporacion-andina.com',
    phone: '+591 73849201',
    profile: 'public_client',
    tenantId: MOCK_TENANTS.URBAN_RENTALS.id,
    storeName: MOCK_TENANTS.URBAN_RENTALS.name,
    storeSlug: MOCK_TENANTS.URBAN_RENTALS.slug,
    createdAt: '2026-08-22',
    lastActive: 'Hace 4 horas',
  },
  {
    id: 'usr-cli-04',
    // Caso de borde: Cliente con nombre compuesto extenso y correo corporativo largo
    fullName: 'Stephanie Antonella Von Borries Gutiérrez de Armenteros',
    email: 'stephanie.vonborries.contratos.inmobiliarios@alquileryventas-lapaz.bo',
    phone: '+591 77483920',
    profile: 'public_client',
    tenantId: MOCK_TENANTS.INMOBILIARIA_CENTRAL.id,
    storeName: MOCK_TENANTS.INMOBILIARIA_CENTRAL.name,
    storeSlug: MOCK_TENANTS.INMOBILIARIA_CENTRAL.slug,
    createdAt: '2026-08-28',
    lastActive: 'Hace 2 días',
  },
];
