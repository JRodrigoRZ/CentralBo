import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Store as StoreIcon,
  ShoppingBag,
  Utensils,
  Sparkles,
  ArrowRight,
  UserCheck,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { BASELINE_STORES } from '../lib/multiTenantService';

interface StoreCardMetadata {
  icon: React.ElementType;
  cat: string;
  badge: string;
  surfaceGradient: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  borderAccent: string;
}

const getCardMetadata = (store: { slug?: string; store_type?: string; name?: string; id?: string }): StoreCardMetadata => {
  const identifier = `${store.slug || ''} ${store.store_type || ''} ${store.name || ''}`.toLowerCase();

  // Tienda 1: restaurante-roma o vertical restaurante
  if (identifier.includes('roma') || identifier.includes('restaurante')) {
    return {
      icon: Utensils,
      cat: 'GASTRONOMÍA & RESTAURANTE',
      badge: 'Cocina & Menú',
      surfaceGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/20',
      badgeText: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100/90 dark:bg-amber-900/40',
      iconColor: 'text-amber-700 dark:text-amber-300',
      borderAccent: 'group-hover:border-amber-400/50 dark:group-hover:border-amber-500/40',
    };
  }

  // Tienda 2: boutique-milano o vertical moda
  if (identifier.includes('milano') || identifier.includes('moda') || identifier.includes('boutique')) {
    return {
      icon: ShoppingBag,
      cat: 'MODA & BOUTIQUE',
      badge: 'Estilo & Colección',
      surfaceGradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
      badgeBg: 'bg-rose-500/10',
      badgeBorder: 'border-rose-500/20',
      badgeText: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100/90 dark:bg-rose-900/40',
      iconColor: 'text-rose-700 dark:text-rose-300',
      borderAccent: 'group-hover:border-rose-400/50 dark:group-hover:border-rose-500/40',
    };
  }

  // Tienda 3: spa-zenit o vertical servicios
  if (identifier.includes('zenit') || identifier.includes('spa') || identifier.includes('servicio')) {
    return {
      icon: Sparkles,
      cat: 'SERVICIOS PROFESIONALES',
      badge: 'Bienestar & Spa',
      surfaceGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/20',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100/90 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      borderAccent: 'group-hover:border-emerald-400/50 dark:group-hover:border-emerald-500/40',
    };
  }

  // Tienda 4: los-andes-express o vertical general
  return {
    icon: ShoppingCart,
    cat: 'COMERCIO GENERAL',
    badge: 'Mercado & Provisiones',
    surfaceGradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/20',
    badgeText: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100/90 dark:bg-sky-900/40',
    iconColor: 'text-sky-700 dark:text-sky-300',
    borderAccent: 'group-hover:border-sky-400/50 dark:group-hover:border-sky-500/40',
  };
};

