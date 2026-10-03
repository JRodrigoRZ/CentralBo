import React, { useState } from 'react';
import { Tag, Copy, Check, Sparkles, Percent, Calendar, ShoppingBag, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { PromotionCode, StoreType } from '../../types';

interface PublicStorePromotionsProps {
  promotions: PromotionCode[];
  selectedPromo: PromotionCode | null;
  onSelectPromo: (promo: PromotionCode) => void;
  onRemovePromo: () => void;
  primaryColor?: string;
  storeType?: StoreType;
}

export const PublicStorePromotions: React.FC<PublicStorePromotionsProps> = ({
  promotions,
  selectedPromo,
  onSelectPromo,
  onRemovePromo,
  primaryColor = '#4f46e5',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!promotions || promotions.length === 0) {
    return null;
  }

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code).catch(() => {
      // Fallback manual si clipboard API falla
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2500);
  };

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return new Date(dateStr).toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      aria-label="Promociones y cupones de descuento"
      className="w-full my-6 p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs backdrop-blur-xs space-y-4"
    >
      {/* Cabecera de la Sección de Promociones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tracking-tight">
                Promociones & Cupones Activos
              </h3>
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${primaryColor}14`,
                  color: primaryColor,
                  borderColor: `${primaryColor}33`,
                }}
              >
                {promotions.length} {promotions.length === 1 ? 'disponible' : 'disponibles'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Copia el código o selecciónalo directamente para disfrutar de descuentos en tu pedido.
            </p>
          </div>
        </div>

        {selectedPromo && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Cupón <strong>{selectedPromo.code}</strong> seleccionado
            </span>
            <button
              type="button"
              onClick={onRemovePromo}
              className="ml-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              title="Quitar cupón seleccionado"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Grid de Cupones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {promotions.map((promo) => {
          const isSelected = selectedPromo?.id === promo.id || selectedPromo?.code.toUpperCase() === promo.code.toUpperCase();
          const isCopied = copiedCode === promo.code;

          return (
            <div
              key={promo.id}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50 dark:border-emerald-500/40 shadow-xs'
                  : 'bg-stone-50/60 dark:bg-stone-800/40 hover:bg-stone-50 dark:hover:bg-stone-800/70 border-stone-200/80 dark:border-stone-700/60 hover:border-stone-300 dark:hover:border-stone-600 shadow-2xs'
              }`}
            >
              <div className="space-y-2.5">
                {/* Cabecera de la Tarjeta de Promoción */}
                <div className="flex items-start justify-between gap-2">
                  {/* Badge de Descuento */}
                  <span
                    className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg border shadow-2xs uppercase tracking-tight"
                    style={{
                      backgroundColor: `${primaryColor}18`,
                      color: primaryColor,
                      borderColor: `${primaryColor}33`,
                    }}
                  >
                    <Percent className="w-3 h-3" />
                    <span>
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}% OFF`
                        : `Bs ${promo.discountValue.toFixed(2)} OFF`}
                    </span>
                  </span>

                  {/* Estado si está seleccionado */}
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      <Check className="w-3 h-3" />
                      <span>Listo para Checkout</span>
                    </span>
                  )}
                </div>

                {/* Código con botón de copia rápida */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700">
                  <span className="font-mono font-black text-sm text-stone-900 dark:text-white tracking-wider px-1">
                    {promo.code}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(promo.code, e)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                    title="Copiar código al portapapeles"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Condiciones de la Promoción */}
                <div className="space-y-1 text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>
                      {promo.minPurchase > 0
                        ? `Compra mínima: Bs ${promo.minPurchase.toFixed(2)}`
                        : 'Sin compra mínima requerida'}
                    </span>
                  </div>
                  {promo.endDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>Válido hasta el {formatDate(promo.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de Acción Directa */}
              <div className="pt-3 mt-3 border-t border-stone-200/60 dark:border-stone-700/60">
                {isSelected ? (
                  <button
                    type="button"
                    onClick={onRemovePromo}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-stone-400" />
                    <span>Quitar de mi pedido</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectPromo(promo)}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-2 px-3 rounded-xl text-white text-xs font-bold shadow-2xs hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Usar este cupón</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
};
