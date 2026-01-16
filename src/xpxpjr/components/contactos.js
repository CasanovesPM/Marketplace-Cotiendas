// Contacto.js
import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, doc, updateDoc } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './reportes.css';

const MySwal = withReactContent(Swal);

const Contacto = () => {
  const [mensajes, setMensajes] = useState([]);
  const [orden, setOrden] = useState({ campo: 'fecha', asc: false });
  const [stats, setStats] = useState({ total: 0, revisados: 0, pendientes: 0 });

  const obtenerMensajes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'contactos'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMensajes(data);

      const revisados = data.filter(m => m.revisado).length;
      const pendientes = data.length - revisados;
      setStats({ total: data.length, revisados, pendientes });
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    }
  };

  useEffect(() => {
    obtenerMensajes();
  }, []);

  const mensajesOrdenados = [...mensajes].sort((a, b) => {
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


      <h2>📥 Mensajes de Contactos</h2>
      <h4>Mensajes: {stats.total} - Revisados: {stats.revisados} - Pendientes: {stats.pendientes} </h4>
      <div className="tabla-reportes">
        <table>
          <thead>
            <tr>
              <th onClick={() => setOrden({ campo: 'nombre', asc: !orden.asc })} style={{ cursor: 'pointer' }}>Nombre</th>
              <th onClick={() => setOrden({ campo: 'email', asc: !orden.asc })} style={{ cursor: 'pointer' }}>Email</th>
              <th>Mensaje</th>
              <th onClick={() => setOrden({ campo: 'fecha', asc: !orden.asc })} style={{ cursor: 'pointer' }}>Fecha</th>
              <th onClick={() => setOrden({ campo: 'revisado', asc: !orden.asc })} style={{ cursor: 'pointer' }}>Revisado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mensajesOrdenados.map((m) => (
              <tr key={m.id}>
                <td>{m.nombre}</td>
                <td>{m.email}</td>
                <td>{m.mensaje}</td>
                <td>{new Date(m.fecha).toLocaleString('es-AR')}</td>
                <td>
                  <span className={`estado-tag ${m.revisado ? 'revisado' : 'no-revisado'}`}>
                    {m.revisado ? 'Revisado' : 'Pendiente'}
                  </span>
                </td>
                <td>
                  {m.revisado ? (
                    <button
                      className="accion"
                      title="Marcar como pendiente"
                      onClick={async () => {
                        const confirmacion = await MySwal.fire({
                          title: '¿Volver a pendiente?',
                          text: 'El mensaje volverá al estado "Pendiente".',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonText: 'Sí, volver',
                          cancelButtonText: 'Cancelar',
                          confirmButtonColor: '#dc3545',
                          cancelButtonColor: '#6c757d'
                        });

                        if (confirmacion.isConfirmed) {
                          try {
                            await updateDoc(doc(db, 'contactos', m.id), { revisado: false });
                            obtenerMensajes();
                            MySwal.fire('Actualizado', 'El mensaje fue marcado como pendiente.', 'success');
                          } catch (error) {
                            console.error('Error al actualizar:', error);
                            MySwal.fire('Error', 'No se pudo actualizar el mensaje.', 'error');
                          }
                        }
                      }}
                    >❌</button>
                  ) : (
                    <button
                      className="accion"
                      title="Marcar como revisado"
                      onClick={async () => {
                        const confirmacion = await MySwal.fire({
                          title: '¿Marcar como revisado?',
                          text: 'Esta acción cambiará el estado del mensaje a "Revisado".',
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonText: 'Sí, marcar',
                          cancelButtonText: 'Cancelar',
                          confirmButtonColor: '#28a745',
                          cancelButtonColor: '#d33'
                        });

                        if (confirmacion.isConfirmed) {
                          try {
                            await updateDoc(doc(db, 'contactos', m.id), { revisado: true });
                            obtenerMensajes();
                            MySwal.fire('Actualizado', 'El mensaje ha sido marcado como revisado.', 'success');
                          } catch (error) {
                            console.error('Error al actualizar:', error);
                            MySwal.fire('Error', 'No se pudo actualizar el mensaje.', 'error');
                          }
                        }
                      }}
                    >✅</button>
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

export default Contacto;
