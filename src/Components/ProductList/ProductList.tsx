import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../Services/CartContext'; // 1. Importamos el hook del carrito

import './ProductList.css';

type Product = {
  id: number;
  nombre: string;      
  descripcion: string;  
  precio: number;      
  imageUrl: string;    
  stock: number;       
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart(); 

  useEffect(() => {

    fetch('http://localhost:9090/api/productos')
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con la API');
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) =>
        console.error('Error cargando productos desde la BD', err)
      );
  }, []);

  const handleAddToCart = (product: Product) => {

    const productToSave = {
        ...product,
        name: product.nombre,
        price: product.precio
    };

    addToCart(productToSave as any); 
    alert(`¡${product.nombre} agregado al carrito!`);
  };

  return (
    <section className="products-container">
      <h2 className="products-title">
        Nuestros productos
      </h2>

      <div className="products-grid">
        {products.map((product) => (
          <div
            className="product-card"
            key={product.id}
          >
            <div className="product-image-container">
              <img
                src={product.imageUrl}
                alt={product.nombre}
                className="product-image"
              />
              
              <span className="product-category">
                Celular
              </span>
            </div>

            <div className="product-body">
              <h5>{product.nombre}</h5>

              <p className="product-price">
                S/ {Number(product.precio).toFixed(2)}
              </p>
              
              {product.stock <= 0 && (
                <p className="out-of-stock">Agotado</p>
              )}
            </div>

            <div className="product-footer">
              <Link
                to={`/products/${product.id}`}
                className="details-button"
              >
                Ver detalles
              </Link>

              <button
                className="cart-button"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? '🛒 Añadir al carrito' : 'Sin stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}