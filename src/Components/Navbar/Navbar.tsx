import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../Services/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, userEmail, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar" aria-label="Principal">
      <div className="navbar-container">
        <ul className="nav-list">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Sobre Nosotros
            </NavLink>
          </li>
        </ul>

        <div className="auth-actions">
          {isAuthenticated ? (
            <>
              <span className="auth-user">
                <i className="fi fi-rs-user"></i>
                {userEmail ?? 'Usuario'}
              </span>
              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="auth-link">
                <i className="fi fi-rs-user"></i>
                Ingresar
              </NavLink>
              <NavLink to="/register" className="auth-link">
                <i className="fi fi-rs-user-add"></i>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
