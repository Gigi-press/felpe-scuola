import { useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from '../types';

export function useCart(products: Product[]) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Se l'admin cambia prezzo o dati di un prodotto, aggiorna anche quelli nel carrello
  useEffect(() => {
    setCart(prev => {
      let changed = false;
      const next = prev.map(item => {
        const latest = products.find(p => p.id === item.product.id);
        if (!latest || latest === item.product) return item;
        changed = true;
        return { ...item, product: latest };
      });
      return changed ? next : prev;
    });
  }, [products]);

  const addToCart = (product: Product, size: string, quantity = 1) => {
    const currentStock = product.stock[size] || 0;
    if (currentStock <= 0) return;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.size === size);
      if (existingIndex > -1) {
        // Nuovo oggetto invece di modificare quello esistente (React deve vedere il cambiamento)
        return prev.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: Math.min(item.quantity + quantity, currentStock) }
            : item
        );
      } else {
        return [...prev, { product, size, quantity: Math.min(quantity, currentStock) }];
      }
    });

    setIsCartOpen(true);
  };

  const updateCartQty = (productId: string, size: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.size === size) {
          const product = products.find(p => p.id === productId);
          const maxStock = product ? (product.stock[size] ?? 0) : 99;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: Math.min(newQty, maxStock) };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return { cart, setCart, isCartOpen, setIsCartOpen, addToCart, updateCartQty, cartTotal, cartCount };
}
