import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import CustomButton from "../components/CustomButton";
import { useExpenses } from "../contexts/ExpenseContext";

export default function AddExpenseScreen({ navigation }: any) {
  const { addExpense } = useExpenses();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");

  const handleAdd = () => {
    if (!description || !amount) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }
    addExpense({
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    });
    Alert.alert("Éxito", "Gasto agregado");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Almuerzo en restaurante"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 150"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Categoría</Text>
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

      <CustomButton title="Guardar Gasto" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 16, marginTop: 10, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
});
