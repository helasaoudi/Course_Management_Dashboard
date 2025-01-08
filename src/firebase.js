import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // pour l'authentification
import { getFirestore, collection, getDocs, doc, getDoc,addDoc,deleteDoc,updateDoc,query, where } from 'firebase/firestore';  // Ajoutez 'getDoc'
import { getStorage } from 'firebase/storage';  // Importer Firebase Storage


const firebaseConfig = {
  apiKey: "AIzaSyBqaLYv8kyuupU4yeFYjCbOVUFOSHud1Kc",
  authDomain: "schoolmangement-a0672.firebaseapp.com",
  projectId: "schoolmangement-a0672",
  storageBucket: "schoolmangement-a0672.appspot.com",
  messagingSenderId: "982347127209",
  appId: "1:982347127209:web:dbad4a8348bb7561cdccb8",
  measurementId: "G-PKQH1NW777"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // pour l'authentification
const db = getFirestore(app);  // pour Firestore
export const storage = getStorage(app);  // Exporter le storage

export { auth, db, collection,addDoc, getDocs, doc, getDoc,deleteDoc,updateDoc,query, where};  // N'oubliez pas d'exporter 'getDoc'
