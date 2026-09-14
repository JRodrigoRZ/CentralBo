import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { StoreHighlightItem, StoreHighlightsLayout, StoreType } from '../../types';
import { Sparkles } from 'lucide-react';
import { getVerticalMotionProfile } from './motionSystem';

interface StoreHighlightsProps {
  highlights?: StoreHighlightItem[];
  layout?: StoreHighlightsLayout;
  showHighlights?: boolean;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  brandAccentColor?: string;
  storeType?: StoreType;
}

export const StoreHighlights: React.FC<StoreHighlightsProps> = ({
  highlights = [],
  layout = 'balanced',
  showHighlights = true,
  brandPrimaryColor = '#4f46e5',
  storeType,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (!showHighlights || !highlights || highlights.length === 0) {
    return null;
  }

  // Animaciones de entrada escalonada según vertical
  const motionProfile = getVerticalMotionProfile(storeType, shouldReduceMotion);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: motionProfile.stagger,
        delayChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: motionProfile.subtleY },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: motionProfile.duration, ease: motionProfile.ease },
    },
  };

  // 1. COMPOSICIÓN EDITORIAL
  if (layout === 'editorial') {
    return (
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Destacados del comercio"
        className="w-full my-6 py-6 px-4 sm:px-6 rounded-3xl bg-white/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs backdrop-blur-xs"
      >
        <div className="flex items-center gap-2 mb-4 text-[11px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          <Sparkles className="w-3.5 h-3.5" style={{ color: brandPrimaryColor }} />
          <span>Valores & Compromisos del Comercio</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200/80 dark:divide-stone-800/80 gap-6 md:gap-0">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              variants={itemVariants}
              className={`flex flex-col justify-between space-y-2 ${
                idx === 0 ? 'md:pr-6' : idx === highlights.length - 1 ? 'md:pl-6' : 'md:px-6'
              } pt-4 md:pt-0`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl shrink-0" role="img" aria-hidden="true">
                    {item.icon || '✨'}
                  </span>
                  {item.badge && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${brandPrimaryColor}14`,
                        color: brandPrimaryColor,
                        borderColor: `${brandPrimaryColor}33`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif tracking-tight">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    );
  }

  // 2. COMPOSICIÓN DESTACADO PRINCIPAL + SECUNDARIOS (1 + N)
  if (layout === 'featured') {
    const [primaryItem, ...secondaryItems] = highlights;

    return (
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Destacados del comercio"
        className="w-full my-6 grid grid-cols-1 lg:grid-cols-12 gap-3.5"
      >
        {/* Destacado principal */}
        {primaryItem && (
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 p-5 rounded-2xl relative overflow-hidden border shadow-sm flex flex-col justify-between bg-white/90 dark:bg-stone-900/80 border-stone-200/90 dark:border-stone-800"
            style={{
              boxShadow: `0 4px 20px -2px ${brandPrimaryColor}15`,
            }}
          >
            <div
              className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-20"
              style={{ backgroundColor: brandPrimaryColor }}
            />
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl p-2 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60 inline-flex items-center justify-center">
                  {primaryItem.icon || '⭐'}
                </span>
                {primaryItem.badge && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${brandPrimaryColor}18`,
                      color: brandPrimaryColor,
                      borderColor: `${brandPrimaryColor}40`,
                    }}
                  >
                    {primaryItem.badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-white tracking-tight">
                  {primaryItem.title}
                </h3>
                {primaryItem.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                    {primaryItem.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Secundarios */}
        <div
          className={`grid gap-3 ${
            secondaryItems.length === 1
              ? 'lg:col-span-7 grid-cols-1'
              : secondaryItems.length === 2
              ? 'lg:col-span-7 grid-cols-1 sm:grid-cols-2'
              : 'lg:col-span-7 grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {secondaryItems.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              variants={itemVariants}
              className="p-4 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition flex items-start gap-3.5"
            >
              <span className="text-xl shrink-0 mt-0.5">{item.icon || '✨'}</span>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {item.title}
                  </h4>
                  {item.badge && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded-md border shrink-0"
                      style={{
                        backgroundColor: `${brandPrimaryColor}12`,
                        color: brandPrimaryColor,
                        borderColor: `${brandPrimaryColor}28`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    );
  }

  // 3. COMPOSICIÓN HORIZONTAL (Scrollable en móvil / fila fluida)
  if (layout === 'horizontal') {
    return (
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Destacados del comercio"
        className="w-full my-6 overflow-x-auto pb-2 no-scrollbar"
      >
        <div className="flex items-center gap-3 min-w-max">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              variants={itemVariants}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition shrink-0"
            >
              <span className="text-lg shrink-0">{item.icon || '✨'}</span>
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {item.title}
                  </p>
                  {item.badge && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                      style={{
                        backgroundColor: `${brandPrimaryColor}12`,
                        color: brandPrimaryColor,
                        borderColor: `${brandPrimaryColor}28`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 max-w-[180px] truncate">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    );
  }

  // 4. COMPOSICIÓN MINIMALISTA (Insignias compactas)
  if (layout === 'minimal') {
    return (
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Destacados del comercio"
        className="w-full my-5 flex flex-wrap items-center gap-2.5"
      >
        {highlights.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 text-xs font-medium text-stone-800 dark:text-stone-200 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition"
          >
            <span className="text-sm shrink-0">{item.icon || '•'}</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
              {item.title}
            </span>
            {item.badge && (
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border"
                style={{
                  backgroundColor: `${brandPrimaryColor}15`,
                  color: brandPrimaryColor,
                  borderColor: `${brandPrimaryColor}33`,
                }}
              >
                {item.badge}
              </span>
            )}
          </motion.div>
        ))}
      </motion.section>
    );
  }

  // 5. COMPOSICIÓN EQUILIBRADA (Por defecto: Cuadrícula armónica según cantidad de elementos)
  const gridColsClass =
    highlights.length === 1
      ? 'grid-cols-1 max-w-md mx-auto'
      : highlights.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : highlights.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Destacados del comercio"
      className={`w-full my-6 grid gap-3 ${gridColsClass}`}
    >
      {highlights.map((item, idx) => (
        <motion.div
          key={item.id || idx}
          variants={itemVariants}
          className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition flex items-start gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-stone-100/90 dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700/60 group-hover:scale-105 transition-transform duration-200 text-lg">
            {item.icon || '✨'}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5 text-left">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                {item.title}
              </p>
              {item.badge && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0"
                  style={{
                    backgroundColor: `${brandPrimaryColor}14`,
                    color: brandPrimaryColor,
                    borderColor: `${brandPrimaryColor}33`,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
};
