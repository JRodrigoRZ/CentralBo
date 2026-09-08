/**
 * CentralBo — Servicio del Panel Admin de Tienda
 * Módulo 4 — Panel Admin de Tienda
 * 
 * Reglas de Seguridad & Aislamiento:
 * 1. Todos los métodos exigen y filtran estrictamente por tenant_id.
 * 2. Un administrador solo puede leer y alterar los datos de su propio comercio.
 * 3. Se respeta la discriminación de capacidades según el plan (Basic vs Pro).
 * 4. Persiste en almacenamiento local del tenant y sincroniza con Supabase.
 */

import {
  Category,
  Product,
  Order,
  StoreProfileSettings,
  StoreAppearanceSettings,
  StoreScheduleDay,
  StoreShippingSettings,
  StoreScheduledOrdersSettings,
  StorePaymentSettings,
  RestaurantSettings,
  FashionSettings,
  GeneralSettings,
  ServiceItem,
  ProfessionalItem,
  ProfessionalDaySchedule,
  ProfessionalAgendaSlot,
  AgendaSlotStatus,
  ReservedTimeSlot,
  AppointmentRequest,
  PromotionCode,
  StoreStatistics,
  OrderStatus,
  StoreType,
} from '../types';
import { BASELINE_STORES } from './multiTenantService';
import { SUPERADMIN_STORES } from './superadminService';

// ----------------------------------------------------------------------------
// ESTADO Y PLAN DEL COMERCIO
// ----------------------------------------------------------------------------
export function getStorePlan(tenantId: string): 'basic' | 'pro' {
  const adminStore = SUPERADMIN_STORES.find((s) => s.id === tenantId);
  if (adminStore) {
    return adminStore.subscription.planId;
  }
  // Por defecto, asignar basic si no está registrado en el superadmin
  return 'basic';
}

// ----------------------------------------------------------------------------
// DATOS SEMILLA POR TENANT (Módulo 4)
// ----------------------------------------------------------------------------

const TENANT_STORAGE_PREFIX = 'centralbo_store_data_v4_';

function getStorageKey(tenantId: string, section: string): string {
  return `${TENANT_STORAGE_PREFIX}${tenantId}_${section}`;
}

function loadFromStorage<T>(tenantId: string, section: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getStorageKey(tenantId, section));
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch (e) {
    console.warn(`[CentralBo StoreAdmin] Error al cargar ${section}:`, e);
  }
  return fallback;
}

function saveToStorage<T>(tenantId: string, section: string, data: T): void {
  try {
    localStorage.setItem(getStorageKey(tenantId, section), JSON.stringify(data));
  } catch (e) {
    console.warn(`[CentralBo StoreAdmin] Error al guardar ${section}:`, e);
  }
}

// ----------------------------------------------------------------------------
// 1. HORARIOS SEMILLA (Lunes a Domingo con múltiples períodos)
// ----------------------------------------------------------------------------
export const DEFAULT_WEEK_SCHEDULE: StoreScheduleDay[] = [
  {
    dayOfWeek: 1,
    dayName: 'Lunes',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '20:30' },
    ],
  },
  {
    dayOfWeek: 2,
    dayName: 'Martes',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '20:30' },
    ],
  },
  {
    dayOfWeek: 3,
    dayName: 'Miércoles',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '20:30' },
    ],
  },
  {
    dayOfWeek: 4,
    dayName: 'Jueves',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '20:30' },
    ],
  },
  {
    dayOfWeek: 5,
    dayName: 'Viernes',
    isOpen: true,
    periods: [
      { open: '08:30', close: '13:00' },
      { open: '15:30', close: '21:30' },
    ],
  },
  {
    dayOfWeek: 6,
    dayName: 'Sábado',
    isOpen: true,
    periods: [{ open: '09:00', close: '18:00' }],
  },
  {
    dayOfWeek: 0,
    dayName: 'Domingo',
    isOpen: false,
    periods: [{ open: '10:00', close: '14:00' }],
  },
];

// Cálculo de estado en vivo del comercio: "Abierto ahora", "Cerrado", "Próxima apertura"
export function calculateScheduleStatus(schedule: StoreScheduleDay[]): {
  isOpenNow: boolean;
  statusLabel: 'Abierto ahora' | 'Cerrado';
  nextOpeningInfo: string;
} {
  const now = new Date();
  // Hora de Bolivia GMT-4 aproximada
  const currentDayOfWeek = now.getDay(); // 0 a 6
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const todayConfig = schedule.find((s) => s.dayOfWeek === currentDayOfWeek);

  if (todayConfig && todayConfig.isOpen) {
    for (const period of todayConfig.periods) {
      if (currentTimeStr >= period.open && currentTimeStr <= period.close) {
        return {
          isOpenNow: true,
          statusLabel: 'Abierto ahora',
          nextOpeningInfo: `Cierra hoy a las ${period.close}`,
        };
      }
    }
  }

  // Buscar próxima apertura
  // Revisar si hoy tiene un período posterior
  if (todayConfig && todayConfig.isOpen) {
    for (const period of todayConfig.periods) {
      if (currentTimeStr < period.open) {
        return {
          isOpenNow: false,
          statusLabel: 'Cerrado',
          nextOpeningInfo: `Abre hoy a las ${period.open}`,
        };
      }
    }
  }

  // Buscar en los siguientes días
  for (let offset = 1; offset <= 7; offset++) {
    const nextDayIndex = (currentDayOfWeek + offset) % 7;
    const nextDayConfig = schedule.find((s) => s.dayOfWeek === nextDayIndex);
    if (nextDayConfig && nextDayConfig.isOpen && nextDayConfig.periods.length > 0) {
      const firstPeriod = nextDayConfig.periods[0];
      const prefix = offset === 1 ? 'mañana' : `el ${nextDayConfig.dayName}`;
      return {
        isOpenNow: false,
        statusLabel: 'Cerrado',
        nextOpeningInfo: `Próxima apertura: ${prefix} a las ${firstPeriod.open}`,
      };
    }
  }

  return {
    isOpenNow: false,
    statusLabel: 'Cerrado',
    nextOpeningInfo: 'Sin horario próximo definido',
  };
}

