import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import type { Product } from '../../Model/Product';
import { getProductById } from '../../Services/product.service';
import { useCart } from '../../Services/CartContext';

import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

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

  const onAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast.success(`${product.name || 'Producto'} añadido al carrito`);
  };

  if (loading) {
    return (
      <div className="kaizer-detail-loading">
        <div className="kaizer-spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="kaizer-detail-not-found">
        <h2>Producto no encontrado</h2>
        <p>El identificador no existe o el servidor no respondió.</p>
        <Link to="/products" className="kaizer-detail-back-btn">
          Volver al catálogo
        </Link>
      </div>
    );
  }


  const dbName = product.name || (product as any).nombre || 'Producto sin título';
  const dbPrice = product.price || (product as any).precio || 0;
  const dbImg = product.imageUrl || (product as any).image_url || fallbackImage;
  const dbCategory = product.category || (product as any).categoria || 'General';
  const dbDescription = product.description || (product as any).descripcion || '';
  const dbStock = product.stock ?? 0;

  let parsedSpecs: Record<string, any> = {};
  let rawSpecs = product.specifications || product.especificaciones || (product as any).specs;

  if (rawSpecs) {
    if (typeof rawSpecs === 'object') {
      parsedSpecs = rawSpecs;
    } else if (typeof rawSpecs === 'string') {
      try {
        parsedSpecs = JSON.parse(rawSpecs);
      } catch {
      }
    }
  }

  return (
    <div className="kaizer-detail-container">
      <nav className="kaizer-detail-breadcrumb">
        <Link to="/products">Productos</Link>
        <span>/</span>
        <Link to="/products">{dbCategory}</Link>
        <span>/</span>
        <span className="kaizer-active-crumb">{dbName}</span>
      </nav>

      <div className="kaizer-detail-main-card">
        <div className="kaizer-detail-img-section">
          <div className="kaizer-detail-img-wrapper">
            <img
              src={dbImg}
              alt={dbName}
              className="kaizer-detail-image"
              onError={(e) => {
                e.currentTarget.src = fallbackImage;
                e.currentTarget.onerror = null;
              }}
            />
          </div>
        </div>

        <div className="kaizer-detail-info-section">
          <span className="kaizer-detail-badge">{dbCategory}</span>
          <h2 className="kaizer-detail-title">{dbName}</h2>

          <div className="kaizer-detail-price-box">
            <span className="kaizer-detail-price">S/ {dbPrice.toFixed(2)}</span>
            <span className={`kaizer-detail-status ${dbStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {dbStock > 0 ? `✔ Disponible (${dbStock})` : '✕ Sin stock'}
            </span>
          </div>

          <p className="kaizer-detail-description">
            {dbDescription || `El ${dbName} ofrece un equilibrio sólido entre diseño y rendimiento.`}
          </p>

          <div className="kaizer-detail-actions">
            <button className="kaizer-btn-add-cart" disabled={dbStock <= 0} onClick={onAddToCart}>
              <i className="fi fi-rs-shopping-cart" style={{ marginRight: '8px' }}></i> Añadir al carrito
            </button>
            <Link to="/cart" className="kaizer-btn-view-cart">
              Ver carrito
            </Link>
          </div>

          <div className="kaizer-detail-extra">
            <div className="kaizer-extra-item">
              <strong>Garantía</strong>
              <p>Cobertura oficial del fabricante.</p>
            </div>
            <div className="kaizer-extra-item">
              <strong>Devoluciones</strong>
              <p>Consulta condiciones en checkout.</p>
            </div>
          </div>
        </div>
      </div>

      {parsedSpecs && Object.keys(parsedSpecs).length > 0 && (
        <div className="kaizer-specs-card">
          <div className="kaizer-specs-header">
            <h3>Especificaciones Técnicas</h3>
            <p>Detalles de hardware mapeados en tiempo real desde la base de datos de Kaizer Tech.</p>
          </div>
          
          <div className="kaizer-specs-grid">
            {Object.entries(parsedSpecs).map(([key, value]) => {
              let iconClass = 'fi fi-rs-settings'; 
              const lowerKey = key.toLowerCase();
              
              if (lowerKey.includes('procesador') || lowerKey.includes('cpu') || lowerKey.includes('chip')) {
                iconClass = 'fi fi-rs-brain';
              } else if (lowerKey.includes('gráfic') || lowerKey.includes('video') || lowerKey.includes('gpu') || lowerKey.includes('rtx')) {
                iconClass = 'fi fi-rs-gamepad';
              } else if (lowerKey.includes('pantalla') || lowerKey.includes('display') || lowerKey.includes('panel') || lowerKey.includes('amoled') || lowerKey.includes('retina')) {
                iconClass = 'fi fi-rs-computer';
              } else if (lowerKey.includes('memoria') || lowerKey.includes('ram')) {
                iconClass = 'fi fi-rs-charging-station'; 
              } else if (lowerKey.includes('almacenamiento') || lowerKey.includes('ssd') || lowerKey.includes('disco') || lowerKey.includes('rom')) {
                iconClass = 'fi fi-rs-database';
              } else if (lowerKey.includes('cámara') || lowerKey.includes('camara')) {
                iconClass = 'fi fi-rs-camera';
              } else if (lowerKey.includes('batería') || lowerKey.includes('bateria') || lowerKey.includes('autonomía')) {
                iconClass = 'fi fi-rs-battery-full';
              } else if (lowerKey.includes('conectividad') || lowerKey.includes('wi-fi') || lowerKey.includes('bluetooth') || lowerKey.includes('gps')) {
                iconClass = 'fi fi-rs-wifi';
              } else if (lowerKey.includes('tamaño') || lowerKey.includes('dimension') || lowerKey.includes('peso')) {
                iconClass = 'fi fi-rs-box';
              } else if (lowerKey.includes('material')) {
                iconClass = 'fi fi-rs-smartphone';
              }

              return (
                <div key={key} className="kaizer-spec-item">
                  <div className="kaizer-spec-icon-box">
                    <i className={iconClass}></i> 
                  </div>
                  <div className="kaizer-spec-content">
                    <span className="kaizer-spec-label">{key}</span>
                    <span className="kaizer-spec-value">{String(value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}