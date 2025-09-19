import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../config/firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query 
} from "firebase/firestore";

// Tipo de gasto
export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

// Tipo de contexto
type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, expense: Omit<Expense, "id">) => void;
  clearExpenses: () => void;
};

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // 🔴 Suscripción en tiempo real
  useEffect(() => {
    if (!auth.currentUser) return; // si no hay usuario, no escuchar

    const userId = auth.currentUser.uid;
    const q = query(collection(db, "users", userId, "expenses"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Expense[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...(docSnap.data() as Expense) });
      });
      setExpenses(loaded);
    });

    // Se desuscribe al desmontar o cerrar sesión
    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  // Agregar gasto
  const addExpense = async (expense: Omit<Expense, "id">) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    await addDoc(collection(db, "users", userId, "expenses"), expense);
  };

  // Eliminar gasto
  const deleteExpense = async (id: string) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    await deleteDoc(doc(db, "users", userId, "expenses", id));
  };

  // Editar gasto
  const updateExpense = async (id: string, expense: Omit<Expense, "id">) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const docRef = doc(db, "users", userId, "expenses", id);
    await updateDoc(docRef, expense);
  };

  // Limpiar gastos locales (cuando se cierre sesión)
  const clearExpenses = () => {
    setExpenses([]);
    AsyncStorage.removeItem("expenses");
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, updateExpense, clearExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses debe usarse dentro de ExpenseProvider");
  }
  return context;
};

