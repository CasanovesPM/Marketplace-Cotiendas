import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db, collection, getDocs } from '../firebaseConfig';
import './PaginaCategoria.css';
import Plantillax6Productos from './Herramientas/Plantillax6Productos';
import SkeletonProductCard from './Herramientas/SkeletonProductCard';

const BuscaCategoria = () => {
  const location = useLocation();
  const categoria = new URLSearchParams(location.search).get('q')?.split('categoria:')[1] || '';
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(100000);
  const [rangoPrecio, setRangoPrecio] = useState([0, 100000]);

  useEffect(() => {
    const fetchProductosPorCategoria = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'productos'));
      const productos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p =>
          p.estado !== 'pausado' &&
          p.categoria?.toLowerCase() === categoria.toLowerCase()
        );
      setResultados(productos);
      if (productos.length > 0) {
        const precios = productos.map(p => p.precio);
        const min = Math.min(...precios);
        const max = Math.max(...precios);
        setPrecioMin(min);
        setPrecioMax(max);
        setRangoPrecio([min, max]);
      }
      setLoading(false);
    };

    if (categoria) {
      fetchProductosPorCategoria();
    }
  }, [categoria]);

  const productosFiltrados = resultados.filter(
    p => p.precio >= rangoPrecio[0] && p.precio <= rangoPrecio[1]
  );

  return (
    <div className="categoria-container">


      {/* Contenido principal */}
      <div className="productos-container">
        <div className="categoria-header">
          <h2>Todos los productos de {categoria}</h2>
          {resultados.length > 0 && (
            <div className="filtro-precio">
              <label>Por precio:</label>
              <input
                type="range"
                min={precioMin}
                max={precioMax}
                value={rangoPrecio[1]}
                onChange={e => setRangoPrecio([precioMin, Number(e.target.value)])}
              />
              <span>${precioMin} - ${rangoPrecio[1]}</span>
            </div>
          )}
        </div>

    {loading ? (
      <div className="skeleton-grid">
        <SkeletonProductCard />
        <SkeletonProductCard />
        <SkeletonProductCard />
        <SkeletonProductCard />
        <SkeletonProductCard />
        <SkeletonProductCard />
      </div>
    )  :     productosFiltrados.length ? (
        <Plantillax6Productos productos={productosFiltrados} />
    ) : (
      <p>No hay productos disponibles.</p>
    )}
      </div>


    </div>
  );
};

export default BuscaCategoria;
