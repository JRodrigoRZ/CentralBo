import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Store as StoreIcon,
  ShoppingBag,
  Utensils,
  Sparkles,
  ArrowRight,
  UserCheck,
  ShoppingCart,
  CheckCircle2,
  MessageCircle,
  Smartphone,
  Check,
  Compass,
  MapPin,
  Clock,
  Layers,
  Package,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Shirt,
  Briefcase,
  Globe,
  Tag,
  Search,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Lock,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { getPublicStores } from '../lib/multiTenantService';
import { Store, StoreType } from '../types';
import { ContactSection } from './ContactSection';
import { DashboardShowcaseSection } from './landing/DashboardShowcaseSection';
import { ThreeStepsDemoSection } from './landing/ThreeStepsDemoSection';
import { AgenteMaxShowcaseSection } from './landing/AgenteMaxShowcaseSection';
import { PlanesPreciosSection } from './landing/PlanesPreciosSection';
import { trackCommercialEvent } from '../lib/commercialTrackingService';

interface StoreCardMetadata {
  icon: React.ElementType;
  cat: string;
  badge: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  iconBg: string;
  iconColor: string;
}

const getCardMetadata = (store: { slug?: string; store_type?: string; name?: string }): StoreCardMetadata => {
  const identifier = `${store.slug || ''} ${store.store_type || ''} ${store.name || ''}`.toLowerCase();

  // Vertical restaurante / gastronomía
  if (identifier.includes('roma') || identifier.includes('restaurante') || identifier.includes('gastronom')) {
    return {
      icon: Utensils,
      cat: 'Gastronomía & Restaurante',
      badge: 'Menú & Delivery',
      accentBg: 'bg-amber-50 dark:bg-amber-950/60',
      accentBorder: 'border-amber-200 dark:border-amber-700/60',
      accentText: 'text-amber-700 dark:text-amber-300',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 dark:border dark:border-amber-700/50',
      iconColor: 'text-amber-700 dark:text-amber-300',
    };
  }

  // Vertical moda / boutique
  if (identifier.includes('milano') || identifier.includes('moda') || identifier.includes('boutique') || identifier.includes('ropa')) {
    return {
      icon: Shirt,
      cat: 'Moda & Boutique',
      badge: 'Colección & Calzado',
      accentBg: 'bg-rose-50 dark:bg-rose-950/60',
      accentBorder: 'border-rose-200 dark:border-rose-700/60',
      accentText: 'text-rose-700 dark:text-rose-300',
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 dark:border dark:border-rose-700/50',
      iconColor: 'text-rose-700 dark:text-rose-300',
    };
  }

  // Vertical servicios profesionales / bienestar
  if (identifier.includes('zenit') || identifier.includes('spa') || identifier.includes('servicio') || identifier.includes('salud')) {
    return {
      icon: Sparkles,
      cat: 'Servicios Profesionales',
      badge: 'Citas & Atención',
      accentBg: 'bg-teal-50 dark:bg-teal-950/60',
      accentBorder: 'border-teal-200 dark:border-teal-700/60',
      accentText: 'text-teal-700 dark:text-teal-300',
      iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 dark:border dark:border-teal-700/50',
      iconColor: 'text-teal-700 dark:text-teal-300',
    };
  }

  // Comercio general por omisión
  return {
    icon: ShoppingBag,
    cat: 'Comercio General',
    badge: 'Catálogo Activo',
    accentBg: 'bg-blue-50 dark:bg-blue-950/60',
    accentBorder: 'border-blue-200 dark:border-blue-700/60',
    accentText: 'text-blue-700 dark:text-blue-300',
    iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 dark:border dark:border-blue-700/50',
    iconColor: 'text-blue-700 dark:text-blue-300',
  };
};

/**
 * Componente de logotipo oficial y auténtico para comercios en la vitrina.
 * Utiliza el logo oficial registrado en Supabase o el recurso auténtico local,
 * garantizando proporciones intactas, fondo nítido y visibilidad de alto contraste
 * en modo claro y modo oscuro.
 */
function StoreCardLogo({ store }: { store: Store }) {
  const localAsset = useMemo(() => {
    const slug = (store.slug || '').toLowerCase();
    const name = (store.name || '').toLowerCase();
    if (slug.includes('sushi') || name.includes('sushi')) {
      return '/assets/stores/sushibill-logo.webp';
    }
    if (slug.includes('gloria') || name.includes('gloria')) {
      return '/assets/stores/tienda-gloria-logo.png';
    }
    return null;
  }, [store.slug, store.name]);

  const candidateUrl = (store.logo_url && store.logo_url.trim()) || localAsset;
  const [currentSrc, setCurrentSrc] = useState<string | null>(candidateUrl);
  const [hasFailed, setHasFailed] = useState<boolean>(!candidateUrl);

  useEffect(() => {
    const nextUrl = (store.logo_url && store.logo_url.trim()) || localAsset;
    setCurrentSrc(nextUrl);
    setHasFailed(!nextUrl);
  }, [store.logo_url, localAsset]);

  const handleImageError = () => {
    if (currentSrc !== localAsset && localAsset) {
      setCurrentSrc(localAsset);
    } else {
      setHasFailed(true);
    }
  };

  if (!hasFailed && currentSrc) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 dark:border-slate-700/70 shadow-xs overflow-hidden flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform duration-200">
        <img
          src={currentSrc}
          alt={`Logotipo oficial de ${store.name}`}
          width={56}
          height={56}
          decoding="async"
          className="w-full h-full object-contain"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200">
      {store.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

const NEUTRAL_DEMO_STORE: Store = {
  id: 'demo-neutral',
  name: 'Comercio Local MAXINEGO',
  slug: 'comercio-ejemplo',
  store_type: 'general',
  status: 'prueba',
  logo_url: null,
  created_at: '',
  updated_at: '',
};

interface HeroMockupShowcase {
  id: string;
  name: string;
  slug: string;
  initials: string;
  category: string;
  badge: string;
  schedule: string;
  location: string;
  headerGradient: string;
  avatarBg: string;
  badgeBg: string;
  badgeText: string;
  categories: string[];
  products: Array<{
    id: string;
    name: string;
    desc: string;
    price: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
  }>;
  cartDefaultCount: number;
  cartDefaultTotal: string;
  isDemo?: boolean;
}

const getHeroStoreShowcase = (store: Store): HeroMockupShowcase => {
  const meta = getCardMetadata(store);
  const type = (store.store_type || '').toLowerCase();
  const slug = (store.slug || '').toLowerCase();
  const name = (store.name || '').toLowerCase();
  const initials = (store.name || 'CB').slice(0, 2).toUpperCase();

  // Caso: Gastronomía / Restaurante / Sushi
  if (type === 'restaurante' || type.includes('gastro') || slug.includes('sushi') || name.includes('sushi') || name.includes('roma')) {
    const isSushi = slug.includes('sushi') || name.includes('sushi');
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      initials,
      category: isSushi ? 'Sushi & Gastronomía' : 'Gastronomía & Restaurante',
      badge: 'Menú & Delivery',
      schedule: '12:00 - 22:30',
      location: 'Zona Central • Delivery activo',
      headerGradient: 'from-amber-500/15 via-rose-500/10 to-blue-500/10',
      avatarBg: 'bg-amber-600 text-white',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
      badgeText: 'text-amber-700 dark:text-amber-300',
      categories: isSushi
        ? ['Rolls Especiales', 'Combos & Tablas', 'Bebidas']
        : ['Platos Fuertes', 'Pastas Frescas', 'Bebidas'],
      products: isSushi
        ? [
            {
              id: 'p1',
              name: 'Combo Especial Premium (24 piezas)',
              desc: 'Rolls con salmón fresco, palta hass y queso crema.',
              price: 'Bs 68.00',
              icon: Utensils,
              iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/50',
              iconColor: 'text-amber-700 dark:text-amber-300',
            },
            {
              id: 'p2',
              name: 'Roll Tempura Crocante',
              desc: 'Langostino apanado, palta y salsa teriyaki artesanal.',
              price: 'Bs 34.00',
              icon: Utensils,
              iconBg: 'bg-orange-100 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800/50',
              iconColor: 'text-orange-700 dark:text-orange-300',
            },
          ]
        : [
            {
              id: 'p1',
              name: 'Plato Especial Gourmet de la Casa',
              desc: 'Preparación artesanal con ingredientes frescos seleccionados.',
              price: 'Bs 48.00',
              icon: Utensils,
              iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/50',
              iconColor: 'text-amber-700 dark:text-amber-300',
            },
            {
              id: 'p2',
              name: 'Postre Artesanal Tradicional',
              desc: 'Receta clásica servida con crema suave y reducción especial.',
              price: 'Bs 25.00',
              icon: ShoppingBag,
              iconBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/50',
              iconColor: 'text-rose-700 dark:text-rose-300',
            },
          ],
      cartDefaultCount: 2,
      cartDefaultTotal: isSushi ? 'Bs 102.00' : 'Bs 73.00',
      isDemo: store.id === 'demo-neutral',
    };
  }

  // Caso: Moda / Boutique / Ropa
  if (type === 'moda' || type.includes('boutique') || slug.includes('moda') || name.includes('boutique') || name.includes('milano')) {
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      initials,
      category: 'Moda & Colecciones',
      badge: 'Colección & Calzado',
      schedule: '10:00 - 20:00',
      location: 'Galería Comercial • Envíos locales',
      headerGradient: 'from-rose-500/15 via-purple-500/10 to-blue-500/10',
      avatarBg: 'bg-rose-600 text-white',
      badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
      badgeText: 'text-rose-700 dark:text-rose-300',
      categories: ['Nueva Temporada', 'Prendas Superiores', 'Calzado'],
      products: [
        {
          id: 'p1',
          name: 'Prenda de Temporada Confort',
          desc: 'Confección prémium en tejido suave con corte moderno y versátil.',
          price: 'Bs 160.00',
          icon: Shirt,
          iconBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/50',
          iconColor: 'text-rose-700 dark:text-rose-300',
        },
        {
          id: 'p2',
          name: 'Calzado Casual Anatómico',
          desc: 'Plantilla de confort con acabados resistentes y diseño contemporáneo.',
          price: 'Bs 195.00',
          icon: ShoppingBag,
          iconBg: 'bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/50',
          iconColor: 'text-purple-700 dark:text-purple-300',
        },
      ],
      cartDefaultCount: 2,
      cartDefaultTotal: 'Bs 355.00',
      isDemo: store.id === 'demo-neutral',
    };
  }

  // Caso: Servicios / Salud / Bienestar
  if (type === 'servicios' || type.includes('spa') || slug.includes('servicio') || name.includes('spa') || name.includes('zenit')) {
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      initials,
      category: 'Servicios Profesionales',
      badge: 'Citas & Atención',
      schedule: '08:30 - 18:30',
      location: 'Atención Profesional • Agenda Online',
      headerGradient: 'from-teal-500/15 via-emerald-500/10 to-blue-500/10',
      avatarBg: 'bg-teal-600 text-white',
      badgeBg: 'bg-teal-100 dark:bg-teal-900/50',
      badgeText: 'text-teal-700 dark:text-teal-300',
      categories: ['Sesiones Individuales', 'Paquetes', 'Consultoría'],
      products: [
        {
          id: 'p1',
          name: 'Sesión Integral de Bienestar (60 min)',
          desc: 'Atención personalizada y protocolo terapéutico individual.',
          price: 'Bs 150.00',
          icon: Sparkles,
          iconBg: 'bg-teal-100 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800/50',
          iconColor: 'text-teal-700 dark:text-teal-300',
        },
        {
          id: 'p2',
          name: 'Evaluación y Diagnóstico Inicial',
          desc: 'Consulta preliminar con plan de seguimiento y pautas.',
          price: 'Bs 90.00',
          icon: Briefcase,
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/50',
          iconColor: 'text-emerald-700 dark:text-emerald-300',
        },
      ],
      cartDefaultCount: 1,
      cartDefaultTotal: 'Bs 150.00',
      isDemo: store.id === 'demo-neutral',
    };
  }

  // Comercio General / Retail / MAXINEGO Demo
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    initials,
    category: meta.cat || 'Comercio Local',
    badge: meta.badge || 'Catálogo Activo',
    schedule: '09:00 - 21:00',
    location: 'Atención en Línea • Envíos locales',
    headerGradient: 'from-blue-500/15 via-indigo-500/10 to-emerald-500/10',
    avatarBg: 'bg-blue-600 text-white',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
    badgeText: 'text-blue-700 dark:text-blue-300',
    categories: ['Productos Destacados', 'Ofertas', 'Novedades'],
    products: [
      {
        id: 'p1',
        name: 'Pack Selección Especial',
        desc: 'Surtido de productos seleccionados con entrega local rápida.',
        price: 'Bs 65.00',
        icon: Package,
        iconBg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/50',
        iconColor: 'text-blue-700 dark:text-blue-300',
      },
      {
        id: 'p2',
        name: 'Artículo Destacado de Temporada',
        desc: 'Disponibilidad inmediata en inventario y garantía local.',
        price: 'Bs 38.00',
        icon: ShoppingBag,
        iconBg: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/50',
        iconColor: 'text-indigo-700 dark:text-indigo-300',
      },
    ],
    cartDefaultCount: 2,
    cartDefaultTotal: 'Bs 103.00',
    isDemo: store.id === 'demo-neutral',
  };
};

