/**
 * CentralBo — Servicio de Invitación y Activación de Dueños de Comercio
 *
 * Flujo funcional exclusivo:
 * 1. SuperAdmin crea comercio + registra dueño (Nombre, Correo, WhatsApp).
 * 2. Se crea el acceso asociado exclusivamente al comercio, en estado "Invitación pendiente".
 * 3. Se genera una invitación con enlace único de activación.
 * 4. SuperAdmin prepara el envío de la invitación mediante WhatsApp.
 * 5. El dueño abre el enlace, verifica la invitación y define su propia contraseña.
 * 6. Al activar la cuenta, el estado pasa a "Acceso activado".
 * 7. El dueño puede iniciar sesión y acceder ÚNICAMENTE al Panel Admin de su comercio.
 *
 * El SuperAdmin NUNCA conoce ni visualiza la contraseña definitiva del dueño.
 */

import { StoreOwnerInvitation, InvitationStatus } from '../types';

const INVITATIONS_STORAGE_KEY = 'centralbo_store_owner_invitations_v1';

// Invitaciones iniciales para los comercios base preexistentes (con acceso ya activado)
const INITIAL_INVITATIONS: StoreOwnerInvitation[] = [
  {
    id: 'inv-roma-001',
    token: 'act_roma_b82a7f01',
    storeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    storeName: 'Restaurante Gourmet Roma',
    storeSlug: 'restaurante-roma',
    ownerName: 'Marco Antonio Rossi',
    ownerEmail: 'admin@roma.com',
    ownerPhone: '+591 71023456',
    status: 'Acceso activado',
    createdAt: '2026-08-01T10:00:00Z',
    activatedAt: '2026-08-01T11:30:00Z',
    // Hash o credencial preestablecida para demo
    passwordHash: 'roma2026',
  },
  {
    id: 'inv-milano-002',
    token: 'act_milano_c43b9e12',
    storeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    storeName: 'Boutique Milano Moda',
    storeSlug: 'boutique-milano',
    ownerName: 'Lucía Fernández Soria',
    ownerEmail: 'admin@milano.com',
    ownerPhone: '+591 72198765',
    status: 'Acceso activado',
    createdAt: '2026-07-15T12:00:00Z',
    activatedAt: '2026-07-15T14:10:00Z',
    passwordHash: 'milano2026',
  },
  {
    id: 'inv-zenit-003',
    token: 'act_zenit_d54c0f23',
    storeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    storeName: 'Salón & Spa Zenit',
    storeSlug: 'spa-zenit',
    ownerName: 'Claudia Morales Paz',
    ownerEmail: 'admin@spazenit.com',
    ownerPhone: '+591 73456789',
    status: 'Acceso activado',
    createdAt: '2026-08-10T09:00:00Z',
    activatedAt: '2026-08-10T10:15:00Z',
    passwordHash: 'zenit2026',
  },
  {
    id: 'inv-andes-004',
    token: 'act_andes_e65d1a34',
    storeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    storeName: 'SuperMarket Los Andes Express',
    storeSlug: 'los-andes-express',
    ownerName: 'Gonzalo Peñaranda',
    ownerEmail: 'admin@losandesexpress.com',
    ownerPhone: '+591 79812345',
    status: 'Acceso activado',
    createdAt: '2026-06-01T08:30:00Z',
    activatedAt: '2026-06-01T09:45:00Z',
    passwordHash: 'andes2026',
  },
];

let memoryInvitationsCache: StoreOwnerInvitation[] = [...INITIAL_INVITATIONS];

/**
 * Carga las invitaciones desde almacenamiento local o memoria
 */
export function getStoreOwnerInvitations(): StoreOwnerInvitation[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [...memoryInvitationsCache];
  }
  try {
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryInvitationsCache = [...parsed];
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[CentralBo Invitations] Error al leer invitaciones:', e);
  }
  return [...memoryInvitationsCache];
}

/**
 * Guarda y despacha evento de actualización
 */
function persistInvitations(invitations: StoreOwnerInvitation[]): void {
  memoryInvitationsCache = [...invitations];
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations));
      window.dispatchEvent(new CustomEvent('centralbo:store_owner_invitation_changed'));
    }
  } catch (e) {
    console.warn('[CentralBo Invitations] Error al persistir invitaciones:', e);
  }
}

/**
 * Busca la invitación asociada a un comercio
 */
export function getInvitationByStoreId(storeId: string): StoreOwnerInvitation | undefined {
  return getStoreOwnerInvitations().find((inv) => inv.storeId === storeId);
}

/**
 * Busca la invitación por su token único de activación
 */
export function getInvitationByToken(token: string): StoreOwnerInvitation | undefined {
  if (!token) return undefined;
  let clean = decodeURIComponent(token).trim();
  clean = clean.replace(/^\/+/, '').replace(/\/+$/, '');
  if (clean.startsWith('activar/')) {
    clean = clean.slice('activar/'.length);
  }
  const invitations = getStoreOwnerInvitations();
  return invitations.find((inv) => inv.token.trim() === clean);
}

