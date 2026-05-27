import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import type { Product } from '../Model/Product';

type ProductoRow = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  image_url: string;
  descripcion: string;
  updated_at?: string;
};

function mapRowToProduct(p: ProductoRow): Product {
  return {
    id: p.id,
    name: p.nombre,
    price: p.precio,
    imageUrl: p.image_url ?? '',
    category: 'General',
    description: p.descripcion,
    stock: p.stock
  };
}

type UseProductsState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useProducts(): UseProductsState {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useMemo(
    () => async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('productos')
        .select(
          'id,nombre,precio,stock,image_url,descripcion,updated_at'
        )
        .order('nombre', { ascending: true });

      if (error) {
        setError(error.message);
        setProducts([]);
      } else {
        setProducts(((data ?? []) as ProductoRow[]).map(mapRowToProduct));
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    void refetch();

    const channel = supabase
      .channel('realtime-productos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        (payload) => {
          if (!isMounted) return;

          const event = payload.eventType;
          const newRow = payload.new as Partial<ProductoRow>;
          const oldRow = payload.old as Partial<ProductoRow>;

          setProducts((prev) => {
            if (event === 'INSERT') {
              if (newRow.id == null) return prev;
              return [mapRowToProduct(newRow as ProductoRow), ...prev];
            }

            if (event === 'UPDATE') {
              if (newRow.id == null) return prev;
              return prev.map((p) => {
                if (p.id !== newRow.id) return p;
                // actualizamos stock y campos principales, manteniendo compatibilidad con el modelo actual
                return {
                  ...p,
                  name: newRow.nombre ?? p.name,
                  price: newRow.precio ?? p.price,
                  imageUrl: newRow.image_url ?? p.imageUrl,
                  description: newRow.descripcion ?? p.description,
                  stock: newRow.stock ?? p.stock
                };
              });
            }

            if (event === 'DELETE') {
              if (oldRow.id == null) return prev;
              return prev.filter((p) => p.id !== oldRow.id);
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { products, loading, error, refetch };
}

