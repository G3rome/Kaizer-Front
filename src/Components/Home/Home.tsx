import './Home.css';

export default function Home() {
  const heroImage = '/images/innovacell-celulares.jpeg_1902800913.webp';

  return (
    <div className="home">
      <div className="hero-container">
        <h2 className="hero-title">Bienvenidos a Kaizer Tech</h2>

        <p className="hero-subtitle">
          Explora los mejores productos tecnológicos a los mejores precios.
        </p>

        <div className="hero-card">
          <div className="hero-content">
            <h3>La última tecnología en tus manos</h3>

            <p>
              Descubre nuestra amplia gama de smartphones y gadgets.
              Encuentra todo lo que necesitas para estar conectado.
            </p>

            <a href="/products" className="hero-button">
              Ver catálogo
            </a>
          </div>

          <div className="hero-image-container">
            <img
              src={heroImage}
              alt="Tecnología móvil"
              className="hero-image"
            />
          </div>
        </div>

        <h3 className="features-title">¿Por qué elegirnos?</h3>

        <div className="features-grid">
          <div className="feature-card">
          <div className="feature-icon">
            <i className="fi fi-rs-truck-side"></i> 
         </div>
            <h5>Envío rápido</h5>

            <p>
              Entregas a nivel nacional en tiempo récord.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fi fi-rs-label"></i>
            </div>

            <h5>Mejores precios</h5>

            <p>
              Ofertas y descuentos durante todo el año.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fi fi-rs-shield-alt"></i>
            </div>

            <h5>Garantía segura</h5>

            <p>
              Productos originales con respaldo del fabricante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}