import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { initializeExampleProducts } from './utils/initializeExampleProducts';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Buscar from './components/PaginaBuscar';
import PaginaCategoria from './components/PaginaCategoria';

import Feed from './components/Feed';
import PublicarProducto from './components/PublicarProducto';
import PerfilUsuario from './components/PerfilUsuario';
import Login from './components/Login';
import Register from './components/Register';
import VerificarCodigo from './components/VerificarCodigo';
import ProductoDetalle from './components/ProductoDetalle';
import Tiendas from './components/Tiendas';
import TiendaProductos from './components/TiendaProductos';
import AdminDashboard from './xpxpjr/AdminDashboard';
import Contacto from './components/Contacto';


const ProtectedRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <p>Cargando...</p>;
  return usuario ? children : <Navigate to="/login" />;
};

function App() {
  // Inicializar productos de ejemplo al cargar la aplicación
  useEffect(() => {
    initializeExampleProducts();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/publicar" element={<ProtectedRoute><PublicarProducto /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route path="/verificar-codigo" element={<VerificarCodigo />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/buscar-categoria" element={<PaginaCategoria />} />
            <Route path="/tiendas" element={<Tiendas />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/tienda/:id" element={<TiendaProductos />} />
            <Route path="/admin" element={<AdminDashboard />} />

        </Routes>
      <Footer />

      </Router>
    </AuthProvider>
  );
}

export default App;
