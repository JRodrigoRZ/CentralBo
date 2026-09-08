import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  DollarSign,
  Percent,
  Copy,
  Check,
} from 'lucide-react';
import { Store, PromotionCode } from '../../types';
import {
  getStorePromotions,
  saveStorePromotions,
} from '../../lib/storeAdminService';

interface StoreAdminPromocionesProps {
  store: Store;
}

export const StoreAdminPromociones: React.FC<StoreAdminPromocionesProps> = ({ store }) => {
  const [promotions, setPromotions] = useState<PromotionCode[]>(() =>
    getStorePromotions(store.id)
  );
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Formulario nuevo código
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [minPurchase, setMinPurchase] = useState<number>(50);

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) return;

    const promo: PromotionCode = {
      id: `promo-${Date.now()}`,
      tenant_id: store.id,
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      startDate,
      endDate,
      minPurchase: Number(minPurchase),
      isActive: true,
    };

    const updated = [promo, ...promotions];
    setPromotions(updated);
    saveStorePromotions(store.id, updated);
    setIsCreating(false);
    setNewCode('');
    showNotification(`Cupón "${cleanCode}" creado exitosamente.`);
  };

  const handleTogglePromo = (id: string) => {
    const updated = promotions.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    setPromotions(updated);
    saveStorePromotions(store.id, updated);
  };

  const handleDeletePromo = (id: string, code: string) => {
    if (window.confirm(`¿Eliminar la promoción "${code}"?`)) {
      const updated = promotions.filter((p) => p.id !== id);
      setPromotions(updated);
      saveStorePromotions(store.id, updated);
      showNotification(`Cupón "${code}" eliminado.`);
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            <span>Códigos Promocionales y Descuentos</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {promotions.length} cupones
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Crea incentivos de compra en porcentaje o rebaja fija en Bs para tus clientes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cupón</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Formulario de Creación de Cupón */}
      {isCreating && (
        <form
          onSubmit={handleCreatePromo}
          className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Configurar Nuevo Código Promocional
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Código del Cupón *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. PRIMAVERA2026"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tipo de Descuento
              </label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as 'percentage' | 'fixed')
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo (Bs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Valor del Descuento ({discountType === 'percentage' ? '%' : 'Bs'}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Compra Mínima Requerida (Bs)
              </label>
              <input
                type="number"
                min="0"
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                placeholder="0 = Sin mínimo"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              Guardar Cupón
            </button>
          </div>
        </form>
      )}

      {/* Lista de Códigos Promocionales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
              promo.isActive
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700">
                    {promo.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyPromoCode(promo.code)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copiar código"
                  >
                    {copiedCode === promo.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    promo.isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {promo.isActive ? 'Activo' : 'Pausado'}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-xl font-black text-indigo-400">
                  {promo.discountType === 'percentage'
                    ? `${promo.discountValue}% OFF`
                    : `-Bs ${promo.discountValue}`}
                </span>
                <span className="text-xs text-slate-400">
                  (Compra mín: Bs {promo.minPurchase})
                </span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 font-mono">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>
                  {promo.startDate} al {promo.endDate}
                </span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleTogglePromo(promo.id)}
                className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
              >
                {promo.isActive ? 'Pausar cupón' : 'Reactivar'}
              </button>

              <button
                type="button"
                onClick={() => handleDeletePromo(promo.id, promo.code)}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
