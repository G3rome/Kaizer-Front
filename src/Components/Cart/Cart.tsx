import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import './Cart.css';
import { useCart } from '../../Services/CartContext';
import CheckoutModal from '../Checkout/CheckoutModal';

const SHIPPING_RATES: Record<string, number> = {
  'Miraflores':       0,
  'San Isidro':       0,
  'Surco':            5,
  'La Molina':        8,
  'San Borja':        5,
  'Barranco':         7,
  'Magdalena':        8,
  'Pueblo Libre':     8,
  'Jesús María':      8,
  'Lince':            8,
  'San Miguel':      10,
  'Breña':           10,
  'Rímac':           10,
  'La Victoria':     10,
  'Ate':             12,
  'Vitarte':         12,
  'San Juan de Lurigancho': 15,
  'Comas':           15,
  'Los Olivos':      12,
  'Independencia':   12,
  'El Agustino':     12,
  'Villa El Salvador': 15,
  'Villa María del Triunfo': 18,
  'San Juan de Miraflores':  15,
  'Chorrillos':      12,
  'Callao':          15,
  'Otro distrito':   20,
};

const IGV_RATE = 0.18;

export default function Cart() {
  const { cart, removeAt, updateQuantity, clearCart } = useCart();
  const [loading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Miraflores');
  const [showCheckout, setShowCheckout]     = useState(false);
  const [orderData, setOrderData]           = useState<null | {
    orderId: number;
    subtotal: number;
    igv: number;
    envio: number;
    total: number;
    district: string;
    items: typeof cart;
  }>(null);

  const subtotalBruto = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const baseImponible = useMemo(() => subtotalBruto / (1 + IGV_RATE), [subtotalBruto]);
  const igv           = useMemo(() => subtotalBruto - baseImponible, [subtotalBruto, baseImponible]);
  const envio         = useMemo(() => SHIPPING_RATES[selectedDistrict] ?? 20, [selectedDistrict]);
  const total         = useMemo(() => subtotalBruto + envio, [subtotalBruto, envio]);

  return (
    <div className="cart-container">
      <h2 className="cart-title">
        Carrito de compras <i className="fi fi-rs-shopping-cart-add"></i>
      </h2>

      {cart.length > 0 ? (
        <div className="cart-layout">

          <div className="cart-products">
            {cart.map((item, index) => (
              <div className="cart-card" key={index}>
                <div className="cart-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>

                <div className="cart-info">
                  <h5>{item.name}</h5>
                  <p>{item.category || 'General'}</p>

                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label={`Disminuir cantidad de ${item.name}`}
                      disabled={item.quantity <= 1}
                      onClick={() => {
                        updateQuantity(item.id, item.quantity - 1);
                        toast.info(`Cantidad actualizada a ${item.quantity - 1}`);
                      }}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar cantidad de ${item.name}`}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      onClick={() => {
                        updateQuantity(item.id, item.quantity + 1);
                        toast.info(`Cantidad actualizada a ${item.quantity + 1}`);
                      }}
                    >
                      +
                    </button>
                  </div>

                  {item.stock !== undefined && item.quantity >= item.stock && (
                    <p className="stock-limit-msg">Stock máximo alcanzado</p>
                  )}
                </div>

                <div className="cart-actions">
                  <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => {
                      removeAt(index);
                      toast(`${item.name} quitado del carrito`);
                    }}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h4>Resumen de compra</h4>

            <div className="summary-district">
              <label htmlFor="district-select">
                <i className="fi fi-rs-marker"></i> Distrito de entrega
              </label>
              <select
                id="district-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {Object.keys(SHIPPING_RATES).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>
                Subtotal ({cart.reduce((a, i) => a + i.quantity, 0)} und.)
              </span>
              <strong>S/ {subtotalBruto.toFixed(2)}</strong>
            </div>

            <div className="summary-row summary-row--muted">
              <span>
                Precio Base
                <span className="summary-hint">(sin IGV)</span>
              </span>
              <span>S/ {baseImponible.toFixed(2)}</span>
            </div>

            <div className="summary-row summary-row--muted">
              <span>
                IGV 18%
              </span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>
                Envío <span className="summary-hint">({selectedDistrict})</span>
              </span>
              <strong className={envio === 0 ? 'summary-free' : ''}>
                {envio === 0 ? 'Gratis' : `S/ ${envio.toFixed(2)}`}
              </strong>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>

            <div className="summary-igv-note">
              Precio incluye IGV (Ley N° 29666)
            </div>

            <button
              className="checkout-button"
              disabled={loading}
              onClick={() => setShowCheckout(true)}
            >
              Proceder al pago
            </button>
          </div>
        </div>

      ) : orderData ? (
        <div className="empty-cart">
          <div className="feature-icon">
            <i className="fi fi-rs-check-circle"></i>
          </div>
          <h3>¡Compra realizada!</h3>
          <p>Orden #{orderData.orderId} confirmada.</p>
          <Link to="/products" className="shop-button">Seguir comprando</Link>
        </div>

      ) : (
        <div className="empty-cart">
          <div className="feature-icon">
            <i className="fi fi-rs-shopping-bag"></i>
          </div>
          <h3>Tu carrito está vacío</h3>
          <p>Añade productos desde el catálogo.</p>
          <Link to="/products" className="shop-button">Ir a la tienda</Link>
        </div>
      )}

      {showCheckout && (
        <CheckoutModal
          subtotal={baseImponible}
          igv={igv}
          envio={envio}
          total={total}
          district={selectedDistrict}
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onSuccess={(orderId) => {
            const data = {
              orderId,
              subtotal: baseImponible,
              igv,
              envio,
              total,
              district: selectedDistrict,
              items: [...cart],
            };
            clearCart();
            setShowCheckout(false);
            setOrderData(data);
          }}
        />
      )}
    </div>
  );
}