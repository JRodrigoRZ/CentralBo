import React, { useState } from 'react';
import {
  Store as StoreIcon,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Share2,
  ShoppingBag,
  History,
  Check,
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
import { StorePWAInstallButton } from './StorePWAInstallButton';

interface PublicStoreHeaderProps {
  store: StoreModel;
  profile: StoreProfileSettings;
  schedule: StoreScheduleDay[];
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  primaryColor?: string;
}

export const PublicStoreHeader: React.FC<PublicStoreHeaderProps> = ({
  store,
  profile,
  schedule,
  cartCount,
  onOpenCart,
  onOpenOrders,
  primaryColor = '#4f46e5',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const scheduleStatus = calculateScheduleStatus(schedule);

  const handleShareStore = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: store.name,
        text: profile.description || `Visita ${store.name} en CentralBo`,
        url: url,
      }).catch(() => {
        // Fallback al portapapeles
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Limpiar teléfono para wa.me
  const cleanPhone = (profile.whatsapp || profile.phone || '').replace(/\D/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('591') ? cleanPhone : '591' + cleanPhone}` : null;

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
    <header className="w-full rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Barra superior de acciones rápidas */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-mono text-[11px] text-slate-500">
            /{store.slug}
          </span>
          <span className="text-slate-600">•</span>
          <span className="capitalize text-slate-300 font-medium">
            {store.store_type === 'restaurante' ? 'Gastronomía & Restaurante' :
             store.store_type === 'moda' ? 'Moda & Tendencias' :
             store.store_type === 'servicios' ? 'Servicios Profesionales' : 'Comercio General'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Botón PWA específico del comercio */}
          <StorePWAInstallButton
            storeName={profile.name || store.name}
            storeSlug={store.slug}
            tenantId={store.id}
            primaryColor={primaryColor}
          />

          {/* Botón compartir tienda */}
          <button
            onClick={handleShareStore}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer text-xs"
            title="Compartir enlace de la tienda"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Compartir</span>
              </>
            )}
          </button>

          {/* Botón mis pedidos / reservas */}
          <button
            onClick={onOpenOrders}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer text-xs"
            title="Ver mis pedidos o citas anteriores"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Mis Pedidos</span>
          </button>

          {/* Botón flotante/visible de carrito */}
          <button
            onClick={onOpenCart}
            id="public-store-cart-trigger"
            style={{ backgroundColor: cartCount > 0 ? primaryColor : undefined }}
            className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-semibold transition cursor-pointer text-xs ${
              cartCount > 0 ? 'shadow-lg shadow-indigo-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Ver carrito de compras"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-semibold">Carrito</span>
            {cartCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-slate-900 font-bold text-[10px]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenido principal de la cabecera */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
          {/* Logo del comercio */}
          <div className="relative shrink-0">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={store.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-700/80 shadow-md bg-slate-900"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile.name || store.name}
              </h1>

              {/* Indicador en vivo de horario */}
              <button
                onClick={() => setShowScheduleModal(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  scheduleStatus.isOpenNow
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
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
            </div>

            {/* Descripción */}
            {profile.description && (
              <p className="text-sm text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                {profile.description}
              </p>
            )}

            {/* Fila de contacto: Dirección, Teléfono, WhatsApp, Email */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-400">
              {profile.address && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate max-w-[260px] sm:max-w-none">{profile.address}</span>
                </div>
              )}

              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{profile.phone}</span>
                </a>
              )}

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp Atención</span>
                </a>
              )}

              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{profile.email}</span>
                </a>
              )}
            </div>

            {/* Información de atención y redes sociales */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              {profile.attentionInfo ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-pink-600/20 text-slate-400 hover:text-pink-400 transition"
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
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 transition"
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
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-600/20 text-slate-400 hover:text-cyan-400 transition"
                    title="TikTok"
                  >
                    <Video className="w-4 h-4" />
                  </a>
                )}
                {profile.socials?.youtube && (
                  <a
                    href={profile.socials.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Horarios Semanales */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>Horarios de Atención Semanales</span>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {schedule.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-950/60 text-xs"
                >
                  <span className="font-semibold text-slate-200 w-24">
                    {day.dayName}
                  </span>
                  {day.isOpen ? (
                    <div className="text-slate-300 font-mono text-[11px] text-right space-y-0.5">
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
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
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
