import React from 'react';
import { Ruler, ShieldCheck } from 'lucide-react';
import { FashionSettings } from '../../types';

interface FashionSizeGuideModalProps {
  settings: FashionSettings;
  onClose: () => void;
}

export const FashionSizeGuideModal: React.FC<FashionSizeGuideModalProps> = ({
  settings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Ruler className="w-5 h-5 text-indigo-400" />
            <span>Guía de Tallas y Medidas Corporales</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-semibold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tabla de medidas */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Talla</th>
                <th className="px-3 py-2.5">Pecho / Busto</th>
                <th className="px-3 py-2.5">Cintura</th>
                <th className="px-3 py-2.5">Cadera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {settings.sizeGuide.map((item) => (
                <tr key={item.size} className="hover:bg-slate-800/40 transition">
                  <td className="px-3 py-2.5 font-bold text-white bg-slate-950/40">
                    {item.size}
                  </td>
                  <td className="px-3 py-2.5">{item.chest}</td>
                  <td className="px-3 py-2.5">{item.waist}</td>
                  <td className="px-3 py-2.5">{item.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Política de cambios */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Política de Cambios y Devoluciones</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {settings.exchangePolicy || 'Cambios permitidos según condiciones del comercio.'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
        >
          Cerrar Guía
        </button>
      </div>
    </div>
  );
};
