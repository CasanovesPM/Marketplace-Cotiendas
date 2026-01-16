import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, signOut } from '../firebaseConfig';

// Crear el contexto
const AuthContext = createContext();

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, logout }}>
      {!cargando ? children : <p>Cargando...</p>}
    </AuthContext.Provider>
  );
};
