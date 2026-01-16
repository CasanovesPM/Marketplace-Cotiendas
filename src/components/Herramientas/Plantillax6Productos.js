import React, { useRef, useState, useEffect } from 'react';
import ProductCard from '../ProductCard';
import AdsCard from '../AdsCard';
import AdsBanner from '../AdsBanner'; // ⬅️ Asegurate de importar esto
import './Plantillax6Productos.css';

const Plantillax6Productos = ({ productos, parentRef }) => {
  const productosPorPagina = 6;
  const [visibleCount, setVisibleCount] = useState(productosPorPagina);
  const [productosConAds, setProductosConAds] = useState([]);
  const containerRef = useRef(null);

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

  // Agrega un AdsBanner cada 12 elementos visibles
  const renderConBanners = () => {
    const elementos = [];
    for (let i = 0; i < visibleCount; i++) {
      const item = productosConAds[i];
      if (!item) continue;

      if (item.esPublicidad) {
        elementos.push(<AdsCard key={item.id || `ad-${i}`} />);
      } else {
        elementos.push(<ProductCard key={item.id} producto={item} />);
      }

      // Después de cada 12 elementos (2 filas), insertar un banner
      if ((i + 1) % 12 === 0) {
        elementos.push(
          <div key={`ads-banner-${i}`} style={{ gridColumn: '1 / -1' }}>
            <AdsBanner />
          </div>
        );
      }
    }
    return elementos;
  };

  return (
    <div className="carousel-container" ref={containerRef}>
      <main className="feed-grid-carousel6">
        {productosConAds.length ? renderConBanners() : <p>No hay productos disponibles.</p>}
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

export default Plantillax6Productos;
