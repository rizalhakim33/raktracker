import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Isi dari Firebase Console -> Project Settings -> SDK setup
// Untuk dev bisa pakai .env, fallback ke dummy biar build tidak error sebelum config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "dummy",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const isFirebaseConfigured = () => import.meta.env.VITE_FIREBASE_PROJECT_ID != null && import.meta.env.VITE_FIREBASE_PROJECT_ID !== "";
