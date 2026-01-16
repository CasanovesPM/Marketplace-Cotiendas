import React, { useEffect, useState, useRef } from 'react';
import { auth, db, collection, query, where, getDocs, doc, getDoc, updateDoc, storageRef, uploadBytes, getDownloadURL, storage, updatePassword } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ProductCard from './ProductCard';
import PublicarProducto from './PublicarProducto';
import PlantillaX5Productos from './Herramientas/Plantillax5Productos';
import "./PerfilUsuario.css"
import imageCompression from 'browser-image-compression';
import PagoMembresia from './Herramientas/PagoMembresia'
import DashboardPuntos from './Herramientas/DashboardPuntos';
import Reportar from './Herramientas/Reportar';
import EmblemasTienda from './Herramientas/EmblemasTieda';
import AtajosDeUsuario from './Herramientas/AtajosDeUsuario';
import Recargar from './Herramientas/Recargar';

const provincias = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
  "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
  "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego",
  "Tucumán", "Ciudad Autónoma de Buenos Aires"
];

const PerfilUsuario = () => {
  



  const [mostrarInfo, setMostrarInfo] = useState(false);

  const [banner, setBanner] = useState(null);
const [recargarUsuarioInfo, setRecargarUsuarioInfo] = useState(false);

  const [promedioEstrellas, setPromedioEstrellas] = useState(0);
  const [comentarios, setComentarios] = useState([]);
  const [respuestaActiva, setRespuestaActiva] = useState(null);
const [respuestaTexto, setRespuestaTexto] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]);
  const [puedeVerPerfil, setPuedeVerPerfil] = useState(false);
  const [mostrarSeccion, setMostrarSeccion] = useState('');
  const [mostrarSeccionProductos, setMostrarSeccionProductos] = useState('productos');
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const [mostrarModalEditarInfo, setMostrarModalEditarInfo] = useState(false);
  const [formInfo, setFormInfo] = useState({
    nombre: '', apellido: '', email: '', ciudad: '', provincia: '', telefono: '', password: '', nuevaPassword: ''
  });
  const [mostrarModalEditarProducto, setMostrarModalEditarProducto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  const navigate = useNavigate();

  const userRef = useRef(null);


    useEffect(() => {
  if (usuarioInfo?.tipo === 'admin') {
    navigate('/admin');
  }
}, [usuarioInfo, navigate]); 

  useEffect(() => {



    const verificarEmail = async () => {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire('Error', 'Debes iniciar sesión.', 'error').then(() => navigate('/login'));
        return;
      }
      // En LocalStorage siempre está verificado
      setPuedeVerPerfil(true);
      cargarInfoUsuario(user.uid);
      fetchMisProductos();  // 🔥 Cargar productos al inicio
    };
    verificarEmail();
  }, [navigate, recargarUsuarioInfo]);


    const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const storageRefPath = `usuarios/${usuarioInfo.id}/${field}`;
      const storageReference = storageRef(storageRefPath);
      await storageReference.put(file);
      const url = await storageReference.getDownloadURL();
      setFormInfo(prev => ({ ...prev, [field]: url }));
    } catch (error) {
      Swal.fire('Error', 'No se pudo cargar la imagen', 'error');
    }
  };

  const fetchMisProductos = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'productos'), where('vendedorID', '==', user.uid));
    const snapshot = await getDocs(q);
    setProductos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

const checkTipo = async () => {
  if (mostrarSeccion !== '') return; // ⛔ No sobrescribas si ya hay una sección activa

  if (usuarioInfo?.tipo === 'tienda') {
    setMostrarSeccion('home');
  } else {
    setMostrarSeccion('productos');
  }
};

