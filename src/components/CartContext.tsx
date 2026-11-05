'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
  totalItems: 0,
  subtotal: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('demo_cart');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems([]);
        }
      }
    }
  }, []);

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_cart', JSON.stringify(newItems));
    }
  };

  const addItem = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
    const existingIndex = items.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      saveItems(updated);
    } else {
      saveItems([...items, { product, quantity, selectedSize, selectedColor }]);
    }
    setIsCartOpen(true);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    saveItems(updated);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    const updated = [...items];
    updated[index].quantity = quantity;
    saveItems(updated);
  };

  const clearCart = () => {
    saveItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.product.price) || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

