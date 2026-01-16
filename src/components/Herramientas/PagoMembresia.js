import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { db, auth, collection, getDocs, doc, updateDoc, getDoc } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import './PagoMembresia.css';


const PagarMembresia = ({ refrescarPuntos }) => {
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [verificada, setVerificada] = useState(false);
  const [tiendaId, setTiendaId] = useState(null);
  const [codigoVerificacion, setCodigoVerificacion] = useState(null);
  const navigate = useNavigate();
  const [premium, setPremium] = useState(false);
  const [premiumDate, setPremiumDate] = useState(null);

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
            setSolicitudEnviada(data.solicitudVerify === true);
            setVerificada(data.verificada === true);
            setPremium(data.esPremium === true);
            setCodigoVerificacion(data.verifyCode);
            if (data.premiumDate) {
              setPremiumDate(data.premiumDate);
            }
            break;
          }
        }
      } catch (error) {
        console.error("Error al buscar tienda:", error);
      }
    };

    buscarTienda();
  }, []);

  const handleVerificacion = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Deseás solicitar la verificación?",
      html: `
        <p>Un encargado de <strong>Cotiendas</strong> se comunicará con vos y te pedirá:</p>
        <ul style="text-align:left">
          <li>📸 Fotos de la tienda (si existen)</li>
          <li>🎥 Video con tu DNI para confirmar tu identidad</li>
          <li>📝 Firmar un contrato formal</li>
        </ul>
        <p><em>*Brindar esta información mejora tu reputación y alcance.</em></p>
        <strong>¿Continuar con la solicitud?</strong>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar"
    });

    if (!isConfirmed) return;

    const user = auth.currentUser;
    if (!user || !tiendaId) {
      Swal.fire("Error", "No se encontró tu tienda.", "error");
      return;
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000);

    try {
      const ref = doc(db, "usuarios", tiendaId);
      await updateDoc(ref, {
        solicitudVerify: true,
        verifyCode: verifyCode,
      });

      setSolicitudEnviada(true);
      setCodigoVerificacion(verifyCode);

      await Swal.fire({
        title: "✅ Solicitud enviada",
        text: "Dentro de las próximas 48hs nos comunicaremos por WhatsApp con vos, tené a mano el código de verificación.",
        icon: "success",
        confirmButtonText: "OK"
      });

      navigate("/perfil");
    } catch (error) {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "No se pudo guardar la solicitud.", "error");
    }
  };

const handlePremium = async () => {
  const { isConfirmed } = await Swal.fire({
    title: "Hazte Premium por 1000 puntos!",
    html: `
      <p><strong>¿Cuáles son sus beneficios?</strong></p>
      <ul style="text-align:left">
        <li>🎁 250 puntos de regalo</li>
        <li>📦 Sin límite de carga de productos</li>
        <li>🏆 Insignia de Tienda Premium</li>
        <li>✨ Tus productos estarán en "Productos Destacados"</li>
      </ul>
      <strong>¿Estás de acuerdo?</strong>
    `,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Volver"
  });

  if (!isConfirmed) return;

  const { isConfirmed: confirmGasto } = await Swal.fire({
    title: "Confirmar gasto",
    text: "Estás por gastar 1000 puntos en ser Premium. ¿Estás seguro?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Volver"
  });

  if (!confirmGasto) return;

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

    if (puntosActuales < 1000) {
      Swal.fire("Error", "No tienes suficientes puntos.", "error");
      return;
    }

    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    const nuevoHistorial = [
      ...historialActual,
      {
        puntos: -1000,
        motivo: "Suscripción Premium (30 días)",
        fecha: new Date().toISOString()
      }
    ];

    await updateDoc(ref, {
      esPremium: true,
      puntos: puntosActuales - 1000,
      premiumDate: fechaVencimiento.toISOString(),
      historialPuntos: nuevoHistorial
    });

    setPremium(true);
    setPremiumDate(fechaVencimiento.toISOString());
    if (typeof refrescarPuntos === "function") refrescarPuntos();

    Swal.fire("¡Felicitaciones!", "Ya eres una Tienda Premium", "success");
  } catch (error) {
    console.error("Error al actualizar Premium:", error);
    Swal.fire("Error", "No se pudo completar la operación", "error");
  }
};



  return (
<div className="opciones-panel">
  {/* Verificación */}
  <div className="opciones-card">
    <h4>✅ Solicitud de Verificación.</h4>
    <button
      className={`btn ${
        verificada
          ? "btn-success"
          : solicitudEnviada
          ? "btn-secondary"
          : "btn-primary"
      }`}
      onClick={handleVerificacion}
      disabled={verificada || solicitudEnviada}
    >
      {verificada
        ? "Tienda Verificada"
        : solicitudEnviada && codigoVerificacion
        ? `Código de Verificación: ${codigoVerificacion}`
        : "Solicitar"}
    </button>
  </div>

  {/* Premium */}
  <div className="opciones-card opciones-premium">
    <h4>⭐ Hazte PREMIUM</h4>
    <button
      className="btn btn-warning"
      onClick={handlePremium}
      disabled={premium && premiumDate}
    >
      {premium && premiumDate
        ? `⭐ PREMIUM HASTA: ${new Date(premiumDate).toLocaleDateString()}`
        : "Volverse Premium"}
    </button>
  </div>


</div>
  );
};

export default PagarMembresia;
