import React from 'react';
import './Footer.css';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3 className="logo" onClick={() => navigate('/')}> <img src="/alabosta-logo.png" width={"100%"} alt="Publicidad Izquierda" /></h3>
          
 
          <p>El mejor lugar para encontrar y vender productos. ¡Conéctate y descubre más!</p>
        </div>

        <div className="footer-section links">
          <h4>Enlaces rápidos</h4>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/publicar">Publicar Producto</a></li>

          </ul>
        </div>

        <div className="footer-section contact">
          <h4>Contacto</h4>
          <p>📧 contacto@tumarketplace.com</p>
          <p>📞 +54 11 1234 5678</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Cotiendas. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
