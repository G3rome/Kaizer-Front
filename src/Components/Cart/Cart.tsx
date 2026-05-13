import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './Cart.css';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
};

export default function Cart() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');

    if (storedCart) {
      const items = JSON.parse(storedCart);

      setCartItems(items);

      const totalPrice = items.reduce(
        (acc: number, item: Product) => acc + item.price,
        0
      );

      setTotal(totalPrice);
    }
  }, []);

  const removeItem = (index: number) => {
    const updatedCart = [...cartItems];

    updatedCart.splice(index, 1);

    setCartItems(updatedCart);

    localStorage.setItem('cart', JSON.stringify(updatedCart));

    const totalPrice = updatedCart.reduce(
      (acc, item) => acc + item.price,
      0
    );

    setTotal(totalPrice);
  };

  const checkout = () => {
    alert(
      '¡Gracias por tu compra en Kaizer Tech!'
    );

    setCartItems([]);

    setTotal(0);

    localStorage.removeItem('cart');
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">
        Carrito de compras <i className="fi fi-rs-shopping-cart-add"></i>
      </h2>

      {cartItems.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-products">
            {cartItems.map((item, index) => (
              <div className="cart-card" key={index}>
                <div className="cart-image">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                  />
                </div>

                <div className="cart-info">
                  <h5>{item.name}</h5>

                  <p>{item.category}</p>
                </div>

                <div className="cart-actions">
                  <span>
                    S/ {item.price.toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(index)}
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
                Subtotal ({cartItems.length})
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
              onClick={checkout}
            >
              Proceder al pago →
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