const cargarInfoUsuario = async (uid) => {
  try {
    const q = query(collection(db, 'usuarios'), where('uid', '==', uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const userId = docSnap.id;

      setUsuarioInfo({ id: userId, ...data });
      setFormInfo({ ...data, password: '', nuevaPassword: '' });

      // 🔄 Actualizar última conexión
      const userDocRef = doc(db, 'usuarios', userId);
      await updateDoc(userDocRef, {
        ultimaConexion: new Date().toISOString()
      });


      checkTipo();
      // 🔽 Obtener comentarios
      const comentariosRef = collection(db, 'usuarios', userId, 'comentarios');
      const comentariosSnap = await getDocs(comentariosRef);
const listaComentarios = comentariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setComentarios(listaComentarios);

      // ⭐ Calcular promedio
      if (listaComentarios.length > 0) {
        const suma = listaComentarios.reduce((acc, c) => acc + (c.calificacion || 0), 0);
        const promedio = suma / listaComentarios.length;
        setPromedioEstrellas(promedio);
      } else {
        setPromedioEstrellas(0);
      }

    } else {
      console.warn("Usuario no encontrado en la base de datos. UID:", uid);
      // Si no se encuentra, mostrar mensaje y redirigir
      Swal.fire({
        icon: 'warning',
        title: 'Usuario no encontrado',
        text: 'Tu cuenta de autenticación existe pero no se encontró tu perfil. Por favor, regístrate nuevamente.',
        confirmButtonText: 'Ir a registro'
      }).then(() => {
        navigate('/register');
      });
    }

  } catch (error) {
    console.error("Error al cargar el usuario:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar la información del usuario.',
      confirmButtonText: 'Aceptar'
    });
  }
};


  const handleLogout = async () => {
    const result = await Swal.fire({ title: '¿Cerrar sesión?', showCancelButton: true });
    if (result.isConfirmed) {
      await auth.signOut();
      navigate('/');
      window.location.reload(); // Recargar para limpiar estado
      Swal.fire('Sesión cerrada', '', 'success');
    }
  };

const handleConfirmarContrasena = async () => {
  const { value: password } = await Swal.fire({
    title: 'Confirma tu contraseña',
    input: 'password',
    inputPlaceholder: 'Ingresa tu contraseña actual',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'custom-swal-popup'
    }
  });

  if (password) {
    try {
      const user = auth.currentUser;
      // Verificar contraseña comparando con la almacenada
      const users = JSON.parse(localStorage.getItem('marketplace_users') || '[]');
      const userData = users.find(u => u.uid === user.uid);
      
      if (!userData || userData.password !== password) {
        Swal.fire('Error', 'Contraseña incorrecta', 'error');
        return;
      }
      
      setMostrarModalEditarInfo(true);
    } catch (error) {
      Swal.fire('Error', 'Contraseña incorrecta', 'error');
    }
  }
};


const handleEditarInfo = async () => {
  if (!usuarioInfo) return;

  try {
    const docRef = doc(db, 'usuarios', usuarioInfo.id);
    const dataToUpdate = {};

    // Comunes
    if (formInfo.telefono) dataToUpdate.telefono = formInfo.telefono;
    if (formInfo.ciudad) dataToUpdate.ciudad = formInfo.ciudad;
    if (formInfo.provincia) dataToUpdate.provincia = formInfo.provincia;

    if (usuarioInfo.tipo === 'tienda') {
      if (formInfo.nombreTienda) dataToUpdate.nombreTienda = formInfo.nombreTienda;
      if (formInfo.nombreResp) dataToUpdate.nombreResp = formInfo.nombreResp;
      if (formInfo.apellidoResp) dataToUpdate.apellidoResp = formInfo.apellidoResp;
      if (formInfo.direccion) dataToUpdate.direccion = formInfo.direccion;
      if (formInfo.logoUrl) dataToUpdate.logoUrl = formInfo.logoUrl;
    } else {
      if (formInfo.nombre) dataToUpdate.nombre = formInfo.nombre;
      if (formInfo.apellido) dataToUpdate.apellido = formInfo.apellido;
    }

    await updateDoc(docRef, dataToUpdate);

    if (formInfo.nuevaPassword) {
      const user = auth.currentUser;
      await updatePassword(user, formInfo.nuevaPassword);
    }

Swal.fire({
  title: 'Información actualizada',
  text: '',
  icon: 'success',
  customClass: {
    popup: 'custom-swal-popup-2'
  }
});    setMostrarModalEditarInfo(false);
    cargarInfoUsuario(usuarioInfo.id);
  } catch (error) {
Swal.fire({
  title: 'Error',
  text: error.message,
  icon: 'error',
  customClass: {
    popup: 'custom-swal-popup-2'
  }
});  }
};


  const handleEditarProducto = (producto) => {
    setProductoEnEdicion(producto);
    setMostrarModalEditarProducto(true);
  };

  const handleCerrarModalEditarProducto = () => {
    setProductoEnEdicion(null);
    setMostrarModalEditarProducto(false);
    fetchMisProductos();  // 🔥 Refrescar lista tras cerrar modal
  };

  const productosPublicados = productos.filter(p => p.estado !== 'pausado');
  const productosNoPublicados = productos.filter(p => p.estado === 'pausado');
  const productosLiquidacion = productos.filter(producto => producto.liquidacion === 1 || producto.liquidacion === "1");

  if (!puedeVerPerfil) return null;


