import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Services/AuthContext';
import './Profile.css';

interface ProfileForm {
  nombre: string;
  apellido: string;
  telefono: string;
  documento: string;
  direccion: string;
  distrito: string;
}

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: number;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  items: OrderItem[];
}

const ESTADO_LABEL: Record<Order['estado'], string> = {
  pendiente:   'Pendiente',
  procesando:  'Procesando',
  enviado:     'Enviado',
  entregado:   'Entregado',
  cancelado:   'Cancelado',
};

const ESTADO_CLASS: Record<Order['estado'], string> = {
  pendiente:  'badge badge--warning',
  procesando: 'badge badge--info',
  enviado:    'badge badge--primary',
  entregado:  'badge badge--success',
  cancelado:  'badge badge--danger',
};

export default function Profile() {
  const { isAuthenticated, userEmail } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    nombre:    '',
    apellido:  '',
    telefono:  '',
    documento: '',
    direccion: '',
    distrito:  '',
  });

  const [saving,        setSaving]       = useState(false);
  const [saveMsg,       setSaveMsg]      = useState<string | null>(null);
  const [orders,        setOrders]       = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      try { setForm(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);


  useEffect(() => {
    if (!isAuthenticated) return;

    setLoadingOrders(true);

    setTimeout(() => {
      setOrders([
        {
          orderId: 1042,
          fecha:   '2025-06-01',
          total:   189.90,
          estado:  'entregado',
          items: [
            { productId: 3, name: 'The Last of Us Part II',  quantity: 1, price: 149.90 },
            { productId: 7, name: 'Control Ultimate Edition', quantity: 1, price:  40.00 },
          ],
        },
        {
          orderId: 1057,
          fecha:   '2025-06-10',
          total:    89.90,
          estado:  'enviado',
          items: [
            { productId: 12, name: 'Hades',         quantity: 2, price: 39.90 },
            { productId: 19, name: 'Celeste',        quantity: 1, price: 10.10 },
          ],
        },
        {
          orderId: 1063,
          fecha:   '2025-06-14',
          total:   220.00,
          estado:  'procesando',
          items: [
            { productId: 5, name: 'Elden Ring', quantity: 1, price: 220.00 },
          ],
        },
      ]);
      setLoadingOrders(false);
    }, 800);
  }, [isAuthenticated, userEmail]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);

    await new Promise(r => setTimeout(r, 600));
    localStorage.setItem('userProfile', JSON.stringify(form));

    setSaving(false);
    setSaveMsg('Perfil actualizado correctamente.');
    setTimeout(() => setSaveMsg(null), 3500);
  };

  const toggleOrder = (id: number) =>
    setExpandedOrder(prev => (prev === id ? null : id));

  return (
    <div className="profile-container">

      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {(form.nombre ? form.nombre[0] : userEmail?.[0] ?? '?').toUpperCase()}
        </div>
        <div className="profile-header-info">
          <h1 className="profile-name">
            {form.nombre && form.apellido
              ? `${form.nombre} ${form.apellido}`
              : userEmail ?? 'Mi perfil'}
          </h1>
          <p className="profile-email">
            <i className="fi fi-rs-envelope" aria-hidden="true" />
            {userEmail}
          </p>
        </div>
      </header>

      <div className="profile-grid">

        <section className="profile-card" aria-labelledby="datos-heading">
          <h2 id="datos-heading" className="profile-card-title">
            <i className="fi fi-rs-user" aria-hidden="true" />
            Datos personales
          </h2>

          <form onSubmit={handleSave} noValidate>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre" name="nombre" type="text"
                  placeholder="Ej. Carlos"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido" name="apellido" type="text"
                  placeholder="Ej. Ramírez"
                  value={form.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">
                Teléfono de contacto
                <span className="form-hint">Para coordinar entregas</span>
              </label>
              <input
                id="telefono" name="telefono" type="tel"
                placeholder="Ej. 987 654 321"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="documento">
                DNI / RUC
                <span className="form-hint">Para boleta o factura electrónica</span>
              </label>
              <input
                id="documento" name="documento" type="text"
                inputMode="numeric"
                placeholder="Ej. 12345678 o 20512345678"
                value={form.documento}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">
                Dirección de entrega
              </label>
              <input
                id="direccion" name="direccion" type="text"
                placeholder="Calle, número, referencia"
                value={form.direccion}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="distrito">Distrito</label>
              <input
                id="distrito" name="distrito" type="text"
                placeholder="Ej. Vitarte"
                value={form.distrito}
                onChange={handleChange}
              />
            </div>

            {saveMsg && (
              <p className="save-success" role="status">
                <i className="fi fi-rs-check-circle" aria-hidden="true" />
                {saveMsg}
              </p>
            )}

            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>

          </form>
        </section>

        <section className="profile-card orders-card" aria-labelledby="orders-heading">
          <h2 id="orders-heading" className="profile-card-title">
            <i className="fi fi-rs-receipt" aria-hidden="true" />
            Historial de órdenes
          </h2>

          {loadingOrders ? (
            <div className="orders-loading" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              Cargando órdenes…
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <i className="fi fi-rs-box-open" aria-hidden="true" />
              <p>Aún no tienes compras registradas.</p>
            </div>
          ) : (
            <div className="orders-list" role="list">
              {orders.map(order => (
                <article
                  key={order.orderId}
                  className={`order-item${expandedOrder === order.orderId ? ' order-item--open' : ''}`}
                  role="listitem"
                >
                  <button
                    type="button"
                    className="order-header"
                    onClick={() => toggleOrder(order.orderId)}
                    aria-expanded={expandedOrder === order.orderId}
                    aria-controls={`order-detail-${order.orderId}`}
                  >
                    <div className="order-header-left">
                      <span className="order-id">#{order.orderId}</span>
                      <span className="order-date">
                        {new Date(order.fecha).toLocaleDateString('es-PE', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="order-header-right">
                      <span className={ESTADO_CLASS[order.estado]}>
                        {ESTADO_LABEL[order.estado]}
                      </span>
                      <strong className="order-total">
                        S/ {order.total.toFixed(2)}
                      </strong>
                      <i
                        className={`fi fi-rs-angle-${expandedOrder === order.orderId ? 'up' : 'down'} order-chevron`}
                        aria-hidden="true"
                      />
                    </div>
                  </button>

                  {expandedOrder === order.orderId && (
                    <div
                      id={`order-detail-${order.orderId}`}
                      className="order-detail"
                    >
                      <table className="order-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th className="col-center">Cant.</th>
                            <th className="col-right">Precio unit.</th>
                            <th className="col-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map(item => (
                            <tr key={item.productId}>
                              <td>{item.name}</td>
                              <td className="col-center">{item.quantity}</td>
                              <td className="col-right">S/ {item.price.toFixed(2)}</td>
                              <td className="col-right">
                                S/ {(item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="col-right tfoot-label">Total</td>
                            <td className="col-right tfoot-total">
                              S/ {order.total.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}