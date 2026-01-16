import React, { useEffect, useState, useRef } from 'react';
import { db, doc, getDoc, collection, query, where, getDocs, updateDoc, auth } from '../firebaseConfig';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import './ProductoDetalle.css'; // CSS adaptado al diseño
import Plantillax4Productos from './Herramientas/Plantillax4Productos'
import Reportar from './Herramientas/Reportar';

const ProductoDetalle = () => {

  const [comentarios, setComentarios] = useState([]);
const [promedioEstrellas, setPromedioEstrellas] = useState(0);
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [imagenPrincipal, setImagenPrincipal] = useState('');
  const [productosRelacionados, setProductosRelacionados] = useState([]);
const [mostrarComentarios, setMostrarComentarios] = useState(false);
const [masProductosDelVendedor, setMasProductosDelVendedor] = useState(false);
  const parentRefMProductos = useRef(null);
const [productosVendedor, setProductosVendedor] = useState([]);
const [tipoVendedor, setTipoVendedor] = useState('');


useEffect(() => {
  const fetchProductoYVendedor = async () => {
    try {
    const prodRef = doc(db, 'productos', id);
    const prodDoc = await getDoc(prodRef);

    if (prodDoc.exists()) {
      const prodData = prodDoc.data();

      // ✅ Incrementar visitas
      const visitasAnteriores = prodData.visitas || 0;
      await updateDoc(prodRef, {
        visitas: visitasAnteriores + 1
      });

      setProducto({ ...prodData, visitas: visitasAnteriores + 1 });
      setImagenPrincipal(prodData.imagenes?.[0] || 'https://via.placeholder.com/500');

          // Buscar el usuario por su uid (campo interno)
          let vendedorDoc = null;
          let vendedorDocId = null;

          const usuariosSnap = await getDocs(collection(db, 'usuarios'));
          usuariosSnap.forEach((docUser) => {
            const data = docUser.data();
            if (data.uid === prodData.vendedorID) {
              vendedorDoc = data;
              vendedorDocId = docUser.id;
            }
          });

          if (vendedorDoc) {
            setVendedor(vendedorDoc);
            
              if(vendedorDoc.tipo === 'tienda'){
                  setTipoVendedor(true);
              } else {
                  setTipoVendedor(false);
              }
  
           // 🔸 Cargar comentarios y promedio
          const comentariosRef = collection(db, 'usuarios', prodData.vendedorID, 'comentarios');
          const comentariosSnap = await getDocs(comentariosRef);
          const listaComentarios = comentariosSnap.docs.map(doc => doc.data());
          setComentarios(listaComentarios);

          if (listaComentarios.length > 0) {
            const suma = listaComentarios.reduce((acc, c) => acc + (c.calificacion || 0), 0);
            setPromedioEstrellas(suma / listaComentarios.length);
          } else {
            setPromedioEstrellas(0);
          }

          // ✅ Cargar productos del vendedor
          const productosRef = collection(db, 'productos');
          const q = query(productosRef, where('vendedorID', '==', prodData.vendedorID));
          const snapshot = await getDocs(q);
          const productosDelVendedor = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => p.estado !== 'pausado');
          setProductosVendedor(productosDelVendedor);

          } else {
            setVendedor({ nombre: 'Desconocido', apellido: '', ciudad: '', provincia: '', telefono: '' });
          }



        fetchProductosRelacionados(prodData.categoria, prodDoc.id);
      } else {
        Swal.fire('Error', 'Producto no encontrado.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al cargar el producto.', 'error');
    }
  };
  fetchProductoYVendedor();
}, [id]);

  const fetchProductosRelacionados = async (categoria, excludeId) => {
    if (!categoria) return;
    try {
      const productosRef = collection(db, 'productos');
      const q = query(productosRef, where('categoria', '==', categoria));
      const snapshot = await getDocs(q);
      const relacionados = snapshot.docs
        .filter(doc => doc.id !== excludeId && doc.data().estado !== 'pausado')
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setProductosRelacionados(relacionados);
    } catch (error) {
      console.error('Error al cargar productos relacionados:', error);
    }
  };


  if (!producto || !vendedor) return <p style={{ textAlign: 'center' }}>Cargando producto...</p>;

  const simboloMoneda = (producto.moneda === 'USD' || producto.moneda === 'U$D') ? 'U$D' : '$';
  const precio = parseFloat(producto.precio) || 0;
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(precio);

  
 const mostrarDatos = async () => {
  try {
    // 🔸 Sumamos interacción al producto
    const prodRef = doc(db, 'productos', producto.id);
    const snap = await getDoc(prodRef);

    if (snap.exists()) {
      const data = snap.data();
      const interacciones = data.interacciones || 0;
      await updateDoc(prodRef, {
        interacciones: interacciones + 1
      });
    }
  } catch (error) {
    console.error('Error al sumar interacción al producto:', error);
  }

  // 🔸 Mostramos la publicidad y datos del vendedor
  Swal.fire({
    title: 'Una Publicidad',
    html: `<p>Aquí puede ir una publicidad llamativa.</p>`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Ver Datos del Vendedor',
    cancelButtonText: 'Cerrar'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        html: `
          ${vendedor.tipo === 'tienda' && vendedor.logoUrl ? `<img src="${vendedor.logoUrl}" alt="Logo" style="width: 200px; height: auto; margin-bottom: 10px;" />` : ''}
          ${vendedor.tipo === 'particular' ? `<img src="/alabosta-logo.png" alt="Logo" style="width: 200px; height: auto; margin-bottom: 10px;" />` : ''}    
          ${vendedor.tipo === 'particular' ? `<p><strong>Nombre:</strong> ${vendedor.nombre} ${vendedor.apellido}</p>` : ''}
          <p><strong>Ciudad:</strong> ${vendedor.ciudad}</p>
          <p><strong>Provincia:</strong> ${vendedor.provincia}</p>
          <p><strong>Teléfono:</strong> ${vendedor.telefono}</p>
          <a href="https://wa.me/54${vendedor.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ! Vi tu producto "${producto.titulo}" en Cotiendas.com , quisiera hacerte una consulta.`)}"
             target="_blank" 
             style="display: inline-flex; align-items: center; margin-top: 10px; padding: 8px 16px; background-color: #25D366; color: white; border-radius: 5px; text-decoration: none; font-weight: bold;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="20" height="20" style="margin-right: 8px;">
              <path d="M20.52 3.48A11.89 11.89 0 0012 0C5.37 0 0 5.37 0 12a11.89 11.89 0 001.64 6L0 24l6.26-1.65A11.89 11.89 0 0012 24c6.63 0 12-5.37 12-12a11.89 11.89 0 00-3.48-8.52zM12 21.54a9.49 9.49 0 01-4.84-1.32l-.35-.21-3.72.99 1-3.63-.23-.37A9.47 9.47 0 1121.54 12 9.5 9.5 0 0112 21.54zm5.23-7.19c-.29-.15-1.7-.84-1.96-.94s-.45-.15-.63.15-.72.94-.88 1.13-.33.22-.62.07a7.79 7.79 0 01-2.29-1.42 8.7 8.7 0 01-1.62-2c-.17-.29 0-.45.13-.6.14-.14.29-.33.44-.49s.19-.26.29-.44a.53.53 0 000-.52c-.07-.15-.63-1.53-.87-2.1s-.46-.47-.63-.48H8a1 1 0 00-.73.34A2.88 2.88 0 006 9.39c0 1 .73 2 1.13 2.39s1.46 1.75 3.55 2.46a12.12 12.12 0 001.2.44c.5.16.95.14 1.31.08s.65-.29.9-.57l.41-.58c.24-.3.5-.32.76-.21s2 1 2.35 1.17.58.27.67.42.1.82-.2 1.42z"/>
            </svg>
            Chatear Ahora !
          </a>
        `,
        confirmButtonText: 'Cerrar'
      });
    }
  });
};




const compartirEnFacebook = async () => {
  if (!producto) return;

  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://us-central1-marketplace-6dc50.cloudfunctions.net/shareProducto?id=${producto.id}`)}`;
  setTimeout(() => {
    acreditarPuntosPorCompartir('facebook');
  }, 1000);
  
  window.open(shareUrl, '_blank', 'width=600,height=400');

};

const compartirEnX = async () => {
  if (!producto) return;

  const user = auth.currentUser;
  if (!user) return;

  const titulo = producto.titulo || "Producto sin título";
  const precio = parseFloat(producto.precio) || 0;

  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    minimumFractionDigits: 2
  }).format(precio);

  const mensaje = `¡Mirá este producto en Cotiendas!\n${titulo} - $${precioFormateado}`;
  const url = `${window.location.origin}/producto/${producto.id}?ref=${user.uid}`;

  const urlX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(mensaje)}&url=${encodeURIComponent(url)}`;

  window.open(urlX, '_blank', 'width=600,height=400');

  setTimeout(() => {
    acreditarPuntosPorCompartir('x');
  }, 1000);
};


