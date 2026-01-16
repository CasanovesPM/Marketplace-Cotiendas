import React, { useState, useRef } from 'react';
import { db, doc, updateDoc, storage, storageRef, uploadBytes, getDownloadURL, deleteObject } from '../firebaseConfig';
import Swal from 'sweetalert2';

const ModalEditarProducto = ({ producto, onClose, onUpdate }) => {
  const [titulo, setTitulo] = useState(producto.titulo);
  const [descripcion, setDescripcion] = useState(producto.descripcion);
  const [precio, setPrecio] = useState(formatPrecioInicial(producto.precio));
  const [moneda, setMoneda] = useState(producto.moneda || 'AR$');
  const [categoria, setCategoria] = useState(producto.categoria);
  const [dimensiones, setDimensiones] = useState(producto.dimensiones || { alto: '', ancho: '', profundidad: '' });
  const [etiquetas, setEtiquetas] = useState(producto.etiquetas ? producto.etiquetas.join(', ') : '');
  const [imagenesOriginales, setImagenesOriginales] = useState(producto.imagenes || []);
  const [imagenes, setImagenes] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
  const fileInputRef = useRef(null);

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imagenesOriginales.length + imagenes.length >= 5) {
      Swal.fire('Error', 'Solo se permiten 5 imágenes.', 'error');
      return;
    }
    setImagenes([...imagenes, file]);
    setPreviewURLs([...previewURLs, URL.createObjectURL(file)]);
  };

  const removeImage = (index, isOriginal) => {
    if (isOriginal) {
      const updated = imagenesOriginales.filter((_, i) => i !== index);
      setImagenesOriginales(updated);
    } else {
      const updatedImagenes = imagenes.filter((_, i) => i !== index);
      const updatedPreviews = previewURLs.filter((_, i) => i !== index);
      setImagenes(updatedImagenes);
      setPreviewURLs(updatedPreviews);
    }
  };

  const handleImageClick = () => {
    if (imagenesOriginales.length + imagenes.length >= 5) {
      Swal.fire('Error', 'Solo se permiten 5 imágenes.', 'error');
      return;
    }
    fileInputRef.current.click();
  };

  const handlePrecioChange = (e) => {
    let input = e.target.value.replace(/[^0-9.,]/g, '').replace(/\./g, '');
    const [entero, decimal] = input.split(',');
    const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalFormateado = decimal ? decimal.slice(0, 2) : undefined;
    const final = decimalFormateado !== undefined
      ? `${enteroFormateado},${decimalFormateado}`
      : enteroFormateado;
    setPrecio(final);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const idProducto = String(producto.id);
      const imagenesAEliminar = producto.imagenes?.filter(url => !imagenesOriginales.includes(url)) || [];

      await Promise.all(imagenesAEliminar.map(async (url) => {
        const ref = storageRef(storage, url);
        await deleteObject(ref).catch(() => {});
      }));

      const nuevasURLs = [];
      for (let i = 0; i < imagenes.length; i++) {
        const img = imagenes[i];
        const imgRef = storageRef(storage, `productos/${idProducto}/${img.name}`);
        await uploadBytes(imgRef, img);
        const url = await getDownloadURL(imgRef);
        nuevasURLs.push(url);
      }

      const imagenesFinales = [...imagenesOriginales, ...nuevasURLs];
      const precioNumerico = parseFloat(precio.replace(/\./g, '').replace(',', '.'));

      const updatedData = {
        titulo,
        descripcion,
        precio: precioNumerico,
        moneda,
        categoria,
        dimensiones,
        etiquetas: etiquetas.split(',').map(tag => tag.trim()),
        imagenes: imagenesFinales
      };

      await updateDoc(doc(db, 'productos', idProducto), updatedData);

      Swal.fire('Producto actualizado', '', 'success');
      onUpdate(producto.id, updatedData);
      onClose();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  const categorias = ['', 'Electrónica', 'Moda', 'Hogar', 'Deportes', 'Vehículos', 'Inmuebles', 'Belleza', 'Juguetes', 'Consolas y Videojuegos', 'Herramientas', 'Accesorios para Vehículos', 'Otros'];

  return (
    <div style={modalStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2>Editar Producto</h2>
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" style={inputStyle} />
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" style={inputStyle} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={moneda} onChange={e => setMoneda(e.target.value)} style={inputStyle}>
            <option value="AR$">AR$</option>
            <option value="USD">U$D</option>
          </select>
          <input type="text" value={precio} onChange={handlePrecioChange} placeholder="Precio" style={inputStyle} />
        </div>

        <select value={categoria} onChange={e => setCategoria(e.target.value)} style={inputStyle}>
          {categorias.map((cat, idx) => (
            <option key={idx} value={cat}>{cat || '-- Selecciona una Categoría --'}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Alto" value={dimensiones.alto} onChange={e => setDimensiones({ ...dimensiones, alto: e.target.value })} style={inputStyle} />
          <input type="text" placeholder="Ancho" value={dimensiones.ancho} onChange={e => setDimensiones({ ...dimensiones, ancho: e.target.value })} style={inputStyle} />
          <input type="text" placeholder="Profundidad" value={dimensiones.profundidad} onChange={e => setDimensiones({ ...dimensiones, profundidad: e.target.value })} style={inputStyle} />
        </div>

        <input type="text" value={etiquetas} onChange={e => setEtiquetas(e.target.value)} placeholder="Etiquetas separadas por coma" style={inputStyle} />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {imagenesOriginales.map((url, index) => (
            <div key={`original-${index}`} style={{ position: 'relative', width: '100px', height: '100px' }}>
              <img src={url} alt="original" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => removeImage(index, true)} style={deleteButtonStyle}>×</button>
            </div>
          ))}
          {previewURLs.map((url, index) => (
            <div key={`new-${index}`} style={{ position: 'relative', width: '100px', height: '100px' }}>
              <img src={url} alt="new" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => removeImage(index, false)} style={deleteButtonStyle}>×</button>
            </div>
          ))}
          {(imagenesOriginales.length + imagenes.length) < 5 && (
            <div onClick={handleImageClick} style={addImageStyle}>
              <div style={{ fontSize: '24px' }}>+</div>
              <div>Agregar Imagen</div>
            </div>
          )}
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAddImage} />
        </div>

        <button type="submit" style={buttonStyle}>Actualizar</button>
        <button type="button" onClick={onClose} style={cancelButtonStyle}>Cancelar</button>
      </form>
    </div>
  );
};

const formatPrecioInicial = (precio) => {
  if (!precio) return '';
  const [entero, decimal] = precio.toString().split('.');
  const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimal ? `${enteroFormateado},${decimal.slice(0, 2)}` : enteroFormateado;
};

const modalStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};

const formStyle = {
  background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '100%'
};

const inputStyle = {
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  width: '100%',
  marginBottom: '10px'
};

const addImageStyle = {
  width: '100px', height: '100px', border: '2px dashed #28a745', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', flexDirection: 'column'
};

const deleteButtonStyle = {
  position: 'absolute',
  bottom: '5px',
  right: '5px',
  backgroundColor: 'red',
  color: 'white',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  border: 'none',
  cursor: 'pointer'
};

const buttonStyle = {
  backgroundColor: '#FF6D00', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', width: '100%', marginTop: '10px'
};

const cancelButtonStyle = {
  backgroundColor: '#ccc', color: 'black', padding: '10px', borderRadius: '6px', border: 'none', width: '100%', marginTop: '10px'
};

export default ModalEditarProducto;