const filtrarPorBusqueda = (lista) =>
  lista.filter(p => (p.titulo || '').toLowerCase().includes(busqueda.toLowerCase()));



const enviarRespuesta = async (idx, comentarioOriginal) => {
  if (!respuestaTexto.trim()) return;

  try {
    const comentarioRef = doc(db, 'usuarios', usuarioInfo.id, 'comentarios', comentarioOriginal.id);
    await updateDoc(comentarioRef, { respuesta: respuestaTexto });

    // Actualiza en UI local
    const nuevosComentarios = [...comentarios];
    nuevosComentarios[idx].respuesta = respuestaTexto;
    setComentarios(nuevosComentarios);

    setRespuestaActiva(null);
    setRespuestaTexto('');
    Swal.fire('Respuesta enviada', '', 'success');
  } catch (error) {
    console.error('Error al responder comentario:', error);
    Swal.fire('Error', 'No se pudo enviar la respuesta.', 'error');
  }
};

// Scroll hacia el componente al cargar
if (userRef.current) {
  const top = userRef.current.offsetTop;
  window.scrollTo({
    top: top,
    behavior: 'smooth'
  });
}

  const isMobile = window.innerWidth <= 768;
  return (
    <>
    <nav style={navbarStyle} ref={userRef}>
<h2 style={{ color: '#FF6D00',  fontWeight: 'bold' }}>
  {window.innerWidth <= 768
    ? 'Bienvenido'
    : `> Bienvenido ${
        usuarioInfo
          ? usuarioInfo.tipo === 'tienda'
            ? `a tu tienda ${usuarioInfo.nombreResp || ''} ${usuarioInfo.apellidoResp || ''}`
            : `${usuarioInfo.nombre || ''} ${usuarioInfo.apellido || ''}`
          : 'Cargando Informacion...'
      }`}
</h2>

          <button className="logout-btn" onClick={handleLogout}>🚪 Cerrar Sesión</button>
          
</nav>

 {window.innerWidth >= 768 && (
      <div style={buttonContainerStyle}>
        {usuarioInfo?.tipo === 'tienda' && (
          <button className="nav-btn" onClick={() => setMostrarSeccion('home')}>
            🏠 Home
          </button>
        )}
        <button className="vender-btn" onClick={() => setMostrarSeccion('nuevaPublicacion')}>🛒 VENDER</button>
        <button className="nav-btn" onClick={() => setMostrarSeccion('productos')}>📦 Productos</button>
        {usuarioInfo?.tipo === 'tienda' && (

    <button className="nav-btn facebook" onClick={() => setMostrarSeccion('comentarios')}>🗨️ Comentarios</button>
        )}
<button className="nav-btn btn-puntos" onClick={() => setMostrarSeccion('mispuntos')}>
  🪙 Mis Puntos
</button>

<button className="nav-btn btn-recarga" onClick={() => setMostrarSeccion('recarga')}>
  💲 Recarga
</button>
        
      </div>
)}
      {window.innerWidth <= 768 && (
  <div className="mobile-nav-container">
            {usuarioInfo?.tipo === 'tienda' && (

        <button className="nav-btn" onClick={() => setMostrarSeccion('home')}>🏠 Home</button>
            )}
        <button className="vender-btn" onClick={() => setMostrarSeccion('nuevaPublicacion')}>🛒 VENDER</button>
        <button className="nav-btn" onClick={() => setMostrarSeccion('productos')}>📦 Productos</button>
        {usuarioInfo?.tipo === 'tienda' && (

    <button className="nav-btn facebook" onClick={() => setMostrarSeccion('comentarios')}>🗨️ Comentarios</button>
        )}
<button className="nav-btn btn-puntos" onClick={() => setMostrarSeccion('mispuntos')}>
  🪙 Mis Puntos
</button>

<button className="nav-btn btn-recarga" onClick={() => setMostrarSeccion('recarga')}>
  💲 Recarga
</button>
  </div>
)}
<div className='PerfilUsuarioTotal'>
      {isMobile && (
        <button
          onClick={() => setMostrarInfo(!mostrarInfo)}
          style={{
            margin: '10px auto',
            display: 'block',
            padding: '10px 20px',
            backgroundColor: '#ff6d00',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          Mi Información {mostrarInfo ? '▴' : '▾'}
        </button>
      )}

      {(!isMobile || mostrarInfo) && (
        <aside className='asidePerfilUsuario'>
          {usuarioInfo ? (
            <div style={{ padding: '15px' }}>
              {usuarioInfo.tipo === 'tienda' ? (
                <>
                  {usuarioInfo.logoUrl && (
                    <div>
                      <img src={usuarioInfo.logoUrl} alt="Logo" style={{ width: 250, height: 'auto' }} />
                    </div>
                  )}
                  <EmblemasTienda tienda={usuarioInfo} />
                  <p><strong>🏬 Nombre Tienda:</strong> {usuarioInfo.nombreTienda}</p>
                  <p><strong>📛 Razón Social:</strong> {usuarioInfo.razonSocial}</p>
                  <p><strong>👤 Nombre Responsable:</strong> {usuarioInfo.nombreResp}</p>
                  <p><strong>👤 Apellido Responsable:</strong> {usuarioInfo.apellidoResp}</p>
                  <p><strong>📧 Email:</strong> {usuarioInfo.email}</p>
                  <p><strong>📍 Ciudad:</strong> {usuarioInfo.ciudad}</p>
                  <p><strong>🗺️ Provincia:</strong> {usuarioInfo.provincia}</p>
                  <p><strong>📞 Teléfono:</strong> {usuarioInfo.telefono}</p>
                  <p><strong>🧾 CUIT:</strong> {usuarioInfo.cuit}</p>
                  <p><strong>🏠 Dirección:</strong> {usuarioInfo.direccion}</p>
                </>
              ) : (
                <>
                  <h2>Mi Perfil</h2>
                  <p><strong>👤 Nombre:</strong> {usuarioInfo.nombre}</p>
                  <p><strong>👤 Apellido:</strong> {usuarioInfo.apellido}</p>
                  <p><strong>📧 Email:</strong> {usuarioInfo.email}</p>
                  <p><strong>📍 Ciudad:</strong> {usuarioInfo.ciudad}</p>
                  <p><strong>🗺️ Provincia:</strong> {usuarioInfo.provincia}</p>
                  <p><strong>📞 Teléfono:</strong> {usuarioInfo.telefono}</p>
                </>
              )}
              <button
                className="nav-btn"
                style={{ marginTop: '10px' }}
                onClick={handleConfirmarContrasena}
              >
                ✏️ Editar
              </button>

              
            </div>
          ) : (
            <p>Cargando información...</p>
          )}
        </aside>
      )}
    <div className='panelPerfilUsuario'>



      <div style={contentStyle}>
        
        {mostrarSeccion === 'recarga' && (
            <>
            <Recargar />
            </>

        )}
       
{mostrarSeccion === 'comentarios' && (
  <div className="comentarios-tienda">
    <div className="header-tienda-comentarios">
      <h3>Tu Calificación</h3>
          <div style={{ fontSize: '4em', color: '#f7d000' }}>
      {'★'.repeat(Math.round(promedioEstrellas))}{'☆'.repeat(5 - Math.round(promedioEstrellas))}
    </div>
    <p style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>
      Promedio: {promedioEstrellas.toFixed(1)} / 5
    </p>
    </div>



    <h4>Comentarios</h4>
    {comentarios.length ? (
      comentarios.map((c, idx) => (
        <div key={idx} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
          <div style={{ color: '#f7d000', display:'flex', justifyContent:'space-between' }}>
            {'★'.repeat(c.calificacion)}{'☆'.repeat(5 - c.calificacion)}


<Reportar
  tipo="comentario"
  idElemento={`${c.usuario}`} // Combina ID del comentario con el UID
  descripcionElemento={c.comentario}
  uid={c.id}
/>
          </div>
          <p>{c.comentario}</p>
          <small>{c.fecha ? (typeof c.fecha === 'string' ? new Date(c.fecha).toLocaleDateString() : new Date(c.fecha.seconds * 1000).toLocaleDateString()) : ''}</small>
          <p>Por: <span style={{fontWeight: 'bold'}}>{c.usuario}</span></p>

          {/* Respuesta */}
          {c.respuesta && (
            <div style={{ marginTop: '10px', background: '#f8f8f8', padding: '8px', borderRadius: '6px' }}>
              <a
                href={`/tienda/${usuarioInfo?.id}`} // link a tienda del dueño
                style={{ fontWeight: 'bold', textDecoration: 'underline', color: '#007bff' }}
              >
                {usuarioInfo?.nombreTienda || usuarioInfo?.nombre}
              </a>
              <div style={{ display:'flex', justifyContent:'space-between'}}>
                <p style={{ margin: '4px 0 0 0' }}>{c.respuesta}</p>                       
                <a className="btn-social facebook" href="#">Editar </a>
              </div>
            </div>
          )}

          {/* Mostrar textarea para responder */}
          {respuestaActiva === idx ? (
            <>
              <textarea
                value={respuestaTexto}
                onChange={(e) => setRespuestaTexto(e.target.value)}
                rows={2}
                placeholder="Escribí tu respuesta..."
                style={{ width: '100%', marginTop: '10px' }}
              />
              <button
                className="btn-social facebook"
                style={{ marginTop: '5px' }}
                onClick={() => enviarRespuesta(idx, c)}
              >
                Enviar
              </button>
            </>
          ) : (
            !c.respuesta && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setRespuestaActiva(idx);
              }}
              style={{ marginTop: '10px', marginLeft: '20px' }}
            >
              Responder
            </a>
            )
          )}

        </div>
      ))
    ) : (
      <p>Aún no hay comentarios.</p>
    )}
  </div>
)}

