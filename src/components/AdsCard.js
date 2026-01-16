import React, { useEffect } from 'react';
import './ProductCard.css';
import {  db, setDoc,doc, getDoc, updateDoc  } from '../firebaseConfig';


const AdsCard = () => {
  // 👁️ Contador de impresiones
  const registrarImpresionCard = async () => {
    const ref = doc(db, 'estadisticas', 'resumenGeneral');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const actuales = data.publicidades?.totalImpAdsCard || 0;

      await updateDoc(ref, {
        'publicidades.totalImpAdsCard': actuales + 1
      });
    } else {
      await setDoc(ref, {
        publicidades: {
          totalImpAdsCard: 1
        }
      }, { merge: true });
    }
  };

  // 🖱️ Contador de clics
  const registrarClickCard = async () => {
    const ref = doc(db, 'estadisticas', 'resumenGeneral');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const actuales = data.publicidades?.totalClicksAdsCard || 0;

      await updateDoc(ref, {
        'publicidades.totalClicksAdsCard': actuales + 1
      });
    } else {
      await setDoc(ref, {
        publicidades: {
          totalClicksAdsCard: 1
        }
      }, { merge: true });
    }
  };

  useEffect(() => {
    registrarImpresionCard();
  }, []);

  const handleClick = () => {
    registrarClickCard();
    window.open('https://www.tupublicidad.com', '_blank');
  };

  return (
    <div className="product-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <img
        src="https://via.placeholder.com/300x300?text=Publicidad"
        alt="Publicidad"
        className="product-image"
      />
      <h3 className="product-title">Publicidad Destacada</h3>
      <p className="product-price">¡Haz clic para más info!</p>
      <p className="product-location">Anunciante</p>
    </div>
  );
};

export default AdsCard;
