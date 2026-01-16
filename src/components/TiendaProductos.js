import React, { useEffect, useState,useRef  } from 'react';
import { useParams } from 'react-router-dom';
import { auth,db, collection, getDocs, query, where, doc, getDoc, storage, storageRef, getDownloadURL, addDoc, updateDoc } from '../firebaseConfig';
import ProductCard from './ProductCard';
import './TiendaProductos.css';
import Swal from 'sweetalert2';
import AllProductsTienda from './AllProductsTienda'
import { sumarPuntos } from './Herramientas/sumarPuntos';
import Reportar from './Herramientas/Reportar';
import { useNavigate } from 'react-router-dom';

import RedesSociales from './Herramientas/RedesSociales';

const TiendaProductos = () => {

  const navigate = useNavigate();

const tiendaRef = useRef(null);

  const comentsRef = useRef(null);
  const prodsRef = useRef(null);

  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [tienda, setTienda] = useState(null);
  const [logoUrl, setLogoUrl] = useState('https://dummyimage.com/250x250/cccccc/ffffff&text=Sin+logo');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(100);
  const [rangoPrecio, setRangoPrecio] = useState([0, 100]);
const [busqueda, setBusqueda] = useState('');
  const [bannerUrl, setBannerUrl] = useState('https://dummyimage.com/1000x150/cccccc/ffffff&text=Sin+Banner');


const [mostrarComentarios, setMostrarComentarios] = useState(false);
const [mostrarProductos, setMostrarProductos] = useState(true);

const [comentarios, setComentarios] = useState([]);
const [nuevoComentario, setNuevoComentario] = useState('');
const [calificacion, setCalificacion] = useState(0);

const [promedioEstrellas, setPromedioEstrellas] = useState(0);
const [fullUidForRedes, setFullUidForRedes] = useState('');


  useEffect(() => {
const fetchProductosYDatosTienda = async () => {
  try {
    // 1. Productos
    const productosRef = collection(db, 'productos');

    const fullId = id;

    const idx = fullId.substring(fullId.lastIndexOf('-') + 1);
    setFullUidForRedes(idx)
    const q = query(productosRef, where('vendedorID', '==', idx));
    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(p => p.estado !== 'pausado');
    setProductos(lista.reverse());

    const cats = [...new Set(lista.map(p => p.categoria || 'Sin categoría'))];
    setCategorias(cats);

    if (lista.length > 0) {
      const precios = lista.map(p => p.precio);
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      setPrecioMin(min);
      setPrecioMax(max);
      setRangoPrecio([min, max]);
    }

    // 2. Datos de tienda
    const tiendaDoc = await getDoc(doc(db, 'usuarios', id));
    if (tiendaDoc.exists()) {

        const dataTienda = tiendaDoc.data();
      setTienda(dataTienda);

      // 🔸 Incrementar visitas
      const visitasActuales = dataTienda.visitas || 0;
      await updateDoc(doc(db, 'usuarios', id), {
        visitas: visitasActuales + 1
      });

      try {
        const logoRef = storageRef(storage, `usuarios/${id}/logo`);
        const url = await getDownloadURL(logoRef);
        setLogoUrl(url);
        const bannerRef = storageRef(storage, `usuarios/${id}/banner`);
        const urlb = await getDownloadURL(bannerRef);
        setBannerUrl(urlb);
      } catch (error) {
        console.warn('No se pudo obtener el logo desde storage:', error);
      }

      setTienda(tiendaDoc.data());
      try {
        const logoRef = storageRef(storage, `usuarios/${id}/logo`);
        const url = await getDownloadURL(logoRef);
        setLogoUrl(url);
        const bannerRef = storageRef(storage, `usuarios/${id}/banner`);
        const urlb = await getDownloadURL(bannerRef);
        setBannerUrl(urlb);
      } catch (error) {
        console.warn('No se pudo obtener el logo desde storage:', error);
      }
    }

    // 3. Comentarios de la tienda
    const comentariosRef = collection(db, 'usuarios', id, 'comentarios');
    const comentariosSnap = await getDocs(comentariosRef);
    const listaComentarios = comentariosSnap.docs.map(doc => doc.data());
    setComentarios(listaComentarios);

    if (listaComentarios.length > 0) {
      const suma = listaComentarios.reduce((acc, c) => acc + (c.calificacion || 0), 0);
      const promedio = suma / listaComentarios.length;
      setPromedioEstrellas(promedio);
    } else {
      setPromedioEstrellas(0);
    }

  } catch (error) {
    console.error('Error al cargar productos y tienda:', error);
  }
};


    fetchProductosYDatosTienda();
  }, [id]);

const productosFiltrados = productos.filter(
  p =>
    (categoriaSeleccionada === 'Todos' || p.categoria === categoriaSeleccionada) &&
    p.precio >= rangoPrecio[0] && p.precio <= rangoPrecio[1] &&
    (p.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
     p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
     p.categoria?.toLowerCase().includes(busqueda.toLowerCase()))
);

  const nombreTienda = tienda?.nombreTienda || 'Nombre de la Tienda';
  const direccion = tienda?.direccion || 'Dirección no disponible';
  const ciudad = tienda?.ciudad || 'Ciudad no disponible';
  const provincia = tienda?.provincia || 'Provincia no disponible';
  const telefono = tienda?.telefono || '';
  const instagram = tienda?.instagram || '';
  const facebook = tienda?.facebook || '';
  const web = tienda?.web || '';
  const tiendaId = tienda?.id || '';
  const tiendaUid = tienda?.uid || '';

  

const whatsappLink = telefono
  ? `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
      'Hola! Vi tu tienda '+ nombreTienda +' en Cotiendas.com y quería comunicarme con ustedes.'
    )}`
  : '#';  const instaLink = instagram ? `https://instagram.com/${instagram}` : '#';
  const faceLink = facebook ? `https://facebook.com/${facebook}` : '#';
  const webLink = web ? `https://${web}` : '#';

const handleLink = async () => {
  try {
    const url = window.location.href; // obtiene la URL actual
    const textoCopiado = `Visitá ${nombreTienda} en Cotiendas.\nLink a la página: ${url}`;

    await navigator.clipboard.writeText(textoCopiado);

    Swal.fire({
      icon: 'success',
      title: '¡Link copiado!',
      text: 'Link copiado en portapapeles 📋',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error al copiar:", error);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'No se pudo copiar el link.',
    });
  }
};


const fetchComentarios = async () => {
  try {
    const comentariosRef = collection(db, 'usuarios', id, 'comentarios');
    const snapshot = await getDocs(comentariosRef);
    const lista = snapshot.docs.map(doc => doc.data());
    setComentarios(lista);
  } catch (error) {
    console.error('Error al cargar comentarios:', error);
  }
};


const agregarComentario = async () => {
  const user = auth.currentUser;

  if (!user || user.isAnonymous) {
    Swal.fire('Debes iniciar sesión para comentar.', '', 'warning').then(() => {
      navigate('/login');
    });
    return;
  }

  if (!nuevoComentario || calificacion === 0) {
    Swal.fire('Completa todos los campos', '', 'warning');
    return;
  }

  try {
    const comentariosRef = collection(db, 'usuarios', id, 'comentarios');
    // Paso 1: Crear el comentario
    const docRef = await addDoc(comentariosRef, {
      usuario: user.displayName,
      comentario: nuevoComentario,
      calificacion,
      fecha: new Date(),
      uid: user.uid
    });

    // Paso 2: Guardar el ID del documento dentro del mismo documento
    await updateDoc(docRef, {
      id: docRef.id
    });

    await sumarPuntos(user.uid, "calificar");

    setNuevoComentario('');
    setCalificacion(0);
    fetchComentarios();
    Swal.fire('Gracias por tu opinión!', '', 'success');
  } catch (error) {
    console.error('Error al guardar el comentario:', error);
    Swal.fire('Error', 'No se pudo guardar el comentario.', 'error');
  }
};


// Scroll hacia el componente al cargar
if (tiendaRef.current) {
  const top = tiendaRef.current.offsetTop;
  window.scrollTo({
    top: top,
    behavior: 'smooth'
  });
}

if (window.innerWidth <= 768 && comentsRef.current) {
  const top = comentsRef.current.offsetTop;
  window.scrollTo({
    top,
    behavior: 'smooth'
  });
}

if (window.innerWidth <= 768 && prodsRef.current) {
  const top = prodsRef.current.offsetTop;
  window.scrollTo({
    top,
    behavior: 'smooth'
  });
}


const compartirTiendaRed = async (plataforma) => {
  const tiendaIdFinal = id; // `id` viene del useParams()
  const linkCompartir = `https://us-central1-marketplace-6dc50.cloudfunctions.net/shareTienda?id=${tiendaIdFinal}`;

  let urlFinal = '';

  if (plataforma === 'facebook') {
    urlFinal = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkCompartir)}`;
  } else if (plataforma === 'x') {
    const mensaje = `Visitá la tienda ${nombreTienda} en Cotiendas:`;
    urlFinal = `https://twitter.com/intent/tweet?text=${encodeURIComponent(mensaje)}&url=${encodeURIComponent(linkCompartir)}`;
  }

  // Abrir ventana de compartir
  window.open(urlFinal, '_blank', 'width=600,height=400');

  setTimeout(async () => {
    if (auth.currentUser) {
      // Acreditar puntos
      await acreditarPuntosPorCompartir(plataforma, 'tienda', nombreTienda);

      // Sumar contador de vecesCompartida
      try {
        const user = auth.currentUser;
        const usuariosRef = collection(db, "usuarios");
        const q = query(usuariosRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docUser = querySnapshot.docs[0];
          const ref = doc(db, "usuarios", docUser.id);
          const data = docUser.data();
          const veces = data.vecesCompartida || 0;

          await updateDoc(ref, { vecesCompartida: veces + 1 });
        }
      } catch (error) {
        console.error("Error al actualizar vecesCompartida:", error);
      }

    } else {
      Swal.fire('Gracias por compartir!', '', 'success');
    }
  }, 1000);
};