// ----------------------------------------------------------------------------
// 2. PERFIL DE TIENDA
// ----------------------------------------------------------------------------
export function getStoreProfile(tenantId: string): StoreProfileSettings {
  const baseStore = BASELINE_STORES.find((s) => s.id === tenantId);
  const adminRecord = SUPERADMIN_STORES.find((s) => s.id === tenantId);

  const defaultProfile: StoreProfileSettings = {
    logoUrl: baseStore?.logo_url || '',
    name: baseStore?.name || 'Mi Comercio',
    description:
      baseStore?.store_type === 'restaurante'
        ? 'Auténtica gastronomía italiana artesanal, pizzas al horno de piedra y pastas frescas en La Paz.'
        : baseStore?.store_type === 'moda'
        ? 'Colecciones exclusivas de temporada, calzado y confección de alta calidad.'
        : baseStore?.store_type === 'servicios'
        ? 'Centro integral de bienestar, estética facial, masoterapia y spa relajante.'
        : 'Variedad en abarrotes, productos frescos y artículos de primera necesidad.',
    address: 'Av. Ballivián #1234, Calacoto, La Paz - Bolivia',
    phone: adminRecord?.owner.phone || '+591 2 2789012',
    whatsapp: adminRecord?.owner.socials?.whatsapp || '+591 71023456',
    email: adminRecord?.owner.email || 'contacto@comercio.bo',
    attentionInfo: 'Atención presencial y pedidos online de Lunes a Sábado.',
    socials: {
      whatsapp: adminRecord?.owner.socials?.whatsapp || '+591 71023456',
      instagram: adminRecord?.owner.socials?.instagram || '@comercio_bo',
      facebook: adminRecord?.owner.socials?.facebook || 'ComercioBolivia',
      tiktok: '@comercio.bolivia',
      youtube: 'https://youtube.com/@comerciobo',
    },
  };

  return loadFromStorage<StoreProfileSettings>(tenantId, 'profile', defaultProfile);
}

export function saveStoreProfile(
  tenantId: string,
  settings: StoreProfileSettings
): void {
  saveToStorage(tenantId, 'profile', settings);
}

// ----------------------------------------------------------------------------
// 3. APARIENCIA Y PLAN (Basic vs Pro)
// ----------------------------------------------------------------------------
export function getStoreAppearance(tenantId: string): StoreAppearanceSettings {
  const plan = getStorePlan(tenantId);
  const defaultAppearance: StoreAppearanceSettings = {
    theme: 'dark',
    brandPrimaryColor: plan === 'pro' ? '#4f46e5' : '#4f46e5',
    brandSecondaryColor: plan === 'pro' ? '#06b6d4' : '#06b6d4',
    brandAccentColor: plan === 'pro' ? '#f59e0b' : '#f59e0b',
    customDomain: plan === 'pro' ? 'roma-gourmet.bo' : '',
    domainVerified: plan === 'pro',
    visualStyle: 'modern',
  };

  return loadFromStorage<StoreAppearanceSettings>(tenantId, 'appearance', defaultAppearance);
}

export function saveStoreAppearance(
  tenantId: string,
  settings: StoreAppearanceSettings
): { success: boolean; error?: string } {
  const plan = getStorePlan(tenantId);

  // Validación de seguridad de plan: Si es Basic, rechazar modificaciones Pro
  if (plan === 'basic') {
    const existing = getStoreAppearance(tenantId);
    // Solo permitir cambiar tema claro/oscuro
    const sanitized: StoreAppearanceSettings = {
      ...existing,
      theme: settings.theme,
      brandPrimaryColor: '#4f46e5',
      brandSecondaryColor: '#06b6d4',
      brandAccentColor: '#f59e0b',
      customDomain: '',
      domainVerified: false,
    };
    saveToStorage(tenantId, 'appearance', sanitized);
    return { success: true };
  }

  saveToStorage(tenantId, 'appearance', settings);
  return { success: true };
}

// ----------------------------------------------------------------------------
// 4. HORARIOS
// ----------------------------------------------------------------------------
export function getStoreSchedule(tenantId: string): StoreScheduleDay[] {
  return loadFromStorage<StoreScheduleDay[]>(tenantId, 'schedule', DEFAULT_WEEK_SCHEDULE);
}

export function saveStoreSchedule(
  tenantId: string,
  schedule: StoreScheduleDay[]
): void {
  saveToStorage(tenantId, 'schedule', schedule);
}

