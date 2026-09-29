import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Store, PromotionCode } from '../../types';
import {
  getCachedStorePromotions,
  fetchStorePromotions,
  createStorePromotion,
  updateStorePromotion,
  deleteStorePromotion,
} from '../../lib/storeAdminService';

interface StoreAdminPromocionesProps {
  store: Store;
}

export const StoreAdminPromociones: React.FC<StoreAdminPromocionesProps> = ({ store }) => {
  // Inicializar inmediatamente con la caché local no-autoritativa para evitar parpadeos
  const [promotions, setPromotions] = useState<PromotionCode[]>(() =>
    getCachedStorePromotions(store.id)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Formulario nuevo código
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [minPurchase, setMinPurchase] = useState<number>(50);

  // Sincronización canónica con Supabase al montar o cambiar de comercio
  useEffect(() => {
    let cancelled = false;

    async function loadPromotions() {
      setLoading(true);
      setError(null);
      try {
        const canonicalPromos = await fetchStorePromotions(store.id);
        if (!cancelled) {
          setPromotions(canonicalPromos);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('[CentralBo StoreAdmin] Error al cargar promociones:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPromotions();

    return () => {
      cancelled = true;
    };
  }, [store.id]);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) return;

    setIsSubmitting(true);
    setError(null);

    const result = await createStorePromotion(store.id, {
      tenant_id: store.id,
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      startDate,
      endDate,
      minPurchase: Number(minPurchase),
      isActive: true,
    });

    setIsSubmitting(false);

    if (!result.success || !result.data) {
      setError(result.error || 'No se pudo crear el código promocional.');
      return;
    }

    // Actualización reactiva con datos confirmados por el backend (con su UUID remoto)
    setPromotions((prev) => [result.data!, ...prev.filter((p) => p.id !== result.data!.id)]);
    setIsCreating(false);
    setNewCode('');
    showNotification(`Cupón "${cleanCode}" creado exitosamente.`);
  };

  const handleTogglePromo = async (promo: PromotionCode) => {
    setIsSubmitting(true);
    setError(null);

    const newActiveState = !promo.isActive;
    const result = await updateStorePromotion(store.id, promo.id, {
      isActive: newActiveState,
    });

    setIsSubmitting(false);

    if (!result.success || !result.data) {
      setError(result.error || 'No se pudo actualizar el estado del cupón.');
      return;
    }

    setPromotions((prev) =>
      prev.map((p) => (p.id === promo.id ? result.data! : p))
    );
    showNotification(
      newActiveState
        ? `Cupón "${promo.code}" reactivado.`
        : `Cupón "${promo.code}" pausado.`
    );
  };

  const handleDeletePromo = async (id: string, code: string) => {
    if (window.confirm(`¿Eliminar la promoción "${code}"?`)) {
      setIsSubmitting(true);
      setError(null);

      const result = await deleteStorePromotion(store.id, id);
      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error || 'No se pudo eliminar el cupón.');
        return;
      }

      setPromotions((prev) => prev.filter((p) => p.id !== id));
      showNotification(`Cupón "${code}" eliminado exitosamente.`);
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
              {promotions.length} {promotions.length === 1 ? 'cupón' : 'cupones'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Crea incentivos de compra en porcentaje o rebaja fija en Bs para tus clientes
          </p>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            setIsCreating(true);
            setError(null);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cupón</span>
        </button>
      </div>

      {/* Alerta de Error Controlado */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Alerta de Notificación / Éxito */}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
                placeholder="Ej. PRIMAVERA2026"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tipo de Descuento
              </label>
              <select
                disabled={isSubmitting}
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as 'percentage' | 'fixed')
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
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
                disabled={isSubmitting}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
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
                disabled={isSubmitting}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                required
                disabled={isSubmitting}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Compra Mínima Requerida (Bs)
              </label>
              <input
                type="number"
                min="0"
                disabled={isSubmitting}
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none disabled:opacity-50"
                placeholder="0 = Sin mínimo"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsCreating(false)}
              className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Guardando en Supabase...' : 'Guardar Cupón'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Estado de Carga Inicial */}
      {loading && promotions.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center space-y-2.5">
          <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">
            Consultando promociones del comercio en Supabase...
          </p>
        </div>
      )}

      {/* Estado Vacío Real (Sin Fallbacks Ficticios) */}
      {!loading && promotions.length === 0 && !isCreating && (
        <div className="p-8 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-center space-y-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              No hay códigos promocionales configurados
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Crea cupones de descuento en porcentaje (%) o monto fijo (Bs) con compra mínima y vigencia para incentivar las ventas en tu comercio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Cupón</span>
          </button>
        </div>
      )}

      {/* Lista de Códigos Promocionales */}
      {promotions.length > 0 && (
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
                  disabled={isSubmitting}
                  onClick={() => handleTogglePromo(promo)}
                  className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer disabled:opacity-50"
                >
                  {promo.isActive ? 'Pausar cupón' : 'Reactivar'}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDeletePromo(promo.id, promo.code)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
