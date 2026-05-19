import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../../Services/CartContext';

import './ProductDetail.css';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description?: string;
  stock: number; 
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_PRODUCTS_API_URL || 'http://localhost:9090/api/productos';

    fetch(`${API_URL}/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Producto no encontrado');
        }
        return res.json();
      })
      .then((data) => {
  const mappedProduct: Product = {
    id: data.id,
    name: data.nombre,       
    price: data.precio,      
    description: data.descripcion, 
    // Intenta leer de image_url (BD) o imageUrl (Java CamelCase)
    imageUrl: data.image_url || data.imageUrl, 
    category: 'Celulares',
    stock: data.stock         
  };
  
  setProduct(mappedProduct);
  setLoading(false);
})
      .catch((err) => {
        console.error("Error cargando detalle desde la BD:", err);
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product);

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
        <p>El identificador no existe en la base de datos o el servidor no respondió.</p>
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
        <Link to="/products">
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
              S/ {Number(product.price).toFixed(2)}
            </span>
            <span className={product.stock > 0 ? "available" : "out-of-stock"}>
              {product.stock > 0 ? `✔ Disponible (${product.stock} unidades)` : "✘ Agotado"}
            </span>
          </div>

          <p className="description">
            {product.description ||
              `El ${product.name} ofrece un equilibrio sólido entre diseño, rendimiento y autonomía.`}
          </p>

          <div className="buttons">
            <button
              className="add-cart-button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? '🛒 Añadir al carrito' : 'Sin stock'}
            </button>

            <Link to="/cart" className="cart-button">
              Ver carrito
            </Link>
          </div>

          <div className="extra-info">
            <div>
              <strong>Garantía Kaizer Tech</strong>
              <p>12 meses de cobertura técnica oficial.</p>
            </div>
            <div>
              <strong>Envío Seguro</strong>
              <p>Seguimiento en tiempo real de tu pedido.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}