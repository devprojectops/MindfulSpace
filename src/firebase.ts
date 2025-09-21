// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2KVabzuivD3b6ruHyoZRXkbY93o8P1nc",
  authDomain: "ai-wellness-2025.firebaseapp.com",
  projectId: "ai-wellness-2025",
  storageBucket: "ai-wellness-2025.firebasestorage.app",
  messagingSenderId: "770458530021",
  appId: "1:770458530021:web:710bff3e9c7dfb70d1e40c",
  measurementId: "G-CX1QW8L08R"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Add some debugging
console.log('Firebase initialized');
console.log('Firestore app:', db.app.name);
console.log('Project ID:', firebaseConfig.projectId);

export default app;
