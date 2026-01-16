import React, { useEffect, useState } from 'react';
import { db, auth, collection, query, where, getDocs, doc, updateDoc } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import './AtajosDeUsuario.css';

const AtajosDeUsuario = ({Tienda, comentarios}) => {

  const tipo = Tienda?.tipo;
  const codeVerify = Tienda?.verifyCode;
  const solicitudVerify = Tienda?.solicitudVerify;
  const tiendaVerificada = Tienda?.verificada;
  const premiumDate = Tienda?.premiumDate;
  const esPremium = Tienda?.esPremium;
  const idTienda = Tienda?.id;
  const nombreTienda = Tienda?.nombreTienda;
  const visitas = Tienda?.visitas;
  const vecesCompartida = Tienda?.vecesCompartida;
  const intFacebook = Tienda?.intFacebook;
  const intInsta = Tienda?.intInstagram;
  const intWeb = Tienda?.intWeb;
  const intWhatsApp = Tienda?.intWhatsapp;

  const [productos, setProductos] = useState([]);
  const [preciosEditados, setPreciosEditados] = useState({});

  
  useEffect(() => {
    const fetchProductos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'productos'), where('vendedorID', '==', user.uid));
      const snapshot = await getDocs(q);
      setProductos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProductos();
  }, []);

  const handlePrecioInputChange = (id, value) => {
    setPreciosEditados(prev => ({ ...prev, [id]: value }));
  };

  const handleActualizarPrecio = async (id) => {
    const nuevoPrecio = preciosEditados[id];
    if (!nuevoPrecio) return;

    try {
      await updateDoc(doc(db, 'productos', id), { precio: nuevoPrecio });
      setProductos(prev => prev.map(p => p.id === id ? { ...p, precio: nuevoPrecio } : p));
      Swal.fire('Precio actualizado', '', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo actualizar el precio', 'error');
    }
  };

  const compartirEnFacebook = (producto) => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://us-central1-marketplace-6dc50.cloudfunctions.net/shareProducto?id=${producto.id}`)}`;
    setTimeout(() => acreditarPuntosPorCompartir('facebook', producto), 1000);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const compartirEnX = (producto) => {
    const user = auth.currentUser;
    if (!user) return;

    const mensaje = `¡Mirá este producto en Cotiendas!\n${producto.titulo} - $${parseFloat(producto.precio).toFixed(2)}`;
    const url = `${window.location.origin}/producto/${producto.id}?ref=${user.uid}`;
    const urlX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(mensaje)}&url=${encodeURIComponent(url)}`;

    window.open(urlX, '_blank', 'width=600,height=400');
    setTimeout(() => acreditarPuntosPorCompartir('x', producto), 1000);
  };

  const acreditarPuntosPorCompartir = async (redSocial, producto) => {
    const user = auth.currentUser;
    if (!user) {
      Swal.fire('¡Gracias por compartir!', 'Estás ayudando a difundir este producto.', 'success');
      return;
    }

    const q = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const docUser = snapshot.docs[0];
    const data = docUser.data();
    const ref = doc(db, 'usuarios', docUser.id);

    const puntosActuales = data.puntos || 0;
    const historialActual = data.historialPuntos || [];
    const hoy = new Date().toISOString().slice(0, 10);
    const motivoFiltro = `10 puntos por compartir en ${redSocial} el producto ${producto.titulo}`;
    const compartidasHoy = historialActual.filter(h => h.motivo === motivoFiltro && h.fecha.slice(0, 10) === hoy).length;

    if (compartidasHoy >= 2) {
      Swal.fire('¡Gracias por compartir!', `Ya ganaste puntos por compartir en ${redSocial} hoy.`, 'info');
      return;
    }

    const nuevoHistorial = [...historialActual, { puntos: 10, motivo: motivoFiltro, fecha: new Date().toISOString() }];

    await updateDoc(ref, {
      puntos: puntosActuales + 10,
      historialPuntos: nuevoHistorial
    });

    Swal.fire('¡Gracias por compartir!', `Ganaste 10 puntos por compartir en ${redSocial}`, 'success');
  };



const compartirTiendaRed = async (plataforma) => {
  const tiendaIdFinal = idTienda;
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
      // 1. Acreditar puntos
      await acreditarPuntosPorCompartirTienda(plataforma, 'tienda', nombreTienda);

      // 2. Sumar "vecesCompartida"
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


const acreditarPuntosPorCompartirTienda = async (redSocial = 'facebook', tipo = 'tienda', nombre = '') => {
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

    const hoy = new Date().toISOString().slice(0, 10);
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



  // Calcular promedio (asegurate de que comentarios esté definido y sea un array)
const promedio =
  comentarios.length > 0
    ? comentarios.reduce((acc, c) => acc + c.calificacion, 0) / comentarios.length
    : 0;

// Redondear a número entero más cercano para mostrar estrellas
const estrellas = '★'.repeat(Math.round(promedio)) + '☆'.repeat(5 - Math.round(promedio));

const totalComentarios = comentarios.length;
const comentariosRespondidos = comentarios.filter(c => c.respuesta && c.respuesta.trim() !== '').length;

const tasaRespuesta = totalComentarios > 0
  ? Math.round((comentariosRespondidos / totalComentarios) * 100)
  : 0;


  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
  
    if (!file) return;
  
    if (!usuarioInfo?.id) {
      console.error('Falta el ID del usuario');
      return;
    }
  
    try {
      Swal.fire({
        title: 'Cambiando Banner...',
        text: 'Por favor, esperá mientras se actualiza tu banner.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      const reader = new FileReader();
      reader.onload = async function (event) {
        const img = new Image();
        img.onload = async function () {
          const canvas = document.createElement('canvas');
          canvas.width = 1000;
          canvas.height = 150;
  
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, 1000, 150);
  
          canvas.toBlob(async (blob) => {
            if (!blob) throw new Error('No se pudo generar la imagen redimensionada');
  
            // ✅ USO CORRECTO de imageCompression
            const compressedBlob = await imageCompression(blob, {
              maxSizeMB: 0.3,
              useWebWorker: true,
              fileType: 'image/jpeg',
              initialQuality: 0.9
            });
  
            const bannerRef = storageRef(storage, `usuarios/${usuarioInfo.id}/banner`);
            await uploadBytes(bannerRef, compressedBlob);
            const url = await getDownloadURL(bannerRef);
  
            await updateDoc(doc(db, 'usuarios', usuarioInfo.id), { bannerUrl: url });
            setUsuarioInfo((prev) => ({ ...prev, bannerUrl: url }));
  
            Swal.fire({
              icon: 'success',
              title: '¡Banner actualizado con éxito!',
              showConfirmButton: false,
              timer: 2000
            });
  
          }, 'image/jpeg', 1); // sin compresión aquí
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
  
    } catch (error) {
      console.error('Error al subir el banner:', error);
      Swal.fire('Error', 'No se pudo actualizar el banner.', 'error');
    }
  };

  return (
    <>
        <div style={divGridStyleHome}>
                  {Tienda?.tipo === 'tienda' ? (
        <>
<div
  className="banner-tienda"
  onClick={() => document.getElementById('inputBannerTienda').click()}
  style={{
    backgroundImage: `url(${Tienda?.bannerUrl || "/banner-tienda.png"})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '200px', // podés ajustar esto a tu gusto o hacerlo responsive por CSS
    position: 'relative',
    borderRadius: '8px',
    cursor: 'pointer'
  }}
