import React, { useState } from 'react';
import {
  Home,
  Store as StoreIcon,
  Package,
  ShoppingBag,
  Tag,
  TrendingUp,
  ExternalLink,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Calendar,
  ArrowRight,
  PlusCircle,
  BarChart3,
  Eye,
  Inbox,
  Lock,
  Sun,
  Moon,
  Laptop,
  Layers,
  Sparkles,
  Palette,
  Clock,
  Truck,
  CreditCard,
  Share2,
  CheckCircle2,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { MaxiNegoLogo } from '../common/MaxiNegoLogo';

interface DashboardShowcaseSectionProps {
  screenshotUrl?: string | null;
}

/**
 * MÓDULO 3: PRESENTACIÓN AUTÉNTICA DEL DASHBOARD EN LA LANDING
 *
 * Sección visual premium que exhibe el panel administrativo real de comercios
 * de MAXINEGO.app dentro de un marco de computadora elegante.
 *
 * Cumplimiento estricto:
 * - Etiqueta: "CONOCE TU PANEL"
 * - Título: "Así administras tu negocio con MAXINEGO"
 * - Descripción: "Conoce el panel desde donde puedes gestionar tus productos, organizar la atención y consultar los pedidos de tu comercio."
 * - Cero tarjetas promocionales repetitivas de la sección anterior.
 * - Cero métricas o pantallas inventadas.
 * - Representación 100% auténtica del panel real de MAXINEGO (con el bloque de bienvenida eliminado).
 */
export const DashboardShowcaseSection: React.FC<DashboardShowcaseSectionProps> = ({
  screenshotUrl = null,
}) => {
  const { theme: globalTheme } = useTheme();

  // Permite al visitante alternar el modo claro y oscuro del panel dentro del marco
  // para apreciar la colorimetría aprobada en ambos modos.
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(
    globalTheme === 'dark' ? 'dark' : 'light'
  );

  // Pestaña activa dentro del marco auténtico del panel
  const [activeTab, setActiveTab] = useState<'inicio' | 'tienda' | 'catalogo' | 'pedidos'>('inicio');

  const isDark = previewTheme === 'dark';

  return (
    <section id="conoce-tu-panel" className="w-full space-y-6 sm:space-y-8 scroll-mt-20">
      {/* ========================================================================= */}
      {/* 2. ENCABEZADO COMERCIAL (REQUISITOS EXACTOS DE TEXTO Y JERARQUÍA)         */}
      {/* ========================================================================= */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-[#1769FF] dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CONOCE TU PANEL</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14213D] dark:text-white tracking-tight">
          Así administras tu negocio con MAXINEGO
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Conoce el panel desde donde puedes gestionar tus productos, organizar la atención y consultar los pedidos de tu comercio.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRESENTACIÓN VISUAL: MARCO ELEGANTE DE COMPUTADORA CON CAPTURA AUTÉNTICA */}
      {/* ========================================================================= */}
      <div className="relative pt-2">
        {/* Halo ambiental con acentos azul (#1769FF) y violeta (#7C3AED) coherentes con MAXINEGO */}
        <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#1769FF]/15 via-[#7C3AED]/12 to-blue-500/10 dark:from-[#1769FF]/20 dark:via-[#7C3AED]/20 dark:to-cyan-500/15 rounded-3xl blur-2xl pointer-events-none opacity-80" />

        {/* Chasis exterior de la pantalla de computadora */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 shadow-[0_20px_50px_rgba(20,33,61,0.18)] dark:shadow-[0_25px_65px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 ring-1 ring-white/10">
          
          {/* Barra Superior del Sistema / Bisel y Controles de Ventana */}
          <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-slate-300 select-none">
            {/* Botones de ventana estilo Mac */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
            </div>

            {/* Barra de Dirección URL Auténtica del Panel Comercial */}
            <div className="flex-1 max-w-sm sm:max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300 truncate shadow-inner">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-slate-500 hidden sm:inline">https://</span>
                <span className="text-slate-400">maxinego.app/admin/</span>
                <span className="font-semibold text-white">tienda-gloria</span>
              </div>
            </div>

            {/* Controles de Vista: Alternar Modo Claro / Oscuro del Panel */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/70 text-[10px] font-semibold text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Panel Oficial</span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTheme(isDark ? 'light' : 'dark')}
                aria-label={isDark ? 'Cambiar a vista en modo claro' : 'Cambiar a vista en modo oscuro'}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                title={isDark ? 'Cambiar a vista en modo claro' : 'Cambiar a vista en modo oscuro'}
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] hidden sm:inline">Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] hidden sm:inline">Modo Oscuro</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 4. CONTENIDO PROTAGONISTA: EL PANEL REAL DE COMERCIOS                 */}
          {/* ===================================================================== */}
          {screenshotUrl ? (
            /* En caso de que se pase una captura de imagen estática oficial */
            <div className="relative bg-slate-950 overflow-hidden">
              <img
                src={screenshotUrl}
                alt="Captura real del panel de administración de MAXINEGO"
                className="w-full h-auto object-cover object-top select-none"
                loading="lazy"
              />
            </div>
          ) : (
            /* Renderizado nativo 100% auténtico con la estructura real aprobada */
            <div
              className={`w-full transition-colors duration-300 font-sans text-left ${
                isDark
                  ? 'bg-[#080d1a] text-slate-100'
                  : 'bg-slate-50 text-slate-900'
              }`}
            >
              <div className="grid grid-cols-12 min-h-[580px] sm:min-h-[640px] text-xs">
                
                {/* ------------------------------------------------------------- */}
                {/* BARRA LATERAL AUTÉNTICA (SIDEBAR)                            */}
                {/* ------------------------------------------------------------- */}
                <aside
                  className={`col-span-3 sm:col-span-3 lg:col-span-2.5 p-3 sm:p-4 border-r flex flex-col justify-between transition-colors ${
                    isDark
                      ? 'bg-[#0a1122] border-slate-800/90 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Logotipo / Marca del Comercio */}
                    <div className="flex items-center gap-2.5 px-1 py-1">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1769FF] to-[#7C3AED] text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                        M
                      </div>
                      <div className="min-w-0 hidden sm:block">
                        <div className="font-extrabold text-xs text-[#14213D] dark:text-white truncate">
                          MAXINEGO
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Panel Comercio
                        </div>
                      </div>
                    </div>

                    {/* Menú de Navegación Oficial de MAXINEGO */}
                    <nav className="space-y-1" role="tablist" aria-label="Secciones del panel de administración">
                      {/* 1. Inicio (Activo por omisión) */}
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'inicio'}
                        onClick={() => setActiveTab('inicio')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          activeTab === 'inicio'
                            ? isDark
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-600 text-white shadow-xs'
                            : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Home className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Inicio</span>
                      </button>

                      {/* 2. Mi Tienda */}
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'tienda'}
                        onClick={() => setActiveTab('tienda')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          activeTab === 'tienda'
                            ? isDark
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-600 text-white shadow-xs'
                            : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <StoreIcon className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Mi Tienda</span>
                      </button>

                      {/* 3. Catálogo */}
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'catalogo'}
                        onClick={() => setActiveTab('catalogo')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          activeTab === 'catalogo'
                            ? isDark
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-600 text-white shadow-xs'
                            : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Package className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Catálogo</span>
                      </button>

                      {/* 4. Pedidos */}
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'pedidos'}
                        onClick={() => setActiveTab('pedidos')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          activeTab === 'pedidos'
                            ? isDark
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-600 text-white shadow-xs'
                            : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Pedidos</span>
                      </button>

                      {/* 5. Promociones */}
                      <div
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium opacity-70 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        <Tag className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Promociones</span>
                      </div>

                      {/* 6. Estadísticas */}
                      <div
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium opacity-70 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Estadísticas</span>
                      </div>
                    </nav>
                  </div>

                  {/* Acciones Secundarias del Sidebar */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Ver Tienda</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Configuración</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Salir</span>
                    </div>
                  </div>
                </aside>

                {/* ------------------------------------------------------------- */}
                {/* ÁREA PRINCIPAL DEL DASHBOARD                                  */}
                {/* ------------------------------------------------------------- */}
                <main className="col-span-9 sm:col-span-9 lg:col-span-9.5 flex flex-col min-w-0">
                  {/* Encabezado Administrativo del Comercio */}
                  <header
                    className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-[#0d162b] border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                        TG
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#14213D] dark:text-white truncate">
                            Tienda Gloria
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                            Comercio
                          </span>
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                            Plan Pro
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Panel de Administración
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/60">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Instalar Panel</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver Tienda</span>
                      </span>
                    </div>
                  </header>

                  {/* =========================================================== */}
                  {/* CUERPO DE LA VISTA INICIO (CONFORME AL ORDEN OBLIGATORIO)    */}
                  {/* CERO TARJETA DE BIENVENIDA (ELIMINADA SEGÚN MÓDULO ANTERIOR)*/}
                  {/* =========================================================== */}
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
                    {/* 1. TRES TARJETAS DE MÉTRICAS PRINCIPALES */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {/* Métrica 1: Pedidos */}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between transition-shadow shadow-xs ${
                          isDark
                            ? 'bg-[#101b32] border-[#263653]'
                            : 'bg-white border-[#dee7f2]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                              isDark
                                ? 'bg-[#17243d] text-[#3b82f6] border-[#263653]'
                                : 'bg-[#eef4ff] text-[#1769ff] border-[#dee7f2]'
                            }`}
                          >
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#475569] dark:text-[#b8c6da] uppercase tracking-wider block">
                              Pedidos
                            </span>
                            <div className="text-xl sm:text-2xl font-extrabold text-[#14213D] dark:text-[#f8fafc] tracking-tight mt-0.5">
                              0
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-[#475569] dark:text-[#b8c6da] mt-0.5 truncate">
                              0 completados
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isDark ? 'bg-[#17243d] text-[#3b82f6]' : 'bg-[#eef4ff] text-[#1769ff]'
                          }`}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Métrica 2: Ventas Totales */}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between transition-shadow shadow-xs ${
                          isDark
                            ? 'bg-[#101b32] border-[#263653]'
                            : 'bg-white border-[#dee7f2]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                              isDark
                                ? 'bg-[#102a24] text-[#34d399] border-[#34d399]/30'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}
                          >
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#475569] dark:text-[#b8c6da] uppercase tracking-wider block">
                              Ventas Totales
                            </span>
                            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-[#34d399] tracking-tight mt-0.5">
                              Bs 0
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-[#475569] dark:text-[#b8c6da] mt-0.5 truncate">
                              Pedidos no cancelados
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isDark ? 'bg-[#102a24] text-[#34d399]' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Métrica 3: Ticket Promedio */}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between transition-shadow shadow-xs ${
                          isDark
                            ? 'bg-[#101b32] border-[#263653]'
                            : 'bg-white border-[#dee7f2]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                              isDark
                                ? 'bg-[#241c12] text-[#fbbf24] border-[#fbbf24]/30'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}
                          >
                            <Star className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#475569] dark:text-[#b8c6da] uppercase tracking-wider block">
                              Ticket Promedio
                            </span>
                            <div className="text-xl sm:text-2xl font-extrabold text-[#14213D] dark:text-[#f8fafc] tracking-tight mt-0.5">
                              Bs 0.0
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-[#475569] dark:text-[#b8c6da] mt-0.5 truncate">
                              Promedio por orden válida
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isDark ? 'bg-[#241c12] text-[#fbbf24]' : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* 2. SECCIÓN: ESTADOS DE PEDIDOS */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 shadow-xs ${
                        isDark
                          ? 'bg-[#101b32] border-[#263653]'
                          : 'bg-white border-[#dee7f2]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isDark ? 'bg-[#17243d] text-[#3b82f6]' : 'bg-[#eef4ff] text-[#1769ff]'
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-[#f8fafc]">
                              Estados de Pedidos <span className="text-[11px] font-normal text-[#475569] dark:text-[#b8c6da]">(0 totales)</span>
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-[#475569] dark:text-[#b8c6da]">
                              Control de flujo de atención y despacho de compras
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1769FF] dark:text-[#3b82f6]">
                          <span>Gestionar Pedidos</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>

                      {/* 5 Cápsulas de Estados de Pedidos */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {/* Pendientes */}
                        <div
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            isDark
                              ? 'bg-[#15233c] border-[#263653]'
                              : 'bg-amber-50/70 border-amber-200/80'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                            0
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Pendientes</div>
                            <div className="text-xs font-bold text-[#14213D] dark:text-white">0</div>
                          </div>
                        </div>

                        {/* En preparación */}
                        <div
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            isDark
                              ? 'bg-[#15233c] border-[#263653]'
                              : 'bg-blue-50/70 border-blue-200/80'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                            0
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">En preparación</div>
                            <div className="text-xs font-bold text-[#14213D] dark:text-white">0</div>
                          </div>
                        </div>

                        {/* En camino */}
                        <div
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            isDark
                              ? 'bg-[#15233c] border-[#263653]'
                              : 'bg-purple-50/70 border-purple-200/80'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                            0
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">En camino</div>
                            <div className="text-xs font-bold text-[#14213D] dark:text-white">0</div>
                          </div>
                        </div>

                        {/* Entregados */}
                        <div
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            isDark
                              ? 'bg-[#15233c] border-[#263653]'
                              : 'bg-emerald-50/70 border-emerald-200/80'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                            0
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Entregados</div>
                            <div className="text-xs font-bold text-[#14213D] dark:text-white">0</div>
                          </div>
                        </div>

                        {/* Cancelados */}
                        <div
                          className={`p-2.5 rounded-xl border flex items-center gap-2 col-span-2 sm:col-span-1 ${
                            isDark
                              ? 'bg-[#15233c] border-[#263653]'
                              : 'bg-rose-50/70 border-rose-200/80'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">
                            0
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Cancelados</div>
                            <div className="text-xs font-bold text-[#14213D] dark:text-white">0</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. ACCIONES RÁPIDAS Y ACTIVIDAD RECIENTE */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                      {/* Acciones Rápidas */}
                      <div
                        className={`md:col-span-5 p-4 sm:p-5 rounded-2xl border space-y-3 shadow-xs ${
                          isDark
                            ? 'bg-[#101b32] border-[#263653]'
                            : 'bg-white border-[#dee7f2]'
                        }`}
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-[#f8fafc] flex items-center gap-1.5">
                          <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Acciones rápidas</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                          <div
                            className={`p-3 rounded-xl border text-center space-y-1.5 ${
                              isDark
                                ? 'bg-[#15233c] border-[#263653]'
                                : 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                            }`}
                          >
                            <PlusCircle className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400" />
                            <div className="text-[11px] font-bold text-[#14213D] dark:text-white">
                              Agregar producto
                            </div>
                          </div>

                          <div
                            className={`p-3 rounded-xl border text-center space-y-1.5 ${
                              isDark
                                ? 'bg-[#15233c] border-[#263653]'
                                : 'bg-blue-50/60 border-blue-100 text-blue-900'
                            }`}
                          >
                            <Tag className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400" />
                            <div className="text-[11px] font-bold text-[#14213D] dark:text-white">
                              Crear promoción
                            </div>
                          </div>

                          <div
                            className={`p-3 rounded-xl border text-center space-y-1.5 ${
                              isDark
                                ? 'bg-[#15233c] border-[#263653]'
                                : 'bg-purple-50/60 border-purple-100 text-purple-900'
                            }`}
                          >
                            <TrendingUp className="w-5 h-5 mx-auto text-purple-600 dark:text-purple-400" />
                            <div className="text-[11px] font-bold text-[#14213D] dark:text-white">
                              Ver estadísticas
                            </div>
                          </div>

                          <div
                            className={`p-3 rounded-xl border text-center space-y-1.5 ${
                              isDark
                                ? 'bg-[#15233c] border-[#263653]'
                                : 'bg-amber-50/60 border-amber-100 text-amber-900'
                            }`}
                          >
                            <Eye className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400" />
                            <div className="text-[11px] font-bold text-[#14213D] dark:text-white">
                              Ver mi tienda
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actividad Reciente */}
                      <div
                        className={`md:col-span-7 p-4 sm:p-5 rounded-2xl border space-y-3 shadow-xs flex flex-col justify-between ${
                          isDark
                            ? 'bg-[#101b32] border-[#263653]'
                            : 'bg-white border-[#dee7f2]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-[#f8fafc] flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Actividad reciente</span>
                          </h4>
                          <span className="text-[11px] font-semibold text-[#1769FF] dark:text-[#3b82f6]">
                            Ver todas →
                          </span>
                        </div>

                        {/* Estado Vacío Auténtico */}
                        <div
                          className={`p-6 rounded-xl border border-dashed text-center space-y-2 my-auto ${
                            isDark
                              ? 'border-slate-700/80 bg-slate-900/40 text-slate-400'
                              : 'border-slate-200 bg-slate-50/80 text-slate-500'
                          }`}
                        >
                          <Inbox className="w-8 h-8 mx-auto text-slate-400" />
                          <div className="text-xs font-bold text-[#14213D] dark:text-white">
                            No hay actividad reciente
                          </div>
                          <p className="text-[11px] max-w-xs mx-auto">
                            Cuando recibas pedidos o realices cambios en tu tienda, aparecerán aquí.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          )}

          {/* Pie del Chasis de Computadora Portátil */}
          <div className="h-3 sm:h-3.5 bg-gradient-to-b from-slate-800 to-slate-950 border-t border-slate-700/60 flex items-center justify-center">
            <div className="w-20 sm:w-28 h-1 bg-slate-700 rounded-b-sm" />
          </div>
        </div>
      </div>
    </section>
  );
};
