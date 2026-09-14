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
} from 'lucide-react';
import {
  Store as StoreModel,
  StoreProfileSettings,
  StoreAppearanceSettings,
  StoreScheduleDay,
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
}

export const PublicStoreHeader: React.FC<PublicStoreHeaderProps> = ({
  store,
  profile,
  appearance,
  schedule,
  primaryColor = '#4f46e5',
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

  // Clases atmosféricas según personalidad visual de cada vertical
  const getHeaderAtmosphereClasses = () => {
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

  return (
    <motion.header
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full rounded-3xl p-5 sm:p-7 md:p-8 relative overflow-hidden transition-all duration-300 border ${getHeaderAtmosphereClasses()}`}
    >
      {/* Halos atmosféricos suaves con color de identidad del comercio (sin saturación quemada) */}
      <div
        className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15 dark:opacity-10 transition-opacity"
        style={{ backgroundColor: activeBrandPrimary }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10 dark:opacity-8 transition-opacity"
        style={{ backgroundColor: activeBrandSecondary }}
      />

      {/* Contenido estructural: Portada e Identidad */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-7">
        {/* LOGO DEL COMERCIO (Recuperado y prioritario) */}
        <motion.div variants={itemVariants} className="relative shrink-0">
          {hasLogo ? (
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl p-1.5 flex items-center justify-center border shadow-xs bg-white dark:bg-stone-900/95 overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
              style={{ borderColor: `${activeBrandPrimary}40` }}
            >
              <img
                src={rawLogoUrl}
                alt={`Logo oficial de ${storeDisplayName}`}
                className="w-full h-full object-contain rounded-xl"
                onError={() => setLogoLoadError(true)}
              />
            </div>
          ) : (
            // Fallback visual de identidad: Monograma / Isotipo estilizado
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl flex flex-col items-center justify-center border shadow-xs transition-transform duration-200 hover:scale-[1.02] bg-white dark:bg-stone-900/95"
              style={{
                borderColor: `${activeBrandPrimary}40`,
                color: activeBrandPrimary,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-xl"
                style={{
                  background: `linear-gradient(135deg, ${activeBrandPrimary}, ${activeBrandSecondary})`,
                }}
              >
                {storeDisplayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-semibold mt-1 opacity-75 uppercase tracking-wider">
                {store.store_type}
              </span>
            </div>
          )}
        </motion.div>

        {/* IDENTIDAD DEL COMERCIO (Nombre + Descriptor + Estado en vivo + Contacto) */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Fila 1: Categoría / Descriptor de vertical */}
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${activeBrandPrimary}12`,
                color: activeBrandPrimary,
                borderColor: `${activeBrandPrimary}33`,
              }}
            >
              <VerticalIcon className="w-3 h-3" />
              <span>{storeCategoryLabel}</span>
            </span>

            {/* Indicador en vivo de Horario de Atención */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-medium bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-600 transition shadow-2xs cursor-pointer"
              style={{ borderColor: `${activeBrandPrimary}40` }}
              title="Consultar horarios de atención semanales"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  scheduleStatus.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-semibold">{scheduleStatus.statusLabel}</span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:inline">
                • {scheduleStatus.nextOpeningInfo}
              </span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
            </button>
          </motion.div>

          {/* Fila 2: Nombre del Comercio */}
          <motion.div variants={itemVariants}>
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight ${
                isFashion || isServices
                  ? 'font-serif font-bold text-stone-900 dark:text-white'
                  : 'font-extrabold text-stone-900 dark:text-white'
              }`}
            >
              {storeDisplayName}
            </h1>
          </motion.div>

          {/* Fila 3: Descriptor / Descripción del comercio si existe */}
          {profile?.description && (
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2 max-w-3xl leading-relaxed"
            >
              {profile.description}
            </motion.p>
          )}

          {/* Fila 4: Zona Unificada de Canales de Contacto (Pills Coherentes) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-2 pt-1 text-xs"
          >
            {/* WhatsApp Directo */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold text-xs shadow-2xs transition bg-white/90 hover:bg-white text-stone-900 dark:bg-stone-900/90 dark:hover:bg-stone-800 dark:text-stone-100 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                style={{ borderColor: `${activeBrandPrimary}44` }}
                title="Contactar por WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Teléfono */}
            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium text-xs shadow-2xs transition bg-white/90 hover:bg-white text-stone-800 hover:text-stone-950 dark:bg-stone-900/90 dark:hover:bg-stone-800 dark:text-stone-200 dark:hover:text-white hover:scale-[1.02] active:scale-[0.98] shrink-0"
                style={{ borderColor: `${activeBrandPrimary}33` }}
                title={`Llamar a ${profile.phone}`}
              >
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: activeBrandPrimary }} />
                <span>{profile.phone}</span>
              </a>
            )}

            {/* Ubicación / Dirección física */}
            {profile?.address && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium text-xs shadow-2xs bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 max-w-full"
                style={{ borderColor: `${activeBrandPrimary}33` }}
                title={profile.address}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: activeBrandPrimary }} />
                <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm">{profile.address}</span>
              </span>
            )}

            {/* Correo Electrónico */}
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium text-xs shadow-2xs transition bg-white/90 hover:bg-white text-stone-800 hover:text-stone-950 dark:bg-stone-900/90 dark:hover:bg-stone-800 dark:text-stone-200 dark:hover:text-white hover:scale-[1.02] active:scale-[0.98] max-w-full shrink-0"
                style={{ borderColor: `${activeBrandPrimary}33` }}
                title={`Enviar correo a ${profile.email}`}
              >
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: activeBrandPrimary }} />
                <span className="truncate max-w-[170px] sm:max-w-xs">{profile.email}</span>
              </a>
            )}

            {/* Redes Sociales Reales Configuradas como Pills Coherentes */}
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium text-xs shadow-2xs transition bg-white/90 hover:bg-white text-stone-800 hover:text-stone-950 dark:bg-stone-900/90 dark:hover:bg-stone-800 dark:text-stone-200 dark:hover:text-white hover:scale-[1.02] active:scale-[0.98] shrink-0"
                  style={{ borderColor: `${activeBrandPrimary}33` }}
                >
                  <span className="shrink-0" style={{ color: activeBrandPrimary }}>
                    {social.icon}
                  </span>
                  <span>{social.label}</span>
                </a>
              ))}
          </motion.div>

          {/* Fila 5: Información o nota de atención si existe */}
          {profile?.attentionInfo && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 pt-1"
            >
              <Info className="w-3.5 h-3.5 shrink-0" style={{ color: activeBrandPrimary }} />
              <span>{profile.attentionInfo}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de Horarios Semanales con animación fluida */}
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
                  <Clock className="w-5 h-5" style={{ color: activeBrandPrimary }} />
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
                  className="w-full py-2.5 rounded-xl text-white text-xs font-semibold transition cursor-pointer shadow-md hover:opacity-95 active:scale-[0.98]"
                  style={{ backgroundColor: activeBrandPrimary }}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