>
  <div
    className="overlay-banner"
    style={{
      position: 'absolute',
      bottom: '10px',
      left: '0',
      width: '100%',
      textAlign: 'center',
      background: 'rgba(0,0,0,0.5)',
      color: '#fff',
      padding: '8px 0',
      fontWeight: 'bold'
    }}
  >
    CAMBIAR BANNER DE TIENDA
  </div>

  <input
    type="file"
    id="inputBannerTienda"
    accept="image/*"
    style={{ display: 'none' }}
    onChange={handleBannerUpload}
  />
</div>

        </>
      ):null}
  </div>
    
<div className="dashboard-tienda">
  <h2 className="dashboard-titulo">📊 Estadísticas</h2>

  {/* TARJETAS - FILA 1 */}
  <div className="dashboard-cards">
    <div className="card-resumen"><h4>Total Productos</h4><p>{productos.length}</p></div>
    <div className="card-resumen"><h4>Visitas Tienda</h4><p>{visitas}</p></div>
    <div className="card-resumen"><h4>Calificación</h4><p>{estrellas}</p></div>
    <div className="card-resumen"><h4>Comentarios</h4><p>{comentarios.length}</p></div>
    <div className="card-resumen onMobile"><h4>Tasa Respuesta</h4><p>{tasaRespuesta}%</p></div>
  </div>

  {/* TARJETAS - FILA 2 */}
  <div className="dashboard-cards">
