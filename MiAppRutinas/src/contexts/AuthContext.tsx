import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type User = {
  uid: string;
  email: string | null;
  userType: string | null; // 👈 tipo de usuario
} | null;

const AuthContext = createContext<{
  user: User;
  isAllowed: boolean;
  login: (email: string) => void;
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  useEffect(() => {
    // 👀 Detectar cambios en Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        // Buscar userType en Firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(docRef);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          userType: snap.exists() ? snap.data().userType : null,
        });
        setIsAllowed(true);
      } else {
        setUser(null);
        setIsAllowed(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = (email: string) => {
    // Ya no hace falta manejar manualmente, Firebase lo controla
    setUser({ uid: "manual", email, userType: null });
    setIsAllowed(true);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAllowed(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAllowed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