// ----------------------------------------------------------------------------
// 5. ENVÍOS (La plataforma NO calcula automáticamente el costo)
// ----------------------------------------------------------------------------
export function getStoreShipping(tenantId: string): StoreShippingSettings {
  const defaultShipping: StoreShippingSettings = {
    offersShipping: true,
    shippingType: 'fixed',
    fixedCost: 15, // Bs 15 tarifa fija
    minOrderAmount: 50, // Bs 50 mínimo
    maxOrderAmount: 0, // Sin límite
    availableDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    availableHours: '11:00 a 20:30',
  };

  return loadFromStorage<StoreShippingSettings>(tenantId, 'shipping', defaultShipping);
}

export function saveStoreShipping(
  tenantId: string,
  settings: StoreShippingSettings
): void {
  saveToStorage(tenantId, 'shipping', settings);
}

// ----------------------------------------------------------------------------
// 6. PEDIDOS PROGRAMADOS
// ----------------------------------------------------------------------------
export function getStoreScheduledOrders(
  tenantId: string
): StoreScheduledOrdersSettings {
  const defaultScheduled: StoreScheduledOrdersSettings = {
    enabled: true,
    minAdvanceHours: 2, // Mínimo 2 horas de anticipación
    maxAdvanceDays: 7, // Hasta 7 días a futuro
    availableSlots: [
      '11:30 - 12:30',
      '12:30 - 13:30',
      '13:30 - 14:30',
      '18:30 - 19:30',
      '19:30 - 20:30',
      '20:30 - 21:30',
    ],
    specialConditions:
      'Para pedidos con entrega programada, solicitamos confirmar su dirección con pin de WhatsApp al momento de coordinar el despacho.',
  };

  return loadFromStorage<StoreScheduledOrdersSettings>(
    tenantId,
    'scheduled_orders',
    defaultScheduled
  );
}

export function saveStoreScheduledOrders(
  tenantId: string,
  settings: StoreScheduledOrdersSettings
): void {
  saveToStorage(tenantId, 'scheduled_orders', settings);
}

// ----------------------------------------------------------------------------
// 6.1 MÉTODOS DE PAGO CONFIGURABLES POR EL COMERCIO (Fase 1 / CentralBo)
// WhatsApp es canal obligatorio y permanente de comunicación, no un método de pago.
// Los 3 métodos configurables son: Efectivo contraentrega, Transferencia, QR Simple.
// El efectivo contraentrega NO aparece automáticamente; solo cuando el admin lo activa.
// ----------------------------------------------------------------------------
export const DEFAULT_PAYMENT_SETTINGS: StorePaymentSettings = {
  cashOnDelivery: false, // NO aparece automáticamente
  bankTransfer: true,
  qrSimple: true,
  bankDetails: {
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  },
};

export function getStorePaymentSettings(tenantId: string): StorePaymentSettings {
  const loaded = loadFromStorage<Partial<StorePaymentSettings>>(tenantId, 'payment_settings', {});
  return {
    cashOnDelivery: typeof loaded.cashOnDelivery === 'boolean' ? loaded.cashOnDelivery : DEFAULT_PAYMENT_SETTINGS.cashOnDelivery,
    bankTransfer: typeof loaded.bankTransfer === 'boolean' ? loaded.bankTransfer : DEFAULT_PAYMENT_SETTINGS.bankTransfer,
    qrSimple: typeof loaded.qrSimple === 'boolean' ? loaded.qrSimple : DEFAULT_PAYMENT_SETTINGS.qrSimple,
    bankDetails: loaded.bankDetails || DEFAULT_PAYMENT_SETTINGS.bankDetails,
  };
}

export function saveStorePaymentSettings(
  tenantId: string,
  settings: StorePaymentSettings
): void {
  saveToStorage(tenantId, 'payment_settings', settings);
}

// ----------------------------------------------------------------------------
// 7. CONFIGURACIÓN ESPECÍFICA POR VERTICAL
// ----------------------------------------------------------------------------

export function getRestaurantSettings(tenantId: string): RestaurantSettings {
  const defaults: RestaurantSettings = {
    allowDineIn: true,
    allowDelivery: true,
    allowPickup: true,
    allowKitchenNotes: true,
    avgPrepTimeMinutes: 30,
    whatsappDirectOrders: true,
  };
  return loadFromStorage<RestaurantSettings>(tenantId, 'restaurant_config', defaults);
}

export function saveRestaurantSettings(
  tenantId: string,
  settings: RestaurantSettings
): void {
  saveToStorage(tenantId, 'restaurant_config', settings);
}

export function getFashionSettings(tenantId: string): FashionSettings {
  const defaults: FashionSettings = {
    exchangePolicy:
      'Cambios permitidos dentro de los 7 días hábiles posteriores a la entrega presentando el comprobante y la prenda sin uso con etiqueta original. No se realizan devoluciones en efectivo.',
    sizeGuide: [
      { size: 'XS', chest: '82 - 86 cm', waist: '62 - 66 cm', hips: '88 - 92 cm' },
      { size: 'S', chest: '86 - 90 cm', waist: '66 - 70 cm', hips: '92 - 96 cm' },
      { size: 'M', chest: '90 - 96 cm', waist: '70 - 76 cm', hips: '96 - 102 cm' },
      { size: 'L', chest: '96 - 102 cm', waist: '76 - 82 cm', hips: '102 - 108 cm' },
      { size: 'XL', chest: '102 - 108 cm', waist: '82 - 88 cm', hips: '108 - 114 cm' },
    ],
    enableColorSwatches: true,
  };
  return loadFromStorage<FashionSettings>(tenantId, 'fashion_config', defaults);
}

