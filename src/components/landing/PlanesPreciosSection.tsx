import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Zap,
  TrendingUp,
  Tag,
  Check,
} from 'lucide-react';
import { trackCommercialEvent } from '../../lib/commercialTrackingService';

/**
 * MÓDULO 6: PLANES, PRECIOS Y COMPARACIÓN COMERCIAL (VERSIÓN ALTO IMPACTO)
 *
 * Presentación oficial de los planes MAXINEGO BASIC y MAXINEGO PRO.
 * Enriquecida con:
 * - Colorimetría vibrante con identidad MAXINEGO (azul eléctrico #1769FF y violeta #7C3AED).
 * - Máximo protagonismo y jerarquía para los precios y planes.
 * - Gran presencia visual del beneficio "6 meses, pagas 5" y "12 meses, pagas 10".
 * - Tabla comparativa rediseñada con formato premium y filas de ahorro resaltadas.
 * - Microinteracciones, elevación suave al hover y halos ambientales vivos.
 * - Cero datos inventados; importes oficiales exactos en Bolivianos (Bs).
 */
export const PlanesPreciosSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hoveredPlan, setHoveredPlan] = useState<'basic' | 'pro' | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleContactScroll = (e: React.MouseEvent, plan: 'basic' | 'pro') => {
    e.preventDefault();

    // Registrar clic en "Solicitar información" distinguiendo el plan de origen
    trackCommercialEvent('click_solicitar_informacion', {
      origin: plan === 'basic' ? 'planes_basic' : 'planes_pro',
      planId: plan,
    });

    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', '#contacto');
    }
  };

  return (
    <section
      ref={sectionRef}
      id="planes"
      className="w-full space-y-8 sm:space-y-12 scroll-mt-20 py-2 relative"
      aria-label="Planes y precios de MAXINEGO"
    >
      {/* Ancla adicional para compatibilidad con enlaces del sitio */}
      <div id="precios" className="scroll-mt-20" />

      {/* Halo ambiental general de fondo para eliminar la sensación de vacío */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-tr from-blue-500/10 via-[#7C3AED]/12 to-emerald-500/8 dark:from-blue-600/15 dark:via-purple-600/15 dark:to-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      {/* ========================================================================= */}
      {/* 1. ENCABEZADO DE LA SECCIÓN (TEXTO EXACTO Y JERARQUÍA IMPACTANTE)         */}
      {/* ========================================================================= */}
      <div
        className={`max-w-3xl space-y-3 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/90 dark:border-blue-800/70 text-[#1769FF] dark:text-cyan-400 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <CreditCard className="w-3.5 h-3.5 text-[#1769FF] dark:text-cyan-400 animate-pulse" />
          <span>PLANES MAXINEGO</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#14213D] dark:text-white tracking-tight leading-tight">
          Elige el plan ideal para tu negocio
        </h2>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Conoce nuestros planes y ahorra al contratar por 6 o 12 meses.
        </p>

        {/* Píldora comercial destacada con la fórmula de ahorro oficial */}
        <div className="inline-flex flex-wrap items-center gap-2.5 pt-1 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/60 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>6 meses, pagas 5</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
            <span>12 meses, pagas 10</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
            • Precios oficiales en Bolivianos (Bs)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TARJETAS DESTACADAS DE LOS PLANES: MAXINEGO BASIC Y PRO                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        
        {/* ======================================================================= */}
        {/* TARJETA 1: MAXINEGO BASIC                                               */}
        {/* ======================================================================= */}
        <div
          onMouseEnter={() => setHoveredPlan('basic')}
          onMouseLeave={() => setHoveredPlan(null)}
          className={`group rounded-3xl p-6 sm:p-8 sm:py-9 border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
            hoveredPlan === 'basic'
              ? 'bg-white dark:bg-[#0c162c] border-[#1769FF] shadow-[0_20px_45px_rgba(23,105,255,0.18)] dark:shadow-[0_22px_50px_rgba(37,99,235,0.3)] -translate-y-1.5'
              : 'bg-white/95 dark:bg-[#0c152a] border-blue-200/90 dark:border-[#1e2e4f] shadow-md hover:border-blue-400/80 dark:hover:border-blue-500/80'
          } ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          } transition-all duration-700 delay-150 ease-out`}
        >
          {/* Acento superior de luz azul */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 via-[#1769FF] to-cyan-400" />
          
          {/* Halo ambiental dinámico */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/15 dark:bg-blue-600/25 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

          <div className="space-y-6 relative z-10">
            {/* Cabecera y badge de identidad */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-[#1769FF] dark:bg-blue-950/80 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Plan Esencial</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white tracking-tight">
                  MAXINEGO BASIC
                </h3>
              </div>

              {/* Distintivo de identidad */}
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 text-[#1769FF] dark:text-cyan-400 flex items-center justify-center font-black text-lg shadow-2xs group-hover:scale-105 transition-transform">
                B
              </div>
            </div>

            {/* PRECIO PROTAGONISTA ENORME Y NÍTIDO */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-slate-50 dark:from-[#081022] dark:via-[#0c162c] dark:to-[#081022] border border-blue-100 dark:border-blue-900/60 shadow-inner space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Precio mensual regular
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#14213D] dark:text-white tracking-tight">
                  Bs 49
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400">
                  /mes
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                La opción directa para activar la tienda digital de tu comercio.
              </p>
            </div>

            {/* OPCIONES POR PERÍODO Y BENEFICIOS DE AHORRO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                <span>Opciones por período:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold normal-case">
                  Ahorro garantizado
                </span>
              </div>

              {/* Opción 6 meses — Bs 245 */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#070e1d] border border-slate-200/90 dark:border-[#192744] hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between gap-3 shadow-2xs group/opt">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm sm:text-base font-extrabold text-[#14213D] dark:text-white flex items-center gap-2">
                    <span>6 meses — Bs 245</span>
                  </div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>6 meses, pagas 5</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 shadow-2xs shrink-0 group-hover/opt:scale-105 transition-transform">
                  Ahorra Bs 49
                </span>
              </div>

              {/* Opción 12 meses — Bs 490 */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#070e1d] border border-slate-200/90 dark:border-[#192744] hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between gap-3 shadow-2xs group/opt">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm sm:text-base font-extrabold text-[#14213D] dark:text-white flex items-center gap-2">
                    <span>12 meses — Bs 490</span>
                  </div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>12 meses, pagas 10</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 shadow-2xs shrink-0 group-hover/opt:scale-105 transition-transform">
                  Ahorra Bs 98
                </span>
              </div>
            </div>

            {/* BANNER DE AHORRO MÁXIMO DESTACADO */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-emerald-50/60 to-blue-50 dark:from-[#0a1933] dark:via-[#09241e] dark:to-[#0a1933] border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#1769FF] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  %
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 block truncate">
                    Beneficio contratación anual
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    2 meses completamente libres
                  </span>
                </div>
              </div>

              <span className="font-black text-sm sm:text-base text-[#1769FF] dark:text-cyan-300 shrink-0">
                Hasta Bs 98 de ahorro
              </span>
            </div>
          </div>

          {/* ACCIÓN COMERCIAL VINCULADA AL FORMULARIO OFICIAL */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-[#172542] relative z-10">
            <a
              href="#contacto"
              onClick={(e) => handleContactScroll(e, 'basic')}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-[#1769FF] text-white font-black text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer group/btn focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40"
            >
              <span>Consultar MAXINEGO BASIC</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-1" />
            </a>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TARJETA 2: MAXINEGO PRO (MÁXIMO IMPACTO VISUAL Y REFINAMIENTO)          */}
        {/* ======================================================================= */}
        <div
          onMouseEnter={() => setHoveredPlan('pro')}
          onMouseLeave={() => setHoveredPlan(null)}
          className={`group rounded-3xl p-6 sm:p-8 sm:py-9 border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
            hoveredPlan === 'pro'
              ? 'bg-white dark:bg-[#0e162f] border-[#7C3AED] shadow-[0_22px_55px_rgba(124,58,237,0.22)] dark:shadow-[0_25px_65px_rgba(147,51,234,0.35)] -translate-y-1.5 ring-2 ring-[#7C3AED]/30'
              : 'bg-white/95 dark:bg-[#0c152a] border-purple-300/80 dark:border-[#2a2254] shadow-lg hover:border-purple-400 dark:hover:border-purple-500'
          } ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          } transition-all duration-700 delay-300 ease-out`}
        >
          {/* Acento superior de luz violeta e índigo */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-[#7C3AED] to-purple-400" />
          
          {/* Halo ambiental dinámico violeta */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/18 dark:bg-purple-600/30 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

          <div className="space-y-6 relative z-10">
            {/* Cabecera y badge de identidad */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-[#7C3AED] dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400 animate-pulse" />
                  <span>Plan Profesional</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white tracking-tight">
                  MAXINEGO PRO
                </h3>
              </div>

              {/* Distintivo de identidad PRO */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-[#7C3AED] text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                P
              </div>
            </div>

            {/* PRECIO PROTAGONISTA ENORME Y NÍTIDO */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-slate-50 dark:from-[#110f27] dark:via-[#0c162c] dark:to-[#091124] border border-purple-100 dark:border-purple-900/60 shadow-inner space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Precio mensual regular
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#14213D] dark:text-white tracking-tight">
                  Bs 99
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400">
                  /mes
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                La experiencia completa y avanzada para comercios en crecimiento.
              </p>
            </div>

            {/* OPCIONES POR PERÍODO Y BENEFICIOS DE AHORRO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                <span>Opciones por período:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold normal-case">
                  Ahorro garantizado
                </span>
              </div>

              {/* Opción 6 meses — Bs 495 */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#070e1d] border border-slate-200/90 dark:border-[#192744] hover:border-purple-300 dark:hover:border-purple-700 transition-all flex items-center justify-between gap-3 shadow-2xs group/opt">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm sm:text-base font-extrabold text-[#14213D] dark:text-white flex items-center gap-2">
                    <span>6 meses — Bs 495</span>
                  </div>
                  <div className="text-xs font-semibold text-[#7C3AED] dark:text-purple-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                    <span>6 meses, pagas 5</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 shadow-2xs shrink-0 group-hover/opt:scale-105 transition-transform">
                  Ahorra Bs 99
                </span>
              </div>

              {/* Opción 12 meses — Bs 990 */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#070e1d] border border-slate-200/90 dark:border-[#192744] hover:border-purple-300 dark:hover:border-purple-700 transition-all flex items-center justify-between gap-3 shadow-2xs group/opt">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm sm:text-base font-extrabold text-[#14213D] dark:text-white flex items-center gap-2">
                    <span>12 meses — Bs 990</span>
                  </div>
                  <div className="text-xs font-semibold text-[#7C3AED] dark:text-purple-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                    <span>12 meses, pagas 10</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 shadow-2xs shrink-0 group-hover/opt:scale-105 transition-transform">
                  Ahorra Bs 198
                </span>
              </div>
            </div>

            {/* BANNER DE AHORRO MÁXIMO DESTACADO */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-emerald-50/60 to-purple-50 dark:from-[#190f33] dark:via-[#09241e] dark:to-[#190f33] border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  %
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200 block truncate">
                    Beneficio contratación anual
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    2 meses completamente libres
                  </span>
                </div>
              </div>

              <span className="font-black text-sm sm:text-base text-[#7C3AED] dark:text-purple-300 shrink-0">
                Hasta Bs 198 de ahorro
              </span>
            </div>
          </div>

          {/* ACCIÓN COMERCIAL VINCULADA AL FORMULARIO OFICIAL */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-[#172542] relative z-10">
            <a
              href="#contacto"
              onClick={(e) => handleContactScroll(e, 'pro')}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-[#7C3AED] hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600 text-white font-black text-xs sm:text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 active:scale-[0.98] cursor-pointer group/btn focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/40"
            >
              <span>Consultar MAXINEGO PRO</span>
              <ArrowRight className="w-4 h-4 text-purple-200 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-1" />
            </a>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. TABLA COMPARATIVA PREMIUM DE DURACIONES, PRECIOS Y AHORROS             */}
      {/* ========================================================================= */}
      <div
        className={`max-w-5xl mx-auto rounded-3xl bg-white dark:bg-[#0c152a] border border-slate-200 dark:border-[#1c2a47] p-6 sm:p-8 shadow-md space-y-6 transition-all duration-700 delay-400 ease-out relative overflow-hidden ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Cabecera de la tabla */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-[#14213D] dark:text-white tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Comparación de duraciones, precios y ahorros</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Compara de forma directa las opciones de contratación oficial de MAXINEGO.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#121d36] text-slate-600 dark:text-slate-300 self-start sm:self-auto shrink-0 border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tarifas transparentes</span>
          </div>
        </div>

        {/* TABLA CON ESTILO PREMIUM Y SEPARACIÓN ELEGANTE */}
        <div className="overflow-x-auto -mx-2 sm:mx-0 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#091021]">
          <table className="w-full text-left border-collapse min-w-[540px]" aria-label="Tabla comparativa de planes MAXINEGO BASIC y PRO por período de contratación">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider">
                <th scope="col" className="py-4 px-4 sm:px-6 text-slate-700 dark:text-slate-200 w-2/5">
                  Duración
                </th>
                <th scope="col" className="py-4 px-4 sm:px-6 text-[#1769FF] dark:text-cyan-400 w-3/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1769FF]" aria-hidden="true" />
                    <span>MAXINEGO BASIC</span>
                  </div>
                </th>
                <th scope="col" className="py-4 px-4 sm:px-6 text-[#7C3AED] dark:text-purple-300 w-3/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" aria-hidden="true" />
                    <span>MAXINEGO PRO</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
              {/* Fila: 1 mes */}
              <tr className="hover:bg-blue-50/30 dark:hover:bg-[#101b33] transition-colors">
                <td className="py-4 px-4 sm:px-6 font-bold text-[#14213D] dark:text-white">
                  1 mes
                </td>
                <td className="py-4 px-4 sm:px-6 font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  Bs 49
                </td>
                <td className="py-4 px-4 sm:px-6 font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  Bs 99
                </td>
              </tr>

              {/* Fila: 6 meses (pagas 5) */}
              <tr className="hover:bg-blue-50/30 dark:hover:bg-[#101b33] transition-colors">
                <td className="py-4 px-4 sm:px-6">
                  <div className="font-bold text-[#14213D] dark:text-white">
                    6 meses <span className="text-blue-600 dark:text-cyan-400 font-semibold">(pagas 5)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">1 mes gratis incluido</div>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <span className="font-black text-[#1769FF] dark:text-cyan-400 text-sm sm:text-base">
                    Bs 245
                  </span>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <span className="font-black text-[#7C3AED] dark:text-purple-300 text-sm sm:text-base">
                    Bs 495
                  </span>
                </td>
              </tr>

              {/* Fila: 12 meses (pagas 10) */}
              <tr className="hover:bg-blue-50/30 dark:hover:bg-[#101b33] transition-colors">
                <td className="py-4 px-4 sm:px-6">
                  <div className="font-bold text-[#14213D] dark:text-white">
                    12 meses <span className="text-[#7C3AED] dark:text-purple-300 font-semibold">(pagas 10)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">2 meses gratis incluidos</div>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <span className="font-black text-[#1769FF] dark:text-cyan-400 text-sm sm:text-base">
                    Bs 490
                  </span>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <span className="font-black text-[#7C3AED] dark:text-purple-300 text-sm sm:text-base">
                    Bs 990
                  </span>
                </td>
              </tr>

              {/* Fila destacada: Ahorro semestral */}
              <tr className="bg-gradient-to-r from-emerald-50/80 via-emerald-50/50 to-emerald-50/80 dark:from-[#062016] dark:via-[#082b1e] dark:to-[#062016] border-t-2 border-emerald-300/80 dark:border-emerald-700/80 hover:bg-emerald-100/60 dark:hover:bg-[#0a3525] transition-colors">
                <td className="py-3.5 px-4 sm:px-6">
                  <span className="inline-flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Ahorro semestral</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 sm:px-6">
                  <span className="inline-block px-3 py-1 rounded-xl bg-white dark:bg-[#0b1e16] text-emerald-700 dark:text-emerald-300 font-black text-sm border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                    Bs 49
                  </span>
                </td>
                <td className="py-3.5 px-4 sm:px-6">
                  <span className="inline-block px-3 py-1 rounded-xl bg-white dark:bg-[#0b1e16] text-emerald-700 dark:text-emerald-300 font-black text-sm border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                    Bs 99
                  </span>
                </td>
              </tr>

              {/* Fila destacada: Ahorro anual */}
              <tr className="bg-gradient-to-r from-emerald-100/80 via-emerald-50 to-emerald-100/80 dark:from-[#082b1e] dark:via-[#0a3324] dark:to-[#082b1e] border-t border-emerald-200 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-[#0c3d2c] transition-colors">
                <td className="py-3.5 px-4 sm:px-6">
                  <span className="inline-flex items-center gap-1.5 font-black text-emerald-950 dark:text-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ahorro anual</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 sm:px-6">
                  <span className="inline-block px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-xs">
                    Bs 98
                  </span>
                </td>
                <td className="py-3.5 px-4 sm:px-6">
                  <span className="inline-block px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-xs">
                    Bs 198
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* NOTA COMERCIAL INFORMATIVA Y GARANTÍA OFICIAL */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Condiciones comerciales oficiales: 6 meses = 5 cuotas | 12 meses = 10 cuotas.</span>
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Valores oficiales en Bolivianos (Bs)
          </span>
        </div>
      </div>
    </section>
  );
};
