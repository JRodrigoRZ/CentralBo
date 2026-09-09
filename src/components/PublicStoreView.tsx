import React, { useEffect, useState } from 'react';
import {
  Store as StoreIcon,
  ShoppingBag,
  ArrowLeft,
  History,
  Check,
} from 'lucide-react';
import {
  Store,
  StoreProfileSettings,
  StoreAppearanceSettings,
  StoreScheduleDay,
  StoreShippingSettings,
  StoreScheduledOrdersSettings,
  StorePaymentSettings,
  Product,
  Category,
  ProfessionalItem,
  FashionSettings,
  GeneralSettings,
} from '../types';
import { resolveStoreBySlug } from '../lib/multiTenantService';
import {
  getStoreProfile,
  getStoreAppearance,
  getStoreSchedule,
  getStoreShipping,
  getStoreScheduledOrders,
  getStorePaymentSettings,
  getStoreProducts,
  getStoreCategories,
  getStoreProfessionals,
  getFashionSettings,
  getGeneralSettings,
} from '../lib/storeAdminService';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useStorePWA } from '../lib/pwaTenantService';

// Subcomponentes del Módulo 5
import { PublicStoreHeader } from './publicStore/PublicStoreHeader';
import { CatalogView } from './publicStore/CatalogView';
import { ProductDetailModal } from './publicStore/ProductDetailModal';
import { CartDrawer } from './publicStore/CartDrawer';
import { CheckoutModal } from './publicStore/CheckoutModal';
import { ServiceBookingModal } from './publicStore/ServiceBookingModal';
import { FashionSizeGuideModal } from './publicStore/FashionSizeGuideModal';
import { CustomerOrdersModal } from './publicStore/CustomerOrdersModal';
import {
  getTenantCart,
  saveTenantCart,
  clearTenantCart,
  getCustomerPlacedOrders,
  getCustomerAppointments,
} from './publicStore/cartStorage';
import { CartItem } from './publicStore/types';
import { ThemeToggle } from './ThemeToggle';
import { PriceDisplay } from './common/PriceDisplay';

interface PublicStoreViewProps {
  slug: string;
}

