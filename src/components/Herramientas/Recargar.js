import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { db, auth, collection, getDocs, doc, updateDoc, getDoc } from "../../firebaseConfig";
import './PagoMembresia.css';


const Recargar = ({ refrescarPuntos }) => {

  const [tiendaId, setTiendaId] = useState(null);


  useEffect(() => {
    const buscarTienda = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const usuariosSnap = await getDocs(collection(db, "usuarios"));

        for (const docUsuario of usuariosSnap.docs) {
          const data = docUsuario.data();

          if (data.uid === user.uid) {
            setTiendaId(docUsuario.id);

            break;
          }
        }
      } catch (error) {
        console.error("Error al buscar tienda:", error);
      }
    };

    buscarTienda();
  }, []);




  const handlePagar = async () => {
    try {
      const res = await fetch("https://us-central1-marketplace-6dc50.cloudfunctions.net/crearPreferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Recarga de Puntos", price: 5000 })
      });

      const data = await res.json();
      if (!data.id) {
        Swal.fire("Error", "No se recibió el ID de preferencia", "error");
        return;
      }

      const mp = new window.MercadoPago("APP_USR-6957f51d-603d-4c03-9fd6-d5aebdf57ff6");
      mp.checkout({ preference: { id: data.id }, autoOpen: true });

    } catch (error) {
      console.error("Error al iniciar pago:", error);
      Swal.fire("Error", "Ocurrió un error al generar el pago", "error");
    }
  };

const handlePagar1000 = async () => {
  const user = auth.currentUser;
  if (!user || !tiendaId) {
    Swal.fire("Error", "No se encontró tu tienda.", "error");
    return;
  }

  try {
    const ref = doc(db, "usuarios", tiendaId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      Swal.fire("Error", "No se encontró tu tienda.", "error");
      return;
    }

    const data = snap.data();
    const puntosActuales = data.puntos || 0;
    const historialActual = data.historialPuntos || [];

    const nuevoHistorial = [
      ...historialActual,
      {
        puntos: 1000,
        motivo: "Se acreditaron 1000 puntos",
        fecha: new Date().toISOString()
      }
    ];

    await updateDoc(ref, {
      puntos: puntosActuales + 1000,
      historialPuntos: nuevoHistorial
    });

    Swal.fire("✅ Recarga Exitosa", "Se cargaron 1000 puntos a tu cuenta.", "success");

    if (typeof refrescarPuntos === "function") refrescarPuntos();
  } catch (error) {
    console.error("Error al recargar puntos:", error);
    Swal.fire("Error", "No se pudo completar la recarga.", "error");
  }
};


const handlePagar2500 = async () => {
  const user = auth.currentUser;
  if (!user || !tiendaId) {
    Swal.fire("Error", "No se encontró tu tienda.", "error");
    return;
  }

  try {
    const ref = doc(db, "usuarios", tiendaId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      Swal.fire("Error", "No se encontró tu tienda.", "error");
      return;
    }

    const data = snap.data();
    const puntosActuales = data.puntos || 0;
    const historialActual = data.historialPuntos || [];

    const nuevoHistorial = [
      ...historialActual,
      {
        puntos: 2500,
        motivo: "Se acreditaron 2500 puntos",
        fecha: new Date().toISOString()
      }
    ];

    await updateDoc(ref, {
      puntos: puntosActuales + 2500,
      historialPuntos: nuevoHistorial
    });

    Swal.fire("✅ Recarga Exitosa", "Se cargaron 2500 puntos a tu cuenta.", "success");

    if (typeof refrescarPuntos === "function") refrescarPuntos();
  } catch (error) {
    console.error("Error al recargar puntos:", error);
    Swal.fire("Error", "No se pudo completar la recarga.", "error");
  }
};



  return (
<div className="opciones-panel">

    <h2>CARGA PUNTOS PARA APROVECHAR</h2>
  {/* Recarga 1000 */}
  <div className="opciones-card opciones-recarga">
    <h4>💳 Recarga 1000 Puntos</h4>
    <button className="btn btn-success" onClick={handlePagar1000}>Recargar!</button>
  </div>

  {/* Recarga 2500 */}
  <div className="opciones-card opciones-recarga">
    <h4>💳 Recarga 2500 Puntos</h4>
    <button className="btn btn-success" onClick={handlePagar}>Recargar!</button>
  </div>
    {/* Recarga 5000 */}
  <div className="opciones-card opciones-recarga">
    <h4>💳 Recarga 5000 Puntos</h4>
    <button className="btn btn-success" onClick={handlePagar1000}>Recargar!</button>
  </div>

  {/* Recarga 10000 */}
  <div className="opciones-card opciones-recarga">
    <h4>💳 Recarga 10.000 Puntos</h4>
    <button className="btn btn-success" onClick={handlePagar}>Recargar!</button>
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
  );
};

export default Recargar;
