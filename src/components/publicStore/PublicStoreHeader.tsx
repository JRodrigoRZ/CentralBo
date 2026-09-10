import React, { useState } from 'react';
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
} from 'lucide-react';
import { Store as StoreModel, StoreProfileSettings, StoreScheduleDay } from '../../types';
import { calculateScheduleStatus } from '../../lib/storeAdminService';

interface PublicStoreHeaderProps {
  store: StoreModel;
  profile: StoreProfileSettings;
  schedule: StoreScheduleDay[];
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenOrders?: () => void;
  primaryColor?: string;
}

export const PublicStoreHeader: React.FC<PublicStoreHeaderProps> = ({
  store,
  profile,
  schedule,
  primaryColor = '#4f46e5',
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const scheduleStatus = calculateScheduleStatus(schedule);

  // Limpiar teléfono para wa.me
  const cleanPhone = (profile.whatsapp || profile.phone || '').replace(/\D/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('591') ? cleanPhone : '591' + cleanPhone}` : null;

  const isRestaurant = store.store_type === 'restaurante' || store.slug === 'restaurante-roma';
  const isFashion = store.store_type === 'moda' || store.slug === 'boutique-milano';
  const isServices = store.store_type === 'servicios' || store.slug === 'spa-zenit';
  const isRetail =
    store.store_type === 'retail' ||
    store.store_type === 'supermercado' ||
    store.slug === 'los-andes-express' ||
    store.slug?.includes('andes');

  const getVerticalIcon = () => {
    switch (store.store_type) {
      case 'restaurante':
        return Utensils;
      case 'moda':
        return Shirt;
      case 'servicios':
        return Briefcase;
      default:
        return Store;
    }
  };

  const VerticalIcon = getVerticalIcon();

  return (
    <header
      className={
        isFashion
          ? 'w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 shadow-sm bg-gradient-to-br from-[#F7F4EE] via-[#F2EDE4] to-[#E8E1D5] text-stone-900 border border-stone-200/80 dark:from-[#1C1A19] dark:via-[#161514] dark:to-[#121111] dark:text-stone-100 dark:border-stone-800'
          : isServices
          ? 'w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 shadow-sm bg-gradient-to-br from-[#F3F7F3] via-[#ECF3EC] to-[#DEEADE] text-stone-900 border border-emerald-900/10 dark:from-[#0E1511] dark:via-[#121B15] dark:to-[#0A100D] dark:text-stone-100 dark:border-emerald-500/15'
          : isRetail
          ? 'w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 shadow-sm bg-gradient-to-br from-[#EEF4FB] via-[#E5EFF8] to-[#D8E6F3] text-slate-900 border border-blue-900/10 dark:from-[#0B132B] dark:via-[#0F172A] dark:to-[#080D1A] dark:text-slate-100 dark:border-blue-500/15'
          : isRestaurant
          ? 'w-full rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 dark:from-[#1A1816] dark:via-[#161412] dark:to-[#221B14] border border-stone-800/40 dark:border-amber-500/15 text-white shadow-lg relative overflow-hidden'
          : 'w-full rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md'
      }
    >
      {/* Halos decorativos luminosos para supermercado / retail */}
      {isRetail && (
        <>
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-300/25 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-sky-200/25 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Halos decorativos sutiles para spa / bienestar */}
      {isServices && (
        <>
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-emerald-300/25 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-200/25 dark:bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Halos decorativos sutiles para moda */}
      {isFashion && (
        <>
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-rose-200/40 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-100/40 dark:bg-stone-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Halos decorativos cálidos para gastronomía */}
      {isRestaurant && (
        <>
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Contenido principal de la cabecera */}
      <div className={isFashion || isServices || isRetail ? "relative z-10" : "p-4 sm:p-6 lg:p-8 relative z-10"}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
          {/* Logo o Isotipo del comercio */}
          <div className="relative shrink-0">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={store.name}
                className={
                  isFashion
                    ? 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-rose-200/80 dark:border-rose-900/50 shadow-sm bg-white/80 dark:bg-stone-900'
                    : isServices
                    ? 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-emerald-200/80 dark:border-emerald-800/40 shadow-sm bg-white/80 dark:bg-stone-900'
                    : isRetail
                    ? 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-blue-200/80 dark:border-blue-800/40 shadow-sm bg-white/80 dark:bg-slate-900'
                    : isRestaurant
                    ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-amber-500/30 shadow-md bg-stone-900'
                    : 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-700/80 shadow-md bg-slate-900'
                }
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : isRetail ? (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-colors bg-blue-100/90 text-blue-800 border border-blue-200/80 shadow-sm dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40">
                <svg className="w-7 h-7 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            ) : isServices ? (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                <Briefcase className="w-7 h-7" />
              </div>
            ) : isFashion ? (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-colors bg-rose-100/90 text-rose-800 border border-rose-200/80 shadow-sm dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
                <Shirt className="w-7 h-7" />
              </div>
            ) : isRestaurant ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 flex items-center justify-center shadow-md">
                <Utensils className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            ) : (
              <div
                style={{ borderColor: primaryColor }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 flex items-center justify-center text-indigo-400 shadow-md"
              >
                <VerticalIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            )}
          </div>

          {/* Datos del comercio */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className={`text-2xl sm:text-3xl tracking-tight ${
                isFashion || isServices
                  ? 'font-serif font-bold text-stone-900 dark:text-stone-100'
                  : isRetail
                  ? 'font-black text-slate-900 dark:text-slate-100'
                  : 'font-black text-white'
              }`}>
                {profile.name || store.name}
              </h1>

              {/* Indicador en vivo de horario */}
              {isRetail ? (
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="inline-flex items-center gap-1.5 bg-white/80 hover:bg-white text-slate-900 border border-blue-200/90 text-xs px-3 py-1 rounded-full font-medium transition cursor-pointer shadow-xs dark:bg-[#0F172A]/80 dark:hover:bg-[#0F172A] dark:text-blue-200 dark:border-blue-700/60"
                  title="Ver horarios de atención de Los Andes Express"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      scheduleStatus.isOpenNow ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse' : 'bg-amber-500 dark:bg-amber-400'
                    }`}
                  />
                  <span>{scheduleStatus.statusLabel}</span>
                  <span className="text-[11px] opacity-80 hidden md:inline">
                    • {scheduleStatus.nextOpeningInfo}
                  </span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              ) : isServices ? (
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="inline-flex items-center gap-1.5 bg-white/80 hover:bg-white text-emerald-950 border border-emerald-300/80 text-xs px-3 py-1 rounded-full font-medium transition cursor-pointer shadow-xs dark:bg-[#121A15]/80 dark:hover:bg-[#121A15] dark:text-emerald-300 dark:border-emerald-700/60"
                  title="Ver horarios y turnos de atención de Spa Zenit"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      scheduleStatus.isOpenNow ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse' : 'bg-amber-500 dark:bg-amber-400'
                    }`}
                  />
                  <span>{scheduleStatus.statusLabel}</span>
                  <span className="text-[11px] opacity-80 hidden md:inline">
                    • {scheduleStatus.nextOpeningInfo}
                  </span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              ) : isFashion ? (
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="inline-flex items-center gap-1.5 bg-white/80 hover:bg-white text-stone-800 border border-stone-300/80 text-xs px-3 py-1 rounded-full font-medium transition cursor-pointer shadow-xs dark:bg-stone-900/80 dark:hover:bg-stone-900 dark:text-stone-200 dark:border-stone-700/60"
                  title="Ver horarios de atención de la boutique"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      scheduleStatus.isOpenNow ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse' : 'bg-rose-500 dark:bg-rose-400'
                    }`}
                  />
                  <span>{scheduleStatus.statusLabel}</span>
                  <span className="text-[11px] opacity-80 hidden md:inline">
                    • {scheduleStatus.nextOpeningInfo}
                  </span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              ) : (
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    scheduleStatus.isOpenNow
                      ? isRestaurant
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : isRestaurant
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                  title="Ver horarios completos de atención"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      scheduleStatus.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{scheduleStatus.statusLabel}</span>
                  <span className="text-[11px] opacity-80 hidden md:inline">
                    • {scheduleStatus.nextOpeningInfo}
                  </span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              )}
            </div>

            {/* Descripción */}
            {profile.description && (
              <p className={
                isFashion || isServices
                  ? 'text-sm text-stone-700 dark:text-stone-300 line-clamp-2 max-w-3xl leading-relaxed'
                  : isRetail
                  ? 'text-sm text-slate-700 dark:text-slate-300 line-clamp-2 max-w-3xl leading-relaxed'
                  : isRestaurant
                  ? 'text-sm text-stone-300 line-clamp-2 max-w-3xl leading-relaxed'
                  : 'text-sm text-slate-300 line-clamp-2 max-w-3xl leading-relaxed'
              }>
                {profile.description}
              </p>
            )}

            {/* Fila de contacto: Dirección, Teléfono, WhatsApp, Email */}
            <div className={
              isFashion || isServices
                ? 'flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-stone-700 dark:text-stone-300'
                : isRetail
                ? 'flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-700 dark:text-slate-300'
                : isRestaurant
                ? 'flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-stone-300'
                : 'flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-400'
            }>
              {profile.address && (
                <div className={`flex items-center gap-1.5 ${isFashion || isServices ? 'text-stone-800 dark:text-stone-200' : isRetail ? 'text-slate-800 dark:text-slate-200' : 'text-stone-200'}`}>
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${isServices ? 'text-emerald-700 dark:text-emerald-400' : isFashion ? 'text-rose-700 dark:text-rose-300' : isRetail ? 'text-blue-600 dark:text-blue-400' : isRestaurant ? 'text-amber-400' : 'text-rose-400'}`} />
                  <span className="truncate max-w-[260px] sm:max-w-none">{profile.address}</span>
                </div>
              )}

              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className={`flex items-center gap-1.5 transition ${
                    isFashion || isServices
                      ? 'text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white'
                      : isRetail
                      ? 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                      : 'hover:text-white'
                  }`}
                >
                  <Phone className={`w-3.5 h-3.5 shrink-0 ${isServices ? 'text-emerald-700 dark:text-emerald-400' : isFashion ? 'text-stone-500 dark:text-stone-400' : isRetail ? 'text-blue-600 dark:text-blue-400' : isRestaurant ? 'text-stone-400' : 'text-cyan-400'}`} />
                  <span>{profile.phone}</span>
                </a>
              )}

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    isRetail
                      ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 text-blue-900 hover:bg-blue-200 border border-blue-200/90 font-semibold transition text-xs shadow-xs dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-950/60 dark:border-blue-800/50'
                      : isServices
                      ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 hover:bg-emerald-200 border border-emerald-200/90 font-semibold transition text-xs shadow-xs dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/60 dark:border-emerald-800/50'
                      : isFashion
                      ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 text-rose-900 hover:bg-rose-200 border border-rose-200/90 font-semibold transition text-xs shadow-xs dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60 dark:border-rose-900/50'
                      : isRestaurant
                      ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-semibold transition'
                      : 'inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition'
                  }
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp Atención</span>
                </a>
              )}

              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className={`flex items-center gap-1.5 transition ${
                    isFashion || isServices
                      ? 'text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white'
                      : isRetail
                      ? 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                      : 'hover:text-white'
                  }`}
                >
                  <Mail className={`w-3.5 h-3.5 shrink-0 ${isServices ? 'text-emerald-700 dark:text-emerald-400' : isFashion ? 'text-stone-500 dark:text-stone-400' : isRetail ? 'text-blue-600 dark:text-blue-400' : isRestaurant ? 'text-stone-400' : 'text-indigo-400'}`} />
                  <span>{profile.email}</span>
                </a>
              )}
            </div>

            {/* Información de atención y redes sociales */}
            {isRetail ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-5 border-t border-blue-900/10 dark:border-blue-500/15">
                {/* Texto de Horario / Atención */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500 text-sm">ℹ️</span>
                  <span>{profile.attentionInfo || 'Atención presencial y pedidos online de Lunes a Sábado.'}</span>
                </div>

                {/* Grupo de Redes Sociales Alineado */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {[
                    {
                      icon: <Instagram className="w-4 h-4" />,
                      label: 'Instagram',
                      url: profile.socials?.instagram
                        ? (profile.socials.instagram.startsWith('http')
                            ? profile.socials.instagram
                            : `https://instagram.com/${profile.socials.instagram.replace('@', '')}`)
                        : '#',
                    },
                    {
                      icon: <Facebook className="w-4 h-4" />,
                      label: 'Facebook',
                      url: profile.socials?.facebook
                        ? (profile.socials.facebook.startsWith('http')
                            ? profile.socials.facebook
                            : `https://facebook.com/${profile.socials.facebook}`)
                        : '#',
                    },
                    {
                      icon: <Video className="w-4 h-4" />,
                      label: 'TikTok',
                      url: profile.socials?.tiktok
                        ? (profile.socials.tiktok.startsWith('http')
                            ? profile.socials.tiktok
                            : `https://tiktok.com/@${profile.socials.tiktok.replace('@', '')}`)
                        : '#',
                    },
                    {
                      icon: <Youtube className="w-4 h-4" />,
                      label: 'YouTube',
                      url: profile.socials?.youtube
                        ? (profile.socials.youtube.startsWith('http')
                            ? profile.socials.youtube
                            : `https://youtube.com/${profile.socials.youtube}`)
                        : '#',
                    },
                  ].map((red, idx) => (
                    <a
                      key={idx}
                      href={red.url}
                      target={red.url !== '#' ? '_blank' : undefined}
                      rel={red.url !== '#' ? 'noopener noreferrer' : undefined}
                      aria-label={red.label}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                                 bg-white/80 hover:bg-white text-slate-600 hover:text-blue-600 border border-blue-200/80 shadow-xs hover:shadow-sm
                                 dark:bg-slate-800/70 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-blue-400 dark:border-slate-700/80"
                    >
                      {/* Renderizado de icono SVG asegurando tamaño proporcional */}
                      <span className="w-4 h-4 flex items-center justify-center">
                        {red.icon}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className={
                isFashion || isServices
                  ? 'flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-300/70 dark:border-stone-800'
                  : isRestaurant
                  ? 'flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10'
                  : 'flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80'
              }>
                {profile.attentionInfo ? (
                  <div className={`flex items-center gap-1.5 text-xs ${isFashion || isServices ? 'text-stone-700 dark:text-stone-300' : 'text-stone-300'}`}>
                    <Info className={`w-3.5 h-3.5 shrink-0 ${isServices ? 'text-emerald-700 dark:text-emerald-400' : isFashion ? 'text-rose-700 dark:text-rose-300' : 'text-amber-400'}`} />
                    <span>{profile.attentionInfo}</span>
                  </div>
                ) : <div />}

                {/* Redes sociales disponibles */}
                <div className="flex items-center gap-2">
                  {profile.socials?.instagram && (
                    <a
                      href={profile.socials.instagram.startsWith('http') ? profile.socials.instagram : `https://instagram.com/${profile.socials.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        isFashion
                          ? 'p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-rose-700 border border-stone-300/80 shadow-xs dark:bg-stone-900/80 dark:hover:bg-stone-900 dark:text-stone-300 dark:hover:text-rose-300 dark:border-stone-700/60 transition'
                          : isServices
                          ? 'p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-emerald-700 border border-emerald-300/80 shadow-xs dark:bg-[#121A15]/80 dark:hover:bg-[#121A15] dark:text-stone-300 dark:hover:text-emerald-300 dark:border-emerald-700/60 transition'
                          : isRestaurant
                          ? 'p-2 rounded-full bg-white/10 hover:bg-amber-600/30 text-stone-300 hover:text-amber-300 border border-white/10 transition'
                          : 'p-1.5 rounded-lg bg-slate-800/80 hover:bg-pink-600/20 text-slate-400 hover:text-pink-400 transition'
                      }
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socials?.facebook && (
                    <a
                      href={profile.socials.facebook.startsWith('http') ? profile.socials.facebook : `https://facebook.com/${profile.socials.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        isFashion
                          ? 'p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-rose-700 border border-stone-300/80 shadow-xs dark:bg-stone-900/80 dark:hover:bg-stone-900 dark:text-stone-300 dark:hover:text-rose-300 dark:border-stone-700/60 transition'
                          : isServices
                          ? 'p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-emerald-700 border border-emerald-300/80 shadow-xs dark:bg-[#121A15]/80 dark:hover:bg-[#121A15] dark:text-stone-300 dark:hover:text-emerald-300 dark:border-emerald-700/60 transition'
                          : isRestaurant
                          ? 'p-2 rounded-full bg-white/10 hover:bg-amber-600/30 text-stone-300 hover:text-amber-300 border border-white/10 transition'
                          : 'p-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 transition'
                      }
                      title="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socials?.tiktok && (
                    <a
                      href={profile.socials.tiktok.startsWith('http') ? profile.socials.tiktok : `https://tiktok.com/@${profile.socials.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        isFashion
                          ? 'p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-rose-700 border border-stone-300/80 shadow-xs dark:bg-stone-900/80 dark:hover:bg-stone-900 dark:text-stone-300 dark:hover:text-rose-300 dark:border-stone-700/60 transition'
                          : isServices
                          ? 'p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-emerald-700 border border-emerald-300/80 shadow-xs dark:bg-[#121A15]/80 dark:hover:bg-[#121A15] dark:text-stone-300 dark:hover:text-emerald-300 dark:border-emerald-700/60 transition'
                          : isRestaurant
                          ? 'p-2 rounded-full bg-white/10 hover:bg-amber-600/30 text-stone-300 hover:text-amber-300 border border-white/10 transition'
                          : 'p-1.5 rounded-lg bg-slate-800/80 hover:bg-stone-700 text-slate-400 hover:text-white transition'
                      }
                      title="TikTok"
                    >
                      <Video className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socials?.youtube && (
                    <a
                      href={profile.socials.youtube.startsWith('http') ? profile.socials.youtube : `https://youtube.com/${profile.socials.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        isFashion
                          ? 'p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-rose-700 border border-stone-300/80 shadow-xs dark:bg-stone-900/80 dark:hover:bg-stone-900 dark:text-stone-300 dark:hover:text-rose-300 dark:border-stone-700/60 transition'
                          : isRestaurant
                          ? 'p-2 rounded-full bg-white/10 hover:bg-amber-600/30 text-stone-300 hover:text-amber-300 border border-white/10 transition'
                          : 'p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition'
                      }
                      title="YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Horarios Semanales */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
            isFashion || isRestaurant ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isFashion || isRestaurant ? 'border-stone-800' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Clock className={`w-5 h-5 ${isFashion ? 'text-rose-400' : isRestaurant ? 'text-amber-400' : 'text-indigo-400'}`} />
                <span>Horarios de Atención Semanales</span>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-stone-400 hover:text-white text-sm font-semibold p-1 rounded-lg hover:bg-stone-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {schedule.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs ${
                    isRestaurant ? 'bg-stone-950/60' : 'bg-slate-950/60'
                  }`}
                >
                  <span className="font-semibold text-stone-200 w-24">
                    {day.dayName}
                  </span>
                  {day.isOpen ? (
                    <div className="text-stone-300 font-mono text-[11px] text-right space-y-0.5">
                      {day.periods.map((p, idx) => (
                        <div key={idx}>
                          {p.open} - {p.close}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-rose-400 font-semibold text-[11px]">
                      Cerrado
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowScheduleModal(false)}
                className={`w-full py-2 rounded-xl text-white text-xs font-semibold transition cursor-pointer ${
                  isRestaurant ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
