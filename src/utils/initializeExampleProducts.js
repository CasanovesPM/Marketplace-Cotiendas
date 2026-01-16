// Inicializar productos de ejemplo por defecto
import { db, doc, setDoc, getDoc, collection, getDocs } from '../firebaseConfig';

// UID especial para productos de ejemplo (no asociado a ningún usuario)
const EXAMPLE_USER_UID = 'example-products-system';

// Productos de ejemplo
const exampleProducts = [
  {
    id: 'pid-example-001',
    titulo: 'EXAM PROD 1',
    descripcion: 'Producto de ejemplo número 1. Este es un producto de demostración con características destacadas.',
    precio: 15000.50,
    moneda: 'AR$',
    categoria: 'Electrónica',
    dimensiones: { alto: '30', ancho: '20', profundidad: '15' },
    etiquetas: ['ejemplo', 'demo', 'nuevo'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 1
  },
  {
    id: 'pid-example-002',
    titulo: 'EXAM PROD 2',
    descripcion: 'Producto de ejemplo número 2. Ideal para demostración de funcionalidades del marketplace.',
    precio: 25000.00,
    moneda: 'AR$',
    categoria: 'Moda',
    dimensiones: { alto: '40', ancho: '30', profundidad: '10' },
    etiquetas: ['ejemplo', 'moda', 'tendencia'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 2
  },
  {
    id: 'pid-example-003',
    titulo: 'EXAM PROD 3',
    descripcion: 'Producto de ejemplo número 3. Perfecto para testing y demostraciones.',
    precio: 35000.75,
    moneda: 'AR$',
    categoria: 'Hogar',
    dimensiones: { alto: '50', ancho: '40', profundidad: '30' },
    etiquetas: ['ejemplo', 'hogar', 'decoración'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 3
  },
  {
    id: 'pid-example-004',
    titulo: 'EXAM PROD 4',
    descripcion: 'Producto de ejemplo número 4. Características destacadas y calidad premium.',
    precio: 45000.00,
    moneda: 'AR$',
    categoria: 'Deportes',
    dimensiones: { alto: '60', ancho: '50', profundidad: '20' },
    etiquetas: ['ejemplo', 'deportes', 'fitness'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 4
  },
  {
    id: 'pid-example-005',
    titulo: 'EXAM PROD 5',
    descripcion: 'Producto de ejemplo número 5. Diseño moderno y funcional.',
    precio: 55000.25,
    moneda: 'AR$',
    categoria: 'Vehículos',
    dimensiones: { alto: '100', ancho: '80', profundidad: '40' },
    etiquetas: ['ejemplo', 'vehículos', 'accesorios'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 5
  },
  {
    id: 'pid-example-006',
    titulo: 'EXAM PROD 6',
    descripcion: 'Producto de ejemplo número 6. Excelente relación calidad-precio.',
    precio: 12500.00,
    moneda: 'AR$',
    categoria: 'Inmuebles',
    dimensiones: { alto: '200', ancho: '150', profundidad: '100' },
    etiquetas: ['ejemplo', 'inmuebles', 'hogar'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 6
  },
  {
    id: 'pid-example-007',
    titulo: 'EXAM PROD 7',
    descripcion: 'Producto de ejemplo número 7. Innovador y de última generación.',
    precio: 75000.50,
    moneda: 'AR$',
    categoria: 'Belleza',
    dimensiones: { alto: '25', ancho: '15', profundidad: '10' },
    etiquetas: ['ejemplo', 'belleza', 'cuidado'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 7
  },
  {
    id: 'pid-example-008',
    titulo: 'EXAM PROD 8',
    descripcion: 'Producto de ejemplo número 8. Perfecto para regalo o uso personal.',
    precio: 18000.00,
    moneda: 'AR$',
    categoria: 'Juguetes',
    dimensiones: { alto: '35', ancho: '25', profundidad: '20' },
    etiquetas: ['ejemplo', 'juguetes', 'entretenimiento'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 8
  },
  {
    id: 'pid-example-009',
    titulo: 'EXAM PROD 9',
    descripcion: 'Producto de ejemplo número 9. Alta calidad y durabilidad garantizada.',
    precio: 95000.75,
    moneda: 'AR$',
    categoria: 'Consolas',
    dimensiones: { alto: '30', ancho: '25', profundidad: '15' },
    etiquetas: ['ejemplo', 'consolas', 'gaming'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 9
  },
  {
    id: 'pid-example-010',
    titulo: 'EXAM PROD 10',
    descripcion: 'Producto de ejemplo número 10. Último modelo disponible en el mercado.',
    precio: 65000.00,
    moneda: 'AR$',
    categoria: 'Herramientas',
    dimensiones: { alto: '45', ancho: '35', profundidad: '25' },
    etiquetas: ['ejemplo', 'herramientas', 'profesional'],
    imagenes: ['/logo512.png'],
    vendedorID: EXAMPLE_USER_UID,
    tipoVendedor: 'sistema',
    fecha: new Date().toISOString(),
    estado: 'activo',
    visitas: 0,
    interacciones: 0,
    numeroId: 10
  }
];

// Función para inicializar productos de ejemplo
export const initializeExampleProducts = async () => {
  try {
    // Verificar si ya se inicializaron los productos de ejemplo
    const checkDoc = await getDoc(doc(db, 'productos', 'pid-example-001'));
    
    if (checkDoc.exists()) {
      // Los productos ya existen, no hacer nada
      console.log('Productos de ejemplo ya inicializados');
      return;
    }

    // Crear todos los productos de ejemplo
    console.log('Inicializando productos de ejemplo...');
    for (const product of exampleProducts) {
      await setDoc(doc(db, 'productos', product.id), product);
    }
    
    console.log('Productos de ejemplo inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar productos de ejemplo:', error);
  }
};
