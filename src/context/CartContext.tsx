'use client';

/**
 * CartContext — estado global del carrito de compras.
 *
 * Persistencia: el array de items se guarda en localStorage bajo
 * `fercadi_cart` para sobrevivir recargas. Se rehidrata en el primer
 * useEffect del provider.
 *
 * Deduplicación: si se agrega un producto que ya existe (mismo `id`),
 * se incrementa su cantidad en lugar de duplicar la fila.
 *
 * El carrito lateral (drawer) se controla con `isOpen`/`openCart`/`closeCart`
 * para que cualquier componente pueda abrirlo sin prop drilling.
 */

import { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  nombre: string;
  /** Variante seleccionada, ej. "50 kg" o "Azul Rey". Opcional. */
  opciones?: string;
  precio: number;
  cantidad: number;
  imagen?: string;
}

interface CartContextType {
  cart: CartItem[];
  /** Agrega un producto. Si ya existe, suma la cantidad al existente. */
  addToCart: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  /** Suma de precio × cantidad de todos los items. */
  total: number;
  /** Suma de cantidades (no de líneas distintas). */
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Rehidratar carrito desde localStorage al montar.
  useEffect(() => {
    const stored = localStorage.getItem('fercadi_cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Persistir cada cambio del carrito.
  useEffect(() => {
    localStorage.setItem('fercadi_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto: Omit<CartItem, 'cantidad'>, cantidad = 1) => {
    const n = Math.max(1, cantidad);
    setCart(prev => {
      const exists = prev.find(item => item.id === producto.id);
      if (exists) {
        return prev.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + n } : item
        );
      }
      return [...prev, { ...producto, cantidad: n }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, cantidad } : item));
  };

  const clearCart = () => setCart([]);

  const total     = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      total, itemCount, isOpen,
      openCart:  () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

/** Hook para consumir el carrito. Lanza error si se usa fuera de CartProvider. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