/**
 * Avatar SVG exclusivo de Agente Max
 * Representa al robot asistente con el emblema MN en el pecho y visor digital cian.
 */
function AgenteMaxAvatar({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <div className={`relative ${className} shrink-0`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Antena con luz cian pulsante */}
        <circle cx="32" cy="7" r="3" fill="#38BDF8" />
        <path d="M32 10V17" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Auriculares / Orejeras */}
        <rect x="7" y="27" width="5" height="12" rx="2.5" fill="#38BDF8" />
        <rect x="52" y="27" width="5" height="12" rx="2.5" fill="#38BDF8" />
        
        {/* Cabeza metálica blanca redondeada */}
        <rect x="11" y="16" width="42" height="33" rx="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        
        {/* Visor digital oscuro */}
        <rect x="16" y="22" width="32" height="18" rx="8" fill="#0B132B" />
        
        {/* Ojos cian expresivos y brillantes */}
        <circle cx="25" cy="30" r="3" fill="#38BDF8" />
        <circle cx="26" cy="29" r="1" fill="#FFFFFF" />
        <circle cx="39" cy="30" r="3" fill="#38BDF8" />
        <circle cx="40" cy="29" r="1" fill="#FFFFFF" />
        
        {/* Sonrisa digital sutil */}
        <path d="M29 35.5C30.5 36.8 33.5 36.8 35 35.5" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Torso / Base con el logotipo de MAXINEGO (MN) */}
        <path d="M19 49C19 49 22 59 32 59C42 59 45 49 45 49H19Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
        <text
          x="32"
          y="56.5"
          textAnchor="middle"
          fill="#2563EB"
          fontSize="6.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
        >
          MN
        </text>
      </svg>
      {/* Indicador de conexión en vivo */}
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-sm" />
    </div>
  );
}