<div className="card-resumen OnMobile">
  <h4>
    {tiendaVerificada
      ? 'Tienda Verificada'
      : solicitudVerify
      ? 'Verificando...'
      : 'Tienda Verificada'}
  </h4>
  <p>
    {tiendaVerificada ? (
      '✅'
    ) : solicitudVerify ? (
      `Cód: ${codeVerify}`
    ) : (
      'No Verificada'
    )}
  </p>
</div>

<div className="card-resumen ">
  <h4>{esPremium ? 'Premium Hasta:' : 'Premium'}</h4>
  <p>{esPremium ? new Date(premiumDate).toLocaleDateString() : 'No es Premium'}</p>
</div>
    <div className="card-resumen"><h4>En Liquidación</h4><p>{productos.filter(p => p.liquidacion).length}</p></div>
    <div className="card-resumen">
      <h4>Compartir Tienda</h4>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); compartirTiendaRed('facebook') }}>
          <i className="fab fa-facebook" style={{ fontSize: '30px', marginTop:'10px', color: '#4267B2' }}></i>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); compartirTiendaRed('x') }}>
          <i className="fab fa-twitter" style={{ fontSize: '30px', marginTop:'10px', color: '#1DA1F2' }}></i>
        </a>
      </div>
    </div>
    <div className="card-resumen"><h4>Veces Compartida</h4><p>{vecesCompartida ?? 0}</p>
</div>
  </div>

  {/* NUBES - 4 COLUMNAS */}
  <div className="dashboard-nubes">
<div className="nube-info">
  <h4 style={{ textAlign: 'center' }}>👑 Top 5 Visitas</h4>
  <table className="nube-tabla">
    <thead>
      <tr>
        <th style={{ textAlign: 'center' }}>Producto</th>
        <th style={{ textAlign: 'center' }}>Visitas</th>
      </tr>
    </thead>
    <tbody>
      {productos
        .filter(p => p.visitas)
        .sort((a, b) => b.visitas - a.visitas)
        .slice(0, 5)
        .map(p => (
          <tr key={p.id}>
            <td style={{ textAlign: 'center', textTransform: 'uppercase' }}>{p.titulo?.slice(0, 30)}</td>
            <td style={{ textAlign: 'center' }}>{p.visitas}</td>
          </tr>
        ))}
    </tbody>
  </table>
</div>


<div className="nube-info">
  <h4 style={{ textAlign: 'center' }}>⚡ Top 5 Interacciones</h4>
  <table className="nube-tabla">
    <thead>
      <tr>
        <th style={{ textAlign: 'center' }}>Producto</th>
        <th style={{ textAlign: 'center' }}>Interacciones</th>
      </tr>
    </thead>
    <tbody>
      {productos
        .filter(p => p.interacciones)
        .sort((a, b) => b.interacciones - a.interacciones)
        .slice(0, 5)
        .map(p => (
          <tr key={p.id}>
            <td style={{ textAlign: 'center', textTransform: 'uppercase' }}>{p.titulo?.slice(0, 30)}</td>
            <td style={{ textAlign: 'center' }}>{p.interacciones}</td>
          </tr>
        ))}
    </tbody>
  </table>
</div>


