import React from 'react';

export interface PriceDisplayProps {
  price?: number;
  amount?: number;
  previousPrice?: number | null;
  isPreviousPrice?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDiscountBadge?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  amount,
  previousPrice,
  isPreviousPrice = false,
  size = 'md',
  showDiscountBadge = true,
  className = '',
  align = 'left',
}) => {
  const finalPrice = price ?? amount ?? 0;

  // Si solo se muestra como precio anterior tachado
  if (isPreviousPrice) {
    return (
      <span
        className={`text-slate-400 dark:text-slate-400/90 line-through select-none font-normal ${
          size === 'xs' ? 'text-xs' : 'text-sm'
        } ${className}`}
        title={`Precio anterior: Bs ${finalPrice.toFixed(2)}`}
      >
        Bs {finalPrice.toFixed(2)}
      </span>
    );
  }

  const hasOffer = previousPrice != null && previousPrice > finalPrice;
  const discountPercent = hasOffer
    ? Math.round(((previousPrice - finalPrice) / previousPrice) * 100)
    : 0;

  // Formatear parte entera y decimal
  const parts = finalPrice.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Escala de tamaños tipográficos controlados
  const sizeClasses = {
    xs: {
      currency: 'text-[11px]',
      integer: 'text-xs font-bold',
      decimal: 'text-[10px] font-semibold',
      prev: 'text-[10px]',
      badge: 'text-[9px] px-1 py-0.2',
    },
    sm: {
      currency: 'text-xs',
      integer: 'text-sm font-bold',
      decimal: 'text-[11px] font-semibold',
      prev: 'text-xs',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      currency: 'text-xs sm:text-sm font-semibold',
      integer: 'text-base sm:text-lg font-extrabold',
      decimal: 'text-xs sm:text-sm font-bold',
      prev: 'text-xs sm:text-sm',
      badge: 'text-[11px] px-2 py-0.5',
    },
    lg: {
      currency: 'text-sm sm:text-base font-semibold',
      integer: 'text-xl sm:text-2xl font-extrabold tracking-tight',
      decimal: 'text-sm sm:text-base font-bold',
      prev: 'text-sm sm:text-base',
      badge: 'text-xs px-2.5 py-0.5',
    },
    xl: {
      currency: 'text-base sm:text-lg font-semibold',
      integer: 'text-2xl sm:text-3xl font-black tracking-tight',
      decimal: 'text-base sm:text-lg font-bold',
      prev: 'text-base',
      badge: 'text-xs px-2.5 py-1',
    },
  }[size];

  const alignClass = {
    left: 'items-baseline justify-start',
    center: 'items-baseline justify-center',
    right: 'items-baseline justify-end',
  }[align];

  return (
    <div className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      {/* Contenedor del precio principal */}
      <div className={`flex ${alignClass} text-slate-900 dark:text-slate-100`}>
        <span className={`${sizeClasses.currency} text-slate-500 dark:text-slate-400 mr-1 select-none font-medium`}>
          Bs
        </span>
        <span className={sizeClasses.integer}>
          {integerPart}
        </span>
        <span className={`${sizeClasses.decimal} text-slate-700 dark:text-slate-300`}>
          .{decimalPart}
        </span>
      </div>

      {/* Precio anterior tachado */}
      {hasOffer && previousPrice != null && (
        <span
          className={`${sizeClasses.prev} text-slate-400 dark:text-slate-500 line-through select-none font-normal`}
          title={`Precio anterior: Bs ${previousPrice.toFixed(2)}`}
        >
          Bs {previousPrice.toFixed(2)}
        </span>
      )}

      {/* Badge de porcentaje de descuento */}
      {hasOffer && showDiscountBadge && discountPercent > 0 && (
        <span
          className={`${sizeClasses.badge} font-bold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 select-none inline-flex items-center`}
        >
          -{discountPercent}%
        </span>
      )}
    </div>
  );
};