export const PublicStoreView: React.FC<PublicStoreViewProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const { user } = useAuth();

  // Estados de datos de la tienda
  const [store, setStore] = useState<Store | null>(null);
  const [profile, setProfile] = useState<StoreProfileSettings | null>(null);
  const [appearance, setAppearance] = useState<StoreAppearanceSettings | null>(null);
  const [schedule, setSchedule] = useState<StoreScheduleDay[]>([]);
  const [shipping, setShipping] = useState<StoreShippingSettings | null>(null);
  const [scheduledOrders, setScheduledOrders] = useState<StoreScheduledOrdersSettings | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<StorePaymentSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [fashionSettings, setFashionSettings] = useState<FashionSettings | null>(null);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Estados del Carrito y Modales
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cartToast, setCartToast] = useState<{
    productName: string;
    quantity: number;
    price: number;
  } | null>(null);

  // Modal de Detalle de Producto
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modal de Solicitud de Cita (Servicios)
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);

  // Modal Guía de Tallas (Moda)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Modal Historial de Pedidos del Cliente
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);

  // Auto-cierre de la notificación de producto agregado
  useEffect(() => {
    if (cartToast) {
      const timer = setTimeout(() => {
        setCartToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [cartToast]);

  // Inyección reactiva y aislamiento del Web App Manifest específico de este comercio
  useStorePWA(
    store
      ? {
          id: store.id,
          name: profile?.name || store.name,
          slug: store.slug,
          logoUrl: profile?.logoUrl || store.logo_url,
          description: profile?.description,
          primaryColor: appearance?.primaryColor,
        }
      : null
  );

  // Cargar datos de la tienda según el slug
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setNotFound(false);

    resolveStoreBySlug(slug)
      .then((resolved) => {
        if (!mounted) return;
        if (resolved) {
          setStore(resolved);

          // Cargar configuración y catálogo aislado por tenant_id
          const tenantId = resolved.id;
          const prof = getStoreProfile(tenantId);
          const app = getStoreAppearance(tenantId);
          const sch = getStoreSchedule(tenantId);
          const shp = getStoreShipping(tenantId);
          const sco = getStoreScheduledOrders(tenantId);
          const paySet = getStorePaymentSettings(tenantId);
          const prods = getStoreProducts(tenantId, resolved.store_type);
          const cats = getStoreCategories(tenantId, resolved.store_type);
          const profs = getStoreProfessionals(tenantId);
          const fsh = getFashionSettings(tenantId);
          const gen = getGeneralSettings(tenantId);

          setProfile(prof);
          setAppearance(app);
          setSchedule(sch);
          setShipping(shp);
          setScheduledOrders(sco);
          setPaymentSettings(paySet);
          setProducts(prods);
          setCategories(cats);
          setProfessionals(profs);
          setFashionSettings(fsh);
          setGeneralSettings(gen);

          // Cargar carrito local del tenant
          const savedCart = getTenantCart(tenantId);
          setCartItems(savedCart);

          // Revisar si la URL trae un hash como #prod-123 para abrir el producto directamente
          if (window.location.hash.startsWith('#prod-')) {
            const targetProdId = window.location.hash.replace('#prod-', '');
            const targetProd = prods.find((p) => p.id === targetProdId);
            if (targetProd) {
              setSelectedProduct(targetProd);
            }
          }
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  // Manejadores del Carrito (Canasta acumulativa)
  const handleAddToCart = (item: CartItem, openDrawer: boolean = false) => {
    if (!store) return;
    setCartItems((prev) => {
      // Verificar si ya existe el mismo producto con idénticas opciones y variantes
      const existingIndex = prev.findIndex(
        (it) =>
          it.productId === item.productId &&
          (it.selectedSize || '') === (item.selectedSize || '') &&
          (it.selectedColor?.name || '') === (item.selectedColor?.name || '') &&
          JSON.stringify(it.selectedModifiers || []) === JSON.stringify(item.selectedModifiers || []) &&
          (it.kitchenNotes || '').trim().toLowerCase() === (item.kitchenNotes || '').trim().toLowerCase() &&
          (it.serviceDetails?.professionalName || '') === (item.serviceDetails?.professionalName || '')
      );

      let updated: CartItem[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
      } else {
        updated = [...prev, item];
      }

      saveTenantCart(store.id, updated);
      return updated;
    });

    setCartToast({
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const handleQuickAddToCart = (product: Product) => {
    if (!store) return;
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      basePrice: product.price,
      quantity: 1,
      imageUrl: product.image_url,
      storeType: store.store_type,
    };
    handleAddToCart(item, false);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (!store) return;
    setCartItems((prev) => {
      let updated: CartItem[];
      if (newQty <= 0) {
        updated = prev.filter((it) => it.id !== itemId);
      } else {
        updated = prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it));
      }
      saveTenantCart(store.id, updated);
      return updated;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!store) return;
    setCartItems((prev) => {
      const updated = prev.filter((it) => it.id !== itemId);
      saveTenantCart(store.id, updated);
      return updated;
    });
  };

  const handleClearCart = () => {
    if (!store) return;
    clearTenantCart(store.id);
    setCartItems([]);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = () => {
    setCartItems([]);
  };

  const handleRequestAppointment = (serviceId?: string) => {
    setBookingServiceId(serviceId);
    setIsBookingOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          Cargando tienda "{slug}"...
        </p>
      </div>
    );
  }

  if (notFound || !store || !profile || !appearance || !shipping || !scheduledOrders) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs transition-colors">
        <StoreIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Comercio no encontrado</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          No existe ningún comercio activo registrado con el slug{' '}
          <code className="text-blue-600 dark:text-blue-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            "{slug}"
          </code>.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio de CentralBo
        </button>
      </div>
    );
  }

  const primaryColor = appearance.primaryColor || '#2563eb';
  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

  // Cantidad de pedidos pasados del cliente en esta tienda
  const pastOrdersCount = getCustomerPlacedOrders().filter((o) => o.tenantId === store.id).length;
  const pastAppointmentsCount = getCustomerAppointments().filter((a) => a.tenant_id === store.id).length;
  const totalCustomerActivity = pastOrdersCount + pastAppointmentsCount;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Barra superior de navegación y utilidades públicas */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al portal CentralBo</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Selector de Tema */}
          <ThemeToggle />

          {/* Botón de Mis Pedidos & Reservas */}
          <button
            onClick={() => setIsOrdersHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition cursor-pointer"
            title="Ver mis pedidos o citas en este comercio"
          >
            <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Mis Pedidos & Citas</span>
            {totalCustomerActivity > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {totalCustomerActivity}
              </span>
            )}
          </button>

          {/* Botón rápido si es administrador de este tenant */}
          {user?.tenantId === store.id && (
            <button
              onClick={() => navigate(`/admin/${store.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
            >
              <span>Panel de Mi Tienda</span>
            </button>
          )}
        </div>
      </div>

      {/* CABECERA PÚBLICA DE LA TIENDA (Sección 1) */}
      <PublicStoreHeader
        store={store}
        profile={profile}
        schedule={schedule}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersHistoryOpen(true)}
        primaryColor={primaryColor}
      />

      {/* SECCIÓN PRINCIPAL: CATÁLOGO PÚBLICO (Sección 2) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {store.store_type === 'restaurante'
                ? 'Menú del Restaurante'
                : store.store_type === 'moda'
                ? 'Colección & Catálogo'
                : store.store_type === 'servicios'
                ? 'Servicios & Tratamientos Disponibles'
                : 'Catálogo de Productos'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explora las opciones y realiza tu pedido directo sin necesidad de registro.
            </p>
          </div>
        </div>

        <CatalogView
          storeType={store.store_type}
          products={products}
          categories={categories}
          fashionSettings={fashionSettings || undefined}
          generalSettings={generalSettings || undefined}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onQuickAddToCart={handleQuickAddToCart}
          onRequestAppointment={
            store.store_type === 'servicios'
              ? (serviceId) => handleRequestAppointment(serviceId)
              : undefined
          }
          onOpenSizeGuide={
            store.store_type === 'moda' && fashionSettings
              ? () => setIsSizeGuideOpen(true)
              : undefined
          }
          primaryColor={primaryColor}
        />
      </div>

      {/* NOTIFICACIÓN TOAST: PRODUCTO AGREGADO */}
      {cartToast && (
        <div
          id="cart-added-toast"
          className="fixed bottom-24 right-4 sm:right-6 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-auto p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-emerald-500/40 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                ¡{cartToast.quantity} {cartToast.quantity === 1 ? 'unidad agregada' : 'unidades agregadas'}!
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                {cartToast.productName} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalCartCount} {totalCartCount === 1 ? 'unidad' : 'unidades'}</span> en canasta
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-toast-continue"
                onClick={() => setCartToast(null)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition cursor-pointer"
                title="Seguir comprando"
              >
                Seguir
              </button>
              <button
                type="button"
                id="btn-toast-view-cart"
                onClick={() => {
                  setCartToast(null);
                  setIsCartOpen(true);
                }}
                style={{ backgroundColor: primaryColor }}
                className="px-3 py-1.5 rounded-xl text-white font-bold text-[11px] shadow hover:opacity-90 transition cursor-pointer"
                title="Abrir el carrito"
              >
                Ver Carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE DEL CARRITO (Mobile & Desktop) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <button
            id="floating-cart-btn"
            onClick={() => setIsCartOpen(true)}
            style={{ backgroundColor: primaryColor }}
            className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl text-white font-bold text-xs shadow-xl hover:opacity-95 transition cursor-pointer border border-white/20"
            title="Ver los productos en tu canasta acumulativa"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2.5 -right-2.5 min-w-5 h-5 px-1 rounded-full bg-white text-slate-950 text-[11px] font-black flex items-center justify-center shadow">
                {totalCartCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                Canasta ({totalCartCount} {totalCartCount === 1 ? 'unidad' : 'unidades'})
              </p>
              <PriceDisplay amount={cartSubtotal} size="sm" className="text-white" />
            </div>
          </button>
        </div>
      )}

      {/* MODAL: DETALLE DEL PRODUCTO */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          storeType={store.store_type}
          fashionSettings={fashionSettings || undefined}
          onAddToCart={(item) => handleAddToCart(item, false)}
          onOpenCart={() => setIsCartOpen(true)}
          onRequestAppointment={
            store.store_type === 'servicios'
              ? (serviceId) => {
                  setSelectedProduct(null);
                  handleRequestAppointment(serviceId);
                }
              : undefined
          }
          onOpenSizeGuide={
            store.store_type === 'moda' && fashionSettings
              ? () => setIsSizeGuideOpen(true)
              : undefined
          }
          onClose={() => setSelectedProduct(null)}
          primaryColor={primaryColor}
        />
      )}

      {/* DRAWER: CARRITO DE COMPRAS */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        primaryColor={primaryColor}
      />

      {/* MODAL: CHECKOUT DE PEDIDO */}
      {isCheckoutOpen && (
        <CheckoutModal
          store={store}
          profile={profile}
          shippingSettings={shipping}
          scheduledSettings={scheduledOrders}
          paymentSettings={paymentSettings}
          items={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCompleted={handleOrderCompleted}
          primaryColor={primaryColor}
        />
      )}

      {/* MODAL: SOLICITUD DE CITA (SERVICIOS) */}
      {isBookingOpen && (
        <ServiceBookingModal
          tenantId={store.id}
          storeName={store.name}
          storeWhatsapp={profile.whatsapp || profile.phone || ''}
          services={products.filter((p) => p.status === 'activo')}
          professionals={professionals}
          preselectedServiceId={bookingServiceId}
          onClose={() => setIsBookingOpen(false)}
        />
      )}

      {/* MODAL: GUÍA DE TALLAS & CAMBIOS (MODA) */}
      {isSizeGuideOpen && fashionSettings && (
        <FashionSizeGuideModal
          settings={fashionSettings}
          onClose={() => setIsSizeGuideOpen(false)}
        />
      )}

      {/* MODAL: MIS PEDIDOS & CITAS */}
      {isOrdersHistoryOpen && (
        <CustomerOrdersModal
          tenantId={store.id}
          storeName={store.name}
          storeWhatsapp={profile.whatsapp || profile.phone || ''}
          onClose={() => setIsOrdersHistoryOpen(false)}
        />
      )}
    </div>
  );
};
