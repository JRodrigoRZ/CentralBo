import React from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  Info,
} from 'lucide-react';
import { CartItem } from './types';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  primaryColor?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  primaryColor = '#4f46e5',
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Cabecera del Carrito */}
          <div className="px-4 sm:px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="p-2 rounded-xl text-white shrink-0 shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">Tu Carrito de Compras</h3>
                <p className="text-[11px] text-slate-400">
                  {totalItemCount} {totalItemCount === 1 ? 'unidad agregada' : 'unidades agregadas'} en total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Botón rápido seguir comprando en cabecera */}
              <button
                type="button"
                id="btn-cart-header-continue"
                onClick={onClose}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                title="Volver a la tienda para seguir comprando"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Seguir comprando</span>
              </button>

              <button
                type="button"
                id="btn-cart-close"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Banner de canasta acumulativa */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <p className="truncate">
                <span className="font-semibold text-white">Canasta acumulativa:</span> Puedes seguir agregando productos a esta misma compra.
              </p>
            </div>
          )}

          {/* Contenido del Carrito (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">Tu canasta está vacía</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Explora el catálogo y agrega todos los productos o servicios que desees comprar juntos.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-cart-empty-continue"
                  onClick={onClose}
                  style={{ backgroundColor: primaryColor }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:opacity-90 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Explorar y Seguir Comprando</span>
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemSubtotal = item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    id={`cart-item-${item.id}`}
                    className="rounded-2xl bg-slate-950/90 border border-slate-800/80 p-3.5 space-y-3 transition hover:border-slate-700"
                  >
                    <div className="flex gap-3">
                      {/* Imagen del producto */}
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}

                      {/* Información y variantes del producto */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                            title="Eliminar este producto de la canasta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Detalles de variante seleccionada si corresponde */}
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          {item.selectedSize && (
                            <p>
                              <span className="text-slate-500">Talla:</span>{' '}
                              <span className="text-slate-200 font-semibold">{item.selectedSize}</span>
                            </p>
                          )}
                          {item.selectedColor && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">Color:</span>
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-slate-700 inline-block shrink-0"
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                              <span className="text-slate-200 font-medium">{item.selectedColor.name}</span>
                            </div>
                          )}
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[10px] text-indigo-300">
                              <span className="text-slate-500">Extras:</span>{' '}
                              {item.selectedModifiers.map((m) => m.name).join(', ')}
                            </p>
                          )}
                          {item.kitchenNotes && (
                            <p className="text-[10px] text-slate-400 italic">
                              Nota: "{item.kitchenNotes}"
                            </p>
                          )}
                          {item.isService && item.serviceDetails && (
                            <p className="text-[10px] text-cyan-400">
                              {item.serviceDetails.specialty} • {item.serviceDetails.durationMinutes} min
                              {item.serviceDetails.professionalName && ` • ${item.serviceDetails.professionalName}`}
                            </p>
                          )}
                        </div>

                        {/* Precio unitario */}
                        <div className="text-[11px] text-slate-400 pt-0.5">
                          <span>Precio unitario: </span>
                          <span className="font-mono font-bold text-slate-200">
                            Bs {item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Controles de cantidad y subtotal del ítem */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Cantidad:</span>
                        <div className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                onRemoveItem(item.id);
                              } else {
                                onUpdateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            title={item.quantity <= 1 ? 'Eliminar producto' : 'Disminuir cantidad'}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-xs text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            title="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Subtotal</span>
                        <span className="font-mono font-extrabold text-xs text-emerald-400">
                          Bs {itemSubtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Resumen, Seguir Comprando y botón de Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-3.5 shrink-0">
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Unidades en canasta:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {totalItemCount} {totalItemCount === 1 ? 'unidad' : 'unidades'} ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-1 border-t border-slate-800/60">
                  <span className="text-white">Subtotal General:</span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    Bs {subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  * El costo de envío (si aplica delivery) y cupones de descuento se calculan en el siguiente paso.
                </p>
              </div>

              {/* Botón principal de checkout */}
              <button
                type="button"
                id="btn-cart-proceed-checkout"
                onClick={onProceedToCheckout}
                style={{ backgroundColor: primaryColor }}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition hover:opacity-90 cursor-pointer"
              >
                <span>Continuar al Checkout • Bs {subtotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Botón clave: Seguir comprando en la tienda */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  id="btn-cart-continue-shopping"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  title="Regresar al catálogo de la tienda para agregar más productos"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-400" />
                  <span>Seguir comprando en la tienda</span>
                </button>

                <button
                  type="button"
                  id="btn-cart-clear"
                  onClick={onClearCart}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold transition cursor-pointer"
                  title="Vaciar todo el carrito"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
