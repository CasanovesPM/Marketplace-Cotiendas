import React from 'react';
import './inicio.css';
import { FaEye,FaPause, FaFire, FaUser,FaCheck ,FaTimes , FaBox, FaExclamationCircle, FaExclamationTriangle,
   FaChartBar, FaStore, FaMoneyBillWave, FaComments, FaGlobe, FaClipboardCheck, FaBan, FaBullhorn, FaRocket, 
   FaChartLine, FaStar, FaClock, FaRegFlag, FaThumbsUp, FaBullseye, FaFileAlt, FaEdit, FaTrash, FaSearch, FaFilter,
    FaCamera, FaCheckCircle, FaFacebook, FaInstagram, FaWhatsapp} from 'react-icons/fa';

const InicioDashboard = ( {resumen = [], estadisticasDiarias =[], visitasDiarias=[], productosUS7, usuariosUS7=[], busquedaUS7}) => {



    const ahora = new Date();

    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();

    const fechaHoy = `${dia}-${mes}-${anio}`;

    const estadisticasHoy = estadisticasDiarias[fechaHoy];

    const busquedasUS7 = busquedaUS7;
    const prodsUS7 = productosUS7;
    const tiendasUS7 = usuariosUS7?.tienda;
    const particularUS7 = usuariosUS7?.particular;
    const visitasUS7 = Object.values(visitasDiarias).reduce((total, dia) => {
      return total + (dia.visitasHoy || 0);
    }, 0);


    const busquedas = resumen?.busquedas?.busquedasCotiendas;
    const visitas = resumen?.visitas;
    const productos = resumen?.resumenGeneral?.productos;

    const totalProductos = productos?.totalProductos;
    const totalPublicados = productos?.totalPublicados;
    const totalPausados = productos?.totalPausados;
    const totalEnLiquidacion = productos?.totalEnLiquidacion;

    const totalProductosTienda = productos?.totalProductosTienda;
    const totalPublicadosTienda = productos?.totalPublicadosTienda;
    const totalEnLiquidacionTienda = productos?.totalEnLiquidacionTienda;
    const totalPausadosTienda = productos?.totalPausadosTienda;

    const totalProductosParticular = productos?.totalProductosParticular;
    const totalPublicadosParticular = productos?.totalPublicadosParticular;
    const totalEnLiquidacionParticular = productos?.totalEnLiquidacionParticular;
    const totalPausadosParticular = productos?.totalPausadosParticular;

    const totalProductosEditadosParticular = productos?.totalProductosEditadosParticular;
    const totalProductosEditadosTienda = productos?.totalProductosEditadosTienda;
    const totalProductosEliminadosParticular = productos?.totalProductosEliminadosParticular;
    const totalProductosEliminadosTienda = productos?.totalProductosEliminadosTienda;

    const usuarios = resumen?.resumenGeneral?.usuarios;

    const totalUsuarios = usuarios?.totalUsuarios;
    const totalVerificados = usuarios?.totalVerificados;
    const totalParticulares = usuarios?.totalParticulares;
    const totalTiendas = usuarios?.totalTiendas;
    const totalPremium = usuarios?.totalPremium;
    const tiendasVerificadas = usuarios?.tiendasVerificadas;
    const totalPromedioTiendas = usuarios?.totalPromedioTiendas;
    const totalIntFacebook = usuarios?.totalIntFacebook; 
    const totalIntInstagram = usuarios?.totalIntInstagram;
    const totalIntWhatsapp = usuarios?.totalIntWhatsapp;
    const totalIntWeb = usuarios?.totalIntWeb;
    const totalInteracciones = totalIntFacebook + totalIntInstagram + totalIntWeb + totalIntWhatsapp;
    const comentarios = resumen?.resumenGeneral?.comentarios;

    const totalComentarios = comentarios?.totalComentarios;
    const totalRespuestas = comentarios?.totalRespondidos;

    const publicidades = resumen?.resumenGeneral?.publicidades;

    const totalImpAdsCard = publicidades?.totalImpAdsCard;
    const totalImpAdsBanner = publicidades?.totalImpAdsBanner;
    const totalClicksAdsCard = publicidades?.totalClicksAdsCard;
    const totalClicksAdsBanner = publicidades?.totalClicksAdsBanner;

    const tiendasActivas = resumen?.resumenGeneral?.usuarios?.tiendasActivas;
    const particularesActivos = resumen?.resumenGeneral?.usuarios?.particularesActivos;

  return (
    <main className="main-content">
      <section className="resumen-general">
        <h2>General U.S7</h2>
        <div className="resumen-cards">
          <div className="card"><FaEye /> <p>Visitas U.S7<br /><strong>{visitasUS7}</strong></p></div>
          <div className="card"><FaFileAlt /> <p>Publicaciones Nuevas<br /><strong>{prodsUS7}</strong></p></div>
          <div className="card"><FaSearch /> <p>Búsquedas Realizadas<br /><strong>{busquedasUS7}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaCheck /><FaFileAlt /></div> <p>Registros<br /><strong>{tiendasUS7 + particularUS7}</strong></p></div>
          <div className="card"><FaStore /> <p>Tiendas<br /><strong>{tiendasUS7}</strong></p></div>
          <div className="card"><FaUser /> <p>Particulares<br /><strong>{particularUS7}</strong></p></div>
        </div>
        <h2>Informacion General</h2>
        <div className="resumen-cards">
          <div className="card"><FaEye /> <p>Visitas Generales<br /><strong>{visitas?.visitasCotienda}</strong></p></div>
          <div className="card"><FaSearch /> <p>Búsquedas Realizadas<br /><strong>{busquedas}</strong></p></div>
          <div className="card"><FaFileAlt /> <p>Publicaciones Totales<br /><strong>{totalProductos}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaCheck /><FaFileAlt /></div><p>Publicaciones Activas<br /><strong>{totalPublicados}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaPause /><FaFileAlt /></div><p>Publicaciones Pausadas<br /><strong>{totalPausados}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaFire /><FaFileAlt /></div><p>Publicaciones En Liquidacion<br /><strong>{totalEnLiquidacion}</strong></p></div>
          <div className="card"><FaUser /> <p>Usuarios Registrados<br /><strong>{totalUsuarios}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaCheck /><FaUser /></div> <p>Usuarios Verificados<br /><strong>{totalVerificados}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaTimes /><FaUser /></div> <p>Usuarios No Verificados<br /><strong>{totalUsuarios - totalVerificados}</strong></p></div>  
        </div>
        <h2>Tiendas</h2>
        <div className="resumen-cards">
          <div className="card"><FaStore /> <p>Tiendas<br /><strong>{totalTiendas}</strong></p></div>
          <div className="card"><FaStore /> <p>Tiendas Verificadas<br /><strong>{tiendasVerificadas}</strong></p></div>
          <div className="card"><FaStore /> <p>Tiendas No Verificadas<br /><strong>{totalTiendas - tiendasVerificadas}</strong></p></div>
          <div className="card"><FaStore /> <p>Tiendas Activas<br /><strong>{tiendasActivas}</strong></p></div>
          <div className="card"><FaMoneyBillWave /> <p>Tiendas Premium<br /><strong>{totalPremium}</strong></p></div>
          <div className="card"><FaRocket /> <p>Productos Destacados<br /><strong>XX</strong></p></div>
          <div className="card"><FaBox /> <p>Productos Totales<br /><strong>{totalProductosTienda}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaCheck /><FaBox /></div><p>Productos Publicados<br /><strong>{totalPublicadosTienda}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaPause /><FaBox /></div><p>Productos Pausados<br /><strong>{totalPausadosTienda}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaFire /><FaBox /></div><p>Productos en Liquidacion<br /><strong>{totalEnLiquidacionTienda}</strong></p></div>
          <div className="card"><FaComments /> <p>Comentarios Totales<br /><strong>{totalComentarios}</strong></p></div>
          <div className="card"><FaComments /> <p>Respuestas Totales<br /><strong>{totalRespuestas}</strong></p></div>
          <div className="card"><FaChartLine /> <p>Total de Interacciones<br /><strong>{totalInteracciones}</strong></p></div>
          <div className="card"><FaWhatsapp /> <p>Interacciones WhatsApp<br /><strong>{totalIntWhatsapp}</strong></p></div>
          <div className="card"><FaFacebook /> <p>Interacciones Facebook<br /><strong>{totalIntFacebook}</strong></p></div>
          <div className="card"><FaInstagram /> <p>Interacciones Instagram<br /><strong>{totalIntInstagram}</strong></p></div>
          <div className="card"><FaGlobe /> <p>Interacciones Web<br /><strong>{totalIntWeb}</strong></p></div>          
          <div className="card"><FaStar /> <p>Promedio de Calificaciones<br /><strong>{totalPromedioTiendas}★</strong></p></div>
          <div className="card"><FaEdit /> <p>Publicaciones Editadas<br /><strong>{totalProductosEditadosTienda}</strong></p></div>
          <div className="card"><FaTrash /> <p>Publicaciones Eliminadas<br /><strong>{totalProductosEliminadosTienda}</strong></p></div>
        </div>
        <h2>Particulares</h2>
        <div className="resumen-cards">
          <div className="card"><FaUser /> <p>Particulares<br /><strong>{totalParticulares}</strong></p></div>
          <div className="card"><FaUser /> <p>Particulares Activos<br /><strong>{particularesActivos}</strong></p></div>
          <div className="card"><FaBox /> <p>Productos Totales<br /><strong>{totalProductosParticular}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaCheck /><FaBox /></div> <p>Productos Publicados<br /><strong>{totalPublicadosParticular}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaPause /><FaBox /></div> <p>Productos Pausados<br /><strong>{totalPausadosParticular}</strong></p></div>
          <div className="card"><div style={{display:'flex'}}><FaFire /><FaBox /></div> <p>Productos en Liquidacion<br /><strong>{totalEnLiquidacionParticular}</strong></p></div>
          <div className="card"><FaRocket /> <p>Productos Destacados<br /><strong>XX</strong></p></div>
          <div className="card"><FaChartLine /> <p>Ratio de Contacto<br /><strong>8.4%</strong></p></div>
          <div className="card"><FaEdit /> <p>Publicaciones Editadas<br /><strong>{totalProductosEditadosParticular}</strong></p></div>
          <div className="card"><FaTrash /> <p>Publicaciones Eliminadas<br /><strong>{totalProductosEliminadosParticular}</strong></p></div>
        </div>
        <h2>Ads</h2>
        <div className="resumen-cards">
          <div className="card"><FaChartBar /> <p>Impresiones de Ads Card<br /><strong>{totalImpAdsCard}</strong></p></div>
          <div className="card"><FaChartBar /> <p>Impresiones de Ads Banner<br /><strong>{totalImpAdsBanner}</strong></p></div>
          <div className="card"><FaChartBar /> <p>Impresiones en Ads Totales<br /><strong>{totalImpAdsCard + totalImpAdsBanner}</strong></p></div>
          <div className="card"><FaChartBar /> <p>Clicks de Ads Card<br /><strong>{totalClicksAdsCard}</strong></p></div>
          <div className="card"><FaChartBar /> <p>Clicks de Ads Banner<br /><strong>{totalClicksAdsBanner}</strong></p></div>
          <div className="card"><FaChartBar /> <p>Clicks en Ads Totales<br /><strong>{totalClicksAdsCard + totalClicksAdsBanner}</strong></p></div>
        </div>


        <div className="actividad">
          <h3>Actividad</h3>
          <div className="grafico-fake">📈 Gráfico simulado (visitas/interacciones últimos 30 días)</div>
        </div>

        <div className="seccion-secundaria">
          <h3>Indicadores Clave</h3>
          <ul className="indicadores">
            <li><FaClipboardCheck /> Tasa de respuesta de tiendas: <strong>89%</strong></li>
            <li><FaComments /> Comentarios pendientes de respuesta: <strong>118</strong></li>
            <li><FaStore /> Tiendas nuevas esta semana: <strong>41</strong></li>
            <li><FaGlobe /> Regiones más activas: <strong>Buenos Aires, Córdoba, Mendoza</strong></li>
            <li><FaClock /> Tiempo promedio de publicación: <strong>4 min</strong></li>
            <li><FaRegFlag /> Productos denunciados esta semana: <strong>26</strong></li>
            <li><FaThumbsUp /> Recomendaciones generadas: <strong>391</strong></li>
            <li><FaUser /> Usuarios activos hoy: <strong>523</strong></li>
            <li><FaStore /> Tiendas premium activas: <strong>133</strong></li>
            <li><FaBullseye /> Clics hacia WhatsApp: <strong>6.532</strong></li>
            <li><FaFilter /> Filtros más utilizados: <strong>Precio, Ubicación</strong></li>
            <li><FaCamera /> Publicaciones con imágenes: <strong>12.140</strong></li>
            <li><FaCheckCircle /> Usuarios verificados con DNI: <strong>732</strong></li>
          </ul>
        </div>

        <div className="alertas">
          <h3>Alertas Recientes</h3>
          <ul>
            <li><FaExclamationCircle className="rojo" /> Queja de cliente pendiente de revisión <span>Hace 2 horas</span></li>
            <li><FaExclamationTriangle className="amarillo" /> Problema con el pago de una tienda <span>Hace 5 horas</span></li>
            <li><FaExclamationCircle className="rojo" /> Reporte de fraude en una transacción <span>Hace 1 día</span></li>
            <li><FaExclamationTriangle className="amarillo" /> Producto denunciado por contenido ofensivo <span>Hace 3 días</span></li>
            <li><FaExclamationCircle className="rojo" /> Reporte duplicado de tienda <span>Hace 4 días</span></li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default InicioDashboard;
