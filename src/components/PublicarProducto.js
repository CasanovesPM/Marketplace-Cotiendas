import React, { useState, useEffect, useRef } from 'react';
import { db, collection, query, where, doc, setDoc, getDocs, storage, storageRef, uploadBytes, getDownloadURL, auth, updateDoc, getDoc } from '../firebaseConfig';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { sumarPuntos } from './Herramientas/sumarPuntos';
import imageCompression from 'browser-image-compression';
import './PublicarProducto.css'



const registrarEdicion = async () => {
  try {
    // Obtener usuario actual
    const user = auth.currentUser;
    if (!user) return;

    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('uid', '==', user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('Usuario no encontrado');
      return;
    }

    const userDoc = snapshot.docs[0]; // Si hay varios, tomamos el primero
    const tipo = userDoc.data().tipo;
    const campo = tipo === 'tienda' ? 'totalProductosEditadosTienda' : 'totalProductosEditadosParticular';

    // Referencia al documento resumenGeneral
    const resumenRef = doc(db, 'estadisticas', 'resumenGeneral');
    const resumenSnap = await getDoc(resumenRef);

    if (resumenSnap.exists()) {
      const data = resumenSnap.data();
      const productos = data.productos || {};
      const valorAnterior = productos[campo] || 0;

      await updateDoc(resumenRef, {
        [`productos.${campo}`]: valorAnterior + 1
      });
    } else {
      await setDoc(resumenRef, {
        productos: {
          [campo]: 1
        }
      });
    }

  } catch (error) {
    console.error("Error al registrar edición:", error);
  }
};



