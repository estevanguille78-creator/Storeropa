'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';
import { useCurrency } from './CurrencyContext';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotal } = useCart();
  const { formatPrice } = useCurrency();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-800" />
              <h2 className="font-bold text-lg text-gray-900">Bolsa de Compras</h2>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-medium text-gray-900 text-lg">Tu bolsa está vacía</h3>
                <p className="text-gray-500 text-sm mt-1 mb-6 max-w-xs">
                  Explora las colecciones y encuentra piezas exclusivas diseñadas para tu estilo.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-button font-medium text-sm hover:bg-gray-800 transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              items.map((item, index) => {
                const img =
                  item.product.images?.[0] ||
                  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80';
                return (
                  <div
                    key={`${item.product.id}-${index}`}
                    className="flex gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={img}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          {item.selectedSize && (
                            <span className="bg-gray-200/70 px-1.5 py-0.5 rounded font-medium">
                              Talla: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="bg-gray-200/70 px-1.5 py-0.5 rounded font-medium">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 text-gray-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 text-gray-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50/70 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Subtotal estimado:</span>
                <span className="font-bold text-lg text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500">
                Los impuestos y costos de envío se calculan en el siguiente paso.
              </p>
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-button flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:opacity-95 transition-all text-sm"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

