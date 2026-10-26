import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Package,
  Tag,
  Clock,
  Truck,
  MessageCircle,
  Lock,
  ArrowRight,
  Send,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { AgenteMaxAvatar } from '../common/AgenteMaxAvatar';

interface QuickQuestion {
  id: string;
  chipLabel: string;
  userQuestion: string;
  agentResponse: string;
  tag: string;
}

const DEMO_QUESTIONS: QuickQuestion[] = [
  {
    id: 'envios',
    chipLabel: '¿Tienen envíos a domicilio?',
    userQuestion: '¿Tienen envíos a domicilio y cuáles son los horarios?',
    agentResponse:
      '¡Hola! 👋 Sí, Tienda Gloria realiza envíos a domicilio en toda la zona central. Nuestro horario de atención y despacho es de lunes a sábado de 08:30 a 20:00.',
    tag: 'Horarios y Envíos',
  },
  {
    id: 'precios',
    chipLabel: '¿Cuáles son los precios?',
    userQuestion: '¿Cuáles son los precios de las canastas de frutas?',
    agentResponse:
      'Nuestra Canasta Familiar Fresca está a Bs 45.00 e incluye frutas de temporada seleccionadas. También tenemos el Pack Desayuno Integral a Bs 32.00.',
    tag: 'Precios en Bs',
  },
  {
    id: 'promociones',
    chipLabel: '¿Qué promociones tienen?',
    userQuestion: '¿Tienen alguna promoción disponible para hoy?',
    agentResponse:
      '¡Sí! Tenemos activo el combo especial de despensa con 10% de descuento y entrega local preferencial en compras mayores a Bs 70.00.',
    tag: 'Promociones',
  },
  {
    id: 'catalogo',
    chipLabel: '¿Cuál es el catálogo disponible?',
    userQuestion: '¿Qué productos tienen disponibles en la tienda?',
    agentResponse:
      'En nuestro catálogo encontrarás frutas frescas, verduras de temporada, despensa andina y combos familiares. Puedes agregar lo que gustes al carrito.',
    tag: 'Productos',
  },
];

/**
 * MÓDULO 5: PRESENTACIÓN VISUAL DE AGENTE MAX (CON MOVIMIENTO Y MICROINTERACCIONES)
 *
 * Presentación moderna, dinámica y tecnológica de Agente Max, destacando con total fidelidad que:
 * 1. Opera exclusivamente dentro de las tiendas públicas de MAXINEGO.
 * 2. Aparece en la esquina inferior derecha como asistente virtual del comercio.
 * 3. Resuelve dudas del cliente sobre productos, precios, promociones, horarios y envíos.
 *
 * Enriquecido con:
 * - Entrada progresiva escalonada por viewport.
 * - Leve flotación y resplandor ambiental azul/violeta vivo pero controlado.
 * - Widget de Agente Max con presencia activa (radar ping, avatar con aura sutil).
 * - Chips de preguntas dinámicos con feedback y transiciones de mensaje suaves.
 * - Microinteracciones en tarjetas de funciones (elevación y foco al mouse).
 * - Pleno respeto a prefers-reduced-motion.
 */
