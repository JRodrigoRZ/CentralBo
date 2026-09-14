import React from 'react';
import { Ruler, ShieldCheck, X } from 'lucide-react';
import { FashionSettings } from '../../types';

interface FashionSizeGuideModalProps {
  settings: FashionSettings;
  onClose: () => void;
  primaryColor?: string;
}

export const FashionSizeGuideModal: React.FC<FashionSizeGuideModalProps> = ({
  settings,
  onClose,
  primaryColor = '#18181b',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-base">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs"
              style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
            >
              <Ruler className="w-4 h-4" />
            </div>
            <span>Guía de Tallas y Medidas Corporales</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title="Cerrar guía"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabla de medidas */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
          <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200/80 dark:border-stone-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3.5 py-2.5">Talla</th>
                <th className="px-3.5 py-2.5">Pecho / Busto</th>
                <th className="px-3.5 py-2.5">Cintura</th>
                <th className="px-3.5 py-2.5">Cadera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60 bg-white dark:bg-stone-900/60">
              {settings.sizeGuide.map((item) => (
                <tr key={item.size} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition">
                  <td className="px-3.5 py-2.5 font-bold text-stone-900 dark:text-white bg-stone-50/50 dark:bg-stone-950/40">
                    {item.size}
                  </td>
                  <td className="px-3.5 py-2.5">{item.chest}</td>
                  <td className="px-3.5 py-2.5">{item.waist}</td>
                  <td className="px-3.5 py-2.5">{item.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Política de cambios real del comercio */}
        {settings.exchangePolicy && (
          <div className="rounded-2xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Política de Cambios y Devoluciones</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {settings.exchangePolicy}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-white text-xs font-bold transition cursor-pointer"
        >
          Cerrar Guía
        </button>
      </div>
    </div>
  );
};
