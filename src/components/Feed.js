import React, { useEffect, useState, useRef  } from 'react';
import { db,collection, getDocs, updateDoc, doc,increment, getDoc , setDoc } from '../firebaseConfig';
import ProductCard from './ProductCard';
import './Feed.css';
import { useNavigate } from 'react-router-dom';
import Plantillax5Productos from './Herramientas/Plantillax5Productos';
import Plantillax6Productos from './Herramientas/Plantillax6Productos';
import AllProducts from './AllProducts';
import SkeletonProductCard from './Herramientas/SkeletonProductCard';

const Feed = () => {

  
    const ahora = new Date();

    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();

    const fechaHoy = `${dia}-${mes}-${anio}`;


  const navigate = useNavigate();
  const parentRefUltimosIngresos = useRef(null);
  const parentRefLiquidaciones = useRef(null);


  const [loading, setLoading] = useState(true);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(10000);
  const [rangoPrecio, setRangoPrecio] = useState([0, 10000]);
const [productosLiquidacion, setProductosLiquidacion] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, 'productos'));
      const productosData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(producto => producto.estado === 'activo');

      setProductos(productosData);
      // Calcular categorías
      const categoriasContadas = {};
      productosData.forEach(producto => {
        const categoria = producto.categoria || 'Sin categoría';
        categoriasContadas[categoria] = (categoriasContadas[categoria] || 0) + 1;
      });
      setCategorias(categoriasContadas);

      // Calcular rangos de precio
      const precios = productosData.map(p => p.precio);
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      setPrecioMin(min);
      setPrecioMax(max);
      setRangoPrecio([min, max]);

          // Incrementar visitas a Cotienda
     await registrarVisitaCotienda();
         setLoading(false); // 👈 al final

    };

    fetchProductos();
  }, []);

  const productosFiltrados = productos.filter(producto => {
    const cumpleCategoria = filtroCategoria === 'Todos' || producto.categoria === filtroCategoria;
    const cumplePrecio = producto.precio >= rangoPrecio[0] && producto.precio <= rangoPrecio[1];
    return cumpleCategoria && cumplePrecio;
  });

const registrarVisitaCotienda = async () => {
  try {
    const ref = doc(db, 'estadisticas', 'visitas');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const visitasActuales = data.visitasCotienda || 0;
      await updateDoc(ref, {
        visitasCotienda: visitasActuales + 1
      });
    } else {
      // Si no existe, lo crea con visitasCotienda en 1
      await setDoc(ref, {
        visitasCotienda: 1
      });
    }

    registrarVisitasDiarias();

  } catch (error) {
    console.error("Error al registrar visita de Cotienda:", error);
  }
};

const registrarVisitasDiarias = async () => {
  try {
    const ref = doc(db, 'estadisticas', 'visitas','diarias', fechaHoy );
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const visitasDiaria = data.visitasHoy || 0;
      await updateDoc(ref, {
        visitasHoy: visitasDiaria + 1
      });
    } else {
      // Si no existe, lo crea con visitasCotienda en 1
      await setDoc(ref, {
        visitasHoy: 1
      });
    }

  } catch (error) {
    console.error("Error al registrar visita de Cotienda:", error);
  }
};



useEffect(() => {
const filtrarYActualizarLiquidaciones = async () => {
  const hoy = new Date();
  const productosValidos = [];
  const updates = [];

  for (const producto of productos) {
    const esLiquidado = producto.liquidacion === 1 || producto.liquidacion === "1";
    const fechaStr = producto.liquidacionDate;
    const productoId = producto.id;

    if (!productoId) {
      console.warn('Producto sin ID detectado:', producto);
      continue;
    }

    // Si está marcado como liquidado pero no tiene fecha, debe corregirse
    if (esLiquidado && !fechaStr) {
      console.log(`⛔ Producto ${productoId} sin fecha de liquidación. Corrigiendo...`);
      updates.push(
        updateDoc(doc(db, 'productos', productoId), {
          liquidacion: 0,
          liquidacionDate: null
        }).catch(error =>
          console.error(`❌ Error actualizando producto sin fecha (${productoId}):`, error)
        )
      );
      continue;
    }

    // Si no está en liquidación o no tiene fecha, se ignora
    if (!esLiquidado || !fechaStr) continue;

    const [dia, mes, anio] = fechaStr.split('/');
    const fechaLiquidacion = new Date(`${anio}-${mes}-${dia}`);
    const fechaLimite = new Date(fechaLiquidacion);
    fechaLimite.setMonth(fechaLimite.getMonth() + 1);

    if (hoy <= fechaLimite) {
      productosValidos.push(producto);
    } else {
      console.log(`🕒 Producto ${productoId} vencido. Quitando liquidación...`);
      updates.push(
        updateDoc(doc(db, 'productos', productoId), {
          liquidacion: 0,
          liquidacionDate: null
        }).catch(error =>
          console.error(`❌ Error actualizando producto vencido (${productoId}):`, error)
        )
      );
    }
  }

  await Promise.all(updates);
  setProductosLiquidacion(productosValidos);
};


  filtrarYActualizarLiquidaciones();
}, [productos]);

