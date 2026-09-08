import React, { useState } from 'react';
import {
  Store as StoreIcon,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  ExternalLink,
  Smartphone,
  Wifi,
  WifiOff,
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
  const { currentPath, currentRoute, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo y Nombre de Marca */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  CentralBo
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  MÓDULO 3
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                SuperAdmin Global & Multi-Tenant PWA
              </span>
            </div>
          </button>
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-1 text-xs">
          <button
            onClick={() => handleNavigate('/')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              currentPath === '/'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Inicio
          </button>

          <button
            onClick={() => handleNavigate('/tienda/restaurante-roma')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              currentPath.startsWith('/tienda')
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Tiendas Públicas
          </button>

          <button
            onClick={() => handleNavigate('/admin')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              currentPath.startsWith('/admin')
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Área Admin
          </button>

          <button
            onClick={() => handleNavigate('/superadmin')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              currentPath === '/superadmin'
                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            SuperAdmin
          </button>
        </nav>

        {/* Estado de Perfil y Acciones */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Selector visible de Tema Claro / Oscuro */}
          <ThemeToggle />

          {/* Indicador de conexión PWA */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 px-2 py-1 rounded-md bg-slate-900 border border-slate-800">
            {pwaStatus.isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="hidden lg:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400">Offline</span>
              </>
            )}
          </div>

          {/* Botón de instalación PWA en portal global si está disponible */}
          {pwaStatus.isInstallable && currentRoute.type !== 'public_store' && currentRoute.type !== 'store_admin' && (
            <button
              onClick={onInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar PWA</span>
            </button>
          )}

          {/* Estado de Perfil Actual */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right">
                <span className="text-xs font-semibold text-white block leading-tight truncate max-w-[130px]">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-indigo-400 font-medium">
                  {profile === 'superadmin'
                    ? 'SuperAdmin'
                    : profile === 'store_admin'
                    ? `Admin: ${user.store?.name?.split(' ')[0] || 'Comercio'}`
                    : 'Cliente'}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavigate('/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>

        {/* Botón Menú Móvil */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Selector de Tema en Móvil */}
          <ThemeToggle showLabel={false} />

          {pwaStatus.isInstallable && (
            <button
              onClick={onInstallClick}
              className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
              title="Instalar App"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          {/* Fila de Tema en menú móvil */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-slate-300">Modo de Apariencia</span>
            <ThemeToggle showLabel={true} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleNavigate('/')}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-left"
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavigate('/tienda/restaurante-roma')}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-left"
            >
              Tiendas Públicas
            </button>
            <button
              onClick={() => handleNavigate('/admin')}
              className="p-2.5 rounded-xl bg-cyan-950/40 text-cyan-300 text-left border border-cyan-800/40"
            >
              Área Admin
            </button>
            <button
              onClick={() => handleNavigate('/superadmin')}
              className="p-2.5 rounded-xl bg-indigo-950/40 text-indigo-300 text-left border border-indigo-800/40"
            >
              SuperAdmin
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="text-xs font-semibold text-white block">{user.email}</span>
                  <span className="text-[10px] text-indigo-400">
                    {profile === 'superadmin' ? 'SuperAdmin Global' : 'Admin de Comercio'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-rose-400 text-xs font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('/login')}
                className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold text-center"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
