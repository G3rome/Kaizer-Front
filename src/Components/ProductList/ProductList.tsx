import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { Product } from '../../Model/Product';
import { getProducts } from '../../Services/product.service';

import './ProductList.css';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fallbackImage = '/images/innovacell-celulares.jpeg_1902800913.webp';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getProducts();
        if (cancelled) return;
        setProducts(data);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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

  if (loading) {
    return <div className="products-container"><div className="loading-spinner">Cargando catálogo...</div></div>;
  }

  if (error) {
    return (
      <div className="products-container">
        <h2>Hubo un problema al cargar los productos. Por favor, intenta de nuevo más tarde.</h2>
      </div>
    );
  }

  return (
    <section className="products-container">
      <h2 className="products-title">
        Nuestros productos
      </h2>

      <div className="products-grid">
        {products.map((product) => {
          if (product.id == null) return null;

          return (
            <div className="product-card" key={product.id}>
            <div className="product-image-container">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                  e.currentTarget.onerror = null; // Evita loop infinito si el fallback falla
                }}
              />

              <span className="product-category">
                {product.category || 'General'}
              </span>
            </div>

            <div className="product-body">
              <h5>{product.name || 'Producto sin título'}</h5>

              <p className="product-price">
                S/ {product.price ? product.price.toFixed(2) : '0.00'}
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
          );
        })}
      </div>
    </section>
  );
}
