import React, { useState } from 'react';
import {
  CalendarClock,
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Info,
} from 'lucide-react';
import { Store, StoreScheduledOrdersSettings } from '../../types';
import {
  getStoreScheduledOrders,
  saveStoreScheduledOrders,
} from '../../lib/storeAdminService';

interface MiTiendaProgramadosProps {
  store: Store;
}

export const MiTiendaProgramados: React.FC<MiTiendaProgramadosProps> = ({ store }) => {
  const [scheduled, setScheduled] = useState<StoreScheduledOrdersSettings>(() =>
    getStoreScheduledOrders(store.id)
  );
  const [newSlotInput, setNewSlotInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreScheduledOrders(store.id, scheduled);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-400" />
            <span>Pedidos Programados y Reservas Anticipadas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Permite a los clientes agendar entregas para fechas y horas futuras específicas
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

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Parámetros de pedidos programados actualizados correctamente.</span>
        </div>
      )}

      {/* Activar / Desactivar Pedidos Programados */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Habilitación de Pedidos a Futuro
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
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
              className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <label
              htmlFor="enabledScheduled"
              className="text-xs font-bold text-white cursor-pointer"
            >
              Habilitar Pedidos Programados
            </label>
          </div>
        </div>

        {scheduled.enabled && (
          <div className="pt-2 border-t border-slate-800/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Ej. 2"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  El cliente no podrá programar con menos de estas horas de antelación.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Ej. 7"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Ventana máxima hacia adelante para seleccionar fecha en el calendario.
                </span>
              </div>
            </div>

            {/* Franjas Horarias Permitidas */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-slate-300">
                Franjas Horarias Disponibles para Entrega o Retiro
              </label>

              <div className="flex flex-wrap gap-2">
                {scheduled.availableSlots.map((slot, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono"
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(idx)}
                      className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
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
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

            {/* Condiciones Especiales */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Instrucciones o Condiciones Especiales para el Cliente
              </label>
              <textarea
                rows={2}
                value={scheduled.specialConditions}
                onChange={(e) =>
                  setScheduled({ ...scheduled, specialConditions: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition resize-none"
                placeholder="Aclaraciones sobre anticipación, confirmación previa o penalidades..."
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
