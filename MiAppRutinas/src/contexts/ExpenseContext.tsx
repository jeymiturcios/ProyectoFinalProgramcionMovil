import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../config/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

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
  clearExpenses: () => void;
};

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Agregar un gasto nuevo
const addExpense = async (expense: Omit<Expense, "id">) => {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;

  await addDoc(collection(db, "users", userId, "expenses"), expense);
  loadExpenses(); // recarga lista
};

  // loadExpenses
const loadExpenses = async () => {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;

  const q = query(collection(db, "users", userId, "expenses"));
  const querySnapshot = await getDocs(q);

  const loaded: Expense[] = [];
  querySnapshot.forEach((doc) => {
    loaded.push({ id: doc.id, ...(doc.data() as Expense) });
  });
  setExpenses(loaded);
};

  // Limpiar gastos (opcional, para debug)
  const clearExpenses = () => {
    setExpenses([]);
    AsyncStorage.removeItem("expenses");
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, clearExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Hook para usar el contexto
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses debe usarse dentro de ExpenseProvider");
  }
  return context;
};