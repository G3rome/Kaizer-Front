import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import type { Product } from '../Model/Product';
import { warmUpBackend } from './backend.service';

export type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeAt: (index: number) => void;
  updateQuantity: (id: number | undefined, quantity: number) => void;
  clearCart: () => void;
  syncCartFromBackend: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'cart';

function isValidCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    !Number.isNaN(item.price) &&
    typeof item.imageUrl === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0
  );
}

function hydrateCartFromStorage(): CartItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      console.warn('Carrito persistido no es un array, se descarta.');
      return [];
    }

    const valid = parsed.filter(isValidCartItem);

    if (valid.length !== parsed.length) {
      console.warn(
        `Se descartaron ${parsed.length - valid.length} ítem(s) de carrito con formato inválido.`
      );
    }

    return valid;
  } catch (err) {
    console.warn('No se pudo parsear el carrito persistido, se descarta.', err);
    return [];
  }
}

export function CartProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>(hydrateCartFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const persistOnUnload = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    };

    window.addEventListener('beforeunload', persistOnUnload);
    return () => window.removeEventListener('beforeunload', persistOnUnload);
  }, [cart]);

  const addToCart = (product: Product) => {

    void warmUpBackend();

    const maxStock = product.stock ?? Infinity;

    setCart((prev) => {
      const existing = prev.find(
        (p) => p.id === product.id
      );

      if (existing) {
        if (existing.quantity >= maxStock) {
          return prev;
        }

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
        { ...product, quantity: Math.min(1, maxStock) }
      ];
    });
  };

  const updateQuantity = (id: number | undefined, quantity: number) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const maxStock = p.stock ?? Infinity;
        const clamped = Math.min(Math.max(quantity, 1), maxStock);

        return { ...p, quantity: clamped };
      })
    );
  };

  const removeAt = (index: number) => {
    setCart((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const syncCartFromBackend = async () => {
    const res = await fetch(
      'https://kaizer-back.onrender.com/api/cart'
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
        updateQuantity,
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