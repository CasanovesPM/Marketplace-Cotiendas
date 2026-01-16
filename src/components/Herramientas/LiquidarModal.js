import React from 'react';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    border: '2px solid #ccc',
    borderRadius: '10px',
    padding: '20px',
    boxSizing: 'border-box',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  title: {
    fontSize: '20px',
    marginBottom: '10px'
  },
  description: {
    fontSize: '14px',
    marginBottom: '20px'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px'
  },

  btnSecondary: {
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

const LiquidarModal = ({ onClose, onConfirm }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h3 style={styles.title}>¿Querés Liquidar tu Producto?</h3>
        <p style={styles.description}>
          En <strong>Cotiendas</strong>, liquidar tu producto significa ponerlo en la sección de <strong>Destacados</strong>,
          donde más gente lo verá. Es básicamente, mejorar su posicionamiento y así sus posibilidades de ser comprado.
        </p>
        <p><strong>Costo:</strong> 100 puntos<br />
        <strong>Duración:</strong> 30 días en la sección "Liquidaciones"</p>
      </div>
      <div style={styles.buttonGroup}>
        <button className='btn-hotsale' onClick={onConfirm}>Liquidar</button>
        <button style={styles.btnSecondary} onClick={onClose}>Volver</button>
      </div>
    </div>
  );
};

export default LiquidarModal;