// Trae los últimos 6 productos ordenados por ID numérico (pid-xx)
const productosUltimos30 = productos
  .slice() // Copiamos el array para no modificar el original
  .sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, ''), 10); // Extrae número del id (pid-xx)
    const numB = parseInt(b.id.replace(/\D/g, ''), 10);
    return numB - numA; // Orden descendente (del más grande al más chico)
  })
  .slice(0, 30); // Toma los primeros 6 del array ordenado

    const handlePublicar = async ()=> {
      navigate("/publicar")
    }

  return (
    <>
  <div className="banner-container">
  <div className="banner-content">
    <div className="destacados">
        <h1 className="h1-destacados">Encuentra lo que necesitas o vende lo que tengas</h1>
        <button className="publicar-btn" onClick={handlePublicar} >Publica tu anuncio</button>
    </div>

    <div className="destacados hideMovil">
    <h3>Productos o Servicios Destacados</h3>
    </div>
    <div className="destacados hideMovil">
      <div className="destacado-item">
        <img src="/icono-servicios.png" alt="Servicios" />
        <p>Servicios</p>
      </div>
      <div className="destacado-item">
        <img src="/icono-tienda.png" alt="Tiendas" />
        <p>Tiendas</p>
      </div>
      <div className="destacado-item">
        <img src="/icono-liquidaciones.png" alt="Liquidaciones" />
        <p>Liquidaciones</p>
      </div>
      <div className="destacado-item">
        <img src="/iconos-usados.png" alt="Usados" />
        <p>Usados</p>
      </div>
    </div>
  </div>
</div>

<div className="feed-container" ref={parentRefLiquidaciones}>

      <h2 className="carousel-title">🔥 LIQUIDACIONES 🔥</h2>
          {loading ? (
            <div className="skeleton-grid-6">
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />

            </div>
          ) : (
                    <Plantillax5Productos productos={productosLiquidacion} parentRef={parentRefLiquidaciones}/>
          )}

</div>

    <div className='feed-container'  ref={parentRefUltimosIngresos}>
            <h2 className="carousel-title">🔥 ULTIMOS INGRESOS 🔥</h2>

          {loading ? (
            <div className="skeleton-grid-6">
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />

            </div>
          ) : (
             <Plantillax6Productos productos={productosUltimos30}  parentRef={parentRefUltimosIngresos}/>
          )}

    </div>

    <div className="feed-container">
            <h2 className="carousel-title">🔥 TODOS LOS PRODUCTOS 🔥</h2>

      {/* Sidebar */}
        <div className="content-wrapper">

      <aside className="sidebar">
        <h3>Categorías</h3>
        <div className="categoria-navbar">
          <button
            className={filtroCategoria === 'Todos' ? 'activo' : ''}
            onClick={() => setFiltroCategoria('Todos')}
          >
            Todos ({productos.length})
          </button>
          {Object.keys(categorias).map(cat => (
            <button
              key={cat}
              className={filtroCategoria === cat ? 'activo' : ''}
              onClick={() => setFiltroCategoria(cat)}
            >
              {cat} ({categorias[cat]})
            </button>
          ))}
        </div>

        <h4>Filtrar Precios</h4>
        <div className="filtro-precio-feed" >
          <div className="rango-texto">
            <span>${rangoPrecio[0]} - Minimo</span> 
          </div>
          <input
            type="range"
            min={precioMin}
            max={precioMax}
            value={rangoPrecio[0]}
            onChange={e => setRangoPrecio([Number(e.target.value), rangoPrecio[1]])}
          />
          <div className="rango-texto">
             <span>${rangoPrecio[1]} - Maximo</span>
          </div>
        </div>
      </aside>
      {/* Productos */}
{loading ? (
  <div className="skeleton-grid">
    <SkeletonProductCard />
    <SkeletonProductCard />
    <SkeletonProductCard />
    <SkeletonProductCard />
    <SkeletonProductCard />
  </div>
) : (
  <AllProducts productos={productosFiltrados} />
)}
    </div>

    </div>
    </>
  );
};

export default Feed;
