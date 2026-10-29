import React, { useState, useRef, useEffect } from 'react';
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
  Coffee,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Check,
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
import {
  getStorePlan,
  uploadStoreCoverImage,
  saveStoreAppearance,
} from '../../lib/storeAdminService';

interface StoreTemplateGalleryProps {
  store: Store;
  appearance: StoreAppearanceSettings;
  onSelectTemplate: (templateId: string) => void;
  onProAttempt: (featureName: string) => void;
  isSaving?: boolean;
  onUpdateAppearance?: (updated: StoreAppearanceSettings) => void;
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
  onUpdateAppearance,
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

  // Estados de Personalización Exclusiva del Modelo G7 (Café & Boutique Editorial)
  const isChifaStore = Boolean(
    store.slug?.toLowerCase().includes('chifabill') || 
    store.name?.toLowerCase().includes('chifa')
  );
  const defaultG7Tagline = isChifaStore ? 'CHIFA' : 'CAFÉ & BOUTIQUE EDITORIAL';

  const [g7Tagline, setG7Tagline] = useState<string>(() => {
    if (typeof appearance.g7Settings?.tagline === 'string' && appearance.g7Settings.tagline.trim().length > 0) {
      return appearance.g7Settings.tagline;
    }
    return defaultG7Tagline;
  });
  const fallbackG7Title = store.name || 'Mi Comercio';
  const fallbackG7Description = (store.profile as any)?.description || '';

  const [g7Title, setG7Title] = useState<string>(() => {
    return appearance.g7Settings?.title || '';
  });
  const [g7Description, setG7Description] = useState<string>(() => {
    return appearance.g7Settings?.description || '';
  });

  const [isUploadingG7Cover, setIsUploadingG7Cover] = useState(false);
  const [g7SaveSuccess, setG7SaveSuccess] = useState<string | null>(null);
  const [g7SaveError, setG7SaveError] = useState<string | null>(null);
  const g7CoverInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar estado local de tagline, title y description si cambia appearance
  useEffect(() => {
    if (typeof appearance.g7Settings?.tagline === 'string' && appearance.g7Settings.tagline.trim().length > 0) {
      setG7Tagline(appearance.g7Settings.tagline);
    } else {
      setG7Tagline(defaultG7Tagline);
    }
    if (typeof appearance.g7Settings?.title === 'string') {
      setG7Title(appearance.g7Settings.title);
    }
    if (typeof appearance.g7Settings?.description === 'string') {
      setG7Description(appearance.g7Settings.description);
    }
  }, [appearance.g7Settings?.tagline, appearance.g7Settings?.title, appearance.g7Settings?.description, defaultG7Tagline]);

  const handleG7TaglineChange = (val: string) => {
    if (val.length <= 40) {
      setG7Tagline(val);
      onUpdateAppearance?.({
        ...appearance,
        g7Settings: {
          ...(appearance.g7Settings || {}),
          tagline: val,
          title: g7Title.trim() || undefined,
          description: g7Description.trim() || undefined,
        },
      });
    }
  };

  const handleApplyG7Suggestion = (sug: string) => {
    setG7Tagline(sug);
    onUpdateAppearance?.({
      ...appearance,
      g7Settings: {
        ...(appearance.g7Settings || {}),
        tagline: sug,
        title: g7Title.trim() || undefined,
        description: g7Description.trim() || undefined,
      },
    });
  };

  const handleG7TitleChange = (val: string) => {
    if (val.length <= 80) {
      setG7Title(val);
      onUpdateAppearance?.({
        ...appearance,
        g7Settings: {
          ...(appearance.g7Settings || {}),
          tagline: g7Tagline,
          title: val,
          description: g7Description.trim() || undefined,
        },
      });
    }
  };

  const handleG7DescriptionChange = (val: string) => {
    if (val.length <= 240) {
      setG7Description(val);
      onUpdateAppearance?.({
        ...appearance,
        g7Settings: {
          ...(appearance.g7Settings || {}),
          tagline: g7Tagline,
          title: g7Title.trim() || undefined,
          description: val,
        },
      });
    }
  };

