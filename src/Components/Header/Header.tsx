import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="main-header">
      <div className="header-container">
        {/* Envolvemos el logo en un Link hacia la raíz */}
        <Link to="/" className="logo-link">
          <h1 className="logo">Kaizer Tech</h1>
        </Link>

        <Link to="/cart" className="cart-icon" aria-label="Ir al carrito">
          <i className="fi fi-rs-shopping-cart-add"></i>
        </Link>
      </div>
    </header>
  );
}