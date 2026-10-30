import React, { useEffect, useState } from 'react';
import {
  Store as StoreIcon,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  ExternalLink,
  Home,
  Palette,
  ShoppingBag,
  Tag,
  TrendingUp,
  Clock,
  Truck,
  CalendarClock,
  Share2,
  CreditCard,
  Package,
  Layers,
  Sparkles,
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
  Key,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { Store, StoreAdminTab } from '../types';
import { resolveStoreById } from '../lib/multiTenantService';
import { getStorePlan } from '../lib/storeAdminService';

// Subcomponentes del Panel Admin de Tienda (Módulo 4)
import { ChangePasswordModal } from './storeadmin/ChangePasswordModal';
import { InicioResumen } from './storeadmin/InicioResumen';
import { MiTiendaPerfil } from './storeadmin/MiTiendaPerfil';
import { MiTiendaApariencia } from './storeadmin/MiTiendaApariencia';
import { MiTiendaHorarios } from './storeadmin/MiTiendaHorarios';
import { MiTiendaEnvios } from './storeadmin/MiTiendaEnvios';
import { MiTiendaProgramados } from './storeadmin/MiTiendaProgramados';
import { MiTiendaPagos } from './storeadmin/MiTiendaPagos';
import { useAdminPWA } from '../lib/pwaTenantService';
import { StoreAdminPWAInstallButton } from './storeadmin/StoreAdminPWAInstallButton';
import { MiTiendaContacto } from './storeadmin/MiTiendaContacto';
import { CatalogoProductos } from './storeadmin/CatalogoProductos';
import { MaxiNegoLogo } from './common/MaxiNegoLogo';
import { CatalogoCategorias } from './storeadmin/CatalogoCategorias';
import { CatalogoConfigEspecifica } from './storeadmin/CatalogoConfigEspecifica';
import { StoreAdminPedidos } from './storeadmin/StoreAdminPedidos';
import { StoreAdminPromociones } from './storeadmin/StoreAdminPromociones';
import { StoreAdminEstadisticas } from './storeadmin/StoreAdminEstadisticas';
import { ThemeToggle } from './ThemeToggle';

interface StoreAdminAreaProps {
  tenantId?: string;
  initialStore?: Store;
  onBack?: () => void;
}

export const StoreAdminArea: React.FC<StoreAdminAreaProps> = ({
  tenantId,
  initialStore,
  onBack,
}) => {
  const { user, signOut, isLoading } = useAuth();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<StoreAdminTab>('inicio_resumen');
  const [store, setStore] = useState<Store | null>(initialStore || user?.store || null);
  const [loading, setLoading] = useState<boolean>(!initialStore && !user?.store);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);

  // Para store_admin, se fuerza estrictamente su propio tenantId autorizado; sólo superadmin puede alternar tenantId arbitrario
  const activeTenantId =
    user?.profile === 'superadmin' ? (tenantId || user?.tenantId) : user?.tenantId;

  useEffect(() => {
    let cancelled = false;
    if (activeTenantId) {
      if (!store || store.id !== activeTenantId) {
        setLoading(true);
        setStore(initialStore && initialStore.id === activeTenantId ? initialStore : null);
      }
      resolveStoreById(activeTenantId)
        .then((s) => {
          if (!cancelled && s) setStore(s);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      setStore(null);
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [activeTenantId]);

  // Inyección reactiva del manifiesto PWA específico para la administración de este comercio
  useAdminPWA(
    store
      ? {
          tenantId: store.id,
          storeName: store.name,
          description: store.description,
        }
      : null
  );

  // Si la sesión aún está cargando o resolviendo el perfil, mostrar estado de carga limpio
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">
          Verificando credenciales de acceso al comercio...
        </p>
      </div>
    );
  }

  // Guardia de Seguridad Interna Multi-Tenant
  const isAuthorized =
    user &&
    (user.profile === 'superadmin' ||
      ((user.profile === 'store_admin' || !!user.tenantId) && (!tenantId || user.tenantId === tenantId)));

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Acceso Restringido
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          No tienes permisos para acceder a la administración de este comercio. Por favor verifica tus credenciales de acceso o regresa a la página principal.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar a MAXINEGO</span>
        </button>
      </div>
    );
  }

  if (!activeTenantId && user?.profile === 'superadmin') {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm my-10">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
          <StoreIcon className="w-8 h-8" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          Seleccionar Tienda a Administrar
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Como SuperAdmin Global, puedes administrar cualquier comercio existente accediendo desde la sección de <strong>Gestión de Tiendas</strong>.
        </p>
        <button
          onClick={() => navigate('/superadmin')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ir a Gestión de Tiendas</span>
        </button>
      </div>
    );
  }

  if (loading || !store) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cargando administración del comercio...</p>
      </div>
    );
  }

  const currentStore = store;
  const planInfo = getStorePlan(currentStore.id);

  // Navegación jerárquica con grupos
  const isMiTiendaGroup = activeTab.startsWith('tienda_');
  const isCatalogoGroup = activeTab.startsWith('catalogo_');

  // Definición canónica de las opciones del menú
  const navMenuItems = [
    {
      id: 'inicio_resumen' as StoreAdminTab,
      label: 'Inicio',
      icon: Home,
      isActive: activeTab === 'inicio_resumen',
      onClick: () => {
        setActiveTab('inicio_resumen');
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'tienda_perfil' as StoreAdminTab,
      label: 'Mi Tienda',
      icon: StoreIcon,
      isActive: isMiTiendaGroup,
      onClick: () => {
        if (!isMiTiendaGroup) setActiveTab('tienda_perfil');
        setMobileMenuOpen(false);
      },
      subItems: [
        { id: 'tienda_perfil' as StoreAdminTab, label: 'Perfil', icon: null },
        { id: 'tienda_apariencia' as StoreAdminTab, label: 'Apariencia', icon: Palette },
        { id: 'tienda_horarios' as StoreAdminTab, label: 'Horarios', icon: Clock },
        { id: 'tienda_envios' as StoreAdminTab, label: 'Envíos', icon: Truck },
        { id: 'tienda_programados' as StoreAdminTab, label: 'Pedidos Programados', icon: CalendarClock },
        { id: 'tienda_pagos' as StoreAdminTab, label: 'Métodos de Pago', icon: CreditCard },
        { id: 'tienda_contacto' as StoreAdminTab, label: 'Contacto y Redes', icon: Share2 },
      ],
    },
    {
      id: 'catalogo_productos' as StoreAdminTab,
      label: 'Catálogo',
      icon: Package,
      isActive: isCatalogoGroup,
      onClick: () => {
        if (!isCatalogoGroup) setActiveTab('catalogo_productos');
        setMobileMenuOpen(false);
      },
      subItems: [
        { id: 'catalogo_productos' as StoreAdminTab, label: 'Productos', icon: Package },
        { id: 'catalogo_categorias' as StoreAdminTab, label: 'Categorías', icon: Layers },
        {
          id: 'catalogo_config_especifica' as StoreAdminTab,
          label: currentStore.store_type === 'servicios' ? 'Citas y Profesionales' : `Configuración (${currentStore.store_type})`,
          icon: Sparkles,
        },
      ],
    },
    {
      id: 'pedidos' as StoreAdminTab,
      label: 'Pedidos',
      icon: ShoppingBag,
      isActive: activeTab === 'pedidos',
      onClick: () => {
        setActiveTab('pedidos');
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'promociones' as StoreAdminTab,
      label: 'Promociones',
      icon: Tag,
      isActive: activeTab === 'promociones',
      onClick: () => {
        setActiveTab('promociones');
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'estadisticas' as StoreAdminTab,
      label: 'Estadísticas',
      icon: TrendingUp,
      isActive: activeTab === 'estadisticas',
      onClick: () => {
        setActiveTab('estadisticas');
        setMobileMenuOpen(false);
      },
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full select-none bg-[#101B32]">
      {/* Top: Identidad del Comercio */}
      <div className="px-5 pt-6 pb-4 flex items-start justify-between">
        <div>
          <div className="w-11 h-11 rounded-2xl bg-[#3B82F6] text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
            {currentStore.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="mt-3">
            <h2 className="text-base font-bold text-[#F8FAFC] tracking-tight leading-tight">
              {currentStore.name}
            </h2>
            <p className="text-xs text-[#B8C6DA] font-medium mt-0.5">
              Panel de Administración
            </p>
          </div>
        </div>

        {/* Botón cerrar en drawer móvil */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-[#B8C6DA] hover:text-[#F8FAFC] hover:bg-[#17243D]"
          aria-label="Cerrar menú"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navegación Principal Estructural */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
        {navMenuItems.map((item) => {
          const Icon = item.icon;
          const hasSub = item.subItems && item.isActive;

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  item.isActive
                    ? 'bg-[#3B82F6] text-white shadow-xs'
                    : 'text-[#B8C6DA] hover:text-[#F8FAFC] hover:bg-[#17243D]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.subItems && (
                  <ChevronRight
                    className={`w-3 h-3 text-[#B8C6DA] transition-transform duration-200 ${
                      item.isActive ? 'rotate-90 text-white' : ''
                    }`}
                  />
                )}
              </button>

              {/* Sub-items anidados si la sección está activa */}
              {hasSub && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-[#263653] ml-3">
                  {item.subItems!.map((sub) => {
                    const isSubActive = activeTab === sub.id;
                    const SubIcon = sub.icon;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(sub.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-2 ${
                          isSubActive
                            ? 'bg-[#3B82F6]/15 text-[#3B82F6] font-semibold border border-[#3B82F6]/30'
                            : 'text-[#B8C6DA] hover:text-[#F8FAFC] hover:bg-[#17243D]'
                        }`}
                      >
                        {SubIcon && <SubIcon className="w-3 h-3 flex-shrink-0" />}
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Enlaces de Acción Inferior */}
      <div className="px-3 py-2 border-t border-[#263653] space-y-0.5">
        {currentStore.slug && (
          <button
            type="button"
            onClick={() => {
              navigate(`/tienda/${currentStore.slug}`);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#B8C6DA] hover:text-[#F8FAFC] hover:bg-[#17243D] transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#B8C6DA]" />
            <span>Ver Tienda</span>
          </button>
        )}

        <button
          type="button"
          id="btn-sidebar-cambiar-password"
          onClick={() => {
            setIsChangePasswordOpen(true);
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#B8C6DA] hover:text-[#F8FAFC] hover:bg-[#17243D] transition cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#B8C6DA]" />
          <span>Configuración</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.open('https://wa.me/59163527099?text=Hola%2C%20necesito%20ayuda%20con%20mi%20panel%20de%20MAXINEGO', '_blank', 'noopener,noreferrer');
            }
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#B8C6DA] hover:text-[#F8FAFC] hover:bg-[#17243D] transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-[#B8C6DA]" />
          <span>Ayuda</span>
        </button>

        <button
          type="button"
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#B8C6DA] hover:text-rose-400 hover:bg-[#2E141E]/40 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>

      {/* Brand Footer estilo CentralBo / MAXINEGO */}
      <div className="px-5 py-3 border-t border-[#263653]">
        <p className="text-xs font-bold text-[#F8FAFC]">CentralBo</p>
        <p className="text-[10px] text-[#B8C6DA]">Comercio Digital en Bolivia</p>
        <p className="text-[9px] text-[#7E90B0] font-mono mt-0.5">v1.0.0</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-[#F5F8FC] dark:bg-[#080F20] text-[#14213D] dark:text-[#F8FAFC] transition-colors">
      {/* 1. SIDEBAR ESTRUCTURAL OSCURO (Desktop) */}
      <aside className="w-60 flex-shrink-0 hidden lg:flex flex-col bg-[#101B32] border-r border-[#263653] text-[#B8C6DA] min-h-screen sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Drawer Móvil / Tablet Responsive */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#101B32] border-r border-[#263653] shadow-2xl z-10 flex flex-col">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* 2. ÁREA PRINCIPAL ADMINISTRATIVA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* CABECERA ADMINISTRATIVA */}
        <header className="h-16 sm:h-20 px-3 sm:px-6 lg:px-8 bg-white dark:bg-[#101B32] border-b border-[#DEE7F2] dark:border-[#263653] flex items-center justify-between gap-3 sticky top-0 z-20 shadow-2xs">
          {/* Lado izquierdo: Toggle móvil + Identidad del Comercio */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#475569] dark:text-[#B8C6DA] hover:bg-[#EEF4FF] dark:hover:bg-[#17243D] cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Avatar Iniciales */}
            <div className="w-10 h-10 rounded-2xl bg-[#1769FF] dark:bg-[#3B82F6] flex items-center justify-center text-white font-extrabold text-sm sm:text-base flex-shrink-0 shadow-2xs">
              {currentStore.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Nombre y Badges Superiores */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-extrabold text-[#14213D] dark:text-[#F8FAFC] truncate">
                  {currentStore.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EEF4FF] text-[#1769FF] border border-[#DEE7F2] dark:bg-[#17243D] dark:text-[#3B82F6] dark:border-[#263653]">
                  {currentStore.store_type}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EEF4FF] text-[#475569] border border-[#DEE7F2] dark:bg-[#17243D] dark:text-[#B8C6DA] dark:border-[#263653]">
                  Plan {planInfo.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#B8C6DA] mt-0.5 truncate hidden sm:block">
                Panel de Administración
              </p>
            </div>
          </div>

          {/* Lado derecho: Acciones de Cabecera (Instalar Panel, Ver Tienda, Salir, ThemeToggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <StoreAdminPWAInstallButton
              storeName={currentStore.name}
              tenantId={currentStore.id}
            />

            {currentStore.slug && (
              <button
                type="button"
                onClick={() => navigate(`/tienda/${currentStore.slug}`)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#EEF4FF] hover:bg-[#DEE7F2] text-[#1769FF] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653] text-xs font-semibold transition cursor-pointer shadow-2xs"
                title="Abrir vitrina de la tienda"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver Tienda</span>
              </button>
            )}

            <button
              type="button"
              id="btn-header-cambiar-password"
              onClick={() => setIsChangePasswordOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-[#EEF4FF] text-[#14213D] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] dark:text-[#F8FAFC] border border-[#DEE7F2] dark:border-[#263653] text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Cambiar contraseña de acceso"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Contraseña</span>
            </button>

            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-[#EEF4FF] text-[#475569] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] dark:text-[#B8C6DA] border border-[#DEE7F2] dark:border-[#263653] text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Cerrar sesión del panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* CUERPO DEL PANEL ADMINISTRATIVO */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 w-full max-w-6xl mx-auto space-y-3 sm:space-y-3.5">
          {/* Banner de SuperAdmin cuando está administrando una tienda seleccionada */}
          {(onBack || user?.profile === 'superadmin') && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[#EEF4FF] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1769FF] dark:text-[#3B82F6] flex-shrink-0" />
                <span>
                  Sesión SuperAdmin: Administrando <strong>{currentStore.name}</strong>.
                </span>
              </div>
              <button
                type="button"
                onClick={onBack ? onBack : () => navigate('/superadmin')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1769FF] hover:bg-blue-700 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs font-semibold transition cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Cambiar de Tienda</span>
              </button>
            </div>
          )}

          {/* Navegación móvil rápida por pestañas (solo visible en pantallas pequeñas) */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer border ${
                    item.isActive
                      ? 'bg-[#1769FF] dark:bg-[#3B82F6] text-white border-[#1769FF] dark:border-[#3B82F6] shadow-2xs'
                      : 'bg-white dark:bg-[#101B32] text-[#475569] dark:text-[#B8C6DA] border-[#DEE7F2] dark:border-[#263653] hover:bg-[#EEF4FF] dark:hover:bg-[#17243D]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Submenú secundario compacto horizontal para MI TIENDA */}
          {isMiTiendaGroup && (
            <div className="p-1.5 rounded-xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] flex items-center gap-1 overflow-x-auto shadow-2xs no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-[#475569] dark:text-[#B8C6DA] px-2 flex-shrink-0">
                Mi Tienda:
              </span>

              <button
                type="button"
                onClick={() => setActiveTab('tienda_perfil')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tienda_perfil'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <span>Perfil</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tienda_apariencia')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tienda_apariencia'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Apariencia</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tienda_horarios')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tienda_horarios'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Horarios</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tienda_envios')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tienda_envios'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Truck className="w-3 h-3" />
                <span>Envíos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tienda_programados')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tienda_programados'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <CalendarClock className="w-3 h-3" />
                <span>Pedidos Programados</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tienda_pagos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tienda_pagos'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <CreditCard className="w-3 h-3" />
                <span>Métodos de Pago</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tienda_contacto')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tienda_contacto'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Share2 className="w-3 h-3" />
                <span>Contacto y Redes</span>
              </button>
            </div>
          )}

          {/* Submenú secundario compacto horizontal para CATÁLOGO */}
          {isCatalogoGroup && (
            <div className="p-1.5 rounded-xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] flex items-center gap-1 overflow-x-auto shadow-2xs no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-[#475569] dark:text-[#B8C6DA] px-2 flex-shrink-0">
                Catálogo:
              </span>

              <button
                type="button"
                onClick={() => setActiveTab('catalogo_productos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'catalogo_productos'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Package className="w-3 h-3" />
                <span>Productos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('catalogo_categorias')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'catalogo_categorias'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Categorías</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('catalogo_config_especifica')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'catalogo_config_especifica'
                    ? 'bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653]'
                    : 'text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {currentStore.store_type === 'servicios'
                    ? 'Citas y Profesionales'
                    : `Configuración (${currentStore.store_type})`}
                </span>
              </button>
            </div>
          )}

          {/* SUPERFICIE DE CONTENIDO ACTIVO */}
          {activeTab === 'inicio_resumen' ? (
            <InicioResumen store={currentStore} onNavigateTab={setActiveTab} />
          ) : (
            <div
              key={currentStore.id}
              className="bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xs transition-colors"
            >
              {/* MI TIENDA */}
              {activeTab === 'tienda_perfil' && <MiTiendaPerfil store={currentStore} />}
              {activeTab === 'tienda_apariencia' && <MiTiendaApariencia store={currentStore} />}
              {activeTab === 'tienda_horarios' && <MiTiendaHorarios store={currentStore} />}
              {activeTab === 'tienda_envios' && <MiTiendaEnvios store={currentStore} />}
              {activeTab === 'tienda_programados' && <MiTiendaProgramados store={currentStore} />}
              {activeTab === 'tienda_pagos' && <MiTiendaPagos store={currentStore} />}
              {activeTab === 'tienda_contacto' && <MiTiendaContacto store={currentStore} />}

              {/* CATÁLOGO */}
              {activeTab === 'catalogo_productos' && <CatalogoProductos store={currentStore} />}
              {activeTab === 'catalogo_categorias' && <CatalogoCategorias store={currentStore} />}
              {activeTab === 'catalogo_config_especifica' && (
                <CatalogoConfigEspecifica store={currentStore} />
              )}

              {/* PEDIDOS */}
              {activeTab === 'pedidos' && <StoreAdminPedidos key={currentStore.id} store={currentStore} />}

              {/* PROMOCIONES */}
              {activeTab === 'promociones' && <StoreAdminPromociones store={currentStore} />}

              {/* ESTADÍSTICAS */}
              {activeTab === 'estadisticas' && <StoreAdminEstadisticas store={currentStore} />}
            </div>
          )}
        </main>

        {/* Modal de Cambio Seguro de Contraseña */}
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </div>
    </div>
  );
};
