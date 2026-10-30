import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  AlertCircle,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Store, StoreScheduleDay } from '../../types';
import {
  getStoreSchedule,
  getCachedStoreSchedule,
  saveStoreSchedule,
  calculateScheduleStatus,
} from '../../lib/storeAdminService';

interface MiTiendaHorariosProps {
  store: Store;
}

export const MiTiendaHorarios: React.FC<MiTiendaHorariosProps> = ({ store }) => {
  const [schedule, setSchedule] = useState<StoreScheduleDay[]>(() =>
    getCachedStoreSchedule(store.id)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sincronizar horarios oficiales desde Supabase al montar o cambiar de comercio
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setLoadingError(null);

    getStoreSchedule(store.id)
      .then((remoteSchedule) => {
        if (mounted) {
          setSchedule(remoteSchedule);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn('[MiTiendaHorarios] Error al sincronizar horarios desde Supabase:', err);
          setLoadingError('No se pudo sincronizar con el servidor. Mostrando horarios en caché local.');
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [store.id]);

  // Estado en tiempo real del comercio
  const liveStatus = calculateScheduleStatus(schedule);

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              isOpen: !d.isOpen,
              periods:
                !d.isOpen && d.periods.length === 0
                  ? [{ open: '09:00', close: '18:00' }]
                  : d.periods,
            }
          : d
      )
    );
  };

  const handleAddPeriod = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayOfWeek) {
          return {
            ...d,
            periods: [...d.periods, { open: '15:30', close: '20:30' }],
          };
        }
        return d;
      })
    );
  };

  const handleRemovePeriod = (dayOfWeek: number, periodIndex: number) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayOfWeek) {
          const newPeriods = d.periods.filter((_, idx) => idx !== periodIndex);
          return {
            ...d,
            periods: newPeriods,
            isOpen: newPeriods.length > 0 ? d.isOpen : false,
          };
        }
        return d;
      })
    );
  };

  const handlePeriodChange = (
    dayOfWeek: number,
    periodIndex: number,
    field: 'open' | 'close',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayOfWeek) {
          const updated = [...d.periods];
          updated[periodIndex] = { ...updated[periodIndex], [field]: value };
          return { ...d, periods: updated };
        }
        return d;
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSavedSuccess(false);
    setSaveError(null);

    try {
      const res = await saveStoreSchedule(store.id, schedule);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setSaveError(res.error || 'Error al persistir los horarios en Supabase.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Error de conexión al guardar los horarios.');
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
            <Clock className="w-5 h-5 text-[#1769FF] dark:text-[#3B82F6]" />
            <span>Horarios de Atención Comercial</span>
          </h2>
          <p className="text-xs text-[#52627A] dark:text-[#B8C6DA] mt-0.5">
            Configura turnos matutinos, vespertinos y días laborables para pedidos en línea
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving || isLoading}
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
              <span>Guardar Horarios</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-[#102A24] dark:border-[#34D399]/40 dark:text-[#34D399] text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-[#34D399]" />
          <span>Horarios de atención guardados y sincronizados en tiempo real con Supabase.</span>
        </div>
      )}

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

      {/* Indicador en Vivo de Estado del Comercio */}
      <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full animate-pulse ${
              liveStatus.isOpenNow ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-rose-500 ring-4 ring-rose-500/20'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#52627A] dark:text-[#B8C6DA]">
                Estado en Vivo:
              </span>
              <span
                className={`text-xs font-black uppercase px-2 py-0.5 rounded-md border ${
                  liveStatus.isOpenNow
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                }`}
              >
                {liveStatus.statusLabel}
              </span>
            </div>
            <p className="text-xs text-[#52627A] dark:text-[#B8C6DA] mt-0.5">{liveStatus.nextOpeningInfo}</p>
          </div>
        </div>

        <span className="text-[11px] text-[#52627A] dark:text-[#B8C6DA] font-mono bg-white dark:bg-[#17243D] px-3 py-1.5 rounded-xl border border-[#DEE7F2] dark:border-[#263653] shadow-2xs">
          Hora Local: {new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Lista de Días (Lunes a Domingo con soporte para múltiples períodos) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1769FF] dark:text-[#3B82F6]" />
          <span>Configuración Semanal Detallada</span>
        </h3>

        <div className="space-y-3 pt-2">
          {schedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`p-3.5 rounded-xl border transition ${
                day.isOpen
                  ? 'bg-[#F8FAFC] dark:bg-[#17243D] border-[#DEE7F2] dark:border-[#263653]'
                  : 'bg-[#F1F5F9]/60 dark:bg-[#0E1726]/60 border-[#DEE7F2] dark:border-[#1F2C45] opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.isOpen}
                    onChange={() => handleToggleDay(day.dayOfWeek)}
                    className="w-4 h-4 rounded text-[#1769FF] accent-[#1769FF] bg-white dark:bg-slate-800 border-[#DEE7F2] dark:border-slate-700 cursor-pointer"
                  />
                  <label
                    htmlFor={`day-${day.dayOfWeek}`}
                    className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC] w-24 cursor-pointer"
                  >
                    {day.dayName}
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      day.isOpen
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {day.isOpen ? 'Atiende' : 'Cerrado'}
                  </span>
                </div>

                {/* Períodos de atención */}
                {day.isOpen && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {day.periods.map((period, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center gap-1.5 bg-white dark:bg-[#101B32] px-2.5 py-1 rounded-lg border border-[#DEE7F2] dark:border-[#263653] shadow-2xs"
                      >
                        <span className="text-[10px] text-[#52627A] dark:text-[#B8C6DA] font-mono">
                          T{pIdx + 1}:
                        </span>
                        <input
                          type="time"
                          value={period.open}
                          onChange={(e) =>
                            handlePeriodChange(day.dayOfWeek, pIdx, 'open', e.target.value)
                          }
                          className="px-1.5 py-0.5 rounded bg-[#F8FAFC] dark:bg-slate-900 text-[#14213D] dark:text-white text-xs font-mono border border-[#DEE7F2] dark:border-slate-700 focus:outline-none focus:border-[#1769FF]"
                        />
                        <span className="text-[#52627A] dark:text-slate-400 text-xs">-</span>
                        <input
                          type="time"
                          value={period.close}
                          onChange={(e) =>
                            handlePeriodChange(day.dayOfWeek, pIdx, 'close', e.target.value)
                          }
                          className="px-1.5 py-0.5 rounded bg-[#F8FAFC] dark:bg-slate-900 text-[#14213D] dark:text-white text-xs font-mono border border-[#DEE7F2] dark:border-slate-700 focus:outline-none focus:border-[#1769FF]"
                        />

                        {day.periods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePeriod(day.dayOfWeek, pIdx)}
                            className="text-[#94A3B8] hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 p-0.5 transition cursor-pointer"
                            title="Eliminar turno"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddPeriod(day.dayOfWeek)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF4FF] hover:bg-[#DEE7F2] border border-[#DEE7F2] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] dark:border-[#263653] text-[#1769FF] dark:text-[#3B82F6] text-[11px] font-semibold transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar Turno</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
