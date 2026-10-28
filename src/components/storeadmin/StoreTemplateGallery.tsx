import React, { useState } from 'react';
import {
  Layout,
  CheckCircle2,
  Lock,
  Eye,
  Sparkles,
  Smartphone,
  Monitor,
  X,
  ArrowRight,
  ShieldCheck,
  Store as StoreIcon,
  ShoppingBag,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Store, StoreAppearanceSettings, Product, StoreProfileSettings } from '../../types';
import {
  SpecialTemplateDefinition,
  SpecialTemplateCode,
  getIndustryFromStore,
  getIndustryTemplates,
  isTemplateAllowedForPlan,
  getTemplateDefinition,
  SPECIAL_TEMPLATES,
  OFFICIAL_FREE_TEMPLATE_ID,
  getTemplateVisualClasses,
} from '../publicStore/storeTemplateSystem';
import { getStorePlan } from '../../lib/storeAdminService';

interface StoreTemplateGalleryProps {
  store: Store;
  appearance: StoreAppearanceSettings;
  onSelectTemplate: (templateId: string) => void;
  onProAttempt: (featureName: string) => void;
  isSaving?: boolean;
}

/**
 * Diagrama visual representativo de la composición del modelo
 */
const TemplateCompositionDiagram: React.FC<{ template: SpecialTemplateDefinition; primaryColor: string }> = ({
  template,
  primaryColor,
}) => {
  const { id } = template;

  return (
    <div className="w-full h-36 rounded-xl bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-2.5 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Mini Header Representativo */}
      <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {template.code[0]}
          </div>
          <div className="h-1.5 w-12 rounded bg-stone-300 dark:bg-slate-700" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700">
            {template.code}
          </span>
        </div>
      </div>

      {/* Mini Composición de Contenido según el modelo */}
      <div className="flex-1 my-1 flex items-center justify-center">
        {/* Gastronomía */}
        {id === 'g1' && (
          <div className="w-full space-y-1">
            <div className="flex gap-1">
              <div className="h-1.5 w-8 rounded-full bg-amber-500/80" />
              <div className="h-1.5 w-8 rounded-full bg-stone-200 dark:bg-slate-800" />
              <div className="h-1.5 w-8 rounded-full bg-stone-200 dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="p-1 rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/40 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="h-1 w-full bg-stone-300 dark:bg-slate-700 rounded" />
                  <div className="h-1 w-2/3 bg-amber-500 rounded" />
                </div>
              </div>
              <div className="p-1 rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/40 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="h-1 w-full bg-stone-300 dark:bg-slate-700 rounded" />
                  <div className="h-1 w-2/3 bg-amber-500 rounded" />
                </div>
              </div>
            </div>
          </div>
        )}

        {id === 'g2' && (
          <div className="w-full grid grid-cols-2 gap-1.5">
            <div className="rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 overflow-hidden">
              <div className="h-8 bg-amber-100 dark:bg-amber-950/60 relative flex items-center justify-center">
                <span className="text-[8px] text-amber-700 font-bold">16:9 Plato</span>
              </div>
              <div className="p-1 space-y-0.5">
                <div className="h-1 w-full bg-stone-300 dark:bg-slate-700 rounded" />
                <div className="h-1 w-1/2 bg-amber-600 rounded" />
              </div>
            </div>
            <div className="rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 overflow-hidden">
              <div className="h-8 bg-amber-100 dark:bg-amber-950/60 relative flex items-center justify-center">
                <span className="text-[8px] text-amber-700 font-bold">16:9 Plato</span>
              </div>
              <div className="p-1 space-y-0.5">
                <div className="h-1 w-full bg-stone-300 dark:bg-slate-700 rounded" />
                <div className="h-1 w-1/2 bg-amber-600 rounded" />
              </div>
            </div>
          </div>
        )}

        {id === 'g3' && (
          <div className="w-full p-1.5 rounded-xl bg-amber-50/60 dark:bg-stone-950 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-2">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 font-serif text-[10px] italic">
              Café
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-16 bg-amber-900/60 dark:bg-amber-200/60 rounded font-serif" />
              <div className="h-1 w-20 bg-stone-300 dark:bg-slate-700 rounded" />
              <div className="h-1 w-10 bg-amber-600 rounded" />
            </div>
          </div>
        )}

        {id === 'g4' && (
          <div className="w-full p-1.5 rounded-lg border-2 border-amber-500/60 bg-white dark:bg-slate-900 flex flex-col justify-center items-center text-center">
            <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">★ Especialidad del Chef ★</span>
            <div className="h-1.5 w-24 bg-stone-700 dark:bg-stone-300 rounded mt-1" />
            <div className="h-1 w-14 bg-amber-500 rounded mt-0.5" />
          </div>
        )}

        {id === 'g5' && (
          <div className="w-full space-y-1">
            <div className="p-1 rounded-lg bg-orange-950 text-white flex items-center justify-between">
              <span className="text-[8px] font-black tracking-tight text-orange-400">PEDIDO EXPRESS</span>
              <span className="text-[7px] px-1 py-0.2 rounded bg-orange-600 font-bold">Rápido</span>
            </div>
            <div className="flex gap-1 justify-center py-0.5">
              {['🍣', '🥟', '🥗', '🥤'].map((ic, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-orange-100 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 flex items-center justify-center text-[8px]">
                  {ic}
                </div>
              ))}
            </div>
            <div className="p-1 rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-orange-200 dark:bg-orange-900/60" />
                <div className="h-1 w-14 bg-stone-700 dark:bg-stone-300 rounded" />
              </div>
              <span className="w-3.5 h-3.5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[8px] font-bold">+</span>
            </div>
          </div>
        )}

        {id === 'g6' && (
          <div className="w-full space-y-1">
            <div className="p-1 rounded-lg bg-stone-900 text-white flex items-center justify-between">
              <span className="text-[8px] font-bold text-emerald-400">NUESTRO MENÚ</span>
              <span className="text-[7px] text-stone-400">Carta Digital</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[1, 2].map((n) => (
                <div key={n} className="rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 p-1">
                  <div className="h-6 rounded bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[7px] font-bold text-emerald-800">
                    Plato {n}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[7px] font-bold">Bs 35</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[7px]">+</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {id === 'g7' && (
          <div className="w-full p-1.5 rounded-xl bg-[#FAF5EE] dark:bg-[#1A1614] border border-amber-200/80 dark:border-amber-900/40 space-y-1">
            <div className="flex items-center justify-between text-amber-950 dark:text-amber-100">
              <span className="font-serif italic text-[9px] font-bold">Más que café</span>
              <span className="text-[7px] px-1 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-serif">Boutique</span>
            </div>
            <div className="flex gap-1 justify-center py-0.5">
              {['☕', '🍰', '🥐', '🥤'].map((ic, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-amber-100 dark:bg-stone-800 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-[8px]">
                  {ic}
                </div>
              ))}
            </div>
            <div className="h-1 w-20 bg-amber-900/60 dark:bg-amber-200/60 rounded mx-auto" />
          </div>
        )}

        {id === 'g8' && (
          <div className="w-full p-1.5 rounded-xl bg-[#0B0C0E] text-white border border-amber-500/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-serif text-[8px] font-bold text-amber-300 tracking-wider">PLATOS ESPECIALES</span>
              <span className="text-[6px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">Gourmet</span>
            </div>
            <div className="h-7 rounded bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-[7px] font-serif text-amber-200">
              ★ Especialidad del Chef ★
            </div>
            <div className="flex items-center justify-between text-[7px] text-stone-300 px-0.5">
              <span>Cocina de autor</span>
              <span className="text-amber-400 font-bold">Bs 45</span>
            </div>
          </div>
        )}

        {/* Moda y Calzado */}
        {id === 'm2' && (
          <div className="w-full grid grid-cols-3 gap-1">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 overflow-hidden">
                <div className="h-9 bg-stone-200 dark:bg-slate-700 flex items-center justify-center text-[7px] text-stone-500 font-mono">
                  3:4
                </div>
                <div className="p-0.5">
                  <div className="h-1 w-full bg-stone-300 dark:bg-slate-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {id === 'm4' && (
          <div className="w-full grid grid-cols-2 gap-1.5">
            {[1, 2].map((n) => (
              <div key={n} className="p-1 rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex flex-col items-center">
                <div className="h-6 w-full bg-stone-100 dark:bg-slate-700 rounded flex items-center justify-center text-[8px] text-stone-400">
                  👟 Calzado
                </div>
                <div className="h-1 w-12 bg-stone-400 rounded mt-1" />
                <div className="h-1 w-6 bg-stone-800 dark:bg-stone-200 rounded mt-0.5" />
              </div>
            ))}
          </div>
        )}

        {id === 'm1' && (
          <div className="w-full p-2 bg-white dark:bg-black border border-stone-200 dark:border-stone-800 text-center flex flex-col items-center justify-center">
            <span className="font-serif italic text-[11px] text-stone-800 dark:text-stone-200 tracking-widest uppercase">
              Vogue Look
            </span>
            <span className="text-[7px] text-stone-400 uppercase tracking-widest mt-0.5">Boutique Editorial</span>
          </div>
        )}

        {id === 'm3' && (
          <div className="w-full p-1.5 bg-black text-white border-2 border-amber-400 flex flex-col justify-center">
            <span className="font-black text-[10px] tracking-tighter uppercase text-amber-400">STREETWEAR</span>
            <span className="text-[7px] font-mono text-stone-400">URBAN DROP 2026 // DENSE</span>
          </div>
        )}

        {/* Servicios */}
        {id === 's1' && (
          <div className="w-full space-y-1">
            {[1, 2].map((n) => (
              <div key={n} className="p-1 rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="h-1 w-16 bg-stone-700 dark:bg-stone-300 rounded" />
                  <div className="h-0.5 w-10 bg-emerald-600 rounded" />
                </div>
                <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Agenda</span>
              </div>
            ))}
          </div>
        )}

        {id === 's4' && (
          <div className="w-full p-1.5 rounded bg-blue-50/50 dark:bg-slate-900 border border-blue-200 dark:border-blue-900 space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-bold text-blue-700">🔧 Servicio Técnico</span>
              <span className="text-[7px] px-1 rounded bg-blue-100 text-blue-800 font-mono">Garantizado</span>
            </div>
            <div className="h-1 w-24 bg-stone-300 dark:bg-slate-700 rounded" />
          </div>
        )}

        {id === 's2' && (
          <div className="w-full p-2 rounded-2xl bg-rose-50/70 dark:bg-stone-900 border border-rose-200/80 text-center flex flex-col items-center">
            <span className="text-[9px] font-serif font-medium text-rose-800 dark:text-rose-200">Studio & Spa</span>
            <div className="h-0.5 w-12 bg-rose-300 rounded mt-0.5" />
            <span className="text-[7px] text-rose-600/80 mt-0.5">Belleza Visual</span>
          </div>
        )}

        {id === 's3' && (
          <div className="w-full p-1.5 bg-stone-950 text-white rounded border border-amber-600/60 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold uppercase text-amber-500">💈 Barber Shop</span>
              <div className="text-[7px] text-stone-400">Corte & Navaja Clásica</div>
            </div>
            <span className="text-[8px] font-bold text-amber-400">Bs 40</span>
          </div>
        )}

        {/* Billar */}
        {id === 'b2' && (
          <div className="w-full p-1.5 rounded bg-emerald-950 text-white border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[9px]">🎱</span>
              <span className="text-[8px] font-bold text-emerald-300 uppercase">Snooker Sport</span>
            </div>
            <span className="text-[7px] bg-emerald-800 px-1 py-0.5 rounded text-white font-mono">Mesas</span>
          </div>
        )}

        {id === 'b3' && (
          <div className="w-full p-1.5 rounded bg-indigo-950 text-white border-2 border-indigo-500/60 flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase text-indigo-300">CLUB COMPETITIVO</span>
            <span className="text-[7px] text-stone-400">Torneo & Sala de Juego</span>
          </div>
        )}

        {id === 'b1' && (
          <div className="w-full p-2 rounded-xl bg-black text-amber-300 border border-amber-500/50 flex flex-col items-center justify-center shadow-inner">
            <span className="font-serif text-[10px] tracking-widest uppercase text-amber-400">BILLAR LOUNGE VIP</span>
            <span className="text-[7px] text-amber-600 uppercase">Club Premium</span>
          </div>
        )}

        {id === 'b4' && (
          <div className="w-full p-1.5 rounded-lg bg-slate-950 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] flex items-center justify-between">
            <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">NEON GAMING</span>
            <span className="text-[7px] px-1 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">ARCADE</span>
          </div>
        )}

        {/* Comercio General */}
        {id === 'c1' && (
          <div className="w-full grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-1 rounded bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-center">
                <div className="w-full h-3 bg-blue-50 dark:bg-blue-950/40 rounded" />
                <div className="h-1 w-full bg-stone-300 dark:bg-slate-600 rounded mt-1" />
              </div>
            ))}
          </div>
        )}

        {id === 'c3' && (
          <div className="w-full space-y-1">
            <div className="flex gap-1">
              <div className="h-1.5 w-6 rounded bg-stone-400" />
              <div className="h-1.5 w-6 rounded bg-stone-300" />
              <div className="h-1.5 w-6 rounded bg-stone-300" />
              <div className="h-1.5 w-6 rounded bg-stone-300" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-5 bg-white dark:bg-slate-800 rounded border border-stone-200 dark:border-slate-700 p-0.5">
                  <div className="h-1 w-full bg-stone-300 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {id === 'c2' && (
          <div className="w-full p-1.5 rounded bg-indigo-950 text-white border border-indigo-500/50 flex flex-col justify-center">
            <span className="text-[8px] font-bold text-indigo-400 uppercase">⚡ Tech Promo</span>
            <span className="text-[7px] text-slate-300">Electrónica & Gadgets</span>
          </div>
        )}

        {id === 'c4' && (
          <div className="w-full p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 text-center flex flex-col items-center">
            <span className="font-serif text-[9px] text-stone-800 dark:text-stone-200 italic">Boutique & Regalos</span>
            <span className="text-[7px] text-stone-400 mt-0.5">Productos Curados</span>
          </div>
        )}
      </div>

      {/* Pie con estilo del modelo */}
      <div className="flex items-center justify-between text-[9px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200/60 dark:border-slate-800">
        <span>Aspecto {template.cardAspect}</span>
        <span className="capitalize">{template.density}</span>
      </div>
    </div>
  );
};

export const StoreTemplateGallery: React.FC<StoreTemplateGalleryProps> = ({
  store,
  appearance,
  onSelectTemplate,
  onProAttempt,
  isSaving,
}) => {
  const plan = getStorePlan(store.id);
  const isFree = plan === 'free';
  const isBasic = plan === 'basic';
  const isPro = plan === 'pro';

  const industry = getIndustryFromStore(store);
  const industryTemplates = getIndustryTemplates(industry);

  const activeTemplateId = appearance.templateId || OFFICIAL_FREE_TEMPLATE_ID;
  const activeSpecialTemplate = getTemplateDefinition(activeTemplateId);

  // Modal de Previsualización en Vivo con datos reales
  const [previewTemplate, setPreviewTemplate] = useState<SpecialTemplateDefinition | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'mobile' | 'desktop'>('mobile');

  const handleSelect = (tmplId: string, tmplName: string, requiredTier: 'basic' | 'pro') => {
    if (isFree) {
      onProAttempt(`Modelo ${tmplName} (requiere Plan Basic o Pro)`);
      return;
    }

    if (isBasic && requiredTier === 'pro') {
      onProAttempt(`Modelo ${tmplName} (exclusivo de Plan Pro)`);
      return;
    }

    onSelectTemplate(tmplId);
  };

  const handleResetToFree = () => {
    onSelectTemplate(OFFICIAL_FREE_TEMPLATE_ID);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 space-y-6">
      {/* Encabezado de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#1769FF] dark:text-cyan-400" />
            <span>Modelo de mi tienda</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1769FF] border border-blue-200 dark:bg-blue-950/40 dark:text-cyan-300 dark:border-cyan-800">
              Rubro: {industryTemplates[0]?.industryLabel || 'General'}
            </span>
          </h3>
          <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
            Elige cómo quieres que se vea tu tienda digital.
          </p>
        </div>

        {/* Estado actual */}
        <div className="flex items-center gap-2">
          {activeTemplateId !== OFFICIAL_FREE_TEMPLATE_ID ? (
            <button
              type="button"
              onClick={handleResetToFree}
              className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-slate-700 text-stone-700 dark:text-slate-300 bg-white dark:bg-slate-900 text-xs font-medium hover:bg-stone-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
            >
              Restablecer a Tienda Estándar
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tienda Estándar Activa</span>
            </span>
          )}
        </div>
      </div>

      {/* Explicación amigable según el plan del comercio */}
      {isFree ? (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-200 text-xs flex items-start gap-3 shadow-2xs">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Tu tienda utiliza el diseño oficial aprobado para el Plan FREE.</p>
            <p className="leading-relaxed">
              Puedes previsualizar los modelos preparados para tu rubro a continuación. Para activar cualquiera de ellos en tu tienda pública, actualiza a <strong>Plan Basic</strong> (2 modelos) o <strong>Plan Pro</strong> (los 4 modelos).
            </p>
          </div>
        </div>
      ) : isBasic ? (
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 dark:bg-blue-950/30 dark:border-blue-500/30 dark:text-blue-200 text-xs flex items-center justify-between gap-3 shadow-2xs">
          <span>
            En <strong>Plan Basic</strong> tienes acceso a los <strong>2 modelos base</strong> de {industryTemplates[0]?.industryLabel}. Los 2 modelos adicionales están reservados para <strong>Plan Pro</strong>.
          </span>
          <button
            type="button"
            onClick={() => onProAttempt('Modelos Exclusivos Plan Pro')}
            className="text-[11px] font-bold underline text-blue-800 dark:text-cyan-300 shrink-0 cursor-pointer"
          >
            Actualizar a Pro
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:text-emerald-200 text-xs flex items-center gap-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Plan Pro:</strong> Tienes acceso libre a los <strong>4 modelos especiales</strong> preparados para {industryTemplates[0]?.industryLabel}.
          </span>
        </div>
      )}

      {/* Galería de los 4 modelos de su rubro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {industryTemplates.map((template) => {
          const isCurrentActive = activeTemplateId === template.id;
          const isAllowed = isTemplateAllowedForPlan(template.id, plan, industry);
          const isProOnly = template.tier === 'pro';

          return (
            <div
              key={template.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                isCurrentActive
                  ? 'bg-white dark:bg-slate-900 border-[#1769FF] ring-2 ring-[#1769FF]/20 shadow-sm'
                  : 'bg-white dark:bg-slate-900/80 border-stone-200 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Encabezado de la tarjeta de modelo */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                        {template.code}
                      </span>
                      <h4 className="text-sm font-bold text-[#14213D] dark:text-white">
                        {template.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-1 italic">
                      "{template.tagline}"
                    </p>
                  </div>

                  {/* Insignia de Plan */}
                  {isCurrentActive ? (
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Activo</span>
                    </span>
                  ) : isProOnly ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Exclusivo Pro</span>
                    </span>
                  ) : (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-[#1769FF] border border-blue-200 dark:bg-blue-950/40 dark:text-cyan-300 text-[10px] font-bold">
                      Basic & Pro
                    </span>
                  )}
                </div>

                {/* Diagrama visual representativo */}
                <TemplateCompositionDiagram
                  template={template}
                  primaryColor={appearance.brandPrimaryColor || '#1769FF'}
                />

                {/* Resumen de Composición */}
                <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed pt-1">
                  {template.compositionSummary}
                </p>

                {/* Aspectos visuales clave */}
                <ul className="space-y-1 text-[11px] text-stone-500 dark:text-slate-400">
                  {template.visualHighlights.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-slate-800/80">
                {/* Botón Previsualizar con datos reales */}
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(template)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 hover:bg-stone-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
                  <span>Previsualizar</span>
                </button>

                {/* Botón Seleccionar / Bloqueado */}
                {isCurrentActive ? (
                  <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold cursor-default">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Seleccionado</span>
                  </span>
                ) : isAllowed ? (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSelect(template.id, template.name, template.tier)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <span>Seleccionar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelect(template.id, template.name, template.tier)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  >
                    <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Desbloquear</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE PREVISUALIZACIÓN EN VIVO (Con datos auténticos del comercio) */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Cabecera del Modal de Previsualización */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-stone-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#1769FF] text-white">
                  {previewTemplate.code}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#14213D] dark:text-white flex items-center gap-2">
                    <span>{previewTemplate.name}</span>
                    {previewTemplate.tier === 'pro' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                        Exclusivo Pro
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1769FF] border border-blue-200 dark:bg-blue-950/40 dark:text-cyan-300">
                        Basic & Pro
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-slate-400">
                    Vista demostrativa con los datos reales de {store.name}
                  </p>
                </div>
              </div>

              {/* Controles de vista y cierre */}
              <div className="flex items-center gap-2">
                {/* Selector Móvil / Escritorio */}
                <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-stone-200 dark:bg-slate-800 border border-stone-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      previewViewport === 'mobile'
                        ? 'bg-white dark:bg-slate-900 text-[#14213D] dark:text-white shadow-2xs font-bold'
                        : 'text-stone-600 dark:text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Móvil</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      previewViewport === 'desktop'
                        ? 'bg-white dark:bg-slate-900 text-[#14213D] dark:text-white shadow-2xs font-bold'
                        : 'text-stone-600 dark:text-slate-400'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Escritorio</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenedor del Canvas de Previsualización */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-200/60 dark:bg-slate-950/80 flex justify-center">
              <div
                className={`transition-all duration-300 bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-300 dark:border-stone-800 overflow-hidden flex flex-col ${
                  previewViewport === 'mobile' ? 'w-full max-w-sm min-h-[560px]' : 'w-full max-w-3xl min-h-[560px]'
                }`}
              >
                {/* Barra de simulación de navegador */}
                <div className="px-4 py-2 bg-stone-100 dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-sans font-bold text-stone-700 dark:text-slate-300">
                      maxinego.app/{store.slug}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#1769FF]">
                    {previewTemplate.code} · {previewTemplate.name}
                  </span>
                </div>

                {/* Header Simulado del Modelo */}
                <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-stone-800 space-y-3">
                  <div className="flex items-center gap-3">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-stone-200 dark:border-stone-700 shadow-2xs"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-2xs"
                        style={{ backgroundColor: appearance.brandPrimaryColor || '#1769FF' }}
                      >
                        {store.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4
                        className={`text-base sm:text-lg font-bold text-stone-900 dark:text-white ${
                          previewTemplate.typographyStyle === 'serif-editorial' ? 'font-serif' : ''
                        }`}
                      >
                        {store.name}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Abierto ahora · Modelo {previewTemplate.code}</span>
                      </p>
                    </div>
                  </div>

                  {/* Banners si existen en la tienda */}
                  {appearance.banners && appearance.banners.length > 0 && (
                    <div className="w-full h-24 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 relative">
                      <img
                        src={appearance.banners[0].imageUrl}
                        alt="Banner demostrativo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2">
                        <span className="text-white text-xs font-bold">
                          {appearance.banners[0].title || 'Banner Comercial'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Banners temáticos específicos para G5, G6, G7, G8 según referencias visuales aprobadas */}
                  {previewTemplate.id === 'g5' && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-950 via-stone-900 to-black text-white border border-orange-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">PEDIDO EXPRESS</span>
                          <h5 className="text-sm font-black tracking-tight leading-tight">Tu comida favorita, más rápido</h5>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-orange-600 text-white text-[10px] font-bold shadow-xs">
                          Hacer pedido →
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {['🍣 Rolls', '🥟 Entradas', '🥗 Pokés', '🥤 Bebidas'].map((cat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg bg-white/10 text-white text-[10px] font-bold shrink-0 border border-white/10">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewTemplate.id === 'g6' && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-stone-900 to-slate-950 text-white border border-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">CARTA DIGITAL</span>
                          <h5 className="text-sm font-bold tracking-tight">Tradición y creatividad en cada plato</h5>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                          Ver menú →
                        </span>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto py-1">
                        {['Todos', 'Rolls', 'Makis', 'Entradas', 'Bebidas'].map((cat, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300'}`}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewTemplate.id === 'g7' && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF5EE] to-[#F2E8DC] text-[#2C241E] border border-amber-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-serif uppercase tracking-widest text-amber-800 font-bold">CAFÉ & BOUTIQUE</span>
                          <h5 className="font-serif italic text-sm font-bold leading-tight">Más que café, una experiencia</h5>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-800 text-white text-[10px] font-serif font-bold shadow-xs">
                          Ver selección →
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {['☕ Cafés', '🍰 Postres', '🥐 Sándwiches', '🥤 Bebidas'].map((cat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-white text-amber-900 text-[10px] font-serif font-medium shrink-0 border border-amber-200 shadow-2xs">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewTemplate.id === 'g8' && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0B0C0E] to-[#16181D] text-white border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-serif uppercase tracking-widest text-amber-400 font-bold">ALTA GASTRONOMÍA</span>
                          <h5 className="font-serif text-sm font-bold text-amber-100 leading-tight">Platos que cuentan historias</h5>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-black text-[10px] font-bold shadow-xs">
                          Especialidades →
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {['★ Especialidades', 'Entradas', 'Principales', 'Bebidas'].map((cat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 text-[10px] font-serif font-bold shrink-0 border border-amber-500/30">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insignias de composición de este modelo */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
                      Aspecto: {previewTemplate.cardAspect}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
                      Densidad: {previewTemplate.density}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
                      Estilo: {previewTemplate.badgeStyle}
                    </span>
                  </div>
                </div>

                {/* Catálogo Demostrativo con la Composición del Modelo */}
                <div className="p-4 sm:p-6 space-y-4 flex-1">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-stone-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Muestra de Artículos
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Formato {previewTemplate.code}
                    </span>
                  </div>

                  {/* Grid de simulación de tarjetas */}
                  <div
                    className={
                      previewTemplate.cardAspect === 'horizontal'
                        ? 'grid grid-cols-1 gap-3'
                        : previewViewport === 'mobile'
                        ? 'grid grid-cols-2 gap-3'
                        : 'grid grid-cols-3 gap-4'
                    }
                  >
                    {[
                      { name: 'Artículo Principal', price: 45, category: 'Especial' },
                      { name: 'Opción Comercial', price: 30, category: 'Destacado' },
                      { name: 'Promoción del Día', price: 65, category: 'Sugerencia' },
                    ].map((sample, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition shadow-2xs flex ${
                          previewTemplate.cardAspect === 'horizontal'
                            ? 'flex-row items-center justify-between gap-3'
                            : 'flex-col justify-between gap-2'
                        } ${
                          previewTemplate.id === 'm3'
                            ? 'bg-black text-white border-stone-800'
                            : previewTemplate.id === 'b1'
                            ? 'bg-stone-950 text-amber-200 border-amber-500/30'
                            : previewTemplate.id === 'b4'
                            ? 'bg-slate-950 text-cyan-300 border-cyan-500/40'
                            : previewTemplate.id === 's3'
                            ? 'bg-stone-900 text-white border-amber-600/40'
                            : previewTemplate.id === 'g8'
                            ? 'bg-[#0E1015] text-amber-100 border-amber-500/40'
                            : previewTemplate.id === 'g7'
                            ? 'bg-[#FAF5EE] dark:bg-[#1A1614] text-stone-900 dark:text-stone-100 border-amber-200/90'
                            : previewTemplate.id === 'g6'
                            ? 'bg-white dark:bg-[#0D140F] text-stone-900 dark:text-stone-100 border-emerald-900/20'
                            : previewTemplate.id === 'g5'
                            ? 'bg-white dark:bg-[#181310] text-stone-900 dark:text-stone-100 border-orange-300/40'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                              previewTemplate.id === 'b4'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                : previewTemplate.id === 'b1'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : previewTemplate.id === 'g8'
                                ? 'bg-amber-950/70 text-amber-400 border border-amber-500/40'
                                : previewTemplate.id === 'g7'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200'
                                : previewTemplate.id === 'g6'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                                : previewTemplate.id === 'g5'
                                ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                                : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300'
                            }`}
                          >
                            {previewTemplate.id === 'g5'
                              ? '⚡'
                              : previewTemplate.id === 'g6'
                              ? '🍽️'
                              : previewTemplate.id === 'g7'
                              ? '☕'
                              : previewTemplate.id === 'g8'
                              ? '★'
                              : `#${idx + 1}`}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold leading-tight ${
                                previewTemplate.typographyStyle === 'serif-editorial' ? 'font-serif' : ''
                              }`}
                            >
                              {sample.name}
                            </p>
                            <p className="text-[10px] text-stone-500 dark:text-slate-400">
                              {sample.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-slate-800">
                          <span className="text-xs font-extrabold">Bs {sample.price}</span>
                          <span
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs"
                            style={{
                              backgroundColor:
                                previewTemplate.id === 'g5'
                                  ? '#EA580C'
                                  : previewTemplate.id === 'g6'
                                  ? '#059669'
                                  : previewTemplate.id === 'g7'
                                  ? '#B45309'
                                  : previewTemplate.id === 'g8'
                                  ? '#F59E0B'
                                  : appearance.brandPrimaryColor || '#1769FF',
                              color: previewTemplate.id === 'g8' ? '#000000' : '#FFFFFF',
                            }}
                          >
                            + Agregar
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sello de protección de checkout y Agente Max */}
                <div className="p-3 bg-stone-50 dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 text-[10px] text-stone-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Carrito, pedidos WhatsApp, QR y Agente Max funcionan 100% integrados</span>
                </div>
              </div>
            </div>

            {/* Pie del Modal con Acción de Selección Directa */}
            <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 dark:bg-slate-950">
              <div className="text-xs text-stone-500 dark:text-slate-400 text-center sm:text-left">
                Esta es solo una vista previa. Tu tienda actual no cambiará hasta que confirmes tu elección.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-stone-300 dark:border-slate-700 text-stone-700 dark:text-slate-300 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cerrar
                </button>

                {isTemplateAllowedForPlan(previewTemplate.id, plan, industry) ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(previewTemplate.id);
                      setPreviewTemplate(null);
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Seleccionar este modelo</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onProAttempt(`Modelo ${previewTemplate.name}`);
                      setPreviewTemplate(null);
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Actualizar para usar este modelo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