  const handleG7CoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!isPro) {
      onProAttempt('Personalización de Modelo G7');
      return;
    }

    setIsUploadingG7Cover(true);
    setG7SaveError(null);
    setG7SaveSuccess(null);

    try {
      const res = await uploadStoreCoverImage(store.id, file);
      if (res.success && res.publicUrl) {
        const updatedSettings = {
          ...(appearance.g7Settings || {}),
          tagline: g7Tagline.trim() || defaultG7Tagline,
          title: g7Title.trim() || undefined,
          description: g7Description.trim() || undefined,
          coverImageUrl: res.publicUrl,
        };
        const updatedAppearance = {
          ...appearance,
          g7Settings: updatedSettings,
        };
        onUpdateAppearance?.(updatedAppearance);
        setG7SaveSuccess('Fotografía de portada actualizada con éxito.');
        setTimeout(() => setG7SaveSuccess(null), 4000);
      } else {
        setG7SaveError(res.error || 'No se pudo subir la fotografía.');
      }
    } catch (err: any) {
      setG7SaveError(err?.message || 'Error inesperado al subir fotografía.');
    } finally {
      setIsUploadingG7Cover(false);
    }
  };

  const handleRemoveG7Cover = () => {
    const updatedSettings = {
      ...(appearance.g7Settings || {}),
      tagline: g7Tagline.trim() || defaultG7Tagline,
      title: g7Title.trim() || undefined,
      description: g7Description.trim() || undefined,
      coverImageUrl: undefined,
    };
    const updatedAppearance = {
      ...appearance,
      g7Settings: updatedSettings,
    };
    onUpdateAppearance?.(updatedAppearance);
    setG7SaveSuccess('Fotografía eliminada. Se usará el fondo cálido oficial por defecto.');
    setTimeout(() => setG7SaveSuccess(null), 3500);
  };

  const handleSaveG7Settings = async () => {
    if (!isPro) {
      onProAttempt('Personalización de Modelo G7');
      return;
    }

    setG7SaveError(null);
    setG7SaveSuccess(null);

    const finalTagline = g7Tagline.trim() || defaultG7Tagline;
    const updatedSettings = {
      ...(appearance.g7Settings || {}),
      tagline: finalTagline,
      title: g7Title.trim() || undefined,
      description: g7Description.trim() || undefined,
      coverImageUrl: appearance.g7Settings?.coverImageUrl,
    };
    const updatedAppearance = {
      ...appearance,
      g7Settings: updatedSettings,
    };

    try {
      const res = await saveStoreAppearance(store.id, updatedAppearance);
      if (res.success) {
        onUpdateAppearance?.(updatedAppearance);
        setG7SaveSuccess('Personalización del Modelo G7 guardada con éxito.');
        setTimeout(() => setG7SaveSuccess(null), 4000);
      } else {
        setG7SaveError(res.error || 'No se pudieron guardar los ajustes de G7.');
      }
    } catch (err: any) {
      setG7SaveError(err?.message || 'Error al guardar la personalización.');
    }
  };

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
                  <div className="flex-1 flex items-center gap-1.5">
                    <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold cursor-default">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Seleccionado</span>
                    </span>
                    {template.id === 'g7' && (
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('panel-personalizacion-g7');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-2.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 text-xs font-serif font-bold transition cursor-pointer"
                        title="Personalizar elementos de G7"
                      >
                        Personalizar ↓
                      </button>
                    )}
                  </div>
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

      {/* PANEL DE PERSONALIZACIÓN EXCLUSIVA DE MODELO G7 (ELEMENTOS EDITABLES EN G7) */}
      {activeTemplateId === 'g7' && (
        <div
          id="panel-personalizacion-g7"
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FAF5EE] via-[#F8EFE4] to-[#F1E4D3] dark:from-[#1D1714] dark:via-[#261E1A] dark:to-[#171210] border-2 border-amber-300/80 dark:border-amber-700/60 shadow-lg space-y-6 text-stone-900 dark:text-[#FAF5EE]"
        >
          {/* Header del Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/80 dark:border-amber-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#B45309] text-white flex items-center justify-center shadow-sm shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-serif font-bold text-amber-950 dark:text-[#FAF5EE] flex items-center gap-2">
                  <span>ELEMENTOS EDITABLES EN G7</span>
                </h4>
                <p className="text-xs font-serif text-amber-900/80 dark:text-stone-300">
                  G7 — Café & Boutique Editorial • Exclusivo Plan PRO • Personalizable por cada comercio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-serif font-bold px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700 uppercase tracking-wider">
                Modelo G7 Activo
              </span>
            </div>
          </div>

          {/* Mensajes de Éxito o Error */}
          {g7SaveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{g7SaveSuccess}</span>
            </div>
          )}

          {g7SaveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 dark:bg-rose-950/60 dark:border-rose-500/40 dark:text-rose-300 text-xs flex items-center gap-2 shadow-2xs">
              <Info className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-medium">{g7SaveError}</span>
            </div>
          )}

          {/* Grilla con los 5 bloques oficiales de personalización de G7 */}
          <div className="space-y-5">
            {/* Fila Superior: Bloques 1, 2 y 3 (Textos y Propuesta de Valor) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Inscripción comercial superior (editable) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-amber-200/90 dark:border-stone-800 space-y-3.5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-serif font-bold text-amber-950 dark:text-[#FAF5EE] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 flex items-center justify-center text-[10px] font-bold">1</span>
                      <span>Inscripción superior (editable)</span>
                    </h5>
                    <span className="text-[11px] font-mono font-semibold text-amber-900/70 dark:text-amber-300">
                      {g7Tagline.length}/40
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Inscripción en píldora superior
                    </label>
                    <input
                      type="text"
                      maxLength={40}
                      value={g7Tagline}
                      onChange={(e) => handleG7TaglineChange(e.target.value)}
                      placeholder={defaultG7Tagline}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-stone-700 bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-white text-xs font-serif font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      Texto breve sobre el título. Se conserva independiente y no altera el nombre del comercio.
                    </p>
                  </div>

                  {/* Sugerencias rápidas */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-serif font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                      Ejemplos sugeridos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ...(isChifaStore ? ['CHIFA'] : []),
                        'CAFÉ & BOUTIQUE EDITORIAL',
                        'RESTAURANTE BOUTIQUE',
                        'SABORES DE CASA',
                        'COCINA ARTESANAL',
                        'PASTELERÍA FINA',
                        'FUSIÓN GASTRONÓMICA',
                        'TU RINCÓN FAVORITO',
                      ].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleApplyG7Suggestion(sug)}
                          className={`text-[10px] font-serif px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            g7Tagline === sug
                              ? 'bg-amber-600 text-white border-amber-600 font-bold'
                              : 'bg-amber-50 text-amber-950 border-amber-200 hover:border-amber-400 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700'
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Título principal de la portada (editable) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-amber-200/90 dark:border-stone-800 space-y-3.5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-serif font-bold text-amber-950 dark:text-[#FAF5EE] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 flex items-center justify-center text-[10px] font-bold">2</span>
                      <span>Título principal de la portada</span>
                    </h5>
                    <span className="text-[11px] font-mono font-semibold text-amber-900/70 dark:text-amber-300">
                      {g7Title.length}/80
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Encabezado protagonista
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={g7Title}
                      onChange={(e) => handleG7TitleChange(e.target.value)}
                      placeholder={fallbackG7Title}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-stone-700 bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-white text-xs font-serif font-bold tracking-normal focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                    <div className="mt-2 p-2 rounded-xl bg-amber-50/70 dark:bg-stone-950/60 border border-amber-200/60 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                      <p className="font-serif leading-relaxed">
                        <strong className="text-amber-950 dark:text-amber-200">Fallback automático:</strong> Si se deja vacío, se mostrará siempre el nombre real de tu comercio (<span className="font-semibold text-amber-900 dark:text-amber-300">{fallbackG7Title}</span>).
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 italic">
                        Nunca se impondrán títulos fijos de cafetería a tu negocio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Descripción comercial de la portada (editable) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-amber-200/90 dark:border-stone-800 space-y-3.5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-serif font-bold text-amber-950 dark:text-[#FAF5EE] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 flex items-center justify-center text-[10px] font-bold">3</span>
                      <span>Descripción comercial de portada</span>
                    </h5>
                    <span className="text-[11px] font-mono font-semibold text-amber-900/70 dark:text-amber-300">
                      {g7Description.length}/240
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Texto descriptivo o propuesta gastronómica
                    </label>
                    <textarea
                      rows={3}
                      maxLength={240}
                      value={g7Description}
                      onChange={(e) => handleG7DescriptionChange(e.target.value)}
                      placeholder={fallbackG7Description || 'Descripción oficial de tu negocio (o vacía sin inventar frases)'}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-stone-700 bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-white text-xs font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs resize-none"
                    />
                    <div className="mt-2 p-2 rounded-xl bg-amber-50/70 dark:bg-stone-950/60 border border-amber-200/60 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                      <p className="font-serif leading-relaxed">
                        <strong className="text-amber-950 dark:text-amber-200">Fallback automático:</strong> Si se deja vacía, se usará la descripción del perfil de tu tienda. Si no tienes descripción, se omitirá limpiamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila Inferior: Bloques 4 y 5 (Fotografía de Portada y Categorías Visuales) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* 4. Fotografía de portada (editable) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-amber-200/90 dark:border-stone-800 space-y-3.5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-serif font-bold text-amber-950 dark:text-[#FAF5EE] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 flex items-center justify-center text-[10px] font-bold">4</span>
                      <span>Fotografía de portada (editable)</span>
                    </h5>
                  </div>

                  {/* Vista previa de la foto de portada actual */}
                  <div className="relative h-32 rounded-xl overflow-hidden border border-amber-200 dark:border-stone-700 bg-stone-900 shadow-2xs">
                    {appearance.g7Settings?.coverImageUrl ? (
                      <img
                        src={appearance.g7Settings.coverImageUrl}
                        alt="Portada de mi tienda G7"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#2D1A12] via-[#3E2419] to-[#1E110B] flex flex-col items-center justify-center text-amber-200/70 p-2 text-center">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-70" />
                        <span className="text-[10px] font-serif">Fondo cálido oficial por defecto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-2.5 text-white">
                      <span className="text-[9px] uppercase tracking-widest text-amber-300 font-serif font-bold">
                        {g7Tagline || defaultG7Tagline}
                      </span>
                      <span className="text-xs font-serif font-bold truncate">
                        {g7Title || fallbackG7Title}
                      </span>
                    </div>
                  </div>

                  {/* Acciones de carga / eliminación */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={g7CoverInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleG7CoverUpload}
                    />
                    <button
                      type="button"
                      onClick={() => g7CoverInputRef.current?.click()}
                      disabled={isUploadingG7Cover}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#B45309] hover:bg-[#92400e] text-white font-serif text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
                    >
                      {isUploadingG7Cover ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{appearance.g7Settings?.coverImageUrl ? 'Cambiar fotografía' : 'Subir fotografía'}</span>
                        </>
                      )}
                    </button>

                    {appearance.g7Settings?.coverImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveG7Cover}
                        className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-rose-50 text-stone-600 hover:text-rose-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Quitar foto y usar degradado oficial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Lista de especificaciones */}
                  <ul className="space-y-1 text-[11px] text-stone-600 dark:text-stone-400 font-serif pt-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Imagen representativa real de tu negocio o platos insignia.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Se muestra detrás del título y la descripción comercial.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Formato recomendado: horizontal (16:9 o 4:3). Se adapta a móvil y PC.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 5. Categorías visuales (automáticas) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-amber-200/90 dark:border-stone-800 space-y-3.5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-serif font-bold text-amber-950 dark:text-[#FAF5EE] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 flex items-center justify-center text-[10px] font-bold">5</span>
                      <span>Categorías visuales (automáticas)</span>
                    </h5>
                  </div>

                  {/* Previsualización de los recuadros fotográficos */}
                  <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-stone-950 border border-amber-200/60 dark:border-stone-800">
                    <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1">
                      {(isChifaStore ? [
                        { name: 'Cena', icon: '🥢' },
                        { name: 'Desayunos', icon: '🥟' },
                        { name: 'Postres', icon: '🍰' },
                        { name: 'Bebidas', icon: '🥤' },
                      ] : [
                        { name: 'Especialidades', icon: '🍲' },
                        { name: 'Platos', icon: '🍽️' },
                        { name: 'Postres', icon: '🍰' },
                        { name: 'Bebidas', icon: '🥤' },
                      ]).map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-stone-800 border-2 border-amber-300 dark:border-stone-700 flex items-center justify-center text-lg shadow-2xs">
                            {item.icon}
                          </div>
                          <span className="text-[10px] font-serif font-medium text-stone-700 dark:text-stone-300 mt-1">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lista de especificaciones */}
                  <ul className="space-y-1 text-[11px] text-stone-600 dark:text-stone-400 font-serif pt-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Se nutre automáticamente de las categorías y platos reales de tu tienda.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Prioriza la foto de cada categoría o la imagen del primer plato asignado.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Sin sesgo cafetero: si no hay foto, muestra cubiertos e iconos gastronómicos neutros.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Al pulsar un recuadro en la tienda pública, filtra el catálogo al instante.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Guardado */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-amber-200/80 dark:border-amber-900/40">
            <p className="text-xs font-serif text-stone-600 dark:text-stone-400">
              Los cambios se reflejarán inmediatamente en tu tienda pública y se conservan de forma permanente.
            </p>
            <button
              type="button"
              onClick={handleSaveG7Settings}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#B45309] hover:bg-[#92400e] text-white font-serif font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Personalización G7</span>
            </button>
          </div>
        </div>
      )}

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
                    <div className="space-y-3">
                      {/* Portada Fotográfica Editorial en Previsualización */}
                      <div className="relative rounded-2xl overflow-hidden min-h-[190px] sm:min-h-[220px] flex flex-col justify-end p-4 sm:p-5 border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
                        {appearance.g7Settings?.coverImageUrl ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${appearance.g7Settings.coverImageUrl})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#2D1A12] via-[#3E2419] to-[#1E110B]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

                        <div className="relative z-10 space-y-2 text-white">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-950 border border-amber-300 text-[9px] font-serif font-bold uppercase tracking-widest shadow-2xs">
                            <Sparkles className="w-3 h-3 text-amber-800" />
                            <span>{appearance.g7Settings?.tagline || g7Tagline || defaultG7Tagline}</span>
                          </div>
                          <h5 className="font-serif font-bold text-base sm:text-lg leading-tight text-white">
                            {appearance.g7Settings?.title || g7Title || fallbackG7Title}
                          </h5>
                          {(appearance.g7Settings?.description || g7Description || fallbackG7Description) ? (
                            <p className="font-serif text-[11px] text-stone-200 leading-snug line-clamp-2 max-w-sm">
                              {appearance.g7Settings?.description || g7Description || fallbackG7Description}
                            </p>
                          ) : null}
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B45309] text-white font-serif font-bold text-[10px] shadow-xs">
                              Ver nuestro menú →
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recuadros fotográficos de categorías en Previsualización */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                          Explorar por categoría
                        </span>
                        <div className="flex gap-2.5 overflow-x-auto py-1">
                          {(isChifaStore ? [
                            { name: 'Cena', icon: '🥢' },
                            { name: 'Desayunos', icon: '🥟' },
                            { name: 'Postres', icon: '🍰' },
                            { name: 'Bebidas', icon: '🥤' },
                          ] : [
                            { name: 'Especialidades', icon: '🍲' },
                            { name: 'Platos', icon: '🍽️' },
                            { name: 'Postres', icon: '🍰' },
                            { name: 'Bebidas', icon: '🥤' },
                          ]).map((cat, i) => (
                            <div key={i} className="flex flex-col items-center shrink-0">
                              <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 flex items-center justify-center text-lg shadow-2xs">
                                {cat.icon}
                              </div>
                              <span className="text-[10px] font-serif font-semibold text-stone-700 dark:text-stone-300 mt-1">
                                {cat.name}
                              </span>
                            </div>
                          ))}
                        </div>
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
