// Reportes.js
import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, doc, getDoc, query, where, updateDoc } from '../../firebaseConfig';
import { FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './reportes.css';

const MySwal = withReactContent(Swal);

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
const [orden, setOrden] = useState({ campo: 'fecha', asc: false });

  const obtenerReportes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'reportes'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReportes(data);
      calcularEstadisticas(data);

    } catch (error) {
      console.error('Error al obtener reportes:', error);
    }
  };

  const calcularEstadisticas = (datos) => {
  const totales = datos.length;
  const revisados = datos.filter(r => r.revisado).length;
  const pendientes = totales - revisados;

  const productos = {};
  const tiendas = {};
  let tipoTienda = 0;
  let tipoParticular = 0;

  datos.forEach(r => {
    if (r.tipo === 'producto') {
      productos[r.descripcionElemento] = (productos[r.descripcionElemento] || 0) + 1;
    } else if (r.tipo === 'tienda') {
      tiendas[r.descripcionElemento] = (tiendas[r.descripcionElemento] || 0) + 1;
    }

    if (r.tipoUsuario === 'tienda') tipoTienda++;
    if (r.tipoUsuario === 'particular') tipoParticular++;
  });

  const topProductos = Object.entries(productos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topTiendas = Object.entries(tiendas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  setStats({ totales, revisados, pendientes, topProductos, topTiendas, tipoTienda, tipoParticular });
};



  const [stats, setStats] = useState({
  totales: 0,
  revisados: 0,
  pendientes: 0,
  topProductos: [],
  topTiendas: [],
  tipoTienda: 0,
  tipoParticular: 0
});


  useEffect(() => {
    obtenerReportes();
  }, []);

  const abrirDetalle = async (reporte) => {
    let nombreDenunciante = 'Usuario desconocido';
    let nombreDenunciado = 'Usuario no identificado';
    let detallesExtra = '';

    try {
      const usuariosSnap = await getDocs(collection(db, 'usuarios'));
      let docDenunciante;
      let docDenunciado;
      for (const docu of usuariosSnap.docs) {
        const data = docu.data();
        if (data.uid === reporte.uidUsuario) docDenunciante = { id: docu.id, ...data };
        if (data.uid === reporte.uidElemento) docDenunciado = { id: docu.id, ...data };
      }

      if (docDenunciante) {
        nombreDenunciante = docDenunciante.nombreTienda || docDenunciante.nombreResp || 'Sin nombre';
        detallesExtra = `<div id="detallesDenunciante" style="display: none; margin-top: 12px; font-size: 14px; padding: 10px; background: #f0f0f0; border-radius: 8px;">
          ${docDenunciante.tipo === 'tienda'
            ? `<div><strong>Nombre Responsable:</strong> ${docDenunciante.nombreResp}</div>
               <div><strong>Apellido Responsable:</strong> ${docDenunciante.apellidoResp}</div>
               <div><strong>Tienda:</strong> <a href="/tienda/${docDenunciante.slug}-${docDenunciante.id}" target="_blank">Ver Tienda</a></div>`
            : `<div><strong>Nombre:</strong> ${docDenunciante.nombre}</div>
               <div><strong>Apellido:</strong> ${docDenunciante.apellido}</div>`}
        </div>`;
      }

      if (docDenunciado) {
        nombreDenunciado = docDenunciado.nombreTienda || docDenunciado.nombre || 'Sin nombre';
      }
    } catch (error) {
      console.warn('Error obteniendo nombres:', error.message);
    }

    MySwal.fire({
      title: `<div style="font-size: 20px; font-weight: 600; color: #333;">📄 Detalle de denuncia</div>`,
      html: `
        <div style="
          font-size: 15px;
          color: #444;
          line-height: 1.7;
          padding: 20px;
          border-radius: 10px;
          background: #f9f9f9;
          border: 1px solid #ddd;
          text-align: left;
        ">
          <div style="margin-bottom: 12px;"><strong>🔍 Tipo:</strong> ${reporte.tipo}</div>
          <div style="margin-bottom: 12px;"><strong>📛 Nombre/Título:</strong><br> ${reporte.descripcionElemento}</div>
          <div style="margin-bottom: 12px;"><strong>📆 Fecha:</strong> ${new Date(reporte.fecha).toLocaleString('es-AR')}</div>
          <div style="margin-bottom: 12px;"><strong>❗ Motivo:</strong>
            <div style="
              margin-top: 6px;
              padding: 12px;
              background: #fff;
              border-radius: 6px;
              border: 1px solid #ccc;
              color: #333;
            ">${reporte.motivo}</div>
          </div>
          <div style="margin-bottom: 12px;"><strong>👤 Usuario denunciante:</strong> ${nombreDenunciante} 
            <button onclick="const e=document.getElementById('detallesDenunciante'); e.style.display = e.style.display==='none' ? 'block' : 'none';" style="background:none; border:none; color:#007bff; cursor:pointer; font-size:14px;">⬇️ Ver Detalles</button>
            ${detallesExtra}
          </div>
          <div style="text-align: center;">
            <a href="/${reporte.tipo === 'producto' ? 'producto' : 'tienda'}/${reporte.idElemento}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                transition: background 0.3s ease;
              "
              onmouseover="this.style.backgroundColor='#0056b3'"
              onmouseout="this.style.backgroundColor='#007bff'"
            >
              🌐 Ver ${reporte.tipo === 'producto' ? 'Producto' : 'Tienda'}
            </a>
          </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#6c757d',
      width: 650,
      background: '#ffffff'
    });
  };

  const reportesOrdenados = [...reportes].sort((a, b) => {
  const campo = orden.campo;
  const asc = orden.asc ? 1 : -1;

  if (campo === 'fecha') {
    return asc * (new Date(a.fecha) - new Date(b.fecha));
  }

  const valorA = (a[campo] || '').toString().toLowerCase();
  const valorB = (b[campo] || '').toString().toLowerCase();

  if (valorA < valorB) return -1 * asc;
  if (valorA > valorB) return 1 * asc;
  return 0;
});


  return (
    <section className="reportes-section">
        <div className="estadisticas-panel">
  <div className="box">
    <h4>📊 Cantidad de Reclamos</h4>
    <table>
      <tbody>
        <tr><td>Totales:</td><td>{stats.totales}</td></tr>
        <tr><td>Revisados:</td><td>{stats.revisados}</td></tr>
        <tr><td>Pendientes:</td><td>{stats.pendientes}</td></tr>
      </tbody>
    </table>
  </div>

  <div className="box">
    <h4>📦 Top 10 Reclamos Productos</h4>
    <table>
      <thead><tr><th>Nombre</th><th>Cantidad</th></tr></thead>
      <tbody>
        {stats.topProductos.map(([nombre, cantidad], i) => (
          <tr key={i}><td>{nombre}</td><td>{cantidad}</td></tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="box">
    <h4>🏬 Top 10 Reclamos Tiendas</h4>
    <table>
      <thead><tr><th>Nombre</th><th>Cantidad</th></tr></thead>
      <tbody>
        {stats.topTiendas.map(([nombre, cantidad], i) => (
          <tr key={i}><td>{nombre}</td><td>{cantidad}</td></tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="box">
    <h4>👥 Reclamos por Tipo de Usuario</h4>
    <table>
      <tbody>
        <tr><td>Tienda:</td><td>{stats.tipoTienda}</td></tr>
        <tr><td>Particular:</td><td>{stats.tipoParticular}</td></tr>
      </tbody>
    </table>
  </div>
</div>

      <h2>📢 Denuncias</h2>
      <div className="tabla-reportes">
        <table>
<thead>
  <tr>
    <th onClick={() => setOrden({ campo: 'id', asc: !orden.asc })} style={{ cursor: 'pointer' }}>ID</th>
    <th onClick={() => setOrden({ campo: 'descripcionElemento', asc: !orden.asc })} style={{ cursor: 'pointer' }}>Nombre/Título</th>
    <th onClick={() => setOrden({ campo: 'tipo', asc: !orden.asc })} style={{ cursor: 'pointer' }}>Tipo</th>
    <th onClick={() => setOrden({ campo: 'revisado', asc: !orden.asc })} style={{ cursor: 'pointer' }}>Revisado</th>
    <th>Acciones</th>
  </tr>
</thead>
          <tbody>
{reportesOrdenados.map((r) => (
              <tr key={r.id}>
                <td>{r.id.split('_').slice(1).join('_')}</td>
                <td>{r.descripcionElemento}</td>
                <td style={{ textTransform: 'capitalize' }}>{r.tipo}</td>
                <td>
                  <span className={`estado-tag ${r.revisado ? 'revisado' : 'no-revisado'}`}>
                    {r.revisado ? 'Revisado' : 'Pendiente'}
                  </span>
                </td>
                <td>
                  <button className="accion" onClick={() => abrirDetalle(r)} title="Ver detalle">
                    <FaEye />
                  </button>
{r.revisado ? (
  <button
    className="accion"
    title="Marcar como pendiente"
    onClick={async () => {
      const confirmacion = await MySwal.fire({
        title: '¿Volver a pendiente?',
        text: 'El reporte volverá al estado "Pendiente".',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, volver',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
      });

      if (confirmacion.isConfirmed) {
        try {
          await updateDoc(doc(db, 'reportes', r.id), { revisado: false });
          obtenerReportes();
          MySwal.fire('Actualizado', 'El reporte fue marcado como pendiente.', 'success');
        } catch (error) {
          console.error('Error al actualizar:', error);
          MySwal.fire('Error', 'No se pudo actualizar el reporte.', 'error');
        }
      }
    }}
  >
    ❌
  </button>
) : (
  <button
    className="accion"
    title="Marcar como revisado"
    onClick={async () => {
      const confirmacion = await MySwal.fire({
        title: '¿Marcar como revisado?',
        text: 'Esta acción cambiará el estado del reporte a "Revisado".',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, marcar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33'
      });

      if (confirmacion.isConfirmed) {
        try {
          await updateDoc(doc(db, 'reportes', r.id), { revisado: true });
          obtenerReportes();
          MySwal.fire('Actualizado', 'El reporte ha sido marcado como revisado.', 'success');
        } catch (error) {
          console.error('Error al actualizar:', error);
          MySwal.fire('Error', 'No se pudo actualizar el reporte.', 'error');
        }
      }
    }}
  >
    ✅
  </button>
)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Reportes;