{mostrarSeccion === 'home' && (
            <>
              <AtajosDeUsuario Tienda={usuarioInfo} comentarios={comentarios} 
              />
          </>
)}


{mostrarSeccion === 'mispuntos' && (
            <DashboardPuntos onActualizar={() => setRecargarUsuarioInfo(prev => !prev)} />

)}

{mostrarSeccion === 'productos' && (
  <>

        {window.innerWidth <= 768 && (
          <>
        <div className="mobile-nav-container-prods">
                <button className="nav-btn" onClick={() => setMostrarSeccionProductos('productos')}>🧾 Todos</button>
                <button className="nav-btn" onClick={() => setMostrarSeccionProductos('publicados')}>🟢 Publicados</button>
        </div>
        <div className="mobile-nav-container-prods">

        <button className="nav-btn" onClick={() => setMostrarSeccionProductos('noPublicados')}>🟠 Pausados</button>
        <button className="nav-btn"  onClick={() => setMostrarSeccionProductos('liquidacion')}>🔥 Liquidando</button>
        </div>
        </>
)}


        {window.innerWidth >= 768 && (
  <div className="headerProds">
                <button className="nav-btn" onClick={() => setMostrarSeccionProductos('productos')}>🧾 Todos</button>

                <button className="nav-btn" onClick={() => setMostrarSeccionProductos('publicados')}>🟢 Publicados</button>
        <button className="nav-btn" onClick={() => setMostrarSeccionProductos('noPublicados')}>🟠 En Pausa</button>
                                    <button
        
      className="btn-hotsale"
      onClick={() => setMostrarSeccionProductos('liquidacion')}
    >
      🔥 LIQUIDANDO
    </button>
  </div>
)}

 

          {mostrarSeccionProductos === 'productos' && (
          <>
          <div style={divGridStyleHome}>
            <div style={{ width: '100%', maxWidth: '1200px' }}>

            <div className="prodsPubliHome">
                          <h2>{window.innerWidth <= 768 ? 'Todos' : 'Todos los Productos'}</h2>

      <input
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="productos-busqueda"
      />
    </div>
              <div className="productos-grid-responsive">
                  {filtrarPorBusqueda(productos).length ? (
    filtrarPorBusqueda(productos).map(p => (
                  <ProductCard
                    key={p.id}
                    producto={p}
                    enPerfil
                    onEditar={handleEditarProducto}
                    onActualizarProductos={fetchMisProductos}
                  />
                ))) : <p>No se encontraron productos.</p>}
              </div>
            </div>
          </div>
          </>
        )}

        {mostrarSeccionProductos === 'publicados' && (
          <>
            <div className="prodsPubliHome">
                          <h2>{window.innerWidth <= 768 ? 'Publicados' : 'Productos Publicados'}</h2>

      <input
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="productos-busqueda"
      />
    </div>            <div className="productos-grid-responsive">
                {filtrarPorBusqueda(productosPublicados).length ? (
    filtrarPorBusqueda(productosPublicados).map(p => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  enPerfil
                  onEditar={handleEditarProducto}
                  onActualizarProductos={fetchMisProductos}
                />
              ))) : <p>No tienes productos publicados.</p>}
            </div>
          </>
        )}
        {mostrarSeccionProductos === 'noPublicados' && (
          <>
            <div className="prodsPubliHome">
                          <h2>{window.innerWidth <= 768 ? 'Pausados' : 'Productos Pausados'}</h2>

      <input
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="productos-busqueda"
      />
    </div>            <div className="productos-grid-responsive">
                {filtrarPorBusqueda(productosNoPublicados).length ? (
    filtrarPorBusqueda(productosNoPublicados).map(p => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  enPerfil
                  onEditar={handleEditarProducto}
                  onActualizarProductos={fetchMisProductos}
                />
              ))) : <p>No tienes productos en pausa.</p>}
            </div>
          </>
        )}

