import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import './ProductDetail.css';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description?: string;
};

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_PRODUCTS_API_URL || 'http://localhost:8080/products';
    fetch(`${API_URL}/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Producto no encontrado');
        }

        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
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

        <Link to={`/products/${product.category.toLowerCase()}`}>
          {product.category}
        </Link>

        <span>/</span>

        <span>{product.name}</span>
      </nav>

      <div className="product-card">
        <div className="product-image-section">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
          />
        </div>

        <div className="product-info">
          <span className="category-badge">
            {product.category}
          </span>

          <h2>{product.name}</h2>

          <div className="price-section">
            <span className="price">
              S/ {product.price.toFixed(2)}
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