import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import UsuariosSection from './components/users';
import InicioDashboard from './components/inicio';
import { auth, db, collection, getDocs, setDoc,doc, getDoc } from '../firebaseConfig';
import SolicitudVerificacion from './components/solicitudVerificacion';
import Productos from './components/productos';
import Reportes from './components/reportes'
import Contacto from './components/contactos';


const AdminDashboard = () => {

  const ahora = new Date();

  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const anio = ahora.getFullYear();

  const fechaFormateada = `${dia}-${mes}-${anio}`;

  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [autenticado, setAutenticado] = useState(false);
  const [resumenAct, setResumenAct] = useState('');
  const [estadisticasDiarias, setEstadisticasDiarias] = useState('');
  const [visitasDiarias, setVisitasDiarias] = useState('');
  const [busquedaUS7, setBusquedaUS7] = useState('');
  const [productosUS7, setProductosUS7] = useState('');
  const [usuariosUS7, setUsuariosUS7] = useState('');
  const [productos, setProductos] = useState('');


const [cantidadDenunciasPendientes, setCantidadDenunciasPendientes] = useState(0);
const [cantidadContactosPendientes, setCantidadContactosPendientes] = useState(0);

  const [solicitudesVerificacion, setSolicitudesVerificacion] = useState([]);
const [cantidadSolicitudes, setCantidadSolicitudes] = useState(0);

  useEffect(() => {
  if (!autenticado) return;

  if (seccionActiva === 'inicio') {
    mostrarCargando();
    obtenerEstadisticas().then(() => Swal.close());
  }

  if (seccionActiva === 'usuarios') {
    mostrarCargando();
    cargarUsuarios().then(() => Swal.close());
  }

    if (seccionActiva === 'productos') {
    mostrarCargando();
    obtenerProductos().then(() => Swal.close());
  }
}, [seccionActiva, autenticado]);

useEffect(() => {
  const verificarIdentidad = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Verificación de Identidad',
      html:
        '<input id="input1" type=password class="swal2-input" placeholder="Clave de Acceso">' +
        '<input id="input2" type=password class="swal2-input" placeholder="Frase">' +
        '<input id="input3" type=password class="swal2-input" placeholder="Código de Identidad">',
      focusConfirm: false,
      showCancelButton: false,
      confirmButtonText: 'Confirmar',
      preConfirm: () => {
        const val1 = document.getElementById('input1').value;
        const val2 = document.getElementById('input2').value;
        const val3 = document.getElementById('input3').value;

        if (val1 === '1' && val2 === '2' && val3 === '3') {
          return true;
        } else {
          Swal.showValidationMessage('Datos incorrectos');
          return false;
        }
      }
    });

    if (formValues) {
      setAutenticado(true);
    } else {
      Swal.fire('Acceso denegado', 'Serás redirigido', 'error').then(() => navigate('/'));
    }
  };

  verificarIdentidad();
}, [navigate]);

    const obtenerProductos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'productos'));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProductos(lista);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

const obtenerUsuarios = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'usuarios'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

const cargarUsuarios = async () => {
  const lista = await obtenerUsuarios();
  setUsuarios(lista);
};

useEffect(() => {
  if (!autenticado) return;
  obtenerProductos();
  cargarUsuarios();
}, [autenticado]);



