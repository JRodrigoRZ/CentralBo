import React, { useState } from 'react';
import {
  Truck,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  Save,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Store, StoreShippingSettings } from '../../types';
import { getStoreShipping, saveStoreShipping } from '../../lib/storeAdminService';

interface MiTiendaEnviosProps {
  store: Store;
}

const ALL_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const MiTiendaEnvios: React.FC<MiTiendaEnviosProps> = ({ store }) => {
  const [shipping, setShipping] = useState<StoreShippingSettings>(() =>
    getStoreShipping(store.id)
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleDay = (day: string) => {
    setShipping((prev) => {
      const exists = prev.availableDays.includes(day);
      const updated = exists
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: updated };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreShipping(store.id, shipping);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            <span>Configuración de Envíos y Despacho</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Establece los parámetros de entrega a domicilio o retiro para tus clientes
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Configuración</span>
        </button>
      </div>

      {/* Nota de restricción de la plataforma */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Política CentralBo:</strong> La plataforma no calcula automáticamente tarifas
          dinámicas por distancia geográfica. El comercio define si el servicio es gratuito o
          aplica una tarifa plana transparente en Bolivianos (Bs).
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Condiciones de envío guardadas y reflejadas en la tienda.</span>
        </div>
      )}

      {/* 1. Modalidad y Costo de Envío */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Disponibilidad del Servicio de Entrega
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="offersShipping"
              checked={shipping.offersShipping}
              onChange={(e) =>
                setShipping({ ...shipping, offersShipping: e.target.checked })
              }
              className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <label
              htmlFor="offersShipping"
              className="text-xs font-bold text-white cursor-pointer"
            >
              Ofrecer Envío a Domicilio
            </label>
          </div>
        </div>

        {shipping.offersShipping && (
          <div className="pt-2 border-t border-slate-800/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tipo de Tarifa de Envío
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShipping({ ...shipping, shippingType: 'fixed' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      shipping.shippingType === 'fixed'
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Costo Fijo (Tarifa Plana)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShipping({ ...shipping, shippingType: 'free' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      shipping.shippingType === 'free'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Envío Gratuito
                  </button>
                </div>
              </div>

              {shipping.shippingType === 'fixed' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Costo de Envío Fijo (Bs)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={shipping.fixedCost}
                    onChange={(e) =>
                      setShipping({ ...shipping, fixedCost: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                    placeholder="Ej. 15"
                  />
                </div>
              )}
            </div>

            {/* Restricciones de Monto Mínimo y Máximo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Monto Mínimo de Compra para Despacho (Bs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={shipping.minOrderAmount}
                  onChange={(e) =>
                    setShipping({ ...shipping, minOrderAmount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                  placeholder="0 = Sin pedido mínimo"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Los clientes deben alcanzar este valor para poder pedir a domicilio.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Monto Máximo de Compra (Bs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={shipping.maxOrderAmount}
                  onChange={(e) =>
                    setShipping({ ...shipping, maxOrderAmount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                  placeholder="0 = Sin límite de compra"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Coloca 0 si no deseas limitar el valor máximo de la compra.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Días y Horarios Disponibles para Envío */}
      {shipping.offersShipping && (
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>2. Días y Horarios de Entrega</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Días Habilitados para Despacho
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => {
                const isSelected = shipping.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Horarios Disponibles para Repartos</span>
            </label>
            <input
              type="text"
              value={shipping.availableHours}
              onChange={(e) =>
                setShipping({ ...shipping, availableHours: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="Ej. 11:30 a 15:00 y 18:30 a 22:00"
            />
          </div>
        </div>
      )}
    </form>
  );
};
