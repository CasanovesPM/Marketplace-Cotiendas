import React, { useEffect, useState } from "react";
import { db, auth, collection, getDocs } from "../../firebaseConfig";
import PagarMembresia from "./PagoMembresia";
import './DashboardPuntos.css';


const DashboardPuntos = ({onActualizar}) => {
  const [puntos, setPuntos] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [tienda, setTienda] = useState([]);



  useEffect(() => {
    const cargarPuntos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const usuariosSnap = await getDocs(collection(db, "usuarios"));
      usuariosSnap.forEach((docu) => {
        const data = docu.data();
        if (data.uid === user.uid) {
          setPuntos(data.puntos || 0);
          setHistorial(data.historialPuntos || []);
          setTienda(data.tipo);
        }
      });
    };

    cargarPuntos();
  }, []);

  useEffect(() => {
  refrescarPuntos();
}, []);

const refrescarPuntos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const usuariosSnap = await getDocs(collection(db, "usuarios"));
      usuariosSnap.forEach((docu) => {
        const data = docu.data();
        if (data.uid === user.uid) {
          setPuntos(data.puntos || 0);
          setHistorial(data.historialPuntos || []);
        }
      });
      onActualizar();
};

  return (

    <>
<div className="dashboard-puntos-container">
  <div className="dashboard-puntos-left">
    <h2>
      🪙 Tus <strong>Copoints</strong>:
      <span className="dashboard-puntos-puntos">{puntos}</span>
    </h2>

    <div>
      <h4>📜 Historial</h4>
      {historial.length === 0 ? (
        <p>No tenés movimientos aún.</p>
      ) : (
        <div className="dashboard-historial-container">
          {historial
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 50)
            .map((item, i) => (
              <div key={i} className="dashboard-historial-item">
                <strong className={String(item.puntos).startsWith('-') ? 'negativo' : 'positivo'}>
                  {String(item.puntos).startsWith('-') ? item.puntos : `+${item.puntos}`}
                </strong>{' '}
                Copoints — {item.motivo}
                <br />
                <small>{new Date(item.fecha).toLocaleString()}</small>
              </div>
            ))}
        </div>
      )}
    </div>
  </div>

  <div className="dashboard-puntos-right">
    <h4>🧩 ¿Cómo sumo Puntos?</h4>
    <ul>
      <li>Hacer una nueva publicación <strong>+10</strong></li>
      <li>Liquidar un producto <strong>+30</strong></li>
      <li>Compartir una publicación <strong>+5</strong></li>
      <li>Enviar un mensaje a un vendedor <strong>+1</strong></li>
      <li>Crear una tienda <strong>+100</strong></li>
      <li>Compartir una tienda <strong>+30</strong></li>
      <li>Calificar una tienda <strong>+50</strong></li>
    </ul>
    <p>
      Todos los puntos acumulados los podés canjear por servicios para mejorar el posicionamiento de tus productos. ¡Despegá ya! 🚀
    </p>
  </div>
</div>


{tienda === 'tienda' && (
  <div className="dashboard-puntos-pago">
    <PagarMembresia refrescarPuntos={refrescarPuntos} />
  </div>
)}

</>
  );
};

export default DashboardPuntos;
