export interface Product {
  id?: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  category?: string;
}

export type CartItem = Product & {
  quantity?: number;
};

export type Cart = CartItem[];  