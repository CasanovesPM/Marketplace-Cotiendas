import React, { useState, useMemo, useEffect  } from 'react';
import './users.css';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {  db,doc, updateDoc } from '../../firebaseConfig';


const provincias = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
  "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
  "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego",
  "Tucumán", "Ciudad Autónoma de Buenos Aires"
];


const UsuariosPanel = ({ usuarios, cargarUsuarios }) => {





  const navigate = useNavigate();
const [mostrarModalEditarInfo, setMostrarModalEditarInfo] = useState(false);
const [formInfo, setFormInfo] = useState({});
const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [uidsExtendidos, setUidsExtendidos] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
const [eliminando, setEliminando] = useState(false);

  const toggleUID = (id) => {
    setUidsExtendidos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const extraerUID = (id) => id.substring(id.lastIndexOf('-') + 1);

  const formatearFecha = (fecha) => {
    if (!fecha || !fecha.toDate) return '-';
    const d = fecha.toDate();
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios
      .filter(u => u.tipo === 'tienda' || u.tipo === 'particular')
      .filter(u =>
        (filtroTipo === '' || u.tipo === filtroTipo) &&
        (filtroEstado === '' ||
          (filtroEstado === 'verificado' && u.verificada) ||
          (filtroEstado === 'no-verificado' && !u.verificada)) &&
        (
          (u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.nombreTienda?.toLowerCase().includes(busqueda.toLowerCase()))
        )
      );
  }, [usuarios, filtroTipo, filtroEstado, busqueda]);

  const ultimasTiendas = useMemo(() => {
  return usuarios
    .filter(u => u.tipo === 'tienda' && u.fechaRegistro?.toDate)
    .sort((a, b) => b.fechaRegistro.toDate() - a.fechaRegistro.toDate())
    .slice(0, 10);
}, [usuarios]);

  const exportarExcel = () => {
    const data = usuariosFiltrados.map(u => ({
      UID: extraerUID(u.id),
      Nombre: u.tipo === 'tienda' ? u.nombreTienda : `${u.nombre} ${u.apellido}`,
      Tipo: u.tipo,
      Estado: u.tipo === 'tienda' ? (u.verificada ? '✅ Verificada' : '❌ No Verificada') : '-',
      FechaRegistro: formatearFecha(u.fechaRegistro)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    XLSX.writeFile(wb, "usuarios-cotiendas.xlsx");
  };

const toggleActivo = async (usuario) => {
  const nuevoEstado = !usuario.activo;

  const confirm = await Swal.fire({
    title: `${nuevoEstado ? '¿Activar' : '¿Desactivar'} esta cuenta?`,
    text: `La cuenta ${usuario.nombreTienda || usuario.nombre} será ${nuevoEstado ? 'activada' : 'desactivada'}.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: nuevoEstado ? 'Activar' : 'Desactivar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  try {
    await updateDoc(doc(db, 'usuarios', usuario.id), {
      activo: nuevoEstado
    });

    Swal.fire(`✅ Cuenta ${nuevoEstado ? 'activada' : 'desactivada'}`, '', 'success');

    // Forzar actualización local (si tenés usuarios como prop fija, necesitás recargar desde padre)
    usuario.activo = nuevoEstado;
    setBusqueda(''); // Triggerea re-render
    toggleUID();
  } catch (error) {
    console.error('Error al cambiar estado activo:', error);
    Swal.fire('❌ Error', error.message, 'error');
  }
};

const handleEditarInfo = async () => {
  if (!usuarioSeleccionado) return;

  try {
    const docRef = doc(db, 'usuarios', usuarioSeleccionado.id);
    const dataToUpdate = {};

    // Comunes
    if (formInfo.telefono) dataToUpdate.telefono = formInfo.telefono;
    if (formInfo.ciudad) dataToUpdate.ciudad = formInfo.ciudad;
    if (formInfo.provincia) dataToUpdate.provincia = formInfo.provincia;

    if (usuarioSeleccionado.tipo === 'tienda') {
      if (formInfo.nombreTienda) dataToUpdate.nombreTienda = formInfo.nombreTienda;
      if (formInfo.razonSocial) dataToUpdate.razonSocial = formInfo.razonSocial;
      if (formInfo.nombreResp) dataToUpdate.nombreResp = formInfo.nombreResp;
      if (formInfo.apellidoResp) dataToUpdate.apellidoResp = formInfo.apellidoResp;
      if (formInfo.cuit) dataToUpdate.cuit = formInfo.cuit;
      if (formInfo.direccion) dataToUpdate.direccion = formInfo.direccion;
      if (formInfo.logoUrl) dataToUpdate.logoUrl = formInfo.logoUrl;
      if (formInfo.dniFrente) dataToUpdate.dniFrente = formInfo.dniFrente;
      if (formInfo.dniDorso) dataToUpdate.dniDorso = formInfo.dniDorso;
    } else {
      if (formInfo.nombre) dataToUpdate.nombre = formInfo.nombre;
      if (formInfo.apellido) dataToUpdate.apellido = formInfo.apellido;
    }

    await updateDoc(docRef, dataToUpdate);

    // Omitimos updatePassword porque no podés modificarla desde el Admin (sin reautenticación)
    // A menos que estés logueado como ese usuario, no podés usar updatePassword()

    Swal.fire({
      title: 'Información actualizada',
      icon: 'success',
      customClass: {
        popup: 'custom-swal-popup-2'
      }
    });

    setMostrarModalEditarInfo(false);
    // 🔄 Actualizar usuarios desde el padre
    if (typeof cargarUsuarios === 'function') {
      await cargarUsuarios();
    }
        toggleUID();

  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      customClass: {
        popup: 'custom-swal-popup-2'
      }
    });
  }
};



  return (
    <section className="usuarios-section">

      <div className="resumen-usuarios">
  {/* 🔝 Top Visitas Tienda */}
  <div className="tabla-resumen">
    <h4>🔝 Top Visitas Tienda</h4>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Visitas</th>
          <th>Tipo</th>
        </tr>
      </thead>
      <tbody>
        {[...usuarios]
          .filter(u => u.tipo === 'tienda' && u.visitas)
          .sort((a, b) => b.visitas - a.visitas)
          .slice(0, 10)
          .map(u => (
            <tr key={u.id}>
              <td>{u.nombreTienda}</td>
              <td>{u.visitas}</td>
               <td>{u.tipoTienda}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>

  {/* 🏷 Tipos de Tienda */}
  <div className="tabla-resumen">
    <h4>🏷 Tipos de Tienda</h4>
    <table>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        {(() => {
          const tipos = {};
          usuarios.forEach(u => {
            if (u.tipo === 'tienda') {
              const tipo = u.tipoTienda || 'Sin tipo';
              tipos[tipo] = (tipos[tipo] || 0) + 1;
            }
          });
          return Object.entries(tipos).map(([tipo, cantidad]) => (
            <tr key={tipo}>
              <td>{tipo}</td>
              <td>{cantidad}</td>
            </tr>
          ));
        })()}
      </tbody>
    </table>
  </div>

  {/* 📊 Totales */}
  <div className="tabla-resumen">
    <h4>📊 Totales</h4>
    <table>
      <tbody>
        <tr>
          <td>Activos:</td>
          <td>{usuarios.filter(u => u.activo !== false).length}</td>
        </tr>
        <tr>
          <td>Desactivados:</td>
          <td>{usuarios.filter(u => u.activo === false).length}</td>
        </tr>
        <tr>
          <td>Premium:</td>
          <td>{usuarios.filter(u => u.premium === true).length}</td>
        </tr>
        <tr>
          <td>Verificadas:</td>
          <td>{usuarios.filter(u => u.verificada === true).length}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>



            <div className="tabla-usuarios">
  <h3>Últimos 10 Usuarios Registradas</h3>
  <table>
    <thead>
      <tr>
        <th>UID</th>
        <th>Nombre</th>
        <th>Tipo</th>
        <th>Estado</th>
        <th>Verificada</th>
        <th>Creada</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {ultimasTiendas.map(usuario => {
        const uid = extraerUID(usuario.id);
        const mostrarUID = uidsExtendidos[usuario.id]
          ? uid
          : uid.substring(0, 10) + (uid.length > 10 ? '...' : '');

        return (
          <tr key={usuario.id}>
            <td
              className="uid-col"
              onClick={() => toggleUID(usuario.id)}
              style={{ cursor: 'pointer', color: '#3498db' }}
              title="Click para expandir/ocultar UID"
            >
              {mostrarUID}
            </td>
            <td>{usuario.nombreTienda}</td>
            <td style={{ textTransform: 'uppercase' }}>{usuario.tipo}</td>
            <td>
              <span className={`estado-tag ${usuario.activo === false ? 'desactivada' : 'activada'}`}>
                {usuario.activo === false ? '🚫 Desactivada' : '✅ Activada'}
              </span>
            </td>
            <td>
              <span className={`estado-tag ${usuario.verificada ? 'verificada' : 'no-verificada'}`}>
                {usuario.verificada ? '✅ Verificada' : '❌ No Verificada'}
              </span>
            </td>
            <td>{formatearFecha(usuario.fechaRegistro)}</td>
            <td>
              <button
                className="accion gris"
                onClick={() => {
                  setUsuarioSeleccionado(usuario);
                  setFormInfo(usuario);
                  setMostrarModalEditarInfo(true);
                }}
                title="Editar Usuario"
              >
                📋
              </button>
              <a
                href={`/tienda/${usuario.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="accion gris"
                title="Ver tienda"
              >
                👁
              </a>
              <button
                className={`accion ${usuario.activo === false ? 'verde' : 'rojo'}`}
                onClick={() => toggleActivo(usuario)}
                title={usuario.activo === false ? 'Activar Cuenta' : 'Desactivar Cuenta'}
              >
                {usuario.activo === false ? '✔️' : '🛑'}
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


      <h2  style={{marginTop: '10px'}}>Todos los Usuarios</h2>

      <div className="busqueda-filtros full-width">
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Cualquier Tipo</option>
          <option value="tienda">Tienda</option>
          <option value="particular">Particular</option>
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Cualquier Estado</option>
          <option value="verificado">Verificado</option>
          <option value="no-verificado">No Verificado</option>
        </select>
        <button className="descargar" onClick={exportarExcel}>⬇️ Exportar</button>
      </div>

      <div className="tabla-usuarios">
        <p>Se han encontrado {usuariosFiltrados.length} resultados</p>
        <table>
          <thead>
            <tr>
              <th>UID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Verificada</th>
              <th>Creada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => {
              const uid = extraerUID(usuario.id);
              const mostrarUID = uidsExtendidos[usuario.id]
                ? uid
                : uid.substring(0, 10) + (uid.length > 10 ? '...' : '');

              return (
                <tr key={usuario.id}>
                  <td
                    className="uid-col"
                    onClick={() => toggleUID(usuario.id)}
                    style={{ cursor: 'pointer', color: '#3498db' }}
                    title="Click para expandir/ocultar UID"
                  >
                    {mostrarUID}
                  </td>
                  <td>
                    {usuario.tipo === 'tienda'
                      ? usuario.nombreTienda
                      : `${usuario.nombre} ${usuario.apellido}`}
                  </td>
                  <td style={{ textTransform: 'uppercase' }}>{usuario.tipo}</td>
                  <td>
                    <span className={`estado-tag ${usuario.activo === false ? 'desactivada' : 'activada'}`}>
                      {usuario.activo === false ? '🚫 Desactivada' : '✅ Activada'}
                    </span>
                  </td>
                  <td>
                    {usuario.tipo === 'particular' ? (
                      <span>-</span>
                    ) : (
                      <span
                        className={`estado-tag ${
                          usuario.verificada ? 'verificada' : 'no-verificada'
                        }`}
                      >
                        {usuario.verificada ? '✅ Verificada' : '❌ No Verificada'}
                      </span>
                    )}
                  </td>
                  <td>{formatearFecha(usuario.fechaRegistro)}</td>
                  <td>
                    <button
                      className="accion gris"
                      onClick={() => {
                        setUsuarioSeleccionado(usuario);
                        setFormInfo(usuario); // Clonamos los datos actuales
                        setMostrarModalEditarInfo(true);
                      }}
                      title="Editar Usuario"
                    >
                      📋
                    </button>
                    <a
                      href={`/tienda/${usuario.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="accion gris"
                      title="Ver tienda"
                    >
                      👁
                    </a>
                    <button
                      className={`accion ${usuario.activo === false ? 'verde' : 'rojo'}`}
                      onClick={() => toggleActivo(usuario)}
                      title={usuario.activo === false ? 'Activar Cuenta' : 'Desactivar Cuenta'}
                    >
                      {usuario.activo === false ? '✔️' : '🛑'}
                    </button>                
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>




{mostrarModalEditarInfo && (
  <div className="modal-overlayx ">
    <div className="modal-contentx modal-contentx-mobile">
      <h2>Editar Tienda</h2>

      {/* 🔥 Si es tienda */}
      {usuarioSeleccionado?.tipo === 'tienda' ? (
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

    </section>
  );
};

export default UsuariosPanel;
