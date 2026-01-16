import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmblemasTienda = ({ tienda }) => {
  const navigate = useNavigate();

  const handleClickInfo = () => {
    navigate('/mis-puntos');
  };

  const estilos = {
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '20px'
    },
    innerContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    badgeVerificada: {
      backgroundColor: '#4caf50',
      color: 'white',
      padding: '4px 8px',
      fontWeight: 'bold',
      fontSize: '12px',
      borderRadius: '6px',
      marginTop: '5px',
      width: '200px',
      textAlign: 'center'
    },
    badgeNoVerificada: {
      backgroundColor: '#ddd',
      color: '#555',
      padding: '4px 8px',
      fontWeight: 'bold',
      fontSize: '12px',
      borderRadius: '6px',
      marginTop: '5px',
      width: '200px',
      textAlign: 'center',
      cursor: 'pointer'
    },
    badgePremium: {
      backgroundColor: '#ffd700',
      color: '#000',
      padding: '4px 8px',
      fontWeight: 'bold',
      fontSize: '12px',
      borderRadius: '6px',
      marginTop: '10px',
      width: '200px',
      textAlign: 'center'
    },
    badgeNoPremium: {
      backgroundColor: '#eee',
      color: '#666',
      padding: '4px 8px',
      fontWeight: 'bold',
      fontSize: '12px',
      borderRadius: '6px',
      marginTop: '10px',
      width: '200px',
      textAlign: 'center',
      cursor: 'pointer'
    }
  };

  return (
    <div style={estilos.container}>
      <div style={estilos.innerContainer}>
        {/* VERIFICADA o NO */}
        {tienda?.verificada ? (
          <div style={estilos.badgeVerificada}>✅ Tienda Verificada</div>
        ) : (
          <div
            style={estilos.badgeNoVerificada}
            onClick={handleClickInfo}
            title={`¿Por qué verificar tu tienda?
• Generás más confianza.
• Aparecés en mejores posiciones.
• Tenés insignia oficial.

👉 Hacé clic en "Mis Puntos" ubicada en la barra de navegacion superior y verificar tu tienda.`}
          >
            ❌ No Verificada
          </div>
        )}

        {/* PREMIUM o NO */}
        {tienda?.esPremium ? (
          <div style={estilos.badgePremium}>⭐ PREMIUM</div>
        ) : (
          <div
            style={estilos.badgeNoPremium}
            onClick={handleClickInfo}
            title={`¿Por qué ser PREMIUM?
• Productos destacados.
• Mejor visibilidad.
• Más puntos y beneficios.

👉 Hacé clic en "Mis Puntos" ubicada en la barra de navegacion superior y hacerte PREMIUM.`}
          >
            🔒 No es PREMIUM
          </div>
        )}
      </div>
    </div>
  );
};

export default EmblemasTienda;
