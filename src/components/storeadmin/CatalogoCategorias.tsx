import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Store, Category } from '../../types';
import {
  getCachedStoreCategories,
  fetchStoreCategories,
  createStoreCategory,
  updateStoreCategory,
  deleteStoreCategory,
  getStoreProducts,
} from '../../lib/storeAdminService';

interface CatalogoCategoriasProps {
  store: Store;
}

export const CatalogoCategorias: React.FC<CatalogoCategoriasProps> = ({ store }) => {
  // 1. Mostrar inicialmente caché si existe
  const [categories, setCategories] = useState<Category[]>(() =>
    getCachedStoreCategories(store.id)
  );
  const products = getStoreProducts(store.id, store.store_type);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. Solicitar datos canónicos a Supabase al montar el componente
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const remoteCats = await fetchStoreCategories(store.id);
      // Reemplazar la caché por la respuesta canónica remota ([] se conserva tal cual)
      setCategories(remoteCats);
    } catch (err: any) {
      setLoadError(err?.message || 'Error al conectar con Supabase para cargar categorías.');
    } finally {
      setIsLoading(false);
    }
  }, [store.id]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Creación canónica con UUID en Supabase
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await createStoreCategory(store.id, trimmed);
    setIsSubmitting(false);

    if (res.success && res.category) {
      setCategories((prev) => [...prev, res.category!]);
      setNewCatName('');
      showNotification(`Categoría "${trimmed}" creada exitosamente.`);
    } else {
      setErrorMessage(res.error || 'Error al crear la categoría en el servidor.');
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setErrorMessage(null);
  };

  // Edición de nombre en Supabase
  const handleSaveEdit = async (catId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed || savingId) return;

    setSavingId(catId);
    setErrorMessage(null);

    const res = await updateStoreCategory(store.id, catId, { name: trimmed });
    setSavingId(null);

    if (res.success && res.category) {
      setCategories((prev) => prev.map((c) => (c.id === catId ? res.category! : c)));
      setEditingId(null);
      showNotification('Categoría actualizada exitosamente.');
    } else {
      setErrorMessage(res.error || 'Error al actualizar el nombre de la categoría.');
    }
  };

  // Cambio de status ('activo' | 'inactivo') en Supabase
  const handleToggleStatus = async (cat: Category) => {
    if (savingId) return;
    const newStatus = cat.status === 'activo' ? 'inactivo' : 'activo';

    setSavingId(cat.id);
    setErrorMessage(null);

    const res = await updateStoreCategory(store.id, cat.id, { status: newStatus });
    setSavingId(null);

    if (res.success && res.category) {
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? res.category! : c)));
      showNotification(
        `Categoría "${cat.name}" ahora está ${newStatus === 'activo' ? 'activa' : 'inactiva'}.`
      );
    } else {
      setErrorMessage(res.error || 'Error al actualizar el estado de la categoría.');
    }
  };

  // Eliminación con verificación previa de productos
  const handleDelete = async (catId: string, catName: string) => {
    if (deletingId) return;

    // Verificar si hay productos que pertenecen a esta categoría en memoria local
    const associatedCount = products.filter((p) => p.category_id === catId).length;
    if (associatedCount > 0) {
      setErrorMessage(
        `No se puede eliminar la categoría "${catName}" porque tiene ${associatedCount} producto${
          associatedCount === 1 ? '' : 's'
        } asociado${
          associatedCount === 1 ? '' : 's'
        }. Primero reasigna o elimina los productos en la sección Productos.`
      );
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${catName}"?`)) {
      return;
    }

    setDeletingId(catId);
    setErrorMessage(null);

    const res = await deleteStoreCategory(store.id, catId);
    setDeletingId(null);

    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      showNotification(`Categoría "${catName}" eliminada.`);
    } else {
      setErrorMessage(res.error || 'Error al eliminar la categoría en el servidor.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DEE7F2] dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-[#14213D] dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#1769FF] dark:text-indigo-400" />
            <span>Categorías del Catálogo</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#1769FF] dark:bg-slate-800 dark:text-slate-300 font-medium">
              {categories.length} categorías
            </span>
          </h2>
          <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
            Organiza tus productos en secciones visibles para los compradores
          </p>
        </div>

        <button
          type="button"
          onClick={loadCategories}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 hover:bg-[#F8FAFC] dark:hover:border-slate-700 text-[#52627A] dark:text-slate-300 hover:text-[#14213D] dark:hover:text-white text-xs transition cursor-pointer self-start sm:self-auto disabled:opacity-50 shadow-2xs"
          title="Recargar categorías desde Supabase"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1769FF] dark:text-indigo-400' : ''}`} />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* Mensaje de Éxito */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Mensaje de Error de Operación */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-500/40 dark:text-rose-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-white text-xs px-2 py-0.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mensaje de Error de Carga con Retry */}
      {loadError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-500/40 dark:text-amber-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={loadCategories}
            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:hover:bg-amber-800 dark:text-amber-200 text-[11px] font-semibold transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Formulario para Crear Nueva Categoría */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider">
          Crear Nueva Categoría
        </h3>

        <form onSubmit={handleAddCategory} className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Ej. Postres Clásicos, Accesorios..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCatName.trim()}
            className="px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Añadir</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Lista de Categorías Existentes */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#14213D] dark:text-slate-300 uppercase tracking-wider">
            Categorías Registradas ({categories.length})
          </h3>
          {isLoading && (
            <span className="text-[11px] text-[#52627A] dark:text-slate-400 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-[#1769FF] dark:text-indigo-400" />
              <span>Sincronizando con Supabase...</span>
            </span>
          )}
        </div>

        {/* Estado Vacío Auténtico: Cuando Supabase tiene [] categorías */}
        {!isLoading && categories.length === 0 ? (
          <div className="py-10 text-center text-[#52627A] dark:text-slate-400 text-xs">
            <Layers className="w-8 h-8 text-[#94A3B8] dark:text-slate-600 mx-auto mb-2.5 opacity-60" />
            <p className="font-semibold text-[#14213D] dark:text-slate-300">No hay categorías registradas</p>
            <p className="text-[#52627A] dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Utiliza el formulario superior para crear la primera categoría de tu catálogo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#DEE7F2] dark:divide-slate-800/80">
            {categories.map((cat) => {
              const productCount = products.filter((p) => p.category_id === cat.id).length;
              const isBeingEdited = editingId === cat.id;
              const isSavingThis = savingId === cat.id;
              const isDeletingThis = deletingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Nombre y Conteo */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        cat.status === 'activo' ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                    />

                    {isBeingEdited ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          disabled={isSavingThis}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-[#1769FF] dark:border-indigo-500 text-[#14213D] dark:text-white text-xs focus:outline-none disabled:opacity-50"
                        />
                        <button
                          type="button"
                          disabled={isSavingThis || !editingName.trim()}
                          onClick={() => handleSaveEdit(cat.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1769FF] hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          {isSavingThis ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          disabled={isSavingThis}
                          onClick={() => setEditingId(null)}
                          className="text-xs text-[#52627A] hover:text-[#14213D] dark:text-slate-400 dark:hover:text-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-[#14213D] dark:text-white block">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-[#52627A] dark:text-slate-400 flex items-center gap-1">
                          <Package className="w-3 h-3 text-[#52627A] dark:text-slate-400" />
                          <span>
                            {productCount} producto{productCount === 1 ? '' : 's'}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={isSavingThis || isDeletingThis}
                      onClick={() => handleToggleStatus(cat)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer disabled:opacity-50 ${
                        cat.status === 'activo'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      {isSavingThis ? '...' : cat.status === 'activo' ? 'Activa' : 'Inactiva'}
                    </button>

                    {!isBeingEdited && (
                      <button
                        type="button"
                        disabled={isSavingThis || isDeletingThis}
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-[#52627A] dark:text-slate-300 hover:text-[#14213D] dark:hover:text-white hover:bg-[#F8FAFC] transition cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Editar nombre"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isSavingThis || isDeletingThis}
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer disabled:opacity-50 shadow-2xs"
                      title="Eliminar categoría"
                    >
                      {isDeletingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
