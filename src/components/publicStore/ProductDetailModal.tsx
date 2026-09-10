import React, { useState } from 'react';
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
  Truck,
  Building2,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { Product, StoreType, FashionSettings } from '../../types';
import { CartItem, CartModifier, CartColorVariant } from './types';

interface ProductDetailModalProps {
  product: Product;
  storeType: StoreType;
  fashionSettings?: FashionSettings;
  onAddToCart: (item: CartItem) => void;
  onRequestAppointment?: (serviceId: string) => void;
  onOpenSizeGuide?: () => void;
  onClose: () => void;
  primaryColor?: string;
  onOpenCart?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  storeType,
  fashionSettings,
  onAddToCart,
  onRequestAppointment,
  onOpenSizeGuide,
  onClose,
  primaryColor = '#4f46e5',
  onOpenCart,
}) => {
  const isRestaurant = storeType === 'restaurante';
  const isFashion = storeType === 'moda';
  const effectivePrimaryColor = isFashion ? '#1c1917' : isRestaurant ? '#d97706' : primaryColor;
  const [copiedLink, setCopiedLink] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Atributos de moda
  const sizes = (product.attributes?.sizes as string[]) || [];
  const colors = (product.attributes?.colors as Array<{ name: string; hex: string }>) || [];
  const galleryImages = (product.attributes?.gallery_images as string[]) || (product.image_url ? [product.image_url] : []);

  const [activeImage, setActiveImage] = useState<string>(
    galleryImages[0] || product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  );
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<CartColorVariant | undefined>(
    colors[0] ? { name: colors[0].name, hex: colors[0].hex } : undefined
  );

  // Atributos de restaurante
  const modifiers = (product.attributes?.modifiers as Array<{ name: string; price: number }>) || [];
  const [selectedModifiers, setSelectedModifiers] = useState<CartModifier[]>([]);
  const [kitchenNotes, setKitchenNotes] = useState('');
  const isCombo = Boolean(product.attributes?.is_combo);
  const comboItems = (product.attributes?.combo_items as string[]) || [];

  // Atributos de servicios
  const isService = storeType === 'servicios' || Boolean(product.attributes?.is_service);
  const duration = (product.attributes?.duration_minutes as number) || 60;
  const specialty = (product.attributes?.specialty as string) || 'Especialidad';
  const professionalName = (product.attributes?.professional_name as string) || 'Profesional Asignado';

  // Precios
  const basePrice = product.price;
  const previousPrice = product.attributes?.previous_price as number | undefined;
  const hasOffer = previousPrice && previousPrice > basePrice;

  // Modificadores sumados al precio
  const modifiersSum = selectedModifiers.reduce((acc, m) => acc + m.price, 0);
  const unitFinalPrice = basePrice + modifiersSum;
  const totalItemPrice = unitFinalPrice * quantity;

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
      navigator.share({
        title: product.name,
        text: product.description || `Mira ${product.name} en CentralBo`,
        url: url,
      }).catch(() => copyToClipboard(url));
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
      kitchenNotes: kitchenNotes.trim() || undefined,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${
        isFashion
          ? 'bg-[#151518] border-stone-800'
          : isRestaurant
          ? 'bg-stone-900 border-stone-800'
          : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Cabecera modal */}
        <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
          isFashion
            ? 'bg-stone-950/90 border-stone-800'
            : isRestaurant
            ? 'bg-stone-950/90 border-stone-800'
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            {Boolean(product.attributes?.is_featured) && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isFashion
                  ? 'bg-stone-900 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                <Star className={`w-3 h-3 ${isFashion ? 'fill-rose-300 text-rose-300' : 'fill-amber-400 text-amber-400'}`} />
                <span>{isFashion ? 'Colección' : 'Destacado'}</span>
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                product.is_available
                  ? isFashion
                    ? 'bg-stone-900 text-stone-200 border-stone-700'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {product.is_available ? 'Disponible' : 'Agotado'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProduct}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                isFashion || isRestaurant
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Compartir enlace de este producto"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition cursor-pointer ${
                isFashion || isRestaurant
                  ? 'text-stone-400 hover:text-white hover:bg-stone-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del modal (Scroll) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Galería de imágenes */}
            <div className="space-y-3">
              <div className={`w-full rounded-2xl border overflow-hidden relative shadow-inner ${
                isFashion
                  ? 'aspect-[3/4] bg-stone-950 border-stone-800'
                  : isRestaurant
                  ? 'aspect-square bg-stone-950 border-stone-800'
                  : 'aspect-square bg-slate-950 border-slate-800'
              }`}>
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {hasOffer && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs shadow-lg">
                    OFERTA
                  </span>
                )}
              </div>

              {/* Miniaturas de galería (Moda o productos con múltiples fotos) */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeImage === img
                          ? isFashion
                            ? 'border-rose-400 ring-2 ring-rose-400/30'
                            : isRestaurant
                            ? 'border-amber-500 ring-2 ring-amber-500/20'
                            : 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : isFashion || isRestaurant
                          ? 'border-stone-800 opacity-60 hover:opacity-100'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información y configuración del producto */}
            <div className="space-y-5">
              <div>
                <h2 className={`font-bold leading-snug ${
                  isFashion
                    ? 'font-serif text-2xl sm:text-3xl text-stone-100 tracking-tight'
                    : 'text-xl sm:text-2xl text-white'
                }`}>
                  {product.name}
                </h2>

                {/* Precios */}
                <div className="flex items-baseline gap-3 mt-2">
                  <span className={`text-2xl font-bold ${
                    isFashion ? 'text-stone-100' : 'font-black text-white font-mono'
                  }`}>
                    Bs {unitFinalPrice.toFixed(2)}
                  </span>
                  {hasOffer && previousPrice && (
                    <span className="text-sm line-through text-stone-400 font-mono select-none">
                      Bs {previousPrice.toFixed(2)}
                    </span>
                  )}
                  {hasOffer && previousPrice && (
                    <span className="text-xs font-semibold text-rose-400">
                      Ahorras Bs {(previousPrice - basePrice).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Descripción */}
                {product.description && (
                  <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${
                    isFashion || isRestaurant ? 'text-stone-300' : 'text-slate-300'
                  }`}>
                    {product.description}
                  </p>
                )}
              </div>

              {/* ----------------- VERTICAL: MODA ----------------- */}
              {storeType === 'moda' && (
                <div className="space-y-4 pt-3 border-t border-stone-800/80">
                  {/* Selector de Tallas */}
                  {sizes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-stone-300">
                          Selecciona tu Talla:
                        </label>
                        {onOpenSizeGuide && (
                          <button
                            type="button"
                            onClick={onOpenSizeGuide}
                            className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer font-medium"
                          >
                            <Ruler className="w-3.5 h-3.5" />
                            <span>Guía de Tallas</span>
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`min-w-[44px] h-10 px-3.5 rounded-xl font-bold text-xs border transition cursor-pointer ${
                              selectedSize === sz
                                ? 'bg-white text-stone-950 border-white shadow-md'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-600'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selector de Colores */}
                  {colors.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-300">
                        Color: <span className="text-stone-400 font-normal">{selectedColor?.name}</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {colors.map((col) => (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => setSelectedColor(col)}
                            title={col.name}
                            className={`w-9 h-9 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                              selectedColor?.name === col.name
                                ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-stone-900 border-white'
                                : 'border-stone-700 hover:border-stone-500'
                            }`}
                            style={{ backgroundColor: col.hex }}
                          >
                            {selectedColor?.name === col.name && (
                              <Check className="w-4 h-4 text-white drop-shadow-md" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Política de cambios */}
                  {fashionSettings?.exchangePolicy && (
                    <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400">
                      <strong className="text-stone-300 block mb-0.5">Política de Cambios:</strong>
                      {fashionSettings.exchangePolicy}
                    </div>
                  )}
                </div>
              )}

              {/* ----------------- VERTICAL: RESTAURANTE ----------------- */}
              {storeType === 'restaurante' && (
                <div className="space-y-4 pt-3 border-t border-stone-800/80">
                  {/* Combos */}
                  {isCombo && comboItems.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Utensils className="w-3.5 h-3.5 text-amber-400" />
                        <span>Este Menú Incluye:</span>
                      </div>
                      <ul className="text-xs text-stone-300 list-disc list-inside space-y-0.5 pl-1">
                        {comboItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Modificadores / Extras */}
                  {modifiers.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-300">
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
                                  ? 'bg-amber-600/15 border-amber-500/50 text-white'
                                  : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleModifierToggle(mod)}
                                  className="w-4 h-4 rounded text-amber-600 bg-stone-900 border-stone-700 focus:ring-0 cursor-pointer accent-amber-600"
                                />
                                <span>{mod.name}</span>
                              </div>
                              <span className="font-mono text-amber-400 font-semibold">
                                +Bs {mod.price.toFixed(2)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notas para cocina */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Instrucciones para la Cocina (Opcional):
                    </label>
                    <textarea
                      rows={2}
                      value={kitchenNotes}
                      onChange={(e) => setKitchenNotes(e.target.value)}
                      placeholder="Ej. Salsa al dente, sin cebolla, aderezo aparte..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 resize-none"
                    />
                  </div>

                  {/* Badges de entrega */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Delivery en empaque térmico</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Retiro en trattoria</span>
                    </span>
                  </div>
                </div>
              )}

              {/* ----------------- VERTICAL: SERVICIOS ----------------- */}
              {isService && (
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Duración:</span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{duration} minutos</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-medium block">Especialidad:</span>
                      <span className="font-semibold text-slate-200 truncate block mt-0.5">
                        {specialty}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-700 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 font-medium block">Especialista a cargo:</span>
                      <span className="font-semibold text-white">{professionalName}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie del modal: Cantidad y botón de acción */}
        <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isFashion || isRestaurant ? 'bg-stone-950 border-stone-800' : 'bg-slate-950 border-slate-800'
        }`}>
          {addedSuccess ? (
            <div className={`w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border animate-in fade-in duration-200 ${
              isFashion
                ? 'bg-stone-900/90 border-stone-700/80'
                : isRestaurant
                ? 'bg-amber-950/30 border-amber-500/40'
                : 'bg-emerald-950/40 border-emerald-500/40'
            }`}>
              <div className="flex items-center gap-2.5 text-xs">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isFashion
                    ? 'bg-white text-stone-950'
                    : isRestaurant
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">
                    {isFashion ? '¡Prenda agregada a tu selección!' : '¡Producto agregado al carrito!'}
                  </p>
                  <p className={`text-[11px] ${isFashion || isRestaurant ? 'text-stone-300' : 'text-slate-300'}`}>
                    {quantity} {quantity === 1 ? 'unidad agregada' : 'unidades agregadas'} • Subtotal: Bs {totalItemPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="btn-modal-continue-shopping"
                  onClick={onClose}
                  className={`flex-1 sm:flex-initial py-2.5 px-4 rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isFashion || isRestaurant
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  title="Volver a la tienda para seguir explorando y agregar más productos"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isFashion ? 'Seguir explorando' : 'Seguir viendo carta'}</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-open-cart"
                  onClick={() => {
                    onClose();
                    if (onOpenCart) onOpenCart();
                  }}
                  className={`flex-1 sm:flex-initial py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition hover:opacity-90 cursor-pointer ${
                    isFashion
                      ? 'bg-white hover:bg-stone-100 text-stone-950 shadow-black/30'
                      : 'text-white shadow-amber-600/20'
                  }`}
                  style={isFashion ? undefined : { backgroundColor: effectivePrimaryColor }}
                  title="Abrir tu carrito para ver todos los productos acumulados"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isFashion ? 'Ver mi selección' : 'Abrir canasta'}</span>
                </button>
              </div>
            </div>
          ) : isService && onRequestAppointment ? (
            <div className="w-full sm:w-auto flex-1 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestAppointment(product.id);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Solicitar Cita con Especialista</span>
              </button>

              <button
                type="button"
                disabled={!product.is_available}
                onClick={handleAddToCart}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Agregar al Carrito (Bs {unitFinalPrice.toFixed(2)})
              </button>
            </div>
          ) : (
            <>
              {/* Control de cantidad */}
              <div className="flex items-center gap-3">
                <span className={`text-xs ${isFashion || isRestaurant ? 'text-stone-400' : 'text-slate-400'}`}>Cantidad:</span>
                <div className={`inline-flex items-center rounded-xl border p-1 ${
                  isFashion || isRestaurant ? 'bg-stone-900 border-stone-800' : 'bg-slate-900 border-slate-800'
                }`}>
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      isFashion || isRestaurant
                        ? 'text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      isFashion || isRestaurant
                        ? 'text-stone-400 hover:text-white hover:bg-stone-800'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Botón agregar al carrito */}
              <button
                type="button"
                disabled={!product.is_available}
                onClick={handleAddToCart}
                style={isFashion ? undefined : { backgroundColor: product.is_available ? effectivePrimaryColor : undefined }}
                className={`py-3 px-6 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  !product.is_available
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    : isFashion
                    ? 'bg-white hover:bg-stone-200 text-stone-950 shadow-lg active:scale-[0.98]'
                    : 'text-white shadow-lg shadow-amber-600/20 hover:opacity-90'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {product.is_available
                    ? isFashion
                      ? `Añadir a mi Selección • Bs ${totalItemPrice.toFixed(2)}`
                      : `Agregar al Pedido • Bs ${totalItemPrice.toFixed(2)}`
                    : 'Agotado'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