const SHOWCASE_VERTICALS = {
  restaurante: {
    id: 'restaurante' as const,
    name: 'Trattoria Roma • Menú & Pastas',
    shortName: 'Trattoria Roma',
    slug: 'trattoria-roma',
    initials: 'TR',
    rubro: 'Gastronomía & Pastas',
    badge: 'Menú & Delivery',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60',
    location: 'Av. Principal #450, Centro Comercial',
    schedule: '12:00 - 22:30 • Mar a Dom',
    headerGradient: 'from-amber-500/15 via-orange-500/10 to-rose-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/30',
    avatarBg: 'bg-gradient-to-br from-amber-600 to-orange-600 text-white',
    categories: ['Pastas Frescas', 'Especialidades', 'Postres'],
    products: [
      {
        id: 'r1',
        name: 'Fettuccine ai Funghi Porcini',
        desc: 'Pasta fresca al huevo con reducción de setas porcini, crema y parmesano reggiano.',
        price: 'Bs 52.00',
        icon: Utensils,
        iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      },
      {
        id: 'r2',
        name: 'Lasaña Boloñesa Tradicional',
        desc: 'Capas de pasta al huevo con ragú clásico cocido lentamente y bechamel gratinada.',
        price: 'Bs 48.00',
        icon: Utensils,
        iconBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
      },
      {
        id: 'r3',
        name: 'Tiramisú Artesanal Italiano',
        desc: 'Savoiardi bañados en espresso, mascarpone cremoso y cacao amargo espolvoreado.',
        price: 'Bs 26.00',
        icon: ShoppingBag,
        iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      },
    ],
    cartCount: 3,
    cartTotal: 'Bs 126.00',
    features: [
      {
        title: 'Dirección web exclusiva',
        desc: 'maxinego.app/tienda/trattoria-roma para compartir en WhatsApp, Instagram y folletos.',
      },
      {
        title: 'Catálogo con precios en Bs',
        desc: 'Fotos de cada plato, descripciones e ingredientes claros para ordenar sin dudas.',
      },
      {
        title: 'Categorías organizadas',
        desc: 'Pastas, especialidades y postres ordenados para navegación rápida.',
      },
      {
        title: 'Pedido directo a WhatsApp',
        desc: 'El cliente arma su orden y llega a tu chat con el desglose exacto y total a cobrar.',
      },
    ],
    mobilePreview: {
      headline: 'Pedido listo para WhatsApp',
      items: ['2x Fettuccine ai Funghi', '1x Tiramisú Artesanal'],
      total: 'Bs 126.00',
    },
  },
  moda: {
    id: 'moda' as const,
    name: 'Boutique Milano • Tendencias',
    shortName: 'Boutique Milano',
    slug: 'boutique-milano',
    initials: 'BM',
    rubro: 'Moda & Colecciones',
    badge: 'Nueva Colección',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60',
    location: 'Galería Central, Local 12 • Envíos a todo el país',
    schedule: '10:00 - 20:00 • Lun a Sáb',
    headerGradient: 'from-rose-500/15 via-purple-500/10 to-blue-500/10 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-blue-950/30',
    avatarBg: 'bg-gradient-to-br from-rose-600 to-purple-600 text-white',
    categories: ['Nueva Temporada', 'Prendas Superiores', 'Calzado'],
    products: [
      {
        id: 'm1',
        name: 'Blusa Satinada Confort',
        desc: 'Corte contemporáneo con tejido suave, acabado satinado y caída elegante.',
        price: 'Bs 145.00',
        icon: Shirt,
        iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      },
      {
        id: 'm2',
        name: 'Vestido Midi de Lino Natural',
        desc: 'Tejido 100% lino transpirable con silueta fluida y lazo ajustable a la cintura.',
        price: 'Bs 210.00',
        icon: Shirt,
        iconBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
      },
      {
        id: 'm3',
        name: 'Calzado Casual Anatómico',
        desc: 'Plantilla de confort ergonómica con suela ligera y acabados resistentes.',
        price: 'Bs 195.00',
        icon: ShoppingBag,
        iconBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
      },
    ],
    cartCount: 2,
    cartTotal: 'Bs 355.00',
    features: [
      {
        title: 'Vitrina visual de moda',
        desc: 'maxinego.app/tienda/boutique-milano lista para colocar en el perfil de Instagram y TikTok.',
      },
      {
        title: 'Detalle de prendas y tallas',
        desc: 'Fotografías de prendas, tallas vigentes y precios en Bs sin mensajes privados.',
      },
      {
        title: 'Colecciones de temporada',
        desc: 'Organiza por vestidos, prendas superiores, accesorios y calzado con un toque.',
      },
      {
        title: 'Compra y envío por WhatsApp',
        desc: 'Tus clientes seleccionan sus prendas y coordinan el despacho y pago en tu chat.',
      },
    ],
    mobilePreview: {
      headline: 'Pedido listo para WhatsApp',
      items: ['1x Blusa Satinada Confort', '1x Vestido Midi de Lino'],
      total: 'Bs 355.00',
    },
  },
  servicios: {
    id: 'servicios' as const,
    name: 'Zenit Studio • Spa & Estética',
    shortName: 'Zenit Studio',
    slug: 'zenit-studio',
    initials: 'ZS',
    rubro: 'Servicios Profesionales',
    badge: 'Citas & Atención',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800/60',
    location: 'Edificio Los Olivos, Piso 3 • Agenda Online',
    schedule: '08:30 - 18:30 • Lun a Sáb',
    headerGradient: 'from-teal-500/15 via-emerald-500/10 to-blue-500/10 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-blue-950/30',
    avatarBg: 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white',
    categories: ['Sesiones de Spa', 'Tratamientos Faciales', 'Paquetes'],
    products: [
      {
        id: 's1',
        name: 'Masaje Terapéutico Integral (60 min)',
        desc: 'Terapia relajante con aceites esenciales naturales y aromaterapia guiada.',
        price: 'Bs 150.00',
        icon: Sparkles,
        iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800/60',
      },
      {
        id: 's2',
        name: 'Limpieza Facial Profunda con Hidratación',
        desc: 'Exfoliación suave, ultrasonido indoloro y mascarilla nutritiva regeneradora.',
        price: 'Bs 180.00',
        icon: Sparkles,
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      },
      {
        id: 's3',
        name: 'Evaluación y Diagnóstico Inicial',
        desc: 'Consulta preliminar especializada con plan de cuidados para el hogar.',
        price: 'Bs 80.00',
        icon: Briefcase,
        iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      },
    ],
    cartCount: 1,
    cartTotal: 'Bs 150.00',
    features: [
      {
        title: 'Agenda de servicios online',
        desc: 'maxinego.app/tienda/zenit-studio disponible para compartir con pacientes y clientes.',
      },
      {
        title: 'Protocolos y tarifas claras',
        desc: 'Duración de cada sesión, beneficios del tratamiento y tarifas transparentes.',
      },
      {
        title: 'Paquetes y sesiones individuales',
        desc: 'Filtra fácilmente entre masajes, tratamientos faciales o paquetes combinados.',
      },
      {
        title: 'Solicitud directa de reserva',
        desc: 'El cliente selecciona el servicio deseado y coordina día y hora por WhatsApp.',
      },
    ],
    mobilePreview: {
      headline: 'Cita lista para WhatsApp',
      items: ['1x Masaje Terapéutico Integral'],
      total: 'Bs 150.00',
    },
  },
  billar: {
    id: 'billar' as const,
    name: 'Club Billar Imperial • Mesas & Bar',
    shortName: 'Club Billar Imperial',
    slug: 'club-billar-imperial',
    initials: 'CB',
    rubro: 'Billar, Torneos & Salón',
    badge: 'Club & Mesas',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
    location: 'Av. Las Américas #310 • Zona Central',
    schedule: '14:00 - 02:00 • Todos los días',
    headerGradient: 'from-emerald-500/15 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/30',
    avatarBg: 'bg-gradient-to-br from-emerald-700 to-teal-800 text-white',
    categories: ['Mesas & Turnos', 'Snacks & Bebidas', 'Accesorios de Juego'],
    products: [
      {
        id: 'b1',
        name: 'Mesa Profesional de Billar (1 hora)',
        desc: 'Mesa de paño profesional con bolas reglamentarias, tiza y soporte de descanso.',
        price: 'Bs 35.00',
        icon: Sparkles,
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      },
      {
        id: 'b2',
        name: 'Tabla de Piqueo & Bebidas Especiales',
        desc: 'Variedad de embutidos, quesos artesanales y bebidas para compartir con tu mesa.',
        price: 'Bs 45.00',
        icon: Utensils,
        iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      },
      {
        id: 'b3',
        name: 'Taco Desmontable Profesional',
        desc: 'Taco de madera seleccionada con rosca de acero y suela laminada de alta precisión.',
        price: 'Bs 180.00',
        icon: ShoppingBag,
        iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      },
    ],
    cartCount: 2,
    cartTotal: 'Bs 80.00',
    features: [
      {
        title: 'Gestión y reserva de mesas',
        desc: 'maxinego.app/tienda/club-billar-imperial para consultar turnos y reservar mesas.',
      },
      {
        title: 'Catálogo de bar y snacks',
        desc: 'Bebidas, piqueos y consumos del club con precios transparentes.',
      },
      {
        title: 'Torneos y categorías',
        desc: 'Información de torneos y alquiler de equipamiento especializado.',
      },
      {
        title: 'Reservas por WhatsApp',
        desc: 'Los jugadores eligen su mesa o consumiciones y confirman su visita por WhatsApp.',
      },
    ],
    mobilePreview: {
      headline: 'Turno listo para WhatsApp',
      items: ['1x Mesa Profesional (1 hr)', '1x Tabla de Piqueo & Bebidas'],
      total: 'Bs 80.00',
    },
  },
  general: {
    id: 'general' as const,
    name: 'Market Central • Variedades & Abarrotes',
    shortName: 'Market Central',
    slug: 'market-central',
    initials: 'MC',
    rubro: 'Comercio General & Despensa',
    badge: 'Comercio General',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/60',
    location: 'Mercado Nuevo, Puesto 45 • Envíos a domicilio',
    schedule: '07:30 - 21:00 • Lun a Dom',
    headerGradient: 'from-sky-500/15 via-blue-500/10 to-indigo-500/10 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-indigo-950/30',
    avatarBg: 'bg-gradient-to-br from-sky-600 to-blue-700 text-white',
    categories: ['Despensa Básica', 'Bebidas & Lácteos', 'Limpieza & Hogar'],
    products: [
      {
        id: 'g1',
        name: 'Pack Abarrotes de la Semana',
        desc: 'Arroz seleccionado, fideos premium, aceite vegetal y condimentos esenciales.',
        price: 'Bs 65.00',
        icon: Package,
        iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
      },
      {
        id: 'g2',
        name: 'Cesta de Frutas & Verduras Frescas',
        desc: 'Selección fresca del día empacada y lista para consumo en el hogar.',
        price: 'Bs 40.00',
        icon: ShoppingBag,
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      },
      {
        id: 'g3',
        name: 'Combo Bebidas & Refrescos',
        desc: 'Variedad de jugos naturales y refrescos en presentación familiar.',
        price: 'Bs 30.00',
        icon: StoreIcon,
        iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      },
    ],
    cartCount: 2,
    cartTotal: 'Bs 105.00',
    features: [
      {
        title: 'Vitrina digital para tiendas de barrio',
        desc: 'maxinego.app/tienda/market-central para que los vecinos compren por celular.',
      },
      {
        title: 'Precios actualizados en tiempo real',
        desc: 'Actualiza stocks y precios en Bs sin imprimir listas de papel.',
      },
      {
        title: 'Variedad multirubro',
        desc: 'Organiza abarrotes, artículos del hogar, bebidas y productos de temporada.',
      },
      {
        title: 'Pedidos inmediatos',
        desc: 'Llegan organizados al WhatsApp para preparar el despacho rápidamente.',
      },
    ],
    mobilePreview: {
      headline: 'Pedido listo para WhatsApp',
      items: ['1x Pack Abarrotes Semana', '1x Cesta Frutas Frescas'],
      total: 'Bs 105.00',
    },
  },
};

