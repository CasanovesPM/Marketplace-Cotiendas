import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc,db, deleteField, storageRef,setDoc, uploadBytes, getDownloadURL,storage  } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import './users.css';



const SolicitudVerificacion = ({cargarSolicitudesVerificacion}) => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [uidsExtendidos, setUidsExtendidos] = useState({});

  const cargarTiendasConSolicitud = async () => {
    const snapshot = await getDocs(collection(db, 'usuarios'));
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const tiendasConSolicitud = lista.filter(
      u => u.tipo === 'tienda' && u.solicitudVerify === true
    );
    setUsuarios(tiendasConSolicitud);
  };

  useEffect(() => {
    cargarTiendasConSolicitud();
  }, []);

const MySwal = withReactContent(Swal);

const verificarTienda = async (usuario) => {
  const { value: formValues } = await MySwal.fire({
    title: 'Cargar verificación',
    html: `
  <div style="text-align: left; font-size: 14px;">
    <label style="font-weight: bold;">📷 DNI Frente</label><br/>
    <input id="dniFrente" type="file" accept="image/*" class="swal2-file-input" style="margin-bottom: 12px; width: 100%;" />

    <label style="font-weight: bold;">📷 DNI Dorso</label><br/>
    <input id="dniDorso" type="file" accept="image/*" class="swal2-file-input" style="margin-bottom: 12px; width: 100%;" />

    <label style="font-weight: bold;">🏢 Razón Social</label><br/>
    <input id="razonSocial" type="text" class="swal2-input" style="margin-bottom: 12px;" placeholder="Ej: Ferretería HogarFix SRL" />

    <label style="font-weight: bold;">🔢 CUIT</label><br/>
    <input id="cuit" type="text" class="swal2-input" style="margin-bottom: 12px;" placeholder="Ej: 30-12345678-9" />

    <label style="font-weight: bold;">🏪 Fotos del Local</label><br/>
    <input id="fotosLocal" type="file" accept="image/*" multiple class="swal2-file-input" style="margin-bottom: 12px; width: 100%;" />

    <label style="font-weight: bold;">📄 Contrato firmado (PDF)</label><br/>
    <input id="contrato" type="file" accept="application/pdf" class="swal2-file-input" style="margin-bottom: 12px; width: 100%;" />

    <label style="font-weight: bold;">🎥 Video mostrando el DNI</label><br/>
    <input id="videoDni" type="file" accept="video/*" class="swal2-file-input" style="margin-bottom: 12px; width: 100%;" />
    <div id="progressBarContainer" style="width: 100%; background: #ddd; height: 10px; border-radius: 6px; margin-top: 20px; display: none;">
  <div id="progressBar" style="width: 0%; height: 100%; background: #4caf50; border-radius: 6px; transition: width 0.3s;"></div>
</div>
    </div>
`,

    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Subir y verificar',
    preConfirm: async () => {
      const dniFrente = document.getElementById('dniFrente').files[0];
      const dniDorso = document.getElementById('dniDorso').files[0];
      const razonSocial = document.getElementById('razonSocial').value;
      const cuit = document.getElementById('cuit').value;
      const fotosLocal = document.getElementById('fotosLocal').files;
      const contrato = document.getElementById('contrato').files[0];
      const videoDni = document.getElementById('videoDni').files[0];
        const totalArchivos = 2 + 1 + 1 + fotosLocal.length + 1; // dniFrente, dniDorso, contrato, video, fotos
        let indice = 0;

      const actualizarBarra = (porcentaje) => {
        const container = document.getElementById('progressBarContainer');
        const bar = document.getElementById('progressBar');
        if (container && bar) {
            container.style.display = 'block';
            bar.style.width = `${porcentaje}%`;
        }
        };

      if (!dniFrente || !dniDorso || !razonSocial || !cuit || !contrato || !videoDni) {
        Swal.showValidationMessage('Todos los campos obligatorios deben estar completos');
        return;
      }

      const storageBasePath = `usuarios/${usuario.id}/verificacion`;

      const subirArchivo = async (archivo, nombre, indice = 0, total = 1) => {
        const archivoRef = storageRef(storage, `${storageBasePath}/${nombre}`);
        await uploadBytes(archivoRef, archivo);
        const progreso = Math.round(((indice + 1) / total) * 100);
         actualizarBarra(progreso);

        return await getDownloadURL(archivoRef);
      };

        const urls = {
        dniFrente: await subirArchivo(dniFrente, 'dniFrente.jpg', indice++, totalArchivos),
        dniDorso: await subirArchivo(dniDorso, 'dniDorso.jpg', indice++, totalArchivos),
        razonSocial,
        cuit,
        contratoUrl: await subirArchivo(contrato, 'contrato.pdf', indice++, totalArchivos),
        videoUrl: await subirArchivo(videoDni, 'video.mp4', indice++, totalArchivos),
        fotosLocal: []
        };


        for (let i = 0; i < fotosLocal.length && i < 4; i++) {
        const url = await subirArchivo(fotosLocal[i], `fotoLocal-${i + 1}.jpg`, indice++, totalArchivos);
        urls.fotosLocal.push(url);
        }

      return urls;
    }
  });

  if (!formValues) return;

  try {
    // Guardar en subcolección
    await setDoc(doc(db, `usuarios/${usuario.id}/datosVerificacion/info`), formValues);

    // Actualizar usuario como verificado y eliminar campos de solicitud
    await updateDoc(doc(db, 'usuarios', usuario.id), {
      verificada: true,
      solicitudVerify: deleteField(),
      verifyCode: deleteField()
    });
    cargarTiendasConSolicitud();
    cargarSolicitudesVerificacion();
    await Swal.fire('✅ Verificación completa', 'Tienda verificada correctamente.', 'success');
  } catch (error) {
    console.error(error);
    Swal.fire('❌ Error', error.message, 'error');
  }
};

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

  return (
    <section className="usuarios-section">
      <h2>Solicitudes de Verificación</h2>

      <div className="tabla-usuarios">
        <p>Se han encontrado {usuarios.length} tiendas con solicitud</p>
        <table>
          <thead>
            <tr>
              <th>UID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Verificada</th>
              <th>Creada</th>
              <th>Código Verificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => {
              const uid = extraerUID(usuario.id);
              const mostrarUID = uidsExtendidos[usuario.id]
                ? uid
                : uid.substring(0, 10) + (uid.length > 10 ? '...' : '');

              const numeroWhatsapp = usuario.telefono?.replace(/\D/g, '');

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
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {usuario.verifyCode || '-'}
                  </td>
                  <td>
                    <a
                      href={`https://wa.me/54${numeroWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="accion verde"
                      title="Contactar por WhatsApp"
                    >
                          <i
      className="fab fa-whatsapp"

    ></i>
                    </a>
                    <a
                      href={`/tienda/${usuario.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="accion gris"
                      title="Ver tienda"
                    >
                      👁
                    </a>
                    {!usuario.verificada && (
                      <button
                        className="accion azul"
                        onClick={() => verificarTienda(usuario)}
                        title="Verificar Tienda"
                      >
                        ✅
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SolicitudVerificacion;
