import React, { useState, useEffect, useRef } from 'react';
import { db, collection, addDoc, serverTimestamp } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './Contacto.css'; // tu archivo de estilos

const MySwal = withReactContent(Swal);

const Contacto = () => {
  const navigate = useNavigate();
  const topRef = useRef(null);

  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    mensaje: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'contactos'), {
        nombre: formulario.nombre,
        email: formulario.email,
        mensaje: formulario.mensaje,
        revisado: false,
        fecha: serverTimestamp()
      });

      await MySwal.fire({
        title: '✅ Mensaje enviado',
        text: 'Gracias por contactarnos. Te responderemos pronto.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#007bff'
      });

      navigate('/');
    } catch (error) {
      console.error('Error al enviar contacto:', error);
      MySwal.fire('Error', 'Ocurrió un error al enviar el mensaje.', 'error');
    }
  };

  return (
    <section className="contacto-section" ref={topRef}>
      <div className="contacto-header">
        <h2>📩 Contactanos</h2>
          <h3 className="logo" onClick={() => navigate('/')}> <img src="/alabosta-logo.png" width={"100%"} alt="Publicidad Izquierda" /></h3>

      </div>

      <div className="contacto-layout">
        <div className="contacto-info">
          <p>¿Tenés dudas o sugerencias? <br />Escribinos y te responderemos lo antes posible.</p>
        </div>

        <form className="contacto-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre y Apellido</label>
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mensaje</label>
            <textarea
              name="mensaje"
              rows="6"
              value={formulario.mensaje}
              onChange={handleChange}
              required
              placeholder="Escribí tu mensaje..."
            />
          </div>

          <button type="submit" className="btn-enviar">Enviar</button>
        </form>
      </div>
    </section>
  );
};

export default Contacto;
