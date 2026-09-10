import React, { useEffect, useState } from 'react';
import {
  Store as StoreIcon,
  ShoppingBag,
  ArrowLeft,
  History,
  Check,
  MessageCircle,
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

    // Limpieza inmediata del estado anterior para prevenir contaminación entre comercios
    setStore(null);
    setProfile(null);
    setAppearance(null);
    setProducts([]);
    setCategories([]);
    setProfessionals([]);
    setCartItems([]);
    setSelectedProduct(null);

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

  const isRestaurant = store.store_type === 'restaurante' || store.slug === 'restaurante-roma';
  const isFashion = store.store_type === 'moda' || store.slug === 'boutique-milano';
  const isServices = store.store_type === 'servicios' || store.slug === 'spa-zenit';
  const isRetail =
    store.store_type === 'retail' ||
    store.store_type === 'supermercado' ||
    store.slug === 'los-andes-express' ||
    store.slug?.includes('andes');

  const primaryColor = isFashion
    ? '#1c1917'
    : isServices
    ? '#059669'
    : isRetail
    ? '#2563eb'
    : isRestaurant
    ? (appearance.primaryColor && appearance.primaryColor !== '#2563eb' ? appearance.primaryColor : '#d97706')
    : (appearance.primaryColor || '#2563eb');
  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

  const getAccentClass = () => {
    if (store.slug?.includes('andes') || store.store_type === 'retail' || store.store_type === 'supermercado') {
      return 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300';
    }
    if (store.slug?.includes('spa') || store.store_type === 'servicios') {
      return 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300';
    }
    if (store.slug?.includes('milano') || store.store_type === 'moda') {
      return 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300';
    }
    return 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300';
  };

  // Cantidad de pedidos pasados del cliente en esta tienda
  const pastOrdersCount = getCustomerPlacedOrders(store.id).length;
  const pastAppointmentsCount = getCustomerAppointments(store.id).length;
  const totalCustomerActivity = pastOrdersCount + pastAppointmentsCount;

  return (
    <div
      className={`w-full min-h-screen flex flex-col ${
        isFashion
          ? 'bg-[#FAF8F5] dark:bg-[#101012] text-stone-900 dark:text-stone-100'
          : isServices
          ? 'bg-[#F4F7F4] dark:bg-[#09100C] text-stone-900 dark:text-stone-100'
          : isRetail
          ? 'bg-[#F4F7FB] dark:bg-[#070D18] text-slate-900 dark:text-slate-100'
          : isRestaurant
          ? 'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100'
          : 'bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* BARRA DE NAVEGACIÓN EXCLUSIVA DE LA TIENDA */}
      <header
        className={`border-b sticky top-0 z-30 transition-colors backdrop-blur-md ${
          isFashion
            ? 'border-stone-200/80 dark:border-stone-800/80 bg-[#FAF8F5]/90 dark:bg-[#101012]/90'
            : isServices
            ? 'border-emerald-900/10 dark:border-emerald-500/15 bg-[#F4F7F4]/90 dark:bg-[#09100C]/90'
            : isRetail
            ? 'border-blue-900/10 dark:border-blue-500/15 bg-[#F4F7FB]/90 dark:bg-[#070D18]/90'
            : isRestaurant
            ? 'border-stone-200 dark:border-stone-800/80 bg-white/80 dark:bg-stone-950/80'
            : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          {/* Micro-Botón de Retorno Minimalista */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 text-[11px] font-semibold transition-colors border border-stone-200 dark:border-stone-800 cursor-pointer"
            title="Volver a CentralBo"
          >
            <span>←</span>
            <span>CentralBo</span>
          </button>

          {/* Derecha: Utilidades unificadas */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. Un solo selector de tema */}
            <ThemeToggle />

            {/* 2. Acceso a pedidos / citas */}
            <button
              onClick={() => setIsOrdersHistoryOpen(true)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isFashion
                  ? 'border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-900'
                  : isServices
                  ? 'border-emerald-900/15 dark:border-emerald-500/20 text-stone-700 dark:text-stone-200 hover:bg-emerald-100/50 dark:hover:bg-[#121B15]'
                  : isRetail
                  ? 'border-blue-900/15 dark:border-blue-500/20 text-slate-700 dark:text-slate-200 hover:bg-blue-100/50 dark:hover:bg-[#0F172A]'
                  : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title="Ver mis pedidos o citas anteriores"
            >
              <History
                className={`w-3.5 h-3.5 ${
                  isFashion
                    ? 'text-stone-700 dark:text-rose-300'
                    : isServices
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : isRetail
                    ? 'text-blue-600 dark:text-blue-400'
                    : isRestaurant
                    ? 'text-amber-500'
                    : 'text-blue-500'
                }`}
              />
              <span>{isServices ? 'Mis Citas' : 'Mis Pedidos'}</span>
              {totalCustomerActivity > 0 && (
                <span
                  className={`w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${
                    isFashion
                      ? 'bg-stone-900 dark:bg-rose-500'
                      : isServices
                      ? 'bg-emerald-700'
                      : isRestaurant
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {totalCustomerActivity}
                </span>
              )}
            </button>

            {/* 3. Botón de Carrito / Canasta / Citas */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="public-store-cart-trigger"
              className={
                isFashion
                  ? 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-200 dark:text-stone-950 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer'
                  : isServices
                  ? 'bg-emerald-800 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer'
                  : isRestaurant
                  ? 'bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer'
                  : 'bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer'
              }
              title={isServices ? "Ver citas seleccionadas" : "Ver canasta de compras"}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isServices ? 'Citas' : 'Canasta'}</span>
              {totalCartCount > 0 && (
                <span
                  className={
                    isFashion
                      ? 'px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/20'
                      : isServices
                      ? 'px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-200 border border-emerald-500/30'
                      : 'px-1.5 py-0.2 bg-stone-950/30 text-white rounded text-[10px] font-bold'
                  }
                >
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Acceso para el dueño de la tienda si está autenticado */}
            {user?.tenantId === store.id && (
              <button
                onClick={() => navigate(`/admin/${store.id}`)}
                className={
                  isFashion
                    ? 'hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-200 transition cursor-pointer'
                    : isServices
                    ? 'hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-[#121B15] text-emerald-800 dark:text-emerald-300 border border-emerald-900/15 dark:border-emerald-500/20 hover:bg-emerald-100 transition cursor-pointer'
                    : 'hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 transition cursor-pointer'
                }
              >
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL: ESCALA COMPLETA Y ANCHO AMPLIO */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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

        {/* BARRA DE SELLOS DE ABASTECIMIENTO & ENTREGA (TRUST BADGES) PARA SUPERMERCADO / RETAIL */}
        {isRetail && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
            {[
              { icon: '⚡', title: 'Entrega lo más rápido posible', desc: 'Despacho directo a tu puerta' },
              { icon: '🥬', title: 'Frescura Diaria', desc: 'Selección rigurosa en frescos y lácteos' },
              { icon: '🏷️', title: 'Precios de Mercado', desc: 'Variedad, ofertas y ahorro real' },
              { icon: '🛡️', title: 'Confiabilidad y Seguridad', desc: 'En todas tus entregas a domicilio' },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-[#0F172A]/60 border border-blue-900/10 dark:border-blue-500/15 shadow-sm"
              >
                <span className="text-xl">{badge.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{badge.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BARRA DE SELLOS DE BIENESTAR (TRUST BADGES) PARA SERVICIOS / SPA */}
        {isServices && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
            {[
              { icon: '🌿', title: 'Cosmética Orgánica', desc: 'Fórmulas sin parabenos' },
              { icon: '🩺', title: 'Terapeutas Certificados', desc: 'Atención personalizada' },
              { icon: '🕯️', title: 'Cabinas Climatizadas', desc: 'Aromaterapia y música zen' },
              { icon: '⏱️', title: 'Puntualidad Estricta', desc: 'Turnos sin esperas' },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-[#121A15]/60 border border-emerald-900/10 dark:border-emerald-500/15 shadow-sm"
              >
                <span className="text-xl">{badge.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{badge.title}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BARRA DE SELLOS TEXTILES & CONFECCIÓN (TRUST BADGES) BAJO EL BANNER */}
        {isFashion && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
            {[
              { icon: '🧵', title: 'Confección Nacional', desc: 'Fibras selectas y acabados finos' },
              { icon: '📐', title: 'Calce & Tallas Reales', desc: 'Guía de medidas en centímetros' },
              { icon: '🔄', title: 'Cambio Ágil de Talla', desc: 'Coordinación directa por WhatsApp' },
              { icon: '📦', title: 'Empaque de Boutique', desc: 'Protección para prendas delicadas' },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-stone-900/50 border border-stone-200/70 dark:border-stone-800/70 shadow-sm"
              >
                <span className="text-xl">{badge.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{badge.title}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BARRA DE SELLOS ARTESANALES (TRUST BADGES) BAJO EL BANNER PARA RESTAURANTES */}
        {isRestaurant && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
            {[
              { icon: '🔥', title: 'Horno a la Leña', desc: 'Cocción tradicional' },
              { icon: '🌾', title: 'Masa Madre 48h', desc: 'Fermentación natural' },
              { icon: '📦', title: 'Envío Térmico', desc: 'Llega caliente a casa' },
              { icon: '🇮🇹', title: 'Receta Tradicional', desc: 'Ingredientes selectos' },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-stone-100/70 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800/60">
                <span className="text-xl">{badge.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{badge.title}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECCIÓN PRINCIPAL: CATÁLOGO PÚBLICO (Sección 2) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className={`text-lg font-bold ${
                isRestaurant || isFashion || isServices ? 'text-stone-900 dark:text-stone-100 font-serif' : 'text-slate-900 dark:text-white'
              }`}>
                {isRestaurant
                  ? 'La Carta & Especialidades'
                  : store.store_type === 'moda'
                  ? 'Colección & Catálogo'
                  : store.store_type === 'servicios'
                  ? 'Servicios & Tratamientos Disponibles'
                  : isRetail
                  ? 'Pasillos & Despensa Disponible'
                  : 'Catálogo de Productos'}
              </h2>
              <p className={`text-xs ${isRestaurant || isFashion || isServices ? 'text-stone-500 dark:text-stone-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {isRestaurant
                  ? 'Pizzas al horno de barro, pastas artesanales y recetas de trattoria para ordenar directo.'
                  : store.store_type === 'servicios'
                  ? 'Reserva tu sesión de bienestar y cosmética botánica con agendamiento directo.'
                  : isRetail
                  ? 'Abarrotes, lácteos, limpieza y productos esenciales con entrega directa en tu domicilio.'
                  : 'Explora las opciones y realiza tu pedido directo sin necesidad de registro.'}
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

        {/* CARRUSEL FOTOGRÁFICO: GALERÍA & AMBIENTE DEL RESTAURANTE */}
        {isRestaurant && (
          <section className="my-14">
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Nuestra Cocina & Espacio
              </span>
              <h3 className="text-xl font-black text-stone-900 dark:text-white">
                Conoce la experiencia en Gourmet Roma
              </h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
              {[
                {
                  url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
                  label: 'Horno de piedra artesanal',
                },
                {
                  url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80',
                  label: 'Salón principal & Cava',
                },
                {
                  url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
                  label: 'Pastas hechas a mano',
                },
                {
                  url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
                  label: 'Terraza exterior',
                },
              ].map((photo, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0 w-72 h-44 rounded-2xl overflow-hidden relative group border border-stone-200 dark:border-stone-800"
                >
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-semibold">{photo.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BLOQUE DE ATENCIÓN PERSONALIZADA (PERSONAL SHOPPER) & AMBIENTE (EL ATELIER) PARA MODA */}
        {isFashion && (
          <>
            <div className="my-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-100 via-stone-50 to-[#F5EFEB] dark:from-[#181615] dark:via-[#141312] dark:to-[#1A1817] border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Atención Personalizada
                </span>
                <h4 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  ¿Dudas con tu talla o combinación?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl">
                  Nuestra asesora de estilo te asiste en tiempo real para confirmar medidas exactas y coordinar tu pedido.
                </p>
              </div>
              <a
                href={
                  profile.whatsapp
                    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                        'Hola, quisiera asesoría personalizada de estilo y tallas en Milano Moda'
                      )}`
                    : 'https://wa.me/59171023456?text=Hola%2C%20quisiera%20asesor%C3%ADa%20personalizada%20de%20estilo%20y%20tallas%20en%20Milano%20Moda'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-200 dark:text-stone-950 font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>Hablar con una Asesora</span>
                <span>→</span>
              </a>
            </div>

            <section className="my-14">
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Nuestro Espacio & Estilo
                </span>
                <h3 className="text-xl font-black text-stone-900 dark:text-white">
                  El Atelier Milano Moda
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
                {[
                  {
                    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
                    label: 'Salón de Colecciones & Percheros',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
                    label: 'Corte Artesanal & Fibras Nobles',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
                    label: 'Campaña Editorial Otoño',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
                    label: 'Zona de Calce & Probadores',
                  },
                ].map((photo, i) => (
                  <div
                    key={i}
                    className="snap-start shrink-0 w-72 h-44 rounded-2xl overflow-hidden relative group border border-stone-200 dark:border-stone-800 shadow-sm"
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3.5">
                      <span className="text-white text-xs font-semibold">{photo.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* BLOQUE DE ATENCIÓN PERSONALIZADA & ESPACIOS ZEN PARA SALÓN & SPA ZENIT */}
        {isServices && (
          <>
            <div className="my-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-[#EBF3EB] to-stone-100 dark:from-[#101914] dark:via-[#131E18] dark:to-[#0E1511] border border-emerald-900/10 dark:border-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Atención Personalizada
                </span>
                <h4 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  ¿Dudas sobre el tratamiento ideal para ti?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl">
                  Consulta con nuestra cosmetóloga o terapeuta en vivo antes de reservar para definir la sesión que tu cuerpo necesita.
                </p>
              </div>
              <a
                href={
                  profile.whatsapp
                    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                        'Hola, quisiera asesoría personalizada sobre los tratamientos en Spa Zenit'
                      )}`
                    : 'https://wa.me/59173456123?text=Hola%2C%20quisiera%20asesor%C3%ADa%20personalizada%20sobre%20los%20tratamientos%20en%20Spa%20Zenit.'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>Consultar por WhatsApp</span>
                <span>→</span>
              </a>
            </div>

            <section className="my-14">
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Ambiente & Calma
                </span>
                <h3 className="text-xl font-black text-stone-900 dark:text-white">
                  Conoce los Espacios de Spa Zenit
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
                {[
                  {
                    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
                    label: 'Cabina de Masajes & Piedras Calientes',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
                    label: 'Área Facial & Dermoestética',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80',
                    label: 'Zona de Hidroterapia & Infusiones',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
                    label: 'Recepción Botánica & Aromaterapia',
                  },
                ].map((photo, i) => (
                  <div
                    key={i}
                    className="snap-start shrink-0 w-72 h-44 rounded-2xl overflow-hidden relative group border border-emerald-900/10 dark:border-emerald-500/15 shadow-sm"
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3.5">
                      <span className="text-white text-xs font-semibold">{photo.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* SECCIÓN ADICIONAL PARA SUPERMERCADO / RETAIL */}
        {isRetail && (
          <>
            {/* CTA BANNER: PEDIDO POR LISTA DE WHATSAPP */}
            <section className="mt-12 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
                    <span>⚡</span>
                    <span>Abastecimiento Rápido</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    ¿Tienes una lista de compras larga?
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
                    Envíanos tu lista escrita o una foto directa por WhatsApp. Nuestro equipo armará tu pedido al instante con los mejores precios del mercado y confirmará el total contigo.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${profile?.phone ? profile.phone.replace(/[^0-9]/g, '') : '59170000000'}?text=${encodeURIComponent(
                    `¡Hola ${profile?.name || store.name}! Quiero enviar mi lista de compras para cotizar y coordinar el despacho a domicilio.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar lista por WhatsApp</span>
                </a>
              </div>
            </section>

            {/* CARRUSEL DE PASILLOS, VARIEDAD & ENVÍOS */}
            <section className="mt-10 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Pasillos, Variedad & Envíos
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Frescura & Calidad Garantizada
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
                {[
                  {
                    url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
                    label: 'Frutas & Verduras Seleccionadas',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
                    label: 'Lácteos, Quesos & Embutidos',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
                    label: 'Despensa, Granos & Abarrotes',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
                    label: 'Despacho Exprés & Empaque Seguro',
                  },
                ].map((photo, i) => (
                  <div
                    key={i}
                    className="snap-start shrink-0 w-72 h-44 rounded-2xl overflow-hidden relative group border border-blue-900/10 dark:border-blue-500/15 shadow-sm"
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3.5">
                      <span className="text-white text-xs font-semibold">{photo.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* 3. FIRMA DE PIE DE PÁGINA ("Powered by CentralBo") */}
      <footer
        className={`border-t mt-14 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full ${
          isFashion
            ? 'border-stone-200/80 dark:border-stone-800/80'
            : isServices
            ? 'border-emerald-900/10 dark:border-emerald-500/15'
            : isRetail
            ? 'border-blue-900/10 dark:border-blue-500/15'
            : 'border-stone-200 dark:border-stone-800/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Lado Izquierdo (Comercio) */}
          <p className="text-stone-500 dark:text-stone-400 font-normal">
            © 2026 {profile.name || store.name} · Todos los derechos reservados.
          </p>

          {/* Lado Derecho (Sello de Plataforma CentralBo) */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-medium transition-colors cursor-pointer"
          >
            <span>Potenciado por</span>
            <span className="font-black text-stone-900 dark:text-white">CentralBo</span>
            <span className={`font-bold ml-1 transition-colors ${getAccentClass()}`}>
              · Crea tu tienda digital →
            </span>
          </button>
        </div>
      </footer>

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
                style={!isFashion ? { backgroundColor: primaryColor } : undefined}
                className={
                  isFashion
                    ? 'px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-200 dark:text-stone-950 font-bold text-[11px] shadow transition cursor-pointer'
                    : 'px-3 py-1.5 rounded-xl text-white font-bold text-[11px] shadow hover:opacity-90 transition cursor-pointer'
                }
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
            style={!isFashion ? { backgroundColor: primaryColor } : undefined}
            className={
              isFashion
                ? 'flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-200 dark:text-stone-950 font-bold text-xs shadow-2xl transition cursor-pointer border border-stone-800 dark:border-stone-200'
                : 'flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl text-white font-bold text-xs shadow-xl hover:opacity-95 transition cursor-pointer border border-white/20'
            }
            title="Ver los productos en tu canasta acumulativa"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span
                className={
                  isFashion
                    ? 'absolute -top-2.5 -right-2.5 min-w-5 h-5 px-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/20 text-[11px] font-black flex items-center justify-center shadow'
                    : 'absolute -top-2.5 -right-2.5 min-w-5 h-5 px-1 rounded-full bg-white text-slate-950 text-[11px] font-black flex items-center justify-center shadow'
                }
              >
                {totalCartCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                Canasta ({totalCartCount} {totalCartCount === 1 ? 'unidad' : 'unidades'})
              </p>
              <PriceDisplay
                amount={cartSubtotal}
                size="sm"
                className={isFashion ? 'text-white dark:text-stone-950 font-black' : 'text-white'}
              />
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
