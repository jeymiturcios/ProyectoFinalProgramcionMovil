import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useExpenses } from "../contexts/ExpenseContext";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
export default function Home() {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.amount}>L {item.amount.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Hola {user?.email}, aquí están tus gastos:
      </Text>
      

      <CustomButton
        title="Agregar gasto"
        onPress={() => navigation.navigate("AddExpenseScreen")}
      />

      {expenses.length === 0 ? (
        <Text style={styles.noData}>No has agregado gastos aún.</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontWeight: "bold", fontSize: 18, marginBottom: 10 },
  list: { marginTop: 10 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  description: { fontSize: 16, fontWeight: "bold" },
  category: { color: "#555" },
  date: { fontSize: 12, color: "#888" },
  amount: { fontSize: 16, fontWeight: "bold", color: "#008000" },
  noData: { textAlign: "center", marginTop: 20, color: "#555" },
});
