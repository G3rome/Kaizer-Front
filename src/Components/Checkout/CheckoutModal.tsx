import { useState, useRef } from 'react';
import { checkout, StockInsuficienteError } from '../../Services/backend.service';
import type { CartItem } from '../../Services/CartContext';
import OrderConfirmation from '../Checkout/OrderConfirmation';
import '../Checkout/CheckoutModal.css';
interface Props {
  subtotal: number;
  igv: number;
  envio: number;
  total: number;
  district: string;
  cart: CartItem[];
  onClose: () => void;
  onSuccess: (orderId: number) => void;
}

type PayMethod = 'card' | 'qr';
type Step = 'method' | 'form' | 'receipt';

const REGEX = {
  card: /^\d{16}$/,
  expiry: /^(0[1-9]|1[0-2])\/\d{2}$/,
  cvv: /^\d{3}$/,
  opNum: /^\d{6,12}$/,
};

const QR_ACCOUNT = {
  banco: 'BCP (simulado)',
  cci: '002-19300123456789-14',
  titular: 'KAIZER STORE S.A.C.',
  ruc: '20123456789',
};

function formatCardNumber(val: string): string {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export default function CheckoutModal({
  subtotal, igv, envio, total, district, cart, onClose, onSuccess,
}: Props) {
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<PayMethod>('card');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [opNum, setOpNum] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpiry(clean);
    }
  };

  const validateCard = (): boolean => {
    const errs: Record<string, string> = {};
    const raw = cardNum.replace(/\s/g, '');

    if (!REGEX.card.test(raw)) errs.cardNum = 'Debe tener 16 dígitos';
    if (!cardName.trim()) errs.cardName = 'Ingresa el nombre del titular';
    if (!REGEX.expiry.test(expiry)) errs.expiry = 'Formato MM/AA inválido';
    if (!REGEX.cvv.test(cvv)) errs.cvv = 'CVV debe tener 3 dígitos';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateQr = (): boolean => {
    const errs: Record<string, string> = {};
    if (!REGEX.opNum.test(opNum.replace(/\s/g, ''))) {
      errs.opNum = 'N° de operación debe tener entre 6 y 12 dígitos';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    const valid = method === 'card' ? validateCard() : validateQr();
    if (!valid) return;

    setLoading(true);
    setError('');

    try {
      const res = await checkout(cart);
      setOrderId(res.orderId);
      setStep('receipt');
      onSuccess(res.orderId);
    } catch (e) {
      if (e instanceof StockInsuficienteError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Error inesperado. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="co-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="co-modal" role="dialog" aria-modal="true" aria-label="Checkout">

        <div className="co-header">
          <div className="co-steps">
            <span className={`co-step ${step === 'method' ? 'active' : 'done'}`}>1. Método</span>
            <span className="co-step-sep">›</span>
            <span className={`co-step ${step === 'form' ? 'active' : step === 'receipt' ? 'done' : ''}`}>2. Datos</span>
            <span className="co-step-sep">›</span>
            <span className={`co-step ${step === 'receipt' ? 'active' : ''}`}>3. Confirmación</span>
          </div>
          {step !== 'receipt' && (
            <button className="co-close" onClick={onClose} aria-label="Cerrar">✕</button>
          )}
        </div>

        {step === 'method' && (
          <div className="co-body">
            <h3 className="co-title">¿Cómo deseas pagar?</h3>

            <div className="co-methods">
              <button
                className={`co-method-btn ${method === 'card' ? 'selected' : ''}`}
                onClick={() => setMethod('card')}
              >
                <span className="co-method-icon">
                  <i className="fi fi-rs-credit-card"></i>
                </span>

                <span className="co-method-label">
                  Tarjeta de crédito / débito
                </span>

                <span className="co-method-sub">
                  Visa, Mastercard, Amex
                </span>
              </button>

              <button
                className={`co-method-btn ${method === 'qr' ? 'selected' : ''}`}
                onClick={() => setMethod('qr')}
              >
                <span className="co-method-icon">
                  <i className="fi fi-rs-mobile-notch"></i>
                </span>

                <span className="co-method-label">
                  Pago por transferencia / QR
                </span>

                <span className="co-method-sub">
                  Yape, Plin, BCP
                </span>
              </button>
            </div>

            <div className="co-mini-summary">
              <div className="co-mini-row">
                <span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="co-mini-row">
                <span>IGV 18%</span><span>S/ {igv.toFixed(2)}</span>
              </div>
              <div className="co-mini-row">
                <span>Envío ({district})</span>
                <span>{envio === 0 ? 'Gratis' : `S/ ${envio.toFixed(2)}`}</span>
              </div>
              <div className="co-mini-row co-mini-total">
                <span>Total</span><strong>S/ {total.toFixed(2)}</strong>
              </div>
            </div>

            <button className="co-btn-primary" onClick={() => setStep('form')}>
              Continuar
            </button>
          </div>
        )}

        {step === 'form' && method === 'card' && (
          <div className="co-body">
            <h3 className="co-title">Datos de la tarjeta</h3>

            <div className="co-card-preview">
              <div className="co-card-chip" />
              <div className="co-card-number">
                {cardNum || '•••• •••• •••• ••••'}
              </div>
              <div className="co-card-footer">
                <div>
                  <div className="co-card-label">Titular</div>
                  <div className="co-card-value">{cardName || 'NOMBRE APELLIDO'}</div>
                </div>
                <div>
                  <div className="co-card-label">Vence</div>
                  <div className="co-card-value">{expiry || 'MM/AA'}</div>
                </div>
              </div>
            </div>

            <div className="co-field-group">
              <div className={`co-field ${fieldErrors.cardNum ? 'has-error' : ''}`}>
                <label htmlFor="cardNum">Número de tarjeta</label>
                <input
                  id="cardNum"
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  value={cardNum}
                  onChange={(e) => setCardNum(formatCardNumber(e.target.value))}
                />
                {fieldErrors.cardNum && <span className="co-error">{fieldErrors.cardNum}</span>}
              </div>

              <div className={`co-field ${fieldErrors.cardName ? 'has-error' : ''}`}>
                <label htmlFor="cardName">Nombre del titular</label>
                <input
                  id="cardName"
                  type="text"
                  placeholder="Como aparece en la tarjeta"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                />
                {fieldErrors.cardName && <span className="co-error">{fieldErrors.cardName}</span>}
              </div>

              <div className="co-field-row">
                <div className={`co-field ${fieldErrors.expiry ? 'has-error' : ''}`}>
                  <label htmlFor="expiry">Vencimiento</label>
                  <input
                    id="expiry"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={(e) => handleExpiry(e.target.value)}
                  />
                  {fieldErrors.expiry && <span className="co-error">{fieldErrors.expiry}</span>}
                </div>

                <div className={`co-field ${fieldErrors.cvv ? 'has-error' : ''}`}>
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  />
                  {fieldErrors.cvv && <span className="co-error">{fieldErrors.cvv}</span>}
                </div>
              </div>
            </div>

            {error && <p className="co-global-error">{error}</p>}

            <div className="co-btn-row">
              <button className="co-btn-secondary" onClick={() => setStep('method')}>← Volver</button>
              <button className="co-btn-primary" disabled={loading} onClick={() => void handleSubmit()}>
                {loading ? 'Procesando…' : `Pagar S/ ${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}

        {step === 'form' && method === 'qr' && (
          <div className="co-body">
            <h3 className="co-title">Pago por transferencia</h3>

            <div className="co-payment-highlight">
              <span>Monto a transferir</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>

            <div className="co-qr-wrapper">
              <div className="co-qr-section">

                <div className="co-qr-img">
                  <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24"><path fill="#000" d="M0 0h24v24H0z"/><path stroke="#fff" stroke-linejoin="round" stroke-width="2" d="M4 4h6v6H4zm10 10h6v6h-6zm0-10h6v6h-6zm-4 10h.01v.01H10zm0 4h.01v.01H10zm-3 2h.01v.01H7zm0-4h.01v.01H7zm-3 2h.01v.01H4zm0-4h.01v.01H4z"/><path stroke="#fff" stroke-linejoin="round" stroke-width="2" d="M7 7h.01v.01H7zm10 10h.01v.01H17z"/></svg>

                </div>

                <div className="co-qr-scan">
                  Escanea para pagar
                </div>

              </div>

              <div className="co-qr-account">

                <div className="co-qr-row">
                  <span>Banco</span>
                  <strong>{QR_ACCOUNT.banco}</strong>
                </div>

                <div className="co-qr-row">
                  <span>CCI</span>
                  <strong className="co-qr-cci">
                    {QR_ACCOUNT.cci}
                  </strong>
                </div>

                <div className="co-qr-row">
                  <span>Titular</span>
                  <strong>{QR_ACCOUNT.titular}</strong>
                </div>

                <div className="co-qr-row">
                  <span>RUC</span>
                  <strong>{QR_ACCOUNT.ruc}</strong>
                </div>

              </div>

            </div>

            <div
              className={`co-field co-field--op ${fieldErrors.opNum ? 'has-error' : ''
                }`}
            >
              <label htmlFor="opNum">
                Número de operación
                <span className="co-required">*</span>
              </label>

              <input
                id="opNum"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 1234567890"
                value={opNum}
                onChange={(e) =>
                  setOpNum(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 12)
                  )
                }
              />

              <span className="co-field-hint">
                Código generado por tu aplicación bancaria,
                Yape o Plin.
              </span>

              {fieldErrors.opNum && (
                <span className="co-error">
                  {fieldErrors.opNum}
                </span>
              )}
            </div>

            {error && (
              <p className="co-global-error">
                {error}
              </p>
            )}

            <div className="co-btn-row">
              <button
                className="co-btn-secondary"
                onClick={() => setStep('method')}
              >
                ← Volver
              </button>

              <button
                className="co-btn-primary"
                disabled={loading}
                onClick={() => void handleSubmit()}
              >
                {loading
                  ? 'Verificando pago...'
                  : 'Confirmar pago'}
              </button>
            </div>
          </div>
        )}

        {step === 'receipt' && orderId && (
          <OrderConfirmation
            orderId={orderId}
            subtotal={subtotal}
            igv={igv}
            envio={envio}
            total={total}
            district={district}
            items={cart}
            payMethod={method}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}