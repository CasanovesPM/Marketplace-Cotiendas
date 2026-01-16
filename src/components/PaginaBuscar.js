import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db, collection, getDocs } from '../firebaseConfig';
import ProductCard from './ProductCard';

const Buscar = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q')?.toLowerCase() || '';
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [categorias, setCategorias] = useState({});

  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      const snapshot = await getDocs(collection(db, 'productos'));
      const productos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p =>
          p.estado !== 'pausado' &&
          (p.titulo?.toLowerCase().includes(query) ||
           p.descripcion?.toLowerCase().includes(query) ||
           p.etiquetas?.some(et => et.toLowerCase().includes(query)))
        );

      // Contar productos por categoría
      const contador = {};
      productos.forEach(p => {
        const cat = p.categoria || 'Otros';
        contador[cat] = (contador[cat] || 0) + 1;
      });

      setCategorias(contador);
      setResultados(productos);
      setCargando(false);
    };

    if (query) {
      fetchProductos();
    }
  }, [query]);

  const productosFiltrados = filtroCategoria === 'Todos'
    ? resultados
    : resultados.filter(p => p.categoria === filtroCategoria);

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '200px', padding: '20px', borderRight: '1px solid #ddd' }}>
        <h4>Categorías</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={categoriaItemStyle} onClick={() => setFiltroCategoria('Todos')}>
            Todos ({resultados.length})
          </li>
          {Object.keys(categorias).map(cat => (
            <li
              key={cat}
              style={categoriaItemStyle}
              onClick={() => setFiltroCategoria(cat)}
            >
              {cat} ({categorias[cat]})
            </li>
          ))}
        </ul>
      </aside>

      {/* Resultados */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h2>Resultados para: "{query}"</h2>
        {cargando ? (
          <p>Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '20px'
          }}>
            {productosFiltrados.map(producto => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const categoriaItemStyle = {
  cursor: 'pointer',
  padding: '5px 0',
  color: '#007bff',
  textDecoration: 'underline'
};

export default Buscar;
