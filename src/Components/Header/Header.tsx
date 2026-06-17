import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');

  useEffect(() => {
    if (location.pathname === '/products') {
      setQuery(searchParams.get('q') ?? '');
    }
  }, [location.pathname, searchParams]);

  const handleChange = (value: string) => {
    setQuery(value);

    const params = new URLSearchParams();
    if (value.trim()) {
      params.set('q', value);
    }

    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`, {
      replace: true
    });
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Envolvemos el logo en un Link hacia la raíz */}
        <Link to="/" className="logo-link">
          <h1 className="logo">Kaizer Tech</h1>
        </Link>

        <div className="header-search">
          <i className="fi fi-rs-search" aria-hidden="true"></i>
          <input
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos por nombre o categoría"
            className="header-search-input"
          />
        </div>

        <Link to="/cart" className="cart-icon" aria-label="Ir al carrito">
          <i className="fi fi-rs-shopping-cart-add"></i>
        </Link>
      </div>
    </header>
  );
}