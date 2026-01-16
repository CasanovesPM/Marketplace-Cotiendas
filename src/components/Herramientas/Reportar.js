import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  db,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  collection
} from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { auth } from '../../firebaseConfig'; // Asegurate de importar auth si usás Firebase Auth

const Reportar = ({ tipo, idElemento, descripcionElemento, uid }) => {

    const navigate = useNavigate();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleEnviarReporte = async () => {
    if (!motivo.trim()) {
      Swal.fire('Error', 'Debes ingresar un motivo para el reporte.', 'warning');
      return;
    }

    try {
      const user = auth.currentUser;
        if (!user) {
        Swal.fire('Debes iniciar sesión para reportar.', '', 'warning').then(() => {
            navigate('/login');
        });
        return;
        }

      const uidUsuario = user.uid;
      const reporteId = `${tipo}_${idElemento}_${uidUsuario}`;
      const reporteRef = doc(db, 'reportes', reporteId);

      const reporteSnap = await getDoc(reporteRef);
      if (reporteSnap.exists()) {
        Swal.fire('Ya has reportado este '+tipo+'.', '', 'info');
        setMostrarFormulario(false);
        return;
      }

      await setDoc(reporteRef, {
        tipo,
        idElemento,
        descripcionElemento: descripcionElemento || '',
        motivo,
        fecha: new Date().toISOString(),
        uidElemento: uid,
        uidUsuario
      });

      Swal.fire('Reporte enviado', 'Gracias por tu reporte.', 'success');
      setMotivo('');
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      Swal.fire('Error', 'No se pudo enviar el reporte.', 'error');
    }
  };

  const handleToggleFormulario = (e) => {
    e.preventDefault();
    setMostrarFormulario(!mostrarFormulario);
  };

  return (
    <div>
      <a onClick={handleToggleFormulario} className="btn-social reportar" href="#">
        Reportar ❌
      </a>

      {mostrarFormulario && (
        <div style={{ marginTop: '10px' }}>
          <textarea
            placeholder="Describe el motivo del reporte..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            style={{ width: '100%', minHeight: '60px', marginTop: '10px' }}
          />
          <br />
          <button onClick={handleEnviarReporte} className="btn-social" style={{ marginTop: '5px' }}>
            Enviar Reporte
          </button>
        </div>
      )}
    </div>
  );
};

export default Reportar;
