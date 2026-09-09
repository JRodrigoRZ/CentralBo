import React, { useState } from 'react';
import {
  Store as StoreIcon,
  LogOut,
  LogIn,
  Menu,
  X,
  Smartphone,
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo y Nombre de Marca */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  CentralBo
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block -mt-0.5 font-medium">
                Comercio Digital en Bolivia
              </span>
            </div>
          </button>
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm">
          <button
            onClick={() => handleNavigate('/')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs font-medium ${
              currentPath === '/'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Inicio
          </button>

          <button
            onClick={() => handleNavigate('/tienda/restaurante-roma')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs font-medium ${
              currentPath.startsWith('/tienda')
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tiendas Públicas
          </button>

          {/* Separador sutil entre navegación pública y accesos administrativos */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 select-none" />

          <button
            onClick={() => handleNavigate('/admin')}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer text-xs font-medium ${
              currentPath.startsWith('/admin')
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Área Admin
          </button>

          <button
            onClick={() => handleNavigate('/superadmin')}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer text-xs font-medium ${
              currentPath === '/superadmin'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            SuperAdmin
          </button>
        </nav>

        {/* Estado de Perfil y Acciones */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Selector visible de Tema Claro / Oscuro */}
          <ThemeToggle />

          {/* Botón de instalación PWA en portal global si está disponible */}
          {pwaStatus.isInstallable && currentRoute.type !== 'public_store' && currentRoute.type !== 'store_admin' && (
            <button
              onClick={onInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar PWA</span>
            </button>
          )}

          {/* Estado de Perfil Actual */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block leading-tight truncate max-w-[130px]">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {profile === 'superadmin'
                    ? 'SuperAdmin'
                    : profile === 'store_admin'
                    ? `Admin: ${user.store?.name?.split(' ')[0] || 'Comercio'}`
                    : 'Cliente'}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavigate('/login')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow transition cursor-pointer active:scale-[0.98]"
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
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              title="Instalar App"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-5 space-y-4 shadow-lg">
          {/* Fila de Tema en menú móvil */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Modo de Apariencia</span>
            <ThemeToggle showLabel={true} />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleNavigate('/')}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-left font-medium"
              >
                Inicio
              </button>
              <button
                onClick={() => handleNavigate('/tienda/restaurante-roma')}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-left font-medium"
              >
                Tiendas Públicas
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleNavigate('/admin')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 text-left border border-slate-200 dark:border-slate-800 font-medium"
              >
                Área Admin
              </button>
              <button
                onClick={() => handleNavigate('/superadmin')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 text-left border border-slate-200 dark:border-slate-800 font-medium"
              >
                SuperAdmin
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">{user.email}</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {profile === 'superadmin' ? 'SuperAdmin Global' : 'Admin de Comercio'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-xs font-medium cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('/login')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold text-center cursor-pointer shadow-sm"
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
