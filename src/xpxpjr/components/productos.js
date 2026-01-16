// Productos.js (estilo igual a SolicitudVerificacion)
import React, { useState, useMemo } from 'react';
import './productos.css';
import { FaEdit, FaToggleOn, FaToggleOff, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PublicarProducto from '../../components/PublicarProducto';
import Swal from 'sweetalert2';
import { db, doc, updateDoc } from '../../firebaseConfig';

const Productos = ({ productos, obtenerProductos }) => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [ordenPrecio, setOrdenPrecio] = useState('');
  const [mostrarModalEditarProducto, setMostrarModalEditarProducto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
const [ordenColumna, setOrdenColumna] = useState('');
const [direccionOrden, setDireccionOrden] = useState('asc');
  const handlePausar = async (producto) => {
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
        obtenerProductos();
        Swal.fire(`Producto ${nuevoEstado}`, '', 'success');
      } catch (error) {
        console.error('Error al pausar/despausar:', error);
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const handleAbrirModalEditarProducto = (producto) => {
    setProductoEnEdicion(producto);
    setMostrarModalEditarProducto(true);
  };

  const handleCerrarModalEditarProducto = () => {
    setProductoEnEdicion(null);
    setMostrarModalEditarProducto(false);
  };

  const categorias = useMemo(() => {
    const set = new Set(productos.map(p => p.categoria || 'Sin categoría'));
    return [...set];
  }, [productos]);

const productosFiltrados = useMemo(() => {
  let filtrados = [...productos];

  if (busqueda.trim()) {
    filtrados = filtrados.filter(p =>
      (p.titulo || '').toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  if (categoriaFiltro) {
    filtrados = filtrados.filter(p => (p.categoria || 'Sin categoría') === categoriaFiltro);
  }

  if (ordenColumna) {
    filtrados.sort((a, b) => {
      let aVal = a[ordenColumna] || '';
      let bVal = b[ordenColumna] || '';

      if (ordenColumna === 'fecha') {
        aVal = a.fecha?.toDate?.() || new Date(0);
        bVal = b.fecha?.toDate?.() || new Date(0);
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return direccionOrden === 'asc' ? -1 : 1;
      if (aVal > bVal) return direccionOrden === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtrados;
}, [productos, busqueda, categoriaFiltro, ordenColumna, direccionOrden]);


  const ultimosProductos = [...productos]
    .filter(p => p.fecha?.toDate)
    .sort((a, b) => b.fecha.toDate() - a.fecha.toDate())
    .slice(0,30);


    const ordenarPorColumna = (columna) => {
  if (ordenColumna === columna) {
    setDireccionOrden(prev => prev === 'asc' ? 'desc' : 'asc');
  } else {
    setOrdenColumna(columna);
    setDireccionOrden('asc');
  }
};

  return (
    <section className="usuarios-section">


<div className="resumen-productos">
  <div className="tabla-resumen">
    <h4>🔝 Top Visitas</h4>
    <table>
      <thead>
        <tr>
          <th>Título</th>
          <th>Visitas</th>
        </tr>
      </thead>
      <tbody>
        {[...productos]
          .filter(p => p.visitas)
          .sort((a, b) => b.visitas - a.visitas)
          .slice(0, 10)
          .map(p => (
            <tr key={p.id}>
              <td>{p.titulo}</td>
              <td>{p.visitas}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>

  <div className="tabla-resumen">
    <h4>📦 Categorías</h4>
    <table>
      <thead>
        <tr>
          <th>Categoría</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        {categorias.map(cat => {
          const cantidad = productos.filter(p => (p.categoria || 'Sin categoría') === cat).length;
          return (
            <tr key={cat}>
              <td>{cat}</td>
              <td>{cantidad}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  <div className="tabla-resumen">
    <h4>📊 Totales</h4>
    <table>
      <tbody>
        <tr>
          <td>Productos:</td>
          <td>{productos.length}</td>
        </tr>
        <tr>
          <td>Pausados:</td>
          <td>{productos.filter(p => p.estado === 'pausado').length}</td>
        </tr>
        <tr>
          <td>En liquidación:</td>
          <td>{productos.filter(p => p.liquidacion === true).length}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
            <div className="tabla-usuarios">
        <p>Últimos 30 productos agregados. </p>
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ultimosProductos.map(producto => (
              <tr key={producto.id} title={producto.titulo}>
                <td>
                  <img
                    src={producto.imagenes?.[0] || 'https://via.placeholder.com/200'}
                    alt={producto.titulo}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                </td>
                <td>{producto.titulo}</td>
                <td>${producto.precio}</td>
                 <td>{producto.categoria}</td>
                <td>{producto.fecha?.toDate ? producto.fecha.toDate().toLocaleDateString('es-AR') : '-'}</td>
                                <td className="acciones">
                  <button
                    className="accion azul"
                    onClick={() => handleAbrirModalEditarProducto(p)}
                    title="Editar producto"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="accion naranja"
                    onClick={() => handlePausar(p)}
                    title={producto.estado === 'pausado' ? 'Despausar' : 'Pausar'}
                  >
                    {producto.estado === 'pausado' ? '▶️' : '⏸️'}
                  </button>
                  <a
                    href={`/producto/${producto.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="accion verde"
                    title="Ver publicación"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <h2>Listado de Todos los Productos</h2>


      <div className="filtros">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={ordenPrecio} onChange={(e) => setOrdenPrecio(e.target.value)}>
          <option value="">Ordenar por precio</option>
          <option value="asc">Menor a Mayor</option>
          <option value="desc">Mayor a Menor</option>
        </select>
      </div>

      <div className="tabla-usuarios">
        <p>Se han encontrado {productosFiltrados.length} productos</p>
        <table>
          <thead>
            <tr>
              <th onClick={() => ordenarPorColumna('id')}>
                ID {ordenColumna === 'id' ? (direccionOrden === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => ordenarPorColumna('titulo')}>
                Título {ordenColumna === 'titulo' ? (direccionOrden === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => ordenarPorColumna('precio')}>
                Precio {ordenColumna === 'precio' ? (direccionOrden === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => ordenarPorColumna('categoria')}>
                Categoría {ordenColumna === 'categoria' ? (direccionOrden === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => ordenarPorColumna('visitas')}>
                Visitas {ordenColumna === 'visitas' ? (direccionOrden === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => ordenarPorColumna('fecha')}>
                Creación {ordenColumna === 'fecha' ? (direccionOrden === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.titulo}</td>
                <td>${p.precio}</td>
                <td>{p.categoria || 'Sin categoría'}</td>
                <td>{p.visitas || 0}</td>
                <td>{p.fecha?.toDate ? p.fecha.toDate().toLocaleDateString('es-AR') : '-'}</td>
                <td className="acciones">
                  <button
                    className="accion azul"
                    onClick={() => handleAbrirModalEditarProducto(p)}
                    title="Editar producto"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="accion naranja"
                    onClick={() => handlePausar(p)}
                    title={p.estado === 'pausado' ? 'Despausar' : 'Pausar'}
                  >
                    {p.estado === 'pausado' ? '▶️' : '⏸️'}
                  </button>
                  <a
                    href={`/producto/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="accion verde"
                    title="Ver publicación"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </section>
  );
};

export default Productos;