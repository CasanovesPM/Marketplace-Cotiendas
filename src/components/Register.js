import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { auth, db, storageRef, storage, createUserWithEmailAndPassword, uploadBytes, getDownloadURL, updateProfile, sendEmailVerification, collection, getDocs, doc, setDoc } from '../firebaseConfig';
import imageCompression from 'browser-image-compression';


const categoriasTienda = {
  "Construcción y Ferretería 🛠": [
    "Ferretería",
    "Sanitarios / Plomería",
    "Electricidad",
    "Pinturería",
    "Corralón / Materiales de construcción",
    "Vidriería / Aluminio"
  ],
  "Hogar y Decoración 🏠": [
    "Mueblería",
    "Decoración / Diseño de interiores",
    "Colchonería / Sommier",
    "Cortinas / Tapicería"
  ],
  "Ropa y Accesorios 🧥": [
    "Indumentaria masculina",
    "Indumentaria femenina",
    "Indumentaria infantil",
    "Calzado",
    "Marroquinería / Carteras",
    "Lencería / Ropa interior"
  ],
  "Bebés y Niños 👶": [
    "Juguetería",
    "Artículos para bebé"
  ],
  "Tecnología y Electrónica 🖥️": [
    "Computación / Informática",
    "Electrónica / Celulares",
    "Accesorios tecnológicos",
    "Electrodomésticos"
  ],
  "Gastronomía y Alimentos 🍔": [
    "Almacén / Dietética",
    "Verdulería / Frutería",
    "Carnicería / Pescadería",
    "Panadería / Pastelería",
    "Repostería / Catering"
  ],
  "Automotor y Repuestos 🚗": [
    "Repuestos de autos / motos",
    "Gomería / Taller mecánico",
    "Equipamiento para autos"
  ],
  "Cosmética y Salud 🧴": [
    "Perfumería / Cosmética",
    "Farmacia / Herboristería",
    "Productos naturales / Suplementos"
  ],
  "Mascotas 🐶": [
    "Pet Shop",
    "Veterinaria",
    "Accesorios para mascotas"
  ],
  "Oficina, Regalería y Librería 📚": [
    "Librería / Escolar",
    "Juguetería educativa",
    "Regalería",
    "Librería comercial / Oficina"
  ],
  "Arte, Artesanías y Manualidades 🎨": [
    "Tienda de arte / insumos",
    "Artesanías",
    "Cotillón / Fiestas"
  ],
  "Limpieza 🧹": [
    "Productos de limpieza",
    "Lavandería / Tintorería"
  ],
  "Servicios 🧰": [
    "Servicios técnicos / mantenimiento",
    "Servicios de limpieza",
    "Diseño gráfico / Publicidad",
    "Estudio contable / Jurídico",
    "Fotografía / Audiovisual"
  ]
};



const Registro = () => {
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInsta] = useState('');
  const [facebook, setFace] = useState('');
  const [web, setWeb] = useState('');
  const [password, setPassword] = useState('');
  const [provincia, setProvincia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombreTienda, setNombreTienda] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [nombreResp, setNombreResp] = useState('');
  const [apellidoResp, setApellidoResp] = useState('');
  const [codigoArea, setCodigoArea] = useState('');
  const [numTel, setNumTel] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [categoria, setCategoria] = useState('');
  const [subCategoria, setSubcategoria] = useState('');

  const navigate = useNavigate();

  const obtenerNuevoUserID = async (coleccion) => {
    const usuariosSnapshot = await getDocs(collection(db, coleccion));
    const ids = usuariosSnapshot.docs.map(doc => doc.id);
    const numeros = ids.map(id => {
      const match = id.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }).filter(num => !isNaN(num));
    const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
    return `${tipoUsuario.toLowerCase()}-${String(maxNumero + 1).padStart(2, '0')}`;
  };

