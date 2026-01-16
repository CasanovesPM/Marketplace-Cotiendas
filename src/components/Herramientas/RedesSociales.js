import React, { useState } from 'react';
import { db, collection, query, where, getDocs, doc, updateDoc } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';

const iconStyles = {
  whatsapp: {   fontSize: '35px',
  transition: 'transform 0.2s ease, color 0.2s ease',
  color: '#25D366' },
  instagram: {   fontSize: '35px',
  transition: 'transform 0.2s ease, color 0.2s ease',
  color: '#E1306C' },
  facebook: {   fontSize: '35px',
  transition: 'transform 0.2s ease, color 0.2s ease',
  color: '#1877F2' },
  web: {   fontSize: '35px',
  transition: 'transform 0.2s ease, color 0.2s ease',
  color: '#007BFF'},
};

const hoverColors = {
  whatsapp: '#25D366',
  instagram: '#E1306C',
  facebook: '#1877F2',
  web: '#007BFF',
};



const registrarInteraccion = async (tipo, uid) => {
  try {


    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {

      const docUser = querySnapshot.docs[0];

      const ref = doc(db, "usuarios", docUser.id);
      const data = docUser.data();
      const campo = `int${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`; // Ej: intFacebook

      await updateDoc(ref, {
        [campo]: (data[campo] || 0) + 1
      });
    }
  } catch (err) {
    console.error(`Error al registrar interacción en ${tipo}:`, err);
  }
};



const RedesSociales = ({ telefono, whatsappLink, instaLink, faceLink, webLink, tiendaName, uid }) => {

  const handleMouseEnter = (e, tipo) => {
    e.target.style.color = hoverColors[tipo];
    e.target.style.transform = 'scale(1.2)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.color = iconStyles.color;
    e.target.style.transform = 'scale(1)';
  };

  return (
    <>
        <div style={{ display: 'block' , textAlign: 'center'}}>
            <h4 >Enlaces de {tiendaName}</h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', padding: '20px 10px', }}>
{telefono && (
  <a
    href={whatsappLink}
    target="_blank"
    rel="noopener noreferrer"
    title="WhatsApp"
    onClick={() => registrarInteraccion("whatsapp", uid)}
  >
    <i
      className="fab fa-whatsapp"
      style={iconStyles.whatsapp}
      onMouseEnter={(e) => handleMouseEnter(e, 'whatsapp')}
      onMouseLeave={handleMouseLeave}
    ></i>
  </a>
)}

{instaLink && (
  <a
    href={instaLink}
    target="_blank"
    rel="noopener noreferrer"
    title="Instagram"
    onClick={() => registrarInteraccion("instagram", uid)}
  >
    <i
      className="fab fa-instagram"
      style={iconStyles.instagram}
      onMouseEnter={(e) => handleMouseEnter(e, 'instagram')}
      onMouseLeave={handleMouseLeave}
    ></i>
  </a>
)}

{faceLink && (
  <a
    href={faceLink}
    target="_blank"
    rel="noopener noreferrer"
    title="Facebook"
    onClick={() => registrarInteraccion("facebook", uid)}
  >
    <i
      className="fab fa-facebook-f"
      style={iconStyles.facebook}
      onMouseEnter={(e) => handleMouseEnter(e, 'facebook')}
      onMouseLeave={handleMouseLeave}
    ></i>
  </a>
)}
{webLink && (
  <a
    href={webLink}
    target="_blank"
    rel="noopener noreferrer"
    title="Sitio Web"
    onClick={() => registrarInteraccion("web", uid)}
  >
    <i
      className="fas fa-globe"
      style={iconStyles.web}
      onMouseEnter={(e) => handleMouseEnter(e, 'web')}
      onMouseLeave={handleMouseLeave}
    ></i>
  </a>
)}
            </div>
    </div>
    </>

  );
};

export default RedesSociales;
