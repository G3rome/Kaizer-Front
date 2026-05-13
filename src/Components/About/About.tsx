import './About.css';

export default function About() {
  // Imagen de referencia para la sección de misión
  const teamImage = '/images/innovacell-celulares.jpeg_1902800913.webp';

  return (
    <div className="about">
      <div className="about-container">
        {/* Encabezado principal */}
        <h2 className="about-title">Sobre Kaizer Tech</h2>
        <p className="about-subtitle">
          Innovación, calidad y compromiso en cada dispositivo que llega a tus manos.
        </p>

        {/* Sección de Misión con Imagen */}
        <div className="about-card">
          <div className="about-content">
            <h3>Nuestra Misión</h3>
            <p>
              En Kaizer Tech, nos apasiona acercar la tecnología de vanguardia a todos. 
              Nacimos con el objetivo de ser el puente entre los últimos lanzamientos 
              globales y los usuarios que buscan rendimiento y estilo.
            </p>
            <p>
              No solo vendemos productos; ofrecemos soluciones tecnológicas que potencian 
              tu día a día, respaldadas por un equipo experto en hardware y gadgets.
            </p>
            <a href="mailto:contacto@kaizertech.com" className="about-button">
              Contáctanos
            </a>
          </div>

          <div className="about-image-container">
            <img
              src={teamImage}
              alt="Nuestro equipo de tecnología"
              className="about-image"
            />
          </div>
        </div>

        {/* Sección de Pilares / Valores en 3 Cards */}
        <h3 className="values-title">Nuestros Pilares</h3>

        <div className="values-grid">
          {/* Card 1: Calidad */}
          <div className="value-card">
            <div className="value-icon">
              <i className="fi fi-rs-star"></i> 
            </div>
            <h5>Calidad Premium</h5>
            <p>
              Seleccionamos meticulosamente cada producto de nuestro catálogo para asegurar excelencia en cada entrega.
            </p>
          </div>

          {/* Card 2: Atención */}
          <div className="value-card">
            <div className="value-icon">
              <i className="fi fi-rs-users"></i>
            </div>
            <h5>Atención Humana</h5>
            <p>
              Nuestro equipo de soporte está siempre listo para resolver tus dudas de forma personalizada y cercana.
            </p>
          </div>

          {/* Card 3: Soporte */}
          <div className="value-card">
            <div className="value-icon">
              <i className="fi fi-rs-settings"></i>
            </div>
            <h5>Soporte Técnico</h5>
            <p>
              Ofrecemos asesoría técnica post-venta para que aproveches al máximo tu inversión tecnológica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}