// src/services/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDaRtPUGlO5Pb1765sDBPwNBfk-aybRErE",
  authDomain: "vivaimoveis-700f3.firebaseapp.com",
  projectId: "vivaimoveis-700f3",
  storageBucket: "vivaimoveis-700f3.firebasestorage.app",
  messagingSenderId: "967337325364",
  appId: "1:967337325364:web:4ac7e70a2e7c795bc3ab61"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)