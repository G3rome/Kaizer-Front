import { Link } from 'react-router-dom';

import { useMemo, useState } from 'react';
import './Cart.css';
import { checkout, StockInsuficienteError } from '../../Services/backend.service';
import { useCart } from '../../Services/CartContext';

export default function Cart() {
  const { cart, removeAt, clearCart } = useCart();
  const [alert, setAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const onCheckout = async () => {
    setAlert(null);
    setLoading(true);

    try {
      const res = await checkout(cart);
      clearCart();
      setAlert(`Compra exitosa. Orden: ${res.orderId}. Total: S/ ${res.total.toFixed(2)}`);
    } catch (e) {
      if (e instanceof StockInsuficienteError) {
        // Alerta controlada para HTTP 400 (stock insuficiente)
        setAlert(e.message);
      } else if (e instanceof Error) {
        setAlert(e.message);
      } else {
        setAlert('Error inesperado en checkout.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">
        Carrito de compras <i className="fi fi-rs-shopping-cart-add"></i>
      </h2>

      {alert && (
        <div role="alert" className="cart-card" style={{ border: '1px solid #999' }}>
          <div className="cart-info">
            <h5>Mensaje</h5>
            <p>{alert}</p>
          </div>
          <div className="cart-actions">
            <button onClick={() => setAlert(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {cart.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-products">
            {cart.map((item, index) => (
              <div className="cart-card" key={index}>
                <div className="cart-image">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                  />
                </div>

                <div className="cart-info">
                  <h5>{item.name}</h5>

                  <p>{item.category || 'General'}</p>
                  <p>Cantidad: {item.quantity}</p>
                </div>

                <div className="cart-actions">
                  <span>
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeAt(index)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h4>Resumen</h4>

            <div className="summary-row">
              <span>
                Subtotal ({cart.length})
              </span>

              <strong>
                S/ {total.toFixed(2)}
              </strong>
            </div>

            <div className="summary-row">
              <span>Envío</span>

              <strong>Incluido</strong>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>

              <strong>
                S/ {total.toFixed(2)}
              </strong>
            </div>

            <button
              className="checkout-button"
              disabled={loading}
              onClick={() => void onCheckout()}
            >
              {loading ? 'Procesando…' : 'Proceder al pago →'}
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <div className="feature-icon">
              <i className="fi fi-rs-shopping-bag"></i>
            </div>

          <h3>Tu carrito está vacío</h3>

          <p>
            Añade productos desde el catálogo.
          </p>

          <Link
            to="/products"
            className="shop-button"
          >
            Ir a la tienda
          </Link>
        </div>
      )}
    </div>
  );
}
