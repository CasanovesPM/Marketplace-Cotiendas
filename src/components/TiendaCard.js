import React from 'react';
import { useNavigate } from 'react-router-dom';

const TiendaCard = ({ tienda }) => {

  const {
    id,
    logo,
    nombre,
    direccion,
    ciudad,
    categoria,
    subcategoria,
    provincia,
    telefono,
    promedioEstrellas = 0,
    premium,
    verificada
  } = tienda;



  const isMobile = window.innerWidth <= 600;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tienda/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        border: '1px solid #ddd',
        padding: '10px',
        borderRadius: '10px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        transition: 'transform 0.3s, box-shadow 0.3s',
        overflow: 'hidden',
        width: isMobile ? '48%' : '100%',
        margin: isMobile ? '1%' : '0'
      }}
      onMouseEnter={e => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }
      }}
      onMouseLeave={e => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Emblemas */}
      {verificada && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '4px 8px',
          fontWeight: 'bold',
          fontSize: '12px',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 2
        }}>
          ✅ Tienda Verificada
        </div>
      )}

      {premium && (
        <div style={{
          position: 'absolute',
          top: verificada ? '40px' : '10px',
          left: '10px',
          backgroundColor: '#ffd700',
          color: '#000',
          padding: '4px 8px',
          fontWeight: 'bold',
          fontSize: '12px',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 1
        }}>
          ⭐ PREMIUM
        </div>
      )}

      {/* Imagen de logo */}
      <div style={{
        width: '100%',
        height: isMobile ? '120px' : '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '10px',
        backgroundColor: '#fff'
      }}>
        <img
          src={logo || 'https://dummyimage.com/150x150/cccccc/ffffff&text=Sin+logo'}
          alt={nombre}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Información visible */}
      <h3 style={{ margin: '10px 0 5px' }}>{nombre}</h3>
      <p style={{ margin: '0 0 10px' }}>{categoria}</p>
      <p style={{ margin: '0 0 10px' }}>{subcategoria}</p>

      {!isMobile && (
        <>
          <div style={{ fontSize: '20px', color: '#f7d000' }}>
            {'★'.repeat(Math.round(promedioEstrellas))}{'☆'.repeat(5 - Math.round(promedioEstrellas))}
          </div>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Promedio: {promedioEstrellas.toFixed(1)} / 5
          </p>
          <p>{direccion}</p>
          <p>{provincia}</p>
          <p>{telefono}</p>
        </>
      )}
    </div>
  );
};

export default TiendaCard;
