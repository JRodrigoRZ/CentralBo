import { StoreType } from '../../types';

export interface CartModifier {
  name: string;
  price: number;
}

export interface CartColorVariant {
  name: string;
  hex: string;
}

export interface CartItem {
  id: string; // unique item entry in cart
  productId: string;
  name: string;
  price: number; // base price + modifier increments if any
  basePrice: number;
  quantity: number;
  imageUrl: string | null;
  storeType: StoreType;
  // Moda
  selectedSize?: string;
  selectedColor?: CartColorVariant;
  // Restaurante
  selectedModifiers?: CartModifier[];
  kitchenNotes?: string;
  isCombo?: boolean;
  comboItems?: string[];
  // Servicios
  isService?: boolean;
  serviceDetails?: {
    durationMinutes: number;
    specialty: string;
    professionalId?: string;
    professionalName?: string;
  };
}

export type CheckoutDeliveryMethod = 'delivery' | 'pickup';

export type CheckoutPaymentMethod = 'transferencia' | 'qr' | 'acordado' | 'contra_entrega';

export interface CustomerSavedProfile {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  reference: string;
  city: string;
}

export interface CheckoutFormData {
  customerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  deliveryMethod: CheckoutDeliveryMethod;
  deliveryAddress: string;
  deliveryReference: string;
  pickupNotes: string;
  // Pedidos Programados
  isScheduled: boolean;
  scheduledDate: string;
  scheduledSlot: string;
  // Pagos
  paymentMethod: CheckoutPaymentMethod;
  // Promociones
  promoCode: string;
  appliedDiscount: number;
  discountDescription: string;
  // Notas generales
  orderNotes: string;
  saveProfileForFuture: boolean;
}

export interface PlacedOrderRecord {
  id: string;
  orderNumber: string;
  tenantId: string;
  storeName: string;
  storeSlug: string;
  storePhone: string;
  storeWhatsapp: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  deliveryMethod: CheckoutDeliveryMethod;
  deliveryAddress?: string;
  deliveryReference?: string;
  pickupNotes?: string;
  isScheduled: boolean;
  scheduledDate?: string;
  scheduledSlot?: string;
  paymentMethod: CheckoutPaymentMethod;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  createdAt: string;
  status: 'pendiente' | 'recibido' | 'pagado' | 'en_preparacion' | 'despachado' | 'completado' | 'cancelado';
}
