import React, { useEffect } from 'react';
import {  db, setDoc,doc, getDoc, updateDoc  } from '../firebaseConfig';


const AdsBanner = () => {
  const isMobile = window.innerWidth <= 600;
  if (isMobile) return null;

  // 🔄 Sumar 1 a la impresión del banner
  const registrarImpresionBanner = async () => {
    const ref = doc(db, 'estadisticas', 'resumenGeneral');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const actuales = data.publicidades?.totalImpAdsBanner || 0;

      await updateDoc(ref, {
        'publicidades.totalImpAdsBanner': actuales + 1
      });
    } else {
      await setDoc(ref, {
        publicidades: {
          totalImpAdsBanner: 1
        }
      }, { merge: true });
    }
  };

  // 👆 Sumar 1 al hacer clic
  const registrarClickBanner = async () => {
    const ref = doc(db, 'estadisticas', 'resumenGeneral');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const actuales = data.publicidades?.totalClicksAdsBanner || 0;

      await updateDoc(ref, {
        'publicidades.totalClicksAdsBanner': actuales + 1
      });
    } else {
      await setDoc(ref, {
        publicidades: {
          totalClicksAdsBanner: 1
        }
      }, { merge: true });
    }
  };

  // Ejecutar al renderizar (impresión)
  useEffect(() => {
    registrarImpresionBanner();
  }, []);

  const handleClick = () => {
    registrarClickBanner();
    window.open('https://www.tupublicidad.com/banner', '_blank');
  };

  const bannerStyle = {
    width: '100%',
    height: '50px',
    margin: '10px 0',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gridColumn: '1 / -1',
    cursor: 'pointer'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  return (
    <div style={bannerStyle} onClick={handleClick}>
      <img
        src="https://via.placeholder.com/1200x50?text=Publicidad+Banner"
        alt="Publicidad Banner"
        style={imageStyle}
      />
    </div>
  );
};

export default AdsBanner;
