import React from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Utensils,
  Shirt,
  Briefcase,
  Store as StoreIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CartItem } from './types';

export interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  primaryColor?: string;
  storeName?: string;
}

// Cálculo de contraste WCAG AA para botones o fondos con color de marca
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

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  primaryColor = '#2563eb',
  storeName,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const contrastColor = getContrastColor(primaryColor);

  return (
    <div
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-3 sm:pl-8">
        <motion.div
          initial={{ x: shouldReduceMotion ? 0 : '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.05 : 0.28, ease: [0.2, 0, 0, 1] }}
          className="w-screen max-w-md bg-white dark:bg-stone-900 border-l border-stone-200/90 dark:border-stone-800 shadow-2xl flex flex-col h-full"
        >
          {/* Cabecera del Carrito con Identidad del Comercio */}
          <div className="px-4 sm:px-5 py-3.5 bg-stone-50/90 dark:bg-stone-950/90 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-xl text-white shrink-0 shadow-xs flex items-center justify-center"
                style={{ backgroundColor: primaryColor, color: contrastColor }}
              >
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                    {storeName ? `Tu Selección en ${storeName}` : 'Tu Carrito de Compras'}
                  </h3>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {totalItemCount} {totalItemCount === 1 ? 'unidad en total' : 'unidades en total'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-cart-header-continue"
                onClick={onClose}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700/60 text-[11px] font-semibold text-stone-700 dark:text-stone-300 transition-all duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="Volver a la tienda para seguir explorando"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Seguir comprando</span>
              </button>

              <button
                type="button"
                id="btn-cart-close"
                onClick={onClose}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                title="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Banner discreto de canasta acumulativa */}
          {items.length > 0 && (
            <div className="px-4 py-2 bg-stone-100/70 dark:bg-stone-950/60 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center gap-2 text-[11px] text-stone-600 dark:text-stone-400">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
              <p className="truncate">
                <span className="font-semibold text-stone-800 dark:text-stone-200">Canasta del comercio:</span> Puedes continuar agregando productos a esta misma compra.
              </p>
            </div>
          )}

          {/* Contenido del Carrito (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              /* Estado Vacío: Limpio, sin datos inventados */
              <div className="py-20 text-center space-y-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner"
                  style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                >
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200">Tu canasta está vacía</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
                    Explora el catálogo de {storeName || 'la tienda'} y agrega los productos o servicios que desees comprar.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-cart-empty-continue"
                  onClick={onClose}
                  style={{ backgroundColor: primaryColor, color: contrastColor }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:brightness-105 transition cursor-pointer active:scale-98"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Explorar Catálogo</span>
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemSubtotal = item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    id={`cart-item-${item.id}`}
                    className="rounded-2xl bg-stone-50/70 dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800/80 p-3.5 space-y-3 transition hover:border-stone-300 dark:hover:border-stone-700"
                  >
                    <div className="flex gap-3">
                      {/* Imagen real o Fallback limpio */}
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover border border-stone-200/80 dark:border-stone-800 shrink-0"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl flex items-center justify-center shrink-0 border border-stone-200/80 dark:border-stone-800"
                          style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                        >
                          {item.storeType === 'restaurante' ? (
                            <Utensils className="w-6 h-6" />
                          ) : item.storeType === 'moda' ? (
                            <Shirt className="w-6 h-6" />
                          ) : item.storeType === 'servicios' ? (
                            <Briefcase className="w-6 h-6" />
                          ) : (
                            <StoreIcon className="w-6 h-6" />
                          )}
                        </div>
                      )}

                      {/* Información y Variantes del Producto */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className="text-xs font-bold text-stone-900 dark:text-white truncate"
                            title={item.name}
                          >
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-all duration-150 hover:scale-110 active:scale-90 cursor-pointer"
                            title="Eliminar este producto de la canasta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variantes Reales */}
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 space-y-0.5">
                          {item.selectedSize && (
                            <p>
                              <span className="text-stone-400 dark:text-stone-500">Talla:</span>{' '}
                              <span className="text-stone-800 dark:text-stone-200 font-semibold">
                                {item.selectedSize}
                              </span>
                            </p>
                          )}
                          {item.selectedColor && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-stone-400 dark:text-stone-500">Color:</span>
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-stone-700 inline-block shrink-0"
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                              <span className="text-stone-800 dark:text-stone-200 font-medium">
                                {item.selectedColor.name}
                              </span>
                            </div>
                          )}
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[10px] font-medium text-stone-700 dark:text-stone-300">
                              <span className="text-stone-400 dark:text-stone-500">Extras:</span>{' '}
                              {item.selectedModifiers.map((m) => m.name).join(', ')}
                            </p>
                          )}
                          {item.kitchenNotes && (
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 italic">
                              Nota: "{item.kitchenNotes}"
                            </p>
                          )}
                          {item.isService && item.serviceDetails && (
                            <p className="text-[10px] text-stone-700 dark:text-stone-300 font-medium">
                              {item.serviceDetails.specialty} • {item.serviceDetails.durationMinutes} min
                              {item.serviceDetails.professionalName && ` • ${item.serviceDetails.professionalName}`}
                            </p>
                          )}
                        </div>

                        {/* Precio Unitario */}
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
                          <span>Precio unitario: </span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            Bs {item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Controles de Cantidad y Subtotal del Ítem */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 dark:border-stone-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">Cantidad:</span>
                        <div className="inline-flex items-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                onRemoveItem(item.id);
                              } else {
                                onUpdateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-150 active:scale-90 cursor-pointer"
                            title={item.quantity <= 1 ? 'Eliminar producto' : 'Disminuir cantidad'}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-stone-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-150 active:scale-90 cursor-pointer"
                            title="Aumentar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Subtotal</span>
                        <span className="font-black text-xs text-stone-900 dark:text-white">
                          Bs {itemSubtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Resumen y Acciones Finales del Carrito */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-50/90 dark:bg-stone-950/90 border-t border-stone-200/80 dark:border-stone-800 space-y-3.5 shrink-0">
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 dark:text-stone-400">Unidades en canasta:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {totalItemCount} {totalItemCount === 1 ? 'unidad' : 'unidades'} ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-1.5 border-t border-stone-200/80 dark:border-stone-800/80">
                  <span className="text-stone-900 dark:text-white">Subtotal General:</span>
                  <span className="text-base font-black text-stone-900 dark:text-white tracking-tight">
                    Bs {subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-0.5 leading-relaxed">
                  * El costo de envío (si aplica delivery) y cupones de descuento se calculan en el siguiente paso.
                </p>
              </div>

              {/* Botón principal de checkout */}
              <button
                type="button"
                id="btn-cart-proceed-checkout"
                onClick={onProceedToCheckout}
                style={{ backgroundColor: primaryColor, color: contrastColor }}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-105 active:scale-[0.98] cursor-pointer"
              >
                <span>Continuar al Cierre • Bs {subtotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Botones secundarios */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  id="btn-cart-continue-shopping"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:scale-[1.01] active:scale-95 cursor-pointer"
                  title="Regresar al catálogo de la tienda para agregar más productos"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Seguir explorando la tienda</span>
                </button>

                <button
                  type="button"
                  id="btn-cart-clear"
                  onClick={onClearCart}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-500/10 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 border border-stone-200/80 dark:border-stone-700/60 text-xs font-semibold transition-all duration-150 hover:scale-105 active:scale-90 cursor-pointer"
                  title="Vaciar toda la canasta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
