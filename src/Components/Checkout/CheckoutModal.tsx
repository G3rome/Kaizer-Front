import { useState, useRef } from 'react';
import { checkout, StockInsuficienteError } from '../../Services/backend.service';
import type { CartItem } from '../../Services/CartContext';
import OrderConfirmation from '../Checkout/OrderConfirmation';
import '../Checkout/CheckoutModal.css';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  subtotal:  number;
  igv:       number;
  envio:     number;
  total:     number;
  district:  string;
  cart:      CartItem[];
  onClose:   () => void;
  onSuccess: (orderId: number) => void;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
type PayMethod = 'card' | 'qr';
type Step      = 'method' | 'form' | 'receipt';

// ─── Regex de validación sandbox ─────────────────────────────────────────────
const REGEX = {
  card:   /^\d{16}$/,
  expiry: /^(0[1-9]|1[0-2])\/\d{2}$/,
  cvv:    /^\d{3}$/,
  opNum:  /^\d{6,12}$/,
};

// ─── Datos QR simulados ───────────────────────────────────────────────────────
const QR_ACCOUNT = {
  banco:   'BCP (simulado)',
  cci:     '002-19300123456789-14',
  titular: 'KAIZER STORE S.A.C.',
  ruc:     '20123456789',
};

// ─── Formatear número de tarjeta con espacios ─────────────────────────────────
function formatCardNumber(val: string): string {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CheckoutModal({
  subtotal, igv, envio, total, district, cart, onClose, onSuccess,
}: Props) {
  const [step, setStep]           = useState<Step>('method');
  const [method, setMethod]       = useState<PayMethod>('card');
  const [loading, setLoading]     = useState(false);
  const [orderId, setOrderId]     = useState<number | null>(null);
  const [error, setError]         = useState('');

  // Campos tarjeta
  const [cardNum, setCardNum]     = useState('');
  const [cardName, setCardName]   = useState('');
  const [expiry, setExpiry]       = useState('');
  const [cvv, setCvv]             = useState('');

  // Campo QR
  const [opNum, setOpNum]         = useState('');

  // Errores por campo
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const overlayRef = useRef<HTMLDivElement>(null);

  // ─── Cierre al click fuera del modal ─────────────────────────────────────
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // ─── Formateo automático de expiración MM/AA ──────────────────────────────
  const handleExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpiry(clean);
    }
  };

  // ─── Validación tarjeta ───────────────────────────────────────────────────
  const validateCard = (): boolean => {
    const errs: Record<string, string> = {};
    const raw = cardNum.replace(/\s/g, '');

    if (!REGEX.card.test(raw))    errs.cardNum = 'Debe tener 16 dígitos';
    if (!cardName.trim())          errs.cardName = 'Ingresa el nombre del titular';
    if (!REGEX.expiry.test(expiry)) errs.expiry = 'Formato MM/AA inválido';
    if (!REGEX.cvv.test(cvv))      errs.cvv = 'CVV debe tener 3 dígitos';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Validación QR ───────────────────────────────────────────────────────
  const validateQr = (): boolean => {
    const errs: Record<string, string> = {};
    if (!REGEX.opNum.test(opNum.replace(/\s/g, ''))) {
      errs.opNum = 'N° de operación debe tener entre 6 y 12 dígitos';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Envío al backend ─────────────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="co-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="co-modal" role="dialog" aria-modal="true" aria-label="Checkout">

        {/* Header */}
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

        {/* ── PASO 1: Selección de método ── */}
        {step === 'method' && (
          <div className="co-body">
            <h3 className="co-title">¿Cómo deseas pagar?</h3>

            <div className="co-methods">
              <button
                className={`co-method-btn ${method === 'card' ? 'selected' : ''}`}
                onClick={() => setMethod('card')}
              >
                <span className="co-method-icon">💳</span>
                <span className="co-method-label">Tarjeta de crédito / débito</span>
                <span className="co-method-sub">Visa, Mastercard, Amex</span>
              </button>

              <button
                className={`co-method-btn ${method === 'qr' ? 'selected' : ''}`}
                onClick={() => setMethod('qr')}
              >
                <span className="co-method-icon">📱</span>
                <span className="co-method-label">Pago por transferencia / QR</span>
                <span className="co-method-sub">Yape, Plin, BCRP</span>
              </button>
            </div>

            {/* Mini resumen */}
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
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 2A: Formulario de tarjeta ── */}
        {step === 'form' && method === 'card' && (
          <div className="co-body">
            <h3 className="co-title">Datos de la tarjeta</h3>

            {/* Vista previa de tarjeta */}
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

            {/* Campos */}
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

        {/* ── PASO 2B: Transferencia / QR ── */}
        {step === 'form' && method === 'qr' && (
          <div className="co-body">
            <h3 className="co-title">Pago por transferencia</h3>


            {/* Datos de cuenta */}
            <div className="co-qr-wrapper">
              <div className="co-qr-img">
                {/* QR simulado con patrón visual */}
                <svg viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                  <rect width="120" height="120" fill="white"/>
                  {/* Finder patterns */}
                  <rect x="10" y="10" width="30" height="30" rx="2" fill="#1a1a2e"/>
                  <rect x="14" y="14" width="22" height="22" rx="1" fill="white"/>
                  <rect x="18" y="18" width="14" height="14" rx="1" fill="#1a1a2e"/>
                  <rect x="80" y="10" width="30" height="30" rx="2" fill="#1a1a2e"/>
                  <rect x="84" y="14" width="22" height="22" rx="1" fill="white"/>
                  <rect x="88" y="18" width="14" height="14" rx="1" fill="#1a1a2e"/>
                  <rect x="10" y="80" width="30" height="30" rx="2" fill="#1a1a2e"/>
                  <rect x="14" y="84" width="22" height="22" rx="1" fill="white"/>
                  <rect x="18" y="88" width="14" height="14" rx="1" fill="#1a1a2e"/>
                  {/* Data modules (simulados) */}
                  {[50,54,58,62,66,70,74,78,82,50,62,74,50,54,58,70,78,82,50,66,82,50,54,62,70,74,78].map((x, i) => (
                    <rect key={i} x={x} y={46 + (i % 7) * 6} width="4" height="4" fill="#1a1a2e"/>
                  ))}
                  {[10,18,26,50,58,66,74,82,90,100].map((x, i) => (
                    <rect key={`d${i}`} x={x} y={50 + (i % 5) * 10} width="4" height="4" fill="#1a1a2e"/>
                  ))}
                  {/* Logo simulado en centro */}
                  <rect x="52" y="52" width="16" height="16" rx="2" fill="#7c3aed"/>
                  <text x="60" y="64" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">K</text>
                </svg>
              </div>

              <div className="co-qr-account">
                <div className="co-qr-row">
                  <span>Banco</span>
                  <strong>{QR_ACCOUNT.banco}</strong>
                </div>
                <div className="co-qr-row">
                  <span>CCI</span>
                  <strong className="co-qr-cci">{QR_ACCOUNT.cci}</strong>
                </div>
                <div className="co-qr-row">
                  <span>Titular</span>
                  <strong>{QR_ACCOUNT.titular}</strong>
                </div>
                <div className="co-qr-row">
                  <span>RUC</span>
                  <strong>{QR_ACCOUNT.ruc}</strong>
                </div>
                <div className="co-qr-row co-qr-amount">
                  <span>Monto exacto</span>
                  <strong>S/ {total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Campo número de operación */}
            <div className={`co-field co-field--op ${fieldErrors.opNum ? 'has-error' : ''}`}>
              <label htmlFor="opNum">
                Número de operación <span className="co-required">*</span>
              </label>
              <input
                id="opNum"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 12345678"
                value={opNum}
                onChange={(e) => setOpNum(e.target.value.replace(/\D/g, '').slice(0, 12))}
              />
              <span className="co-field-hint">Ingresa el código de confirmación de tu app bancaria</span>
              {fieldErrors.opNum && <span className="co-error">{fieldErrors.opNum}</span>}
            </div>

            {error && <p className="co-global-error">{error}</p>}

            <div className="co-btn-row">
              <button className="co-btn-secondary" onClick={() => setStep('method')}>← Volver</button>
              <button className="co-btn-primary" disabled={loading} onClick={() => void handleSubmit()}>
                {loading ? 'Verificando…' : 'Confirmar pago →'}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: Comprobante ── */}
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