export const AgenteMaxShowcaseSection: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<QuickQuestion>(DEMO_QUESTIONS[0]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hoveredFunction, setHoveredFunction] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Detección de entrada en viewport para animación suave de aparición
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respeto a usuarios con preferencia de movimiento reducido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSelectQuestion = (q: QuickQuestion) => {
    if (q.id === selectedQuestion.id) return;
    setIsTyping(true);
    setSelectedQuestion(q);
    setTimeout(() => {
      setIsTyping(false);
    }, 240);
  };

  return (
    <section
      ref={sectionRef}
      id="agente-max"
      className="w-full space-y-8 sm:space-y-10 scroll-mt-20 py-2"
      aria-label="Conoce a Agente Max"
    >
      {/* ========================================================================= */}
      {/* 1. ENCABEZADO COMERCIAL (CON ENTRADA ESCALONADA SUAVE)                    */}
      {/* ========================================================================= */}
      <div
        className={`max-w-3xl space-y-2.5 transition-all duration-700 ease-out ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-[#1769FF] dark:text-cyan-400 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#1769FF] dark:text-cyan-400 animate-pulse" />
          <span>ASISTENTE INTELIGENTE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14213D] dark:text-white tracking-tight">
          Conoce a Agente Max
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Agente Max acompaña a tus clientes dentro de tu tienda pública y les ayuda a consultar productos, precios, promociones, horarios y métodos de envío.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPOSICIÓN VISUAL DUAL: PRESENTACIÓN + DEMOSTRACIÓN EN TIENDA         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LADO IZQUIERDO: EXPLICACIÓN Y 5 CAPACIDADES REALES DE AGENTE MAX        */}
        {/* ----------------------------------------------------------------------- */}
        <div
          className={`lg:col-span-5 space-y-6 transition-all duration-700 delay-150 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Tarjeta explicativa sobre su ubicación en la tienda pública con micro-resplandor */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/70 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-purple-950/50 border border-blue-200/80 dark:border-blue-800/60 space-y-2 shadow-xs relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-300">
                Siempre en tu tienda pública
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Visible en la <strong>esquina inferior derecha</strong> de tu tienda web para responder las preguntas de tus visitantes de forma inmediata y cercana.
            </p>
          </div>

          {/* 5 Funciones actuales oficiales de Agente Max con microinteracciones de hover */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Funciones actuales de Agente Max
            </h3>

            {/* Función 1: Productos disponibles */}
            <div
              onMouseEnter={() => setHoveredFunction(1)}
              onMouseLeave={() => setHoveredFunction(null)}
              className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0c152a] border transition-all duration-200 cursor-default shadow-2xs ${
                hoveredFunction === 1
                  ? 'border-blue-400 dark:border-blue-500 shadow-sm -translate-y-0.5 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-slate-200/90 dark:border-[#1c2a47]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
                    hoveredFunction === 1
                      ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-xs'
                      : 'bg-blue-50 text-[#1769FF] dark:bg-blue-950/70 dark:text-cyan-400 border-blue-100 dark:border-blue-800/60'
                  }`}
                >
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    1. Consultar productos disponibles
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Orienta a tus clientes sobre los artículos publicados en tu catálogo.
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-all duration-200 shrink-0 self-center ${
                  hoveredFunction === 1
                    ? 'opacity-100 translate-x-1 text-blue-600 dark:text-cyan-400'
                    : 'opacity-40'
                }`}
              />
            </div>

            {/* Función 2: Precios */}
            <div
              onMouseEnter={() => setHoveredFunction(2)}
              onMouseLeave={() => setHoveredFunction(null)}
              className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0c152a] border transition-all duration-200 cursor-default shadow-2xs ${
                hoveredFunction === 2
                  ? 'border-emerald-400 dark:border-emerald-500 shadow-sm -translate-y-0.5 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-200/90 dark:border-[#1c2a47]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
                    hoveredFunction === 2
                      ? 'bg-emerald-600 text-white border-emerald-600 scale-105 shadow-xs'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    2. Consultar precios
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Informa los valores vigentes en Bolivianos sin demoras ni dudas.
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-all duration-200 shrink-0 self-center ${
                  hoveredFunction === 2
                    ? 'opacity-100 translate-x-1 text-emerald-600 dark:text-emerald-400'
                    : 'opacity-40'
                }`}
              />
            </div>

            {/* Función 3: Promociones */}
            <div
              onMouseEnter={() => setHoveredFunction(3)}
              onMouseLeave={() => setHoveredFunction(null)}
              className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0c152a] border transition-all duration-200 cursor-default shadow-2xs ${
                hoveredFunction === 3
                  ? 'border-purple-400 dark:border-purple-500 shadow-sm -translate-y-0.5 bg-purple-50/30 dark:bg-purple-950/20'
                  : 'border-slate-200/90 dark:border-[#1c2a47]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
                    hoveredFunction === 3
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED] scale-105 shadow-xs'
                      : 'bg-purple-50 text-[#7C3AED] dark:bg-purple-950/70 dark:text-purple-300 border-purple-100 dark:border-purple-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 transition-colors">
                    3. Consultar promociones
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Destaca los descuentos, packs y ofertas especiales activas en tu negocio.
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-all duration-200 shrink-0 self-center ${
                  hoveredFunction === 3
                    ? 'opacity-100 translate-x-1 text-[#7C3AED] dark:text-purple-400'
                    : 'opacity-40'
                }`}
              />
            </div>

            {/* Función 4: Horarios de atención */}
            <div
              onMouseEnter={() => setHoveredFunction(4)}
              onMouseLeave={() => setHoveredFunction(null)}
              className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0c152a] border transition-all duration-200 cursor-default shadow-2xs ${
                hoveredFunction === 4
                  ? 'border-amber-400 dark:border-amber-500 shadow-sm -translate-y-0.5 bg-amber-50/30 dark:bg-amber-950/20'
                  : 'border-slate-200/90 dark:border-[#1c2a47]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
                    hoveredFunction === 4
                      ? 'bg-amber-500 text-white border-amber-500 scale-105 shadow-xs'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border-amber-100 dark:border-amber-800/60'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    4. Consultar horarios de atención
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Comunica claramente las jornadas de apertura y tiempos de respuesta.
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-all duration-200 shrink-0 self-center ${
                  hoveredFunction === 4
                    ? 'opacity-100 translate-x-1 text-amber-600 dark:text-amber-400'
                    : 'opacity-40'
                }`}
              />
            </div>

            {/* Función 5: Métodos de envío */}
            <div
              onMouseEnter={() => setHoveredFunction(5)}
              onMouseLeave={() => setHoveredFunction(null)}
              className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0c152a] border transition-all duration-200 cursor-default shadow-2xs ${
                hoveredFunction === 5
                  ? 'border-teal-400 dark:border-teal-500 shadow-sm -translate-y-0.5 bg-teal-50/30 dark:bg-teal-950/20'
                  : 'border-slate-200/90 dark:border-[#1c2a47]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
                    hoveredFunction === 5
                      ? 'bg-teal-600 text-white border-teal-600 scale-105 shadow-xs'
                      : 'bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-300 border-teal-100 dark:border-teal-800/60'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    5. Consultar métodos de envío
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Explica las opciones de entrega local o retiro coordinadas por tu tienda.
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-all duration-200 shrink-0 self-center ${
                  hoveredFunction === 5
                    ? 'opacity-100 translate-x-1 text-teal-600 dark:text-teal-400'
                    : 'opacity-40'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* LADO DERECHO: DEMOSTRACIÓN VISUAL EN LA TIENDA PÚBLICA                  */}
        {/* Marco flotante con profundidad y widget interactivo de Agente Max       */}
        {/* ----------------------------------------------------------------------- */}
        <div
          className={`lg:col-span-7 relative transition-all duration-700 delay-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Halo ambiental suave con respiración sutil controlada */}
          <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#1769FF]/20 via-[#7C3AED]/15 to-cyan-400/15 dark:from-[#1769FF]/25 dark:via-[#7C3AED]/25 dark:to-cyan-400/20 rounded-3xl blur-2xl pointer-events-none animate-pulse-glow" />

          {/* Marco exterior de ventana de navegador con flotación sutil */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0a1122] border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(20,33,61,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden animate-float-slow hover:[animation-play-state:paused] transition-shadow duration-300">
            
            {/* Barra de Ventana del Navegador */}
            <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-[#070d18] border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-2xs" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-2xs" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-2xs" />
              </div>

              {/* URL pública de la tienda */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-xs shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-slate-400">maxinego.app/tienda/</span>
                <span className="font-semibold text-slate-900 dark:text-white">tienda-gloria</span>
              </div>

              {/* Indicador de tienda pública */}
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Tienda Pública</span>
              </div>
            </div>

            {/* Contenedor Interior: Fondo de la tienda con productos sutiles */}
            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-[#080e1c] relative min-h-[490px] sm:min-h-[540px] flex flex-col justify-between">
              
              {/* Cabecera sutil de Tienda Gloria en el fondo */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d162b] border border-slate-200/80 dark:border-[#182642] flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    TG
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#14213D] dark:text-white truncate">
                        Tienda Gloria
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50">
                        ● Abierto
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Alimentos frescos • Catálogo público
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-[#1769FF] dark:text-cyan-400 hidden sm:inline">
                  Zona Central
                </span>
              </div>

              {/* Fondo decorativo con dos productos del comercio (ilustran el contexto de la tienda) */}
              <div className="grid grid-cols-2 gap-3 my-3 opacity-60 dark:opacity-40 pointer-events-none select-none">
                <div className="p-3 rounded-xl bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-base">🍎</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Canasta Familiar Fresca
                  </div>
                  <div className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400">
                    Bs 45.00
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-base">📦</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Pack Desayuno Integral
                  </div>
                  <div className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400">
                    Bs 32.00
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* WIDGET / CHAT DE AGENTE MAX EN LA ESQUINA INFERIOR DERECHA        */}
              {/* Con presencia activa, entrada suave y microinteracciones          */}
              {/* ================================================================= */}
              <div className="w-full max-w-sm sm:max-w-md ml-auto mt-auto pt-2">
                <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0e172a] border-2 border-blue-200/90 dark:border-[#253960] shadow-[0_12px_35px_rgba(23,105,255,0.18)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(56,189,248,0.2)] overflow-hidden transition-all duration-300 ring-1 ring-blue-500/10 dark:ring-cyan-500/20">
                  
                  {/* Cabecera del Widget de Agente Max con gradiente y activación viva */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-[#7C3AED] text-white flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar SVG oficial de Agente Max */}
                      <div className="relative">
                        <AgenteMaxAvatar className="w-9 h-9" />
                        <span className="absolute -inset-1 rounded-full bg-cyan-400/25 blur-xs pointer-events-none -z-10" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs sm:text-sm tracking-tight truncate">
                            Agente Max
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white/20 uppercase tracking-wider backdrop-blur-xs">
                            IA
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-100 truncate">
                          Asistente virtual de Tienda Gloria
                        </p>
                      </div>
                    </div>

                    {/* Indicador de estado "En línea" con ping pulsante */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white shrink-0 backdrop-blur-xs border border-white/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span>En línea</span>
                    </span>
                  </div>

                  {/* Cuerpo de la Conversación con Animación al Cambiar Pregunta */}
                  <div className="p-3.5 sm:p-4 space-y-3 bg-slate-50/70 dark:bg-[#091122]">
                    
                    {/* Pregunta del Cliente (Con animación de entrada de mensaje) */}
                    <div
                      key={`user-${selectedQuestion.id}`}
                      className="flex justify-end animate-message-slide"
                    >
                      <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-xs bg-blue-600 text-white text-xs shadow-xs space-y-1">
                        <p className="leading-snug">{selectedQuestion.userQuestion}</p>
                        <span className="text-[9px] text-blue-200 block text-right font-medium">
                          Cliente • Tienda Gloria
                        </span>
                      </div>
                    </div>

                    {/* Respuesta de Agente Max (Con animación y estado escribiendo) */}
                    <div
                      key={`agent-${selectedQuestion.id}`}
                      className="flex items-start gap-2.5 animate-message-slide"
                    >
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#1769FF] to-[#7C3AED] text-white flex items-center justify-center text-xs shrink-0 shadow-xs ring-1 ring-blue-400/30">
                        🤖
                      </div>
                      <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-xs bg-white dark:bg-[#131d33] border border-slate-200/90 dark:border-slate-800 text-xs shadow-2xs space-y-1.5 transition-all">
                        {isTyping ? (
                          <div className="flex items-center gap-1.5 py-1 text-slate-400 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
                            <span className="text-[10px] ml-1 font-medium">Agente Max está respondiendo...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-slate-800 dark:text-slate-100 leading-relaxed">
                              {selectedQuestion.agentResponse}
                            </p>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                              <span className="text-[#1769FF] dark:text-cyan-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                <span>Respuesta verificada del comercio</span>
                              </span>
                              <span>Agente Max</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Chips de Preguntas Rápidas Interactivas con Hover Dinámico */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Preguntas que tus clientes pueden hacer:
                        </span>
                        <span className="text-[9px] text-blue-600 dark:text-cyan-400 font-semibold">
                          Haz clic para probar
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Preguntas de demostración">
                        {DEMO_QUESTIONS.map((q) => {
                          const isSelected = q.id === selectedQuestion.id;
                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => handleSelectQuestion(q)}
                              aria-pressed={isSelected}
                              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs scale-[1.02] ring-2 ring-blue-400/50'
                                  : 'bg-white hover:bg-slate-100 dark:bg-[#131d33] dark:hover:bg-[#1a2744] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/60 hover:text-blue-600 dark:hover:text-cyan-300 active:scale-95'
                              }`}
                            >
                              <span>{q.chipLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Campo de Entrada de Mensaje Simulado con Microinteracción de Foco */}
                  <div className="px-3 py-2 bg-white dark:bg-[#0e172a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 group/input">
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 truncate pl-1 group-hover/input:text-slate-500 transition-colors">
                      Escribe tu consulta sobre productos, horarios o envíos...
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover/input:scale-105">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