export function saveFashionSettings(
  tenantId: string,
  settings: FashionSettings
): void {
  saveToStorage(tenantId, 'fashion_config', settings);
}

export function getGeneralSettings(tenantId: string): GeneralSettings {
  const defaults: GeneralSettings = {
    catalogLayout: 'grid',
    showStockBadges: true,
  };
  return loadFromStorage<GeneralSettings>(tenantId, 'general_config', defaults);
}

export function saveGeneralSettings(
  tenantId: string,
  settings: GeneralSettings
): void {
  saveToStorage(tenantId, 'general_config', settings);
}

// ----------------------------------------------------------------------------
// SERVICIOS (Profesionales, Disponibilidad, Horarios Reservados, Citas)
// ----------------------------------------------------------------------------

export function createDefaultProfessionalSchedule(
  openDays: number[] = [1, 2, 3, 4, 5],
  startTime: string = '09:00',
  endTime: string = '18:00',
  satEndTime: string = '13:00'
): ProfessionalDaySchedule[] {
  const daysDefinition: Array<{ dayOfWeek: number; dayName: string }> = [
    { dayOfWeek: 1, dayName: 'Lunes' },
    { dayOfWeek: 2, dayName: 'Martes' },
    { dayOfWeek: 3, dayName: 'Miércoles' },
    { dayOfWeek: 4, dayName: 'Jueves' },
    { dayOfWeek: 5, dayName: 'Viernes' },
    { dayOfWeek: 6, dayName: 'Sábado' },
    { dayOfWeek: 0, dayName: 'Domingo' },
  ];

  return daysDefinition.map((d) => {
    const isOpen = openDays.includes(d.dayOfWeek);
    const dayEnd = d.dayOfWeek === 6 ? satEndTime : endTime;
    return {
      dayOfWeek: d.dayOfWeek,
      dayName: d.dayName,
      isOpen,
      startTime,
      endTime: dayEnd,
    };
  });
}

export function getStoreProfessionals(tenantId: string): ProfessionalItem[] {
  const defaults: ProfessionalItem[] = [
    {
      id: 'prof-1',
      tenant_id: tenantId,
      name: 'Lic. Claudia Morales',
      specialty: 'Cosmetología y Cuidado Facial',
      phone: '+591 70192837',
      avatarUrl: '',
      isActive: true,
      workDays: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
      shiftHours: '09:00 - 18:00 (Sáb 09:00 - 13:00)',
      serviceIds: ['srv-2'], // Limpieza Facial
      schedule: createDefaultProfessionalSchedule([1, 3, 5, 6], '09:00', '18:00', '13:00'),
    },
    {
      id: 'prof-2',
      tenant_id: tenantId,
      name: 'Dr. Roberto Mendoza',
      specialty: 'Fisioterapia y Masajes Terapéuticos',
      phone: '+591 71283940',
      avatarUrl: '',
      isActive: true,
      workDays: ['Martes', 'Jueves', 'Viernes', 'Sábado'],
      shiftHours: '10:00 - 19:00 (Sáb 10:00 - 14:00)',
      serviceIds: ['srv-1'], // Masaje Descontracturante
      schedule: createDefaultProfessionalSchedule([2, 4, 5, 6], '10:00', '19:00', '14:00'),
    },
  ];

  const loaded = loadFromStorage<ProfessionalItem[]>(tenantId, 'professionals', defaults);

  // Normalizar para garantizar que serviceIds y schedule siempre existan
  return loaded.map((prof) => ({
    ...prof,
    serviceIds:
      Array.isArray(prof.serviceIds) && prof.serviceIds.length > 0
        ? prof.serviceIds
        : prof.id === 'prof-1'
        ? ['srv-2']
        : prof.id === 'prof-2'
        ? ['srv-1']
        : [],
    schedule:
      Array.isArray(prof.schedule) && prof.schedule.length === 7
        ? prof.schedule
        : prof.id === 'prof-1'
        ? createDefaultProfessionalSchedule([1, 3, 5, 6], '09:00', '18:00', '13:00')
        : createDefaultProfessionalSchedule([2, 4, 5, 6], '10:00', '19:00', '14:00'),
  }));
}

export function saveStoreProfessionals(
  tenantId: string,
  professionals: ProfessionalItem[]
): void {
  saveToStorage(tenantId, 'professionals', professionals);
}

/**
 * Genera la grilla de turnos de un profesional para una fecha específica (YYYY-MM-DD),
 * calculando los 4 estados canónicos: 'disponible', 'pendiente', 'confirmada', 'bloqueada'.
 * Respeta rigurosamente los días y horas de atención configurados para ese día.
 */
