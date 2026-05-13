import type { Product } from '../Model/Product';

/** DTO del backend (Spring u otro API) */
interface ProductoApi {
  id: number;
  nombre: string;
  marca?: string;
  precio: number;
  stock?: number;
  imagen?: string;
}

/** Mapper backend → frontend */
function mapApiToProduct(p: ProductoApi): Product {
  return {
    id: p.id,
    name: p.nombre,
    price: p.precio,
    imageUrl: p.imagen ?? '',
    category: p.marca ?? 'General',
    description: p.stock != null
      ? `Unidades en stock: ${p.stock}.`
      : undefined
  };
}

const API_URL = import.meta.env.VITE_PRODUCTS_API_URL;

/** GET todos los productos */
export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) throw new Error('Error API');

    const data: ProductoApi[] = await res.json();

    return data.map(mapApiToProduct);
  } catch (error) {
    console.error('Backend no disponible, usando mock');

    return mockProducts;
  }
}

/** GET producto por ID */
export async function getProductById(
  id: number
): Promise<Product | undefined> {
  try {
    const res = await fetch(`${API_URL}/${id}`);

    if (!res.ok) throw new Error('Error API');

    const data: ProductoApi = await res.json();

    return mapApiToProduct(data);
  } catch (error) {
    return mockProducts.find((p) => p.id === id);
  }
}

/** fallback offline */
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Samsung Galaxy A34',
    price: 1299,
    imageUrl: 'GALAXYA34_2.jpg',
    category: 'Samsung'
  },
  {
    id: 2,
    name: 'Motorola G85',
    price: 1099,
    imageUrl: 'MOTOROLAG85.jpg',
    category: 'Motorola'
  },
  {
    id: 3,
    name: 'iPhone 16 Pro',
    price: 4599,
    imageUrl: 'IP16PRO.png',
    category: 'Apple'
  },
  {
    id: 4,
    name: 'Redmi Note 12',
    price: 899,
    imageUrl: 'REDMINOTE12.jpg',
    category: 'Xiaomi'
  }
];