const acreditarPuntosPorCompartir = async (redSocial = 'facebook', tipo = 'tienda', nombre = '') => {
  const user = auth.currentUser;

  if (!user) {
    Swal.fire({
      icon: 'success',
      title: '¡Gracias por compartir!',
      html: `<strong>Estás ayudando a difundir esta ${tipo === 'producto' ? 'publicación' : 'tienda'}.</strong>`,
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  try {
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("Usuario no encontrado.");
      return;
    }

    const docUser = querySnapshot.docs[0];
    const ref = doc(db, "usuarios", docUser.id);
    const data = docUser.data();

    const puntosActuales = data.puntos || 0;
    const historialActual = data.historialPuntos || [];

    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const motivo = `10 puntos por compartir en ${redSocial} la ${tipo} ${nombre}`;

    const compartidasHoy = historialActual.filter(
      h => h.motivo === motivo && h.fecha.slice(0, 10) === hoy
    ).length;

    if (compartidasHoy >= 2) {
      Swal.fire({
        icon: 'info',
        title: '¡Gracias por compartir!',
        html: `Ya ganaste los puntos por compartir esta ${tipo} en ${redSocial} hoy.`,
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const nuevoHistorial = [
      ...historialActual,
      {
        puntos: 10,
        motivo,
        fecha: new Date().toISOString()
      }
    ];

    await updateDoc(ref, {
      puntos: puntosActuales + 10,
      historialPuntos: nuevoHistorial
    });

    Swal.fire({
      icon: 'success',
      title: '¡Gracias por compartir!',
      html: `<strong>Ganaste 10 puntos por compartir en ${redSocial}</strong>`,
      confirmButtonText: 'Aceptar'
    });

  } catch (error) {
    console.error("Error al acreditar puntos por compartir:", error);
    Swal.fire("Error", "No se pudo acreditar el puntaje.", "error");
  }
};






  return (
    <div className="tienda-container" ref={tiendaRef}>
      <aside className="sidebar-tienda">
        <img src={logoUrl} alt={nombreTienda} className="logo-tienda" onClick={() => window.location.reload()}/>
        <h3>{nombreTienda}</h3>

<div style={{
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  {/* Emblemas de Tienda */}
  {tienda?.verificada && (
    <div style={{
      backgroundColor: '#4caf50',
      color: 'white',
      padding: '4px 8px',
      fontWeight: 'bold',
      fontSize: '12px',
      borderRadius: '6px',
      marginTop: '5px',
      width: '200px',
      textAlign: 'center' // 🔹 centrado del texto dentro del badge
    }}>
      ✅ Tienda Verificada
    </div>
  )}

  {tienda?.esPremium && (
    <div style={{
      backgroundColor: '#ffd700',
      color: '#000',
      padding: '4px 8px',
      fontWeight: 'bold',
      fontSize: '12px',
      borderRadius: '6px',
      marginTop: '10px',
      width: '200px',
      textAlign: 'center' // 🔹 centrado del texto dentro del badge
    }}>
      ⭐ PREMIUM
    </div>
  )}
</div>



        <div style={{ margin: '5px 0', textAlign: 'center' }}>
  <div style={{ fontSize: '40px', color: '#f7d000' }}>
    {'★'.repeat(Math.round(promedioEstrellas))}{'☆'.repeat(5 - Math.round(promedioEstrellas))}
  </div>
  <p style={{ fontSize: '14px', margin: 0 }}>
    Promedio: {promedioEstrellas.toFixed(1)} / 5
  </p>

    
  <a onClick={(e) => { e.preventDefault();
  setMostrarComentarios(true);
    setMostrarProductos(false);

}} style={{ fontSize: '13px', color: '#777', marginTop: '2px', textDecoration: 'underline' }} href="#">
  ({comentarios.length} Comentario{comentarios.length !== 1 ? 's' : ''}) - Calificanos ! 
</a>



</div>
        <p>{direccion}</p>
        <p>{ciudad}, {provincia}</p>
                <p>Nos dedicamos a la venta y distribucion de Instalaciones Sanitarias.</p>

        <div className="botones-sociales">


<RedesSociales
  uid = {fullUidForRedes}
  telefono={telefono}
  whatsappLink={whatsappLink}
  instaLink={instaLink}
  faceLink={faceLink}
  webLink={webLink}
  tiendaName={nombreTienda}
/>

          <a   onClick={(e) => {
    e.preventDefault();
    handleLink();
  }} className="btn-social facebook" href="#">
            Link de la Tienda 🔗
          </a>

                      <div style={{ marginTop: '10px', textAlign: 'center' }}>
  <p style={{ fontWeight: 'bold' }}>Compartir esta Tienda:</p>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
    {/* Facebook */}
    <a
      href="#"
        onClick={(e) => {
    e.preventDefault(); compartirTiendaRed('facebook')}}
      target="_blank"
      rel="noopener noreferrer"
      title="Compartir en Facebook"
    >
      <i className="fab fa-facebook" style={{ fontSize: '24px', color: '#4267B2' }}></i>
    </a>

    {/* X (Twitter) */}
    <a
      href="#"
        onClick={(e) => {
    e.preventDefault(); compartirTiendaRed('x')}}
      target="_blank"
      rel="noopener noreferrer"
      title="Compartir en X"
    >
      <i className="fab fa-twitter" style={{ fontSize: '24px', color: '#1DA1F2' }}></i>
    </a>

  </div>
</div>
          
          <Reportar tipo="tienda" idElemento={tiendaId} descripcionElemento={tienda?.nombreTienda} uid={tiendaUid} />


        </div>
      </aside>

      <main className="main-tienda">
<div className="banner-tienda">
  <img src={bannerUrl || "/banner-tienda.png"} alt="banner-tienda" />
</div>
{mostrarComentarios ? (
  <div className="comentarios-tienda" ref={comentsRef}>
    <div className="header-tienda-comentarios">
    <h3>Calificá esta tienda</h3>

                <a   onClick={(e) => {
    e.preventDefault(); { setMostrarProductos(true);setMostrarComentarios(false);}}} href="#"   className="btn-social btn-orange">Volver a Productos ► </a>

    </div>
    <div className="estrellas">
      {[1, 2, 3, 4, 5].map(num => (
        <span
          key={num}
          onClick={() => setCalificacion(num)}
          style={{
            cursor: 'pointer',
            color: calificacion >= num ? '#f7d000' : '#ccc',
            fontSize: '24px'
          }}
        >★</span>
      ))}
    </div>

    <textarea
      placeholder="Dejá tu comentario"
      value={nuevoComentario}
      onChange={e => setNuevoComentario(e.target.value)}
      rows={3}
      style={{ width: '100%', marginTop: '10px' }}
    />

    <button onClick={agregarComentario} className="btn-social btn-orange" style={{ marginTop: '10px' }}>
      Enviar Comentario
    </button>

    <h4>Comentarios</h4>
    {comentarios.length ? (
comentarios.map((c, idx) => (
  <div key={idx} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
    <div style={{ color: '#f7d000', fontSize:'30px' }}>
      {'★'.repeat(c.calificacion)}{'☆'.repeat(5 - c.calificacion)}
    </div>
    <p>{c.comentario}</p>
    <p>Por: <span style={{fontWeight: 'bold'}}>{c.usuario}</span></p>
    <small>{c.fecha ? (typeof c.fecha === 'string' ? new Date(c.fecha).toLocaleDateString() : new Date(c.fecha.seconds * 1000).toLocaleDateString()) : ''}</small>

    {/* Mostrar respuesta si existe */}
    {c.respuesta && (
      <div style={{ marginTop: '10px', background: '#f8f8f8', padding: '8px', borderRadius: '6px' }}>
        <a
          href={`/tienda/${id}`} // ✅ link a la tienda actual
          style={{ fontWeight: 'bold', textDecoration: 'underline', color: '#ff6600' }}
        >
          Respuesta de la tienda
        </a>
        <p style={{ margin: '4px 0 0 0' }}>{c.respuesta}</p>
      </div>
    )}
  </div>
))
    ) : (
      <p>Aún no hay comentarios.</p>
    )}
  </div>
) : mostrarProductos ?(
    <>
              <div className="header-productos" ref={prodsRef}>
          <div className='header-left'>
              <h2>  {window.innerWidth <= 768 ? `Productos de ${nombreTienda}` : 'Productos'}
</h2>
          </div>
          <div className='header-center'>
              <input
    type="text"
    placeholder="Buscar productos..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    className="input-busqueda"
  />
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option>Todos</option>
            {categorias.map((cat, idx) => (
              <option key={idx}>{cat}</option>
            ))}
          </select>
          </div>

          <div className="filtro-precio">
            <span>Filtrar</span>
            <input
              type="range"
              min={precioMin}
              max={precioMax}
              value={rangoPrecio[1]}
              onChange={e => setRangoPrecio([precioMin, Number(e.target.value)])}
            />
            <span>${precioMin} - ${rangoPrecio[1]}</span>
          </div>
        </div>
          <div className="grid-productos">
    {productosFiltrados.length ? (
        <AllProductsTienda productos={productosFiltrados} />
    ) : (
      <p>No hay productos disponibles.</p>
    )}
  </div>
    </>

) : null }
      </main>
    </div>
  );
};

export default TiendaProductos;