const obtenerEstadisticas = async () => {
  try {
    // 🔹 Obtener resumen general y otros datos de 'estadisticas'
    const snapshot = await getDocs(collection(db, 'estadisticas'));
    const todas = {};
    snapshot.forEach(doc => {
      todas[doc.id] = doc.data();
    });


    // 🔹 Obtener últimos 7 días desde 'estadisticasDiarias'
    const hoy = new Date();
    const fechasUltimos7Dias = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() - i);
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const anio = fecha.getFullYear();
      const fechaFormateada = `${dia}-${mes}-${anio}`;
      fechasUltimos7Dias.push(fechaFormateada);
    }

    const datosPorDia = {};
    for (const fecha of fechasUltimos7Dias) {
      const docRef = doc(db, 'estadisticasDiarias', fecha);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        datosPorDia[fecha] = docSnap.data();
      }
    }

    const visitasPorDia = {};

    for (const fecha of fechasUltimos7Dias) {
      const docRef = doc(db, 'estadisticas', 'visitas', 'diarias', fecha);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        visitasPorDia[fecha] = docSnap.data();
      }
    }

    setVisitasDiarias(visitasPorDia);

    const diariasRef = collection(db, 'estadisticas', 'busquedas', 'diarias');
    const snapshot2 = await getDocs(diariasRef);

    let busquedasUS7 = 0;

    snapshot2.forEach(doc => {
      const data = doc.data();
      const cantidad = data.busquedasHoy || 0;
      busquedasUS7 += cantidad;
    });

    setBusquedaUS7(busquedasUS7);

    let total = 0;

    const productosSnapshot = await getDocs(collection(db, 'productos'));

    productosSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.fecha || typeof data.fecha.toDate !== 'function') return;

      // Convertir timestamp a 'dd-mm-aaaa'
      const fechaObj = data.fecha.toDate();
      const dia = String(fechaObj.getDate()).padStart(2, '0');
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const anio = fechaObj.getFullYear();
      const fechaFormateada = `${dia}-${mes}-${anio}`;

      if (fechasUltimos7Dias.includes(fechaFormateada)) {
        total++;
      }
    });

    setProductosUS7(total);

    let tienda = 0;
    let particular = 0;

    const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));

    usuariosSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.fechaRegistro || typeof data.fechaRegistro.toDate !== 'function') return;

      const fechaObj = data.fechaRegistro.toDate();
      const dia = String(fechaObj.getDate()).padStart(2, '0');
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const anio = fechaObj.getFullYear();
      const fechaFormateada = `${dia}-${mes}-${anio}`;

      if (fechasUltimos7Dias.includes(fechaFormateada)) {
        if (data.tipo === 'tienda') tienda++;
        else if (data.tipo === 'particular') particular++;
      }
    });
    // Guardamos los totales discriminados
    setUsuariosUS7({ tienda, particular });

    // 🔹 Guardar en estados React
    setEstadisticasDiarias(datosPorDia); // ⬅️ ahora contiene los últimos 7 días
    setResumenAct(todas);

  } catch (error) {
    console.error("Error al obtener todas las estadísticas:", error);
  }
};

