import React, { useRef, useState, useEffect } from 'react';
import ProductCard from '../ProductCard';
import AdsCard from '../AdsCard'; // Importa el componente de publicidad
import './Plantillax5Productos.css';

const Plantillax5Productos = ({ productos, parentRef }) => {
  const productosPorPagina = 5;
  const [visibleCount, setVisibleCount] = useState(productosPorPagina);
  const [productosConAds, setProductosConAds] = useState([]);
  const containerRef = useRef(null);

  // Inserta una AdsCard en una posición aleatoria entre cada bloque de 5 productos
  useEffect(() => {
    const productosAgrupados = [];
    for (let i = 0; i < productos.length; i += productosPorPagina - 1) {
      const grupo = productos.slice(i, i + (productosPorPagina - 1));
      const posicion = Math.floor(Math.random() * (grupo.length + 1));
      const grupoConAd = [...grupo];
      grupoConAd.splice(posicion, 0, { esPublicidad: true, id: `ads-${i}` });
      productosAgrupados.push(...grupoConAd);
    }
    setProductosConAds(productosAgrupados);
  }, [productos]);

  const handleVerMas = () => {
    setVisibleCount((prev) => Math.min(prev + productosPorPagina, productosConAds.length));
  };

  const handleVerMenos = () => {
    setVisibleCount(productosPorPagina);
    if (parentRef?.current) {
      parentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const productosVisibles = productosConAds.slice(0, visibleCount);

  return (
    <div className="carousel-container" ref={containerRef}>
      <main className="feed-grid-carousel5">
        {productosVisibles.length ? (
          productosVisibles.map((producto, index) =>
            producto.esPublicidad ? (
              <AdsCard key={producto.id || `ad-${index}`} />
            ) : (
              <ProductCard key={producto.id} producto={producto} />
            )
          )
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </main>

      {visibleCount < productosConAds.length ? (
        <button className="ver-mas-btn" onClick={handleVerMas}>
          ▾ Ver más productos! ▾
        </button>
      ) : (
        productosConAds.length > productosPorPagina && (
          <button className="ver-mas-btn" onClick={handleVerMenos}>
            ▴ Ver menos productos ▴
          </button>
        )
      )}
    </div>
  );
};

export default Plantillax5Productos;
