import React, { useState } from 'react';
import {
  Search,
  Tag,
  Star,
  ShoppingBag,
  Share2,
  Check,
  Clock,
  User,
  Utensils,
  Shirt,
  Briefcase,
  Store as StoreIcon,
  Ruler,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  Product,
  Category,
  StoreType,
  FashionSettings,
  GeneralSettings,
} from '../../types';
import { CartItem } from './types';

interface CatalogViewProps {
  storeType: StoreType;
  products: Product[];
  categories: Category[];
  fashionSettings?: FashionSettings;
  generalSettings?: GeneralSettings;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
  onRequestAppointment?: (serviceId: string) => void;
  onOpenSizeGuide?: () => void;
  primaryColor?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  storeType,
  products,
  categories,
  fashionSettings,
  generalSettings,
  onSelectProduct,
  onQuickAddToCart,
  onRequestAppointment,
  onOpenSizeGuide,
  primaryColor = '#4f46e5',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  // Filtrar únicamente productos activos para el público
  const publicProducts = products.filter((p) => p.status === 'activo');

  // Categorías activas
  const activeCategories = categories.filter((c) => c.status === 'activo');

  // Filtrado por categoría y búsqueda
  const filteredProducts = publicProducts.filter((p) => {
    const matchesCategory =
      selectedCategoryId === 'all' || p.category_id === selectedCategoryId;

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.attributes?.specialty &&
        String(p.attributes.specialty).toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Copiar enlace directo del producto
  const handleShareProduct = (e: React.MouseEvent, productId: string, productName: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#prod-${productId}`;
    if (navigator.share) {
      navigator.share({
        title: productName,
        url: url,
      }).catch(() => {
        copyToClipboard(url, productId);
      });
    } else {
      copyToClipboard(url, productId);
    }
  };

  const copyToClipboard = (text: string, productId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedProductId(productId);
    setTimeout(() => setCopiedProductId(null), 2500);
  };

  const layout = generalSettings?.catalogLayout || 'grid';

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Búsqueda */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Campo de Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                storeType === 'servicios'
                  ? 'Buscar servicio, masaje, tratamiento...'
                  : storeType === 'restaurante'
                  ? 'Buscar pizza, pasta, postre, bebida...'
                  : storeType === 'moda'
                  ? 'Buscar prenda, vestido, calzado...'
                  : 'Buscar productos en el catálogo...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Botón Guía de Tallas (Moda) */}
          {storeType === 'moda' && onOpenSizeGuide && (
            <button
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
            >
              <Ruler className="w-3.5 h-3.5 text-indigo-400" />
              <span>Guía de Tallas & Cambios</span>
            </button>
          )}
        </div>

        {/* Pestañas de Categorías */}
        {activeCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              Todos ({publicProducts.length})
            </button>

            {activeCategories.map((cat) => {
              const count = publicProducts.filter((p) => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategoryId === cat.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejilla o Lista de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2 rounded-2xl bg-slate-900/40 border border-slate-800">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 mb-1" />
          <p className="text-sm font-semibold text-slate-300">No se encontraron productos disponibles</p>
          <p className="text-xs text-slate-500">
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Intenta con otra búsqueda.`
              : 'Este comercio aún no ha publicado productos en esta categoría.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-indigo-400 hover:underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
              : 'space-y-3'
          }
        >
          {filteredProducts.map((product) => {
            const previousPrice = product.attributes?.previous_price as number | undefined;
            const hasOffer = previousPrice && previousPrice > product.price;
            const isFeatured = Boolean(product.attributes?.is_featured);

            // Moda
            const sizes = (product.attributes?.sizes as string[]) || [];
            const colors = (product.attributes?.colors as Array<{ name: string; hex: string }>) || [];

            // Restaurante
            const isCombo = Boolean(product.attributes?.is_combo);
            const modifiers = (product.attributes?.modifiers as Array<{ name: string; price: number }>) || [];

            // Servicios
            const isService = storeType === 'servicios' || Boolean(product.attributes?.is_service);
            const duration = (product.attributes?.duration_minutes as number) || 60;
            const specialty = (product.attributes?.specialty as string) || '';
            const professionalName = (product.attributes?.professional_name as string) || '';

            return (
              <div
                key={product.id}
                id={`prod-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="group rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 p-4 transition duration-200 hover:shadow-xl flex flex-col justify-between cursor-pointer relative"
              >
                <div>
                  {/* Imagen y Badges */}
                  <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 mb-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                        {storeType === 'restaurante' ? (
                          <Utensils className="w-10 h-10" />
                        ) : storeType === 'moda' ? (
                          <Shirt className="w-10 h-10" />
                        ) : storeType === 'servicios' ? (
                          <Briefcase className="w-10 h-10" />
                        ) : (
                          <StoreIcon className="w-10 h-10" />
                        )}
                      </div>
                    )}

                    {/* Insignia de Destacado */}
                    {isFeatured && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>Destacado</span>
                      </span>
                    )}

                    {/* Insignia de Oferta */}
                    {hasOffer && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] shadow">
                        Oferta
                      </span>
                    )}

                    {/* Disponibilidad si está agotado */}
                    {!product.is_available && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white font-bold text-xs shadow-lg">
                          Agotado
                        </span>
                      </div>
                    )}

                    {/* Botón compartir producto flotante */}
                    <button
                      type="button"
                      onClick={(e) => handleShareProduct(e, product.id, product.name)}
                      className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/70 hover:bg-black text-slate-300 hover:text-white transition shadow cursor-pointer opacity-90 group-hover:opacity-100"
                      title="Compartir enlace de este producto"
                    >
                      {copiedProductId === product.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Nombre y descripción */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Específico por Vertical */}
                  {/* MODA */}
                  {storeType === 'moda' && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                      {sizes.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          Tallas: {sizes.join(', ')}
                        </span>
                      )}
                      {colors.length > 0 && (
                        <div className="flex items-center gap-1 ml-1">
                          {colors.slice(0, 4).map((c) => (
                            <span
                              key={c.name}
                              className="w-2.5 h-2.5 rounded-full border border-slate-700"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* RESTAURANTE */}
                  {storeType === 'restaurante' && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                      {isCombo && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                          Combo Especial
                        </span>
                      )}
                      {modifiers.length > 0 && (
                        <span className="text-slate-500">
                          {modifiers.length} extras disponibles
                        </span>
                      )}
                    </div>
                  )}

                  {/* SERVICIOS */}
                  {isService && (
                    <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{duration} min</span>
                        </span>
                        {specialty && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="truncate text-slate-300">{specialty}</span>
                          </>
                        )}
                      </div>
                      {professionalName && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-cyan-400" />
                          <span>{professionalName}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Fila de precio y acciones */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-white font-mono">
                      Bs {product.price.toFixed(2)}
                    </span>
                    {hasOffer && previousPrice && (
                      <span className="text-xs line-through text-slate-500 font-mono">
                        Bs {previousPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {isService && onRequestAppointment ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestAppointment(product.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Cita</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!product.is_available}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Si tiene tallas o modificadores, abrir modal para que el cliente elija
                        if (sizes.length > 0 || modifiers.length > 0) {
                          onSelectProduct(product);
                        } else {
                          onQuickAddToCart(product);
                        }
                      }}
                      style={{ backgroundColor: product.is_available ? primaryColor : undefined }}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        product.is_available
                          ? 'text-white shadow-md shadow-indigo-600/20 hover:opacity-90'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{sizes.length > 0 || modifiers.length > 0 ? 'Elegir' : 'Agregar'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
