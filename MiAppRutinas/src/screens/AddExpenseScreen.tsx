import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Switch, TouchableOpacity } from "react-native";
import CustomButton from "../components/CustomButton";
import { useExpenses } from "../contexts/ExpenseContext";

// 🎨 Temas
const lightTheme = { 
  background: "#f9f9f9", 
  card: "#fff",
  text: "#222", 
  subText: "#555",
  border: "#ccc",
  success: "#008000"
};
const darkTheme = { 
  background: "#121212", 
  card: "#1E1E1E",
  text: "#fff", 
  subText: "#aaa",
  border: "#333",
  success: "#4CAF50"
};

export default function AddExpenseScreen({ route, navigation }: any) {
  const { addExpense, updateExpense } = useExpenses();
  const expense = route.params?.expense;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

  const categoryIcons: Record<string, string> = {
    Comida: "🍔",
    Transporte: "🚗",
    Ocio: "🎉",
    Otros: "💡",
  };

  const categoryLabels: Record<string, string> = {
    Comida: "Comida",
    Transporte: "Transporte",
    Ocio: "Ocio",
    Otros: "Otros",
  };

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
    }
  }, [expense]);

  const handleSave = () => {
    if (!description || !amount) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    if (expense) {
      updateExpense(expense.id, {
        description,
        amount: parseFloat(amount),
        category,
        date: expense.date,
      });
      Alert.alert("Éxito", "Gasto actualizado", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } else {
      addExpense({
        description,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString(),
      });
      Alert.alert("Éxito", "Gasto agregado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
        <Text style={{ color: theme.text, marginRight: 8 }}>🌞 / 🌙</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      {/* Campo Descripción */}
      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.inputHeader}>
          <Text style={[styles.inputIcon, { color: theme.success }]}>📝</Text>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Descripción</Text>
        </View>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Ej: Almuerzo en restaurante"
          placeholderTextColor={theme.subText}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Campo Monto */}
      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.inputHeader}>
          <Text style={[styles.inputIcon, { color: theme.success }]}>💰</Text>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Monto</Text>
        </View>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Ej: 150.00"
          placeholderTextColor={theme.subText}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Categorías compactas */}
      <View style={[styles.categoriesContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.categoriesTitle, { color: theme.text }]}>🏷️ Categoría:</Text>
        <View style={styles.categoriesRow}>
          {["Comida", "Transporte", "Ocio", "Otros"].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: category === cat ? theme.success : theme.background,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryIcon,
                { color: category === cat ? "#fff" : theme.text }
              ]}>
                {categoryIcons[cat]}
              </Text>
              <Text style={[
                styles.categoryButtonText,
                { color: category === cat ? "#fff" : theme.text }
              ]}>
                {categoryLabels[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <CustomButton title={expense ? "Actualizar Gasto" : "Guardar Gasto"} onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  // Estilos para contenedores de input
  inputContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: { 
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  // Estilos para categorías
  categoriesContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryButtonText: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});

// npx react-native run-android
