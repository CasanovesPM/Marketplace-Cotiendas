import { db,doc, getDocs, updateDoc, collection  } from "../../firebaseConfig";

// Reglas centralizadas
const reglasPuntos = {
  publicar: { puntos: 10, motivo: "Publicó un nuevo producto" },
  liquidar: { puntos: 30, motivo: "Liquidó un producto" },
  compartir: { puntos: 5, motivo: "Compartió una publicación" },
  crearTienda: { puntos: 100, motivo: "Creó una tienda" },
  compartirTienda: { puntos: 30, motivo: "Compartió una tienda" },
  calificar: { puntos: 1, motivo: "Calificó una tienda" }
};

export const sumarPuntos = async (uid, tipoAccion) => {
  const regla = reglasPuntos[tipoAccion];

  if (!regla) {
    console.warn(`⚠️ Acción desconocida: '${tipoAccion}'`);
    return;
  }

  try {
    const usuariosSnap = await getDocs(collection(db, "usuarios"));

    for (const docu of usuariosSnap.docs) {
      const data = docu.data();

      if (data.uid === uid) {
        const docRef = doc(db, "usuarios", docu.id);
        const puntosActuales = data.puntos || 0;
        const historialActual = data.historialPuntos || [];

        const nuevoHistorial = [
          ...historialActual,
          {
            motivo: regla.motivo,
            puntos: regla.puntos,
            fecha: new Date().toISOString()
          }
        ];

        await updateDoc(docRef, {
          puntos: puntosActuales + regla.puntos,
          historialPuntos: nuevoHistorial
        });

        {/*console.log(`✅ +${regla.puntos} puntos sumados a ${uid}: ${regla.motivo}`);*/}
        return;
      }
    }

    console.warn("⚠️ Usuario no encontrado.");
  } catch (error) {
    console.error("❌ Error al sumar puntos:", error);
  }
};
