import React, { useRef, useState } from 'react';
import ProductCard from '../ProductCard';
import './Plantillax4Productos.css'; // Importa el archivo CSS

const Plantillax4Productos = ({ productos, parentRef  }) => {
  const productosPorPagina = 4; // Mostrar 4 por fila
  const [visibleCount, setVisibleCount] = useState(productosPorPagina);
  const containerRef = useRef(null); // Referencia al contenedor

  const handleVerMas = () => {
    setVisibleCount((prev) => Math.min(prev + productosPorPagina, productos.length));
  };

  const handleVerMenos = () => {
    setVisibleCount(productosPorPagina);
    if (parentRef && parentRef.current) {
      parentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const productosVisibles = productos.slice(0, visibleCount);

  return (
    <div className="carousel-container" ref={containerRef}>
      <main className="feed-grid-carousel4">
        {productosVisibles.length ? (
          productosVisibles.map(producto => (
            <ProductCard key={producto.id} producto={producto} />
          ))
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </main>
      {visibleCount < productos.length ? (
        <button className="ver-mas-btn" onClick={handleVerMas}>
          ▾ Ver más productos! ▾
        </button>
      ) : (
        productos.length > productosPorPagina && (
          <button className="ver-mas-btn" onClick={handleVerMenos}>
            ▴ Ver menos productos ▴
          </button>
        )
      )}
    </div>
  );
};

export default Plantillax4Productos;
