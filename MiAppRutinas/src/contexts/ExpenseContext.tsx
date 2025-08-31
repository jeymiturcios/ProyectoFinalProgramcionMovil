import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      ...expense,
    };
    setExpenses((prev) => {
      const updated = [...prev, newExpense];
      AsyncStorage.setItem("expenses", JSON.stringify(updated));
      return updated;
    });
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