import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { StoreBannerItem } from '../../types';

interface StoreBannersCarouselProps {
  banners: StoreBannerItem[];
  brandPrimaryColor?: string;
  storeName?: string;
  templateId?: string | null;
}

export const StoreBannersCarousel: React.FC<StoreBannersCarouselProps> = ({
  banners,
  brandPrimaryColor = '#1769FF',
  storeName,
  templateId,
}) => {
  // Ordenar banners por el campo 'order' o por índice
  const sortedBanners = React.useMemo(() => {
    return [...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [banners]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detección de gestos táctiles (swipe) para dispositivos móviles
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const minSwipeDistance = 45; // Distancia mínima en px para activar el cambio

  const total = sortedBanners.length;

  // Si no hay banners, no renderizar nada (evitar huecos en blanco)
  if (total === 0) {
    return null;
  }

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndXRef.current = null;
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > minSwipeDistance) {
      handleNext(); // Swipe hacia la izquierda -> siguiente
    } else if (distance < -minSwipeDistance) {
      handlePrev(); // Swipe hacia la derecha -> anterior
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Mantener el índice dentro de rango si cambia la cantidad de banners
  useEffect(() => {
    if (currentIndex >= total) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const activeBanner = sortedBanners[currentIndex];

  // Marco y contenedor adaptado al modelo sin alterar la imagen del comercio
  const getContainerClasses = () => {
    if (templateId === 'g5') {
      return 'relative w-full overflow-hidden rounded-3xl border border-orange-500/40 bg-stone-950/90 shadow-[0_4px_25px_rgba(234,88,12,0.14)] focus:outline-none transition-shadow';
    }
    if (templateId === 'g6') {
      return 'relative w-full overflow-hidden rounded-3xl border border-emerald-500/35 bg-stone-950/90 shadow-[0_4px_25px_rgba(16,185,129,0.12)] focus:outline-none transition-shadow';
    }
    if (templateId === 'g7') {
      return 'relative w-full overflow-hidden rounded-3xl border border-amber-200/90 dark:border-amber-800/50 bg-[#FAF5EE]/95 dark:bg-stone-900/95 shadow-md focus:outline-none transition-shadow';
    }
    if (templateId === 'g8') {
      return 'relative w-full overflow-hidden rounded-3xl border border-amber-500/45 bg-[#0B0C0E] shadow-[0_4px_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/25 focus:outline-none transition-shadow';
    }
    return 'relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-slate-800 bg-stone-100 dark:bg-slate-900/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-shadow';
  };

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Banners comerciales de ${storeName || 'la tienda'}`}
      className={getContainerClasses()}
      style={
        {
          '--tw-ring-color': brandPrimaryColor,
        } as React.CSSProperties
      }
    >
      {/* Contenedor con relación de aspecto responsive: móvil 16:9 / tablet y desktop panorámico */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.5/1] overflow-hidden select-none bg-stone-900/10 dark:bg-black/40">
        {sortedBanners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id || index}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title || `Banner ${index + 1} de ${storeName || 'tienda'}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover object-center"
              />

              {/* Título o etiqueta sobre el banner si fue configurado por el comercio */}
              {banner.title && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-white flex flex-col justify-end">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 w-fit shadow-xs"
                    style={{ backgroundColor: brandPrimaryColor }}
                  >
                    Destacado
                  </span>
                  <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white drop-shadow-sm line-clamp-2">
                    {banner.title}
                  </h3>
                </div>
              )}
            </div>
          );
        })}

        {/* Fallback si la imagen no carga */}
        {!activeBanner && (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="w-8 h-8 opacity-40" />
          </div>
        )}

        {/* Controles de navegación manual: solo si hay más de 1 banner */}
        {total > 1 && (
          <>
            {/* Botón Anterior */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ver banner anterior"
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Botón Siguiente */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Ver siguiente banner"
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Indicador de posición / Contador de diapositivas en esquina superior */}
            <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-20 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-mono font-medium shadow-xs">
              {currentIndex + 1} / {total}
            </div>

            {/* Puntos de navegación (Dots) en la parte inferior */}
            <div className="absolute bottom-2.5 sm:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-1.5 sm:gap-2">
              {sortedBanners.map((_, dotIdx) => {
                const isDotActive = dotIdx === currentIndex;
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentIndex(dotIdx)}
                    aria-label={`Ir al banner ${dotIdx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isDotActive
                        ? 'w-6 sm:w-7 bg-white shadow-md'
                        : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