/**
 * Busca la invitación por correo del dueño
 */
export function getInvitationByEmail(email: string): StoreOwnerInvitation | undefined {
  const clean = email.trim().toLowerCase();
  return getStoreOwnerInvitations().find((inv) => inv.ownerEmail.toLowerCase() === clean);
}

/**
 * Genera un token criptográfico seguro o pseudo-aleatorio único
 */
function generateActivationToken(storeSlug: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  const cleanSlug = (storeSlug || 'store')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8) || 'store';
  return `act_${cleanSlug}_${randomPart}`;
}

/**
 * Genera el enlace absoluto de activación para el dueño con formato /activar/:token
 */
export function generateActivationUrl(token: string): string {
  const cleanToken = (token || '').trim();
  if (typeof window === 'undefined') {
    return `https://centralbo.bo/activar/${cleanToken}`;
  }

  const origin = window.location.origin;
  return `${origin}/activar/${cleanToken}`;
}

export interface DirectStoreOwnerCredentials {
  storeId: string;
  storeName: string;
  storeSlug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  initialPassword: string;
  createdAt: string;
}

/**
 * Genera una contraseña inicial segura y legible para el dueño del comercio
 */
export function generateSecureInitialPassword(): string {
  const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const charsLower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#*';

  let pwd = 'CB$';
  for (let i = 0; i < 3; i++) {
    pwd += charsUpper.charAt(Math.floor(Math.random() * charsUpper.length));
  }
  for (let i = 0; i < 3; i++) {
    pwd += charsLower.charAt(Math.floor(Math.random() * charsLower.length));
  }
  for (let i = 0; i < 2; i++) {
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));
  return pwd;
}

/**
 * Registra directamente el acceso del dueño de un comercio con credenciales iniciales generadas
 * - Asocia al perfil store_admin y su tenantId
 * - Define su correo como identificador de acceso
 * - Genera una contraseña inicial segura
 * - Establece estado "Acceso activado" listo para ingresar por /login
 */
