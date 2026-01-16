import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, collection, getDocs, doc, getDoc, updateDoc, setDoc } from '../firebaseConfig';
import './Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';


const registrarBusqueda = async () => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = hoy.getFullYear();
  const fechaHoy = `${dia}-${mes}-${anio}`;

  try {
    // 🔸 1. Registrar en el total general
    const refGeneral = doc(db, 'estadisticas', 'busquedas');
    const snapGeneral = await getDoc(refGeneral);

    if (snapGeneral.exists()) {
      const data = snapGeneral.data();
      const cantidad = data.busquedasCotiendas || 0;
      await updateDoc(refGeneral, {
        busquedasCotiendas: cantidad + 1
      });
    } else {
      await setDoc(refGeneral, {
        busquedasCotiendas: 1
      });
    }

    // 🔸 2. Registrar por día
    const refDiaria = doc(db, 'estadisticas', 'busquedas', 'diarias', fechaHoy);
    const snapDiaria = await getDoc(refDiaria);

    if (snapDiaria.exists()) {
      const data = snapDiaria.data();
      const cantidad = data.busquedasHoy || 0;
      await updateDoc(refDiaria, {
        busquedasHoy: cantidad + 1
      });
    } else {
      await setDoc(refDiaria, {
        busquedasHoy: 1
      });
    }

  } catch (error) {
    console.error("Error al registrar búsqueda:", error);
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerCategorias = async () => {
      const snapshot = await getDocs(collection(db, 'productos'));
      const conteoCategorias = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.estado !== 'pausado' && data.categoria) {
          conteoCategorias[data.categoria] = (conteoCategorias[data.categoria] || 0) + 1;
        }
      });

      const categoriasArray = Object.entries(conteoCategorias)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);

      setCategorias(categoriasArray);
    };

    obtenerCategorias();
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      registrarBusqueda(); // ✅ REGISTRO
      navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`);
      setBusqueda('');
      setSugerencias([]);
    }
  };

  const handleChange = async (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.trim().length >= 2) {
      const snapshot = await getDocs(collection(db, 'productos'));
      const coincidencias = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p =>
          p.estado !== 'pausado' &&
          (p.titulo?.toLowerCase().includes(valor.toLowerCase()) ||
            p.descripcion?.toLowerCase().includes(valor.toLowerCase()) ||
            p.etiquetas?.some(et => et.toLowerCase().includes(valor.toLowerCase())))
        )
        .slice(0, 5);
      setSugerencias(coincidencias);
    } else {
      setSugerencias([]);
    }
  };

  const handleSeleccionarProducto = (id) => {
    registrarBusqueda();
    navigate(`/producto/${id}`);
    setBusqueda('');
    setSugerencias([]);
  };

  const handleClickCategoria = (categoria) => {
    navigate(`/buscar-categoria?q=categoria:${encodeURIComponent(categoria)}`);
  };



  return (
    <nav className="navbar">
      <div className="navbar-left">
          <h1 className="logo" onClick={() => navigate('/')}> <img src="/alabosta-logo.png" width={"100%"} alt="Publicidad Izquierda" /></h1>

      </div>

      <div className="navbar-center">
      <div className="form-container">
  <form onSubmit={handleBuscar} style={{ display: 'flex', width: '100%', gap: '5px', alignItems: 'stretch' }}>
    <input
      type="text"
      placeholder="Buscar productos..."
      className="search-bar"
      value={busqueda}
      onChange={handleChange}
    />
    <button type="submit" className="btn-buscar">
      <i className="fas fa-search"></i>
    </button>
  </form>

  {sugerencias.length > 0 && (
    <ul className="sugerencias-lista">
      {sugerencias.map(item => {
        const simboloMoneda = (item.moneda === 'USD' || item.moneda === 'U$D') ? 'U$D' : '$';
        const precio = parseFloat(item.precio) || 0;
        const precioFormateado = new Intl.NumberFormat('es-AR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precio);
        return (
          <li key={item.id} onClick={() => handleSeleccionarProducto(item.id)}>
            <span>{item.titulo}</span>
            <span style={{ float: 'right', fontWeight: 'bold' }}>{simboloMoneda} {precioFormateado}</span>
          </li>
        );
      })}
    </ul>
  )}
</div>

        {/* Botones de categorías principales + botón "CATEGORÍAS" 
        {categorias.length > 0 && (
          <div className="categorias-container">



            {categorias.slice(0, 5).map(cat => (
              <button key={cat.nombre} className="btn-categoria" onClick={() => handleClickCategoria(cat.nombre)}>
                {cat.nombre}
              </button>
            ))}

                            <button
      className="btn-hotsale"
      onClick={() => navigate('/liquidaciones')}
    >
      🔥 LIQUIDACION 🔥
    </button>

        )}*/}
      </div>

<div className="navbar-right">
  <ul className="navbar-menu">
    <li><Link to="/">Inicio</Link></li>

    <li className="categorias-dropdown">
      <span>Categorías </span>
      <ul className="categorias-menu">
        {categorias.map(cat => (
          <li key={cat.nombre} onClick={() => handleClickCategoria(cat.nombre)}>
            {cat.nombre} {/*({cat.cantidad})*/}
          </li>
        ))}
      </ul>
    </li>

    <li><Link to="/tiendas">Tiendas</Link></li>
    <li><Link to="/contacto">Contacto</Link></li>

    {usuario ? (
      <li><Link to="/perfil">Mi Perfil</Link></li>
    ) : (
      <li><Link to="/login">Iniciar Sesión</Link></li>
    )}
  </ul>
</div>
    </nav>
  );
};

export default Navbar;
