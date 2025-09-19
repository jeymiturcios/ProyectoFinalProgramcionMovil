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
  query,
  getDocs
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
  forceReloadFromFirebase: () => void;
};

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Cargar datos guardados localmente al iniciar o cuando cambie el usuario
  useEffect(() => {
    console.log("🔄 Usuario cambió:", auth.currentUser?.email || "Sin usuario");
    listAllAsyncStorageKeys(); // Debug: listar todas las claves
    
    const loadUserData = async () => {
      // 1. Cargar locales primero
      await loadLocalExpenses();
      
      // 2. Si hay usuario, cargar desde Firebase también
      if (auth.currentUser) {
        console.log("🔥 Cargando desde Firebase para:", auth.currentUser.email);
        await forceReloadFromFirebase();
      }
    };
    
    loadUserData();
  }, [auth.currentUser?.uid]);

  // Función para listar todas las claves de AsyncStorage (debug)
  const listAllAsyncStorageKeys = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const expenseKeys = keys.filter(key => key.includes('expense'));
      console.log("🔍 Todas las claves de gastos en AsyncStorage:", expenseKeys);
      
      for (const key of expenseKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const expenses = JSON.parse(value);
          console.log(`📋 Clave "${key}":`, expenses.length, "gastos");
        }
      }
    } catch (error) {
      console.error("Error listando claves:", error);
    }
  };

  // Función para migrar gastos globales a un usuario específico (para nuevos usuarios)
  const migrateGlobalExpensesToUser = async (userId: string) => {
    try {
      const globalExpenses = await AsyncStorage.getItem("expenses_global");
      if (globalExpenses) {
        const expenses = JSON.parse(globalExpenses);
        if (expenses.length > 0) {
          // Guardar gastos globales como gastos del usuario
          const userKey = `expenses_${userId}`;
          await AsyncStorage.setItem(userKey, JSON.stringify(expenses));
          
          // Limpiar gastos globales
          await AsyncStorage.removeItem("expenses_global");
          
          console.log(`Migrados ${expenses.length} gastos globales al usuario ${userId}`);
        }
      }
    } catch (error) {
      console.error("Error migrando gastos globales:", error);
    }
  };

  // Cargar gastos desde AsyncStorage por usuario
  const loadLocalExpenses = async () => {
    try {
      if (!auth.currentUser) {
        // Si no hay usuario, cargar gastos globales (para usuarios no autenticados)
        const savedExpenses = await AsyncStorage.getItem("expenses_global");
        if (savedExpenses) {
          const expenses = JSON.parse(savedExpenses);
          console.log("📱 Cargando gastos globales:", expenses.length);
          setExpenses(expenses);
        } else {
          console.log("📱 No hay gastos globales");
        }
        return;
      }
      const userKey = `expenses_${auth.currentUser.uid}`;
      console.log("🔑 Buscando gastos con clave:", userKey);
      const savedExpenses = await AsyncStorage.getItem(userKey);
      if (savedExpenses) {
        const expenses = JSON.parse(savedExpenses);
        console.log(`💾 Cargando gastos locales para usuario ${auth.currentUser.email}:`, expenses.length, expenses);
        setExpenses(expenses);
      } else {
        console.log(`❌ No hay gastos locales para usuario ${auth.currentUser.email} con clave ${userKey}`);
        
        // Buscar en todas las claves posibles
        const possibleKeys = [
          "expenses", // Clave antigua
          "expenses_global", // Gastos globales
          `expenses_${auth.currentUser.email}`, // Por email
        ];
        
        for (const key of possibleKeys) {
          const foundExpenses = await AsyncStorage.getItem(key);
          if (foundExpenses) {
            const expenses = JSON.parse(foundExpenses);
            console.log(`🎯 ¡ENCONTRADOS! Gastos en clave "${key}":`, expenses.length, expenses);
            setExpenses(expenses);
            // Migrar a la clave correcta del usuario
            await AsyncStorage.setItem(userKey, foundExpenses);
            if (key !== userKey) {
              await AsyncStorage.removeItem(key);
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error("❌ Error cargando gastos locales:", error);
    }
  };

  // Guardar gastos en AsyncStorage por usuario
  const saveLocalExpenses = async (newExpenses: Expense[]) => {
    try {
      if (!auth.currentUser) {
        // Si no hay usuario, guardar en gastos globales
        await AsyncStorage.setItem("expenses_global", JSON.stringify(newExpenses));
        return;
      }
      const userKey = `expenses_${auth.currentUser.uid}`;
      await AsyncStorage.setItem(userKey, JSON.stringify(newExpenses));
    } catch (error) {
      console.error("Error guardando gastos locales:", error);
    }
  };

  // 🔴 Carga directa y agresiva
  useEffect(() => {
    console.log("🔥 INICIANDO CARGA para:", auth.currentUser?.email || "Sin usuario");
    
    const loadEverything = async () => {
      if (!auth.currentUser) {
        console.log("📱 Sin usuario - cargando gastos globales");
        await loadLocalExpenses();
        return;
      }

      const userId = auth.currentUser.uid;
      console.log("👤 Usuario:", auth.currentUser.email, "UID:", userId);
      
      // 1. Cargar locales primero
      console.log("💾 Paso 1: Cargando locales");
      await loadLocalExpenses();
      
      // 2. Migrar globales si es necesario
      console.log("🔄 Paso 2: Migrando globales");
      await migrateGlobalExpensesToUser(userId);
      
      // 3. Cargar desde Firebase SIEMPRE
      console.log("🔥 Paso 3: Cargando desde Firebase");
      try {
        const q = query(collection(db, "users", userId, "expenses"));
        const snapshot = await getDocs(q);
        const loaded: Expense[] = [];
        
        console.log(`📊 Firebase devolvió ${snapshot.size} documentos`);
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          console.log(`📄 Gasto encontrado:`, data);
          loaded.push({ id: docSnap.id, ...data as Expense });
        });
        
        console.log(`✅ CARGANDO ${loaded.length} gastos en la app`);
        setExpenses(loaded);
        await saveLocalExpenses(loaded);
        
        // Si no hay gastos, mostrar mensaje
        if (loaded.length === 0) {
          console.log("⚠️ NO HAY GASTOS EN FIREBASE para este usuario");
        }
        
      } catch (error) {
        console.error("❌ ERROR CRÍTICO en Firebase:", error);
      }
    };
    
    // Ejecutar carga completa
    loadEverything();
    
    // Mantener onSnapshot para cambios
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const q = query(collection(db, "users", userId, "expenses"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log(`🔄 onSnapshot: ${snapshot.size} documentos`);
        const loaded: Expense[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() as Expense });
        });
        setExpenses(loaded);
        saveLocalExpenses(loaded);
      });
      
      return () => unsubscribe();
    }
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
    // NO eliminar los gastos del usuario, solo limpiar la vista actual
    // Los gastos se mantienen para cuando el usuario vuelva a iniciar sesión
  };

  // Forzar recarga desde Firebase
  const forceReloadFromFirebase = async () => {
    if (!auth.currentUser) {
      console.log("❌ No hay usuario autenticado para recargar desde Firebase");
      return;
    }

    console.log("🔄 Forzando recarga desde Firebase para:", auth.currentUser.email);
    const userId = auth.currentUser.uid;
    const q = query(collection(db, "users", userId, "expenses"));
    
    try {
      const snapshot = await getDocs(q);
      const loaded: Expense[] = [];
      
      console.log(`🔥 Firebase getDocs para ${auth.currentUser.email}:`, snapshot.size, "documentos");
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        console.log(`📄 Documento ${docSnap.id}:`, data);
        loaded.push({ id: docSnap.id, ...data as Expense });
      });
      
      console.log(`📊 Gastos cargados desde Firebase:`, loaded.length, loaded);
      setExpenses(loaded);
      await saveLocalExpenses(loaded);
    } catch (error) {
      console.error("❌ Error forzando recarga desde Firebase:", error);
    }
  };



  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, updateExpense, clearExpenses, forceReloadFromFirebase }}>
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

