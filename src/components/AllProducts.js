import React from 'react';
import ProductCard from './ProductCard';
import AdsCard from './AdsCard';
import AdsBanner from './AdsBanner';

const AllProducts = ({ productos }) => {
  const productosConAds = [];
  let contadorCards = 0;

  productos.forEach((producto, index) => {
    productosConAds.push(<ProductCard key={producto.id} producto={producto} />);
    contadorCards++;

    if ((index + 1) % 10 === 0) {
      productosConAds.push(<AdsCard key={`ads-card-${index}`} />);
      contadorCards++;
    }

    if (contadorCards % 8 === 0) {
      productosConAds.push(
        <div key={`ads-banner-${index}`} style={{ gridColumn: '1 / -1' }}>
          <AdsBanner />
        </div>
      );
    }
  });

  return (
    <>
      <main className="all-products-grid">
        {productos.length ? productosConAds : <p>No hay productos disponibles.</p>}
      </main>

      {/* 🔻 CSS embebido */}
      <style>{`
        .all-products-grid {
          display: grid;
          gap: 20px;
          padding: 20px;
          background-color: #f5f5f5;
        }

        /* 📱 MÓVIL: hasta 600px */
        @media (max-width: 600px) {
          .all-products-grid {
            grid-template-columns: repeat(2, 1fr); /* 2 columnas */
          }
        }

        /* 💻 TABLET: 601px a 1024px */
        @media (min-width: 601px) and (max-width: 1024px) {
          .all-products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* 🖥️ DESKTOP: más de 1024px */
        @media (min-width: 1025px) {
          .all-products-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </>
  );
};

export default AllProducts;
