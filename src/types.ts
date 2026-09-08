/**
 * Tipos globales para CentralBo — SaaS Marketplace Verticalizado & PWA
 * Basado estrictamente en el esquema aprobado de la Fase 1 (/supabase/01_schema.sql)
 */

export type StoreType = 'general' | 'restaurante' | 'moda' | 'servicios';
export type StoreStatus = 'activo' | 'inactivo' | 'suspendido' | 'prueba';
export type StoreUserRole = 'admin' | 'staff' | 'superadmin';
export type CategoryStatus = 'activo' | 'inactivo';
export type ProductStatus = 'activo' | 'inactivo' | 'borrador';
export type OrderStatus =
  | 'pendiente'
  | 'recibido'
  | 'pagado'
  | 'en_preparacion'
  | 'despachado'
  | 'completado'
  | 'cancelado';

export interface Store {
  id: string;
  name: string;
  slug: string | null;
  store_type: StoreType;
  status: StoreStatus;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: StoreUserRole;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  image_url: string | null;
  status: ProductStatus;
  attributes: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  tenant_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

// Estructura de fases del proyecto CentralBo
export interface ProjectPhase {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current_prep' | 'pending';
  badge: string;
}

// Estado de verificación PWA
export interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isOnline: boolean;
  hasServiceWorker: boolean;
}

// ----------------------------------------------------------------------------
// MÓDULO 2: AUTENTICACIÓN Y ROUTER MULTI-TENANT
// ----------------------------------------------------------------------------

/**
 * Exactamente los 3 perfiles definidos en el Módulo 2:
 * 1. SuperAdmin Global
 * 2. Administrador del Comercio
 * 3. Cliente / comprador público
 */
export type CentralBoProfile = 'superadmin' | 'store_admin' | 'public_client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  profile: CentralBoProfile;
  // Solo aplicable a 'store_admin'
  tenantId: string | null;
  store: Store | null;
  // Rol específico dentro del esquema de Fase 1 ('admin' | 'staff' | 'superadmin')
  storeRole: StoreUserRole | null;
}

export type AppRoute =
  | { type: 'home' }
  | { type: 'login'; redirect?: string }
  | { type: 'activar'; token: string }
  | { type: 'public_store'; slug: string }
  | { type: 'superadmin' }
  | { type: 'store_admin'; tenantId?: string }
  | {
      type: 'unauthorized';
      reason: string;
      attemptedPath: string;
      requiredRole?: string;
      userTenantId?: string | null;
      targetTenantId?: string | null;
    };

// Estados oficiales de la invitación (únicamente estos dos)
export type InvitationStatus = 'Invitación pendiente' | 'Acceso activado';

export interface StoreOwnerInvitation {
  id: string;
  token: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: InvitationStatus;
  createdAt: string;
  activatedAt?: string;
  passwordHash?: string;
}

// ----------------------------------------------------------------------------
// MÓDULO 3: PANEL SUPERADMIN GLOBAL
// ----------------------------------------------------------------------------

export type SuperAdminSection =
  | 'dashboard'
  | 'comercios'
  | 'usuarios'
  | 'planes'
  | 'suscripciones'
  | 'actividad'
  | 'configuracion';

export type PlanId = 'basic' | 'pro';
export type PlanBillingCycle = 'mensual' | 'semestral' | 'anual';
export type SubscriptionStatus = 'activa' | 'prueba' | 'vencida' | 'cancelada';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  monthlyPrice: number; // Bs 49 o Bs 99
  description: string;
  features: string[];
  restrictions: string[];
  semiannualDiscountPercent: number; // 10%
  annualDiscountPercent: number; // 20%
}

export interface PaymentHistoryRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  period: string;
  status: 'completado' | 'procesado';
  reference: string;
}

export interface StoreOwnerDetails {
  name: string;
  email: string;
  phone: string;
  socials?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface StoreActivityDetails {
  visitas: number;
  pedidos: number;
  productos: number;
  ventas: number; // en Bs
  ultimaActividad: string;
}

export interface StoreSubscriptionDetails {
  planId: PlanId;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  renewalDate: string;
  billingCycle: PlanBillingCycle;
  paymentHistory: PaymentHistoryRecord[];
}

export interface SuperAdminStoreRecord extends Store {
  owner: StoreOwnerDetails;
  subscription: StoreSubscriptionDetails;
  activity: StoreActivityDetails;
}

export interface SuperAdminUserRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profile: CentralBoProfile; // exactamente los 3 perfiles
  tenantId: string | null;
  storeName: string | null;
  storeSlug?: string | null;
  createdAt: string;
  lastActive: string;
}

// ----------------------------------------------------------------------------
// MÓDULO 4: PANEL ADMIN DE TIENDA
// ----------------------------------------------------------------------------

export type StoreAdminTab =
  | 'inicio'
  | 'mi_tienda'
  | 'catalogo'
  | 'pedidos'
  | 'promociones'
  | 'estadisticas';

