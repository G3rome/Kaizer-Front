import { useRef } from 'react';
import type { CartItem } from '../../Services/CartContext';
import '../Checkout/OderConfirmation.css';

interface Props {
  orderId:    number;
  subtotal:   number;
  igv:        number;
  envio:      number;
  total:      number;
  district:   string;
  items:      CartItem[];
  payMethod:  'card' | 'qr';
  onClose:    () => void;
}

function formatDate(): string {
  return new Intl.DateTimeFormat('es-PE', {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function payMethodLabel(m: 'card' | 'qr') {
  return m === 'card' ? 'Tarjeta de crédito/débito' : 'Transferencia bancaria / QR';
}

export default function OrderConfirmation({
  orderId, subtotal, igv, envio, total, district, items, payMethod, onClose,
}: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const dateStr = formatDate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="oc-wrapper">
      {/* Área imprimible */}
      <div className="oc-receipt" ref={receiptRef} id="printable-receipt">

        <div className="oc-header">
          <div className="oc-logo">
            <span className="oc-logo-mark">K</span>
            <span className="oc-logo-name">KAIZER STORE</span>
          </div>
          <div className="oc-company-info">
            <p>RUC: 20123456789</p>
            <p>Jr. Comercio 123, Lima, Perú</p>
            <p>ventas@kaizerstore.pe</p>
          </div>
        </div>

        <div className="oc-doc-type">
          BOLETA DE VENTA ELECTRÓNICA
        </div>

        <div className="oc-order-meta">
          <div className="oc-meta-group">
            <span className="oc-meta-label">N° Orden</span>
            <span className="oc-meta-value oc-order-id">#{String(orderId).padStart(6, '0')}</span>
          </div>
          <div className="oc-meta-group">
            <span className="oc-meta-label">Fecha y hora</span>
            <span className="oc-meta-value">{dateStr}</span>
          </div>
          <div className="oc-meta-group">
            <span className="oc-meta-label">Método de pago</span>
            <span className="oc-meta-value">{payMethodLabel(payMethod)}</span>
          </div>
          <div className="oc-meta-group">
            <span className="oc-meta-label">Distrito de entrega</span>
            <span className="oc-meta-value">{district}</span>
          </div>
        </div>

        <div className="oc-divider" />

        <table className="oc-items-table">
          <thead>
            <tr>
              <th className="oc-th-desc">Descripción</th>
              <th className="oc-th-qty">Cant.</th>
              <th className="oc-th-price">P. Unit.</th>
              <th className="oc-th-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="oc-td-desc">
                  <span className="oc-item-name">{item.name}</span>
                  {item.category && (
                    <span className="oc-item-cat">{item.category}</span>
                  )}
                </td>
                <td className="oc-td-qty">{item.quantity}</td>
                <td className="oc-td-price">S/ {item.price.toFixed(2)}</td>
                <td className="oc-td-total">S/ {(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="oc-divider" />

        <div className="oc-totals">
          <div className="oc-total-row">
            <span>Subtotal (sin IGV)</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="oc-total-row">
            <span>IGV 18%</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className="oc-total-row">
            <span>Costo de envío ({district})</span>
            <span>{envio === 0 ? 'S/ 0.00 (Gratis)' : `S/ ${envio.toFixed(2)}`}</span>
          </div>
          <div className="oc-total-row oc-total-final">
            <span>TOTAL PAGADO</span>
            <strong>S/ {total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="oc-divider" />

        <div className="oc-footer">
          <p>Este documento es una boleta de venta electrónica simulada con fines académicos.</p>
          <p>Emitido bajo el marco del IGV según Ley N° 29666 — Tasa: 18%</p>
          <p className="oc-footer-thanks">¡Gracias por tu compra en Kaizer Store!</p>
        </div>
      </div>

      <div className="oc-actions no-print">
        <div className="oc-success-badge">
          <span className="oc-checkmark">✓</span>
          Pago confirmado
        </div>

        <div className="oc-action-buttons">
          <button className="oc-btn-print" onClick={handlePrint}>
            Imprimir / Guardar PDF
          </button>
          <button className="oc-btn-close" onClick={onClose}>
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}