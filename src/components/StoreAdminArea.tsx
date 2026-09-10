import React, { useEffect, useState } from 'react';
import {
  Store as StoreIcon,
  ShieldCheck,
  UserCheck,
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
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { Store, StoreAdminTab } from '../types';
import { resolveStoreById, BASELINE_STORES } from '../lib/multiTenantService';
import { getStorePlan } from '../lib/storeAdminService';

// Subcomponentes del Panel Admin de Tienda (Módulo 4)
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
import { CatalogoCategorias } from './storeadmin/CatalogoCategorias';
import { CatalogoConfigEspecifica } from './storeadmin/CatalogoConfigEspecifica';
import { StoreAdminPedidos } from './storeadmin/StoreAdminPedidos';
import { StoreAdminPromociones } from './storeadmin/StoreAdminPromociones';
import { StoreAdminEstadisticas } from './storeadmin/StoreAdminEstadisticas';
import { ThemeToggle } from './ThemeToggle';

interface StoreAdminAreaProps {
  tenantId?: string;
}

export const StoreAdminArea: React.FC<StoreAdminAreaProps> = ({ tenantId }) => {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<StoreAdminTab>('inicio_resumen');
  const [store, setStore] = useState<Store | null>(user?.store || null);
  const [loading, setLoading] = useState<boolean>(!user?.store);

  // Para store_admin, se fuerza estrictamente su propio tenantId autorizado; sólo superadmin puede alternar tenantId arbitrario
  const activeTenantId =
    user?.profile === 'superadmin' ? (tenantId || user?.tenantId) : user?.tenantId;

  useEffect(() => {
    let cancelled = false;
    if (activeTenantId) {
      setLoading(true);
      // Limpiar inmediatamente datos de la tienda anterior para evitar fugas en el panel y en la PWA
      setStore(null);
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

  // Guardia de Seguridad Interna Multi-Tenant
  const isAuthorized =
    user &&
    (user.profile === 'superadmin' ||
      (user.profile === 'store_admin' && (!tenantId || user.tenantId === tenantId)));

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
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
          <span>Regresar a CentralBo</span>
        </button>
      </div>
    );
  }

  if (loading || !store) {
    return (
      <div className="w-full max-w-6xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Cargando administración del comercio...</p>
      </div>
    );
  }

  const currentStore = store;
  const planInfo = getStorePlan(currentStore.id);

  // Inyección reactiva del manifiesto PWA específico para la administración de este comercio
  useAdminPWA(
    currentStore
      ? {
          tenantId: currentStore.id,
          storeName: currentStore.name,
          description: currentStore.description,
        }
      : null
  );

  // Navegación jerárquica con grupos
  const isMiTiendaGroup = activeTab.startsWith('tienda_');
  const isCatalogoGroup = activeTab.startsWith('catalogo_');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Barra de Migas de Pan y Salida */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => navigate('/')}
            className="hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>CentralBo</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">{currentStore.name}</span>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold capitalize">
            {activeTab.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Selector de Tema */}
          <ThemeToggle />

          {/* Botón de Instalación PWA del Panel Admin de este comercio */}
          <StoreAdminPWAInstallButton
            storeName={currentStore.name}
            tenantId={currentStore.id}
          />

          {currentStore.slug && (
            <button
              onClick={() => navigate(`/tienda/${currentStore.slug}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-semibold transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Tienda</span>
            </button>
          )}

          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Cabecera del Comercio y Estado Operativo */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow-xs">
              {currentStore.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {currentStore.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 uppercase">
                  {currentStore.store_type}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    planInfo === 'pro'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Plan {planInfo}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Panel de Administración • {currentStore.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ DEL ADMINISTRADOR */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {/* 1. INICIO */}
          <button
            type="button"
            onClick={() => setActiveTab('inicio_resumen')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'inicio_resumen'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>INICIO</span>
          </button>

          {/* 2. MI TIENDA (Abre submenú de Mi Tienda) */}
          <button
            type="button"
            onClick={() => {
              if (!isMiTiendaGroup) setActiveTab('tienda_perfil');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              isMiTiendaGroup
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <StoreIcon className="w-4 h-4" />
            <span>MI TIENDA</span>
          </button>

          {/* 3. CATÁLOGO (Abre submenú de Catálogo) */}
          <button
            type="button"
            onClick={() => {
              if (!isCatalogoGroup) setActiveTab('catalogo_productos');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              isCatalogoGroup
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>CATÁLOGO</span>
          </button>

          {/* 4. PEDIDOS */}
          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pedidos'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>PEDIDOS</span>
          </button>

          {/* 5. PROMOCIONES */}
          <button
            type="button"
            onClick={() => setActiveTab('promociones')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'promociones'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>PROMOCIONES</span>
          </button>

          {/* 6. ESTADÍSTICAS */}
          <button
            type="button"
            onClick={() => setActiveTab('estadisticas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'estadisticas'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ESTADÍSTICAS</span>
          </button>
        </div>

        {/* Submenú de MI TIENDA */}
        {isMiTiendaGroup && (
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shadow-xs">
            <span className="text-[11px] uppercase font-bold text-slate-400 px-2 flex-shrink-0">
              Mi Tienda:
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_perfil')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_perfil'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_apariencia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_apariencia'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3 h-3" />
              <span>Apariencia</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_horarios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_horarios'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Horarios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_envios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_envios'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Envíos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_programados')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_programados'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarClock className="w-3 h-3" />
              <span>Pedidos Programados</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_pagos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_pagos'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3 h-3" />
              <span>Métodos de Pago</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_contacto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_contacto'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Share2 className="w-3 h-3" />
              <span>Contacto y Redes</span>
            </button>
          </div>
        )}

        {/* Submenú de CATÁLOGO */}
        {isCatalogoGroup && (
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shadow-xs">
            <span className="text-[11px] uppercase font-bold text-slate-400 px-2 flex-shrink-0">
              Catálogo:
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('catalogo_productos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'catalogo_productos'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-3 h-3" />
              <span>Productos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalogo_categorias')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'catalogo_categorias'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Categorías</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalogo_config_especifica')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'catalogo_config_especifica'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
      </div>

      {/* ÁREA DE CONTENIDO ACTIVO */}
      <div
        key={currentStore.id}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs transition-colors"
      >
        {activeTab === 'inicio_resumen' && (
          <InicioResumen store={currentStore} onNavigateTab={setActiveTab} />
        )}

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
        {activeTab === 'pedidos' && <StoreAdminPedidos store={currentStore} />}

        {/* PROMOCIONES */}
        {activeTab === 'promociones' && <StoreAdminPromociones store={currentStore} />}

        {/* ESTADÍSTICAS */}
        {activeTab === 'estadisticas' && <StoreAdminEstadisticas store={currentStore} />}
      </div>
    </div>
  );
};
