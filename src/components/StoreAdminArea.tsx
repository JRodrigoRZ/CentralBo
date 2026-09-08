import React, { useEffect, useState } from 'react';
import {
  Store as StoreIcon,
  ShieldCheck,
  UserCheck,
  ArrowLeft,
  LogOut,
  ExternalLink,
  Lock,
  AlertTriangle,
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
  const { user, profile, signOut, switchDemoProfile } = useAuth();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<StoreAdminTab>('inicio_resumen');
  const [store, setStore] = useState<Store | null>(user?.store || null);
  const [loading, setLoading] = useState<boolean>(!user?.store);

  const activeTenantId = tenantId || user?.tenantId;

  useEffect(() => {
    if (activeTenantId) {
      setLoading(true);
      resolveStoreById(activeTenantId)
        .then((s) => {
          if (s) setStore(s);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTenantId]);

  // Guardia de Seguridad Interna Multi-Tenant
  // Solamente el Administrador del Comercio (vinculado a su tenant_id) o un SuperAdmin en modo auditoría
  const isAuthorized =
    user &&
    (user.profile === 'superadmin' ||
      (user.profile === 'store_admin' && (!tenantId || user.tenantId === tenantId)));

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-rose-900/50 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Violación de Aislamiento Multi-Tenant Denegada
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          No tienes autorización para acceder a la gestión de este comercio. Cada Administrador de
          Comercio tiene acceso estrictamente restringido a su propio <code>tenant_id</code>.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar al Portal</span>
        </button>
      </div>
    );
  }

  // Comercio de referencia alternativo para comprobar que el router previene el acceso indebido
  const otherStore =
    BASELINE_STORES.find((s) => s.id !== activeTenantId) || BASELINE_STORES[1];

  const currentStore = store || user?.store || BASELINE_STORES[0];
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
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            onClick={() => navigate('/')}
            className="hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>CentralBo</span>
          </button>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{currentStore.name}</span>
          <span>/</span>
          <span className="text-indigo-400 font-medium capitalize">
            {activeTab.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
            Tenant: {currentStore.id.slice(0, 8)}...
          </span>

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
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Ver Tienda</span>
            </button>
          )}

          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs transition cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Cabecera del Comercio y Estado Operativo */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xl flex-shrink-0">
              {currentStore.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {currentStore.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                  {currentStore.store_type}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    planInfo === 'pro'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Plan {planInfo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Panel administrativo de gestión exclusiva • {currentStore.description}
              </p>
            </div>
          </div>

          {/* Selector Rápido de Comercio Demo (Para validar los 4 tipos de tienda) */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 self-start sm:self-auto">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Probar Tienda Demo:
            </span>
            <select
              value={
                currentStore.id === 'store-zenit-001'
                  ? 'adminZenit'
                  : currentStore.id === 'store-losandes-001'
                  ? 'adminLosAndes'
                  : currentStore.id === '22222222-2222-2222-2222-222222222222'
                  ? 'adminModa'
                  : 'adminRestaurante'
              }
              onChange={(e) =>
                switchDemoProfile(
                  e.target.value as
                    | 'adminRestaurante'
                    | 'adminModa'
                    | 'adminZenit'
                    | 'adminLosAndes'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="adminRestaurante">🍕 La Rústica (Restaurante - Pro)</option>
              <option value="adminModa">👗 Moda Urbana (Moda - Basic)</option>
              <option value="adminZenit">✂️ Zenit Spa (Servicios - Pro)</option>
              <option value="adminLosAndes">🛒 Los Andes (General - Basic)</option>
            </select>
          </div>
        </div>

        {/* Banner de Verificación de Aislamiento Multi-tenant con prueba de violación */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-300">
              Aislamiento Multi-Tenant validado: Tus datos y configuraciones pertenecen
              únicamente al comercio <strong>{currentStore.name}</strong>.
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/admin/${otherStore.id}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/40 text-[11px] font-semibold transition cursor-pointer self-start sm:self-auto"
            title="Prueba de frontera: el router bloqueará el acceso a este comercio ajeno"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Probar violación a {otherStore.name}</span>
          </button>
        </div>
      </div>

      {/* MENÚ DEL ADMINISTRADOR (Exactamente como fue requerido) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {/* 1. INICIO */}
          <button
            type="button"
            onClick={() => setActiveTab('inicio_resumen')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'inicio_resumen'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
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
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
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
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
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
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
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
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
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
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ESTADÍSTICAS</span>
          </button>
        </div>

        {/* Submenú de MI TIENDA */}
        {isMiTiendaGroup && (
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5 overflow-x-auto animate-fadeIn">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex-shrink-0">
              Mi Tienda:
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_perfil')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_perfil'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tienda_apariencia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tienda_apariencia'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3 h-3" />
              <span>Contacto y Redes</span>
            </button>
          </div>
        )}

        {/* Submenú de CATÁLOGO */}
        {isCatalogoGroup && (
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5 overflow-x-auto animate-fadeIn">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex-shrink-0">
              Catálogo:
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('catalogo_productos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'catalogo_productos'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
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
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-7 shadow-xl">
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
