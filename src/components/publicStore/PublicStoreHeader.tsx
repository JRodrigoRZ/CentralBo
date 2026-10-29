import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ChevronDown,
  Info,
  Instagram,
  Facebook,
  Video,
  Youtube,
  Utensils,
  Shirt,
  Briefcase,
  Store,
  ExternalLink,
  ShoppingBag,
  X,
  Zap,
  Coffee,
  Crown,
  Star,
  ArrowRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import {
  Store as StoreModel,
  StoreProfileSettings,
  StoreAppearanceSettings,
  StoreScheduleDay,
  Category,
  Product,
} from '../../types';
import { calculateScheduleStatus } from '../../lib/storeAdminService';
import { getVerticalMotionProfile } from './motionSystem';

interface PublicStoreHeaderProps {
  store: StoreModel;
  profile: StoreProfileSettings;
  appearance?: StoreAppearanceSettings | null;
  schedule: StoreScheduleDay[];
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenOrders?: () => void;
  primaryColor?: string;
  templateId?: string;
  categories?: Category[];
  products?: Product[];
  selectedCategoryId?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export const PublicStoreHeader: React.FC<PublicStoreHeaderProps> = ({
  store,
  profile,
  appearance,
  schedule,
  primaryColor = '#4f46e5',
  templateId,
  categories = [],
  products = [],
  selectedCategoryId,
  onSelectCategory,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const scheduleStatus = calculateScheduleStatus(schedule);

  // Limpiar teléfono para enlace directo a WhatsApp
  const rawWaPhone = profile.whatsapp || profile.phone || '';
  const cleanPhone = rawWaPhone.replace(/\D/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('591') ? cleanPhone : '591' + cleanPhone}`
    : null;

  // Tipos de vertical de negocio
  const isRestaurant = store.store_type === 'restaurante';
  const isFashion = store.store_type === 'moda';
  const isServices = store.store_type === 'servicios';
  const isRetail =
    store.store_type === 'retail' || store.store_type === 'supermercado';

  // Paleta de marca activa del comercio
  const activeBrandPrimary =
    appearance?.brandPrimaryColor ||
    primaryColor ||
    (isFashion
      ? '#be185d'
      : isServices
      ? '#047857'
      : isRetail
      ? '#1d4ed8'
      : isRestaurant
      ? '#b45309'
      : '#4f46e5');

  const activeBrandSecondary =
    appearance?.brandSecondaryColor ||
    (isFashion
      ? '#e11d48'
      : isServices
      ? '#10b981'
      : isRetail
      ? '#0284c7'
      : isRestaurant
      ? '#ea580c'
      : '#06b6d4');

  // Resolver URL real del logo (del perfil o del registro de store)
  const rawLogoUrl = (profile?.logoUrl || store?.logo_url || '').trim();
  const hasLogo = Boolean(rawLogoUrl) && !logoLoadError;

  // Icono o Isotipo fallback representativo
  const getVerticalIcon = () => {
    switch (store.store_type) {
      case 'restaurante':
        return Utensils;
      case 'moda':
        return Shirt;
      case 'servicios':
        return Briefcase;
      case 'retail':
      case 'supermercado':
        return ShoppingBag;
      default:
        return Store;
    }
  };

  const VerticalIcon = getVerticalIcon();

  // Etiqueta descriptor del tipo de comercio
  const storeCategoryLabel = isFashion
    ? 'Boutique & Moda'
    : isRestaurant
    ? 'Restaurante & Gastronomía'
    : isServices
    ? 'Servicios Profesionales & Bienestar'
    : isRetail
    ? 'Supermercado & Abastecimiento'
    : 'Comercio Digital';

  // Nombre visible prioritario del comercio
  const storeDisplayName = (profile?.name || store?.name || 'Comercio').trim();

  // Animaciones adaptadas armónicamente por vertical
  const motionProfile = getVerticalMotionProfile(store.store_type, shouldReduceMotion);

  const containerVariants = {
    hidden: { opacity: 0, y: motionProfile.subtleY },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionProfile.duration,
        ease: motionProfile.ease,
        staggerChildren: motionProfile.stagger,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : Math.round(motionProfile.subtleY * 0.75) },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: motionProfile.duration, ease: motionProfile.ease },
    },
  };

  const activeTemplate = templateId || appearance?.templateId || 'free';

  // Desplazamiento suave hacia la sección del catálogo
  const handleScrollToCatalog = () => {
    const el = document.getElementById('catalog-view-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --------------------------------------------------------------------------
  // MODAL COMÚN DE HORARIOS SEMANALES
  // --------------------------------------------------------------------------
  const renderScheduleModal = () => (
    <AnimatePresence>
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97, y: shouldReduceMotion ? 0 : 6 }}
            transition={{ duration: motionProfile.duration, ease: motionProfile.ease }}
            className="w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 font-bold text-base">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Horarios de Atención Semanales</span>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition active:scale-95 cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {schedule.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className="flex items-center justify-between py-2 px-3.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-950/60 border border-stone-200/60 dark:border-stone-800/60"
                >
                  <span className="font-semibold text-stone-800 dark:text-stone-200 w-24">
                    {day.dayName}
                  </span>
                  {day.isOpen ? (
                    <div className="text-stone-600 dark:text-stone-300 font-mono text-[11px] text-right space-y-0.5">
                      {day.periods.map((p, idx) => (
                        <div key={idx}>
                          {p.open} - {p.close}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-rose-500 font-semibold text-[11px]">
                      Cerrado
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-full py-2.5 rounded-xl text-white text-xs font-bold transition cursor-pointer shadow-md hover:opacity-95 active:scale-[0.98] bg-stone-900 dark:bg-amber-600"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // --------------------------------------------------------------------------
  // MODELO G5 — PEDIDO EXPRESS VISUAL (EXCLUSIVO PRO)
  // Diseño dinámico, enérgico, de alto impacto con fotografía y pedidos rápidos
  // --------------------------------------------------------------------------
  if (activeTemplate === 'g5') {
    return (
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-300 bg-gradient-to-b from-[#111218] via-[#161720] to-[#0D0E13] text-white border border-orange-500/35 shadow-xl"
      >
        {/* Halo dinámico ámbar/naranja */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-25 bg-orange-600" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15 bg-amber-600" />

        <div className="relative z-10 space-y-5">
          {/* Fila superior: Identidad del comercio */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo con marco vibrante */}
              <div className="relative shrink-0">
                {hasLogo ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5 flex items-center justify-center border-2 border-orange-500/50 bg-stone-900 shadow-md overflow-hidden">
                    <img
                      src={rawLogoUrl}
                      alt={storeDisplayName}
                      className="w-full h-full object-contain rounded-xl block select-none"
                      onError={() => setLogoLoadError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 border-orange-500/50 bg-stone-900 text-orange-400 font-black text-2xl shadow-md">
                    {storeDisplayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Nombre e indicador */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/35 text-[10px] font-black uppercase tracking-wider">
                    <Zap className="w-3 h-3" />
                    <span>Pedido Express</span>
                  </span>
                  <span className="text-xs text-stone-400 hidden sm:inline">•</span>
                  <span className="text-xs font-semibold text-stone-300 hidden sm:inline">
                    {storeCategoryLabel}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none">
                  {storeDisplayName}
                </h1>
                {profile?.description && (
                  <p className="text-xs text-stone-300 line-clamp-1 max-w-xl">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            {/* Selector de horario y estado en vivo */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold bg-stone-900/90 text-stone-200 border-orange-500/30 hover:border-orange-500/60 transition shadow-sm cursor-pointer active:scale-95 shrink-0"
              title="Consultar horarios semanales"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  scheduleStatus.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{scheduleStatus.statusLabel}</span>
              <span className="text-[11px] text-stone-400 hidden md:inline font-normal">
                ({scheduleStatus.nextOpeningInfo})
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>
          </div>

          {/* Fila de Contacto Directo */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition bg-[#25D366] hover:bg-[#20bd5a] text-white cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Pedir por WhatsApp</span>
              </a>
            )}

            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs bg-stone-900/80 hover:bg-stone-800 text-stone-200 border-stone-700/80 transition"
              >
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span>{profile.phone}</span>
              </a>
            )}

            {profile?.address && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/60 border border-stone-800 text-stone-300 text-xs">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-md">{profile.address}</span>
              </div>
            )}
          </div>

          {/* HERO DEDICADO G5: TU COMIDA FAVORITA EN MINUTOS */}
          <div className="mt-4 pt-5 border-t border-orange-500/20 bg-gradient-to-r from-orange-950/40 via-stone-900/40 to-black/60 rounded-2xl p-4 sm:p-5 border border-orange-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Tu comida favorita{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                    en minutos
                  </span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Pide fácilmente desde un solo lugar. Agrega tus platos favoritos al instante con mínima fricción y confirma directamente.
              </p>
            </div>

            <button
              type="button"
              onClick={handleScrollToCatalog}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
            >
              <span>Ver menú completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Chips de Categorías Rápidas con exploración visual */}
          {categories.length > 0 && (
            <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={handleScrollToCatalog}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900/90 hover:bg-orange-500/20 text-stone-200 hover:text-white border border-stone-800 hover:border-orange-500/40 text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {renderScheduleModal()}
      </motion.header>
    );
  }

  // --------------------------------------------------------------------------
  // MODELO G6 — MENÚ VISUAL FOTOGRÁFICO / CARTA GOURMET VISUAL (EXCLUSIVO PRO)
  // Diseño tipo carta gastronómica con fotografía protagonista y estética esmeralda
  // --------------------------------------------------------------------------
  if (activeTemplate === 'g6') {
    return (
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-300 bg-gradient-to-b from-[#09130D] via-[#0E1C13] to-[#070E0A] text-white border border-emerald-500/35 shadow-xl"
      >
        {/* Halo ambiental verde esmeralda */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 bg-emerald-600" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-10 bg-teal-600" />

        <div className="relative z-10 space-y-5">
          {/* Fila superior: Identidad del comercio */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo enmarcado en verde gastronómico */}
              <div className="relative shrink-0">
                {hasLogo ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5 flex items-center justify-center border-2 border-emerald-500/40 bg-[#0A160F] shadow-md overflow-hidden">
                    <img
                      src={rawLogoUrl}
                      alt={storeDisplayName}
                      className="w-full h-full object-contain rounded-xl block select-none"
                      onError={() => setLogoLoadError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 border-emerald-500/40 bg-[#0A160F] text-emerald-400 font-extrabold text-2xl shadow-md">
                    {storeDisplayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Nombre y sello culinario */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 text-[10px] font-bold uppercase tracking-wider">
                    <Utensils className="w-3 h-3" />
                    <span>Carta Gourmet</span>
                  </span>
                  <span className="text-xs text-stone-400 hidden sm:inline">•</span>
                  <span className="text-xs font-semibold text-stone-300 hidden sm:inline">
                    {storeCategoryLabel}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
                  {storeDisplayName}
                </h1>
                {profile?.description && (
                  <p className="text-xs text-stone-300 line-clamp-1 max-w-xl">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            {/* Selector de horario y estado en vivo */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold bg-[#0A160F]/90 text-stone-200 border-emerald-500/30 hover:border-emerald-500/60 transition shadow-sm cursor-pointer active:scale-95 shrink-0"
              title="Consultar horarios semanales"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  scheduleStatus.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{scheduleStatus.statusLabel}</span>
              <span className="text-[11px] text-stone-400 hidden md:inline font-normal">
                ({scheduleStatus.nextOpeningInfo})
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>
          </div>

          {/* Fila de Contacto Directo */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition bg-[#25D366] hover:bg-[#20bd5a] text-white cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp Carta</span>
              </a>
            )}

            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs bg-[#0A160F]/80 hover:bg-stone-800 text-stone-200 border-emerald-900/40 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{profile.phone}</span>
              </a>
            )}

            {profile?.address && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A160F]/60 border border-emerald-950/60 text-stone-300 text-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-md">{profile.address}</span>
              </div>
            )}
          </div>

          {/* HERO DEDICADO G6: SABORES QUE INSPIRAN — NUESTRA CARTA */}
          <div className="mt-4 pt-5 border-t border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-stone-900/30 to-black/50 rounded-2xl p-4 sm:p-5 border border-emerald-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Sabores que inspiran —{' '}
                  <span className="text-emerald-400">Nuestra Carta</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Descubre nuestra selección culinaria especialmente preparada para ti con fotografías apetitosas e ingredientes selectos de primera calidad.
              </p>
            </div>

            <button
              type="button"
              onClick={handleScrollToCatalog}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
            >
              <span>Explorar carta gastronómica</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Chips de Categorías Rápidas */}
          {categories.length > 0 && (
            <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={handleScrollToCatalog}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0A160F] hover:bg-emerald-500/20 text-stone-200 hover:text-white border border-emerald-900/40 hover:border-emerald-500/40 text-xs font-semibold transition shrink-0 cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {renderScheduleModal()}
      </motion.header>
    );
  }

  // --------------------------------------------------------------------------
  // MODELO G7 — CAFÉ & BOUTIQUE EDITORIAL (EXCLUSIVO PRO)
  // Atmósfera cálida, editorial, artesanal con tipografía serif y tonos moca/latte
  // --------------------------------------------------------------------------
  if (activeTemplate === 'g7') {
    const isChifaStore = store.slug?.toLowerCase().includes('chifabill') || store.name?.toLowerCase().includes('chifa');
    const g7CoverUrl = appearance?.g7Settings?.coverImageUrl?.trim();
    const rawTagline = appearance?.g7Settings?.tagline;
    const g7Tagline = (typeof rawTagline === 'string' && rawTagline.trim().length > 0)
      ? rawTagline.trim()
      : (isChifaStore ? 'CHIFA' : 'CAFÉ & BOUTIQUE EDITORIAL');

    // Título principal de la portada: si no está configurado, fallback al nombre real del comercio
    const rawTitle = appearance?.g7Settings?.title;
    const g7Title = (typeof rawTitle === 'string' && rawTitle.trim().length > 0)
      ? rawTitle.trim()
      : storeDisplayName;

    // Descripción de la portada: si no está configurada, fallback a la descripción real del comercio (o vacía sin inventar)
    const rawDesc = appearance?.g7Settings?.description;
    const g7Description = (typeof rawDesc === 'string' && rawDesc.trim().length > 0)
      ? rawDesc.trim()
      : (profile?.description?.trim() || '');

    return (
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-[#FAF5EE] via-[#F6ECE0] to-[#EFE2D3] dark:from-[#181310] dark:via-[#201814] dark:to-[#140F0D] text-stone-900 dark:text-[#F6EDE2] border border-amber-200/90 dark:border-amber-900/40 shadow-md space-y-6"
      >
        {/* Resplandor suave cálido decorativo */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 bg-amber-600/30" />

        <div className="relative z-10 space-y-5">
          {/* 1. FILA SUPERIOR: IDENTIDAD DEL COMERCIO */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              {/* Logo con marco suave artesanal */}
              <div className="relative shrink-0">
                {hasLogo ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5 flex items-center justify-center border-2 border-amber-300/80 dark:border-amber-700/60 bg-white dark:bg-[#231A14] shadow-sm overflow-hidden">
                    <img
                      src={rawLogoUrl}
                      alt={storeDisplayName}
                      className="w-full h-full object-contain rounded-xl block select-none"
                      onError={() => setLogoLoadError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 border-amber-300/80 dark:border-amber-700/60 bg-white dark:bg-[#231A14] text-amber-800 dark:text-amber-300 font-serif font-bold text-2xl shadow-sm">
                    {storeDisplayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Nombre y descriptor editorial */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-950 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/50 text-[10px] font-serif font-semibold tracking-wider uppercase">
                    <VerticalIcon className="w-3 h-3 text-amber-800 dark:text-amber-300" />
                    <span>{storeCategoryLabel}</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-amber-950 dark:text-[#FAF5EE] leading-tight truncate">
                  {storeDisplayName}
                </h1>
                {profile?.description && (
                  <p className="font-serif text-xs sm:text-sm text-stone-700 dark:text-stone-300 line-clamp-1 max-w-xl">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            {/* Selector de horario en estilo boutique */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-serif font-semibold bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 transition shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Consultar horarios semanales"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  scheduleStatus.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{scheduleStatus.statusLabel}</span>
              <span className="text-[11px] opacity-75 hidden md:inline font-normal font-sans">
                ({scheduleStatus.nextOpeningInfo})
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>
          </div>

          {/* Fila de Contacto Directo */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5 font-serif">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition bg-[#25D366] hover:bg-[#20bd5a] text-white cursor-pointer active:scale-95 font-sans"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Pedir por WhatsApp</span>
              </a>
            )}

            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium text-xs bg-white/80 dark:bg-stone-900/80 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border-amber-200/80 dark:border-stone-800 transition font-sans"
              >
                <Phone className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>{profile.phone}</span>
              </a>
            )}

            {profile?.address && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-stone-900/60 border border-amber-200/60 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-md">{profile.address}</span>
              </div>
            )}
          </div>

          {/* 2. PORTADA FOTOGRÁFICA EDITORIAL (CON INSCRIPCIÓN Y FOTO DE FONDO) */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] flex flex-col justify-end p-5 sm:p-7 md:p-8 shadow-md border border-amber-200/60 dark:border-amber-900/50">
            {/* Fotografía de portada detrás del texto o fondo cálido digno si aún no subió foto */}
            {g7CoverUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700"
                style={{ backgroundImage: `url(${g7CoverUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D1A12] via-[#3E2419] to-[#1E110B]" />
            )}

            {/* Capa de contraste cálida y degradado oscuro para máxima legibilidad en modos claro y oscuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25 dark:from-black/90 dark:via-black/65 to-black/35 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent pointer-events-none" />

            {/* Contenido sobre la portada */}
            <div className="relative z-10 space-y-2.5 sm:space-y-3 max-w-xl text-white">
              {/* Inscripción comercial editable */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/95 text-amber-950 dark:bg-amber-950/90 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/60 text-[10px] sm:text-xs font-serif font-bold tracking-widest uppercase shadow-xs backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                <span>{g7Tagline}</span>
              </div>

              {/* Título y descripción de la portada: personalizables con fallback real del comercio */}
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white leading-snug drop-shadow-md">
                {g7Title}
              </h2>

              {g7Description && (
                <p className="font-serif text-xs sm:text-sm text-stone-200/95 leading-relaxed max-w-lg drop-shadow-sm">
                  {g7Description}
                </p>
              )}

              {/* Botón de acción editorial */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleScrollToCatalog}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B45309] hover:bg-[#92400e] text-white font-serif font-bold text-xs sm:text-sm shadow-md shadow-amber-950/40 transition active:scale-95 cursor-pointer"
                >
                  <span>Ver nuestro menú</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. PEQUEÑOS RECUADROS FOTOGRÁFICOS DE CATEGORÍAS REALES DEL COMERCIO */}
          {categories.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between pb-1 border-b border-amber-200/60 dark:border-stone-800/60">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <span>Categorías</span>
                  <span className="text-[10px] font-sans font-normal opacity-70">({categories.length})</span>
                </span>
                {selectedCategoryId && selectedCategoryId !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory?.('all');
                      handleScrollToCatalog();
                    }}
                    className="text-[11px] font-serif font-semibold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Ver todo el menú</span>
                    <span>→</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-serif italic text-stone-500 dark:text-stone-400">
                    Selecciona para ver platos
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2">
                {/* Recuadros fotográficos de cada categoría real del comercio */}
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;

                  // Resolver fotografía real de la categoría o del primer producto con foto en dicha categoría
                  let catPhoto = (typeof cat.image_url === 'string' && cat.image_url.trim()) ? cat.image_url.trim() : undefined;
                  if (!catPhoto) {
                    const prodWithPhoto = products.find((p) => {
                      if (p.category_id !== cat.id) return false;
                      if (p.image_url && typeof p.image_url === 'string' && p.image_url.trim()) return true;
                      if (Array.isArray(p.images) && p.images.length > 0 && typeof p.images[0] === 'string' && p.images[0].trim()) return true;
                      return false;
                    });
                    if (prodWithPhoto) {
                      catPhoto = prodWithPhoto.image_url?.trim() || prodWithPhoto.images?.[0]?.trim();
                    }
                  }

                  // Icono neutro gastronómico o contextual (sin imponer café a cena/almuerzo)
                  const catNameNorm = cat.name.toLowerCase();
                  const isCoffeeCat = ['café', 'cafe', 'té', 'infusion', 'latte', 'cappuccino'].some((w) => catNameNorm.includes(w));
                  const CategoryIcon = isCoffeeCat ? Coffee : Utensils;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        // Alternar filtro: si ya está seleccionada, restablece a 'all'
                        const nextId = isSelected ? 'all' : cat.id;
                        onSelectCategory?.(nextId);
                        handleScrollToCatalog();
                      }}
                      className="flex flex-col items-center group cursor-pointer shrink-0 transition-transform active:scale-95 text-center"
                      title={isSelected ? `Filtro activo: ${cat.name} (clic para ver todo)` : `Filtrar por ${cat.name}`}
                    >
                      <div
                        className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm relative ${
                          isSelected
                            ? 'border-[#B45309] dark:border-amber-400 ring-2 ring-amber-500/40 shadow-md scale-105 bg-amber-50 dark:bg-stone-900'
                            : 'border-amber-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-400 group-hover:scale-105'
                        }`}
                      >
                        {catPhoto ? (
                          <img
                            src={catPhoto}
                            alt={cat.name}
                            className="w-full h-full object-cover select-none"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200/90 dark:from-[#261E1A] dark:to-[#1A1411] flex flex-col items-center justify-center text-amber-900 dark:text-amber-300 p-1">
                            <CategoryIcon className="w-6 h-6 opacity-80 mb-0.5" />
                            <span className="text-[9px] font-serif font-bold uppercase tracking-wider line-clamp-1 opacity-70">
                              {cat.name.slice(0, 4)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-serif text-center mt-1.5 truncate max-w-[80px] sm:max-w-[96px] ${
                          isSelected
                            ? 'font-bold text-amber-950 dark:text-amber-200'
                            : 'font-medium text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {renderScheduleModal()}
      </motion.header>
    );
  }

  // --------------------------------------------------------------------------
  // MODELO G8 — ESPECIALIDADES PREMIUM / ALTA COCINA (EXCLUSIVO PRO)
  // Atmósfera señorial, obsidiana, contrastes dorados y platos insignia del chef
  // --------------------------------------------------------------------------
  if (activeTemplate === 'g8') {
    return (
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 bg-gradient-to-b from-[#090A0D] via-[#101319] to-[#07080A] text-white border border-amber-500/40 shadow-2xl ring-1 ring-amber-500/20"
      >
        {/* Halo señorial dorado */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 bg-amber-500/30" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-10 bg-yellow-600/20" />

        <div className="relative z-10 space-y-6">
          {/* Fila superior: Identidad del comercio */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo con marco dorado satinado */}
              <div className="relative shrink-0">
                {hasLogo ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5 flex items-center justify-center border-2 border-amber-400/50 bg-[#14171E] shadow-[0_0_20px_rgba(245,158,11,0.18)] overflow-hidden">
                    <img
                      src={rawLogoUrl}
                      alt={storeDisplayName}
                      className="w-full h-full object-contain rounded-xl block select-none"
                      onError={() => setLogoLoadError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 border-amber-400/50 bg-[#14171E] text-amber-300 font-serif font-bold text-2xl shadow-[0_0_20px_rgba(245,158,11,0.18)]">
                    {storeDisplayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Nombre y distinción de autor */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-widest">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Especialidades del Chef</span>
                  </span>
                  <span className="text-xs text-amber-500/50 hidden sm:inline">•</span>
                  <span className="text-xs font-serif italic text-amber-200/80 hidden sm:inline">
                    Alta Gastronomía
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-wide text-white leading-tight">
                  {storeDisplayName}
                </h1>
                {profile?.description && (
                  <p className="text-xs sm:text-sm text-stone-300 line-clamp-1 max-w-xl">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            {/* Selector de horario en estilo señorial dorado */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold bg-[#14171E]/90 text-amber-100 border-amber-500/35 hover:border-amber-400 transition shadow-sm cursor-pointer active:scale-95 shrink-0"
              title="Consultar horarios semanales"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  scheduleStatus.isOpenNow ? 'bg-amber-400 animate-pulse' : 'bg-stone-500'
                }`}
              />
              <span>{scheduleStatus.statusLabel}</span>
              <span className="text-[11px] text-amber-200/60 hidden md:inline font-normal">
                ({scheduleStatus.nextOpeningInfo})
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>
          </div>

          {/* Fila de Contacto Directo */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition bg-[#25D366] hover:bg-[#20bd5a] text-white cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp Exclusivo</span>
              </a>
            )}

            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs bg-[#14171E] hover:bg-stone-800 text-stone-200 border-amber-500/30 transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.phone}</span>
              </a>
            )}

            {profile?.address && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14171E]/60 border border-amber-500/20 text-stone-300 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-md">{profile.address}</span>
              </div>
            )}
          </div>

          {/* HERO DEDICADO G8: NUESTRAS ESPECIALIDADES */}
          <div className="mt-4 pt-5 border-t border-amber-500/30 bg-[#13161F]/90 rounded-2xl p-5 border border-amber-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
                  Nuestras Especialidades
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Platos que cuentan historias — Una selección única preparada con ingredientes selectos para paladares exigentes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleScrollToCatalog}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
            >
              <span>Descubrir especialidades</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trilogía de sellos de distinción de autor */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
              ✦ Ingredientes premium
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
              ✦ Cocina de autor
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
              ✦ Experiencia única
            </span>
          </div>
        </div>

        {renderScheduleModal()}
      </motion.header>
    );
  }

  // --------------------------------------------------------------------------
  // MODELO OFICIAL BASE 'FREE' Y RESTO DE MODELOS EXISTENTES (G1-G4, M, S, B, C)
  // CONSERVADO 100% INTACTO SEGÚN REQUERIMIENTO ESTRICTO
  // --------------------------------------------------------------------------
  const getHeaderAtmosphereClasses = () => {
    if (activeTemplate === 'b1') {
      return 'bg-stone-950 text-white border-amber-500/40 shadow-lg';
    }
    if (activeTemplate === 'b4') {
      return 'bg-slate-950 text-white border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.18)]';
    }
    if (activeTemplate === 'g3') {
      return 'bg-[#FDFBF7] dark:bg-[#1A1815] border-amber-200/80 dark:border-stone-800 text-stone-900 dark:text-stone-100 shadow-sm';
    }
    if (activeTemplate === 'm3') {
      return 'bg-stone-950 text-white border-stone-800 shadow-md';
    }
    if (activeTemplate === 's3') {
      return 'bg-stone-900 text-white border-amber-600/40 shadow-md';
    }
    if (isFashion) {
      return 'bg-[#FAF7F3] dark:bg-[#161413] border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 shadow-sm';
    }
    if (isServices) {
      return 'bg-[#F4F8F5] dark:bg-[#101713] border-emerald-900/10 dark:border-emerald-500/20 text-stone-900 dark:text-stone-100 shadow-sm';
    }
    if (isRetail) {
      return 'bg-[#F4F7FB] dark:bg-[#0E1524] border-blue-900/10 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 shadow-sm';
    }
    if (isRestaurant) {
      return 'bg-[#FAF6F0] dark:bg-[#181512] border-amber-900/15 dark:border-amber-500/20 text-stone-900 dark:text-stone-100 shadow-sm';
    }
    return 'bg-white dark:bg-[#11141E] border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm';
  };

  const headerPaddingClass =
    activeTemplate === 'g1' || activeTemplate === 'c1'
      ? 'p-4 sm:p-6 md:p-7'
      : 'p-6 sm:p-8 md:p-9';

  return (
    <motion.header
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full rounded-3xl ${headerPaddingClass} relative overflow-hidden transition-all duration-300 border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 shadow-xs ${getHeaderAtmosphereClasses()}`}
    >
      {/* Halo ambiental suave con color de identidad del comercio */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15 dark:opacity-10 transition-opacity"
        style={{ backgroundColor: activeBrandPrimary }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-10 dark:opacity-5 transition-opacity"
        style={{ backgroundColor: activeBrandSecondary }}
      />

      {/* Contenido estructural: Portada e Identidad del Comercio */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-7">
        {/* LOGO DEL COMERCIO */}
        <motion.div variants={itemVariants} className="relative shrink-0">
          {hasLogo ? (
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl p-2 flex items-center justify-center border shadow-xs bg-white dark:bg-stone-950 overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
              style={{ borderColor: `${activeBrandPrimary}35` }}
            >
              <img
                src={rawLogoUrl}
                alt={`Logo oficial de ${storeDisplayName}`}
                className="w-full h-full object-contain rounded-xl block select-none"
                onError={() => setLogoLoadError(true)}
              />
            </div>
          ) : (
            // Fallback visual de identidad: Monograma estilizado
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl flex flex-col items-center justify-center border shadow-xs transition-transform duration-200 hover:scale-[1.02] bg-white dark:bg-stone-950"
              style={{
                borderColor: `${activeBrandPrimary}35`,
                color: activeBrandPrimary,
              }}
            >
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-xl select-none"
                style={{
                  background: `linear-gradient(135deg, ${activeBrandPrimary}, ${activeBrandSecondary})`,
                }}
              >
                {storeDisplayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-semibold mt-1 opacity-70 uppercase tracking-wider">
                {store.store_type}
              </span>
            </div>
          )}
        </motion.div>

        {/* IDENTIDAD DEL COMERCIO */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Fila 1: Metadatos limpios sin píldoras invasivas + Horario de atención en vivo */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <VerticalIcon className="w-3.5 h-3.5" style={{ color: activeBrandPrimary }} />
              <span>{storeCategoryLabel}</span>
            </span>

            <span className="text-stone-300 dark:text-stone-700 select-none">•</span>

            {/* Selector interactivo de Horarios de Atención */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold bg-stone-50/90 dark:bg-stone-950/80 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition shadow-2xs cursor-pointer active:scale-95"
              title="Consultar horarios de atención semanales"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  scheduleStatus.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{scheduleStatus.statusLabel}</span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:inline font-normal">
                ({scheduleStatus.nextOpeningInfo})
              </span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
            </button>
          </motion.div>

          {/* Fila 2: Nombre del Comercio con tipografía adaptada */}
          <motion.div variants={itemVariants}>
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight ${
                activeTemplate === 'g3' || activeTemplate === 'm1' || activeTemplate === 'c4'
                  ? 'font-serif font-bold text-stone-900 dark:text-white'
                  : activeTemplate === 'm3' || activeTemplate === 'b3' || activeTemplate === 's3'
                  ? 'font-black tracking-tighter uppercase text-stone-900 dark:text-white'
                  : isFashion || isServices
                  ? 'font-serif font-bold text-stone-900 dark:text-white'
                  : 'font-extrabold text-stone-900 dark:text-white'
              }`}
            >
              {storeDisplayName}
            </h1>
          </motion.div>

          {/* Fila 3: Descripción del comercio */}
          {profile?.description && (
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2 max-w-2xl leading-relaxed"
            >
              {profile.description}
            </motion.p>
          )}

          {/* Fila 4: Dirección y notas de atención (si existen) */}
          {(profile?.address || profile?.attentionInfo) && (
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 pt-0.5"
            >
              {profile?.address && (
                <div className="flex items-center gap-1.5 max-w-full">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: activeBrandPrimary }} />
                  <span className="truncate max-w-[280px] sm:max-w-md">{profile.address}</span>
                </div>
              )}
              {profile?.attentionInfo && (
                <div className="flex items-center gap-1.5 max-w-full">
                  <Info className="w-3.5 h-3.5 shrink-0" style={{ color: activeBrandPrimary }} />
                  <span className="truncate max-w-[280px] sm:max-w-md">{profile.attentionInfo}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Fila 5: Canales de contacto directos y redes sociales */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-2 pt-2 text-xs"
          >
            {/* WhatsApp Directo */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition bg-[#25D366] hover:bg-[#20bd5a] text-white hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
                title="Contactar directamente por WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Teléfono */}
            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs shadow-2xs transition bg-stone-50 hover:bg-stone-100 text-stone-800 dark:bg-stone-950/80 dark:hover:bg-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                title={`Llamar a ${profile.phone}`}
              >
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: activeBrandPrimary }} />
                <span>{profile.phone}</span>
              </a>
            )}

            {/* Correo Electrónico */}
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium text-xs shadow-2xs transition bg-stone-50 hover:bg-stone-100 text-stone-800 dark:bg-stone-950/80 dark:hover:bg-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:scale-[1.02] active:scale-[0.98] max-w-full shrink-0"
                title={`Enviar correo a ${profile.email}`}
              >
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: activeBrandPrimary }} />
                <span className="truncate max-w-[170px] sm:max-w-xs">{profile.email}</span>
              </a>
            )}

            {/* Redes Sociales Reales Configuradas */}
            {[
              {
                icon: <Instagram className="w-3.5 h-3.5" />,
                label: 'Instagram',
                show: Boolean(profile?.socials?.instagram),
                url: profile?.socials?.instagram
                  ? profile.socials.instagram.startsWith('http')
                    ? profile.socials.instagram
                    : `https://instagram.com/${profile.socials.instagram.replace('@', '')}`
                  : '#',
              },
              {
                icon: <Facebook className="w-3.5 h-3.5" />,
                label: 'Facebook',
                show: Boolean(profile?.socials?.facebook),
                url: profile?.socials?.facebook
                  ? profile.socials.facebook.startsWith('http')
                    ? profile.socials.facebook
                    : `https://facebook.com/${profile.socials.facebook}`
                  : '#',
              },
              {
                icon: <Video className="w-3.5 h-3.5" />,
                label: 'TikTok',
                show: Boolean(profile?.socials?.tiktok),
                url: profile?.socials?.tiktok
                  ? profile.socials.tiktok.startsWith('http')
                    ? profile.socials.tiktok
                    : `https://tiktok.com/@${profile.socials.tiktok.replace('@', '')}`
                  : '#',
              },
              {
                icon: <Youtube className="w-3.5 h-3.5" />,
                label: 'YouTube',
                show: Boolean(profile?.socials?.youtube),
                url: profile?.socials?.youtube
                  ? profile.socials.youtube.startsWith('http')
                    ? profile.socials.youtube
                    : `https://youtube.com/${profile.socials.youtube}`
                  : '#',
              },
            ]
              .filter((s) => s.show)
              .map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium text-xs shadow-2xs transition bg-stone-50 hover:bg-stone-100 text-stone-800 dark:bg-stone-950/80 dark:hover:bg-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  <span className="shrink-0" style={{ color: activeBrandPrimary }}>
                    {social.icon}
                  </span>
                  <span>{social.label}</span>
                </a>
              ))}
          </motion.div>
        </div>
      </div>

      {renderScheduleModal()}
    </motion.header>
  );
};
