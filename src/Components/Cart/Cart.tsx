import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../Services/CartContext';
// import { useAuth } from '../../Services/AuthContext'; // Descomenta cuando uses el AuthContext
import './Cart.css';

export default function Cart() {
  const { cart, removeAt, clearCart } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;


    const orderData = {
      usuarioId: 1,
      direccionEnvio: "Calle Ficticia 123, Lima",
      total: total,
      items: cart.map(item => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: item.price
      }))
    };

    try {
      const response = await fetch('http://localhost:9090/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('¡Compra realizada con éxito! El stock ha sido actualizado.');
        clearCart();
        navigate('/products');
      } else {
        const errorData = await response.json();
        alert(`Error al procesar: ${errorData.message || 'Stock insuficiente'}`);
      }
    } catch (err) {
      console.error('Error en el checkout:', err);
      alert('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">
        Carrito de compras <i className="fi fi-rs-shopping-cart-add"></i>
      </h2>

      {cart.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-products">
            {cart.map((item, index) => (
              <div className="cart-card" key={item.id}>
                <div className="cart-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>

                <div className="cart-info">
                  <h5>{item.name}</h5>
                  <p>Cantidad: {item.quantity}</p>
                </div>

                <div className="cart-actions">
                  <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeAt(index)}>Quitar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h4>Resumen</h4>
            <div className="summary-row">
              <span>Subtotal ({cart.length} items)</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <strong>Gratis</strong>
            </div>
            <hr />
            <div className="summary-total">
              <span>Total</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>

            <button className="checkout-button" onClick={handleCheckout}>
              Confirmar pedido y pagar →
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <h3>Tu carrito está vacío</h3>
          <Link to="/products" className="shop-button">Volver a la tienda</Link>
        </div>
      )}
    </div>
  );
}