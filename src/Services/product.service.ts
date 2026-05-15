import type { Product } from '../Model/Product';

interface ProductoApi {
  id: number;
  nombre: string;
  precio: number;
  stock?: number;
  image_url?: string;
  imageUrl?: string;
  descripción?: string;
  descripcion?: string;
}

function mapApiToProduct(p: ProductoApi): Product {
  return {
    id: p.id,
    name: p.nombre,
    price: p.precio,
    imageUrl: p.imageUrl ?? p.image_url ?? '',
    category: 'General',
    description:
      p.descripción ||
      p.descripcion ||
      (p.stock != null ? `Unidades en stock: ${p.stock}.` : undefined)
  };
}

const API_URL = (import.meta.env.VITE_PRODUCTS_API_URL as string | undefined) ?? (
  import.meta.env.DEV ? 'http://localhost:9090/api/productos' : undefined
);

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('VITE_PRODUCTS_API_URL no está configurada');
  }
  return API_URL;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(getApiUrl());

  if (!res.ok) throw new Error('Error API');

  const data: ProductoApi[] = await res.json();

  return data.map(mapApiToProduct);
}

export async function getProductById(
  id: number
): Promise<Product | undefined> {
  const res = await fetch(`${getApiUrl()}/${id}`);

  if (!res.ok) throw new Error('Error API');

  const data: ProductoApi = await res.json();

  return mapApiToProduct(data);
}
