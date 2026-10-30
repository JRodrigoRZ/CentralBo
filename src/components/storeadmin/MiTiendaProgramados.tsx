import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Store, StoreScheduledOrdersSettings } from '../../types';
import {
  getCachedStoreScheduledOrders,
  fetchStoreScheduledOrders,
  saveStoreScheduledOrders,
} from '../../lib/storeAdminService';

interface MiTiendaProgramadosProps {
  store: Store;
}

export const MiTiendaProgramados: React.FC<MiTiendaProgramadosProps> = ({ store }) => {
  const [scheduled, setScheduled] = useState<StoreScheduledOrdersSettings>(() =>
    getCachedStoreScheduledOrders(store.id)
  );
  const [newSlotInput, setNewSlotInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sincronizar configuración oficial de pedidos programados desde Supabase al montar o cambiar de comercio
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setLoadingError(null);

    fetchStoreScheduledOrders(store.id)
      .then((remoteScheduled) => {
        if (mounted) {
          setScheduled(remoteScheduled);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn('[MiTiendaProgramados] Error al sincronizar desde Supabase:', err);
          setLoadingError('No se pudo sincronizar con el servidor. Mostrando configuración en caché local.');
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [store.id]);

  const handleAddSlot = () => {
    const trimmed = newSlotInput.trim();
    if (!trimmed || scheduled.availableSlots.includes(trimmed)) return;
    setScheduled((prev) => ({
      ...prev,
      availableSlots: [...prev.availableSlots, trimmed],
    }));
    setNewSlotInput('');
  };

  const handleRemoveSlot = (index: number) => {
    setScheduled((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    try {
      const result = await saveStoreScheduledOrders(store.id, scheduled);
      if (result.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'Error al persistir la configuración en el servidor.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Error de conexión al guardar configuración.');
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
            <CalendarClock className="w-5 h-5 text-[#1769FF] dark:text-[#3B82F6]" />
            <span>Pedidos Programados y Reservas Anticipadas</span>
          </h2>
          <p className="text-xs text-[#52627A] dark:text-[#B8C6DA] mt-0.5">
            Permite a los clientes agendar entregas para fechas y horas futuras específicas
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>

      {loadingError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-[#241C12] dark:border-[#FBBF24]/40 dark:text-[#FBBF24] text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-[#FBBF24]" />
          <span>{loadingError}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-[#2E141E] dark:border-[#F87171]/40 dark:text-[#F87171] text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-[#F87171]" />
          <span>{saveError}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-[#102A24] dark:border-[#34D399]/40 dark:text-[#34D399] text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-[#34D399]" />
          <span>Parámetros de pedidos programados actualizados correctamente en el servidor.</span>
        </div>
      )}

      {/* Activar / Desactivar Pedidos Programados */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] uppercase tracking-wider">
              1. Habilitación de Pedidos a Futuro
            </h3>
            <p className="text-[11px] text-[#52627A] dark:text-[#B8C6DA] mt-0.5">
              Ideal para banquetes, pastelería, confección a medida o citas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabledScheduled"
              checked={scheduled.enabled}
              onChange={(e) =>
                setScheduled({ ...scheduled, enabled: e.target.checked })
              }
              className="w-4 h-4 rounded text-[#1769FF] accent-[#1769FF] bg-white dark:bg-slate-800 border-[#DEE7F2] dark:border-slate-700 cursor-pointer"
            />
            <label
              htmlFor="enabledScheduled"
              className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] cursor-pointer"
            >
              Habilitar Pedidos Programados
            </label>
          </div>
        </div>

        {scheduled.enabled && (
          <div className="pt-2 border-t border-[#DEE7F2] dark:border-[#263653] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Anticipación Mínima Requerida (Horas)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={scheduled.minAdvanceHours}
                  onChange={(e) =>
                    setScheduled({ ...scheduled, minAdvanceHours: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] transition shadow-2xs"
                  placeholder="Ej. 2"
                />
                <span className="text-[10px] text-[#52627A] dark:text-slate-400 mt-1 block">
                  El cliente no podrá programar con menos de estas horas de antelación.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1769FF] dark:text-[#3B82F6]" />
                  <span>Plazo Máximo a Futuro (Días)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={scheduled.maxAdvanceDays}
                  onChange={(e) =>
                    setScheduled({ ...scheduled, maxAdvanceDays: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] transition shadow-2xs"
                  placeholder="Ej. 7"
                />
                <span className="text-[10px] text-[#52627A] dark:text-slate-400 mt-1 block">
                  Ventana máxima hacia adelante para seleccionar fecha en el calendario.
                </span>
              </div>
            </div>

            {/* Franjas Horarias Permitidas */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA]">
                Franjas Horarias Disponibles para Entrega o Retiro
              </label>

              <div className="flex flex-wrap gap-2">
                {scheduled.availableSlots.map((slot, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-[#14213D] dark:text-slate-200 text-xs font-mono shadow-2xs"
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(idx)}
                      className="text-[#94A3B8] hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={newSlotInput}
                  onChange={(e) => setNewSlotInput(e.target.value)}
                  placeholder="Ej. 17:00 - 18:00"
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-3.5 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

            {/* Condiciones Especiales */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-[#52627A] dark:text-[#B8C6DA] mb-1.5">
                Instrucciones o Condiciones Especiales para el Cliente
              </label>
              <textarea
                rows={2}
                value={scheduled.specialConditions}
                onChange={(e) =>
                  setScheduled({ ...scheduled, specialConditions: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] transition resize-none shadow-2xs"
                placeholder="Aclaraciones sobre anticipación, confirmación previa o penalidades..."
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
