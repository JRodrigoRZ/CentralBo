import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  X,
  Sparkles,
  Zap,
  Smartphone,
  Palette,
  Globe,
  SunMoon,
  Tag,
} from 'lucide-react';
import { CENTRALBO_PLANS } from '../../lib/superadminService';
import { PlanBillingCycle } from '../../types';

export const SuperAdminPlans: React.FC = () => {
  const [cycle, setCycle] = useState<PlanBillingCycle>('mensual');

  // Cálculo de importes según ciclo y descuentos aprobados
  const calculatePrice = (monthlyPrice: number) => {
    if (cycle === 'mensual') {
      return {
        pricePerMonth: monthlyPrice,
        totalPeriod: monthlyPrice,
        periodLabel: 'Bs / mes',
        billingText: 'Facturado mensualmente',
        discountBadge: null,
      };
    }
    if (cycle === 'semestral') {
      const discountedMonth = Math.round(monthlyPrice * 0.9 * 100) / 100;
      const total = Math.round(monthlyPrice * 6 * 0.9 * 100) / 100;
      return {
        pricePerMonth: discountedMonth,
        totalPeriod: total,
        periodLabel: 'Bs / mes',
        billingText: `Bs ${total} facturados cada 6 meses`,
        discountBadge: '10% de descuento',
      };
    }
    // anual
    const discountedMonth = Math.round(monthlyPrice * 0.8 * 100) / 100;
    const total = Math.round(monthlyPrice * 12 * 0.8 * 100) / 100;
    return {
      pricePerMonth: discountedMonth,
      totalPeriod: total,
      periodLabel: 'Bs / mes',
      billingText: `Bs ${total} facturados anualmente`,
      discountBadge: '20% de descuento',
    };
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector de Ciclo de Facturación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Planes de CentralBo</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              2 Planes Oficiales
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Estructura de precios definida para comercios: Basic (Bs 49/mes) y Pro (Bs 99/mes).
          </p>
        </div>

        {/* Selector de Modalidad */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setCycle('mensual')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              cycle === 'mensual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setCycle('semestral')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
              cycle === 'semestral'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Semestral</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              -10%
            </span>
          </button>
          <button
            onClick={() => setCycle('anual')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
              cycle === 'anual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Anual</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Grid de los 2 Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan 1: BASIC */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Plan Inicial
                </span>
                <h3 className="text-2xl font-extrabold text-white">Basic</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Esencial
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {CENTRALBO_PLANS[0].description}
            </p>

            {/* Precios */}
            {(() => {
              const pricing = calculatePrice(49);
              return (
                <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                      Bs {pricing.pricePerMonth}
                    </span>
                    <span className="text-xs text-slate-400">/ mes</span>
                    {pricing.discountBadge && (
                      <span className="ml-auto text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {pricing.discountBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {pricing.billingText}
                  </span>
                </div>
              );
            })()}

            {/* Lista de características y restricciones */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Incluye:
                </span>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Funciones básicas de catálogo y administración</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>PWA instalable en móviles y PC</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Tema claro / oscuro integrado</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Acceso a tienda pública por slug</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Restricciones del Plan Basic:
                </span>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-500">
                    <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span>Sin personalización avanzada</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500">
                    <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span>Sin colores personalizados de marca</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500">
                    <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span>Sin dominio propio</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tarifa oficial aprobada</span>
            <span className="font-mono text-white">Bs 49 / mes base</span>
          </div>
        </div>

        {/* Plan 2: PRO */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Plan Completo
                </span>
                <h3 className="text-2xl font-extrabold text-white">Pro</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Recomendado
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {CENTRALBO_PLANS[1].description}
            </p>

            {/* Precios */}
            {(() => {
              const pricing = calculatePrice(99);
              return (
                <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-indigo-300 font-mono">
                      Bs {pricing.pricePerMonth}
                    </span>
                    <span className="text-xs text-slate-400">/ mes</span>
                    {pricing.discountBadge && (
                      <span className="ml-auto text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {pricing.discountBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {pricing.billingText}
                  </span>
                </div>
              );
            })()}

            {/* Lista de características del Plan Pro */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                  Todo lo incluido en Basic, más:
                </span>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-white">Personalización avanzada</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-white">Colores de marca y estilo corporativo</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-white">Soporte para dominio propio</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Mayor personalización visual en catálogo</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>PWA instalable (Web App móvil y escritorio)</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Tema claro / oscuro integrado</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-500/20 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tarifa oficial aprobada</span>
            <span className="font-mono text-indigo-300">Bs 99 / mes base</span>
          </div>
        </div>
      </div>

      {/* Tabla comparativa de descuentos aprobados */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-indigo-400" />
          <span>Esquema de Descuentos Aprobado</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Modalidad Mensual</span>
            <span className="font-bold text-white block mt-1">Sin descuento</span>
            <span className="text-[10px] text-slate-500">Basic: Bs 49 | Pro: Bs 99</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Modalidad Semestral (6 meses)</span>
            <span className="font-bold text-emerald-400 block mt-1">10% de Descuento</span>
            <span className="text-[10px] text-slate-400">Basic: Bs 264.60 | Pro: Bs 534.60</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Modalidad Anual (12 meses)</span>
            <span className="font-bold text-emerald-400 block mt-1">20% de Descuento</span>
            <span className="text-[10px] text-slate-400">Basic: Bs 470.40 | Pro: Bs 950.40</span>
          </div>
        </div>
      </div>
    </div>
  );
};