{mostrarSeccionProductos === 'liquidacion' && (
            <>
            <div className="prodsPubliHome">
                          <h2>{window.innerWidth <= 768 ? 'En Liquidacion' : 'Productos en Liquidacion'}</h2>

      <input
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="productos-busqueda"
      />
    </div>            <div className="productos-grid-responsive">
                {filtrarPorBusqueda(productosLiquidacion).length ? (
    filtrarPorBusqueda(productosLiquidacion).map(p => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  enPerfil
                  onEditar={handleEditarProducto}
                  onActualizarProductos={fetchMisProductos}
                />
              ))) : <p>No tienes productos en pausa.</p>}
            </div>
          </>
)}

  </>
  )}
        {mostrarSeccion === 'nuevaPublicacion' && (
          <PublicarProducto tipo={usuarioInfo?.tipo} onActualizarExito={fetchMisProductos} />
        )}



      </div>

{mostrarModalEditarProducto && (
  <div className="modal-overlay">
    <div className="modal-content-publicar">
      <PublicarProducto
        productoEditar={productoEnEdicion}
        modoEdicion={true}
        onActualizarExito={handleCerrarModalEditarProducto}
        puedeForzarPublicar={true}
      />
      <button className="logout-btn" onClick={handleCerrarModalEditarProducto}>
        Cancelar
      </button>
    </div>
  </div>
)}

            {/* Modal para Editar Información */}
{mostrarModalEditarInfo && (
  <div className="modal-overlayx ">
    <div className="modal-contentx modal-contentx-mobile">
      <h2>Editar Mi Información</h2>

      {/* 🔥 Si es tienda */}
      {usuarioInfo?.tipo === 'tienda' ? (
        <>
          <input type="text" placeholder="Nombre Tienda" value={formInfo.nombreTienda} onChange={e => setFormInfo({ ...formInfo, nombreTienda: e.target.value })} />
                    {['logoUrl'].map(field => (
<div key={field} style={{ marginTop: '20px', textAlign: 'center' }}>
  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
    {field === 'logoUrl' ? 'Logo' : null}:
  </label>

  {formInfo[field] && (
    <img
      src={formInfo[field]}
      alt={field}
      style={{
        width: '200px',
        height: 'auto',
        margin: '0 auto 10px auto',
        display: 'block'
      }}
    />
  )}

  <button
    className="nav-btn"
    style={{ marginBottom: '10px' }}
    onClick={() => document.getElementById(`fileInput-${field}`).click()}
  >
    Cambiar Imagen
  </button>

  <input
    id={`fileInput-${field}`}
    type="file"
    style={{ display: 'none' }}
    accept="image/*"
    onChange={e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormInfo(prev => ({ ...prev, [field]: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }}
  />
</div>

          ))}
          <input type="text" placeholder="Nombre Responsable" value={formInfo.nombreResp} onChange={e => setFormInfo({ ...formInfo, nombreResp: e.target.value })} />
          <input type="text" placeholder="Apellido Responsable" value={formInfo.apellidoResp} onChange={e => setFormInfo({ ...formInfo, apellidoResp: e.target.value })} />
          <input type="text" placeholder="Dirección" value={formInfo.direccion} onChange={e => setFormInfo({ ...formInfo, direccion: e.target.value })} />


        </>
      ) : (
        <>
          <input type="text" placeholder="Nombre" value={formInfo.nombre} onChange={e => setFormInfo({ ...formInfo, nombre: e.target.value })} />
          <input type="text" placeholder="Apellido" value={formInfo.apellido} onChange={e => setFormInfo({ ...formInfo, apellido: e.target.value })} />
        </>
      )}
            {/* Campos comunes */}
      <input type="text" placeholder="Ciudad" value={formInfo.ciudad} onChange={e => setFormInfo({ ...formInfo, ciudad: e.target.value })} />
      <select value={formInfo.provincia} onChange={e => setFormInfo({ ...formInfo, provincia: e.target.value })}>
        <option value="">Seleccionar provincia</option>
        {provincias.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <input type="text" placeholder="Teléfono" value={formInfo.telefono} onChange={e => setFormInfo({ ...formInfo, telefono: e.target.value })} />

      <input type="password" placeholder="Nueva contraseña" value={formInfo.nuevaPassword} onChange={e => setFormInfo({ ...formInfo, nuevaPassword: e.target.value })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <button className="nav-btn" onClick={handleEditarInfo}>Guardar Cambios</button>
        <button className="logout-btn" onClick={() => setMostrarModalEditarInfo(false)}>Cancelar</button>
      </div>
    </div>
  </div>
)}
  </div>
</div>
    
    </>
  );
};

const navbarStyle = { display: 'flex', alignItems: 'center',justifyContent: 'space-between', backgroundColor: '#FFFFF', padding: '10px 20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const buttonContainerStyle = { display: 'flex', justifyContent: 'center', gap: '10px', paddingTop: '20px', flexWrap: 'wrap', backgroundColor: '#f9f9f9' };
const contentStyle = { padding: '10px', width: '100%', margin: 'auto' };
const divGridStyleHome = { display: 'flex',width: '100%', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px'};
const infoBoxStyle = { textAlign: 'center',backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', maxWidth: '600px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', margin: 'auto' };

export default PerfilUsuario;


