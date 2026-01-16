import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where, storage, storageRef, getDownloadURL } from '../firebaseConfig'; 
import TiendaCard from './TiendaCard';
import SkeletonTiendaCard from './Herramientas/SkeletonTiendaCard'; // 👈 Asegurate que esté creado y exportado


const categoriasTienda = {
  "Construcción y Ferretería 🛠": [
    "Ferretería",
    "Sanitarios / Plomería",
    "Electricidad",
    "Pinturería",
    "Corralón / Materiales de construcción",
    "Vidriería / Aluminio"
  ],
  "Hogar y Decoración 🏠": [
    "Mueblería",
    "Decoración / Diseño de interiores",
    "Colchonería / Sommier",
    "Cortinas / Tapicería"
  ],
  "Ropa y Accesorios 🧥": [
    "Indumentaria masculina",
    "Indumentaria femenina",
    "Indumentaria infantil",
    "Calzado",
    "Marroquinería / Carteras",
    "Lencería / Ropa interior"
  ],
  "Bebés y Niños 👶": [
    "Juguetería",
    "Artículos para bebé"
  ],
  "Tecnología y Electrónica 🖥️": [
    "Computación / Informática",
    "Electrónica / Celulares",
    "Accesorios tecnológicos",
    "Electrodomésticos"
  ],
  "Gastronomía y Alimentos 🍔": [
    "Almacén / Dietética",
    "Verdulería / Frutería",
    "Carnicería / Pescadería",
    "Panadería / Pastelería",
    "Repostería / Catering"
  ],
  "Automotor y Repuestos 🚗": [
    "Repuestos de autos / motos",
    "Gomería / Taller mecánico",
    "Equipamiento para autos"
  ],
  "Cosmética y Salud 🧴": [
    "Perfumería / Cosmética",
    "Farmacia / Herboristería",
    "Productos naturales / Suplementos"
  ],
  "Mascotas 🐶": [
    "Pet Shop",
    "Veterinaria",
    "Accesorios para mascotas"
  ],
  "Oficina, Regalería y Librería 📚": [
    "Librería / Escolar",
    "Juguetería educativa",
    "Regalería",
    "Librería comercial / Oficina"
  ],
  "Arte, Artesanías y Manualidades 🎨": [
    "Tienda de arte / insumos",
    "Artesanías",
    "Cotillón / Fiestas"
  ],
  "Limpieza 🧹": [
    "Productos de limpieza",
    "Lavandería / Tintorería"
  ],
  "Servicios 🧰": [
    "Servicios técnicos / mantenimiento",
    "Servicios de limpieza",
    "Diseño gráfico / Publicidad",
    "Estudio contable / Jurídico",
    "Fotografía / Audiovisual"
  ]
};



const Tiendas = () => {
  const [tiendas, setTiendas] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroProvincia, setFiltroProvincia] = useState('');
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [provinciasCiudades, setProvinciasCiudades] = useState({});
  const [loading, setLoading] = useState(true); // 👈 Nuevo estado
const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState('');

  const fetchTiendas = async () => {
    try {
      const q = query(collection(db, 'usuarios'), where('tipo', '==', 'tienda'));
      const snapshot = await getDocs(q);
      const tiendasArray = [];
      const provinciasMap = {};

      for (const docSnap of snapshot.docs) {
        const userId = docSnap.id;
        const docData = docSnap.data();

        let logoURL = '';
        try {
          const logoReference = storageRef(storage, `usuarios/${userId}/logo`);
          logoURL = await getDownloadURL(logoReference);
        } catch (error) {
          console.warn(`No se pudo obtener logo para ${userId}:`, error.message);
        }

        let promedioEstrellas = 0;
        let cantidadComentarios = 0;
        try {
          const comentariosRef = collection(db, 'usuarios', userId, 'comentarios');
          const comentariosSnap = await getDocs(comentariosRef);
          const listaComentarios = comentariosSnap.docs.map(doc => doc.data());
          cantidadComentarios = listaComentarios.length;

          if (cantidadComentarios > 0) {
            const suma = listaComentarios.reduce((acc, c) => acc + (c.calificacion || 0), 0);
            promedioEstrellas = suma / cantidadComentarios;
          }
        } catch (error) {
          console.warn(`No se pudo calcular promedio para ${userId}:`, error.message);
        }

        if (docData.activo === false) continue; // 👈 filtra inactivos

        const tienda = {
          id: userId,
          logo: logoURL,
          nombre: docData.nombreTienda || 'Nombre no disponible',
          direccion: docData.direccion || 'Dirección no disponible',
          ciudad: docData.ciudad || 'Ciudad no disponible',
          provincia: docData.provincia || 'Provincia no disponible',
          telefono: docData.telefono || 'Teléfono no disponible',
          premium: docData.esPremium || false,
          verificada: docData.verificada || false,
          categoria: docData.categoria || 'Categoria no disponible',
          subcategoria: docData.subCategoria || 'Subcategoria no disponible',
          promedioEstrellas,
          cantidadComentarios,
        };

        tiendasArray.push(tienda);

        if (!provinciasMap[tienda.provincia]) {
          provinciasMap[tienda.provincia] = new Set();
        }
        provinciasMap[tienda.provincia].add(tienda.ciudad);
      }

      const provinciasCiudadesObj = {};
      for (const provincia in provinciasMap) {
        provinciasCiudadesObj[provincia] = Array.from(provinciasMap[provincia]);
      }

      setTiendas(tiendasArray);
      setProvinciasCiudades(provinciasCiudadesObj);
    } catch (error) {
      console.error('Error al obtener tiendas:', error);
    } finally {
      setLoading(false); // 👈 Finaliza carga
    }
  };

  useEffect(() => {
    fetchTiendas();
  }, []);

