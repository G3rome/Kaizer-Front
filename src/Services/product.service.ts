import type { Product } from '../Model/Product';
import { supabase } from './supabaseClient';

interface ProductoApi {
  id: number;
  nombre: string;
  precio: number;
  stock?: number;
  image_url?: string;
  imageUrl?: string;
  descripción?: string;
  descripcion?: string;
  especificaciones?: any; 
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
      (p.stock != null ? `Unidades en stock: ${p.stock}.` : undefined),
    stock: p.stock,
    specifications: p.especificaciones 
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('id,nombre,precio,stock,image_url,descripcion,especificaciones')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as ProductoApi[]).map(mapApiToProduct);
}

export async function getProductById(
  id: number
): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from('productos')
    .select('id,nombre,precio,stock,image_url,descripcion,especificaciones')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return undefined;

  return mapApiToProduct(data as ProductoApi);
}