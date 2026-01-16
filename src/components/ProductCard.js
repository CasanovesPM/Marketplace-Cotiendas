import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {auth, storage,query,where, storageRef, deleteObject, db, doc, deleteDoc, updateDoc, getDoc , collection , getDocs} from '../firebaseConfig';
import './ProductCard.css';
import { useNavigate } from 'react-router-dom';
import LiquidarModal from './Herramientas/LiquidarModal';

const ProductCard = ({ producto, enPerfil = false, onProductoActualizado, onProductoEliminado, onEditar, onActualizarProductos }) => {
  const navigate = useNavigate();
  const simboloMoneda = (producto.moneda === 'USD' || producto.moneda === 'U$D') ? 'U$D' : '$';
  const precio = parseFloat(producto.precio) || 0;
  const precioFormateado = new Intl.NumberFormat('es-AR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precio);
  const [entero, decimal] = precioFormateado.split(',');
  const [ubicacion, setUbicacion] = useState('');
const [mostrarModalLiquidar, setMostrarModalLiquidar] = useState(false);


const registrarEliminacion = async () => {
  try {
    // Obtener usuario actual
    const user = auth.currentUser;
    if (!user) return;

    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('uid', '==', user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('Usuario no encontrado');
      return;
    }

    const userDoc = snapshot.docs[0]; // Si hay varios, tomamos el primero
    const tipo = userDoc.data().tipo;
    const campo = tipo === 'tienda' ? 'totalProductosEliminadosTienda' : 'totalProductosEliminadosParticular';

    // Referencia al documento resumenGeneral
    const resumenRef = doc(db, 'estadisticas', 'resumenGeneral');
    const resumenSnap = await getDoc(resumenRef);

    if (resumenSnap.exists()) {
      const data = resumenSnap.data();
      const productos = data.productos || {};
      const valorAnterior = productos[campo] || 0;

      await updateDoc(resumenRef, {
        [`productos.${campo}`]: valorAnterior + 1
      });
    } else {
      await setDoc(resumenRef, {
        productos: {
          [campo]: 1
        }
      });
    }

  } catch (error) {
    console.error("Error al eliminar edición:", error);
  }
};


  useEffect(() => {
const fetchUbicacion = async () => {
  if (!producto.vendedorID) return;
  try {
    const snapshot = await getDocs(collection(db, 'usuarios'));
    const docu = snapshot.docs.find(doc => doc.data().uid === producto.vendedorID);

    if (docu) {
      const data = docu.data();
      setUbicacion(`${data.ciudad || ''}, ${data.provincia || ''}`);
    } else {
      setUbicacion('Ubicación desconocida');
    }
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    setUbicacion('Error al cargar ubicación');
  }
};
    fetchUbicacion();
  }, [producto.vendedorID]);

  const handleVerMas = () => {
    navigate(`/producto/${producto.id}`);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleEliminar = async () => {
    if (!producto.id || typeof producto.id !== 'string') {
      Swal.fire('Error', 'ID del producto no válido.', 'error');
      return;
    }

    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto eliminará el producto y todas sus imágenes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      
      try {
        if (producto.imagenes && producto.imagenes.length > 0) {
          await Promise.all(producto.imagenes.map(async (url) => {
            const ref = storageRef(storage, url);
            await deleteObject(ref).catch(() => {});
          }));
        }
        await deleteDoc(doc(db, 'productos', producto.id));
        registrarEliminacion();
        Swal.fire('Producto eliminado con éxito', '', 'success');
        if (onActualizarProductos) onActualizarProductos();
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const handlePausar = async () => {
    if (!producto.id || typeof producto.id !== 'string') {
      Swal.fire('Error', 'ID del producto no válido.', 'error');
      return;
    }

    const nuevoEstado = producto.estado === 'pausado' ? 'activo' : 'pausado';
    const mensaje = nuevoEstado === 'pausado'
      ? '¿Quieres pausar este producto?'
      : '¿Quieres despausar este producto?';

    const confirm = await Swal.fire({
      title: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${nuevoEstado}`,
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await updateDoc(doc(db, 'productos', producto.id), { estado: nuevoEstado });
        Swal.fire(`Producto ${nuevoEstado}`, '', 'success');
        if (onActualizarProductos) onActualizarProductos();
      } catch (error) {
        console.error('Error al pausar/despausar:', error);
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const mostrarPublicidadYDatosVendedor = async () => {
    const publicidad = await Swal.fire({
      title: '¡Oferta Especial!',
      html: `<img src="https://via.placeholder.com/300x200?text=Publicidad" alt="Publicidad" style="width:100%; border-radius:8px;" />
             <p style="margin-top:10px;">¡No te pierdas esta promoción especial antes de comprar!</p>`,
      showCancelButton: true,
      confirmButtonText: 'Ver Datos del Vendedor',
      cancelButtonText: 'Cancelar'
    });

    if (publicidad.isConfirmed) {
      if (!producto.vendedorID) {
        Swal.fire('Error', 'No se encontró información del vendedor.', 'error');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'usuarios', producto.vendedorID));
        if (userDoc.exists()) {
          const data = userDoc.data();
          Swal.fire({
            title: `${data.nombre} ${data.apellido}`,
            html: `<p>📍 Ciudad: ${data.ciudad || 'No disponible'}</p>
                   <p>📍 Provincia: ${data.provincia || 'No disponible'}</p>
                   <p>📞 Teléfono: ${data.telefono || 'No disponible'}</p>`,
            confirmButtonText: 'Cerrar'
          });
        } else {
          Swal.fire('Error', 'No se encontró información del vendedor.', 'error');
        }
      } catch (error) {
        console.error('Error al obtener datos del vendedor:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los datos del vendedor.', 'error');
      }
    }
  };

const handleConfirmarLiquidar = async () => {
  const confirmacion = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Vas a gastar 100 puntos para liquidar este producto por 30 días.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, liquidar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmacion.isConfirmed) return;

  const user = auth.currentUser;
  if (!user) return;

  const usuariosSnap = await getDocs(collection(db, 'usuarios'));
  const docu = usuariosSnap.docs.find(d => d.data().uid === user.uid);

  if (!docu) return Swal.fire('Error', 'Usuario no encontrado', 'error');

  const data = docu.data();
  const puntosActuales = data.puntos || 0;

  if (puntosActuales < 100) {
    Swal.fire({
      icon: 'error',
      title: 'No tiene suficientes puntos',
      confirmButtonText: 'Cargar Puntos'
    }).then((result) => {
      if (result.isConfirmed) window.open('https://google.com', '_blank');
    });
    return;
  }

  try {
    // 🔹 Descontar puntos
    await updateDoc(doc(db, 'usuarios', docu.id), {
      puntos: puntosActuales - 100,
      historialPuntos: [
        ...(data.historialPuntos || []),
        {
          motivo: 'Gastó puntos para liquidar un producto',
          puntos: -100,
          fecha: new Date().toISOString()
        }
      ]
    });

    // 🔹 Marcar como liquidado
    const fechaHoy = new Date();
    const fechaFormateada = `${fechaHoy.getDate().toString().padStart(2, '0')}/${(fechaHoy.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${fechaHoy.getFullYear()}`;

    await updateDoc(doc(db, 'productos', producto.id), {
      liquidacion: 1,
      liquidacionDate: fechaFormateada
    });

    Swal.fire('Puntos canjeados con éxito', '', 'success');
    setMostrarModalLiquidar(false);
    if (onActualizarProductos) onActualizarProductos();
  } catch (error) {
    console.error('Error en la liquidación:', error);
    Swal.fire('Error', 'Hubo un problema al liquidar el producto.', 'error');
  }
};

const calcularFechaLimiteLiquidacion = (fechaStr) => {
  if (!fechaStr) return null;
  const [dia, mes, anio] = fechaStr.split('/');
  const fecha = new Date(`${anio}-${mes}-${dia}`);
  fecha.setMonth(fecha.getMonth() + 1);

  const diaFinal = String(fecha.getDate()).padStart(2, '0');
  const mesFinal = String(fecha.getMonth() + 1).padStart(2, '0');
  const anioFinal = fecha.getFullYear();
  return `${diaFinal}/${mesFinal}/${anioFinal}`;
};

const fechaLimiteLiquidacion = producto.liquidacionDate
  ? calcularFechaLimiteLiquidacion(producto.liquidacionDate)
  : null;

  return (
    <>
    {mostrarModalLiquidar ? (
  <LiquidarModal
    onClose={() => setMostrarModalLiquidar(false)}
    onConfirm={handleConfirmarLiquidar}
  />
) : (
  <>
    <div className="product-card"   onClick={enPerfil ? undefined : handleVerMas}
>
      <img src={producto.imagenes?.[0] || 'https://via.placeholder.com/300'} alt={producto.titulo} className="product-image" />
      <h3 className="product-title">{producto.titulo}</h3>
      <p className="product-price">
        <span className="product-moneda">{simboloMoneda}</span> {entero}
        <span className="product-price-decimal">,{decimal}</span>
      </p>
      <p className="product-location">{ubicacion}</p>

      <div className="button-container">
        {enPerfil ? (
        <>

          <div className="botones-grid">
                        <button className="btn btn-secondary editar" onClick={() => onEditar(producto)}>Editar</button>

<button className="btn-hotsale" onClick={() => setMostrarModalLiquidar(true)}>
  {producto.liquidacion === 1 || producto.liquidacion === "1" ? fechaLimiteLiquidacion : 'LIQUIDAR'}
</button>
            <button className="btn btn-danger eliminar" onClick={handleEliminar}>Eliminar</button>
            <button className="btn btn-primary pausar" onClick={handlePausar}>
              {producto.estado === 'pausado' ? 'Despausar' : 'Pausar'}
            </button>
          </div>
        </>
        ) : (
          <>
            {/* <button className="btn comprar" onClick={mostrarPublicidadYDatosVendedor}>Comprar</button>
            <button className="btn ver-mas" onClick={handleVerMas}>Ver Más</button> */}
          </>
        )}
      </div>
    </div>
      </>
)}


    </>
  );
};

export default ProductCard;
