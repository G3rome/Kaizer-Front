export interface Product {
  id?: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  category?: string;
  stock?: number;
    especificaciones?: any;
  specifications?: any; 
}

export type CartItem = Product & {
  quantity?: number;
};

export type Cart = CartItem[];