const HERO_MARQUEE_STORES = [
  {
    id: 'milano-moda-hero',
    name: 'Boutique Milano Moda',
    category: 'Moda & Boutique',
    badge: 'Estilo & Colección',
    icon: ShoppingBag,
    iconBg: 'bg-rose-100/90 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/50',
    iconColor: 'text-rose-700 dark:text-rose-300',
    catColor: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  {
    id: 'restaurante-roma-hero',
    name: 'Restaurante Gourmet Roma',
    category: 'Gastronomía & Restaurante',
    badge: 'Cocina & Menú',
    icon: Utensils,
    iconBg: 'bg-amber-100/90 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/50',
    iconColor: 'text-amber-700 dark:text-amber-300',
    catColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  {
    id: 'zenit-spa-hero',
    name: 'Salón & Spa Zenit',
    category: 'Servicios Profesionales',
    badge: 'Bienestar & Spa',
    icon: Sparkles,
    iconBg: 'bg-emerald-100/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    catColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'los-andes-hero',
    name: 'SuperMarket Los Andes Express',
    category: 'Comercio General',
    badge: 'Mercado & Provisiones',
    icon: ShoppingCart,
    iconBg: 'bg-sky-100/90 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/50',
    iconColor: 'text-sky-700 dark:text-sky-300',
    catColor: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  },
];

const HERO_MARQUEE_ITEMS = [...HERO_MARQUEE_STORES, ...HERO_MARQUEE_STORES];

export const PortalHome: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [rubroFiltro, setRubroFiltro] = useState<'todos' | 'restaurante' | 'moda' | 'servicios' | 'general'>('todos');

  const comerciosFiltrados = useMemo(() => {
    if (rubroFiltro === 'todos') return BASELINE_STORES;
    return BASELINE_STORES.filter((store: any) => {
      const id = (store.slug || store.tipo || store.store_type || '').toLowerCase();
      if (rubroFiltro === 'restaurante') return id.includes('roma') || id.includes('restaurante') || id.includes('gastronom');
      if (rubroFiltro === 'moda') return id.includes('milano') || id.includes('moda') || id.includes('boutique');
      if (rubroFiltro === 'servicios') return id.includes('zenit') || id.includes('spa') || id.includes('servicio');
      if (rubroFiltro === 'general') return id.includes('andes') || id.includes('general') || id.includes('super');
      return true;
    });
  }, [rubroFiltro]);

  const handleScrollToStores = () => {
    const section = document.getElementById('comercios');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-16 sm:space-y-20 lg:space-y-24">
      {/* ========================================================================= */}
      {/* 1. HERO — "EL BULEVAR DIGITAL" (Composición asimétrica editorial 60/40)   */}
      {/* ========================================================================= */}
      <section
        id="centralbo-hero-banner"
        className="pt-4 pb-2 sm:pt-8 sm:pb-6 md:pt-10 md:pb-8 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Lado izquierdo: Contenido editorial principal (~60%) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
            {/* Badge oficial */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>Comercio Digital en Bolivia</span>
            </div>

            {/* Titular de alto impacto con presencia editorial */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Tu comercio local,{' '}
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                ahora en digital.
              </span>
            </h1>

            {/* Descripción con balance de lectura óptimo */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
              Crea tu tienda online, gestiona tu catálogo de productos y servicios, atiende a tus clientes y administra pedidos de forma ágil y moderna.
            </p>

            {/* Acciones principales del Hero */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {/* CTA principal de exploración hacia el catálogo */}
              <button
                onClick={handleScrollToStores}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group"
              >
                <span>Explorar Tiendas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Si el usuario tiene sesión activa, mantener accesos directos funcionales */}
              {user && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2 shadow-2xs">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-slate-500 dark:text-slate-400">Sesión:</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </div>

                  {profile === 'superadmin' && (
                    <button
                      onClick={() => navigate('/superadmin')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>SuperAdmin</span>
                    </button>
                  )}

                  {profile === 'store_admin' && user.tenantId && (
                    <button
                      onClick={() => navigate(`/admin/${user.tenantId}`)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <StoreIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Mi Tienda</span>
                    </button>
                  )}

                  <button
                    onClick={() => signOut()}
                    className="px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lado derecho: Anclaje visual decorativo (~40%) — Carrusel Infinito Vertical (Marquee) */}
          <div className="lg:col-span-5 relative select-none">
            {/* Halo ambiental suave para profundidad */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 via-amber-500/5 to-rose-500/5 rounded-3xl blur-2xl pointer-events-none opacity-80 dark:opacity-50" />

            {/* Contenedor con altura fija visible y overflow-hidden */}
            <div className="relative w-full max-w-sm sm:max-w-md mx-auto lg:max-w-none h-[400px] overflow-hidden rounded-2xl group">
              {/* Máscara de desvanecimiento superior */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#F8FAFC] dark:from-[#0B0F17] to-transparent z-10 pointer-events-none" />

              {/* Máscara de desvanecimiento inferior */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F8FAFC] dark:from-[#0B0F17] to-transparent z-10 pointer-events-none" />

              {/* Tira animada de flujo continuo vertical */}
              <div className="flex flex-col gap-3.5 animate-marquee-vertical hover:[animation-play-state:paused] py-2">
                {HERO_MARQUEE_ITEMS.map((store, index) => {
                  const Icon = store.icon;
                  return (
                    <div
                      key={`${store.id}-${index}`}
                      className="p-4 rounded-2xl bg-white/95 dark:bg-[#0f1523]/95 border border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${store.iconBg} ${store.iconColor}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wider block ${store.catColor}`}
                            >
                              {store.category}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              {store.name}
                            </h4>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${store.badgeBg}`}
                        >
                          {store.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor sutil y elegante entre Hero y Cómo Funciona */}
      <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800/80" />

      {/* ========================================================================= */}
      {/* 2. BLOQUE "CÓMO FUNCIONA" (Onboarding Comprador en 3 Pasos)               */}
      {/* ========================================================================= */}
      <section className="w-full">
        {/* Cabecera de sección */}
        <div>
          <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 mb-1 block uppercase">
            EXPERIENCIA SIMPLE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-8">
            Comprar en CentralBo en 3 pasos
          </h2>
        </div>

        {/* Grid de 3 columnas responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Paso 1 */}
          <div className="bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center mb-4 text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Elige un comercio
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Explora vitrinas y catálogos de negocios locales verificados en Bolivia.
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center mb-4 text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Arma tu pedido
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Selecciona productos o servicios de forma ágil directamente al carrito.
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center mb-4 text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Envía por WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Coordina tu pedido, entrega y forma de pago directo con el comercio sin comisiones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor sutil y elegante entre Cómo Funciona y Sección de Comercios */}
      <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800/80" />

      {/* ========================================================================= */}
      {/* 3. SECCIÓN "COMERCIOS EN CENTRALBO" (#comercios)                          */}
      {/* ========================================================================= */}
      <section
        id="comercios"
        className="w-full space-y-8 scroll-mt-8"
      >
        {/* Encabezado editorial de la galería de tiendas */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Galería de Escaparates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Comercios en CentralBo
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Explora las tiendas disponibles en la plataforma y descubre sus productos y servicios:
            </p>
          </div>
        </div>

        {/* Filtros Rápidos por Vertical */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
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
                onClick={() => setRubroFiltro(filtro.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border flex items-center gap-1.5 active:scale-[0.98] ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border-slate-200/90 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{filtro.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid equilibrada de escaparates o Estado vacío si no hay coincidencias */}
        {comerciosFiltrados.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0d131f] border border-slate-200/80 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No se encontraron comercios registrados en esta vertical.
            </p>
            <button
              onClick={() => setRubroFiltro('todos')}
              className="mt-3.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
            >
              Ver todos los comercios
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {comerciosFiltrados.map((store) => {
              const meta = getCardMetadata(store);
              const Icon = meta.icon;

              return (
                <div
                  key={store.id}
                  className={`group relative rounded-2xl bg-white dark:bg-[#0d131f] border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${meta.borderAccent}`}
                >
                  {/* 1. Zona visual superior diferenciada con acento de rubro */}
                  <div>
                    <div
                      className={`rounded-xl p-4 mb-5 bg-gradient-to-br ${meta.surfaceGradient} border border-slate-100 dark:border-slate-800/60 flex items-center justify-between transition-colors`}
                    >
                      {/* Icono de categoría en marco arquitectónico */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${meta.iconBg}`}
                      >
                        <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                      </div>

                      {/* Micro-badge de rubro */}
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                      >
                        {meta.badge}
                      </span>
                    </div>

                    {/* 2. Zona de información */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        {meta.cat}
                      </span>

                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight">
                        {store.name}
                      </h3>
                    </div>
                  </div>

                  {/* 3. Zona de acción: CTA "Ver tienda →" */}
                  <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/tienda/${store.slug}`)}
                      className="w-full flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer group/btn active:scale-[0.98] bg-slate-50 border border-slate-300 text-slate-800 shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:bg-slate-800/80 dark:border-white/15 dark:text-slate-100 dark:hover:bg-white dark:hover:text-slate-900 dark:hover:border-white"
                    >
                      <span>Ver tienda</span>
                      <span className="text-sm font-bold group-hover/btn:translate-x-1 transition-transform">
                        →
                      </span>
                    </button>

                    {/* Acceso para SuperAdmin si está autenticado */}
                    {user?.profile === 'superadmin' && (
                      <button
                        onClick={() => navigate(`/admin/${store.id}`)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
                        title="Administrar como SuperAdmin"
                      >
                        Admin
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Divisor sutil y elegante entre Comercios y Banner B2B */}
      <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800/80" />

      {/* ========================================================================= */}
      {/* 4. BANNER B2B — "¿TIENES UN NEGOCIO? VENDE EN CENTRALBO"                 */}
      {/* ========================================================================= */}
      <section className="w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-[#0c121e] dark:via-[#111c30] dark:to-[#0c121e] border border-blue-900/40 dark:border-blue-500/20 p-8 sm:p-10 lg:p-12 text-white shadow-xl">
          {/* Destellos ambientales sutiles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <StoreIcon className="w-3.5 h-3.5" />
                Para Comercios & Emprendedores
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                ¿Tienes un negocio en Bolivia? Digitaliza tu catálogo con CentralBo
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Publica tus productos y servicios en minutos, recibe pedidos directos por WhatsApp y administra tu vitrina digital sin comisiones por venta ni comisiones ocultas.
              </p>

              {/* Ventajas clave */}
              <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>0% comisiones por venta</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pedidos directos a tu WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Catálogo y stock en tiempo real</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => navigate('/admin')}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Acceder al Administrador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleScrollToStores}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-[0.98]"
              >
                Explorar vitrinas
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
