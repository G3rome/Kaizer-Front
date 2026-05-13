import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import type { Product } from '../Model/Product';

type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeAt: (index: number) => void;
  clearCart: () => void;
  syncCartFromBackend: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 🔵 inicial (localStorage temporal)
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // 🔵 persistencia local (temporal, luego se puede quitar)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 🟢 ADD
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) => p.id === product.id
      );

      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                quantity: p.quantity + 1
              }
            : p
        );
      }

      return [
        ...prev,
        { ...product, quantity: 1 }
      ];
    });
  };

  // 🟢 REMOVE
  const removeAt = (index: number) => {
    setCart((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // 🟢 CLEAR
  const clearCart = () => {
    setCart([]);
  };

  // 🔥 FUTURO BACKEND (listo para conectar API)
  const syncCartFromBackend = async () => {
    const res = await fetch(
      'http://localhost:8080/cart'
    );

    const data = await res.json();

    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeAt,
        clearCart,
        syncCartFromBackend
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart debe usarse dentro de CartProvider'
    );
  }

  return context;
}
