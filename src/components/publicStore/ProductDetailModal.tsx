import React, { useState, useMemo } from 'react';
import {
  X,
  Share2,
  Check,
  Star,
  Ruler,
  ShoppingBag,
  Clock,
  User,
  Plus,
  Minus,
  Utensils,
  Shirt,
  Briefcase,
  Store as StoreIcon,
  Truck,
  Building2,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Product, Category, StoreType, FashionSettings, RestaurantSettings } from '../../types';
import { CartItem, CartModifier, CartColorVariant } from './types';
import { getModalMotionProps, getVerticalMotionProfile } from './motionSystem';

export interface ProductDetailModalProps {
  product: Product;
  storeType: StoreType;
  storeName?: string;
  categories?: Category[];
  fashionSettings?: FashionSettings;
  restaurantSettings?: RestaurantSettings;
  onAddToCart: (item: CartItem) => void;
  onRequestAppointment?: (serviceId: string) => void;
  onOpenSizeGuide?: () => void;
  onClose: () => void;
  primaryColor?: string;
  brandSecondaryColor?: string;
  brandAccentColor?: string;
  onOpenCart?: () => void;
}

// Cálculo de contraste WCAG AA para botones o píldoras con color de marca
function getContrastColor(hexColor?: string): '#ffffff' | '#18181b' {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  let c = hexColor.substring(1);
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return '#ffffff';
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#18181b' : '#ffffff';
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  storeType,
  storeName,
  categories = [],
  fashionSettings,
  restaurantSettings,
  onAddToCart,
  onRequestAppointment,
  onOpenSizeGuide,
  onClose,
  primaryColor = '#2563eb',
  onOpenCart,
}) => {
  const isRestaurant = storeType === 'restaurante';
  const isFashion = storeType === 'moda';
  const isServices = storeType === 'servicios';
  const shouldReduceMotion = useReducedMotion();

  const allowKitchenNotes = restaurantSettings ? restaurantSettings.allowKitchenNotes : true;

  const [copiedLink, setCopiedLink] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Atributos de moda reales
  const sizes = (product.attributes?.sizes as string[]) || [];
  const colors = (product.attributes?.colors as Array<{ name: string; hex: string }>) || [];
  const galleryImages = (product.attributes?.gallery_images as string[]) || (product.image_url ? [product.image_url] : []);

  const [activeImage, setActiveImage] = useState<string | null>(
    galleryImages[0] || product.image_url || null
  );
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<CartColorVariant | undefined>(
    colors[0] ? { name: colors[0].name, hex: colors[0].hex } : undefined
  );

  // Atributos de restaurante reales
  const modifiers = (product.attributes?.modifiers as Array<{ name: string; price: number }>) || [];
  const [selectedModifiers, setSelectedModifiers] = useState<CartModifier[]>([]);
  const [kitchenNotes, setKitchenNotes] = useState('');
  const isCombo = Boolean(product.attributes?.is_combo);
  const comboItems = (product.attributes?.combo_items as string[]) || [];

  // Atributos de servicios reales
  const isService = storeType === 'servicios' || Boolean(product.attributes?.is_service);
  const duration =
    typeof product.attributes?.duration_minutes === 'number' &&
    product.attributes.duration_minutes > 0
      ? product.attributes.duration_minutes
      : null;
  const specialty = (product.attributes?.specialty as string) || '';
  const professionalName = (product.attributes?.professional_name as string) || '';

  // Nombre de la categoría real
  const categoryName = useMemo(() => {
    if (!product.category_id) return null;
    const cat = categories.find((c) => c.id === product.category_id);
    return cat ? cat.name : null;
  }, [product.category_id, categories]);

  // Precios reales
  const basePrice = product.price;
  const previousPrice = product.attributes?.previous_price as number | undefined;
  const hasOffer = previousPrice != null && previousPrice > basePrice;
  const discountPercent = hasOffer
    ? Math.round(((previousPrice - basePrice) / previousPrice) * 100)
    : 0;
  const savingsAmount = hasOffer ? previousPrice - basePrice : 0;

  // Cálculo de modificadores sumados al precio
  const modifiersSum = selectedModifiers.reduce((acc, m) => acc + m.price, 0);
  const unitFinalPrice = basePrice + modifiersSum;
  const totalItemPrice = unitFinalPrice * quantity;

  const contrastColor = getContrastColor(primaryColor);

  const handleModifierToggle = (mod: { name: string; price: number }) => {
    if (selectedModifiers.some((m) => m.name === mod.name)) {
      setSelectedModifiers(selectedModifiers.filter((m) => m.name !== mod.name));
    } else {
      setSelectedModifiers([...selectedModifiers, mod]);
    }
  };

  const handleShareProduct = () => {
    const url = `${window.location.origin}${window.location.pathname}#prod-${product.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: product.description || `Mira ${product.name} en ${storeName || 'la tienda'}`,
          url: url,
        })
        .catch(() => copyToClipboard(url));
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddToCart = () => {
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: unitFinalPrice,
      basePrice: basePrice,
      quantity: quantity,
      imageUrl: activeImage || product.image_url,
      storeType: storeType,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
      selectedModifiers: selectedModifiers.length > 0 ? selectedModifiers : undefined,
      kitchenNotes: (allowKitchenNotes && kitchenNotes.trim()) ? kitchenNotes.trim() : undefined,
      isCombo: isCombo,
      comboItems: comboItems.length > 0 ? comboItems : undefined,
      isService: isService,
      serviceDetails: isService
        ? {
            durationMinutes: duration,
            specialty: specialty,
            professionalName: professionalName,
          }
        : undefined,
    };

    onAddToCart(item);
    setAddedSuccess(true);
  };

  const hasImage = Boolean(activeImage && !imgError);

  // Propiedades de animación de modal según perfil de movimiento
  const modalMotionProps = getModalMotionProps(storeType, shouldReduceMotion);

  // Proporción visual óptima según vertical
  const imageAspectClass = isFashion
    ? 'aspect-[3/4]'
    : isRestaurant || isServices
    ? 'aspect-[16/10]'
    : 'aspect-[4/3]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        {...modalMotionProps}
        className="w-full max-w-3xl rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* CABECERA DEL MODAL */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-50/70 dark:bg-stone-950/70 backdrop-blur-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {Boolean(product.attributes?.is_featured) && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Destacado</span>
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                product.is_available
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              {product.is_available ? 'Disponible' : 'Agotado'}
            </span>
            {categoryName && (
              <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden sm:inline-block">
                • {categoryName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareProduct}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700/60 transition cursor-pointer"
              title="Compartir enlace de este producto"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              title="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CUERPO DEL MODAL (DESPLAZABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* COLUMNA IZQUIERDA: FOTOGRAFÍA O FALLBACK NEUTRO */}
            <div className="space-y-3">
              <div
                className={`w-full rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden relative shadow-inner bg-stone-100 dark:bg-stone-800/60 ${imageAspectClass} select-none`}
              >
                {hasImage ? (
                  <img
                    src={activeImage!}
                    alt={product.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Fallback visual neutro y refinado respetando la identidad del comercio */
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-2.5 p-6 text-center"
                    style={{ backgroundColor: `${primaryColor}0a` }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xs"
                      style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                    >
                      {isRestaurant ? (
                        <Utensils className="w-7 h-7" />
                      ) : isFashion ? (
                        <Shirt className="w-7 h-7" />
                      ) : isServices ? (
                        <Briefcase className="w-7 h-7" />
                      ) : (
                        <StoreIcon className="w-7 h-7" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {categoryName || (isRestaurant ? 'Gastronomía' : isFashion ? 'Moda' : isServices ? 'Servicio' : 'Producto')}
                    </span>
                  </div>
                )}

                {/* Badge de Oferta */}
                {hasOffer && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs shadow-md tracking-wider">
                    {discountPercent > 0 ? `-${discountPercent}%` : 'OFERTA'}
                  </span>
                )}

                {/* Estado Agotado */}
                {!product.is_available && (
                  <div className="absolute inset-0 bg-stone-950/65 backdrop-blur-[2px] flex items-center justify-center p-3">
                    <span className="px-3.5 py-1.5 rounded-full bg-stone-900/95 text-stone-100 border border-stone-700 font-bold text-xs shadow-lg flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      <span>Agotado</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Miniaturas de Galería (Solo si existen múltiples fotos reales) */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImage(img);
                        setImgError(false);
                      }}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                        activeImage === img
                          ? 'shadow-sm'
                          : 'opacity-60 hover:opacity-100 border-stone-200 dark:border-stone-800'
                      }`}
                      style={
                        activeImage === img
                          ? { borderColor: primaryColor }
                          : undefined
                      }
                    >
                      <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN, VARIANTES Y EXTRAS */}
            <div className="space-y-4">
              <div>
                {/* Categoría o Especialidad */}
                {(categoryName || specialty) && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
                    {specialty || categoryName}
                  </span>
                )}

                {/* Nombre Real */}
                <h2 className="text-xl sm:text-2xl font-bold leading-snug text-stone-900 dark:text-white">
                  {product.name}
                </h2>

                {/* Precios Reales en Bolivianos (Bs) */}
                <div className="flex items-baseline gap-2.5 mt-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
                    Bs {unitFinalPrice.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {hasOffer && previousPrice && (
                    <span className="text-sm line-through text-stone-400 dark:text-stone-500 select-none">
                      Bs {previousPrice.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {hasOffer && (
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                      Ahorras Bs {savingsAmount.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Descripción Real */}
                {product.description && (
                  <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* ----------------- VERTICAL: MODA ----------------- */}
              {isFashion && (
                <div className="space-y-4 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                  {/* Selector de Tallas Reales */}
                  {sizes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Selecciona tu Talla:
                        </label>
                        {onOpenSizeGuide && (
                          <button
                            type="button"
                            onClick={onOpenSizeGuide}
                            className="inline-flex items-center gap-1 text-xs font-medium transition cursor-pointer hover:underline"
                            style={{ color: primaryColor }}
                          >
                            <Ruler className="w-3.5 h-3.5" />
                            <span>Guía de Tallas</span>
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((sz) => {
                          const isSelected = selectedSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSelectedSize(sz)}
                              className={`min-w-[44px] h-10 px-3.5 rounded-xl font-bold text-xs border transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-95 ${
                                isSelected
                                  ? 'shadow-xs'
                                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                              }`}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: primaryColor,
                                      borderColor: primaryColor,
                                      color: contrastColor,
                                    }
                                  : undefined
                              }
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selector de Colores Reales */}
                  {colors.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Color:{' '}
                        <span className="text-stone-500 dark:text-stone-400 font-normal">
                          {selectedColor?.name}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {colors.map((col) => {
                          const isSelected = selectedColor?.name === col.name;
                          return (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => setSelectedColor(col)}
                              title={col.name}
                              className={`w-9 h-9 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-90 ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-stone-900 border-white'
                                  : 'border-stone-300 dark:border-stone-600 hover:border-stone-400'
                              }`}
                              style={{
                                backgroundColor: col.hex,
                                borderColor: isSelected ? primaryColor : undefined,
                              }}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4 text-white drop-shadow-sm" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Política de Cambios */}
                  {fashionSettings?.exchangePolicy && (
                    <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60 text-[11px] text-stone-600 dark:text-stone-400">
                      <strong className="text-stone-800 dark:text-stone-200 block mb-0.5">
                        Política de Cambios:
                      </strong>
                      {fashionSettings.exchangePolicy}
                    </div>
                  )}
                </div>
              )}

              {/* ----------------- VERTICAL: GASTRONOMÍA ----------------- */}
              {isRestaurant && (
                <div className="space-y-4 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                  {/* Combos Reales */}
                  {isCombo && comboItems.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Este Menú Incluye:</span>
                      </div>
                      <ul className="text-xs text-stone-600 dark:text-stone-300 list-disc list-inside space-y-0.5 pl-1">
                        {comboItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Modificadores / Extras Reales */}
                  {modifiers.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Extras & Opciones Especiales:
                      </label>
                      <div className="space-y-1.5">
                        {modifiers.map((mod) => {
                          const isSelected = selectedModifiers.some((m) => m.name === mod.name);
                          return (
                            <label
                              key={mod.name}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                isSelected
                                  ? 'border-transparent shadow-xs'
                                  : 'bg-stone-50 dark:bg-stone-950 border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                              }`}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: `${primaryColor}14`,
                                      borderColor: `${primaryColor}40`,
                                      color: primaryColor,
                                    }
                                  : undefined
                              }
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleModifierToggle(mod)}
                                  className="w-4 h-4 rounded text-blue-600 border-stone-300 dark:border-stone-700 cursor-pointer"
                                  style={{ accentColor: primaryColor }}
                                />
                                <span className="font-medium text-stone-800 dark:text-stone-200">
                                  {mod.name}
                                </span>
                              </div>
                              <span className="font-semibold text-stone-900 dark:text-stone-100">
                                +Bs {mod.price.toFixed(2)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Instrucciones para Cocina */}
                  {allowKitchenNotes && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Instrucciones para la Cocina (Opcional):
                      </label>
                      <textarea
                        rows={2}
                        value={kitchenNotes}
                        onChange={(e) => setKitchenNotes(e.target.value)}
                        placeholder="Ej. Sin cebolla, salsa aparte, aderezo extra..."
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-stone-400 resize-none"
                      />
                    </div>
                  )}

                  {/* Indicadores de Entrega Neutros */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Entrega disponible</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Retiro en local</span>
                    </span>
                  </div>
                </div>
              )}

              {/* ----------------- VERTICAL: SERVICIOS ----------------- */}
              {isService && (duration !== null || specialty || professionalName) && (
                <div className="space-y-3 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                  {(duration !== null || specialty) && (
                    <div
                      className={`grid ${
                        duration !== null && specialty ? 'grid-cols-2' : 'grid-cols-1'
                      } gap-2 text-xs`}
                    >
                      {duration !== null && (
                        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800">
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium block">
                            Duración:
                          </span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>{duration} minutos</span>
                          </span>
                        </div>
                      )}

                      {specialty && (
                        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800">
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium block">
                            Especialidad:
                          </span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block mt-0.5">
                            {specialty}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {professionalName && (
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium block">
                          Profesional a cargo:
                        </span>
                        <span className="font-bold text-stone-900 dark:text-white">
                          {professionalName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PIE DEL MODAL: CANTIDAD & ACCIÓN PRINCIPAL */}
        <div className="p-4 sm:px-6 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-stone-50/70 dark:bg-stone-950/70 backdrop-blur-xs">
          {addedSuccess ? (
            /* Estado de Confirmación al Agregar */
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {isFashion ? '¡Prenda agregada a tu selección!' : '¡Producto agregado al carrito!'}
                  </p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300">
                    {quantity} {quantity === 1 ? 'unidad' : 'unidades'} • Subtotal: Bs {totalItemPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="btn-modal-continue-shopping"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300/80 dark:hover:bg-stone-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Seguir explorando</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-open-cart"
                  onClick={() => {
                    onClose();
                    if (onOpenCart) onOpenCart();
                  }}
                  className="flex-1 sm:flex-initial py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition hover:opacity-90 cursor-pointer active:scale-98"
                  style={{ backgroundColor: primaryColor, color: contrastColor }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isFashion ? 'Ver mi selección' : 'Abrir carrito'}</span>
                </button>
              </div>
            </div>
          ) : isService && onRequestAppointment ? (
            /* Flujo de Citas para Servicios */
            <div className="w-full sm:w-auto flex-1 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestAppointment(product.id);
                }}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 hover:brightness-105"
                style={{ backgroundColor: primaryColor, color: contrastColor }}
              >
                <Calendar className="w-4 h-4" />
                <span>Solicitar Cita con Especialista</span>
              </button>

              <button
                type="button"
                disabled={!product.is_available}
                onClick={handleAddToCart}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300/80 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition cursor-pointer"
              >
                Agregar al Carrito (Bs {unitFinalPrice.toFixed(2)})
              </button>
            </div>
          ) : (
            /* Flujo Estándar de Catálogo y Pedidos */
            <>
              {/* Selector de Cantidad */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400 select-none">
                  Cantidad:
                </span>
                <div className="inline-flex items-center rounded-xl border border-stone-200/90 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-0.5 shadow-2xs">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 active:scale-90 cursor-pointer"
                    title="Disminuir cantidad"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-9 text-center font-bold text-sm text-stone-900 dark:text-white select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white dark:hover:bg-stone-700 transition-all duration-150 active:scale-90 cursor-pointer"
                    title="Aumentar cantidad"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Botón de Acción Principal con Color de Marca */}
              <button
                type="button"
                disabled={!product.is_available}
                onClick={handleAddToCart}
                className={`flex-1 w-full sm:w-auto py-3 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm ${
                  !product.is_available
                    ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed border border-stone-300/60 dark:border-stone-700/60'
                    : 'active:scale-[0.98] hover:brightness-105'
                }`}
                style={
                  product.is_available
                    ? { backgroundColor: primaryColor, color: contrastColor }
                    : undefined
                }
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {!product.is_available
                    ? 'Agotado'
                    : isFashion
                    ? `Añadir a mi Selección • Bs ${totalItemPrice.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
                    : isRestaurant
                    ? `Agregar al Pedido • Bs ${totalItemPrice.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
                    : isServices
                    ? `Reservar Servicio • Bs ${totalItemPrice.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
                    : `Agregar al Carrito • Bs ${totalItemPrice.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`}
                </span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