export const PortalHome: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rubroFiltro, setRubroFiltro] = useState<'todos' | 'restaurante' | 'moda' | 'servicios' | 'general'>('todos');
  const [previewTab, setPreviewTab] = useState<'restaurante' | 'moda' | 'servicios' | 'billar' | 'general'>('restaurante');
  const [showcaseAddedIds, setShowcaseAddedIds] = useState<Record<string, boolean>>({});

  const handleShowcaseAddToCart = (productId: string) => {
    setShowcaseAddedIds((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setShowcaseAddedIds((prev) => ({ ...prev, [productId]: false }));
    }, 1500);
  };

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getPublicStores()
      .then((data) => {
        if (mounted) {
          setStores(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[CentralBo PortalHome] Error al cargar comercios:', err);
        if (mounted) {
          setStores([]);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Escuchar hash en la URL para desplazamiento suave a secciones (ej. #faq, #carrusel-comercios, etc.)
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash) {
        const el = document.getElementById(hash);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    };

    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, []);

  const handleScrollToStores = (origin: string = 'hero_secundario') => {
    trackCommercialEvent('click_explorar_tiendas', { origin });
    const section = document.getElementById('carrusel-comercios') || document.getElementById('descubre-tiendas');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Estado y rotación del Mockup del Hero
  const heroStoreList = useMemo(() => {
    if (stores.length > 0) return stores;
    return [NEUTRAL_DEMO_STORE];
  }, [stores]);

  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [isHeroTransitioning, setIsHeroTransitioning] = useState<boolean>(false);
  const [isHeroPaused, setIsHeroPaused] = useState<boolean>(false);
  const [mockupHighlightZone, setMockupHighlightZone] = useState<'brand' | 'whatsapp' | 'commission' | null>(null);
  const [addedMockupIds, setAddedMockupIds] = useState<Record<string, boolean>>({});

  // Transición suave entre comercios cada 4.5 segundos (con pausa al ocultar pestaña para optimizar CPU y batería)
  useEffect(() => {
    if (heroStoreList.length <= 1 || isHeroPaused) return;

    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        setIsHeroTransitioning(true);
        setTimeout(() => {
          setHeroIndex((prev) => (prev + 1) % heroStoreList.length);
          setIsHeroTransitioning(false);
        }, 300);
      }, 4500);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (timer) clearInterval(timer);
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [heroStoreList.length, isHeroPaused]);

  const currentHeroStore = heroStoreList[heroIndex % heroStoreList.length];
  const heroShowcase = useMemo(() => getHeroStoreShowcase(currentHeroStore), [currentHeroStore]);

  const handleMockupAddToCart = (productId: string) => {
    setAddedMockupIds((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedMockupIds((prev) => ({ ...prev, [productId]: false }));
    }, 1500);
  };



  const handleCreateStore = (origin: string = 'hero_cta') => {
    trackCommercialEvent('click_crear_mi_tienda', { origin });
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', '#contacto');
    } else if (user) {
      if (profile === 'store_admin' && user.tenantId) {
        navigate(`/admin/${user.tenantId}`);
      } else {
        navigate('/admin');
      }
    } else {
      navigate('/login');
    }
  };

  const comerciosFiltrados = useMemo(() => {
    if (rubroFiltro === 'todos') return stores;
    return stores.filter((store: Store) => {
      const type = (store.store_type || '').toLowerCase();
      const slug = (store.slug || '').toLowerCase();
      const name = (store.name || '').toLowerCase();
      if (rubroFiltro === 'restaurante') {
        return type === 'restaurante' || type.includes('gastro') || slug.includes('restaurante') || name.includes('roma') || name.includes('trattoria');
      }
      if (rubroFiltro === 'moda') {
        return type === 'moda' || type.includes('boutique') || slug.includes('moda') || name.includes('milano') || name.includes('boutique');
      }
      if (rubroFiltro === 'servicios') {
        return type === 'servicios' || type.includes('spa') || slug.includes('servicio') || name.includes('zenit') || name.includes('spa');
      }
      if (rubroFiltro === 'general') {
        return type === 'retail' || type === 'supermercado' || type === 'general' || slug.includes('super') || name.includes('super');
      }
      return true;
    });
  }, [stores, rubroFiltro]);

  return (
    <main id="main-content" tabIndex={-1} className="w-full space-y-12 sm:space-y-16 lg:space-y-20 focus:outline-none">
      {/* ========================================================================= */}
      {/* 1. HERO — "Tu comercio local, ahora en digital."                           */}
      {/* ========================================================================= */}
      <section
        id="hero-section"
        className="w-full relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-[#F4F8FF] dark:bg-gradient-to-b dark:from-[#080d1f] dark:via-[#050916] dark:to-[#03050d] border border-blue-100/90 dark:border-blue-900/35 shadow-xl shadow-blue-900/5 dark:shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 text-slate-900 dark:text-white transition-colors"
      >
        {/* Luces y Halos Ambientales: Atenuados y suaves en modo claro, intensos de neón en modo oscuro */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/10 dark:bg-cyan-500/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-indigo-400/10 dark:bg-blue-600/25 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-violet-400/10 dark:bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/[0.02] to-indigo-500/[0.03] dark:via-cyan-500/[0.03] dark:to-blue-500/[0.05] pointer-events-none" />

        {/* Textura de puntos sutil: apenas perceptible en modo claro, cibernética en modo oscuro */}
        <div
          className="absolute inset-0 opacity-40 dark:opacity-100 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(37, 99, 235, 0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Estilos específicos y animaciones sutiles encapsuladas para el Hero */}
        <style>{`
          @keyframes heroFadeUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes heroGleamSweep {
            0%, 70% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }

          @keyframes heroCtaSheen {
            0%, 75% {
              transform: translateX(-160%) skewX(-20deg);
            }
            85%, 100% {
              transform: translateX(260%) skewX(-20deg);
            }
          }

          @keyframes floatSlow {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          .hero-anim-item-1 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
          .hero-anim-item-2 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
          .hero-anim-item-3 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
          .hero-anim-item-4 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
          .hero-anim-item-5 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both; }
          .hero-anim-mockup { animation: heroFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }

          .hero-gradient-text-gleam {
            background-image: linear-gradient(110deg, #1769ff 0%, #2563eb 30%, #7c3aed 60%, #1769ff 100%);
            background-size: 250% 100%;
            animation: heroGleamSweep 8s ease-in-out infinite;
          }
          :is(.dark .hero-gradient-text-gleam) {
            background-image: linear-gradient(110deg, #38bdf8 0%, #60a5fa 30%, #a78bfa 60%, #38bdf8 100%);
          }

          .hero-cta-sheen-sweep {
            animation: heroCtaSheen 7s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-anim-item-1,
            .hero-anim-item-2,
            .hero-anim-item-3,
            .hero-anim-item-4,
            .hero-anim-item-5,
            .hero-anim-mockup,
            .hero-gradient-text-gleam,
            .hero-cta-sheen-sweep {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}</style>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-10 xl:gap-14 items-center relative z-10">
          {/* Columna Izquierda: Mensaje Comercial Claro, Directo y de Gran Escala */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
            {/* 1. Distintivo de identidad / Kicker elegante */}
            <div className="hero-anim-item-1 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-cyan-400/35 text-blue-700 dark:text-cyan-300 text-xs font-semibold tracking-wide shadow-2xs dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 dark:bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-cyan-400" />
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                Plataforma para comercios y negocios locales
              </span>
            </div>

            {/* 2. Titular Principal (Máximo contraste y legibilidad inmediata en Modo Claro y Modo Oscuro) */}
            <h1 className="hero-anim-item-2 text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-black tracking-tight text-[#14213D] dark:text-white leading-[1.12]">
              Tu comercio local con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1769FF] via-[#2563EB] to-[#7C3AED] dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300 dark:drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]">
                tienda digital propia
              </span>{' '}
              y pedidos por WhatsApp.
            </h1>

            {/* 3. Subtítulo (Legible, nítido y balanceado) */}
            <p className="hero-anim-item-3 text-base sm:text-lg text-[#475569] dark:text-slate-300 leading-relaxed font-normal max-w-xl">
              Publica tu catálogo de productos y servicios, comparte tu propio enlace y atiende a tus clientes de manera directa, rápida y profesional.
            </p>

            {/* 4. Botones de Acción (CTAs Principales de Alto Contraste) */}
            <div className="hero-anim-item-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={handleCreateStore}
                className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-xl bg-[#1769FF] hover:bg-[#0f5adb] active:bg-[#0d4ec2] text-white text-sm sm:text-base font-bold shadow-[0_4px_16px_rgba(23,105,255,0.28)] hover:shadow-[0_6px_22px_rgba(23,105,255,0.38)] active:scale-[0.98] transition-all duration-200 cursor-pointer min-h-[48px] dark:bg-gradient-to-r dark:from-blue-600 dark:via-blue-500 dark:to-cyan-500 dark:hover:from-blue-500 dark:hover:to-cyan-400 dark:shadow-[0_0_25px_rgba(37,99,235,0.45)] dark:hover:shadow-[0_0_35px_rgba(34,211,238,0.6)]"
              >
                <StoreIcon className="w-4 h-4 shrink-0" />
                <span>Crear mi tienda</span>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                <span className="hero-cta-sheen-sweep absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              </button>

              <button
                type="button"
                onClick={handleScrollToStores}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-xl bg-white hover:bg-slate-50 text-[#14213D] hover:text-[#1769FF] text-sm sm:text-base font-semibold border border-slate-200/90 hover:border-slate-300 shadow-xs backdrop-blur-md transition-all duration-200 cursor-pointer min-h-[48px] dark:bg-slate-900/70 dark:hover:bg-slate-800/90 dark:text-slate-200 dark:hover:text-white dark:border-slate-700/80 dark:hover:border-slate-500/80"
              >
                <Compass className="w-4 h-4 text-[#1769FF] dark:text-cyan-400 transition-transform duration-300 group-hover:rotate-45 shrink-0" />
                <span>Explorar tiendas</span>
              </button>
            </div>

            {/* 5. Pilares de valor comercial interactivos con el mockup */}
            <div className="hero-anim-item-5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {/* Pilar 1: Marca propia */}
                <div
                  onMouseEnter={() => setMockupHighlightZone('brand')}
                  onMouseLeave={() => setMockupHighlightZone(null)}
                  className={`group p-3 rounded-xl border transition-all duration-200 cursor-default ${
                    mockupHighlightZone === 'brand'
                      ? 'bg-blue-50/90 border-[#1769FF] ring-1 ring-[#1769FF]/50 shadow-sm dark:bg-blue-950/80 dark:border-cyan-400/80 dark:shadow-[0_0_15px_rgba(34,211,238,0.25)] dark:ring-cyan-400/60'
                      : 'bg-white border-slate-200/90 hover:border-blue-200 shadow-xs dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        mockupHighlightZone === 'brand'
                          ? 'bg-[#1769FF] text-white dark:bg-cyan-500 dark:text-slate-950'
                          : 'bg-blue-50 text-[#1769FF] border border-blue-100 dark:bg-blue-900/50 dark:text-cyan-400 dark:border-blue-700/50'
                      }`}
                    >
                      <StoreIcon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-[#14213D] dark:text-white leading-tight">
                      Tu marca propia
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400 leading-snug">
                    Logotipo, identidad visual y enlace web exclusivo para tu negocio.
                  </p>
                </div>

                {/* Pilar 2: Pedidos por WhatsApp */}
                <div
                  onMouseEnter={() => setMockupHighlightZone('whatsapp')}
                  onMouseLeave={() => setMockupHighlightZone(null)}
                  className={`group p-3 rounded-xl border transition-all duration-200 cursor-default ${
                    mockupHighlightZone === 'whatsapp'
                      ? 'bg-emerald-50/90 border-emerald-400/80 ring-1 ring-emerald-400/60 shadow-sm dark:bg-emerald-950/80 dark:border-emerald-400/80 dark:shadow-[0_0_15px_rgba(52,211,153,0.25)] dark:ring-emerald-400/60'
                      : 'bg-white border-slate-200/90 hover:border-emerald-200 shadow-xs dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        mockupHighlightZone === 'whatsapp'
                          ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700/50'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-[#14213D] dark:text-white leading-tight">
                      Pedidos por WhatsApp
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400 leading-snug">
                    Detalle ordenado con productos y total, listo para despachar al instante.
                  </p>
                </div>

                {/* Pilar 3: Venta directa sin comisiones */}
                <div
                  onMouseEnter={() => setMockupHighlightZone('commission')}
                  onMouseLeave={() => setMockupHighlightZone(null)}
                  className={`group p-3 rounded-xl border transition-all duration-200 cursor-default ${
                    mockupHighlightZone === 'commission'
                      ? 'bg-purple-50/90 border-[#7C3AED] ring-1 ring-[#7C3AED]/50 shadow-sm dark:bg-blue-950/80 dark:border-cyan-400/80 dark:shadow-[0_0_15px_rgba(34,211,238,0.25)] dark:ring-cyan-400/60'
                      : 'bg-white border-slate-200/90 hover:border-purple-200 shadow-xs dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        mockupHighlightZone === 'commission'
                          ? 'bg-[#7C3AED] text-white dark:bg-cyan-500 dark:text-slate-950'
                          : 'bg-purple-50 text-[#7C3AED] border border-purple-100 dark:bg-blue-900/50 dark:text-cyan-400 dark:border-blue-700/50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-[#14213D] dark:text-white leading-tight">
                      Sin comisiones
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400 leading-snug">
                    El 100% de tus ventas es tuyo, sin comisiones por producto ni cobros ocultos.
                  </p>
                </div>
              </div>
            </div>

            {/* Chip de sesión activa si existe usuario */}
            {user && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck className="w-4 h-4 text-[#1769FF] dark:text-cyan-400 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400">Conectado como:</span>
                  <span className="font-semibold text-[#14213D] dark:text-white truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  {profile === 'store_admin' && user.tenantId && (
                    <button
                      onClick={() => navigate(`/admin/${user.tenantId}`)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Ir a mi tienda
                    </button>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Mockup de Computadora Portátil / Laptop con Badges Flotantes */}
          <div
            className="lg:col-span-6 relative hero-anim-mockup w-full max-w-xl mx-auto lg:max-w-none pt-4 lg:pt-0"
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
          >
            {/* Halo ambiental suave y difuso detrás de la laptop */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-400/15 via-indigo-400/10 to-violet-400/15 dark:from-cyan-500/20 dark:via-blue-600/25 dark:to-purple-600/20 rounded-3xl blur-2xl pointer-events-none opacity-70 dark:opacity-80" />

            {/* ================================================================= */}
            {/* BADGE FLOTANTE 1 (Superior Derecho): Notificación WhatsApp        */}
            {/* ================================================================= */}
            <div className="absolute -top-4 -right-2 sm:-top-5 sm:-right-4 z-20 bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-xl border border-emerald-200/90 dark:border-emerald-500/30 rounded-2xl p-2.5 sm:p-3 shadow-[0_10px_25px_rgba(16,185,129,0.12)] dark:shadow-[0_16px_35px_rgba(0,0,0,0.7),0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-3 animate-[floatSlow_6s_ease-in-out_infinite]">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/40 shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0 pr-1">
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>Pedidos en tiempo real</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  Directo a tu WhatsApp
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Notificación instantánea
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* BADGE FLOTANTE 2 (Lateral Izquierdo): 0% Comisiones              */}
            {/* ================================================================= */}
            <div className="absolute top-1/3 -left-3 sm:-left-5 z-20 hidden sm:flex bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-xl border border-blue-200/90 dark:border-cyan-500/30 rounded-2xl p-2.5 sm:p-3 shadow-[0_10px_25px_rgba(20,33,61,0.08)] dark:shadow-[0_16px_35px_rgba(0,0,0,0.7),0_0_15px_rgba(6,182,212,0.15)] items-center gap-2.5 animate-[floatSlow_7s_ease-in-out_infinite_1s]">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1769FF] border border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/40 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#14213D] dark:text-white leading-tight">
                  0% Comisiones
                </div>
                <div className="text-[10px] text-[#1769FF] dark:text-cyan-300 font-medium">
                  100% de tus ventas es tuyo
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* HARDWARE MOCKUP: Computadora Portátil / Laptop                     */}
            {/* ================================================================= */}
            <div className="relative">
              {/* Tapa Superior / Bisel de la Pantalla */}
              <div className="relative rounded-t-2xl sm:rounded-t-3xl bg-slate-100 dark:bg-[#0B1120] border-2 border-slate-300/80 dark:border-slate-700/80 shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] dark:ring-1 dark:ring-white/10 overflow-hidden transition-colors">
                {/* Cámara Web en el centro del marco superior */}
                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-slate-700 mx-auto mt-1.5 mb-1" />

                {/* Barra de Navegador dentro de la Pantalla */}
                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100/95 dark:bg-[#080D1A] border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between gap-2 transition-colors">
                  {/* Botones de control de ventana de Mac */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] shadow-sm" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] shadow-sm" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] shadow-sm" />
                  </div>

                  {/* Barra de dirección URL */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-700/70 text-[11px] font-mono text-slate-700 dark:text-slate-300 min-w-0 max-w-[200px] sm:max-w-[280px] truncate shadow-2xs">
                    <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">maxinego.app/tienda/{heroShowcase.slug}</span>
                  </div>

                  {/* Indicador "● Abierto ahora" */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      <span>Abierto ahora</span>
                    </span>
                  </div>
                </div>

                {/* Contenido Visual de la Tienda (con Transición Suave Fade/Slide) */}
                <div
                  className={`bg-white dark:bg-[#0B1222] text-slate-900 dark:text-slate-100 transition-all duration-350 ease-out ${
                    isHeroTransitioning
                      ? 'opacity-0 translate-y-2 scale-[0.995]'
                      : 'opacity-100 translate-y-0 scale-100'
                  }`}
                >
                  {/* Portada y Cabecera del Comercio */}
                  <div
                    className={`p-3.5 sm:p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/70 dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-[#101930] dark:to-slate-900/90 border-b border-slate-200/90 dark:border-slate-800/80 transition-all duration-300 ${
                      mockupHighlightZone === 'brand'
                        ? 'ring-2 ring-[#1769FF] bg-blue-50/90 dark:ring-cyan-400/80 dark:bg-blue-950/70 shadow-sm'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Logo / Avatar con micro-realce sutil */}
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${heroShowcase.avatarBg} font-extrabold text-base flex items-center justify-center shadow-md ring-2 ring-white/20 dark:ring-white/10 shrink-0 transition-all duration-300 ${
                            mockupHighlightZone === 'brand'
                              ? 'scale-105 ring-2 ring-[#1769FF] shadow-blue-500/30 dark:ring-cyan-400 dark:shadow-cyan-500/50'
                              : ''
                          }`}
                        >
                          {heroShowcase.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`text-sm sm:text-base font-bold truncate transition-colors duration-300 ${
                                mockupHighlightZone === 'brand'
                                  ? 'text-[#1769FF] dark:text-cyan-300'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {heroShowcase.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${heroShowcase.badgeBg} ${heroShowcase.badgeText}`}>
                              {heroShowcase.badge}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{heroShowcase.location}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{heroShowcase.schedule}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botón directo a la tienda pública */}
                      {!heroShowcase.isDemo && (
                        <button
                          type="button"
                          onClick={() => navigate(`/tienda/${heroShowcase.slug}`)}
                          title="Abrir tienda completa"
                          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs transition-all cursor-pointer shrink-0 hidden sm:flex items-center gap-1 text-[11px] font-semibold dark:bg-[#121B30] dark:hover:bg-[#182440] dark:text-slate-200 dark:hover:text-white dark:border-slate-700/70"
                        >
                          <span>Ver tienda</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Categorías de la Tienda */}
                  <div className="px-3.5 sm:px-4 py-2 bg-slate-50/90 dark:bg-[#080E1B] border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar transition-colors">
                    {heroShowcase.categories.map((catName, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-default transition ${
                          idx === 0
                            ? 'bg-[#1769FF] text-white shadow-xs dark:bg-blue-600 dark:shadow-[0_2px_8px_rgba(37,99,235,0.4)]'
                            : 'bg-white text-slate-600 border border-slate-200/90 dark:bg-[#0F172A] dark:text-slate-300 dark:border-slate-800 hover:dark:bg-[#16223B]'
                        }`}
                      >
                        {catName}
                      </span>
                    ))}
                  </div>

                  {/* Lista de Productos de la Vitrina */}
                  <div
                    className={`p-3 sm:p-3.5 space-y-2.5 transition-colors duration-300 ${
                      mockupHighlightZone === 'commission' ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    {heroShowcase.products.map((product) => {
                      const Icon = product.icon;
                      const isAdded = !!addedMockupIds[product.id];

                      return (
                        <div
                          key={product.id}
                          className={`p-3 rounded-xl bg-slate-50/80 dark:bg-[#0F182B] border border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between gap-3 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80 dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] shadow-2xs ${
                            mockupHighlightZone === 'commission'
                              ? 'border-[#1769FF] ring-1 ring-[#1769FF]/40 shadow-sm dark:border-cyan-400/80 dark:ring-1 dark:ring-cyan-400/50 dark:shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 ${product.iconBg}`}>
                              <Icon className={`w-5 h-5 ${product.iconColor}`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {product.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {product.desc}
                              </p>
                              <span
                                className={`inline-block mt-1 text-xs font-extrabold text-[#1769FF] dark:text-emerald-400 transition-all duration-300 ${
                                  mockupHighlightZone === 'commission'
                                    ? 'text-emerald-600 dark:text-emerald-300 font-black'
                                    : ''
                                }`}
                              >
                                {product.price}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleMockupAddToCart(product.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer active:scale-95 shadow-xs min-h-[32px] flex items-center justify-center gap-1 ${
                              isAdded
                                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                                : 'bg-[#1769FF] hover:bg-[#0f5adb] text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)]'
                            }`}
                          >
                            {isAdded ? '✓ Agregado' : '+ Agregar'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Barra Inferior de Pedido por WhatsApp */}
                  <div
                    className={`p-3 sm:p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50/90 dark:bg-gradient-to-r dark:from-[#062318] dark:via-[#092d20] dark:to-[#062318] border-t border-emerald-200/90 dark:border-emerald-600/30 flex items-center justify-between gap-2 transition-all duration-300 backdrop-blur-md ${
                      mockupHighlightZone === 'whatsapp'
                        ? 'ring-2 ring-emerald-500/80 bg-emerald-100/90 shadow-md scale-[1.005] dark:ring-emerald-400/90 dark:shadow-[0_0_20px_rgba(52,211,153,0.25)]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/25 transition-transform duration-300 dark:bg-emerald-500 dark:text-slate-950 dark:shadow-emerald-500/30 ${
                          mockupHighlightZone === 'whatsapp'
                            ? 'scale-110 shadow-emerald-400/40 ring-2 ring-emerald-300'
                            : ''
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[11px] sm:text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate">
                          Pedido listo para WhatsApp
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-300 font-medium truncate">
                          {heroShowcase.cartDefaultCount} productos • Total {heroShowcase.cartDefaultTotal}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!heroShowcase.isDemo) {
                          trackCommercialEvent('click_ver_tienda_catalogo', {
                            storeSlug: heroShowcase.slug,
                            storeName: heroShowcase.name,
                            origin: 'hero_mockup',
                          });
                          navigate(`/tienda/${heroShowcase.slug}`);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/25 flex items-center gap-1.5 shrink-0 transition cursor-pointer active:scale-95 min-h-[32px] dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 dark:shadow-emerald-500/30"
                    >
                      <span>Pedir ahora</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Barra de Control / Indicadores del Carrusel del Mockup */}
                {heroStoreList.length > 1 && (
                  <div className="px-3.5 sm:px-4 py-2 bg-slate-100/90 dark:bg-[#080D1A] border-t border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1769FF] dark:bg-cyan-400 animate-ping shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-300 truncate">
                        {heroShowcase.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                        ({heroIndex + 1}/{heroStoreList.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {heroStoreList.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => {
                            if (dotIdx === heroIndex) return;
                            setIsHeroTransitioning(true);
                            setTimeout(() => {
                              setHeroIndex(dotIdx);
                              setIsHeroTransitioning(false);
                            }, 150);
                          }}
                          aria-label={`Mostrar tienda ${dotIdx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            dotIdx === heroIndex
                              ? 'w-5 bg-[#1769FF] shadow-[0_0_8px_rgba(23,105,255,0.4)] dark:bg-cyan-400 dark:shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                              : 'w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chasis Base de la Computadora Portátil (Keyboard deck & lip) */}
              <div className="relative h-3.5 sm:h-4 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 rounded-b-xl border-t border-slate-300 dark:border-slate-700/80 shadow-[0_16px_35px_rgba(20,33,61,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-colors">
                {/* Muesca central para apertura de tapa */}
                <div className="w-20 sm:w-24 h-1.5 mx-auto bg-slate-400/80 dark:bg-slate-900 rounded-b-sm border-b border-slate-300 dark:border-slate-700/60" />
              </div>

              {/* ================================================================= */}
              {/* BADGE FLOTANTE 3 (Inferior Derecho): Agente Max Asistente IA     */}
              {/* ================================================================= */}
              <div className="absolute -bottom-6 -right-2 sm:-bottom-7 sm:-right-4 z-20 bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-xl border border-blue-100 dark:border-blue-500/30 rounded-2xl p-3 sm:p-3.5 shadow-[0_16px_35px_rgba(20,33,61,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(59,130,246,0.2)] flex items-center gap-3 sm:gap-3.5 max-w-[280px] sm:max-w-xs animate-[floatSlow_8s_ease-in-out_infinite_2s]">
                <AgenteMaxAvatar className="w-11 h-11 sm:w-12 sm:h-12" />
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#14213D] dark:text-white truncate">
                      Conoce a Agente Max
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-cyan-400 text-white dark:text-slate-950 uppercase shadow-2xs">
                      IA
                    </span>
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-slate-300 leading-tight mt-0.5">
                    Tu asistente inteligente para mejorar tu catálogo y hacer crecer tu negocio.
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#1769FF] dark:text-cyan-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    <span>Disponible en tu panel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* BLOQUE 1: ¿QUÉ ES MAXINEGO?                                               */}
      {/* Propósito comercial claro, sin repetir WhatsApp/0% comisiones del Hero     */}
      {/* ========================================================================= */}
      <section id="que-es-maxinego" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
        <div className="max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Conoce la Plataforma</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ¿Qué es MAXINEGO?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            MAXINEGO es la plataforma que permite a los comercios y negocios locales abrir su propia tienda en internet, exhibir sus catálogos con fotos y precios y conectar directamente con sus clientes de forma moderna, ágil y sin intermediarios.
          </p>
        </div>

        {/* 3 Pilares distintivos sobre qué es MAXINEGO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-blue-300/80 dark:hover:border-blue-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <StoreIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Tu tienda digital propia
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Un espacio web exclusivo con el nombre y logotipo de tu negocio, accesible desde cualquier teléfono o computadora sin obligar a tus clientes a instalar aplicaciones.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-emerald-300/80 dark:hover:border-emerald-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Catálogo claro y ordenado
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Muestra productos y servicios con fotografías, precios actualizados en Bolivianos y categorías organizadas para que tus clientes encuentren lo que buscan rápidamente.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-amber-300/80 dark:hover:border-amber-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Control total y autonomía
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Administra tu inventario, ajusta precios y activa o pausa artículos desde tu propio panel comercial de forma sencilla y en pocos segundos.
            </p>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* BLOQUE 2: ASÍ SE VE TU TIENDA                                             */}
      {/* Visualización del producto con tabs Gastronomía / Moda / Servicios         */}
      {/* ========================================================================= */}
      <section id="asi-se-ve-tu-tienda" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
        {/* Encabezado de la Sección con Selector de Verticales Compacto y Estético */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <StoreIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Tu Negocio en Digital</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Así se ve tu tienda en MAXINEGO
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tu comercio contará con una vitrina pública profesional diseñada para que tus clientes naveguen cómodamente, descubran lo que ofreces y hagan pedidos directos por WhatsApp.
            </p>
          </div>

          {/* 1. Recuadro Superior de Categorías: Compacto, estético, no dominante */}
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100/80 dark:bg-[#0c152a] rounded-xl border border-slate-200/80 dark:border-[#1a2846] text-xs self-start md:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setPreviewTab('restaurante')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                previewTab === 'restaurante'
                  ? 'bg-white dark:bg-[#152342] text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Utensils className="w-3 h-3 text-amber-500" />
              <span>Gastronomía</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('moda')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                previewTab === 'moda'
                  ? 'bg-white dark:bg-[#152342] text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shirt className="w-3 h-3 text-rose-500" />
              <span>Moda</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('servicios')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                previewTab === 'servicios'
                  ? 'bg-white dark:bg-[#152342] text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3 h-3 text-teal-500" />
              <span>Servicios</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('billar')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                previewTab === 'billar'
                  ? 'bg-white dark:bg-[#152342] text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="text-xs">🎱</span>
              <span>Billar</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('general')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                previewTab === 'general'
                  ? 'bg-white dark:bg-[#152342] text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <StoreIcon className="w-3 h-3 text-sky-500" />
              <span>General</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRODUCT SHOWCASE: Layout Dual (~35% Identidad y Valor / ~65% Mockup SaaS)  */}
        {/* ========================================================================= */}
        {(() => {
          const activeShowcase = SHOWCASE_VERTICALS[previewTab];
          const itemsList = activeShowcase.mobilePreview?.items?.length
            ? `\n\nProductos:\n${activeShowcase.mobilePreview.items.map((it) => `• ${it}`).join('\n')}`
            : '';
          const orderMsg = `Hola ${activeShowcase.shortName}, me gustaría ordenar los productos de mi carrito en MAXINEGO:${itemsList}\n\nTotal estimado: ${activeShowcase.cartTotal}`;
          const waUrl = `https://wa.me/59163527099?text=${encodeURIComponent(orderMsg)}`;

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Columna Izquierda (~35% en desktop, orden 2 en móvil): Identidad y Puntos de Valor */}
              <div className="order-2 lg:order-1 lg:col-span-5 space-y-4">
                {/* 3. Ficha Principal del Negocio con Indicadores ("Catálogo Activo" y "WhatsApp") Integrados Arriba */}
                <div className="rounded-2xl bg-white dark:bg-[#0c152a] border border-slate-200/90 dark:border-[#1c2a47] p-5 sm:p-6 shadow-sm space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-12 h-12 rounded-xl ${activeShowcase.avatarBg} font-extrabold text-base flex items-center justify-center shadow-md shrink-0 transition-transform duration-300 hover:scale-105`}>
                        {activeShowcase.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${activeShowcase.badgeClass}`}>
                            {activeShowcase.badge}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                          {activeShowcase.shortName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {activeShowcase.rubro}
                        </p>
                      </div>
                    </div>

                    {/* Indicadores Operativos Integrados Naturalmente en la Cabecera Superior */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 self-start">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Catálogo Activo</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-[10px] font-semibold">
                        <MessageCircle className="w-3 h-3 text-blue-500" />
                        <span>WhatsApp</span>
                      </span>
                    </div>
                  </div>

                  {/* Micro-datos de Ubicación y Horario */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-slate-100 dark:border-[#17243f] text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">{activeShowcase.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{activeShowcase.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Cuadro Rojo Eliminado Completamente: sección mucho más limpia y armónica */}

                {/* Tarjeta de Valor: Lo que incluye tu tienda pública */}
                <div className="rounded-2xl bg-white dark:bg-[#0c152a] border border-slate-200/90 dark:border-[#1c2a47] p-5 sm:p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Lo que incluye tu tienda pública
                  </h4>

                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                        <StoreIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Identidad y URL propia
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          Enlace directo para compartir en redes sociales, perfiles y estados de WhatsApp.
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Catálogo con precios en Bs
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          Precios transparentes y fotos claras para que el cliente decida sin preguntar por privado.
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Categorías organizadas
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          Filtros rápidos para que tu cliente explore tu oferta en segundos sin aburrirse.
                        </p>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Pedidos directos a WhatsApp
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          Carrito ágil que envía la orden desglosada y el total listo para coordinar el cobro.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón Inferior Completamente Funcional */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        trackCommercialEvent('click_explorar_tiendas', { origin: 'asi_se_ve_tu_tienda' });
                        const target = document.getElementById('comercios') || document.getElementById('carrusel-comercios');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          window.history.pushState(null, '', '#comercios');
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-150 cursor-pointer border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0c152a]"
                    >
                      <span>Explorar comercios activos en MAXINEGO</span>
                      <ArrowRight className="w-4 h-4 text-blue-100 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna Derecha (~65% en desktop, orden 1 en móvil): Vitrina Protagonista de la Tienda (Browser Window) */}
              <div className="order-1 lg:order-2 lg:col-span-7 rounded-2xl bg-white dark:bg-[#090f1d] border border-slate-200 dark:border-[#1e2e4f] shadow-lg overflow-hidden">
                {/* Barra de Navegador Superior (Chrome Window Header) */}
                <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-[#0e162a] border-b border-slate-200 dark:border-[#1c2c4d] flex items-center justify-between gap-3">
                  {/* Botones de Ventana macOS */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
                  </div>

                  {/* Barra de Dirección URL con Candado Seguro */}
                  <div className="flex-1 max-w-sm mx-auto">
                    <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-[#070d18] border border-slate-200/90 dark:border-[#1a2845] text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate">
                      <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-slate-400 dark:text-slate-400">maxinego.app/tienda/</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{activeShowcase.slug}</span>
                    </div>
                  </div>

                  {/* Estado "Abierto Ahora" */}
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>Abierto ahora</span>
                  </div>
                </div>

                {/* Cabecera Interna de la Tienda de Ejemplo */}
                <div className={`p-4 sm:p-5 bg-gradient-to-r ${activeShowcase.headerGradient} border-b border-slate-200/80 dark:border-[#1c2a47]`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl ${activeShowcase.avatarBg} font-extrabold text-sm flex items-center justify-center shadow-md shrink-0`}>
                        {activeShowcase.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {activeShowcase.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                          {activeShowcase.rubro} • {activeShowcase.location}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 shrink-0">
                      {/* Reflejo Tecnológico de IA en la cabecera del producto */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-white/90 dark:bg-[#0c152a]/90 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Impulsado por IA</span>
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-white/80 dark:bg-[#0c152a]/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1c2a47]">
                        {activeShowcase.schedule}
                      </span>
                    </div>
                  </div>

                  {/* Categorías de la Tienda (Pills de Navegación) */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/50 dark:border-white/10 overflow-x-auto pb-1 scrollbar-none">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white shadow-2xs shrink-0 cursor-default">
                      Todos los productos
                    </span>
                    {activeShowcase.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/90 dark:bg-[#121c33] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#1c2c4d] shrink-0 cursor-default hover:border-slate-300 dark:hover:border-slate-600"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Grilla de Productos Auténticos de la Tienda de Ejemplo */}
                <div className="p-4 sm:p-5 bg-slate-50/60 dark:bg-[#070c17]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                    {activeShowcase.products.map((prod) => {
                      const ProdIcon = prod.icon;
                      const isAdded = !!showcaseAddedIds[prod.id];
                      return (
                        <div
                          key={prod.id}
                          className="bg-white dark:bg-[#0d162a] border border-slate-200/90 dark:border-[#1c2c4d] rounded-xl p-3.5 flex flex-col justify-between hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all shadow-2xs group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${prod.iconBg}`}>
                                <ProdIcon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                                Disponible
                              </span>
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {prod.name}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 mt-1">
                                {prod.desc}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#17243f] flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">
                              {prod.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleShowcaseAddToCart(prod.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-500 text-white shadow-2xs scale-95'
                                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 active:scale-95'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Agregado</span>
                                </>
                              ) : (
                                <>
                                  <span>+ Agregar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Barra Inferior del Carrito y Envío Directo a WhatsApp (Completamente Funcional) */}
                <div className="px-4 py-3 bg-white dark:bg-[#0c152a] border-t border-slate-200 dark:border-[#1c2a47] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 w-full sm:w-auto">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {activeShowcase.mobilePreview.headline}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {activeShowcase.cartCount} items seleccionados • Total: {activeShowcase.cartTotal}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-end">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackCommercialEvent('apertura_whatsapp_comercial', {
                          origin: 'asi_se_ve_tu_tienda',
                          storeSlug: activeShowcase.slug,
                        });
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Enviar pedido por WhatsApp ({activeShowcase.cartTotal})</span>
                    </a>
                  </div>
                </div>

                {/* 4. Opción B: Franja "Impulsado por IA Agente Max" integrada bajo el botón de WhatsApp */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-50/90 via-sky-50/60 to-blue-50/90 dark:from-[#08182b] dark:via-[#0c223c] dark:to-[#08182b] border-t border-cyan-200/80 dark:border-cyan-800/40 flex items-center justify-between gap-3 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                    </span>
                    <span className="text-xs font-extrabold text-cyan-950 dark:text-cyan-100 tracking-tight flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>Impulsado por IA Agente Max</span>
                    </span>
                    <span className="hidden sm:inline-block text-[11px] text-cyan-800/70 dark:text-cyan-300/70 truncate">
                      • Catálogos optimizados en tiempo real
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-800 dark:text-cyan-300 bg-white/80 dark:bg-[#071626]/80 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/60 shrink-0 shadow-2xs">
                    <Zap className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    <span>Activo</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* BLOQUE 3: FUNCIONALIDADES EXISTENTES                                      */}
      {/* Responde: ¿Qué puedo hacer con MAXINEGO? Sin duplicaciones                */}
      {/* ========================================================================= */}
      <section id="capacidades" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Herramientas para tu negocio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tu negocio bajo control, desde un solo lugar.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Administra tus productos, organiza la atención y realiza el seguimiento de tus pedidos desde MAXINEGO.
          </p>
        </div>

        {/* Grilla Compacta de 3 Tarjetas de Administración */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Tarjeta 1: Productos */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all duration-200 hover:-translate-y-0.5 space-y-3.5 group flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/60 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Productos
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Actualiza tus productos, precios y disponibilidad.
              </p>
            </div>
          </div>

          {/* Tarjeta 2: Atención */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition-all duration-200 hover:-translate-y-0.5 space-y-3.5 group flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Atención
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Configura horarios, entregas y datos de tu negocio.
              </p>
            </div>
          </div>

          {/* Tarjeta 3: Pedidos */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-purple-400/60 dark:hover:border-purple-500/60 transition-all duration-200 hover:-translate-y-0.5 space-y-3.5 group flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/60 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Pedidos
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Consulta y gestiona los pedidos recibidos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* MÓDULO 3: PRESENTACIÓN AUTÉNTICA DEL DASHBOARD EN LA LANDING              */}
      {/* Exhibición en marco de computadora con colorimetría y diseño 100% real    */}
      {/* ========================================================================= */}
      <DashboardShowcaseSection />

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* MÓDULO 4: DEMOSTRACIÓN VISUAL DE LOS 3 PASOS                              */}
      {/* Crea tu tienda digital → Publica tu catálogo → Comparte y recibe pedidos  */}
      {/* ========================================================================= */}
      <ThreeStepsDemoSection />

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* MÓDULO 5: PRESENTACIÓN VISUAL DE AGENTE MAX                                */}
      {/* Asistente virtual inteligente dentro de las tiendas públicas              */}
      {/* ========================================================================= */}
      <AgenteMaxShowcaseSection />

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* MÓDULO 6: PLANES, PRECIOS Y COMPARACIÓN COMERCIAL                          */}
      {/* MAXINEGO BASIC y PRO: duraciones, precios y ahorros oficiales              */}
      {/* ========================================================================= */}
      <PlanesPreciosSection />

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* BLOQUE 4: COMERCIOS EN MAXINEGO                                           */}
      {/* Vitrina unificada de comercios: mantiene todos los comercios reales,       */}
      {/* categorías, filtros y enlaces, eliminando listados duplicados.            */}
      {/* ========================================================================= */}
      <section
        id="carrusel-comercios"
        className="w-full space-y-6 sm:space-y-8 scroll-mt-20"
      >
        {/* Anclas de compatibilidad para enlaces del Navbar y botones */}
        <div id="descubre-tiendas" className="scroll-mt-20" />
        <div id="comercios" className="scroll-mt-20" />

        {/* Encabezado comercial de la vitrina con explicación de tiendas independientes */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                Vitrina de Comercios Locales
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Tiendas 100% Independientes</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Comercios en MAXINEGO
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Descubre negocios locales en MAXINEGO. Cada comercio cuenta con su propia tienda digital, catálogo y experiencia de compra independiente, sin navegación directa hacia otros negocios desde su interior.
            </p>
          </div>

          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 self-start sm:self-auto shadow-2xs shrink-0">
            {stores.length} {stores.length === 1 ? 'comercio activo' : 'comercios activos'}
          </span>
        </div>

        {/* Barra de 3 Atributos de Independencia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#0c152a] border border-slate-200/80 dark:border-[#1c2a47] text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <StoreIcon className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold">Vitrina exclusiva para cada negocio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold">Catálogo y pedidos independientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold">Sin cruce entre comercios</span>
          </div>
        </div>

        {/* Filtros de Rubro */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'todos', label: 'Todos los comercios' },
            { id: 'restaurante', label: 'Gastronomía & Restaurante' },
            { id: 'moda', label: 'Moda & Boutique' },
            { id: 'servicios', label: 'Servicios Profesionales' },
            { id: 'general', label: 'Comercio General' },
          ].map((filtro) => {
            const isActive = rubroFiltro === filtro.id;
            return (
              <button
                key={filtro.id}
                type="button"
                onClick={() => setRubroFiltro(filtro.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white border-slate-900 dark:border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-[#0d162b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1c2a47] hover:bg-slate-100 dark:hover:bg-[#132042] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{filtro.label}</span>
              </button>
            );
          })}
        </div>

        {/* Listado de Tarjetas de Comercios */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#1c2a47] p-6 animate-pulse space-y-4"
              >
                <div className="h-14 bg-slate-100 dark:bg-[#16223b] rounded-xl" />
                <div className="h-4 bg-slate-100 dark:bg-[#16223b] rounded w-1/3" />
                <div className="h-5 bg-slate-100 dark:bg-[#16223b] rounded w-2/3" />
                <div className="h-10 bg-slate-100 dark:bg-[#16223b] rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#1c2a47] space-y-3">
            <StoreIcon className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No hay comercios disponibles por el momento
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 max-w-md mx-auto">
              Sé el primer negocio en abrir su tienda online en MAXINEGO y llega a nuevos clientes.
            </p>
            <button
              type="button"
              onClick={() => handleCreateStore('vitrina_empty_state')}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              <StoreIcon className="w-3.5 h-3.5" />
              <span>Crear mi tienda</span>
            </button>
          </div>
        ) : comerciosFiltrados.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#1c2a47] space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No se encontraron comercios registrados en esta categoría.
            </p>
            <button
              type="button"
              onClick={() => {
                trackCommercialEvent('click_explorar_tiendas', { origin: 'vitrina_filtered_empty' });
                setRubroFiltro('todos');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
            >
              Ver todos los comercios
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comerciosFiltrados.map((store) => {
              const meta = getCardMetadata(store);

              return (
                <div
                  key={store.id}
                  className="rounded-2xl bg-white dark:bg-[#0c152a] border border-slate-200/90 dark:border-[#1c2a47] p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500/70 group hover:-translate-y-1 relative"
                >
                  {/* Encabezado e Identidad Clara de Tienda Independiente */}
                  <div className="space-y-4">
                    {/* Barra Superior de la Tarjeta con Etiqueta de Tienda Independiente */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        <span>Tienda independiente</span>
                      </span>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${meta.accentBg} ${meta.accentBorder} ${meta.accentText}`}>
                        {meta.badge}
                      </span>
                    </div>

                    {/* Logo/Avatar Principal y Nombre Destacado */}
                    <div className="flex items-start gap-3.5">
                      <StoreCardLogo store={store} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {store.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{meta.cat}</span>
                        </p>
                      </div>
                    </div>

                    {/* Ficha de Independencia: Enlace propio y catálogo individual */}
                    <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#081022] border border-slate-100 dark:border-[#16233f] text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                        <span className="flex items-center gap-1.5 truncate">
                          <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">maxinego.app/tienda/{store.slug}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-200/50 dark:border-white/5">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Catálogo propio</span>
                        </span>
                        <span className="text-slate-400 dark:text-slate-400 text-[10px] font-medium">
                          Sin cruce entre comercios
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones y Entrada Clara a la Tienda Específica */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#16223b] space-y-2">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span className="truncate">Explora la vitrina de {store.name}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold shrink-0">100% directa</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        trackCommercialEvent('click_ver_tienda_catalogo', {
                          storeSlug: store.slug,
                          storeName: store.name,
                          origin: 'vitrina_card',
                        });
                        navigate(`/tienda/${store.slug}`);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer bg-slate-900 hover:bg-blue-600 text-white dark:bg-[#152342] dark:hover:bg-blue-600 dark:border dark:border-[#22355e] shadow-xs active:scale-[0.99] group/btn"
                    >
                      <span className="flex items-center gap-2">
                        <StoreIcon className="w-3.5 h-3.5 text-blue-400 group-hover/btn:scale-110 transition-transform" />
                        <span>Ver tienda y catálogo</span>
                      </span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* BLOQUE 5: PREGUNTAS FRECUENTES (FAQ)                                      */}
      {/* Conserva todas las 6 preguntas y respuestas originales                    */}
      {/* ========================================================================= */}
      <section id="faq" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Preguntas Frecuentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Respuestas a tus dudas sobre MAXINEGO
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Conoce cómo funciona la plataforma, cómo publicar tu comercio local y cómo gestionar tus pedidos de manera ágil y directa.
          </p>
        </div>

        {/* Lista de Acordeón FAQ */}
        <div className="space-y-3 max-w-4xl">
          {[
            {
              q: '¿Qué es MAXINEGO y para qué tipo de negocios está pensado?',
              a: 'MAXINEGO es una plataforma desarrollada en Bolivia para que comercios locales, restaurantes, boutiques de moda, proveedores de servicios y emprendimientos puedan tener su propia vitrina digital, exhibir sus catálogos con fotos y precios, y recibir pedidos directamente en su WhatsApp comercial.',
            },
            {
              q: '¿MAXINEGO cobra comisiones o porcentajes por las ventas realizadas?',
              a: 'No. En MAXINEGO no cobramos ningún tipo de comisión sobre las ventas de tu negocio. El 100% del valor de cada producto o servicio vendido te pertenece. La coordinación de pagos y entregas se realiza directamente entre tú y tu comprador.',
            },
            {
              q: '¿Cómo reciben los comercios los pedidos de los clientes?',
              a: 'Cuando un cliente arma su compra en el catálogo online de tu comercio y presiona "Pedir ahora", el sistema genera automáticamente un mensaje ordenado con el detalle exacto de productos, cantidades, precios y total a pagar listo para enviarse a tu número oficial de WhatsApp.',
            },
            {
              q: '¿Mis clientes necesitan descargar alguna app para ver mi catálogo o comprar?',
              a: 'No necesitan instalar ninguna aplicación obligatoria. Tu comercio cuenta con una dirección web propia (por ejemplo maxinego.app/tienda/tu-negocio) que abre al instante en cualquier teléfono o computadora. Además, gracias a su tecnología PWA, si tus clientes recurrentes lo desean, pueden añadirla como acceso directo en la pantalla de su teléfono con un solo toque.',
            },
            {
              q: '¿Puedo personalizar los horarios, categorías y disponibilidad de mis productos?',
              a: 'Sí. Cada comercio dispone de un panel de administración privado donde puedes cargar o pausar productos, modificar precios, definir horarios de atención, configurar zonas de entrega y actualizar las formas de pago aceptadas en cualquier momento.',
            },
            {
              q: '¿Cómo puedo solicitar la creación de mi tienda en MAXINEGO?',
              a: 'Puedes solicitarla fácilmente utilizando el botón "Crear mi tienda". Solo necesitas tener listos los datos básicos de tu comercio (nombre, rubro, logotipo si lo tienes, número de WhatsApp para pedidos y tu lista inicial de artículos con precios). Nuestro equipo te asiste en la activación de tu vitrina digital.',
            },
          ].map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white dark:bg-[#0d162b] border-blue-300 dark:border-blue-600/70 shadow-xs'
                    : 'bg-white/80 dark:bg-[#0d162b]/80 border-slate-200/80 dark:border-[#1c2a47] hover:border-slate-300 dark:hover:border-[#2b3c61]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-[#16223b] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-[#16223b] mt-1 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* BLOQUE 6: CIERRE COMERCIAL Y CONTACTO                                     */}
      {/* Formulario íntegro de contacto con WhatsApp oficial y llamada clara a la acción */}
      {/* ========================================================================= */}
      <ContactSection />
    </main>
  );
};