const acreditarPuntosPorCompartir = async (redSocial = 'facebook') => {
  const user = auth.currentUser;

  if (!user) {
    Swal.fire({
      icon: 'success',
      title: '¡Gracias por compartir!',
      html: `<strong>Estás ayudando a difundir este producto.</strong>`,
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
    const data = docUser.data();
    const ref = doc(db, "usuarios", docUser.id);

    const puntosActuales = data.puntos || 0;
    const historialActual = data.historialPuntos || [];

    const hoy = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const motivoFiltro = `10 puntos por compartir en ${redSocial} el producto ${producto.titulo }`;

    const compartidasHoy = historialActual.filter(
      h => h.motivo === motivoFiltro && h.fecha.slice(0, 10) === hoy
    ).length;

    if (compartidasHoy >= 2) {
      Swal.fire({
        icon: 'info',
        title: '¡Gracias por compartir!',
        html: `<strong>Ya ganaste los puntos por compartir en ${redSocial} hoy.<br>Seguí compartiendo para llegar a más personas.</strong>`,
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const nuevoHistorial = [
      ...historialActual,
      {
        puntos: 10,
        motivo: motivoFiltro,
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
    <div className="producto-detalle-container">


      <div className="detalle-principal">

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <img src={imagenPrincipal} alt={producto.titulo} className="imagen-principal" />
            <div className="galeria-imagenes">
              {(producto.imagenes || []).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`img-${idx}`}
                  className={imagenPrincipal === img ? 'seleccionada' : ''}
                  onClick={() => setImagenPrincipal(img)}
                />
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}> 
                    <h2 className="titulo-producto">{producto.titulo}</h2>

        <Reportar tipo="producto" idElemento={producto.id} descripcionElemento={producto.titulo} uid={producto.id} />

            </div>
        <p className="precio-producto">{simboloMoneda} {precioFormateado}</p>

<div className="caracteristicas">
  <h3>Características</h3>
  {producto.descripcion && <p><strong>Descripción:</strong> {producto.descripcion}</p>}
  {(producto.alto || producto.ancho || producto.profundidad) && (
    <p><strong>Medidas:</strong> {producto.alto || '-'} x {producto.ancho || '-'} x {producto.profundidad || '-'} cm</p>
  )}
  {producto.categoria && <p><strong>Categoría:</strong> {producto.categoria}</p>}
  {producto.etiquetas?.length > 0 && (
    <p><strong>Etiquetas:</strong> {producto.etiquetas.join(', ')}</p>
  )}
</div>


  <div style={{ width:'100%' ,textAlign: 'center'}}>
            <button onClick={mostrarDatos} className="btn-agregar-carrito">
              Ver Datos del Vendedor
            </button>
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
  <p style={{ fontWeight: 'bold' }}>Compartir este producto:</p>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
    {/* Facebook */}
    <a
      href="#"
      onClick={compartirEnFacebook}
      target="_blank"
      rel="noopener noreferrer"
      title="Compartir en Facebook"
    >
      <i className="fab fa-facebook" style={{ fontSize: '24px', color: '#4267B2' }}></i>
    </a>

    {/* X (Twitter) */}
    <a
      href="#"
      onClick={compartirEnX}
      target="_blank"
      rel="noopener noreferrer"
      title="Compartir en X"
    >
      <i className="fab fa-twitter" style={{ fontSize: '24px', color: '#1DA1F2' }}></i>
    </a>

  </div>
</div>

  </div>

  {tipoVendedor && (
    <>
              <div className="promedio-estrellas" >
    <div style={{ fontSize: '50px', color: '#f7d000' }}>
      {'★'.repeat(Math.round(promedioEstrellas))}{'☆'.repeat(5 - Math.round(promedioEstrellas))}
    </div>
    <p style={{ margin: 0, fontSize: '14px' }}>Calificación: {promedioEstrellas.toFixed(1)} / 5</p>
  </div>
<button
  onClick={() => setMostrarComentarios(!mostrarComentarios)}
  className="btn-ver-comentarios"
>
  {mostrarComentarios ? '▴ Ocultar ▴' : '▾ Opiniones ▾'}
</button>
{mostrarComentarios && (
  <div className="box-calificaciones">

    <div className="comentarios-scroll">
      {comentarios.length ? (
        comentarios.map((c, idx) => (
          <div key={idx} style={{ borderBottom: '1px solid #ddd', padding: '8px 0' }}>
            <div style={{ color: '#f7d000' }}>
              {'★'.repeat(c.calificacion)}{'☆'.repeat(5 - c.calificacion)}
            </div>
            <p style={{ marginBottom: '4px' }}>{c.comentario}</p>
            <small style={{ color: '#777' }}>
              {c.fecha ? (typeof c.fecha === 'string' ? new Date(c.fecha).toLocaleDateString() : (c.fecha.seconds ? new Date(c.fecha.seconds * 1000).toLocaleDateString() : '')) : ''}
            </small>
          </div>
        ))
      ) : (
        <p style={{ fontSize: '13px', color: '#777' }}>Aún no hay comentarios.</p>
      )}
    </div>
  </div>
)}

    </>
  )}



<button
  onClick={() => setMasProductosDelVendedor(!masProductosDelVendedor)}
  className="btn-ver-comentarios" ref={parentRefMProductos}
>
  {masProductosDelVendedor ? '▴ Ocultar Productos ▴' : '▾ Mas Productos del Vendedor ▾'}
</button>



          </div>
        </div>

        <div className="seccion-relacionados">
          {masProductosDelVendedor && (
  
        <Plantillax4Productos productos={productosVendedor} parentRef={parentRefMProductos}/>
)}

          <h3>Productos Relacionados</h3>
          <div className="grid-relacionados">
            {productosRelacionados.length === 0 ? (
              <p>No hay más productos en esta categoría.</p>
            ) : (
              productosRelacionados.map(p => (
                <ProductCard key={p.id} producto={p} />
              ))
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default ProductoDetalle;