const tiendasFiltradas = tiendas.filter(tienda => {
  const textoOk = tienda.nombre.toLowerCase().includes(filtroTexto.toLowerCase());
  const provinciaOk = filtroProvincia ? tienda.provincia === filtroProvincia : true;
  const ciudadOk = filtroCiudad ? tienda.ciudad === filtroCiudad : true;
  const categoriaOk = categoriaSeleccionada ? tienda.categoria === categoriaSeleccionada : true;
  const subcategoriaOk = subcategoriaSeleccionada ? tienda.subcategoria === subcategoriaSeleccionada : true;
  return textoOk && provinciaOk && ciudadOk && categoriaOk && subcategoriaOk;
});


  return (
    <div style={{ padding: '20px' }}>
{/* 🟠 FILTROS PRINCIPALES */}
<div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
  {/* 🔍 Búsqueda por texto */}
  <input
    type="text"
    placeholder="Buscar tienda por nombre"
    value={filtroTexto}
    onChange={e => setFiltroTexto(e.target.value)}
    style={{
      padding: '10px',
      width: '300px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '16px'
    }}
  />

  {/* 🏷 Categoría */}
  <select
    value={categoriaSeleccionada}
    onChange={(e) => {
      setCategoriaSeleccionada(e.target.value);
      setSubcategoriaSeleccionada('');
    }}
    style={{
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '16px'
    }}
  >
    <option value="">Por Categoría</option>
    {Object.keys(categoriasTienda).map(categoria => (
      <option key={categoria} value={categoria}>{categoria}</option>
    ))}
  </select>

  {/* 🧩 Subcategoría */}
<select
  value={subcategoriaSeleccionada}
  onChange={e => setSubcategoriaSeleccionada(e.target.value)}
  disabled={!categoriaSeleccionada}
  style={{
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    backgroundColor: !categoriaSeleccionada ? '#eee' : '#fff',
    color: !categoriaSeleccionada ? '#888' : '#000'
  }}
>
  <option value="">Subcategoría</option>
  {categoriaSeleccionada &&
    categoriasTienda[categoriaSeleccionada].map(sub => (
      <option key={sub} value={sub}>{sub}</option>
    ))}
</select>


  {/* 📍 Provincia */}
  <select
    value={filtroProvincia}
    onChange={(e) => {
      setFiltroProvincia(e.target.value);
      setFiltroCiudad('');
    }}
    style={{
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '16px'
    }}
  >
    <option value="">Todas las Provincias</option>
    {Object.keys(provinciasCiudades).map(prov => (
      <option key={prov} value={prov}>{prov}</option>
    ))}
  </select>

  {/* 🏘 Ciudad */}
  {filtroProvincia && (
    <select
      value={filtroCiudad}
      onChange={(e) => setFiltroCiudad(e.target.value)}
      style={{
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '16px'
      }}
    >
      <option value="">Todas las Ciudades</option>
      {provinciasCiudades[filtroProvincia]?.map(ciudad => (
        <option key={ciudad} value={ciudad}>{ciudad}</option>
      ))}
    </select>
  )}
</div>


      {/* Grilla de tiendas o skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonTiendaCard key={i} />)
        ) : (
          tiendasFiltradas.length ? (
            tiendasFiltradas.map(tienda => (
              <TiendaCard key={tienda.id} tienda={tienda} />
            ))
          ) : (
            <p>No hay tiendas disponibles.</p>
          )
        )}
      </div>
    </div>
  );
};

export default Tiendas;
