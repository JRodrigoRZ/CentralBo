import React, { useState, useEffect } from 'react';
import {
  Truck,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  Save,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';
import { Store, StoreShippingSettings } from '../../types';
import {
  getCachedStoreShipping,
  fetchStoreShipping,
  saveStoreShipping,
} from '../../lib/storeAdminService';

interface MiTiendaEnviosProps {
  store: Store;
}

const ALL_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const MiTiendaEnvios: React.FC<MiTiendaEnviosProps> = ({ store }) => {
  const [shipping, setShipping] = useState<StoreShippingSettings>(() =>
    getCachedStoreShipping(store.id)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sincronizar configuración oficial de envíos desde Supabase al montar o cambiar de comercio
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setLoadingError(null);

    fetchStoreShipping(store.id)
      .then((remoteShipping) => {
        if (mounted) {
          setShipping(remoteShipping);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn('[MiTiendaEnvios] Error al sincronizar envíos desde Supabase:', err);
          setLoadingError('No se pudo sincronizar con el servidor. Mostrando configuración en caché local.');
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [store.id]);

  const handleToggleDay = (day: string) => {
    setShipping((prev) => {
      const exists = prev.availableDays.includes(day);
      const updated = exists
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    try {
      const result = await saveStoreShipping(store.id, shipping);
      if (result.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'Error al persistir la configuración de envíos en el servidor.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Error de conexión al guardar configuración de envíos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DEE7F2] dark:border-[#263653]">
        <div>
          <h2 className="text-lg font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#1769FF] dark:text-[#3B82F6]" />
            <span>Configuración de Envíos y Despacho</span>
          </h2>
          <p className="text-xs text-[#52627A] dark:text-[#B8C6DA] mt-0.5">
            Establece los parámetros de entrega a domicilio o retiro para tus clientes
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Guardando...' : 'Guardar Configuración'}</span>
        </button>
      </div>

      {/* Nota de restricción de la plataforma */}
      <div className="p-3.5 rounded-xl bg-[#EEF4FF] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] text-xs text-[#14213D] dark:text-[#B8C6DA] flex items-start gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-[#1769FF] dark:text-[#3B82F6] flex-shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">Política MAXINEGO:</strong> La plataforma no calcula automáticamente tarifas
          dinámicas por distancia geográfica. El comercio define si el servicio es gratuito o
          aplica una tarifa plana transparente en Bolivianos (Bs).
        </p>
      </div>

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-[#2E141E] dark:border-[#F87171]/40 dark:text-[#F87171] text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-[#F87171]" />
          <span>{saveError}</span>
        </div>
      )}

      {loadingError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-[#241C12] dark:border-[#FBBF24]/40 dark:text-[#FBBF24] text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-[#FBBF24]" />
          <span>{loadingError}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-[#102A24] dark:border-[#34D399]/40 dark:text-[#34D399] text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-[#34D399]" />
          <span>Condiciones de envío guardadas y reflejadas en la tienda.</span>
        </div>
      )}

      {/* 1. Modalidad y Costo de Envío */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] uppercase tracking-wider">
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
              className="w-4 h-4 rounded text-[#1769FF] accent-[#1769FF] bg-white dark:bg-slate-800 border-[#DEE7F2] dark:border-slate-700 cursor-pointer"
            />
            <label
              htmlFor="offersShipping"
              className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] cursor-pointer"
            >
              Ofrecer Envío a Domicilio
            </label>
          </div>
        </div>

        {shipping.offersShipping && (
          <div className="pt-2 border-t border-[#DEE7F2] dark:border-[#263653] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5">
                  Tipo de Tarifa de Envío
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShipping({ ...shipping, shippingType: 'fixed' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      shipping.shippingType === 'fixed'
                        ? 'bg-[#EEF4FF] border-[#1769FF] text-[#1769FF] dark:bg-indigo-950/60 dark:border-indigo-500 dark:text-indigo-200'
                        : 'bg-[#F8FAFC] border-[#DEE7F2] text-[#52627A] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Costo Fijo (Tarifa Plana)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShipping({ ...shipping, shippingType: 'free' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      shipping.shippingType === 'free'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-500 dark:text-emerald-200'
                        : 'bg-[#F8FAFC] border-[#DEE7F2] text-[#52627A] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Envío Gratuito
                  </button>
                </div>
              </div>

              {shipping.shippingType === 'fixed' && (
                <div>
                  <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] transition shadow-2xs"
                    placeholder="Ej. 15"
                  />
                </div>
              )}
            </div>

            {/* Restricciones de Monto Mínimo y Máximo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5">
                  Monto Mínimo de Compra para Despacho (Bs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={shipping.minOrderAmount}
                  onChange={(e) =>
                    setShipping({ ...shipping, minOrderAmount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] transition shadow-2xs"
                  placeholder="0 = Sin pedido mínimo"
                />
                <span className="text-[10px] text-[#52627A] dark:text-slate-400 mt-1 block">
                  Los clientes deben alcanzar este valor para poder pedir a domicilio.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5">
                  Monto Máximo de Compra (Bs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={shipping.maxOrderAmount}
                  onChange={(e) =>
                    setShipping({ ...shipping, maxOrderAmount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] transition shadow-2xs"
                  placeholder="0 = Sin límite de compra"
                />
                <span className="text-[10px] text-[#52627A] dark:text-slate-400 mt-1 block">
                  Coloca 0 si no deseas limitar el valor máximo de la compra.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Días y Horarios Disponibles para Envío */}
      {shipping.offersShipping && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1769FF] dark:text-[#3B82F6]" />
            <span>2. Días y Horarios de Entrega</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-2">
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
                        ? 'bg-[#1769FF] text-white border-[#1769FF]'
                        : 'bg-[#F8FAFC] text-[#52627A] border-[#DEE7F2] hover:bg-[#EEF4FF] hover:text-[#14213D] dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1769FF] dark:text-[#3B82F6]" />
              <span>Horarios Disponibles para Repartos</span>
            </label>
            <input
              type="text"
              value={shipping.availableHours}
              onChange={(e) =>
                setShipping({ ...shipping, availableHours: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] transition shadow-2xs"
              placeholder="Ej. 11:30 a 15:00 y 18:30 a 22:00"
            />
          </div>
        </div>
      )}
    </form>
  );
};
