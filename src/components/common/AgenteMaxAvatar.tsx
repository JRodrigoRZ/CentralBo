import React from 'react';

interface AgenteMaxAvatarProps {
  className?: string;
  showStatusDot?: boolean;
}

/**
 * Avatar SVG oficial de Agente Max
 * Robot asistente con visor digital cian, auriculares celestes, casco blanco y emblema MN.
 */
export const AgenteMaxAvatar: React.FC<AgenteMaxAvatarProps> = ({
  className = 'w-11 h-11',
  showStatusDot = true,
}) => {
  return (
    <div className={`relative ${className} shrink-0`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md select-none"
        aria-label="Avatar de Agente Max"
      >
        {/* Antena con luz cian pulsante */}
        <circle cx="32" cy="7" r="3" fill="#38BDF8" />
        <path d="M32 10V17" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Auriculares / Orejeras */}
        <rect x="7" y="27" width="5" height="12" rx="2.5" fill="#38BDF8" />
        <rect x="52" y="27" width="5" height="12" rx="2.5" fill="#38BDF8" />

        {/* Cabeza metálica blanca redondeada */}
        <rect
          x="11"
          y="16"
          width="42"
          height="33"
          rx="14"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Visor digital oscuro */}
        <rect x="16" y="22" width="32" height="18" rx="8" fill="#0B132B" />

        {/* Ojos cian expresivos y brillantes */}
        <circle cx="25" cy="30" r="3" fill="#38BDF8" />
        <circle cx="26" cy="29" r="1" fill="#FFFFFF" />
        <circle cx="39" cy="30" r="3" fill="#38BDF8" />
        <circle cx="40" cy="29" r="1" fill="#FFFFFF" />

        {/* Sonrisa digital sutil */}
        <path
          d="M29 35.5C30.5 36.8 33.5 36.8 35 35.5"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Torso / Base con el logotipo de MAXINEGO (MN) */}
        <path
          d="M19 49C19 49 22 59 32 59C42 59 45 49 45 49H19Z"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1.2"
        />
        <text
          x="32"
          y="56.5"
          textAnchor="middle"
          fill="#2563EB"
          fontSize="6.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
        >
          MN
        </text>
      </svg>
      {/* Indicador de conexión en vivo */}
      {showStatusDot && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-sm" />
      )}
    </div>
  );
};