const handleRegistro = async () => {

  if (!aceptaTerminos) {
  Swal.fire({
    icon: 'warning',
    title: 'Falta aceptar los términos',
    text: 'Debés aceptar los Términos y Condiciones para continuar.'
  });
  return;
}


  try {

        // Mostrar SweetAlert con loader
    Swal.fire({
      title: 'Registrando...',
      text: 'Por favor, espera.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const coleccion = tipoUsuario === 'particular' ? 'usuariosParticulares' : 'usuariosTiendas';

    if (tipoUsuario === 'particular') {
      if (!nombre || !apellido || !email || !password || !provincia || !ciudad || !numTel || !codigoArea) {
        Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos.' });
        return;
      }
    } else {
      if (!nombreTienda || !logo || !nombreResp || !apellidoResp || !email || !password || !provincia || !ciudad || !direccion || !numTel || !codigoArea) {
        Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos.' });
        return;
      }

      if (!categoria || !subCategoria) {
      Swal.fire({ icon: 'warning', title: 'Selecciona categoría', text: 'Debés seleccionar categoria y subcategoria de tienda.' });
      return;
}
    }

        let telefono = codigoArea+numTel;

        
    const userCredential = await createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;


    let nameShop = '';
     if (tipoUsuario === 'particular') {
      nameShop = nombre.toLowerCase().replace(/\s+/g, '') + apellido.toLowerCase().replace(/\s+/g, '');
     } else {
            nameShop = nombreTienda.toLowerCase().replace(/\s+/g, '');
     }
    // En LocalStorage no hay verificación de email, siempre está verificado
    await sendEmailVerification(user);

    let userData = {
      uid: user.uid,
      email,
      instagram,
      facebook,
      web,
      provincia,
      ciudad,
      telefono,
      verificado: true, // En LocalStorage siempre está verificado
      verificada: true,
      esPremium: false,
      fechaRegistro: new Date().toISOString(),
      activo: true,
      tipo: tipoUsuario
    };

    if (tipoUsuario === 'particular') {
      await updateProfile(user, { displayName: `${nombre} ${apellido}` });
      userData = { ...userData, nombre, apellido };
    } else {
      await updateProfile(user, { displayName: nombreTienda });

      // Subir logo si existe
      let logoUrl = '';
      if (logo) {
        // Comprimir logo antes de guardarlo
        const options = {
          maxSizeMB: 0.3, // Máximo 300KB para logos
          maxWidthOrHeight: 500, // Máximo 500px para logos
          useWebWorker: true,
          fileType: 'image/jpeg'
        };
        
        const compressedLogo = await imageCompression(logo, options);
        const logoRef = storageRef(storage, `usuarios/${nombreTienda.toLowerCase().replace(/\s+/g, '')}-${user.uid}/logo`);
        await uploadBytes(logoRef, compressedLogo);
        logoUrl = await getDownloadURL(logoRef);
      }



      userData = {
        ...userData,
        nombreTienda,
        instagram,
        facebook,
        web,
        direccion,
        nombreResp,
        apellidoResp,
        logoUrl,
        categoria,
        subCategoria
      };
    }

    // Guardar usuario en LocalStorage
const docId = tipoUsuario === 'particular'
  ? `${nombre.toLowerCase().replace(/\s+/g, '')}+${apellido.toLowerCase().replace(/\s+/g, '')}-${user.uid}`
  : `${nombreTienda.toLowerCase().replace(/\s+/g, '')}-${user.uid}`;

      if (tipoUsuario === 'particular') {
              await setDoc(doc(db, 'usuarios', docId), {
          ...userData,
          id: docId,
          uid: user.uid // 🔑 importante
        });
            await Swal.fire('¡Registro exitoso!', 'Tu cuenta ha sido creada exitosamente.', 'success');
            // Recargar para actualizar el AuthContext
            window.location.href = '/perfil';
      } else {
      await setDoc(doc(db, 'usuarios', docId), {
        ...userData,
        id: docId,
        uid: user.uid // 🔑 importante
      });
          await Swal.fire('¡Registro exitoso!', 'Tu cuenta ha sido creada exitosamente.', 'success');
          // Recargar para actualizar el AuthContext
          window.location.href = '/perfil';
      }


} catch (error) {
  console.error(error);

  // Mapeo de errores personalizados
  const erroresFirebase = {
    'auth/email-already-in-use': 'El email ya está en uso. Por favor, utilizá otro.',
    'auth/invalid-email': 'El email ingresado no es válido.',
    'auth/weak-password': 'La contraseña es muy débil. Usá una más segura.',
    'auth/user-not-found': 'Usuario no encontrado. Verificá tus datos.',
    'auth/wrong-password': 'Contraseña incorrecta. Intentá de nuevo.',
    'auth/too-many-requests': 'Demasiados intentos. Intentá más tarde.',
    'auth/network-request-failed': 'Fallo de red. Verificá tu conexión a internet.',
    // Podés agregar más errores según tu necesidad
  };

  const mensajePersonalizado = erroresFirebase[error.code] || 'Ocurrió un error inesperado. Intentá nuevamente.';

  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensajePersonalizado
  });
}
};

  const handleImageChange = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const BotonCargaImagen = ({ label, onChange, preview }) => (
    <div style={{ marginBottom: '10px', width: '100%' }}>
      <label style={{ ...buttonStyle, width: '100%', display: 'inline-block', cursor: 'pointer' }}>
        {label}
        <input type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
      </label>
      {preview && <img src={preview} alt="Vista previa" style={{ marginTop: '5px', width: '100%', borderRadius: '6px' }} />}
    </div>
  );

  const verTerminos = () => {
  Swal.fire({
    title: 'Términos y Condiciones de Uso',
    html: `
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        <strong>1. ACEPTACIÓN DE LOS TÉRMINOS</strong><br />
        Al registrarse como tienda o particular en la plataforma digital de Cotiendas S.A.S (en adelante, “La Plataforma”), el usuario (en adelante, “el vendedor o comprador”, según corresponda) acepta de forma plena y sin reservas estos Términos y Condiciones.<br /><br />
        
        <strong>2. OBJETO DE LA PLATAFORMA</strong><br />
        La Plataforma funciona como una vidriera online gratuita o paga que permite a personas físicas o jurídicas ofrecer productos nuevos o usados a potenciales compradores. Cotiendas S.A.S. no intermedia ni participa en las transacciones, pagos, entregas ni garantías entre vendedores y compradores.<br /><br />
        
        <strong>3. LIMITACIÓN DE RESPONSABILIDAD</strong><br />
        Cotiendas S.A.S.:<br />
        - NO es parte de la compraventa entre el vendedor o comprador.<br />
        - NO garantiza la veracidad, legalidad, calidad, procedencia, estado ni entrega de los productos ofrecidos por los vendedores.<br />
        - NO se responsabiliza por estafas, fraudes, robos, incumplimientos, ni por ningún daño, directo o indirecto, derivado de las operaciones entre usuarios.<br />
        - NO monitorea ni aprueba previamente los contenidos publicados, aunque se reserva el derecho de eliminar publicaciones y usuarios que infrinjan las normas.<br /><br />
        
        <strong>4. RESPONSABILIDAD DEL VENDEDOR O COMPRADOR</strong><br />
        El vendedor o comprador se compromete a:<br />
        - Brindar información veraz y comprobable sobre su identidad, productos y condiciones de venta.<br />
        - Actuar de buena fe, sin realizar publicaciones engañosas, fraudulentas ni ilegales.<br />
        - Mantener actualizada su información comercial y de contacto.<br />
        - Ser único responsable ante cualquier reclamo, denuncia o perjuicio derivado de su actividad dentro de la Plataforma.<br /><br />
        
        <strong>5. DERECHO DE USO Y SUSPENSIÓN</strong><br />
        Cotiendas S.A.S. se reserva el derecho de:<br />
        - Suspender o eliminar cuentas sin previo aviso si detecta conductas sospechosas o contrarias a estos términos.<br />
        - Denunciar ante las autoridades cualquier actividad que pudiera constituir un delito.<br />
        - Modificar estos términos en cualquier momento, notificando mediante su sitio web o correo electrónico.<br /><br />
        
        <strong>6. JURISDICCIÓN</strong><br />
        Para cualquier controversia legal que pudiera derivarse, las partes se someten a la jurisdicción de los tribunales ordinarios de [Ciudad, País], renunciando a cualquier otro fuero que pudiera corresponder.<br /><br />

        <strong>IMPORTANTE</strong><br />
        Cotiendas S.A.S. no es responsable de las operaciones ni de sus consecuencias. Invitamos a los usuarios a verificar siempre la identidad del comprador o vendedor antes de concretar cualquier trato.
      </div>
    `,
    width: 700,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#FF6D00'
  });
};


  return (
    <div style={containerStyle}>
      {!tipoUsuario ? (
        <>
          <h2>¿Qué eres?</h2>
          <button onClick={() => setTipoUsuario('particular')} style={buttonStyle}>Particular</button>
          <button onClick={() => setTipoUsuario('tienda')} style={buttonStyle}>Tienda</button>
        </>
      ) : (
        <>
          <h2>Registro {tipoUsuario === 'particular' ? '(Particular)' : '(Tienda)'}</h2>
          {tipoUsuario === 'particular' ? (
            <>
              <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} style={inputStyle} />
            </>
          ) : (
            <>
              <input type="text" placeholder="Nombre de la tienda" value={nombreTienda} onChange={(e) => setNombreTienda(e.target.value)} style={inputStyle} />
              <BotonCargaImagen label="Logo" onChange={(e) => handleImageChange(e, setLogo, setLogoPreview)} preview={logoPreview} />
            </>
          )}
          <select value={provincia} onChange={(e) => setProvincia(e.target.value)} style={inputStyle}>
            <option value="">-- Selecciona una provincia --</option>
            {["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa",
              "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
              "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán", "Ciudad Autónoma de Buenos Aires"]
              .map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="text" placeholder="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} style={inputStyle} />
          {tipoUsuario === 'tienda' && (
            <>
              <select
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  setSubcategoria(''); // reset subtipo cuando cambia padre
                }}
                style={inputStyle}
              >
                <option value="">-- Seleccioná categoría principal --</option>
                {Object.keys(categoriasTienda).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {categoria && (
                <select
                  value={subCategoria}
                  onChange={(e) => setSubcategoria(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- Seleccioná subcategoría --</option>
                  {categoriasTienda[categoria].map((subcat) => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              )}
              <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Nombre del responsable" value={nombreResp} onChange={(e) => setNombreResp(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Apellido del responsable" value={apellidoResp} onChange={(e) => setApellidoResp(e.target.value)} style={inputStyle} />
                        <input type="text" placeholder="Instagram" value={instagram} onChange={(e) => setInsta(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Facebook" value={facebook} onChange={(e) => setFace(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Sitio Web sin -www.-" value={web} onChange={(e) => setWeb(e.target.value)} style={inputStyle} />
          
            </>
          )}
<div style={{ display: 'flex', gap: '10px' }}>
  {/* Código de área con 0 fijo */}
  <input
    type="text"
    value="(0)"
    readOnly
    style={{
      width: '30px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      textAlign: 'center',
      pointerEvents: 'none',
    }}
  />
  <input
    type="tel"
    placeholder="Cód. área"
    value={codigoArea}
    onChange={(e) => setCodigoArea(e.target.value.replace(/[^0-9]/g, ''))}
 style={{
      width: '110px',
      border: '1px solid #ccc',
      textAlign: 'center',
    }}  />

  {/* Teléfono con 15 fijo */}
  <input
    type="text"
    value="15-"
    readOnly
    style={{
      width: '30px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      textAlign: 'center',
      pointerEvents: 'none',
    }}
  />
  <input
    type="tel"
    placeholder="Número sin 15"
    value={numTel}
    onChange={(e) => setNumTel(e.target.value.replace(/[^0-9]/g, ''))}
    style={inputStyle}
  />
</div>          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Acepto los <span style={{ color: '#FF6D00', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => verTerminos()}>Términos y Condiciones</span>
            </label>
          </div>
          
          <button onClick={handleRegistro} style={buttonStyle}>Registrarte</button>
          <button onClick={() => setTipoUsuario(null)} style={{ ...buttonStyle, backgroundColor: 'gray' }}>Volver</button>
        </>
      )}
    </div>
  );
};

const containerStyle = {
  maxWidth: '400px',
  margin: '20px auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  textAlign: 'center'
};

const inputStyle = {
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  backgroundColor: '#FF6D00',
  color: 'white',
  border: 'none',
  padding: '10px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  width: '100%'
};

export default Registro;
