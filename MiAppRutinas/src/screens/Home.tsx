import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View, Dimensions } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useExpenses } from "../contexts/ExpenseContext";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";

export default function Home() {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const navigation = useNavigation<any>();

  // Agrupar gastos por categoría
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach((e) => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });

    // Convertir a formato PieChart
    return Object.keys(grouped).map((cat, index) => ({
      name: cat,
      amount: grouped[cat],
      color: colors[index % colors.length],
      legendFontColor: "#333",
      legendFontSize: 12,
    }));
  }, [expenses]);

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

      {/* Gráfico de pastel */}
      {chartData.length > 0 && (
        <PieChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={200}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"amount"}
          backgroundColor={"transparent"}
          paddingLeft={"10"}
          absolute
        />
      )}

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

const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", "#FF9F1C"];

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

