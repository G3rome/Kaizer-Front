import { Link } from 'react-router-dom'; // Importante para la navegación interna
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-left">
                    {/* Usamos Link en lugar de <a> para que sea una Single Page Application */}
                    <Link to="/about">ABOUT US</Link>
                    <Link to="/social-media">SOCIAL MEDIA</Link>
                </div>
                <div className="footer-right">
                    © 2026 Kaizer Tech. All Rights Reserved
                </div>
            </div>
        </footer>
    );
};

export default Footer;