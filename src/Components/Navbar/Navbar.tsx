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
            <NavLink to="/home" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
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
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? 'auth-link active' : 'auth-link'
                }
                title={userEmail ?? 'Mi perfil'}
              >
                <i className="fi fi-rs-user"></i>
                {userEmail ?? 'Mi perfil'}
              </NavLink>
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