export type StoreAdminSubTabMiTienda =
  | 'perfil'
  | 'apariencia'
  | 'horarios'
  | 'envios'
  | 'programados'
  | 'pagos'
  | 'contacto';

export type StoreAdminSubTabCatalogo =
  | 'productos'
  | 'categorias'
  | 'config_especifica';

export interface StoreSocials {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
}

export interface StoreProfileSettings {
  logoUrl: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  attentionInfo: string;
  socials: StoreSocials;
}

export interface StoreAppearanceSettings {
  theme: 'light' | 'dark';
  // Exclusivo Plan Pro
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  brandAccentColor: string;
  customDomain: string;
  domainVerified: boolean;
  visualStyle: 'modern' | 'minimal' | 'elegant';
}

export interface StoreSchedulePeriod {
  open: string;
  close: string;
}

export interface StoreScheduleDay {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  dayName: string;
  isOpen: boolean;
  periods: StoreSchedulePeriod[];
}

export interface StoreShippingSettings {
  offersShipping: boolean;
  shippingType: 'free' | 'fixed';
  fixedCost: number; // en Bs
  minOrderAmount: number; // en Bs
  maxOrderAmount: number; // en Bs (0 = sin límite)
  availableDays: string[];
  availableHours: string;
}

export interface StoreScheduledOrdersSettings {
  enabled: boolean;
  minAdvanceHours: number; // Anticipación mínima en horas
  maxAdvanceDays: number; // Días máximos a futuro
  availableSlots: string[];
  specialConditions: string;
}

// Métodos de pago configurables por el comercio (Fase 1 / CentralBo)
// WhatsApp es canal obligatorio de coordinación y no es un método opcional.
export interface StorePaymentSettings {
  cashOnDelivery: boolean; // Efectivo contraentrega (NO aparece automáticamente; solo cuando el admin lo activa)
  bankTransfer: boolean;   // Transferencia bancaria directa (configurable)
  qrSimple: boolean;       // QR Simple (configurable)
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
}

// Verticales específicas
export interface RestaurantSettings {
  allowDineIn: boolean;
  allowDelivery: boolean;
  allowPickup: boolean;
  allowKitchenNotes: boolean;
  avgPrepTimeMinutes: number;
  whatsappDirectOrders: boolean;
}

export interface FashionSizeGuideItem {
  size: string;
  chest: string;
  waist: string;
  hips: string;
}

export interface FashionSettings {
  exchangePolicy: string;
  sizeGuide: FashionSizeGuideItem[];
  enableColorSwatches: boolean;
}

export interface GeneralSettings {
  catalogLayout: 'grid' | 'list';
  showStockBadges: boolean;
}

// Servicios (para vertical servicios dentro de catálogo/configuración específica)
export interface ServiceItem {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  specialty: string;
  professionalId: string;
  isAvailable: boolean;
}

export type AgendaSlotStatus = 'disponible' | 'pendiente' | 'confirmada' | 'bloqueada';

export interface ProfessionalDaySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  dayName: string;
  isOpen: boolean;
  startTime: string; // ej. '09:00'
  endTime: string;   // ej. '18:00'
}

export interface ProfessionalAgendaSlot {
  time: string; // HH:MM
  status: AgendaSlotStatus;
  reason?: string;
  appointment?: AppointmentRequest;
  reservedSlot?: ReservedTimeSlot;
}

export interface ProfessionalItem {
  id: string;
  tenant_id: string;
  name: string;
  specialty: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  workDays: string[];
  shiftHours: string;
  serviceIds: string[]; // IDs de los servicios que puede realizar
  schedule: ProfessionalDaySchedule[]; // Horarios diferenciados por día de atención
}

export interface ReservedTimeSlot {
  id: string;
  tenant_id: string;
  professionalId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string; // e.g. "Cita Externa", "Mantenimiento", "Bloqueo manual"
  isExternal: boolean;
}

export interface AppointmentRequest {
  id: string;
  tenant_id: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // YYYY-MM-DD (mismo día o día siguiente)
  time: string; // HH:MM
  status: 'pendiente' | 'confirmada' | 'rechazada';
  createdAt: string;
  notes?: string;
}

export interface PromotionCode {
  id: string;
  tenant_id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // % o Bs
  startDate: string;
  endDate: string;
  minPurchase: number; // en Bs (0 = sin mínimo)
  isActive: boolean;
}

export interface StoreStatistics {
  totalVisits: number;
  todayVisits: number;
  last7DaysVisits: number;
  last30DaysVisits: number;
  mostViewedProducts: Array<{
    id: string;
    name: string;
    category: string;
    views: number;
    percentage: number;
  }>;
  totalOrders: number;
  completedOrders: number;
  conversionRate: number; // Porcentaje calculado (Pedidos / Visitas) * 100
  antiInflationWindowMinutes: number; // 30 min deduplication
}


