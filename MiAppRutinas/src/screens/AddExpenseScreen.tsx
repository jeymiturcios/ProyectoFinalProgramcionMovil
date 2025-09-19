import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Switch } from "react-native";
import CustomButton from "../components/CustomButton";
import { useExpenses } from "../contexts/ExpenseContext";

// 🎨 Temas
const lightTheme = { background: "#fff", text: "#222", border: "#ccc" };
const darkTheme = { background: "#121212", text: "#fff", border: "#333" };

export default function AddExpenseScreen({ route, navigation }: any) {
  const { addExpense, updateExpense } = useExpenses();
  const expense = route.params?.expense;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

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

      <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Ej: Almuerzo en restaurante"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={[styles.label, { color: theme.text }]}>Monto</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Ej: 150"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={[styles.label, { color: theme.text }]}>Categoría</Text>
      <View style={styles.categories}>
        {["Comida", "Transporte", "Ocio", "Otros"].map((cat) => (
          <CustomButton
            key={cat}
            title={cat}
            onPress={() => setCategory(cat)}
            variant={category === cat ? "secondary" : "tertiary"}
          />
        ))}
      </View>

      <CustomButton title={expense ? "Actualizar Gasto" : "Guardar Gasto"} onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 5, fontSize: 16 },
  categories: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginVertical: 10 },
});

// npx react-native run-android
