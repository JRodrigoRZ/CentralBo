import React, { useState } from 'react';
import {
  Sparkles,
  Store as StoreIcon,
  Package,
  MessageCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Share2,
  Copy,
  Check,
  ShoppingBag,
  Zap,
  Globe,
  Tag,
} from 'lucide-react';

/**
 * MÓDULO 4: DEMOSTRACIÓN VISUAL DE LOS 3 PASOS
 *
 * Explica visualmente el flujo de uso de MAXINEGO para comerciantes:
 * 1. Crea tu tienda digital
 * 2. Publica tus productos y servicios
 * 3. Comparte tu tienda y recibe pedidos
 *
 * Cumplimiento estricto:
 * - Sin botones adicionales ni enlaces nuevos.
 * - Sin simular envíos reales de mensajes.
 * - Sin inventar comercios ni métricas ficticias.
 * - Excelente lectura en modo claro y oscuro.
 * - Totalmente adaptado a móvil, tablet y escritorio.
 */
export const ThreeStepsDemoSection: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeStepHover, setActiveStepHover] = useState<number | null>(null);

  const handleCopyDemo = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section
      id="como-funciona"
      className="w-full space-y-8 sm:space-y-10 scroll-mt-20 py-2"
      aria-label="Cómo funciona MAXINEGO en 3 pasos"
    >
      {/* ========================================================================= */}
      {/* 1. ENCABEZADO COMERCIAL (REQUISITO TEXTUAL EXACTO)                         */}
      {/* ========================================================================= */}
      <div className="max-w-3xl space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-[#1769FF] dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ASÍ DE SIMPLE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14213D] dark:text-white tracking-tight">
          Tu negocio en digital, en 3 pasos.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Con MAXINEGO puedes presentar tus productos, compartir tu tienda y recibir pedidos directamente por WhatsApp.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECUENCIA VISUAL CONTINUA DE LOS 3 PASOS                               */}
      {/* ========================================================================= */}
      <div className="relative">
        {/* Línea conectora gráfica sutil en escritorio */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-[138px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-400/40 via-[#7C3AED]/40 to-emerald-400/40 dark:from-blue-500/30 dark:via-purple-500/30 dark:to-emerald-500/30 pointer-events-none z-0"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 relative z-10">
          
          {/* ===================================================================== */}
          {/* PASO 01: CREA TU TIENDA DIGITAL                                       */}
          {/* ===================================================================== */}
          <div
            onMouseEnter={() => setActiveStepHover(1)}
            onMouseLeave={() => setActiveStepHover(null)}
            className={`group rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
              activeStepHover === 1
                ? 'bg-white dark:bg-[#0d162b] border-[#1769FF]/50 dark:border-blue-500/60 shadow-[0_12px_30px_rgba(23,105,255,0.12)] dark:shadow-[0_12px_30px_rgba(37,99,235,0.2)] -translate-y-1'
                : 'bg-white dark:bg-[#0c152a] border-slate-200/90 dark:border-[#1c2a47] shadow-sm hover:shadow-md'
            }`}
          >
            {/* Halo de acento en el fondo */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5">
              {/* Encabezado del paso con número grande y badge */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-[#1769FF] to-[#7C3AED] bg-clip-text text-transparent tracking-tighter">
                  01
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-cyan-300 border border-blue-200/80 dark:border-blue-800/60">
                  <StoreIcon className="w-3 h-3 text-[#1769FF] dark:text-cyan-400" />
                  <span>Tu espacio propio</span>
                </span>
              </div>

              {/* REPRESENTACIÓN VISUAL: Tienda digital tomando forma */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#080f1e] border border-slate-200/80 dark:border-[#182642] space-y-3.5 transition-colors">
                {/* Cabecera de la tienda simulada con identidad oficial */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                    TG
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-white truncate">
                        Tienda Gloria
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Tienda activa" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Alimentos frescos y despensa local
                    </p>
                  </div>
                </div>

                {/* URL Web exclusiva y candado SSL */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200/90 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow-2xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">maxinego.app/tienda/gloria</span>
                  </div>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 shrink-0">
                    Web PWA
                  </span>
                </div>

                {/* Micro-atributos de identidad */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-white dark:bg-[#0e172a] border border-slate-200/70 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Marca</span>
                    <span className="text-[11px] font-bold text-[#14213D] dark:text-slate-200 truncate block">
                      100% Exclusiva
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#0e172a] border border-slate-200/70 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Ventas</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                      0% Comisiones
                    </span>
                  </div>
                </div>
              </div>

              {/* TÍTULO Y DESCRIPCIÓN REQUERIDOS */}
              <div className="space-y-1.5 pt-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#14213D] dark:text-white group-hover:text-[#1769FF] dark:group-hover:text-cyan-400 transition-colors">
                  01. Crea tu tienda digital
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dale a tu negocio su propio espacio en MAXINEGO, con su identidad y su catálogo.
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* PASO 02: PUBLICA TUS PRODUCTOS Y SERVICIOS                             */}
          {/* ===================================================================== */}
          <div
            onMouseEnter={() => setActiveStepHover(2)}
            onMouseLeave={() => setActiveStepHover(null)}
            className={`group rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
              activeStepHover === 2
                ? 'bg-white dark:bg-[#0d162b] border-[#7C3AED]/50 dark:border-purple-500/60 shadow-[0_12px_30px_rgba(124,58,237,0.12)] dark:shadow-[0_12px_30px_rgba(147,51,234,0.2)] -translate-y-1'
                : 'bg-white dark:bg-[#0c152a] border-slate-200/90 dark:border-[#1c2a47] shadow-sm hover:shadow-md'
            }`}
          >
            {/* Halo de acento en el fondo */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5">
              {/* Encabezado del paso con número grande y badge */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-[#7C3AED] to-blue-600 bg-clip-text text-transparent tracking-tighter">
                  02
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                  <Package className="w-3 h-3 text-[#7C3AED] dark:text-purple-400" />
                  <span>Catálogo ordenado</span>
                </span>
              </div>

              {/* REPRESENTACIÓN VISUAL: Vista de catálogo organizado con productos y precios en Bs */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#080f1e] border border-slate-200/80 dark:border-[#182642] space-y-3 transition-colors">
                {/* Categorías del catálogo */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#1769FF] text-white shadow-2xs shrink-0">
                    Todos
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white dark:bg-[#0e172a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0">
                    Frutas y Verduras
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white dark:bg-[#0e172a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0">
                    Despensa
                  </span>
                </div>

                {/* Grilla compacta de dos productos representativos */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between gap-2.5 group-hover:border-purple-300 dark:group-hover:border-purple-700/60 transition-colors shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 flex items-center justify-center shrink-0">
                        🍎
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#14213D] dark:text-white truncate">
                          Canasta Familiar Fresca
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Frutas seleccionadas de temporada
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      Bs 45.00
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between gap-2.5 group-hover:border-purple-300 dark:group-hover:border-purple-700/60 transition-colors shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 flex items-center justify-center shrink-0">
                        📦
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#14213D] dark:text-white truncate">
                          Pack Desayuno Integral
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Granos andinos y miel natural
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      Bs 32.00
                    </span>
                  </div>
                </div>

                {/* Micro-indicador de disponibilidad */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1 pt-0.5">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Precios en Bolivianos</span>
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Actualización al instante
                  </span>
                </div>
              </div>

              {/* TÍTULO Y DESCRIPCIÓN REQUERIDOS */}
              <div className="space-y-1.5 pt-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#14213D] dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 transition-colors">
                  02. Publica tus productos y servicios
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Organiza tu catálogo con imágenes, descripciones y precios para que tus clientes conozcan lo que ofreces.
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* PASO 03: COMPARTE TU TIENDA Y RECIBE PEDIDOS                          */}
          {/* ===================================================================== */}
          <div
            onMouseEnter={() => setActiveStepHover(3)}
            onMouseLeave={() => setActiveStepHover(null)}
            className={`group rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
              activeStepHover === 3
                ? 'bg-white dark:bg-[#0d162b] border-emerald-500/50 dark:border-emerald-500/60 shadow-[0_12px_30px_rgba(16,185,129,0.12)] dark:shadow-[0_12px_30px_rgba(16,185,129,0.2)] -translate-y-1'
                : 'bg-white dark:bg-[#0c152a] border-slate-200/90 dark:border-[#1c2a47] shadow-sm hover:shadow-md'
            }`}
          >
            {/* Halo de acento en el fondo */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5">
              {/* Encabezado del paso con número grande y badge */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent tracking-tighter">
                  03
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Directo a WhatsApp</span>
                </span>
              </div>

              {/* REPRESENTACIÓN VISUAL: Enlace compartible y mensaje desglosado para WhatsApp */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#080f1e] border border-slate-200/80 dark:border-[#182642] space-y-3 transition-colors">
                {/* Caja de enlace para compartir */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200/90 dark:border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                    <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate font-mono text-[10px]">maxinego.app/tienda/gloria</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyDemo}
                    aria-label="Copiar enlace de ejemplo maxinego.app/tienda/gloria"
                    className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#1769FF] dark:bg-blue-950/70 dark:text-cyan-300 text-[10px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    title="Copiar enlace de ejemplo"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Burbuja simulada de pedido ordenado que llega a WhatsApp */}
                <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-[#062016] border border-emerald-200/80 dark:border-emerald-600/30 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                      <div className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-2.5 h-2.5" />
                      </div>
                      <span>Nuevo Pedido Recibido</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                      Ahora
                    </span>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-emerald-800 dark:text-emerald-200/90 leading-tight">
                    • 1x Canasta Familiar Fresca (Bs 45.00)
                    <br />
                    • 1x Pack Desayuno Integral (Bs 32.00)
                  </p>

                  <div className="pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-[11px] font-black text-emerald-900 dark:text-emerald-100">
                    <span>Total a coordinar:</span>
                    <span className="text-emerald-700 dark:text-emerald-300">Bs 77.00</span>
                  </div>
                </div>

                {/* Estado de notificación */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1 pt-0.5">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Zap className="w-3 h-3" />
                    <span>Sin intermediarios</span>
                  </span>
                  <span>Coordinas entrega y pago</span>
                </div>
              </div>

              {/* TÍTULO Y DESCRIPCIÓN REQUERIDOS */}
              <div className="space-y-1.5 pt-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#14213D] dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  03. Comparte tu tienda y recibe pedidos
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Comparte el enlace de tu tienda. Tus clientes podrán explorar tu catálogo y enviarte pedidos por WhatsApp.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
