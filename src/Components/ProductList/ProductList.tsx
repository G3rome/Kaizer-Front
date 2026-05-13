import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './ProductList.css';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) =>
        console.error(
          'Error cargando productos',
          err
        )
      );
  }, []);

  const addToCart = (product: Product) => {
    const cart = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    cart.push(product);

    localStorage.setItem(
      'cart',
      JSON.stringify(cart)
    );

    alert(`¡${product.name} agregado al carrito!`);
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
                alt={product.name}
                className="product-image"
              />

              <span className="product-category">
                {product.category}
              </span>
            </div>

            <div className="product-body">
              <h5>{product.name}</h5>

              <p className="product-price">
                S/ {product.price.toFixed(2)}
              </p>
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
                onClick={() => addToCart(product)}
              >
                🛒 Añadir al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}