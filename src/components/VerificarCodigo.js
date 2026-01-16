import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { db, auth, updateDoc, query, collection, where, getDocs, doc } from '../firebaseConfig';

const VerificarCodigo = () => {
  const navigate = useNavigate();

useEffect(() => {
  const checkVerification = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire('Error', 'No hay usuario autenticado. Por favor inicia sesión.', 'error').then(() => {
          navigate('/login');
        });
        return;
      }

      // En LocalStorage, el usuario ya está verificado automáticamente
      // Solo actualizamos el documento si es necesario
      const q = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const docRef = doc(db, 'usuarios', userDoc.id);
        await updateDoc(docRef, {
          verificado: true,
          fechaVerificacion: new Date().toISOString()
        });
      }

      Swal.fire('¡Cuenta verificada!', 'Puedes disfrutar de nuestros servicios!', 'success').then(() => {
        navigate('/perfil');
      });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message || 'Ocurrió un error', 'error');
    }
  };

  checkVerification();
}, [navigate]);


  return (
    <div style={containerStyle}>
      <h2>Validando...</h2>
      <p>Estamos verificando tu cuenta. Por favor revisa tu correo electrónico.</p>
    </div>
  );
};

const containerStyle = {
  maxWidth: '400px',
  margin: '20px auto',
  textAlign: 'center'
};

export default VerificarCodigo;