export function getProfessionalAgendaSlots(
  tenantId: string,
  professional: ProfessionalItem,
  dateStr: string
): ProfessionalAgendaSlot[] {
  if (!professional || !professional.schedule) {
    return [];
  }

  // Extraer día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day, 12, 0, 0);
  const dayOfWeek = targetDate.getDay();

  const daySchedule = professional.schedule.find((s) => s.dayOfWeek === dayOfWeek);

  // Si no atiende este día de la semana, no hay horarios disponibles
  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
  const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

  const startTotalMinutes = (isNaN(startHour) ? 9 : startHour) * 60 + (isNaN(startMin) ? 0 : startMin);
  const endTotalMinutes = (isNaN(endHour) ? 18 : endHour) * 60 + (isNaN(endMin) ? 0 : endMin);

  // Intervalos de 60 minutos por sesión
  const intervalMinutes = 60;
  const rawTimes: string[] = [];

  for (let m = startTotalMinutes; m + intervalMinutes <= endTotalMinutes; m += intervalMinutes) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    rawTimes.push(`${hh}:${mm}`);
  }

  // Cargar bloqueos manuales / citas externas y citas del comercio
  const reservedSlots = getStoreReservedTimeSlots(tenantId);
  const appointments = getStoreAppointments(tenantId);

  return rawTimes.map((time) => {
    // 1. Bloqueo manual o cita externa
    const reserved = reservedSlots.find(
      (r) =>
        r.date === dateStr &&
        r.time === time &&
        (r.professionalId === professional.id || !r.professionalId)
    );

    if (reserved) {
      return {
        time,
        status: 'bloqueada' as AgendaSlotStatus,
        reason: reserved.reason || 'Bloqueo manual / Cita externa',
        reservedSlot: reserved,
      };
    }

    // 2. Cita solicitada en el sistema (excluyendo rechazadas)
    const apt = appointments.find(
      (a) =>
        a.professionalId === professional.id &&
        a.date === dateStr &&
        a.time === time &&
        a.status !== 'rechazada'
    );

    if (apt) {
      return {
        time,
        status: apt.status as AgendaSlotStatus, // 'pendiente' | 'confirmada'
        appointment: apt,
      };
    }

    // 3. Disponible
    return {
      time,
      status: 'disponible' as AgendaSlotStatus,
    };
  });
}

export function getStoreReservedTimeSlots(tenantId: string): ReservedTimeSlot[] {
  const today = new Date().toISOString().split('T')[0];
  const defaults: ReservedTimeSlot[] = [
    {
      id: 'res-1',
      tenant_id: tenantId,
      professionalId: 'prof-1',
      date: today,
      time: '11:00',
      reason: 'Cita Externa en Domicilio',
      isExternal: true,
    },
    {
      id: 'res-2',
      tenant_id: tenantId,
      professionalId: 'prof-2',
      date: today,
      time: '16:00',
      reason: 'Mantenimiento de Cabina de Masajes',
      isExternal: false,
    },
  ];
  return loadFromStorage<ReservedTimeSlot[]>(tenantId, 'reserved_slots', defaults);
}

export function saveStoreReservedTimeSlots(
  tenantId: string,
  slots: ReservedTimeSlot[]
): void {
  saveToStorage(tenantId, 'reserved_slots', slots);
}

export function getStoreAppointments(tenantId: string): AppointmentRequest[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const defaults: AppointmentRequest[] = [
    {
      id: 'cita-101',
      tenant_id: tenantId,
      serviceId: 'srv-1',
      serviceName: 'Masaje Descontracturante Profundo (60 min)',
      professionalId: 'prof-2',
      professionalName: 'Dr. Roberto Mendoza',
      customerName: 'Silvia Vargas',
      customerPhone: '+591 78912345',
      customerEmail: 'silvia.vargas@email.bo',
      date: today,
      time: '15:00',
      status: 'pendiente',
      createdAt: '2026-09-07T08:15:00Z',
      notes: 'Sufro de tensión en cuello y hombros por trabajo sedentario.',
    },
    {
      id: 'cita-102',
      tenant_id: tenantId,
      serviceId: 'srv-2',
      serviceName: 'Limpieza Facial Hidratante con Ácido Hialurónico (45 min)',
      professionalId: 'prof-1',
      professionalName: 'Lic. Claudia Morales',
      customerName: 'Carlos Paredes',
      customerPhone: '+591 76543219',
      customerEmail: 'cparedes@gmail.com',
      date: tomorrow,
      time: '10:30',
      status: 'confirmada',
      createdAt: '2026-09-06T19:40:00Z',
      notes: 'Primera sesión facial.',
    },
  ];
  return loadFromStorage<AppointmentRequest[]>(tenantId, 'appointments', defaults);
}

export function saveStoreAppointments(
  tenantId: string,
  appointments: AppointmentRequest[]
): void {
  saveToStorage(tenantId, 'appointments', appointments);
}