const sincronizarEstadisticas = async () => {
  try {
    // Mostrar loading al comenzar
    Swal.fire({
      title: '🔄 Sincronizando información...',
      text: 'Aguarde por favor.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
    const usuariosDocs = usuariosSnapshot.docs;
    const usuarios = usuariosDocs.map(doc => ({ id: doc.id, ...doc.data() }));

    const productosSnapshot = await getDocs(collection(db, 'productos'));
    const productos = productosSnapshot.docs.map(doc => doc.data());

    // 🔄 Inicializamos contadores de comentarios
    let totalComentarios = 0;
    let totalRespondidos = 0;

    // 🔄 Inicializamos contadores de publicidades
    let totalImpAdsCard = 0;
    let totalImpAdsBanner = 0;
    let totalClicksAdsCard = 0;
    let totalClicksAdsBanner = 0;

    // ⭐ Inicializamos el arreglo para calcular el total de calificaciones
    let listaComentarios = [];

    // 📊 Inicializamos contadores de interacciones
    let totalIntFacebook = 0;
    let totalIntInstagram = 0;
    let totalIntWhatsapp = 0;
    let totalIntWeb = 0;
    let totalProductosEditadosParticular = 0;
    let totalProductosEditadosTienda = 0;
    let totalProductosEliminadosParticular = 0;
    let totalProductosEliminadosTienda = 0;

    // 📥 Obtener publicidades desde resumenGeneral
    const resumenDocRef = doc(db, 'estadisticas', 'resumenGeneral');
    const resumenDocSnap = await getDoc(resumenDocRef);

    if (resumenDocSnap.exists()) {
      const data = resumenDocSnap.data();
      const publicidades = data.publicidades || {};

      totalImpAdsCard = publicidades.totalImpAdsCard || 0;
      totalImpAdsBanner = publicidades.totalImpAdsBanner || 0;
      totalClicksAdsCard = publicidades.totalClicksAdsCard || 0;
      totalClicksAdsBanner = publicidades.totalClicksAdsBanner || 0;

      const productos = data.productos || {};

      totalProductosEditadosParticular = productos.totalProductosEditadosParticular || 0;
      totalProductosEditadosTienda = productos.totalProductosEditadosTienda || 0;
      totalProductosEliminadosParticular = productos.totalProductosEliminadosParticular || 0;
      totalProductosEliminadosTienda = productos.totalProductosEliminadosTienda || 0;
    }

    // 🔍 Recorrer usuarios tipo tienda
    for (const user of usuarios) {
      if (user.tipo === 'tienda') {
        const comentariosRef = collection(db, 'usuarios', user.id, 'comentarios');
        const comentariosSnap = await getDocs(comentariosRef);

        comentariosSnap.forEach(comentarioDoc => {
          totalComentarios++;
          const comentario = comentarioDoc.data();
          if (comentario.respuesta) {
            totalRespondidos++;
          }
          if (comentario.calificacion) {
            listaComentarios.push(comentario.calificacion);
          }
        });

        totalIntFacebook += user.intFacebook || 0;
        totalIntInstagram += user.intInstagram || 0;
        totalIntWhatsapp += user.intWhatsapp || 0;
        totalIntWeb += user.intWeb || 0;
      }
    }

    let totalPromedioTiendas = 0;
    if (listaComentarios.length > 0) {
      const suma = listaComentarios.reduce((acc, calificacion) => acc + calificacion, 0);
      totalPromedioTiendas = suma / listaComentarios.length;
    }

    const ahora = new Date(); // Asegurate que esto esté declarado
    const resumen = {
      usuarios: {
        totalUsuarios: usuarios.length,
        totalVerificados: usuarios.filter(u => u.verificado === true).length,
        totalTiendas: usuarios.filter(u => u.tipo === 'tienda').length,
        totalParticulares: usuarios.filter(u => u.tipo === 'particular').length,
        totalPremium: usuarios.filter(u => u.esPremium === true).length,
        tiendasVerificadas: usuarios.filter(u => u.verificada === true).length,
        tiendasActivas: usuarios.filter(u => {
          if (u.tipo !== 'tienda' || !u.ultimaConexion) return false;
          const fechaConexion = new Date(u.ultimaConexion);
          const diferenciaDias = (ahora - fechaConexion) / (1000 * 60 * 60 * 24);
          return diferenciaDias <= 30;
        }).length,
        particularesActivos: usuarios.filter(u => {
          if (u.tipo !== 'particular' || !u.ultimaConexion) return false;
          const fechaConexion = new Date(u.ultimaConexion);
          const diferenciaDias = (ahora - fechaConexion) / (1000 * 60 * 60 * 24);
          return diferenciaDias <= 30;
        }).length,
        totalPromedioTiendas,
        totalIntFacebook,
        totalIntInstagram,
        totalIntWhatsapp,
        totalIntWeb,
      },
      productos: {
        
        totalProductos: productos.length,
        totalPublicados: productos.filter(p => p.estado === 'activo').length,
        totalEnLiquidacion: productos.filter(p => p.liquidacion === 1).length,
        totalPausados: productos.filter(p => p.estado === 'pausado').length,

        totalProductosTienda: productos.filter(p => p.tipoVendedor === 'tienda').length,
        totalPublicadosTienda: productos.filter(p => p.estado === 'activo' && p.tipoVendedor === 'tienda').length,
        totalEnLiquidacionTienda: productos.filter(p => p.liquidacion === 1 && p.tipoVendedor === 'tienda').length,
        totalPausadosTienda: productos.filter(p => p.estado === 'pausado' && p.tipoVendedor === 'tienda').length,

        totalProductosParticular: productos.filter(p => p.tipoVendedor === 'particular').length,
        totalPublicadosParticular: productos.filter(p => p.estado === 'activo' && p.tipoVendedor === 'particular').length,
        totalEnLiquidacionParticular: productos.filter(p => p.liquidacion === 1 && p.tipoVendedor === 'particular').length,
        totalPausadosParticular: productos.filter(p => p.estado === 'pausado' && p.tipoVendedor === 'particular').length,

        totalVisitas: productos.reduce((acc, p) => acc + (p.visitas || 0), 0),
        totalProductosEditadosParticular,
        totalProductosEditadosTienda,
        totalProductosEliminadosParticular,
        totalProductosEliminadosTienda,
      },
      comentarios: {
        totalComentarios,
        totalRespondidos,
      },
      publicidades: {
        totalImpAdsCard,
        totalImpAdsBanner,
        totalClicksAdsCard,
        totalClicksAdsBanner,
      },
      fecha: new Date().toISOString(),
    };

    await setDoc(resumenDocRef, resumen);

    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const fechaFormateada = `${dia}-${mes}-${anio}`;

    const resumenDiarioRef = doc(collection(db, 'estadisticasDiarias'), fechaFormateada);
    await setDoc(resumenDiarioRef, resumen);

    await obtenerEstadisticas();

    // Cerrar loading y mostrar éxito
    Swal.close();
    Swal.fire('✅ Éxito', 'Las estadísticas fueron actualizadas correctamente.', 'success');

  } catch (error) {
    console.error('Error al sincronizar estadísticas:', error);
    Swal.close();
    Swal.fire('❌ Error', 'Hubo un problema al actualizar las estadísticas.', 'error');
  }
};



// ✅ Cargar estadísticas cuando se autentica
useEffect(() => {
  if (autenticado) {
    cargarSolicitudesVerificacion();
        cargarDenunciasPendientes();
    cargarContactosPendientes();
    obtenerEstadisticas();
  }
}, [autenticado]);

// ✅ Dentro del render del componente:
if (!autenticado) return <></>;

  const handleLogout = async () => {
    const result = await Swal.fire({ title: '¿Cerrar sesión?', showCancelButton: true });
    if (result.isConfirmed) {
      await auth.signOut();
      navigate('/');
      Swal.fire('Sesión cerrada', '', 'success');
    }
  };

  const mostrarCargando = (mensaje = 'Cargando datos...') => {
  Swal.fire({
    title: mensaje,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

const cargarSolicitudesVerificacion = async () => {
  const snapshot = await getDocs(collection(db, 'usuarios'));
  const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const tiendasConSolicitud = lista.filter(
    u => u.tipo === 'tienda' && u.solicitudVerify === true
  );
  setSolicitudesVerificacion(tiendasConSolicitud);
  setCantidadSolicitudes(tiendasConSolicitud.length);
};


const cargarDenunciasPendientes = async () => {
  const snapshot = await getDocs(collection(db, 'reportes'));
  const lista = snapshot.docs.map(doc => doc.data());
  const pendientes = lista.filter(r => r.revisado === false);
  setCantidadDenunciasPendientes(pendientes.length);
};

const cargarContactosPendientes = async () => {
  const snapshot = await getDocs(collection(db, 'contactos'));
  const lista = snapshot.docs.map(doc => doc.data());
  const pendientes = lista.filter(m => !m.revisado);
  setCantidadContactosPendientes(pendientes.length);
};

  return (
    <div className="admin-panel">
      <aside className="sidebar">
        <div className="logo">.Runa</div>
        <nav>
          <h4>GESTIÓN</h4>
          <ul>
            <li className={seccionActiva === 'inicio' ? 'active' : ''} onClick={() => setSeccionActiva('inicio')}>📊 Inicio</li>
            <li className={seccionActiva === 'usuarios' ? 'active' : ''} onClick={() => setSeccionActiva('usuarios')}>👥 Usuarios</li>         
            <li className={seccionActiva === 'productos' ? 'active' : ''} onClick={() => setSeccionActiva('productos')}>📦 Productos</li>
             <li
              className={seccionActiva === 'verificaciones' ? 'active' : ''}
              onClick={() => setSeccionActiva('verificaciones')}
              style={{ position: 'relative' }}
            >
              🏬 Verificaciones
              {cantidadSolicitudes > 0 && (
                <span className="badge-roja">{cantidadSolicitudes}</span>
              )}
            </li> 
            <li
                className={seccionActiva === 'reportes' ? 'active' : ''}
                onClick={() => setSeccionActiva('reportes')}
                style={{ position: 'relative' }}
              >
                ⛔ Denuncias
                {cantidadDenunciasPendientes > 0 && (
                  <span className="badge-roja">{cantidadDenunciasPendientes}</span>
                )}
              </li>

              <li
                className={seccionActiva === 'contactos' ? 'active' : ''}
                onClick={() => setSeccionActiva('contactos')}
                style={{ position: 'relative' }}
              >
                ❓ Contactos
                {cantidadContactosPendientes > 0 && (
                  <span className="badge-roja">{cantidadContactosPendientes}</span>
                )}
              </li>
          </ul>
          <button onClick={sincronizarEstadisticas} className="sincronizar-btn">
  🔄 Sincronizar Estadísticas
</button>
        <button className="logout-btn" onClick={handleLogout}>🚪 Cerrar Sesión</button>

        </nav>
      </aside>

      <main className="content">
        <section className="panel-seccion">
          {seccionActiva === 'inicio' && <InicioDashboard 
          resumen={resumenAct} estadisticasDiarias={estadisticasDiarias} visitasDiarias={visitasDiarias} 
          productosUS7={productosUS7} usuariosUS7={usuariosUS7} busquedaUS7={busquedaUS7}/>}
          {seccionActiva === 'usuarios' && <UsuariosSection usuarios={usuarios} cargarUsuarios={cargarUsuarios}/>}
          {seccionActiva === 'verificaciones' && <div><SolicitudVerificacion cargarSolicitudesVerificacion={cargarSolicitudesVerificacion}/></div>}
          {seccionActiva === 'productos' && <div><Productos productos={productos} obtenerProductos={obtenerProductos}/></div>}
          {seccionActiva === 'contactos' && <div><Contacto /></div>}
          {seccionActiva === 'reportes' && <div><Reportes/></div>}
          {seccionActiva === 'ordenes' && <div>🧾 Panel de Órdenes</div>}
          {seccionActiva === 'bkps' && <div><BackUpManager/></div>}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