const PublicarProducto = ({ productoEditar, modoEdicion, onActualizarExito, puedeForzarPublicar, tipo }) => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [moneda, setMoneda] = useState('AR$');
  const [categoria, setCategoria] = useState('');
  const [dimensiones, setDimensiones] = useState({ alto: '', ancho: '', profundidad: '' });
  const [etiquetas, setEtiquetas] = useState('');
  const [imagenesCargadas, setImagenesCargadas] = useState([]); // 🔥 URLs originales
  const [imagenes, setImagenes] = useState([]); // 🔥 Nuevas imágenes (File)
  const [previewURLs, setPreviewURLs] = useState([]); // 🔥 Todas las imágenes a mostrar
  const [nextId, setNextId] = useState(1);
  const [puedePublicar, setPuedePublicar] = useState(false);
  const [idCargado, setIdCargado] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (productoEditar) {
      setTitulo(productoEditar.titulo || '');
      setDescripcion(productoEditar.descripcion || '');
      setPrecio(productoEditar.precio ? productoEditar.precio.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
      setMoneda(productoEditar.moneda || 'AR$');
      setCategoria(productoEditar.categoria || '');
      setDimensiones(productoEditar.dimensiones || { alto: '', ancho: '', profundidad: '' });
      setEtiquetas(productoEditar.etiquetas ? productoEditar.etiquetas.join(', ') : '');
      setImagenesCargadas(productoEditar.imagenes || []);
      setPreviewURLs(productoEditar.imagenes || []);
      setImagenes([]);
    }
  }, [productoEditar]);

  useEffect(() => {
    const verificarEmail = async () => {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire('Error', 'Debes iniciar sesión para publicar.', 'error').then(() => navigate('/login'));
        return;
      }
      // En LocalStorage siempre está verificado
      setPuedePublicar(true);
    };
    verificarEmail();
  }, [navigate]);

  useEffect(() => {
    const fetchLastId = async () => {
      Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        showConfirmButton: false
      });

      const productosRef = collection(db, 'productos');
      const snapshot = await getDocs(productosRef);
      let maxIdNumber = 0;

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        let num = 0;
        if (data.numeroId) {
          num = data.numeroId;
        } else if (data.id && data.id.startsWith('pid-')) {
          num = parseInt(data.id.replace('pid-', ''), 10);
        }
        if (num > maxIdNumber) {
          maxIdNumber = num;
        }
      });

      setNextId(maxIdNumber + 1);
      Swal.close();
      setIdCargado(true);
    };

    if (!modoEdicion) {
      fetchLastId();
    } else {
      setIdCargado(true);
    }
  }, [modoEdicion]);

  const idMostrar = modoEdicion && productoEditar ? productoEditar.id : `pid-${nextId}`;

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const totalImagenes = imagenesCargadas.length + imagenes.length;
    if (totalImagenes >= 4) {
      Swal.fire('Error', 'Solo se permiten 4 imágenes.', 'error');
      return;
    }

    setImagenes([...imagenes, file]);
    setPreviewURLs([...previewURLs, URL.createObjectURL(file)]);
  };

  const removeImage = (index) => {
    if (index < imagenesCargadas.length) {
      const nuevasCargadas = [...imagenesCargadas];
      nuevasCargadas.splice(index, 1);
      setImagenesCargadas(nuevasCargadas);
    } else {
      const idxNew = index - imagenesCargadas.length;
      const nuevas = [...imagenes];
      nuevas.splice(idxNew, 1);
      setImagenes(nuevas);
    }
    const nuevasPreview = [...previewURLs];
    nuevasPreview.splice(index, 1);
    setPreviewURLs(nuevasPreview);
  };

  const handleImageClick = () => {
    const totalImagenes = imagenesCargadas.length + imagenes.length;
    if (totalImagenes >= 4) {
      Swal.fire('Error', 'Solo se permiten 4 imágenes.', 'error');
      return;
    }
    fileInputRef.current.click();
  };

  const handlePrecioChange = (e) => {
    let input = e.target.value.replace(/[^0-9.,]/g, '').replace(/\./g, '');
    const [entero, decimal] = input.split(',');
    const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalFormateado = decimal ? decimal.slice(0, 2) : undefined;
    const precioFinal = decimalFormateado !== undefined ? `${enteroFormateado},${decimalFormateado}` : enteroFormateado;
    setPrecio(precioFinal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalImagenes = imagenesCargadas.length + imagenes.length;
    if (!titulo || !descripcion || !precio || !categoria || totalImagenes === 0) {
      Swal.fire('Error', 'Completa todos los campos obligatorios.', 'error');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Swal.fire('Error', 'Debes iniciar sesión.', 'error');
      return;
    }

    try {
      Swal.fire({ title: modoEdicion ? 'Actualizando...' : 'Publicando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const imagenURLs = [...imagenesCargadas];
      for (let i = 0; i < imagenes.length; i++) {
        const img = imagenes[i];
        
        // Comprimir imagen antes de guardarla
        const options = {
          maxSizeMB: 0.5, // Máximo 500KB por imagen
          maxWidthOrHeight: 800, // Máximo 800px de ancho o alto
          useWebWorker: true,
          fileType: 'image/jpeg'
        };
        
        const compressedFile = await imageCompression(img, options);
        
        const nombre = `imagen-${String(i + 1).padStart(2, '0')}.jpeg`; // imagen-01, imagen-02, etc.
        const path = `productos/${productoEditar ? productoEditar.id : `pid-${nextId}`}/${nombre}`;
        const imgRef = storageRef(storage, path);
        await uploadBytes(imgRef, compressedFile);
        const url = await getDownloadURL(imgRef);
        imagenURLs.push(url);
      }

      const precioNumerico = parseFloat(precio.replace(/\./g, '').replace(',', '.'));

      if (modoEdicion && productoEditar) {
        await updateDoc(doc(db, 'productos', productoEditar.id), {
          titulo, descripcion, precio: precioNumerico, moneda, categoria, dimensiones,
          etiquetas: etiquetas.split(',').map(tag => tag.trim()), imagenes: imagenURLs, fecha: new Date().toISOString(), estado: 'activo'
        });
                  registrarEdicion();

        Swal.fire('¡Actualizado!', 'El producto fue actualizado exitosamente.', 'success').then(() => {
          navigate('/producto/' + productoEditar.id);
        });
        if (onActualizarExito) onActualizarExito();
      } else {
        const customId = `pid-${nextId}`;
        await setDoc(doc(db, 'productos', customId), {
          id: customId, titulo, descripcion, precio: precioNumerico, moneda, categoria, dimensiones,
          etiquetas: etiquetas.split(',').map(tag => tag.trim()), imagenes: imagenURLs, vendedorID: user.uid, tipoVendedor: tipo, fecha: new Date().toISOString(), estado: 'activo'
        });
        Swal.fire('¡Publicado!', 'Producto agregado exitosamente.', 'success');
        await sumarPuntos(user.uid, "publicar");

        navigate('/producto/' + customId);
      }

    } catch (error) {
      console.error(error);
      const mensajeError = error.message && error.message.includes('LocalStorage') 
        ? error.message 
        : `Hubo un problema al ${modoEdicion ? 'actualizar' : 'publicar'}. ${error.message || ''}`;
      Swal.fire('Error', mensajeError, 'error');
    }
  };

  const categoriasMercadoLibre = ['', 'Electrónica', 'Moda', 'Hogar', 'Deportes', 'Vehículos', 'Inmuebles', 'Belleza', 'Juguetes', 'Consolas', 'Herramientas', 'Accesorios', 'Otros'];

  if (!puedePublicar || !idCargado) return null;

  return (
<form onSubmit={handleSubmit} className="publicar-form-wrapper">

    <div className="publicar-titulo-container">
    <h2 style={{ margin: 0 }}>{modoEdicion ? 'Editar Producto' : 'Publicar Producto'}</h2>

  </div>
  <div className="publicar-container">
    <div className="publicar-left-column">
      <input type="text" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} className="publicar-input" />
      <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="publicar-textarea" />

      <div className="publicar-row">
        <select value={moneda} onChange={e => setMoneda(e.target.value)} className="publicar-moneda">
          <option value="AR$">AR$</option>
          <option value="USD">U$D</option>
        </select>
        <input type="text" placeholder="Precio" value={precio} onChange={handlePrecioChange} className="publicar-precio" />
      </div>

      <select value={categoria} onChange={e => setCategoria(e.target.value)} className="publicar-select">
        {categoriasMercadoLibre.map((cat, idx) => (
          <option key={idx} value={cat}>{cat || '-- Selecciona Categoría --'}</option>
        ))}
      </select>

      <div className="publicar-row">
        <input type="text" placeholder="Alto" value={dimensiones.alto} onChange={e => setDimensiones({ ...dimensiones, alto: e.target.value })} className="publicar-input publicar-input-small" />
        <input type="text" placeholder="Ancho" value={dimensiones.ancho} onChange={e => setDimensiones({ ...dimensiones, ancho: e.target.value })} className="publicar-input publicar-input-small" />
        <input type="text" placeholder="Profundidad" value={dimensiones.profundidad} onChange={e => setDimensiones({ ...dimensiones, profundidad: e.target.value })} className="publicar-input publicar-input-small" />
      </div>

      <input type="text" placeholder="Etiquetas (separadas por coma)" value={etiquetas} onChange={e => setEtiquetas(e.target.value)} className="publicar-input" />
      <input type="text" value={`ID: ${idMostrar}`} disabled className="publicar-input" style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center' }} />
    </div>

    <div className="publicar-right-column">
      <div className="publicar-image-grid">
        {previewURLs.map((url, idx) => (
          <div key={idx} className="publicar-image-box">
            <img src={url} alt={`img-${idx}`} className="publicar-image-style" />
            <button type="button" onClick={() => removeImage(idx)} className="publicar-remove-btn">×</button>
          </div>
        ))}

        {(imagenesCargadas.length + imagenes.length) < 4 && (
          <div onClick={handleImageClick} className="publicar-image-box publicar-add-image">
            <span style={{ fontSize: '24px' }}>+</span>
            <span>Agregar</span>
          </div>
        )}
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAddImage} />
      </div>
    </div>
  </div>

    <div className="publicar-titulo-container">
    <button type="submit" className="publicar-submit-btn">
      {modoEdicion ? 'Actualizar' : 'Publicar'}
    </button>
  </div>
</form>
  );
};


export default PublicarProducto;
