import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Store, StoreScheduleDay } from '../../types';
import {
  getStoreSchedule,
  saveStoreSchedule,
  calculateScheduleStatus,
} from '../../lib/storeAdminService';

interface MiTiendaHorariosProps {
  store: Store;
}

export const MiTiendaHorarios: React.FC<MiTiendaHorariosProps> = ({ store }) => {
  const [schedule, setSchedule] = useState<StoreScheduleDay[]>(() =>
    getStoreSchedule(store.id)
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSchedule(store.id, schedule);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Horarios de Atención Comercial</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configura turnos matutinos, vespertinos y días laborables para pedidos en línea
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Horarios</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Horarios de atención guardados y sincronizados en tiempo real.</span>
        </div>
      )}

      {/* Indicador en Vivo de Estado del Comercio */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full animate-pulse ${
              liveStatus.isOpenNow ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-rose-500 ring-4 ring-rose-500/20'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado en Vivo:
              </span>
              <span
                className={`text-xs font-black uppercase px-2 py-0.5 rounded-md border ${
                  liveStatus.isOpenNow
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {liveStatus.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{liveStatus.nextOpeningInfo}</p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          Hora Local: {new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Lista de Días (Lunes a Domingo con soporte para múltiples períodos) */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Configuración Semanal Detallada</span>
        </h3>

        <div className="space-y-3 pt-2">
          {schedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`p-3.5 rounded-xl border transition ${
                day.isOpen
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.isOpen}
                    onChange={() => handleToggleDay(day.dayOfWeek)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <label
                    htmlFor={`day-${day.dayOfWeek}`}
                    className="text-xs font-bold text-white w-24 cursor-pointer"
                  >
                    {day.dayName}
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      day.isOpen
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
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
                        className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                      >
                        <span className="text-[10px] text-slate-400 font-mono">
                          T{pIdx + 1}:
                        </span>
                        <input
                          type="time"
                          value={period.open}
                          onChange={(e) =>
                            handlePeriodChange(day.dayOfWeek, pIdx, 'open', e.target.value)
                          }
                          className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-xs font-mono border border-slate-700 focus:outline-none"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <input
                          type="time"
                          value={period.close}
                          onChange={(e) =>
                            handlePeriodChange(day.dayOfWeek, pIdx, 'close', e.target.value)
                          }
                          className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-xs font-mono border border-slate-700 focus:outline-none"
                        />

                        {day.periods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePeriod(day.dayOfWeek, pIdx)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 transition cursor-pointer"
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold transition cursor-pointer"
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
