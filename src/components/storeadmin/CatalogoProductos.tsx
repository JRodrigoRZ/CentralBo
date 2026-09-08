import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Share2,
  Check,
  Star,
  DollarSign,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Tag,
  ChefHat,
  Shirt,
  Sparkles,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Store, Product, Category, ProductStatus } from '../../types';
import {
  getStoreProducts,
  saveStoreProducts,
  getStoreCategories,
  getStoreProfessionals,
} from '../../lib/storeAdminService';

interface CatalogoProductosProps {
  store: Store;
}

export const CatalogoProductos: React.FC<CatalogoProductosProps> = ({ store }) => {
  const [products, setProducts] = useState<Product[]>(() =>
    getStoreProducts(store.id, store.store_type)
  );
  const categories = getStoreCategories(store.id, store.store_type);
  const professionals = getStoreProfessionals(store.id);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCreate = () => {
    const defaultCat = categories[0]?.id || '';
    const newProd: Partial<Product> = {
      id: `prod-${Date.now()}`,
      tenant_id: store.id,
      category_id: defaultCat,
      name: '',
      description: '',
      price: 0,
      is_available: true,
      image_url: '',
      status: 'activo',
      attributes: {
        is_featured: false,
        previous_price: null,
        offer_price: null,
        // Vertical defaults
        modifiers: store.store_type === 'restaurante' ? [] : undefined,
        kitchen_notes_allowed: store.store_type === 'restaurante',
        is_combo: false,
        sizes: store.store_type === 'moda' ? ['S', 'M', 'L'] : undefined,
        colors: store.store_type === 'moda' ? [{ name: 'Negro', hex: '#000000' }] : undefined,
        duration_minutes: store.store_type === 'servicios' ? 45 : undefined,
        professional_id: store.store_type === 'servicios' ? professionals[0]?.id || '' : undefined,
      },
    };
    setCurrentProduct(newProd);
    setIsEditing(true);
  };

  const handleOpenEdit = (p: Product) => {
    setCurrentProduct({ ...p, attributes: { ...p.attributes } });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto del catálogo?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveStoreProducts(store.id, updated);
      showNotification('Producto eliminado correctamente.');
    }
  };

  const handleToggleAvailability = (p: Product) => {
    const updated = products.map((item) =>
      item.id === p.id ? { ...item, is_available: !item.is_available } : item
    );
    setProducts(updated);
    saveStoreProducts(store.id, updated);
    showNotification(
      `Disponibilidad de "${p.name}" cambiada a ${!p.is_available ? 'Disponible' : 'Agotado'}.`
    );
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.name) return;

    const exists = products.some((p) => p.id === currentProduct.id);
    let updated: Product[];

    if (exists) {
      updated = products.map((p) =>
        p.id === currentProduct.id
          ? ({ ...p, ...currentProduct, updated_at: new Date().toISOString() } as Product)
          : p
      );
      showNotification('Producto actualizado exitosamente.');
    } else {
      const fullNewProduct = {
        ...currentProduct,
        id: currentProduct.id || `prod-${Date.now()}`,
        tenant_id: store.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Product;
      updated = [fullNewProduct, ...products];
      showNotification('Nuevo producto añadido al catálogo.');
    }

    setProducts(updated);
    saveStoreProducts(store.id, updated);
    setIsEditing(false);
    setCurrentProduct(null);
  };

  const copyShareLink = (productId: string) => {
    const shareUrl = `${window.location.origin}/tienda/${store.slug}?item=${productId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 2500);
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
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Catálogo de Productos</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {products.length} productos
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra precios, existencias, fotografías y atributos específicos de{' '}
            <strong className="text-indigo-300">{store.name}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Categoría */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-950/30 border border-dashed border-slate-800 space-y-3">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-white">No se encontraron productos</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Prueba ajustando los filtros o añade tu primer artículo usando el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const cat = categories.find((c) => c.id === product.category_id);
            const isFeatured = product.attributes?.is_featured;
            const offerPrice = product.attributes?.offer_price;
            const previousPrice = product.attributes?.previous_price;

            return (
              <div
                key={product.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                  product.is_available
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  {/* Imagen y Badges */}
                  <div className="relative h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}

                    {/* Badges superiores */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {isFeatured && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>Destacado</span>
                        </span>
                      )}
                      {offerPrice && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow">
                          Oferta
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          product.status === 'activo'
                            ? 'bg-emerald-500/80 text-white'
                            : product.status === 'inactivo'
                            ? 'bg-rose-500/80 text-white'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    {/* Badge de disponibilidad */}
                    <div className="absolute bottom-2 left-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          product.is_available
                            ? 'bg-slate-950/80 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {product.is_available ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                  </div>

                  {/* Datos del producto */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{cat?.name || 'Sin categoría'}</span>
                      {product.attributes?.sku && (
                        <span className="font-mono text-[10px] text-slate-400">
                          SKU: {product.attributes.sku}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {product.description || 'Sin descripción detallada.'}
                    </p>
                  </div>

                  {/* Precios (Bs) */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-emerald-400">
                      Bs {offerPrice || product.price}
                    </span>
                    {(previousPrice || (offerPrice && product.price)) && (
                      <span className="text-xs text-slate-400 line-through">
                        Bs {previousPrice || product.price}
                      </span>
                    )}
                  </div>

                  {/* Atributos específicos según vertical */}
                  {store.store_type === 'restaurante' && product.attributes?.modifiers && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="font-semibold text-slate-300 block">Modificadores/Extras:</span>
                      <span>
                        {product.attributes.modifiers.length > 0
                          ? product.attributes.modifiers.map((m: any) => `${m.name} (+Bs ${m.price})`).join(', ')
                          : 'Sin extras configurados'}
                      </span>
                    </div>
                  )}

                  {store.store_type === 'moda' && product.attributes?.sizes && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="font-semibold text-slate-300 block">Tallas:</span>
                      <span className="font-mono">{product.attributes.sizes.join(' • ')}</span>
                    </div>
                  )}

                  {store.store_type === 'servicios' && product.attributes?.duration_minutes && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="font-semibold text-slate-300 block">Duración de Sesión:</span>
                      <span>{product.attributes.duration_minutes} minutos</span>
                    </div>
                  )}
                </div>

                {/* Acciones del Producto */}
                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(product)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      product.is_available
                        ? 'bg-rose-950/30 border-rose-500/30 text-rose-300 hover:bg-rose-950/50'
                        : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/50'
                    }`}
                  >
                    {product.is_available ? 'Marcar Agotado' : 'Habilitar'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Botón de copiar link para compartir */}
                    <button
                      type="button"
                      onClick={() => copyShareLink(product.id)}
                      title="Copiar enlace directo del producto para compartir"
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      {copiedId === product.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Editar */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Editar producto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Formulario de Creación / Edición */}
      {isEditing && currentProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                <span>
                  {currentProduct.id && products.some((p) => p.id === currentProduct.id)
                    ? 'Editar Producto'
                    : 'Nuevo Producto'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentProduct.name || ''}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Ej. Pizza Margherita Di Bufala"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={currentProduct.category_id || ''}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, category_id: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={currentProduct.description || ''}
                  onChange={(e) =>
                    setCurrentProduct({ ...currentProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Detalles de preparación, ingredientes, materiales o alcance..."
                />
              </div>

              {/* Precios (Bs) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Precio Regular (Bs) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={currentProduct.price || 0}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Precio Anterior (Bs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={currentProduct.attributes?.previous_price || ''}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        attributes: {
                          ...currentProduct.attributes,
                          previous_price: e.target.value ? Number(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="Opcional tachado"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Precio Oferta (Bs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={currentProduct.attributes?.offer_price || ''}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        attributes: {
                          ...currentProduct.attributes,
                          offer_price: e.target.value ? Number(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="Opcional promocional"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* URL de Imagen */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  URL de Imagen Principal
                </label>
                <input
                  type="url"
                  value={currentProduct.image_url || ''}
                  onChange={(e) =>
                    setCurrentProduct({ ...currentProduct, image_url: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Estado y Opciones */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estado en Catálogo
                  </label>
                  <select
                    value={currentProduct.status || 'activo'}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        status: e.target.value as ProductStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="borrador">Borrador</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_available_modal"
                    checked={currentProduct.is_available ?? true}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, is_available: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                  <label
                    htmlFor="is_available_modal"
                    className="text-xs font-bold text-white cursor-pointer"
                  >
                    Disponible para Venta
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured_modal"
                    checked={Boolean(currentProduct.attributes?.is_featured)}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        attributes: {
                          ...currentProduct.attributes,
                          is_featured: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                  <label
                    htmlFor="is_featured_modal"
                    className="text-xs font-bold text-white cursor-pointer"
                  >
                    Marcar Destacado
                  </label>
                </div>
              </div>

              {/* Botones de acción del modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
