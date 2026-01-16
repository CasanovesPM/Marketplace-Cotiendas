import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modo, setModo] = useState('login'); // 'login' o 'registro'

  const handleAuth = async () => {
    try {
      if (modo === 'login') {
        await signInWithEmailAndPassword(email, password);
        await Swal.fire({
          icon: 'success',
          title: 'Sesión iniciada!',
          showConfirmButton: false,
          timer: 1500
        });
        // Recargar para actualizar el AuthContext
        window.location.href = '/perfil';
      } else {
        await createUserWithEmailAndPassword(email, password);
        await Swal.fire({
          icon: 'success',
          title: 'Cuenta creada!',
          showConfirmButton: false,
          timer: 1500
        });
        navigate('/register');
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleRegister = async () => {
    navigate('/register');
  };

  return (
    <div style={containerStyle}>
      <h2>{modo === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
      <button onClick={handleAuth} style={buttonStyle}>
        {modo === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </button>
      <button onClick={handleRegister} style={googleButtonStyle}>Registrarse</button>
    </div>
  );
};

const containerStyle = {
  maxWidth: '400px',
  margin: '20px auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const inputStyle = {
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  backgroundColor: '#FF6D00',
  color: 'white',
  border: 'none',
  padding: '10px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const googleButtonStyle = {
  backgroundColor: '#DB4437',
  color: 'white',
  border: 'none',
  padding: '10px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const linkStyle = {
  color: '#FF6D00',
  cursor: 'pointer',
  textAlign: 'center'
};

export default Login;
