import React, { useState } from 'react';
import {
  Store as StoreIcon,
  LogOut,
  LogIn,
  Menu,
  X,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { PWAStatus } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  pwaStatus: PWAStatus;
  onInstallClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ pwaStatus, onInstallClick }) => {
  const { user, profile, signOut } = useAuth();
  const { currentRoute, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = currentRoute.type === 'home';

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    } else {
      navigate('/');
    }
  };

  const handleGoStores = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (isHome) {
      const section =
        document.getElementById('carrusel-comercios') ||
        document.getElementById('descubre-tiendas');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', '#carrusel-comercios');
      }
    } else {
      navigate('/#carrusel-comercios');
    }
  };

  const handleGoFaq = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (isHome) {
      const section = document.getElementById('faq');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', '#faq');
      }
    } else {
      navigate('/#faq');
    }
  };

  const handleCreateStoreClick = (e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    // Enlace preparado para la pantalla/sección de contacto de la siguiente etapa
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      e.preventDefault();
      contactSection.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', '#contacto');
    } else if (!isHome) {
      navigate('/#contacto');
    } else {
      // Si aún no existe la sección #contacto, dejamos preparado el enlace sin inventar otro flujo
      window.location.hash = 'contacto';
    }
  };

  const handleMerchantAccess = () => {
    setMobileMenuOpen(false);
    if (user) {
      if (profile === 'superadmin') {
        navigate('/superadmin');
      } else if (profile === 'store_admin' && user.tenantId) {
        navigate(`/admin/${user.tenantId}`);
      } else if (user.tenantId) {
        navigate(`/admin/${user.tenantId}`);
      } else {
        navigate('/admin');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-[#1a2744] bg-white/95 dark:bg-[#080d1a]/95 backdrop-blur-md transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Marca / Identidad de la Plataforma */}
        <div className="flex items-center gap-6 lg:gap-8 shrink-0">
          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            aria-label="CentralBo - Ir al inicio"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  CentralBo
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none font-medium hidden sm:block">
                Comercio Digital en Bolivia
              </span>
            </div>
          </button>

          {/* Navegación Pública Principal (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={handleGoHome}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                isHome
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121d36]'
              }`}
            >
              Inicio
            </button>

            <button
              type="button"
              onClick={handleGoStores}
              className="px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121d36]"
            >
              Explorar tiendas
            </button>

            <button
              type="button"
              onClick={handleGoFaq}
              className="px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121d36]"
            >
              FAQ
            </button>
          </nav>
        </div>

        {/* Acciones del Header (Desktop): Crear mi tienda + Acceso para comercios + Selector de tema */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3">
          {/* Botón PWA si está disponible */}
          {pwaStatus.isInstallable && (
            <button
              type="button"
              onClick={onInstallClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121d36] border border-slate-200/70 dark:border-[#1c2a47] transition-colors cursor-pointer"
              title="Instalar aplicación CentralBo"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Instalar</span>
            </button>
          )}

          {/* CTA Principal: Crear mi tienda (Alta Jerarquía Visual) */}
          <a
            href="#contacto"
            onClick={handleCreateStoreClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-xs hover:shadow transition-all cursor-pointer select-none shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Crear mi tienda</span>
          </a>

          {/* CTA Secundario: Acceso para comercios (Jerarquía Secundaria) */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                type="button"
                onClick={handleMerchantAccess}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0e172d] dark:hover:bg-[#14213d] border border-slate-200/80 dark:border-[#1d2d4e] transition-colors cursor-pointer"
                title="Panel de administración comercial"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="truncate max-w-[120px]">
                  {profile === 'superadmin' ? 'SuperAdmin' : 'Panel Comercio'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-[#14213d] border border-transparent hover:border-slate-200 dark:hover:border-[#1d2d4e] transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMerchantAccess}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0e172d] border border-slate-200/80 dark:border-[#1c2a47] transition-colors cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
              <span>Acceso para comercios</span>
            </button>
          )}

          {/* Separador vertical sutil */}
          <div className="h-4 w-px bg-slate-200 dark:bg-[#1c2a47] mx-0.5 select-none" />

          {/* Selector de tema discreto */}
          <ThemeToggle />
        </div>

        {/* Controles en Pantallas Móviles */}
        <div className="flex sm:hidden items-center gap-1.5">
          {/* Selector de tema en móvil (discreto) */}
          <ThemeToggle />

          {/* Botón de Menú Hamburguesa */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0e172d] border border-slate-200/80 dark:border-[#1c2a47] transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 dark:border-[#1c2a47] bg-white dark:bg-[#0b1224] px-4 pt-3 pb-5 space-y-4 shadow-lg">
          {/* Enlaces de Navegación Pública */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleGoHome}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                isHome
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0e172d]'
              }`}
            >
              <span>Inicio</span>
            </button>

            <button
              type="button"
              onClick={handleGoStores}
              className="w-full p-2.5 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0e172d] transition-colors"
            >
              <span>Explorar tiendas</span>
            </button>

            <button
              type="button"
              onClick={handleGoFaq}
              className="w-full p-2.5 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0e172d] transition-colors"
            >
              <span>FAQ</span>
            </button>
          </div>

          {/* Bloque de Acciones: Crear mi tienda + Acceso para comercios */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#1c2a47] space-y-2">
            {/* CTA Principal en Móvil */}
            <a
              href="#contacto"
              onClick={handleCreateStoreClick}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Crear mi tienda</span>
            </a>

            {/* CTA Secundario en Móvil */}
            {user ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0e172d] border border-slate-200/80 dark:border-[#1c2a47]">
                <button
                  type="button"
                  onClick={handleMerchantAccess}
                  className="text-left text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{profile === 'superadmin' ? 'SuperAdmin' : 'Panel de Comercio'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleMerchantAccess}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#1c2a47] text-slate-700 dark:text-slate-300 text-xs font-medium text-center flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#0e172d] transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Acceso para comercios</span>
              </button>
            )}

            {/* PWA en menú móvil si aplica */}
            {pwaStatus.isInstallable && (
              <button
                type="button"
                onClick={() => {
                  onInstallClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-[#0e172d] transition cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Instalar aplicación</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