// ----------------------------------------------------------------------------
// 8. CATEGORÍAS (Por Tenant)
// ----------------------------------------------------------------------------
export function getStoreCategories(tenantId: string, storeType: StoreType): Category[] {
  const defaultCategories: Category[] =
    storeType === 'restaurante'
      ? [
          {
            id: 'cat-rest-1',
            tenant_id: tenantId,
            name: 'Pizzas Artesanales',
            status: 'activo',
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'cat-rest-2',
            tenant_id: tenantId,
            name: 'Pastas Frescas',
            status: 'activo',
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'cat-rest-3',
            tenant_id: tenantId,
            name: 'Bebidas y Vinos',
            status: 'activo',
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'cat-rest-4',
            tenant_id: tenantId,
            name: 'Postres Clásicos',
            status: 'activo',
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
        ]
      : storeType === 'moda'
      ? [
          {
            id: 'cat-moda-1',
            tenant_id: tenantId,
            name: 'Vestidos & Enterizos',
            status: 'activo',
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
          {
            id: 'cat-moda-2',
            tenant_id: tenantId,
            name: 'Abrigos & Chaquetas',
            status: 'activo',
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
          {
            id: 'cat-moda-3',
            tenant_id: tenantId,
            name: 'Calzado & Botines',
            status: 'activo',
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
        ]
      : storeType === 'servicios'
      ? [
          {
            id: 'cat-serv-1',
            tenant_id: tenantId,
            name: 'Masoterapia & Relajación',
            status: 'activo',
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
          {
            id: 'cat-serv-2',
            tenant_id: tenantId,
            name: 'Cuidado Facial',
            status: 'activo',
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
          {
            id: 'cat-serv-3',
            tenant_id: tenantId,
            name: 'Paquetes de Spa',
            status: 'activo',
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
        ]
      : [
          {
            id: 'cat-gen-1',
            tenant_id: tenantId,
            name: 'Despensa & Abarrotes',
            status: 'activo',
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
          {
            id: 'cat-gen-2',
            tenant_id: tenantId,
            name: 'Lácteos & Refrigerados',
            status: 'activo',
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
          {
            id: 'cat-gen-3',
            tenant_id: tenantId,
            name: 'Limpieza del Hogar',
            status: 'activo',
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
        ];

  return loadFromStorage<Category[]>(tenantId, 'categories', defaultCategories);
}

export function saveStoreCategories(
  tenantId: string,
  categories: Category[]
): void {
  saveToStorage(tenantId, 'categories', categories);
}

// ----------------------------------------------------------------------------
// 9. PRODUCTOS (Por Tenant con particularidades por vertical)
// ----------------------------------------------------------------------------
export function getStoreProducts(tenantId: string, storeType: StoreType): Product[] {
  const defaultProducts: Product[] =
    storeType === 'restaurante'
      ? [
          {
            id: 'prod-rest-1',
            tenant_id: tenantId,
            category_id: 'cat-rest-1',
            name: 'Pizza Margherita Di Bufala',
            description: 'Masa madre fermentada 48h, salsa de tomate San Marzano, mozzarella di bufala y albahaca fresca.',
            price: 65,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 75,
              offer_price: 65,
              modifiers: [
                { name: 'Extra Mozzarella di Bufala', price: 12 },
                { name: 'Jamón Prosciutto Di Parma', price: 18 },
                { name: 'Champiñones Salteados', price: 8 },
              ],
              is_combo: false,
              kitchen_notes_allowed: true,
              allow_pickup: true,
              allow_delivery: true,
            },
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'prod-rest-2',
            tenant_id: tenantId,
            category_id: 'cat-rest-2',
            name: 'Fettuccine Al Tartufo Nero',
            description: 'Pasta artesanal al huevo salteada con mantequilla de trufa negra, parmesano reggiano de 24 meses.',
            price: 80,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 80,
              offer_price: null,
              modifiers: [
                { name: 'Extra Parmesano Reggiano', price: 10 },
                { name: 'Pechuga de Pollo Grillada', price: 15 },
              ],
              is_combo: false,
              kitchen_notes_allowed: true,
              allow_pickup: true,
              allow_delivery: true,
            },
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'prod-rest-3',
            tenant_id: tenantId,
            category_id: 'cat-rest-1',
            name: 'Combo Pareja Romana',
            description: '1 Pizza Familiar a elección + 2 Pastas clásicas + 2 Bebidas artesanales y 1 Tiramisú para compartir.',
            price: 155,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 180,
              offer_price: 155,
              is_combo: true,
              combo_items: ['1 Pizza Familiar', '2 Pastas Clásicas', '2 Bebidas', '1 Tiramisú'],
              modifiers: [],
              kitchen_notes_allowed: true,
              allow_pickup: true,
              allow_delivery: true,
            },
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
          {
            id: 'prod-rest-4',
            tenant_id: tenantId,
            category_id: 'cat-rest-4',
            name: 'Tiramisú Tradizionale',
            description: 'Bizcochos savoiardi embebidos en café expreso italiano con crema de mascarpone y cacao amargo.',
            price: 32,
            is_available: false, // Agotado
            image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: false,
              previous_price: 32,
              offer_price: null,
              modifiers: [],
              is_combo: false,
              kitchen_notes_allowed: false,
              allow_pickup: true,
              allow_delivery: true,
            },
            created_at: '2026-09-01T12:00:00Z',
            updated_at: '2026-09-01T12:00:00Z',
          },
        ]
      : storeType === 'moda'
      ? [
          {
            id: 'prod-moda-1',
            tenant_id: tenantId,
            category_id: 'cat-moda-1',
            name: 'Vestido Midi Plisado Milano',
            description: 'Vestido midi con caída fluida, escote en V y cinto ajustable. Tejido transpirable de alta resistencia.',
            price: 240,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 280,
              offer_price: 240,
              sizes: ['S', 'M', 'L'],
              colors: [
                { name: 'Azul Marino', hex: '#1e3a8a' },
                { name: 'Verde Esmeralda', hex: '#065f46' },
                { name: 'Terracota', hex: '#9a3412' },
              ],
              gallery_images: [
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80',
              ],
              size_guide: 'Corte regular estándar. Consultar tabla de medidas.',
              exchange_policy: 'Cambio disponible por talla hasta 7 días hábiles.',
            },
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
          {
            id: 'prod-moda-2',
            tenant_id: tenantId,
            category_id: 'cat-moda-2',
            name: 'Abrigo Lana Premium Altiplano',
            description: 'Confeccionado en mezcla de lana de alpaca suave con forro térmico satinado. Estilo elegante con botones cruzados.',
            price: 490,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 520,
              offer_price: 490,
              sizes: ['M', 'L', 'XL'],
              colors: [
                { name: 'Camel Clásico', hex: '#c2884a' },
                { name: 'Gris Grafito', hex: '#374151' },
              ],
              gallery_images: [
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
              ],
              size_guide: 'Holgado para uso sobre jersey.',
              exchange_policy: 'Garantía de confección 15 días.',
            },
            created_at: '2026-09-02T12:00:00Z',
            updated_at: '2026-09-02T12:00:00Z',
          },
        ]
      : storeType === 'servicios'
      ? [
          {
            id: 'srv-1',
            tenant_id: tenantId,
            category_id: 'cat-serv-1',
            name: 'Masaje Descontracturante Profundo',
            description: 'Terapia manual enfocada en aliviar tensiones musculares crónicas, espalda y cuello con aceites botánicos.',
            price: 180,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_service: true,
              duration_minutes: 60,
              specialty: 'Fisioterapia y Masajes',
              professional_id: 'prof-2',
              professional_name: 'Dr. Roberto Mendoza',
              is_featured: true,
              previous_price: 200,
              offer_price: 180,
            },
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
          {
            id: 'srv-2',
            tenant_id: tenantId,
            category_id: 'cat-serv-2',
            name: 'Limpieza Facial Hidratante Profunda',
            description: 'Exfoliación suave, extracción de impurezas, vapor de ozono y máscara de ácido hialurónico hidratante.',
            price: 150,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_service: true,
              duration_minutes: 45,
              specialty: 'Cosmetología y Cuidado Facial',
              professional_id: 'prof-1',
              professional_name: 'Lic. Claudia Morales',
              is_featured: true,
              previous_price: 150,
              offer_price: null,
            },
            created_at: '2026-09-03T12:00:00Z',
            updated_at: '2026-09-03T12:00:00Z',
          },
        ]
      : [
          {
            id: 'prod-gen-1',
            tenant_id: tenantId,
            category_id: 'cat-gen-1',
            name: 'Café Yungas Tostado Especial 500g',
            description: 'Granos de café arábica seleccionados de los valles de Los Yungas, tostado medio aromático.',
            price: 45,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: true,
              previous_price: 50,
              offer_price: 45,
              sku: 'CAF-YUNG-500',
              stock_units: 34,
            },
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
          {
            id: 'prod-gen-2',
            tenant_id: tenantId,
            category_id: 'cat-gen-2',
            name: 'Queso Menonita Artesanal 1kg',
            description: 'Queso semi-maduro tradicional de excelente fundición para preparaciones típicas.',
            price: 38,
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80',
            status: 'activo',
            attributes: {
              is_featured: false,
              previous_price: 38,
              offer_price: null,
              sku: 'QUE-MEN-1000',
              stock_units: 18,
            },
            created_at: '2026-09-04T12:00:00Z',
            updated_at: '2026-09-04T12:00:00Z',
          },
        ];

  return loadFromStorage<Product[]>(tenantId, 'products', defaultProducts);
}

export function saveStoreProducts(
  tenantId: string,
  products: Product[]
): void {
  saveToStorage(tenantId, 'products', products);
}

// ----------------------------------------------------------------------------
// 10. PEDIDOS (Por Tenant con los 7 estados canónicos)
// ----------------------------------------------------------------------------
export function getStoreOrders(tenantId: string): Order[] {
  const defaultOrders: Order[] = [
    {
      id: 'ord-1001',
      tenant_id: tenantId,
      customer_id: null,
      customer_name: 'Alejandro Morales',
      customer_email: 'amorales@gmail.com',
      customer_phone: '+591 77210982',
      status: 'en_preparacion' as OrderStatus,
      total: 145,
      created_at: '2026-09-07T08:30:00Z',
      updated_at: '2026-09-07T08:45:00Z',
    },
    {
      id: 'ord-1002',
      tenant_id: tenantId,
      customer_id: null,
      customer_name: 'Paola Miranda',
      customer_email: 'pmiranda@cotas.bo',
      customer_phone: '+591 71329845',
      status: 'recibido' as OrderStatus,
      total: 80,
      created_at: '2026-09-07T09:10:00Z',
      updated_at: '2026-09-07T09:10:00Z',
    },
    {
      id: 'ord-1003',
      tenant_id: tenantId,
      customer_id: null,
      customer_name: 'Gonzalo Claros',
      customer_email: 'gclaros@yahoo.com',
      customer_phone: '+591 76540981',
      status: 'pagado' as OrderStatus,
      total: 195,
      created_at: '2026-09-06T19:20:00Z',
      updated_at: '2026-09-06T19:35:00Z',
    },
    {
      id: 'ord-1004',
      tenant_id: tenantId,
      customer_id: null,
      customer_name: 'Mariana Salinas',
      customer_email: 'msalinas@hotmail.com',
      customer_phone: '+591 70123984',
      status: 'completado' as OrderStatus,
      total: 320,
      created_at: '2026-09-05T14:10:00Z',
      updated_at: '2026-09-05T15:30:00Z',
    },
    {
      id: 'ord-1005',
      tenant_id: tenantId,
      customer_id: null,
      customer_name: 'Daniel Mercado',
      customer_email: 'dmercado@entel.bo',
      customer_phone: '+591 72098431',
      status: 'pendiente' as OrderStatus,
      total: 65,
      created_at: '2026-09-07T09:40:00Z',
      updated_at: '2026-09-07T09:40:00Z',
    },
  ];

  return loadFromStorage<Order[]>(tenantId, 'orders', defaultOrders);
}

export function saveStoreOrders(tenantId: string, orders: Order[]): void {
  saveToStorage(tenantId, 'orders', orders);
}

export function updateOrderStatus(
  tenantId: string,
  orderId: string,
  newStatus: OrderStatus
): { success: boolean; order?: Order } {
  const orders = getStoreOrders(tenantId);
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) {
    return { success: false };
  }

  orders[index] = {
    ...orders[index],
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  saveStoreOrders(tenantId, orders);
  return { success: true, order: orders[index] };
}

// ----------------------------------------------------------------------------
// 11. PROMOCIONES
// ----------------------------------------------------------------------------
export function getStorePromotions(tenantId: string): PromotionCode[] {
  const defaultPromotions: PromotionCode[] = [
    {
      id: 'promo-1',
      tenant_id: tenantId,
      code: 'BIENVENIDO10',
      discountType: 'percentage',
      discountValue: 10,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      minPurchase: 50,
      isActive: true,
    },
    {
      id: 'promo-2',
      tenant_id: tenantId,
      code: 'ENVIOGRATIS20',
      discountType: 'fixed',
      discountValue: 15,
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      minPurchase: 100,
      isActive: true,
    },
  ];

  return loadFromStorage<PromotionCode[]>(tenantId, 'promotions', defaultPromotions);
}

export function saveStorePromotions(
  tenantId: string,
  promos: PromotionCode[]
): void {
  saveToStorage(tenantId, 'promotions', promos);
}

// ----------------------------------------------------------------------------
// 12. ESTADÍSTICAS Y ANTI-INFLACIÓN DE VISITAS
// ----------------------------------------------------------------------------
const VISIT_SESSION_KEY = 'centralbo_last_visit_timestamp_';

export function getStoreStatistics(tenantId: string): StoreStatistics {
  const superStore = SUPERADMIN_STORES.find((s) => s.id === tenantId);
  const baseVisits = superStore?.activity.visitas || 1200;
  const orders = getStoreOrders(tenantId);
  const completedOrders = orders.filter((o) => o.status === 'completado').length;

  const products = getStoreProducts(
    tenantId,
    (superStore?.store_type || 'general') as StoreType
  );

  const mostViewed = products.slice(0, 4).map((p, idx) => {
    const views = Math.round(baseVisits * (0.35 - idx * 0.08));
    return {
      id: p.id,
      name: p.name,
      category: 'General',
      views: Math.max(views, 20),
      percentage: Math.round(((views || 20) / baseVisits) * 100),
    };
  });

  const totalOrdersCount = orders.length;
  const conversionRate = Number(((totalOrdersCount / baseVisits) * 100).toFixed(1));

  const stats: StoreStatistics = {
    totalVisits: baseVisits,
    todayVisits: Math.round(baseVisits * 0.08),
    last7DaysVisits: Math.round(baseVisits * 0.38),
    last30DaysVisits: baseVisits,
    mostViewedProducts: mostViewed,
    totalOrders: totalOrdersCount,
    completedOrders: completedOrders,
    conversionRate: conversionRate,
    antiInflationWindowMinutes: 30,
  };

  return loadFromStorage<StoreStatistics>(tenantId, 'statistics', stats);
}

// Mecanismo anti-inflación de visitas (Deduplicación por ventana de 30 minutos)
export function recordStoreVisitSafely(tenantId: string): boolean {
  const now = Date.now();
  const sessionKey = `${VISIT_SESSION_KEY}${tenantId}`;
  const lastRecorded = localStorage.getItem(sessionKey);

  if (lastRecorded) {
    const elapsedMinutes = (now - Number(lastRecorded)) / (1000 * 60);
    // Si la última visita fue hace menos de 30 minutos, evitar conteo duplicado
    if (elapsedMinutes < 30) {
      return false; // Visita descartada por anti-inflación
    }
  }

  localStorage.setItem(sessionKey, String(now));
  // Incrementar estadística
  const stats = getStoreStatistics(tenantId);
  stats.totalVisits += 1;
  stats.todayVisits += 1;
  stats.last7DaysVisits += 1;
  stats.last30DaysVisits += 1;
  stats.conversionRate = Number(((stats.totalOrders / stats.totalVisits) * 100).toFixed(1));
  saveToStorage(tenantId, 'statistics', stats);
  return true;
}