<div className="nube-info">
  <h4 style={{ textAlign: 'center' }}>🔗 Clics en Enlaces</h4>
  <table className="nube-tabla">
    <thead>
      <tr>
        <th style={{ textAlign: 'center' }}>Red</th>
        <th style={{ textAlign: 'center' }}>Clics</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style={{ textAlign: 'center' }}>Facebook</td><td style={{ textAlign: 'center' }}>{intFacebook}</td></tr>
      <tr><td style={{ textAlign: 'center' }}>Instagram</td><td style={{ textAlign: 'center' }}>{intInsta}</td></tr>
      <tr><td style={{ textAlign: 'center' }}>Web</td><td style={{ textAlign: 'center' }}>{intWeb}</td></tr>
      <tr><td style={{ textAlign: 'center' }}>WhatsApp</td><td style={{ textAlign: 'center' }}>{intWhatsApp}</td></tr>
    </tbody>
  </table>
</div>


<div className="nube-info">
  <h4 style={{ textAlign: 'center' }}>📝 Últimos Comentarios de la Tienda</h4>
  {comentarios.length ? (
    <table className="nube-tabla">
      <thead>
        <tr>
          <th style={{ width: '75%', textAlign: 'left' }}>Comentario</th>
          <th style={{ width: '25%', textAlign: 'center' }}>Calificación</th>
        </tr>
      </thead>
      <tbody>
        {comentarios.map((c, idx) => (
          <tr key={idx}>
            <td style={{ width: '75%', textAlign: 'left', textTransform: 'uppercase' }}>{c.comentario}</td>
            <td style={{ width: '25%', color: '#f7d000', fontSize: '25px', textAlign: 'center' }}>
              {'★'.repeat(c.calificacion) + '☆'.repeat(5 - c.calificacion)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No existen comentarios aún.</p>
  )}
</div>

  </div>

  {/* TABLA DE PRODUCTOS */}
  <div className="tabla-productos">
    <h3>Mis Productos Atajo</h3>
    <table>
      <thead>
        <tr>
          <th className="th-tooltip onMobile" data-tooltip="ID del producto">ID</th>
          <th className="th-tooltip" data-tooltip="Título del producto">Descripción</th>
          <th className="th-tooltip" data-tooltip="Precio editable">Precio</th>
          <th className="th-tooltip " data-tooltip="Cantidad de visitas">Visitas</th>
          <th className="th-tooltip onMobile" data-tooltip="Estado actual del producto">Estado</th>
          <th className="th-tooltip onMobile" data-tooltip="Fecha de publicación">Publicado</th>
          <th className="th-tooltip" data-tooltip="Compartí tu producto en redes">Compartir</th>
        </tr>
      </thead>
<tbody>
  {productos.map(producto => (
    <tr key={producto.id}>
      <td className='onMobile' style={{ textTransform: 'uppercase' }}>{producto.id}</td>
      <td style={{ textTransform: 'uppercase' }}>{producto.titulo}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <input
            type="text"
            value={preciosEditados[producto.id] ?? producto.precio}
            onChange={(e) => handlePrecioInputChange(producto.id, e.target.value)}
            className="productos-precios"
          />
          <button
            onClick={() => handleActualizarPrecio(producto.id)}
            style={{
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              padding: '4px 8px',
              cursor: 'pointer'
            }}
            title="Actualizar precio"
          >
            ✔
          </button>
        </div>
      </td>
      <td>{esPremium ? (producto.visitas || 0) : "Solo en Premium"}</td>
      <td className='onMobile' style={{ textTransform: 'uppercase' }}>{esPremium ? (producto.estado || "Sin estado") : "Solo en Premium"}</td>
      <td className='onMobile'>
        {esPremium
          ? (producto.fecha ? producto.fecha.toDate().toLocaleDateString('es-AR') : "Sin fecha")
          : "Solo en Premium"}
      </td>
      <td>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          {esPremium ? (
            <>
              <a href="#" onClick={(e) => { e.preventDefault(); compartirEnFacebook(producto); }}>
                <i className="fab fa-facebook" style={{ fontSize: '20px', color: '#4267B2' }}></i>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); compartirEnX(producto); }}>
                <i className="fab fa-twitter" style={{ fontSize: '20px', color: '#1DA1F2' }}></i>
              </a>
            </>
          ) : "Solo en Premium"}
        </div>
      </td>
    </tr>
  ))}
</tbody>

    </table>
  </div>
</div>


</>


  );
};

const divGridStyleHome = { display: 'flex',width: '100%', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px'};


export default AtajosDeUsuario;

