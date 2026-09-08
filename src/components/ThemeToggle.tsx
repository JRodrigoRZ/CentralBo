import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = true,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer select-none text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700 hover:border-slate-600'
          : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-300 hover:border-slate-400'
      } ${className}`}
      title={isDark ? 'Cambiar a Modo Claro (☀️)' : 'Cambiar a Modo Oscuro (🌙)'}
      aria-label={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
    >
      {isDark ? (
        <>
          <span className="text-sm leading-none select-none" role="img" aria-label="Modo Oscuro">
            🌙
          </span>
          {showLabel && (
            <span className="hidden sm:inline text-slate-200 font-medium text-[11px]">
              Oscuro
            </span>
          )}
        </>
      ) : (
        <>
          <span className="text-sm leading-none select-none" role="img" aria-label="Modo Claro">
            ☀️
          </span>
          {showLabel && (
            <span className="hidden sm:inline text-slate-700 font-medium text-[11px]">
              Claro
            </span>
          )}
        </>
      )}
      <span className="sr-only">
        {isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      </span>
    </button>
  );
};
