import React from 'react';
import { ArrowRight, Sparkles, Zap, Utensils, Coffee, Crown, Flame } from 'lucide-react';
import { PublicStoreTemplateId, getTemplateDefinition } from './storeTemplateSystem';
import { Category } from '../../types';

interface StoreModelHeroShowcaseProps {
  templateId?: PublicStoreTemplateId | string | null;
  storeName: string;
  primaryColor?: string;
  categories?: Category[];
  onScrollToCatalog?: () => void;
}

export const StoreModelHeroShowcase: React.FC<StoreModelHeroShowcaseProps> = ({
  templateId,
  storeName,
  primaryColor = '#1769FF',
  categories = [],
  onScrollToCatalog,
}) => {
  // Plan FREE y modelos con cabecera integrada G5-G8: no muestran hero secundario redundante
  if (!templateId || templateId === 'free' || templateId === 'g5' || templateId === 'g6' || templateId === 'g7' || templateId === 'g8') {
    return null;
  }

  const def = getTemplateDefinition(templateId);
  const handleCta = () => {
    if (onScrollToCatalog) {
      onScrollToCatalog();
    } else {
      const el = document.getElementById('catalog-view-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // --------------------------------------------------------------------------
  // GASTONOMÍA G5 — Pedido Express Visual
  // --------------------------------------------------------------------------
  if (templateId === 'g5') {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-black text-white border border-orange-500/40 p-5 sm:p-7 shadow-lg relative overflow-hidden">
        {/* Resplandor cálido de fondo */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              <span>G5 — Pedido Express Visual</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-white">
              Tu comida favorita en minutos
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Explora nuestra carta gastronómica con adición en un toque y confirmación directa por WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCta}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-orange-500/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Ver menú</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chips de categorías gastronómicas representativas */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.length > 0
            ? categories.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={handleCta}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-orange-500/20 text-white text-xs font-bold shrink-0 border border-white/10 hover:border-orange-500/40 transition cursor-pointer"
                >
                  {c.name}
                </button>
              ))
            : ['🍣 Rolls', '🥟 Entradas', '🥗 Platos Calientes', '🥤 Bebidas', '🥢 Especialidades'].map(
                (cat, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={handleCta}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-orange-500/20 text-white text-xs font-bold shrink-0 border border-white/10 hover:border-orange-500/40 transition cursor-pointer"
                  >
                    {cat}
                  </button>
                )
              )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // GASTRONOMÍA G6 — Menú Visual Fotográfico
  // --------------------------------------------------------------------------
  if (templateId === 'g6') {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-br from-stone-900 via-slate-950 to-stone-950 text-white border border-emerald-500/30 p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
              <Utensils className="w-3 h-3" />
              <span>G6 — Carta Gourmet Visual</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white">
              Sabores que inspiran
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Descubre nuestra carta culinaria con fotografías apetitosas y preparaciones de autor.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleCta}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Explorar carta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['Todos', 'Rolls', 'Entradas', 'Makis', 'Pokés', 'Platos Fuertes'].map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={handleCta}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                i === 0
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-stone-300 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // GASTRONOMÍA G7 — Café & Boutique Editorial
  // --------------------------------------------------------------------------
  if (templateId === 'g7') {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-br from-[#FAF5EE] via-[#F5ECE0] to-[#EFE3D2] dark:from-[#1E1916] dark:via-[#181412] dark:to-[#120F0D] text-[#2C241E] dark:text-[#EAE0D5] border border-amber-300/80 dark:border-amber-900/40 p-5 sm:p-7 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 text-[10px] font-serif font-bold uppercase tracking-widest">
              <Coffee className="w-3 h-3" />
              <span>G7 — Café & Boutique Editorial</span>
            </div>

            <h3 className="font-serif italic text-2xl sm:text-3xl font-bold tracking-normal leading-tight text-[#2C241E] dark:text-white">
              Más que café, una experiencia
            </h3>

            <p className="font-serif text-xs sm:text-sm text-[#5C4D42] dark:text-[#C7B7A6] leading-relaxed">
              Un momento especial en cada bocado con repostería artesanal y sabores únicos.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleCta}
              className="px-5 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-serif font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Ver selección</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-5 pt-4 border-t border-amber-300/50 dark:border-amber-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['☕ Cafés', '🍰 Postres', '🥐 Sándwiches', '🥤 Bebidas', '🧇 Waffles'].map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={handleCta}
              className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-stone-900/90 hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-950 dark:text-amber-200 text-xs font-serif font-medium shrink-0 border border-amber-300/70 dark:border-amber-800/60 transition cursor-pointer shadow-2xs"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // GASTRONOMÍA G8 — Especialidades Premium (Alta Cocina)
  // --------------------------------------------------------------------------
  if (templateId === 'g8') {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-br from-[#0B0C0E] via-[#121418] to-[#1A1C22] text-white border border-amber-500/40 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-serif font-bold uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>G8 — Alta Gastronomía & Cocina de Autor</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide leading-tight text-amber-100">
              Nuestras Especialidades
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              Platos que cuentan historias. Ingredientes selectos y experiencias culinarias inolvidables.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleCta}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Descubrir especialidades</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-5 pt-4 border-t border-amber-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['★ Platos Insignia', '🍣 Fusión Especial', '🥩 Cortes Selectos', '🥂 Maridaje'].map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={handleCta}
              className="px-3.5 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 text-xs font-serif font-medium shrink-0 border border-amber-500/30 transition cursor-pointer"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // MODELOS G1 - G4 Y OTROS MODELOS ESPECIALES
  // --------------------------------------------------------------------------
  if (def) {
    return (
      <div className="w-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {def.code}
            </span>
            <span className="text-xs font-bold text-stone-900 dark:text-white">
              {def.name}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {def.tagline}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCta}
          className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Explorar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};
