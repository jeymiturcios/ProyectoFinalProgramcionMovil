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

  // Cargar datos guardados localmente al iniciar o cuando cambie el usuario
  useEffect(() => {
    if (auth.currentUser) {
      loadLocalExpenses();
    }
  }, [auth.currentUser?.uid]);

  // Cargar gastos desde AsyncStorage por usuario
  const loadLocalExpenses = async () => {
    try {
      if (!auth.currentUser) return;
      const userKey = `expenses_${auth.currentUser.uid}`;
      const savedExpenses = await AsyncStorage.getItem(userKey);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error("Error cargando gastos locales:", error);
    }
  };

  // Guardar gastos en AsyncStorage por usuario
  const saveLocalExpenses = async (newExpenses: Expense[]) => {
    try {
      if (!auth.currentUser) return;
      const userKey = `expenses_${auth.currentUser.uid}`;
      await AsyncStorage.setItem(userKey, JSON.stringify(newExpenses));
    } catch (error) {
      console.error("Error guardando gastos locales:", error);
    }
  };

  // 🔴 Suscripción en tiempo real
  useEffect(() => {
    if (!auth.currentUser) {
      // Si no hay usuario, limpiar gastos
      setExpenses([]);
      return;
    }

    const userId = auth.currentUser.uid;
    const q = query(collection(db, "users", userId, "expenses"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Expense[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...(docSnap.data() as Expense) });
      });
      setExpenses(loaded);
      // Guardar también localmente
      saveLocalExpenses(loaded);
    });

    // Se desuscribe al desmontar o cerrar sesión
    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  // Agregar gasto
  const addExpense = async (expense: Omit<Expense, "id">) => {
    if (!auth.currentUser) {
      // Si no hay usuario autenticado, guardar solo localmente
      const newExpense = { ...expense, id: Date.now().toString() };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      await saveLocalExpenses(updatedExpenses);
      return;
    }
    
    const userId = auth.currentUser.uid;
    await addDoc(collection(db, "users", userId, "expenses"), expense);
  };

  // Eliminar gasto
  const deleteExpense = async (id: string) => {
    if (!auth.currentUser) {
      // Si no hay usuario autenticado, eliminar solo localmente
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      await saveLocalExpenses(updatedExpenses);
      return;
    }
    
    const userId = auth.currentUser.uid;
    await deleteDoc(doc(db, "users", userId, "expenses", id));
  };

  // Editar gasto
  const updateExpense = async (id: string, expense: Omit<Expense, "id">) => {
    if (!auth.currentUser) {
      // Si no hay usuario autenticado, actualizar solo localmente
      const updatedExpenses = expenses.map(exp => 
        exp.id === id ? { ...expense, id } : exp
      );
      setExpenses(updatedExpenses);
      await saveLocalExpenses(updatedExpenses);
      return;
    }
    
    const userId = auth.currentUser.uid;
    const docRef = doc(db, "users", userId, "expenses", id);
    await updateDoc(docRef, expense);
  };

  // Limpiar gastos locales (cuando se cierre sesión)
  const clearExpenses = async () => {
    setExpenses([]);
    if (auth.currentUser) {
      const userKey = `expenses_${auth.currentUser.uid}`;
      await AsyncStorage.removeItem(userKey);
    }
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

