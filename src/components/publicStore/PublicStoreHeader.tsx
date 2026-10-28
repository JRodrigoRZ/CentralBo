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
  templateId?: string;
}

export const PublicStoreHeader: React.FC<PublicStoreHeaderProps> = ({
  store,
  profile,
  appearance,
  schedule,
  primaryColor = '#4f46e5',
  templateId,
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

  // Clases atmosféricas según personalidad visual de cada vertical o modelo especial
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
    if (activeTemplate === 'g5') {
      return 'bg-gradient-to-b from-[#FFF8F3] to-[#FFF1E8] dark:from-[#1A120E] dark:to-[#120D0A] text-stone-900 dark:text-stone-100 border-orange-500/30 shadow-md';
    }
    if (activeTemplate === 'g6') {
      return 'bg-[#F9FAF9] dark:bg-[#0E1510] border-emerald-800/20 dark:border-emerald-500/30 text-stone-900 dark:text-stone-100 shadow-sm';
    }
    if (activeTemplate === 'g7') {
      return 'bg-[#FAF5EE] dark:bg-[#1A1614] border-amber-200/80 dark:border-stone-800 text-stone-900 dark:text-stone-100 shadow-sm';
    }
    if (activeTemplate === 'g8') {
      return 'bg-[#0B0C0E] text-white border-amber-500/40 shadow-xl';
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
    activeTemplate === 'g1' || activeTemplate === 'g5' || activeTemplate === 'c1'
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
                activeTemplate === 'g3' || activeTemplate === 'g7' || activeTemplate === 'g8' || activeTemplate === 'm1' || activeTemplate === 'c4'
                  ? 'font-serif font-bold text-stone-900 dark:text-white'
                  : activeTemplate === 'g5' || activeTemplate === 'm3' || activeTemplate === 'b3' || activeTemplate === 's3'
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
