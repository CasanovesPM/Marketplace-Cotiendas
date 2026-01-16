import React from 'react';
import ProductCard from './ProductCard';
import AdsBanner from './AdsBanner';

const AllProductsTienda = ({ productos }) => {
  const productosConAds = [];
  let contadorCards = 0;

  productos.forEach((producto, index) => {
    productosConAds.push(<ProductCard key={producto.id} producto={producto} />);
    contadorCards++;

    if (contadorCards % 10 === 0) {
      productosConAds.push(
        <div key={`ads-banner-${index}`} style={{ gridColumn: '1 / -1' }}>
          <AdsBanner />
        </div>
      );
    }
  });

  return (
    <>
      <main className="all-products-tienda-grid">
        {productos.length ? productosConAds : <p>No hay productos disponibles.</p>}
      </main>

      <style>{`
        .all-products-tienda-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          padding: 16px;
          background-color: #f5f5f5;
        }

        .all-products-tienda-grid > * {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .all-products-tienda-grid > *:hover {
          transform: translateY(-4px);
        }

        @media (max-width: 600px) {
          .all-products-tienda-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default AllProductsTienda;
