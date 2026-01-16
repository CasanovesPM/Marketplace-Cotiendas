// Servicio centralizado para manejar LocalStorage
// Reemplaza Firebase Auth, Firestore y Storage

// ========== AUTHENTICATION ==========

// Generar un ID único simple
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Obtener usuarios del LocalStorage
const getUsers = () => {
  const users = localStorage.getItem('marketplace_users');
  return users ? JSON.parse(users) : [];
};

// Guardar usuarios en LocalStorage
const saveUsers = (users) => {
  localStorage.setItem('marketplace_users', JSON.stringify(users));
};

// Obtener sesión actual
const getCurrentSession = () => {
  const session = localStorage.getItem('marketplace_current_session');
  return session ? JSON.parse(session) : null;
};

// Guardar sesión
const saveSession = (user) => {
  localStorage.setItem('marketplace_current_session', JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified || true, // Para LocalStorage siempre verificamos
    createdAt: new Date().toISOString()
  }));
};

// Eliminar sesión
const clearSession = () => {
  localStorage.removeItem('marketplace_current_session');
};

// Crear usuario con email y contraseña
export const createUserWithEmailAndPassword = async (email, password, displayName = '') => {
  const users = getUsers();
  
  // Verificar si el email ya existe
  if (users.find(u => u.email === email)) {
    throw { code: 'auth/email-already-in-use', message: 'El email ya está en uso.' };
  }

  // Validar contraseña
  if (password.length < 6) {
    throw { code: 'auth/weak-password', message: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const uid = generateId();
  const newUser = {
    uid,
    email,
    password, // En producción esto debería estar hasheado, pero para LocalStorage lo dejamos así
    displayName,
    emailVerified: true, // En LocalStorage siempre verificamos
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  
  // Iniciar sesión automáticamente después de crear el usuario
  saveSession(newUser);
  
  return {
    user: {
      ...newUser,
      emailVerified: true
    }
  };
};

// Iniciar sesión con email y contraseña
export const signInWithEmailAndPassword = async (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw { code: 'auth/user-not-found', message: 'Usuario no encontrado o contraseña incorrecta.' };
  }

  saveSession(user);
  return {
    user: {
      ...user,
      emailVerified: true
    }
  };
};

// Cerrar sesión
export const signOut = async () => {
  clearSession();
};

// Obtener usuario actual
export const getCurrentUser = () => {
  const session = getCurrentSession();
  if (!session) return null;
  
  const users = getUsers();
  const user = users.find(u => u.uid === session.uid);
  return user ? { ...user, emailVerified: true } : null;
};

// Observador de cambios de autenticación (simulado)
export const onAuthStateChanged = (callback) => {
  // Ejecutar callback inmediatamente con el usuario actual
  const currentUser = getCurrentUser();
  callback(currentUser);

  // Escuchar cambios en LocalStorage (cuando se actualiza la sesión)
  const handleStorageChange = (e) => {
    if (e.key === 'marketplace_current_session' || e.key === null) {
      const updatedUser = getCurrentUser();
      callback(updatedUser);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // También verificar periódicamente (por si el cambio es en la misma pestaña)
  const intervalId = setInterval(() => {
    const updatedUser = getCurrentUser();
    if (updatedUser !== currentUser) {
      callback(updatedUser);
    }
  }, 1000);

  // Función de limpieza
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(intervalId);
  };
};

// Actualizar perfil
export const updateProfile = async (user, { displayName }) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === user.uid);
  
  if (userIndex !== -1) {
    users[userIndex].displayName = displayName;
    saveUsers(users);
    
    // Actualizar sesión
    const updatedUser = users[userIndex];
    saveSession(updatedUser);
  }
};

// Actualizar contraseña
export const updatePassword = async (user, newPassword) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === user.uid);
  
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    saveUsers(users);
  }
};

// ========== FIRESTORE (DATABASE) ==========

// Obtener colección
const getCollection = (collectionName) => {
  const data = localStorage.getItem(`marketplace_${collectionName}`);
  return data ? JSON.parse(data) : {};
};

// Guardar colección con manejo de errores de cuota
const saveCollection = (collectionName, data) => {
  try {
    localStorage.setItem(`marketplace_${collectionName}`, JSON.stringify(data));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Intentar limpiar datos antiguos si hay error de cuota
      console.warn('LocalStorage lleno, intentando limpiar datos antiguos...');
      limpiarDatosAntiguos();
      // Intentar de nuevo
      try {
        localStorage.setItem(`marketplace_${collectionName}`, JSON.stringify(data));
      } catch (e) {
        throw new Error('No hay suficiente espacio en LocalStorage. Por favor, elimina algunos productos o imágenes antiguas.');
      }
    } else {
      throw error;
    }
  }
};

