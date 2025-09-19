import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjPQgbfGdCbI0ryY6RL-DwcggKS-8-DU0",
  authDomain: "organizador-de-gastos-ea5ea.firebaseapp.com",
  projectId: "organizador-de-gastos-ea5ea",
  storageBucket: "organizador-de-gastos-ea5ea.firebasestorage.app",
  messagingSenderId: "810017621757",
  appId: "1:810017621757:web:b98876b0c0cf5c588f2094",
  measurementId: "G-LGPFLZS8J4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
