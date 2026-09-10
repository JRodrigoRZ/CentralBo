import React, { useState } from 'react';
import {
  Search,
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
  Plus,
} from 'lucide-react';
import {
  Product,
  Category,
  StoreType,
  FashionSettings,
  GeneralSettings,
} from '../../types';
import { PriceDisplay } from '../common/PriceDisplay';

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
  primaryColor = '#2563eb',
}) => {
  const isRestaurant = storeType === 'restaurante';
  const isFashion = storeType === 'moda';
  const isServices = storeType === 'servicios';
  const isRetail = storeType === 'retail' || (storeType as string) === 'supermercado';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isFashion ? 'text-stone-400 dark:text-rose-300/70' : isRestaurant ? 'text-stone-400' : 'text-slate-400'
              }`}
            />
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
                  ? 'Buscar prenda, vestido, blusa, calzado...'
                  : isRetail
                  ? 'Buscar frutas, verduras, lácteos, abarrotes, limpieza...'
                  : 'Buscar productos en el catálogo...'
              }
              className={
                isFashion
                  ? 'w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400/30 transition'
                  : isServices
                  ? 'w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 dark:bg-[#121A15]/90 border border-emerald-900/15 dark:border-emerald-500/20 text-sm text-stone-900 dark:text-white placeholder-emerald-800/40 dark:placeholder-emerald-300/40 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition'
                  : isRetail
                  ? 'w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 dark:bg-[#0F172A]/90 border border-blue-900/15 dark:border-blue-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition'
                  : isRestaurant
                  ? 'w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 transition'
                  : 'w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition'
              }
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Botón Guía de Tallas (Moda) */}
          {storeType === 'moda' && onOpenSizeGuide && (
            <button
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-stone-900/90 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Ruler className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>Guía de Tallas & Cambios</span>
            </button>
          )}
        </div>

        {/* Pestañas de Categorías */}
        {activeCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={
                isFashion
                  ? `px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategoryId === 'all'
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-bold shadow-sm'
                        : 'bg-white/80 hover:bg-stone-100 dark:bg-stone-900/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200/80 dark:border-stone-800 font-medium'
                    }`
                  : isServices
                  ? `px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategoryId === 'all'
                        ? 'bg-emerald-800 text-white dark:bg-emerald-600 dark:text-white font-bold shadow-sm'
                        : 'bg-white/90 hover:bg-emerald-50/80 dark:bg-[#121A15]/90 dark:hover:bg-[#17221C] text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-200 border border-emerald-900/15 dark:border-emerald-500/20 font-medium'
                    }`
                  : isRestaurant
                  ? `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategoryId === 'all'
                        ? 'bg-amber-600 text-white font-bold shadow-sm'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 text-xs font-medium'
                    }`
                  : `px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategoryId === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`
              }
            >
              Todos ({publicProducts.length})
            </button>

            {activeCategories.map((cat) => {
              const count = publicProducts.filter((p) => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={
                    isFashion
                      ? `px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          selectedCategoryId === cat.id
                            ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-bold shadow-sm'
                            : 'bg-white/80 hover:bg-stone-100 dark:bg-stone-900/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200/80 dark:border-stone-800 font-medium'
                        }`
                      : isServices
                      ? `px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          selectedCategoryId === cat.id
                            ? 'bg-emerald-800 text-white dark:bg-emerald-600 dark:text-white font-bold shadow-sm'
                            : 'bg-white/90 hover:bg-emerald-50/80 dark:bg-[#121A15]/90 dark:hover:bg-[#17221C] text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-200 border border-emerald-900/15 dark:border-emerald-500/20 font-medium'
                        }`
                      : isRestaurant
                      ? `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          selectedCategoryId === cat.id
                            ? 'bg-amber-600 text-white font-bold shadow-sm'
                            : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 text-xs font-medium'
                        }`
                      : `px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          selectedCategoryId === cat.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                        }`
                  }
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
        <div className={`py-16 text-center space-y-2 rounded-2xl border shadow-xs ${
          isRestaurant
            ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-400'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
        }`}>
          <ShoppingBag className="w-10 h-10 mx-auto text-stone-400 dark:text-stone-600 mb-1" />
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">No se encontraron productos disponibles</p>
          <p className="text-xs text-stone-500">
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Intenta con otra búsqueda.`
              : 'Este comercio aún no ha publicado productos en esta categoría.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`mt-2 text-xs font-medium cursor-pointer hover:underline ${
                isRestaurant ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
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

            // Renderizado especializado para Gastronomía / Restaurante
            if (isRestaurant) {
              const hasBrokenImage = !product.image_url || imgErrors[product.id];

              return (
                <div
                  key={product.id}
                  id={`prod-${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="group rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative"
                >
                  {/* Área Fotográfica con Fallback Robusto */}
                  <div className={`relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-800/60 ${
                    !product.is_available ? 'grayscale-[35%] opacity-75' : ''
                  }`}>
                    {hasBrokenImage ? (
                      <div className="w-full h-full bg-stone-100 dark:bg-stone-800/90 flex flex-col items-center justify-center gap-2 text-stone-400 select-none p-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Utensils className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                            Plato Artesanal
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 block">
                            Preparado en cocina
                          </span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        onError={() => setImgErrors((prev) => ({ ...prev, [product.id]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}

                    {/* Insignia de Destacado */}
                    {isFeatured && (
                      <span className="top-3 left-3 absolute px-2.5 py-1 rounded-md bg-amber-500/90 text-stone-950 font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-stone-950 text-stone-950" />
                        <span>Destacado</span>
                      </span>
                    )}

                    {/* Insignia de Oferta */}
                    {hasOffer && (
                      <span className="top-3 right-12 absolute px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold text-[10px] shadow-xs">
                        Oferta
                      </span>
                    )}

                    {/* Disponibilidad si está agotado */}
                    {!product.is_available && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-stone-900/90 text-stone-200 border border-stone-700 font-semibold text-xs shadow-lg">
                          Agotado
                        </span>
                      </div>
                    )}

                    {/* Botón compartir producto flotante */}
                    <button
                      type="button"
                      onClick={(e) => handleShareProduct(e, product.id, product.name)}
                      className="top-3 right-3 absolute w-7 h-7 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md flex items-center justify-center text-xs transition-colors shadow cursor-pointer"
                      title="Compartir enlace de este plato"
                    >
                      {copiedProductId === product.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Información del Plato */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-snug mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-3">
                          {product.description}
                        </p>
                      )}

                      {/* Badges de Extras / Combo */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {modifiers.length > 0 && (
                          <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-800/40 inline-block mb-3 font-medium">
                            {modifiers.length} extras disponibles
                          </span>
                        )}
                        {isCombo && (
                          <span className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800/60 font-semibold inline-block mb-3">
                            Combo Especial
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fila de precio y acciones */}
                    <div className="pt-3 mt-3 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-stone-900 dark:text-white">
                          Bs {product.price.toLocaleString('es-BO')}
                        </span>
                        {hasOffer && previousPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            Bs {previousPrice.toLocaleString('es-BO')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!product.is_available}
                        onClick={(e) => {
                          if (!product.is_available) return;
                          e.stopPropagation();
                          if (modifiers.length > 0) {
                            onSelectProduct(product);
                          } else {
                            onQuickAddToCart(product);
                          }
                        }}
                        className={
                          !product.is_available
                            ? 'px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 text-xs font-semibold cursor-not-allowed border border-stone-200 dark:border-stone-700/60 select-none'
                            : modifiers.length > 0
                            ? 'px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]'
                            : 'px-4 py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white dark:bg-stone-800 dark:hover:bg-amber-600 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]'
                        }
                      >
                        {!product.is_available ? (
                          <span>Agotado</span>
                        ) : modifiers.length > 0 ? (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Elegir</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Renderizado especializado para Moda / Boutique (Lookbook Editorial)
            if (isFashion) {
              const hasBrokenImage = !product.image_url || imgErrors[product.id];

              return (
                <div
                  key={product.id}
                  id={`prod-${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="group rounded-3xl bg-white/90 dark:bg-[#151518] border border-stone-200/80 dark:border-stone-800 hover:border-stone-400/80 dark:hover:border-stone-700 p-4 transition-all duration-300 hover:shadow-xl flex flex-col justify-between cursor-pointer relative"
                >
                  <div>
                    {/* Imagen Editorial Vertical (Aspect 3:4) */}
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 mb-3.5">
                      {hasBrokenImage ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-400 bg-stone-100 dark:bg-stone-900 select-none p-4 text-center">
                          <Shirt className="w-10 h-10 text-stone-400 dark:text-stone-500" />
                          <span className="text-xs font-serif text-stone-600 dark:text-stone-300">
                            Prenda Milano
                          </span>
                        </div>
                      ) : (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          onError={() => setImgErrors((prev) => ({ ...prev, [product.id]: true }))}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}

                      {/* Insignia de Destacado */}
                      {isFeatured && (
                        <span className="top-3 left-3 absolute px-2.5 py-1 rounded-full bg-stone-900/85 text-white dark:bg-white/90 dark:text-stone-950 font-medium text-[10px] tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Colección</span>
                        </span>
                      )}

                      {/* Insignia de Oferta */}
                      {hasOffer && (
                        <span className="top-3 right-11 absolute px-2.5 py-0.5 rounded-full bg-rose-500/90 text-white font-bold text-[10px] shadow-sm tracking-wide">
                          Oferta
                        </span>
                      )}

                      {/* Disponibilidad si está agotado */}
                      {!product.is_available && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3.5 py-1 rounded-full bg-stone-900/95 text-stone-200 border border-stone-700 font-medium text-xs shadow-lg">
                            Agotado
                          </span>
                        </div>
                      )}

                      {/* Botón compartir producto flotante */}
                      <button
                        type="button"
                        onClick={(e) => handleShareProduct(e, product.id, product.name)}
                        className="top-3 right-3 absolute w-7 h-7 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md flex items-center justify-center text-xs transition-colors shadow cursor-pointer"
                        title="Compartir enlace de esta prenda"
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
                      <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition line-clamp-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Tallas y Colores */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-500 dark:text-stone-400">
                      {sizes.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] uppercase font-bold text-stone-400 mr-0.5">Tallas:</span>
                          {sizes.map((sz) => (
                            <span
                              key={sz}
                              className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Muestras visuales de color (swatches) */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Colores:</span>
                        <div className="flex items-center gap-1">
                          {(colors.length > 0 ? colors.map((c) => c.hex) : ['#8A3324', '#D4AF37', '#1C1917']).map((color, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-stone-300 dark:border-stone-700 shadow-sm inline-block"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fila de precio y acciones */}
                  <div className="pt-3 mt-4 border-t border-stone-200/70 dark:border-stone-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                        Bs {product.price.toLocaleString('es-BO')}
                      </span>
                      {hasOffer && previousPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          Bs {previousPrice.toLocaleString('es-BO')}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!product.is_available}
                      onClick={(e) => {
                        if (!product.is_available) return;
                        e.stopPropagation();
                        if (sizes.length > 0) {
                          onSelectProduct(product);
                        } else {
                          onQuickAddToCart(product);
                        }
                      }}
                      className={
                        !product.is_available
                          ? 'px-3.5 py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 text-xs font-semibold cursor-not-allowed border border-stone-200 dark:border-stone-700/60 select-none'
                          : 'px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-200 dark:text-stone-950 text-xs font-semibold shadow-sm transition active:scale-[0.98] flex items-center gap-1.5 cursor-pointer'
                      }
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{sizes.length > 0 ? 'Elegir Talla' : 'Agregar'}</span>
                    </button>
                  </div>
                </div>
              );
            }

            // Renderizado especializado para Spa & Servicios (Botánica & Bienestar Zen)
            if (isServices) {
              const hasBrokenImage = !product.image_url || imgErrors[product.id];

              return (
                <div
                  key={product.id}
                  id={`prod-${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="group rounded-3xl bg-white/95 dark:bg-[#111914] border border-emerald-900/10 dark:border-emerald-500/15 hover:border-emerald-700/40 dark:hover:border-emerald-500/30 p-4 sm:p-5 transition-all duration-300 hover:shadow-lg flex flex-col justify-between cursor-pointer relative"
                >
                  <div>
                    {/* Imagen del tratamiento con Aspect Ratio Calmo */}
                    <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#EBF3EB] dark:bg-[#0A120E] border border-emerald-900/10 dark:border-emerald-500/15 mb-4">
                      {hasBrokenImage ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-emerald-700/60 dark:text-emerald-400/60 bg-[#EBF3EB] dark:bg-[#0A120E] select-none p-4 text-center">
                          <Briefcase className="w-10 h-10 text-emerald-600/50 dark:text-emerald-400/50" />
                          <span className="text-xs font-serif text-emerald-800 dark:text-emerald-200">
                            Tratamiento Zenit
                          </span>
                        </div>
                      ) : (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          onError={() => setImgErrors((prev) => ({ ...prev, [product.id]: true }))}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}

                      {/* Insignia de Destacado */}
                      {isFeatured && (
                        <span className="top-3 left-3 absolute px-2.5 py-1 rounded-full bg-emerald-900/80 text-emerald-100 dark:bg-emerald-950/90 dark:text-emerald-200 font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs flex items-center gap-1 shadow-xs border border-emerald-500/20">
                          <Star className="w-3 h-3 fill-emerald-300 text-emerald-300" />
                          <span>Destacado</span>
                        </span>
                      )}

                      {/* Insignia de Oferta */}
                      {hasOffer && (
                        <span className="top-3 right-12 absolute px-2.5 py-1 rounded-full bg-rose-600/90 text-white font-bold text-[10px] shadow-xs">
                          Oferta
                        </span>
                      )}

                      {/* Disponibilidad */}
                      {!product.is_available && (
                        <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3.5 py-1.5 rounded-full bg-stone-900/90 text-stone-200 border border-stone-700 font-semibold text-xs shadow-lg">
                            No disponible temporalmente
                          </span>
                        </div>
                      )}

                      {/* Botón compartir flotante */}
                      <button
                        type="button"
                        onClick={(e) => handleShareProduct(e, product.id, product.name)}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white transition shadow cursor-pointer opacity-90 group-hover:opacity-100"
                        title="Compartir tratamiento"
                      >
                        {copiedProductId === product.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Categoría o especialidad */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                        {specialty || 'Sesión Terapéutica'}
                      </span>
                    </div>

                    {/* Nombre y descripción */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition line-clamp-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed font-normal">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Fila de Duración & Terapeuta */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF3EB] dark:bg-[#16231B] text-emerald-800 dark:text-emerald-300 font-medium text-[11px] border border-emerald-900/10 dark:border-emerald-500/15">
                        <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>{duration} minutos</span>
                      </span>

                      {professionalName && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span className="truncate max-w-[140px]">{professionalName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fila de precio y acciones */}
                  <div className="pt-3.5 mt-4 border-t border-emerald-900/10 dark:border-emerald-500/15 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                        Bs {product.price.toLocaleString('es-BO')}
                      </span>
                      {hasOffer && previousPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          Bs {previousPrice.toLocaleString('es-BO')}
                        </span>
                      )}
                    </div>

                    {onRequestAppointment ? (
                      <button
                        type="button"
                        disabled={!product.is_available}
                        onClick={(e) => {
                          if (!product.is_available) return;
                          e.stopPropagation();
                          onRequestAppointment(product.id);
                        }}
                        className={
                          !product.is_available
                            ? 'px-4 py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 text-xs font-semibold cursor-not-allowed border border-stone-200 dark:border-stone-700/60 select-none'
                            : 'px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold shadow-sm transition active:scale-[0.98] flex items-center gap-1.5 cursor-pointer'
                        }
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Agendar Cita</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!product.is_available}
                        onClick={(e) => {
                          if (!product.is_available) return;
                          e.stopPropagation();
                          onQuickAddToCart(product);
                        }}
                        className={
                          !product.is_available
                            ? 'px-4 py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 text-xs font-semibold cursor-not-allowed border border-stone-200 dark:border-stone-700/60 select-none'
                            : 'px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold shadow-sm transition active:scale-[0.98] flex items-center gap-1.5 cursor-pointer'
                        }
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Reservar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Renderizado para Servicios y Comercio General
            return (
              <div
                key={product.id}
                id={`prod-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 transition duration-200 hover:shadow-md flex flex-col justify-between cursor-pointer relative"
              >
                <div>
                  {/* Imagen y Badges */}
                  <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 mb-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-950">
                        {storeType === 'moda' ? (
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
                      className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black text-white transition shadow cursor-pointer opacity-90 group-hover:opacity-100"
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
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Específico por Vertical */}
                  {/* MODA */}
                  {storeType === 'moda' && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      {sizes.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          Tallas: {sizes.join(', ')}
                        </span>
                      )}
                      {colors.length > 0 && (
                        <div className="flex items-center gap-1 ml-1">
                          {colors.slice(0, 4).map((c) => (
                            <span
                              key={c.name}
                              className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-700"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SERVICIOS */}
                  {isService && (
                    <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>{duration} min</span>
                        </span>
                        {specialty && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="truncate text-slate-700 dark:text-slate-300">{specialty}</span>
                          </>
                        )}
                      </div>
                      {professionalName && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{professionalName}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Fila de precio y acciones */}
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <PriceDisplay amount={product.price} size="md" />
                    {hasOffer && previousPrice && (
                      <PriceDisplay amount={previousPrice} size="xs" isPreviousPrice />
                    )}
                  </div>

                  {isService && onRequestAppointment ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestAppointment(product.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
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
                        if (sizes.length > 0) {
                          onSelectProduct(product);
                        } else {
                          onQuickAddToCart(product);
                        }
                      }}
                      style={{ backgroundColor: product.is_available ? primaryColor : undefined }}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        product.is_available
                          ? 'text-white shadow-xs hover:opacity-90'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{sizes.length > 0 ? 'Elegir' : 'Agregar'}</span>
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