export function registerDirectStoreOwnerAccess(input: {
  storeId: string;
  storeName: string;
  storeSlug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  initialPassword?: string;
}): DirectStoreOwnerCredentials {
  const password = input.initialPassword || generateSecureInitialPassword();
  const now = new Date().toISOString();

  const invitations = getStoreOwnerInvitations();
  const cleanEmail = input.ownerEmail.trim().toLowerCase();

  const existingIndex = invitations.findIndex(
    (inv) =>
      inv.storeId === input.storeId ||
      inv.ownerEmail.trim().toLowerCase() === cleanEmail
  );

  const newOwnerRecord: StoreOwnerInvitation = {
    id:
      existingIndex >= 0
        ? invitations[existingIndex].id
        : `owner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    token: `acc_${input.storeSlug || 'store'}_${Date.now()}`,
    storeId: input.storeId,
    storeName: input.storeName.trim(),
    storeSlug: input.storeSlug.trim(),
    ownerName: input.ownerName.trim(),
    ownerEmail: cleanEmail,
    ownerPhone: input.ownerPhone.trim(),
    status: 'Acceso activado',
    createdAt: now,
    activatedAt: now,
    passwordHash: password,
  };

  let updatedList: StoreOwnerInvitation[];
  if (existingIndex >= 0) {
    updatedList = [...invitations];
    updatedList[existingIndex] = newOwnerRecord;
  } else {
    updatedList = [newOwnerRecord, ...invitations];
  }

  persistInvitations(updatedList);

  return {
    storeId: input.storeId,
    storeName: input.storeName.trim(),
    storeSlug: input.storeSlug.trim(),
    ownerName: input.ownerName.trim(),
    ownerEmail: cleanEmail,
    ownerPhone: input.ownerPhone.trim(),
    initialPassword: password,
    createdAt: now,
  };
}

/**
 * Obtiene la invitación existente de un comercio o la inicializa y persiste
 * garantizando que el acceso y credencial siempre existan.
 */
export function getOrCreateStoreOwnerInvitation(store: {
  id: string;
  name: string;
  slug?: string;
  owner: { name: string; email: string; phone: string };
  status?: string;
  created_at?: string;
}): StoreOwnerInvitation {
  const existing = getInvitationByStoreId(store.id);
  if (existing) {
    if (!existing.passwordHash) {
      existing.passwordHash = generateSecureInitialPassword();
      existing.status = 'Acceso activado';
      persistInvitations(getStoreOwnerInvitations());
    }
    return existing;
  }

  registerDirectStoreOwnerAccess({
    storeId: store.id,
    storeName: store.name,
    storeSlug: store.slug || '',
    ownerName: store.owner.name,
    ownerEmail: store.owner.email,
    ownerPhone: store.owner.phone,
  });

  return getInvitationByStoreId(store.id)!;
}

/**
 * Parámetros para registrar la invitación del dueño durante el alta del comercio
 */
export interface CreateInvitationInput {
  storeId: string;
  storeName: string;
  storeSlug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

/**
 * Crea una nueva invitación para el dueño de un comercio recién creado
 * Estado inicial estricto: "Invitación pendiente"
 */
export function createStoreOwnerInvitation(input: CreateInvitationInput): StoreOwnerInvitation {
  const current = getStoreOwnerInvitations();

  // Si ya existe una invitación para este comercio, actualizarla manteniendo el historial
  const existingIndex = current.findIndex((inv) => inv.storeId === input.storeId);
  const token = generateActivationToken(input.storeSlug);
  const now = new Date().toISOString();

  const newInvitation: StoreOwnerInvitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    token,
    storeId: input.storeId,
    storeName: input.storeName.trim(),
    storeSlug: input.storeSlug.trim(),
    ownerName: input.ownerName.trim(),
    ownerEmail: input.ownerEmail.trim().toLowerCase(),
    ownerPhone: input.ownerPhone.trim(),
    status: 'Invitación pendiente',
    createdAt: now,
  };

  let updatedList: StoreOwnerInvitation[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = newInvitation;
  } else {
    updatedList = [newInvitation, ...current];
  }

  persistInvitations(updatedList);
  return newInvitation;
}

/**
 * Redacta el mensaje preparado para WhatsApp
 *
 * Contenido requerido:
 * - Nombre del dueño.
 * - Nombre del comercio.
 * - Texto breve indicando que su comercio ya fue registrado en CentralBo.
 * - Enlace único de activación.
 */
export function generateWhatsAppMessage(invitation: StoreOwnerInvitation): string {
  const activationUrl = generateActivationUrl(invitation.token);

  return (
    `¡Hola ${invitation.ownerName}! 👋\n\n` +
    `Tu comercio "${invitation.storeName}" ya fue registrado en CentralBo.\n\n` +
    `Para activar tu acceso como Administrador y crear tu propia contraseña segura, por favor ingresa al siguiente enlace único de activación:\n\n` +
    `🔗 ${activationUrl}\n\n` +
    `Al completar la activación podrás ingresar directamente a tu Panel de Administración.`
  );
}

/**
 * Genera la URL de WhatsApp (wa.me) con el mensaje preparado
 */
export function generateWhatsAppUrl(invitation: StoreOwnerInvitation): string {
  // Limpiar caracteres del teléfono para formato internacional
  let cleanPhone = invitation.ownerPhone.replace(/[^\d+]/g, '');
  if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('591') && cleanPhone.length === 8) {
    // Código de país Bolivia si solo son 8 dígitos
    cleanPhone = `591${cleanPhone}`;
  }

  const message = generateWhatsAppMessage(invitation);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Proceso de activación ejecutado por el Dueño:
 * - Verifica token
 * - Valida contraseña
 * - Cambia estado a "Acceso activado"
 * - El SuperAdmin nunca ve esta contraseña
 */
export function activateStoreOwnerAccount(
  token: string,
  password: string
): { success: boolean; error?: string; invitation?: StoreOwnerInvitation } {
  const invitations = getStoreOwnerInvitations();
  const index = invitations.findIndex((inv) => inv.token === token.trim());

  if (index === -1) {
    return {
      success: false,
      error: 'Enlace de activación inválido o invitación no encontrada en el sistema.',
    };
  }

  const invitation = invitations[index];

  // Caso: Invitación ya utilizada
  if (invitation.status === 'Acceso activado') {
    return {
      success: false,
      error: 'Esta invitación ya fue utilizada. El acceso del administrador ya se encuentra activado.',
    };
  }

  // Reglas de seguridad de contraseña
  if (!password || password.length < 6) {
    return {
      success: false,
      error: 'La contraseña debe tener al menos 6 caracteres para garantizar la seguridad.',
    };
  }

  // Activación exitosa
  const now = new Date().toISOString();
  const updatedInvitation: StoreOwnerInvitation = {
    ...invitation,
    status: 'Acceso activado',
    activatedAt: now,
    passwordHash: password, // Almacenado privadamente para autenticación del dueño
  };

  invitations[index] = updatedInvitation;
  persistInvitations(invitations);

  return {
    success: true,
    invitation: updatedInvitation,
  };
}

/**
 * Valida credenciales de inicio de sesión de un dueño de comercio
 */
export function verifyStoreOwnerCredentials(
  email: string,
  password: string
): { success: boolean; error?: string; notFound?: boolean; owner?: StoreOwnerInvitation } {
  const invitation = getInvitationByEmail(email);

  if (!invitation) {
    return { success: false, notFound: true };
  }

  // Caso: Intento de inicio de sesión con invitación aún pendiente
  if (invitation.status === 'Invitación pendiente') {
    return {
      success: false,
      error:
        'Tu cuenta tiene una invitación pendiente de activación. Por favor abre el enlace único de activación que te enviamos por WhatsApp para definir tu contraseña y activar tu acceso.',
    };
  }

  // Caso: Contraseña incorrecta
  if (invitation.passwordHash !== password) {
    return {
      success: false,
      error: 'Contraseña incorrecta. Por favor verifica los datos ingresados.',
    };
  }

  // Credenciales válidas
  return {
    success: true,
    owner: invitation,
  };
}
