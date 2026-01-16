// Reemplazo de Firebase con LocalStorage
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  setDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  deleteField,
  increment,
  serverTimestamp,
  orderBy,
  limit,
  startAfter,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getBlob,
  listAll
} from './services/localStorageService';

// Objeto auth simulado (compatible con Firebase Auth API)
// currentUser se actualiza dinámicamente
const auth = {
  get currentUser() {
    return getCurrentUser();
  },
  signOut: signOut,
  // Métodos adicionales que pueden ser necesarios
  onAuthStateChanged: onAuthStateChanged
};

// Objeto db simulado (compatible con Firestore API)
const db = {
  // Se usa directamente con las funciones importadas
};

// Objeto storage simulado (compatible con Firebase Storage API)
const storage = {
  // Se usa directamente con las funciones importadas
};

// Función sendEmailVerification simulada (no hace nada en LocalStorage)
const sendEmailVerification = async (user) => {
  // En LocalStorage, el email siempre está "verificado"
  return Promise.resolve();
};

export {
  increment,
  serverTimestamp,
  getBlob,
  listAll,
  onAuthStateChanged,
  auth,
  db,
  storage,
  updateProfile,
  updatePassword,
  sendEmailVerification,
  signOut,
  startAfter,
  limit,
  storageRef,
  orderBy,
  deleteObject,
  uploadBytes,
  getDownloadURL,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  deleteField
};