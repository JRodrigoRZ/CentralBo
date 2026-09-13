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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { getPublicStores } from '../lib/multiTenantService';
import { Store, StoreType } from '../types';
import { ContactSection } from './ContactSection';

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

const NEUTRAL_DEMO_STORE: Store = {
  id: 'demo-neutral',
  name: 'Comercio Local CentralBo',
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

  // Comercio General / Retail / CentralBo Demo
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

export const PortalHome: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rubroFiltro, setRubroFiltro] = useState<'todos' | 'restaurante' | 'moda' | 'servicios' | 'general'>('todos');
  const [previewTab, setPreviewTab] = useState<'restaurante' | 'moda' | 'servicios'>('restaurante');

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

  const handleScrollToStores = () => {
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

  // Transición suave entre comercios cada 4.5 segundos
  useEffect(() => {
    if (heroStoreList.length <= 1 || isHeroPaused) return;

    const timer = setInterval(() => {
      setIsHeroTransitioning(true);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % heroStoreList.length);
        setIsHeroTransitioning(false);
      }, 300);
    }, 4500);

    return () => clearInterval(timer);
  }, [heroStoreList.length, isHeroPaused]);

  const currentHeroStore = heroStoreList[heroIndex % heroStoreList.length];
  const heroShowcase = useMemo(() => getHeroStoreShowcase(currentHeroStore), [currentHeroStore]);

  const handleMockupAddToCart = (productId: string) => {
    setAddedMockupIds((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedMockupIds((prev) => ({ ...prev, [productId]: false }));
    }, 1500);
  };

  // Controles del Carrusel de Comercios
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  const updateScrollButtons = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [stores, updateScrollButtons]);

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const handleCreateStore = () => {
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
    <div className="w-full space-y-12 sm:space-y-16 lg:space-y-20">
      {/* ========================================================================= */}
      {/* 1. HERO — "Tu comercio local, ahora en digital."                           */}
      {/* ========================================================================= */}
      <section
        id="hero-section"
        className="pt-1 sm:pt-4 md:pt-6 w-full relative"
      >
        {/* Estilos específicos y animaciones sutiles encapsuladas para el Hero */}
        <style>{`
          @keyframes heroFadeUp {
            from {
              opacity: 0;
              transform: translateY(8px);
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

          .hero-anim-item-1 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
          .hero-anim-item-2 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
          .hero-anim-item-3 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
          .hero-anim-item-4 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
          .hero-anim-item-5 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both; }
          .hero-anim-item-6 { animation: heroFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both; }
          .hero-anim-mockup { animation: heroFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }

          .hero-benefit-stagger-1 { animation: heroFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both; }
          .hero-benefit-stagger-2 { animation: heroFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.75s both; }
          .hero-benefit-stagger-3 { animation: heroFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both; }
          .hero-benefit-stagger-4 { animation: heroFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.95s both; }

          .hero-gradient-text-gleam {
            background-image: linear-gradient(110deg, #2563eb 0%, #3b82f6 28%, #93c5fd 46%, #3b82f6 60%, #4f46e5 82%, #6366f1 100%);
            background-size: 250% 100%;
            animation: heroGleamSweep 8s ease-in-out infinite;
          }
          :is(.dark .hero-gradient-text-gleam) {
            background-image: linear-gradient(110deg, #60a5fa 0%, #93c5fd 28%, #e0e7ff 46%, #93c5fd 60%, #818cf8 82%, #a5b4fc 100%);
          }

          .hero-cta-sheen-sweep {
            animation: heroCtaSheen 7s ease-in-out infinite;
          }

          /* Animaciones ambientales sutiles compartidas para Descubrimiento y CTA Final */
          @keyframes ambientDriftA {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.65;
            }
            50% {
              transform: translate(24px, -18px) scale(1.1);
              opacity: 0.9;
            }
            100% {
              transform: translate(-18px, 14px) scale(0.95);
              opacity: 0.7;
            }
          }

          @keyframes ambientDriftB {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.6;
            }
            50% {
              transform: translate(-26px, 18px) scale(1.12);
              opacity: 0.85;
            }
            100% {
              transform: translate(18px, -14px) scale(0.92);
              opacity: 0.65;
            }
          }

          @keyframes subtleRadarWave {
            0% {
              transform: scale(0.97);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.02);
              opacity: 0.5;
            }
            100% {
              transform: scale(0.98);
              opacity: 0.35;
            }
          }

          @keyframes blockCtaSheen {
            0%, 75% {
              transform: translateX(-160%) skewX(-20deg);
            }
            85%, 100% {
              transform: translateX(260%) skewX(-20deg);
            }
          }

          .anim-ambient-glow-1 {
            animation: ambientDriftA 20s ease-in-out infinite alternate;
          }

          .anim-ambient-glow-2 {
            animation: ambientDriftB 24s ease-in-out infinite alternate;
          }

          .anim-radar-wave {
            animation: subtleRadarWave 16s ease-in-out infinite alternate;
          }

          .anim-block-cta-sheen {
            animation: blockCtaSheen 8s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-anim-item-1,
            .hero-anim-item-2,
            .hero-anim-item-3,
            .hero-anim-item-4,
            .hero-anim-item-5,
            .hero-anim-item-6,
            .hero-anim-mockup,
            .hero-benefit-stagger-1,
            .hero-benefit-stagger-2,
            .hero-benefit-stagger-3,
            .hero-benefit-stagger-4,
            .hero-gradient-text-gleam,
            .hero-cta-sheen-sweep,
            .anim-ambient-glow-1,
            .anim-ambient-glow-2,
            .anim-radar-wave,
            .anim-block-cta-sheen {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}</style>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Columna Izquierda: Mensaje Comercial Claro y Directo */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
            {/* 1. Distintivo de identidad */}
            <div className="hero-anim-item-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span>Plataforma para Comercios y Negocios Locales</span>
            </div>

            {/* 2. Mensaje Principal del Hero (Literal solicitado) */}
            <h1 className="hero-anim-item-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Tu comercio local,{' '}
              <span className="relative inline-block hero-gradient-text-gleam bg-clip-text text-transparent font-extrabold">
                ahora en digital.
              </span>
            </h1>

            {/* 3. Texto Complementario del Hero (Literal solicitado) */}
            <p className="hero-anim-item-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
              Crea tu tienda online, gestiona tu catálogo de productos y servicios, atiende a tus clientes y administra pedidos de forma ágil y moderna.
            </p>

            {/* 4. Botones de Acción (CTAs Principales) */}
            <div className="hero-anim-item-4 pt-1 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={handleCreateStore}
                className="group relative overflow-hidden inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 text-white text-sm font-semibold shadow-xs hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                {/* Reflejo de luz ocasional sutil */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent hero-cta-sheen-sweep"
                />
                <StoreIcon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Crear mi tienda</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={handleScrollToStores}
                className="group inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-[#0e172d] hover:bg-slate-200/90 dark:hover:bg-[#14213d] text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200/90 dark:border-[#1d2d4e] transition-all duration-200 cursor-pointer active:scale-[0.98] hover:border-slate-300 dark:hover:border-[#273a62] hover:-translate-y-0.5 shadow-2xs"
              >
                <Compass className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-300 group-hover:rotate-45" />
                <span>Explorar tiendas</span>
              </button>
            </div>

            {/* 5. Micro-indicadores de valor para el comerciante (con micro-interacción visual sobre el mockup) */}
            <div className="hero-anim-item-5 pt-2 grid grid-cols-3 gap-2 sm:gap-3 border-t border-slate-200/80 dark:border-[#1c2a47] text-xs text-slate-600 dark:text-slate-300">
              <div
                onMouseEnter={() => setMockupHighlightZone('brand')}
                onMouseLeave={() => setMockupHighlightZone(null)}
                className={`group flex items-center gap-1.5 p-1.5 rounded-lg transition-all duration-200 cursor-default ${
                  mockupHighlightZone === 'brand'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700/60'
                    : 'hover:bg-slate-50 dark:hover:bg-[#0e172d]'
                }`}
              >
                <Check className={`w-4 h-4 shrink-0 transition-transform duration-200 ${mockupHighlightZone === 'brand' ? 'scale-110 text-blue-600 dark:text-blue-400' : 'text-emerald-500'}`} />
                <span className="font-medium text-[11px] sm:text-xs">Tu marca propia</span>
              </div>

              <div
                onMouseEnter={() => setMockupHighlightZone('whatsapp')}
                onMouseLeave={() => setMockupHighlightZone(null)}
                className={`group flex items-center gap-1.5 p-1.5 rounded-lg transition-all duration-200 cursor-default ${
                  mockupHighlightZone === 'whatsapp'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700/60'
                    : 'hover:bg-slate-50 dark:hover:bg-[#0e172d]'
                }`}
              >
                <Check className={`w-4 h-4 shrink-0 transition-transform duration-200 ${mockupHighlightZone === 'whatsapp' ? 'scale-110 text-emerald-600 dark:text-emerald-400' : 'text-emerald-500'}`} />
                <span className="font-medium text-[11px] sm:text-xs">Pedidos por WhatsApp</span>
              </div>

              <div
                onMouseEnter={() => setMockupHighlightZone('commission')}
                onMouseLeave={() => setMockupHighlightZone(null)}
                className={`group flex items-center gap-1.5 p-1.5 rounded-lg transition-all duration-200 cursor-default ${
                  mockupHighlightZone === 'commission'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700/60'
                    : 'hover:bg-slate-50 dark:hover:bg-[#0e172d]'
                }`}
              >
                <Check className={`w-4 h-4 shrink-0 transition-transform duration-200 ${mockupHighlightZone === 'commission' ? 'scale-110 text-blue-600 dark:text-blue-400' : 'text-emerald-500'}`} />
                <span className="font-medium text-[11px] sm:text-xs">Sin comisiones por venta</span>
              </div>
            </div>

            {/* 6. Nuevo Bloque Aprobado: "¿Qué ganas al tener tu negocio en digital?" */}
            <div className="hero-anim-item-6 pt-2 border-t border-slate-200/80 dark:border-[#1c2a47] space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  ¿Qué ganas al tener tu negocio en digital?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Beneficio 1 */}
                <div className="hero-benefit-stagger-1 p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] hover:border-blue-200 dark:hover:border-blue-600/50 transition-colors flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 dark:border dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      Tu negocio disponible 24/7
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                      Tus clientes pueden consultar tu tienda cuando quieran.
                    </p>
                  </div>
                </div>

                {/* Beneficio 2 */}
                <div className="hero-benefit-stagger-2 p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] hover:border-blue-200 dark:hover:border-indigo-600/50 transition-colors flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 dark:border dark:border-indigo-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      Más oportunidades de ser encontrado
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                      Tu negocio puede mostrar sus productos y servicios online.
                    </p>
                  </div>
                </div>

                {/* Beneficio 3 */}
                <div className="hero-benefit-stagger-3 p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] hover:border-blue-200 dark:hover:border-emerald-600/50 transition-colors flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 dark:border dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      Atención directa
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                      Recibe consultas y pedidos directamente por WhatsApp.
                    </p>
                  </div>
                </div>

                {/* Beneficio 4 */}
                <div className="hero-benefit-stagger-4 p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] hover:border-blue-200 dark:hover:border-amber-600/50 transition-colors flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 dark:border dark:border-amber-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      Tu propia identidad digital
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                      Tu marca, tus productos y tu forma de atender.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chip de sesión activa si existe usuario */}
            {user && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0e172d] border border-slate-200 dark:border-[#1c2a47] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400">Conectado como:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate">{user.email}</span>
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
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Mockup Interactivo de Tienda Pública CentralBo */}
          <div
            className="lg:col-span-6 relative hero-anim-mockup"
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
          >
            {/* Halo ambiental suave */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-teal-500/10 rounded-3xl blur-2xl pointer-events-none opacity-80" />

            {/* Ventana tipo Navegador / Aplicación */}
            <div className="relative rounded-2xl bg-white dark:bg-[#0b1326] border border-slate-200 dark:border-[#1c2a47] shadow-xl overflow-hidden">
              {/* Barra superior tipo navegador */}
              <div className="px-4 py-3 bg-slate-50 dark:bg-[#0e172d] border-b border-slate-200 dark:border-[#1c2a47] flex items-center justify-between gap-2">
                {/* Tres controles visuales + URL simulada */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-rose-400/90" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/90" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/90" />
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-[#080d1a] border border-slate-200/80 dark:border-[#1c2a47] text-[11px] font-mono text-slate-600 dark:text-slate-300 min-w-0 max-w-[170px] sm:max-w-[240px] truncate shadow-2xs">
                    <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">centralbo.com/tienda/{heroShowcase.slug}</span>
                  </div>
                </div>

                {/* Indicador "● Abierto ahora" */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Abierto ahora</span>
                  </span>
                </div>
              </div>

              {/* Contenido Visual de la Tienda (con Transición Suave Fade/Slide) */}
              <div
                className={`transition-all duration-350 ease-out ${
                  isHeroTransitioning
                    ? 'opacity-0 translate-y-2 scale-[0.995]'
                    : 'opacity-100 translate-y-0 scale-100'
                }`}
              >
                {/* Portada y Cabecera del Comercio (con realce visual interactivo para 'Tu marca propia') */}
                <div
                  className={`p-4 sm:p-5 bg-gradient-to-r ${heroShowcase.headerGradient} border-b border-slate-100 dark:border-[#1c2a47] transition-all duration-300 ${
                    mockupHighlightZone === 'brand'
                      ? 'ring-2 ring-blue-500/70 dark:ring-blue-400/80 bg-blue-50/60 dark:bg-blue-950/50 shadow-sm'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Logo / Avatar con micro-realce sutil al interactuar con el beneficio */}
                      <div
                        className={`w-12 h-12 rounded-xl ${heroShowcase.avatarBg} font-extrabold text-base flex items-center justify-center shadow-sm shrink-0 transition-all duration-300 ${
                          mockupHighlightZone === 'brand'
                            ? 'scale-105 ring-2 ring-blue-500/80 shadow-md'
                            : ''
                        }`}
                      >
                        {heroShowcase.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-base sm:text-lg font-bold truncate transition-colors duration-300 ${
                              mockupHighlightZone === 'brand'
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {heroShowcase.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${heroShowcase.badgeBg} ${heroShowcase.badgeText}`}>
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
                        className="p-2 rounded-xl bg-white/80 dark:bg-[#121f3a] hover:bg-white dark:hover:bg-[#18294d] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#21345d] shadow-2xs transition-all cursor-pointer shrink-0 hidden sm:flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <span>Ver tienda</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categorías de la Tienda */}
                <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-[#0e172d] border-b border-slate-100 dark:border-[#1c2a47] flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
                  {heroShowcase.categories.map((catName, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-default transition ${
                        idx === 0
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-[#121f3a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#21345d]'
                      }`}
                    >
                      {catName}
                    </span>
                  ))}
                </div>

                {/* Lista de Productos de la Vitrina (con micro-señal sutil de compra directa al interactuar con 'Sin comisiones por venta') */}
                <div
                  className={`p-4 sm:p-5 space-y-3 transition-colors duration-300 ${
                    mockupHighlightZone === 'commission' ? 'bg-blue-50/20 dark:bg-blue-950/20' : ''
                  }`}
                >
                  {heroShowcase.products.map((product) => {
                    const Icon = product.icon;
                    const isAdded = !!addedMockupIds[product.id];

                    return (
                      <div
                        key={product.id}
                        className={`p-3 rounded-xl bg-slate-50 dark:bg-[#0e172d] border border-slate-200/80 dark:border-[#1c2a47] flex items-center justify-between gap-3 transition-all duration-300 hover:border-slate-300 dark:hover:border-[#283e68] ${
                          mockupHighlightZone === 'commission'
                            ? 'border-blue-300/80 dark:border-blue-700/80 shadow-2xs'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center shrink-0 ${product.iconBg}`}>
                            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${product.iconColor}`} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {product.desc}
                            </p>
                            <span
                              className={`text-xs font-extrabold text-blue-600 dark:text-blue-400 transition-all duration-300 ${
                                mockupHighlightZone === 'commission'
                                  ? 'text-emerald-600 dark:text-emerald-400 font-black'
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isAdded ? '✓ Agregado' : '+ Agregar'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Barra Inferior de Pedido por WhatsApp (con micro-realce interactivo para 'Pedidos por WhatsApp') */}
                <div
                  className={`p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-950/50 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2 transition-all duration-300 ${
                    mockupHighlightZone === 'whatsapp'
                      ? 'ring-2 ring-emerald-500/80 dark:ring-emerald-400/80 bg-emerald-100/90 dark:bg-emerald-900/50 shadow-md scale-[1.005]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 ${
                        mockupHighlightZone === 'whatsapp'
                          ? 'scale-110 shadow-emerald-500/40 ring-2 ring-emerald-300 dark:ring-emerald-600'
                          : ''
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[11px] sm:text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate">
                        Pedido listo para WhatsApp
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-300 truncate">
                        {heroShowcase.cartDefaultCount} productos • Total {heroShowcase.cartDefaultTotal}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!heroShowcase.isDemo) {
                        navigate(`/tienda/${heroShowcase.slug}`);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 shrink-0 transition cursor-pointer active:scale-95"
                  >
                    <span>Pedir ahora</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Barra de Control / Indicadores del Carrusel del Mockup */}
              {heroStoreList.length > 1 && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-[#0e172d] border-t border-slate-200 dark:border-[#1c2a47] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {heroShowcase.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
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
                            ? 'w-5 bg-blue-600 dark:bg-blue-400'
                            : 'w-1.5 bg-slate-300 dark:bg-[#273a62] hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* 2. CARRUSEL DE COMERCIOS (Ubicación Original: Inmediatamente tras el Hero)   */}
      {/* ========================================================================= */}
      <section id="carrusel-comercios" className="w-full space-y-4 sm:space-y-5 scroll-mt-20">
        {/* Cabecera del Carrusel con Controles de Navegación */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                Vitrina Activa
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>En vivo</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Comercios destacados en CentralBo
            </h2>
          </div>

          {/* Controles de Navegación Anterior / Siguiente */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              aria-label="Anterior comercio"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                canScrollLeft
                  ? 'bg-white dark:bg-[#0d162b] border-slate-200 dark:border-[#1c2a47] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132042] hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs hover:shadow-xs active:scale-95'
                  : 'bg-slate-50/80 dark:bg-[#090f20]/50 border-slate-200/50 dark:border-[#16223b]/50 text-slate-300 dark:text-slate-700 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollRight}
              aria-label="Siguiente comercio"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                canScrollRight
                  ? 'bg-white dark:bg-[#0d162b] border-slate-200 dark:border-[#1c2a47] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132042] hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs hover:shadow-xs active:scale-95'
                  : 'bg-slate-50/80 dark:bg-[#090f20]/50 border-slate-200/50 dark:border-[#16223b]/50 text-slate-300 dark:text-slate-700 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pista de Desplazamiento Horizontal del Carrusel */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden py-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[280px] sm:min-w-[320px] max-w-[340px] rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#1c2a47] p-5 animate-pulse space-y-3 shrink-0"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-[#16223b]" />
                <div className="h-4 bg-slate-100 dark:bg-[#16223b] rounded w-1/2" />
                <div className="h-3 bg-slate-100 dark:bg-[#16223b] rounded w-3/4" />
                <div className="h-9 bg-slate-100 dark:bg-[#16223b] rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] text-xs text-slate-500 dark:text-slate-400">
            No hay comercios registrados en este momento.
          </div>
        ) : (
          <div
            ref={carouselRef}
            onScroll={updateScrollButtons}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-0.5 no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {stores.map((store) => {
              const meta = getCardMetadata(store);
              const Icon = meta.icon;

              return (
                <div
                  key={store.id}
                  className="min-w-[280px] sm:min-w-[320px] max-w-[340px] shrink-0 snap-start rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md hover:border-blue-300/80 dark:hover:border-blue-600/70 transition-all duration-200 group hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    {/* Fila Superior: Logo + Nombre + Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                          {store.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {store.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block font-mono">
                            /{store.slug}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${meta.accentBg} ${meta.accentBorder} ${meta.accentText}`}>
                        {meta.badge}
                      </span>
                    </div>

                    {/* Metadato de Vertical y Estado */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1 font-medium bg-slate-50 dark:bg-[#090f20] px-2 py-0.5 rounded-md border border-slate-100 dark:border-[#16223b]">
                        <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{meta.cat}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>En línea</span>
                      </span>
                    </div>
                  </div>

                  {/* Botón de Acción a Vitrina Pública */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#16223b]">
                    <button
                      type="button"
                      onClick={() => navigate(`/tienda/${store.slug}`)}
                      className="w-full py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer bg-slate-900 hover:bg-blue-600 text-white dark:bg-[#152342] dark:hover:bg-blue-600 dark:border dark:border-[#22355e] shadow-2xs group-hover:shadow-xs active:scale-[0.99]"
                    >
                      <span className="flex items-center gap-1.5">
                        <StoreIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Visitar tienda</span>
                      </span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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
      {/* 3. ¿QUÉ ES CENTRALBO?                                                     */}
      {/* ========================================================================= */}
      <section id="que-es-centralbo" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
        <div className="max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Conoce la Plataforma</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ¿Qué es CentralBo?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            CentralBo es la plataforma que permite a los comercios locales dar el salto al mundo digital. Aquí puedes abrir tu propia tienda online, mostrar tus productos y servicios con claridad y recibir pedidos directamente de tus clientes sin intermediarios ni complicaciones.
          </p>
        </div>

        {/* 3 Pilares Fundamentales de CentralBo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-blue-300/80 dark:hover:border-blue-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <StoreIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Tu tienda propia en internet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Un espacio digital exclusivo para tu negocio con tu nombre, tu logotipo, tus colores y un enlace directo para compartir en tus redes sociales y tarjetas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-emerald-300/80 dark:hover:border-emerald-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Atención directa por WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tus clientes seleccionan lo que desean y el pedido llega a tu WhatsApp organizado con detalle, cantidades y precios. Tú gestionas el pago y la entrega como siempre.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-amber-300/80 dark:hover:border-amber-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Sencillo, rápido y moderno
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Sin procesos complejos. Administra tu catálogo, actualiza precios y activa o pausa artículos desde cualquier celular o computadora en pocos toques.
            </p>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* 4. ASÍ SE VE TU TIENDA                                                    */}
      {/* ========================================================================= */}
      <section id="asi-se-ve-tu-tienda" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <StoreIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Tu Negocio en Digital</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Así se ve tu tienda en CentralBo
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Tu comercio contará con una vitrina pública profesional diseñada para que tus clientes naveguen cómodamente, descubran lo que ofreces y compren con total facilidad.
            </p>
          </div>

          {/* Selector de Verticales para el Comerciante */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-[#0e172d] rounded-xl border border-slate-200 dark:border-[#1c2a47] text-xs shadow-2xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setPreviewTab('restaurante')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                previewTab === 'restaurante'
                  ? 'bg-white dark:bg-[#152342] text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Gastronomía</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('moda')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                previewTab === 'moda'
                  ? 'bg-white dark:bg-[#152342] text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Moda & Calzado</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('servicios')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                previewTab === 'servicios'
                  ? 'bg-white dark:bg-[#152342] text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Servicios</span>
            </button>
          </div>
        </div>

        {/* Demostración Visual de la Tienda según el Rubro */}
        <div className="rounded-2xl bg-white dark:bg-[#0b1326] border border-slate-200/90 dark:border-[#1c2a47] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          {/* Cabecera dinámica de la tienda de ejemplo */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 dark:from-[#0d162b] dark:via-[#132042] dark:to-[#0d162b] border-b border-slate-200/80 dark:border-[#1c2a47]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
                  {previewTab === 'restaurante' ? 'TR' : previewTab === 'moda' ? 'BM' : 'ZS'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {previewTab === 'restaurante' && 'Trattoria Roma • Menú & Pastas'}
                      {previewTab === 'moda' && 'Boutique Milano • Tendencias'}
                      {previewTab === 'servicios' && 'Zenit Studio • Spa & Estética'}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Av. Principal #450, Centro Comercial
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      Atención: Lunes a Sábado
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Catálogo Activo</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-semibold">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span>WhatsApp Vinculado</span>
                </span>
              </div>
            </div>
          </div>

          {/* Grilla con 4 Elementos de Valor Visible */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Elemento 1: Identidad del Negocio */}
            <div className="space-y-2.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0e172d]/70 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <StoreIcon className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Identidad y Marca
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                Tu logotipo, descripción, ubicación y horarios de atención destacados para que tus clientes confíen en tu negocio.
              </p>
            </div>

            {/* Elemento 2: Productos y Servicios */}
            <div className="space-y-2.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0e172d]/70 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Package className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Catálogo con Precios Claros
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                Muestra fotos atractivas, descripciones precisas, precios vigentes en Bolivianos y opciones o variantes de productos.
              </p>
            </div>

            {/* Elemento 3: Categorías Inteligentes */}
            <div className="space-y-2.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0e172d]/70 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Categorías Ordenadas
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                Tus clientes pueden filtrar por categorías y encontrar rápidamente lo que buscan sin perderse ni abandonar la tienda.
              </p>
            </div>

            {/* Elemento 4: Carrito y Pedido */}
            <div className="space-y-2.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0e172d]/70 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Experiencia de Compra Ágil
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                El comprador añade artículos al carrito con un clic y confirma su solicitud directamente en WhatsApp en segundos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* 5. TODO LO QUE PUEDES HACER                                               */}
      {/* ========================================================================= */}
      <section id="capacidades" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Herramientas para el Comercio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Todo lo que puedes hacer con CentralBo
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            CentralBo te brinda las herramientas esenciales para administrar tu comercio y vender con facilidad, sin complicaciones técnicas.
          </p>
        </div>

        {/* Grilla de 6 Capacidades Reales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Capacidad 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-blue-300/80 dark:hover:border-blue-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/60 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Crear y mostrar tu tienda online
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tu tienda disponible las 24 horas del día, con dirección web propia para que tus clientes puedan entrar desde cualquier dispositivo.
            </p>
          </div>

          {/* Capacidad 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-emerald-300/80 dark:hover:border-emerald-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Gestionar productos y servicios
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Publica fotos, precios, descripciones detalladas y actualiza la disponibilidad de cada artículo en tiempo real.
            </p>
          </div>

          {/* Capacidad 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-amber-300/80 dark:hover:border-amber-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60 group-hover:scale-105 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Organizar tu catálogo comercial
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Crea categorías personalizadas según tu rubro para que los compradores encuentren exactamente lo que necesitan.
            </p>
          </div>

          {/* Capacidad 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-rose-300/80 dark:hover:border-rose-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800/60 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Atender a tus clientes con cercanía
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ofrece información clara de ubicación, horarios de atención, formas de pago aceptadas y métodos de entrega.
            </p>
          </div>

          {/* Capacidad 5 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-indigo-300/80 dark:hover:border-indigo-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Administrar pedidos entrantes
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Revisa los pedidos de tus clientes de forma ordenada y controla su estado (pendiente, en preparación o entregado).
            </p>
          </div>

          {/* Capacidad 6 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#1c2a47] shadow-2xs hover:shadow-md hover:border-emerald-300/80 dark:hover:border-emerald-600/60 transition-all duration-200 space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Ventas directas por WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El cliente arma su compra en el catálogo y te envía la orden lista para coordinar pago y entrega en tu chat.
            </p>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* 6. CENTRALBO TE AYUDA A SER DESCUBIERTO                                   */}
      {/* ========================================================================= */}
      <section id="ecosistema-descubrimiento" className="w-full">
        <div className="rounded-3xl sm:rounded-[32px] bg-gradient-to-br from-[#060c23] via-[#0b163b] to-[#171242] text-white p-7 sm:p-10 lg:p-12 border border-blue-500/25 shadow-2xl shadow-blue-950/60 ring-1 ring-white/10 relative overflow-hidden">
          {/* Iluminación ambiental y profundidad atmosférica */}
          <div className="pointer-events-none absolute -top-24 -right-20 w-96 h-96 bg-blue-500/18 rounded-full blur-3xl anim-ambient-glow-1" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 w-96 h-96 bg-violet-600/14 rounded-full blur-3xl anim-ambient-glow-2" />
          <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl" />

          {/* Gráfico decorativo vectorial sutil: ondas de alcance y descubrimiento de comercio local */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -bottom-16 w-88 h-88 sm:w-96 sm:h-96 text-blue-400 opacity-[0.08] anim-radar-wave select-none"
            viewBox="0 0 400 400"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="200" cy="200" r="55" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="200" cy="200" r="105" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="155" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="205" strokeWidth="1.2" />
            <line x1="200" y1="20" x2="200" y2="380" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="20" y1="200" x2="380" y2="200" strokeWidth="1" strokeDasharray="2 2" />
          </svg>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-200 text-xs font-semibold tracking-wide backdrop-blur-xs">
                <Compass className="w-3.5 h-3.5 text-blue-300" />
                <span>Ecosistema de Comercios</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                CentralBo te ayuda a ser descubierto
              </h2>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                <strong>Tu tienda es tu negocio digital.</strong> CentralBo es el ecosistema donde los comercios locales pueden mostrar lo que ofrecen y ser descubiertos por nuevos clientes.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs transition-colors duration-200 hover:bg-white/[0.07] hover:border-white/[0.14]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong className="text-white">Identidad 100% tuya:</strong> Tu comercio mantiene su autonomía, marca y relación directa con cada comprador.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs transition-colors duration-200 hover:bg-white/[0.07] hover:border-white/[0.14]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong className="text-white">Mayor visibilidad:</strong> Forma parte de un escaparate donde personas de tu ciudad pueden conocerte por rubro.
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <button
                type="button"
                onClick={handleCreateStore}
                className="group relative overflow-hidden px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:translate-y-0"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent anim-block-cta-sheen"
                />
                <StoreIcon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Crear mi tienda ahora</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={handleScrollToStores}
                className="group px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:translate-y-0 shadow-2xs"
              >
                <Compass className="w-4 h-4 text-blue-200 transition-transform duration-300 group-hover:rotate-45" />
                <span>Ver vitrina de comercios</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* 7. DESCUBRE TIENDAS EN CENTRALBO (#descubre-tiendas)                       */}
      {/* ========================================================================= */}
      <section
        id="descubre-tiendas"
        className="w-full space-y-6 sm:space-y-8 scroll-mt-20"
      >
        {/* Encabezado comercial de la vitrina */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <StoreIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Vitrina Comercial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Descubre tiendas en CentralBo
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Explora los comercios locales que ya forman parte de la plataforma y conoce sus catálogos:
            </p>
          </div>

          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 self-start sm:self-auto shadow-2xs">
            {stores.length} {stores.length === 1 ? 'comercio activo' : 'comercios activos'}
          </span>
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

        {/* Listado de Tarjetas de Comercios Públicos */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#1c2a47] p-6 animate-pulse space-y-4"
              >
                <div className="h-16 bg-slate-100 dark:bg-[#16223b] rounded-xl" />
                <div className="h-4 bg-slate-100 dark:bg-[#16223b] rounded w-1/3" />
                <div className="h-6 bg-slate-100 dark:bg-[#16223b] rounded w-2/3" />
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
              Sé el primer negocio en abrir su tienda online en CentralBo y llega a nuevos clientes.
            </p>
            <button
              type="button"
              onClick={handleCreateStore}
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
              onClick={() => setRubroFiltro('todos')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
            >
              Ver todos los comercios
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comerciosFiltrados.map((store) => {
              const meta = getCardMetadata(store);
              const Icon = meta.icon;

              return (
                <div
                  key={store.id}
                  className="rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/85 dark:border-[#1c2a47] p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600/70 group hover:-translate-y-0.5"
                >
                  {/* Encabezado e Identidad de la Tienda */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                          {store.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {store.name}
                          </h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {meta.cat}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${meta.accentBg} ${meta.accentBorder} ${meta.accentText}`}>
                        {meta.badge}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#090f20] border border-slate-100 dark:border-[#16223b] text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-medium">Tienda activa</span>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        Catálogo listo
                      </span>
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#16223b] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/tienda/${store.slug}`)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer bg-slate-900 hover:bg-blue-600 text-white dark:bg-[#152342] dark:hover:bg-blue-600 dark:border dark:border-[#22355e] shadow-xs active:scale-[0.99]"
                    >
                      <span className="flex items-center gap-1.5">
                        <StoreIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Ver tienda y catálogo</span>
                      </span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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
      {/* 8. PREGUNTAS FRECUENTES (FAQ)                                             */}
      {/* ========================================================================= */}
      <section id="faq" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Preguntas Frecuentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Respuestas a tus dudas sobre CentralBo
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Conoce cómo funciona la plataforma, cómo publicar tu comercio local y cómo gestionar tus pedidos de manera ágil y directa.
          </p>
        </div>

        {/* Lista de Acordeón FAQ */}
        <div className="space-y-3 max-w-4xl">
          {[
            {
              q: '¿Qué es CentralBo y para qué tipo de negocios está pensado?',
              a: 'CentralBo es una plataforma desarrollada en Bolivia para que comercios locales, restaurantes, boutiques de moda, proveedores de servicios y emprendimientos puedan tener su propia vitrina digital, exhibir sus catálogos con fotos y precios, y recibir pedidos directamente en su WhatsApp comercial.',
            },
            {
              q: '¿CentralBo cobra comisiones o porcentajes por las ventas realizadas?',
              a: 'No. En CentralBo no cobramos ningún tipo de comisión sobre las ventas de tu negocio. El 100% del valor de cada producto o servicio vendido te pertenece. La coordinación de pagos y entregas se realiza directamente entre tú y tu comprador.',
            },
            {
              q: '¿Cómo reciben los comercios los pedidos de los clientes?',
              a: 'Cuando un cliente arma su compra en el catálogo online de tu comercio y presiona "Pedir ahora", el sistema genera automáticamente un mensaje ordenado con el detalle exacto de productos, cantidades, precios y total a pagar listo para enviarse a tu número oficial de WhatsApp.',
            },
            {
              q: '¿Mis clientes necesitan descargar alguna app para ver mi catálogo o comprar?',
              a: 'No necesitan instalar ninguna aplicación obligatoria. Tu comercio cuenta con una dirección web propia (por ejemplo centralbo.com/tienda/tu-negocio) que abre al instante en cualquier teléfono o computadora. Además, gracias a su tecnología PWA, si tus clientes recurrentes lo desean, pueden añadirla como acceso directo en la pantalla de su teléfono con un solo toque.',
            },
            {
              q: '¿Puedo personalizar los horarios, categorías y disponibilidad de mis productos?',
              a: 'Sí. Cada comercio dispone de un panel de administración privado donde puedes cargar o pausar productos, modificar precios, definir horarios de atención, configurar zonas de entrega y actualizar las formas de pago aceptadas en cualquier momento.',
            },
            {
              q: '¿Cómo puedo solicitar la creación de mi tienda en CentralBo?',
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
      {/* 9. CTA FINAL                                                              */}
      {/* ========================================================================= */}
      <section id="cta-final" className="w-full pb-4 sm:pb-6">
        <div className="rounded-3xl sm:rounded-[32px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-2xl shadow-indigo-950/30 border border-white/20 ring-1 ring-white/15 relative overflow-hidden">
          {/* Iluminación ambiental y profundidad dinámica */}
          <div className="pointer-events-none absolute -top-24 -right-20 w-96 h-96 bg-white/15 rounded-full blur-3xl anim-ambient-glow-1" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 w-96 h-96 bg-indigo-900/40 rounded-full blur-3xl anim-ambient-glow-2" />
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-36 bg-white/10 rounded-full blur-2xl" />

          {/* Forma curva suave decorativa en segundo plano */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full text-white opacity-[0.08] select-none"
            preserveAspectRatio="none"
            viewBox="0 0 1000 400"
            fill="none"
          >
            <path d="M0,200 C250,120 450,280 700,160 C850,90 950,180 1000,150 L1000,400 L0,400 Z" fill="currentColor" />
            <path d="M0,240 C300,180 500,320 750,200 C900,140 980,210 1000,190" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
          </svg>

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-xs shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-100" />
              <span>Presencia Digital para tu Negocio</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Tu comercio ya existe. Ahora también puede estar en digital.
            </h2>

            <p className="text-base sm:text-lg text-blue-50/95 leading-relaxed max-w-2xl mx-auto">
              Crea tu tienda online, publica tus productos y servicios y atiende a tus clientes de manera moderna, ágil y directa.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={handleCreateStore}
                className="group relative overflow-hidden px-7 py-3.5 rounded-xl bg-white hover:bg-blue-50/95 text-blue-700 font-bold text-sm transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-black/15 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent anim-block-cta-sheen"
                />
                <StoreIcon className="w-4 h-4 text-blue-600 relative z-10 transition-transform duration-200 group-hover:scale-110" />
                <span className="relative z-10">Crear mi tienda</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={handleScrollToStores}
                className="group px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/20 border border-white/30 hover:border-white/40 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Compass className="w-4 h-4 text-blue-100 transition-transform duration-300 group-hover:rotate-45" />
                <span>Explorar tiendas</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor Visual Sutil */}
      <div className="w-full h-px bg-slate-200/70 dark:bg-[#16223b]" />

      {/* ========================================================================= */}
      {/* 10. CREAR MI TIENDA / CONTACTO                                            */}
      {/* ========================================================================= */}
      <ContactSection />
    </div>
  );
};