// Función para limpiar datos antiguos (productos con más de 30 días)
const limpiarDatosAntiguos = () => {
  try {
    const productos = getCollection('productos');
    const ahora = new Date();
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let productosEliminados = 0;
    Object.keys(productos).forEach(id => {
      const producto = productos[id];
      const fechaCreacion = producto.createdAt ? new Date(producto.createdAt) : new Date(producto.fecha);
      
      if (fechaCreacion < hace30Dias) {
        // Eliminar imágenes asociadas
        if (producto.imagenes && Array.isArray(producto.imagenes)) {
          producto.imagenes.forEach(imgPath => {
            const storage = getStorage();
            // Buscar y eliminar la imagen
            Object.keys(storage).forEach(key => {
              if (key.includes(id)) {
                delete storage[key];
              }
            });
            saveStorage(storage);
          });
        }
        delete productos[id];
        productosEliminados++;
      }
    });
    
    if (productosEliminados > 0) {
      saveCollection('productos', productos);
      console.log(`Se eliminaron ${productosEliminados} productos antiguos para liberar espacio.`);
    }
  } catch (error) {
    console.error('Error al limpiar datos antiguos:', error);
  }
};

// Crear documento
export const setDoc = async (docRef, data) => {
  const collectionName = docRef._collection;
  const docId = docRef._id;
  
  const collection = getCollection(collectionName);
  collection[docId] = {
    ...data,
    id: docId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveCollection(collectionName, collection);
};

// Obtener documento
export const getDoc = async (docRef) => {
  const collectionName = docRef._collection;
  const docId = docRef._id;
  
  const collection = getCollection(collectionName);
  const docData = collection[docId];
  
  return {
    exists: () => !!docData,
    data: () => docData || {},
    id: docId
  };
};

// Obtener todos los documentos de una colección
export const getDocs = async (queryRef) => {
  const collectionName = queryRef._collection;
  const collection = getCollection(collectionName);
  
  // Crear un objeto db simulado para usar en doc()
  const dbSimulado = {};
  
  let docs = Object.keys(collection).map(id => ({
    id,
    data: () => collection[id],
    ref: doc(dbSimulado, collectionName, id) // Agregar referencia al documento
  }));

  // Aplicar filtros si existen
  if (queryRef._where) {
    queryRef._where.forEach(filter => {
      docs = docs.filter(doc => {
        const data = doc.data();
        const value = data[filter.field];
        
        if (filter.operator === '==') {
          return value === filter.value;
        }
        // Agregar más operadores si es necesario
        return true;
      });
    });
  }

  return {
    docs,
    empty: docs.length === 0,
    forEach: (callback) => docs.forEach(callback)
  };
};

// Actualizar documento
export const updateDoc = async (docRef, data) => {
  const collectionName = docRef._collection;
  const docId = docRef._id;
  
  const collection = getCollection(collectionName);
  if (collection[docId]) {
    collection[docId] = {
      ...collection[docId],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveCollection(collectionName, collection);
  }
};

// Eliminar documento
export const deleteDoc = async (docRef) => {
  const collectionName = docRef._collection;
  const docId = docRef._id;
  
  const collection = getCollection(collectionName);
  delete collection[docId];
  saveCollection(collectionName, collection);
};

// Agregar documento (con ID automático)
export const addDoc = async (collectionRef, data) => {
  const collectionName = collectionRef._collection;
  const docId = generateId();
  
  const collection = getCollection(collectionName);
  collection[docId] = {
    ...data,
    id: docId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveCollection(collectionName, collection);
  
  return { id: docId };
};

// Referencia a documento (soporta subcolecciones: doc(db, 'usuarios', userId, 'comentarios', comentarioId))
export const doc = (db, collectionName, ...pathSegments) => {
  if (pathSegments.length === 0) {
    throw new Error('doc() requiere al menos un ID de documento');
  }
  
  // El último segmento es el ID del documento
  const docId = pathSegments[pathSegments.length - 1];
  
  // Si hay más de un segmento, es una subcolección
  if (pathSegments.length > 1) {
    const subcollectionPath = pathSegments.slice(0, -1).join('/');
    const fullPath = `${collectionName}/${subcollectionPath}`;
    return {
      _collection: fullPath,
      _id: docId
    };
  }
  
  return {
    _collection: collectionName,
    _id: docId
  };
};

// Referencia a colección (soporta subcolecciones: collection(db, 'usuarios', userId, 'comentarios'))
export const collection = (db, collectionName, ...pathSegments) => {
  if (pathSegments.length > 0) {
    // Es una subcolección: usuarios/{userId}/comentarios
    const fullPath = `${collectionName}/${pathSegments.join('/')}`;
    return {
      _collection: fullPath
    };
  }
  return {
    _collection: collectionName
  };
};

// Query builder
export const query = (collectionRef, ...queryConstraints) => {
  const whereFilters = [];
  
  queryConstraints.forEach(constraint => {
    if (constraint._type === 'where') {
      whereFilters.push({
        field: constraint._field,
        operator: constraint._operator,
        value: constraint._value
      });
    }
  });
  
  return {
    _collection: collectionRef._collection,
    _where: whereFilters
  };
};

// Where constraint
export const where = (field, operator, value) => {
  return {
    _type: 'where',
    _field: field,
    _operator: operator,
    _value: value
  };
};

// Increment (para estadísticas)
export const increment = (value) => {
  return {
    _type: 'increment',
    _value: value
  };
};

// Server timestamp (simulado)
export const serverTimestamp = () => {
  return new Date().toISOString();
};

// Delete field
export const deleteField = () => {
  return {
    _type: 'delete'
  };
};

// Order by (para queries)
export const orderBy = (field, direction = 'asc') => {
  return {
    _type: 'orderBy',
    _field: field,
    _direction: direction
  };
};

// Limit
export const limit = (count) => {
  return {
    _type: 'limit',
    _count: count
  };
};

// Start after (paginación)
export const startAfter = (doc) => {
  return {
    _type: 'startAfter',
    _doc: doc
  };
};

// ========== STORAGE (IMÁGENES) ==========

// Convertir File a base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Obtener storage
const getStorage = () => {
  const storage = localStorage.getItem('marketplace_storage');
  return storage ? JSON.parse(storage) : {};
};

// Guardar en storage con manejo de errores de cuota
const saveStorage = (storage) => {
  try {
    localStorage.setItem('marketplace_storage', JSON.stringify(storage));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Intentar limpiar imágenes antiguas si hay error de cuota
      console.warn('LocalStorage lleno, intentando limpiar datos antiguos...');
      limpiarDatosAntiguos();
      // Intentar de nuevo
      try {
        localStorage.setItem('marketplace_storage', JSON.stringify(storage));
      } catch (e) {
        throw new Error('No hay suficiente espacio en LocalStorage. Por favor, elimina algunos productos o imágenes antiguas.');
      }
    } else {
      throw error;
    }
  }
};

// Subir bytes (imagen)
export const uploadBytes = async (storageRef, file) => {
  const path = storageRef._path;
  const base64 = await fileToBase64(file);
  
  const storage = getStorage();
  storage[path] = base64;
  saveStorage(storage);
  
  return { ref: storageRef };
};

// Obtener URL de descarga (retorna base64)
export const getDownloadURL = async (storageRef) => {
  const path = storageRef._path;
  const storage = getStorage();
  return storage[path] || '';
};

// Referencia de storage
export const ref = (storage, path) => {
  return {
    _path: path,
    _storage: storage
  };
};

// Eliminar objeto de storage
export const deleteObject = async (storageRef) => {
  const path = storageRef._path;
  const storage = getStorage();
  delete storage[path];
  saveStorage(storage);
};

// Obtener blob (no necesario para LocalStorage, pero mantenemos la API)
export const getBlob = async (storageRef) => {
  const base64 = await getDownloadURL(storageRef);
  // Convertir base64 a blob si es necesario
  const response = await fetch(base64);
  return await response.blob();
};

// Listar todos los objetos
export const listAll = async (storageRef) => {
  const prefix = storageRef._path;
  const storage = getStorage();
  const items = Object.keys(storage)
    .filter(path => path.startsWith(prefix))
    .map(path => ({
      fullPath: path,
      name: path.split('/').pop()
    }));
  
  return {
    items
  };
};

// ========== UTILIDADES ==========

// Limpiar todos los datos (útil para desarrollo)
export const clearAllData = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('marketplace_')) {
      localStorage.removeItem(key);
    }
  });
};

// Exportar datos (backup)
export const exportData = () => {
  const data = {};
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('marketplace_')) {
      data[key] = localStorage.getItem(key);
    }
  });
  return JSON.stringify(data, null, 2);
};

// Importar datos (restore)
export const importData = (jsonData) => {
  const data = JSON.parse(jsonData);
  Object.keys(data).forEach(key => {
    if (key.startsWith('marketplace_')) {
      localStorage.setItem(key, data[key]);
    }
  });
};
