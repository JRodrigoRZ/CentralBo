import React, { useId } from 'react';

export interface MaxiNegoLogoProps {
  /**
   * Tamaño del logo en píxeles (ancho y alto del icono cuadrado).
   * Por omisión: 36
   */
  size?: number | string;
  /**
   * Clases CSS adicionales para el contenedor o SVG.
   */
  className?: string;
  /**
   * Variante visual aprobada:
   * - 'gradient': Monograma blanco sobre squircle con degradado azul y violeta (icono estándar)
   * - 'white-bg': Fondo blanco opcional para el icono de aplicación, con monograma en degradado azul y violeta
   * - 'mark-only': Sin fondo (monograma en degradado azul y violeta directamente)
   */
  variant?: 'gradient' | 'white-bg' | 'mark-only';
  /**
   * Si se debe mostrar el texto "MAXINEGO" junto al monograma.
   */
  showText?: boolean;
  /**
   * Si se debe incluir el subtítulo descriptivo ("Plataforma para Comercios y Negocios Locales").
   */
  showSubtitle?: boolean;
}

/**
 * MaxiNegoLogo — Componente Oficial de Identidad Visual de MAXINEGO (Fase F16)
 *
 * Especificaciones aprobadas:
 * - Monograma MN geométrico oficial.
 * - Degradado azul y violeta (#2563EB -> #4F46E5 -> #7C3AED).
 * - Estrella blanca central radiante.
 * - Fondo blanco opcional para el icono de aplicación.
 */
export const MaxiNegoLogo: React.FC<MaxiNegoLogoProps> = ({
  size = 36,
  className = '',
  variant = 'gradient',
  showText = false,
  showSubtitle = false,
}) => {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const gradId = `mn-grad-${safeId}`;
  const glowId = `mn-glow-${safeId}`;
  const shadowId = `mn-shadow-${safeId}`;

  const numSize = typeof size === 'number' ? size : parseInt(size, 10) || 36;
  const isWhiteBg = variant === 'white-bg';
  const isMarkOnly = variant === 'mark-only';

  const svgIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={numSize}
      height={numSize}
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="MAXINEGO Logo"
    >
      <defs>
        {/* Degradado oficial azul y violeta */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        {/* Resplandor sutil para la estrella blanca central */}
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFFFFF" floodOpacity="0.85" />
        </filter>

        {/* Sombra de elevación sutil */}
        <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#1E1B4B" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Contenedor squircle de fondo */}
      {!isMarkOnly && (
        <>
          <rect
            width="512"
            height="512"
            rx="116"
            fill={isWhiteBg ? '#FFFFFF' : `url(#${gradId})`}
            filter={`url(#${shadowId})`}
          />
          {isWhiteBg ? (
            <rect
              x="8"
              y="8"
              width="496"
              height="496"
              rx="110"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="4"
            />
          ) : (
            <rect
              x="12"
              y="12"
              width="488"
              height="488"
              rx="104"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.18"
              strokeWidth="3"
            />
          )}
        </>
      )}

      {/* Monograma MN */}
      <g fill={isWhiteBg || isMarkOnly ? `url(#${gradId})` : '#FFFFFF'}>
        {/* Letra M (Izquierda) */}
        <path d="M 64 368 L 64 144 L 108 144 L 154 246 L 200 144 L 244 144 L 244 368 L 204 368 L 204 216 L 166 288 L 142 288 L 104 216 L 104 368 Z" />

        {/* Letra N (Derecha) */}
        <path d="M 268 368 L 268 144 L 312 144 L 404 286 L 404 144 L 448 144 L 448 368 L 404 368 L 312 226 L 312 368 Z" />
      </g>

      {/* Estrella blanca central en el corazón del monograma MN */}
      <g>
        {isWhiteBg && (
          <path
            d="M 256 196 L 268 240 L 312 256 L 268 272 L 256 316 L 244 272 L 200 256 L 244 240 Z"
            fill="#4F46E5"
            opacity="0.25"
          />
        )}
        <path
          d="M 256 204 L 264 244 L 304 256 L 264 268 L 256 308 L 248 268 L 208 256 L 248 244 Z"
          fill="#FFFFFF"
          filter={`url(#${glowId})`}
        />
        <circle cx="256" cy="256" r="4.5" fill="#FFFFFF" />
      </g>
    </svg>
  );

  if (!showText) {
    return svgIcon;
  }

  return (
    <div className="flex items-center gap-2.5">
      {svgIcon}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            MAXINEGO
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none font-medium">
            Plataforma para Comercios y Negocios Locales
          </span>
        )}
      </div>
    </div>
  );
};

export default MaxiNegoLogo;
