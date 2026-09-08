import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Package,
} from 'lucide-react';
import { Store, Category } from '../../types';
import {
  getStoreCategories,
  saveStoreCategories,
  getStoreProducts,
} from '../../lib/storeAdminService';

interface CatalogoCategoriasProps {
  store: Store;
}

export const CatalogoCategorias: React.FC<CatalogoCategoriasProps> = ({ store }) => {
  const [categories, setCategories] = useState<Category[]>(() =>
    getStoreCategories(store.id, store.store_type)
  );
  const products = getStoreProducts(store.id, store.store_type);

  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      tenant_id: store.id,
      name: trimmed,
      status: 'activo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    saveStoreCategories(store.id, updated);
    setNewCatName('');
    showNotification(`Categoría "${trimmed}" creada exitosamente.`);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = (catId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    const updated = categories.map((c) =>
      c.id === catId ? { ...c, name: trimmed, updated_at: new Date().toISOString() } : c
    );
    setCategories(updated);
    saveStoreCategories(store.id, updated);
    setEditingId(null);
    showNotification('Categoría actualizada.');
  };

  const handleToggleStatus = (cat: Category) => {
    const newStatus = cat.status === 'activo' ? 'inactivo' : 'activo';
    const updated = categories.map((c) =>
      c.id === cat.id ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c
    );
    setCategories(updated);
    saveStoreCategories(store.id, updated);
    showNotification(
      `Categoría "${cat.name}" ahora está ${newStatus === 'activo' ? 'activa' : 'inactiva'}.`
    );
  };

  const handleDelete = (catId: string, catName: string) => {
    // Verificar si hay productos que pertenecen a esta categoría
    const associatedCount = products.filter((p) => p.category_id === catId).length;
    if (associatedCount > 0) {
      alert(
        `No se puede eliminar la categoría "${catName}" porque tiene ${associatedCount} productos asociados. Primero reasigna o elimina los productos.`
      );
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar la categoría "${catName}"?`)) {
      const updated = categories.filter((c) => c.id !== catId);
      setCategories(updated);
      saveStoreCategories(store.id, updated);
      showNotification(`Categoría "${catName}" eliminada.`);
    }
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
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Categorías del Catálogo</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {categories.length} categorías
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organiza tus productos en secciones visibles para los compradores
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Formulario para Crear Nueva Categoría */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Crear Nueva Categoría
        </h3>

        <form onSubmit={handleAddCategory} className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Ej. Postres Clásicos, Accesorios..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        </form>
      </div>

      {/* Lista de Categorías Existentes */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Categorías Registradas ({categories.length})
        </h3>

        <div className="divide-y divide-slate-800/80">
          {categories.map((cat) => {
            const productCount = products.filter((p) => p.category_id === cat.id).length;
            const isBeingEdited = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Nombre y Conteo */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      cat.status === 'activo' ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  />

                  {isBeingEdited ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-500 text-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat.id)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{productCount} producto{productCount === 1 ? '' : 's'}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(cat)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      cat.status === 'activo'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {cat.status === 'activo' ? 'Activa' : 'Inactiva'}
                  </button>

                  {!isBeingEdited && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Editar nombre"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
