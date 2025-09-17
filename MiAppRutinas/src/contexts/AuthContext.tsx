// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

type User = {
  email: string;
  tipoUsuario?: string;
} | null;

const AuthContext = createContext<{
  user: User;
  isAllowed: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, tipoUsuario: string) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  // 🔑 Iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setUser({ email });
      setIsAllowed(true);
    } catch (err: any) {
      console.error("Error en login:", err.message);
      throw err;
    }
  };

  // 🆕 Registro con Firebase Auth + Firestore
  const register = async (email: string, password: string, tipoUsuario: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Guardar datos en Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        tipoUsuario,
        createdAt: new Date(),
      });
      setUser({ email, tipoUsuario });
      setIsAllowed(true);
    } catch (err: any) {
      console.error("Error en register:", err.message);
      throw err;
    }
  };

  // 🚪 Cerrar sesión
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAllowed(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAllowed, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
