import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Product } from '../../Model/Product';
import { getProductById } from '../../Services/product.service';

import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fallbackImage = '/images/innovacell-celulares.jpeg_1902800913.webp';

  useEffect(() => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await getProductById(numericId);
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setProduct(data);
      } catch {
        if (cancelled) return;
        setNotFound(true);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    cart.push(product);

    localStorage.setItem(
      'cart',
      JSON.stringify(cart)
    );

    alert(`¡${product.name} añadido al carrito!`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="not-found">
        <h2>Producto no encontrado</h2>

        <p>
          El identificador no existe o el servidor no respondió.
        </p>

        <Link to="/products" className="back-button">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <nav className="breadcrumb">
        <Link to="/products">Productos</Link>

        <span>/</span>

        <Link to={`/products/${(product.category || 'general').toLowerCase()}`}>
          {product.category || 'General'}
        </Link>

        <span>/</span>

        <span>{product.name || 'Detalle'}</span>
      </nav>

      <div className="product-card">
        <div className="product-image-section">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
              e.currentTarget.onerror = null;
            }}
          />
        </div>

        <div className="product-info">
          <span className="category-badge">
            {product.category || 'Sin categoría'}
          </span>

          <h2>{product.name || 'Producto sin título'}</h2>

          <div className="price-section">
            <span className="price">
              S/ {product.price ? product.price.toFixed(2) : '0.00'}
            </span>

            <span className="available">
              ✔ Disponible
            </span>
          </div>

          <p className="description">
            {product.description ||
              `El ${product.name} ofrece un equilibrio sólido entre diseño, rendimiento y autonomía para el día a día.`}
          </p>

          <div className="buttons">
            <button
              className="add-cart-button"
              onClick={addToCart}
            >
              🛒 Añadir al carrito
            </button>

            <Link to="/cart" className="cart-button">
              Ver carrito
            </Link>
          </div>

          <div className="extra-info">
            <div>
              <strong>Garantía</strong>

              <p>
                Cobertura según política del fabricante.
              </p>
            </div>

            <div>
              <strong>Devoluciones</strong>

              <p>
                Consulta condiciones en checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
