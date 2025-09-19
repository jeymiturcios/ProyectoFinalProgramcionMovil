import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useExpenses } from "../contexts/ExpenseContext";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/MaterialIcons";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

// 🎨 Temas
const lightTheme = {
  background: "#f9f9f9",
  card: "#fff",
  text: "#222",
  subText: "#555",
  border: "#ccc",
  success: "#008000",
};

const darkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#fff",
  subText: "#aaa",
  border: "#333",
  success: "#4CAF50",
};
export default function Home() {
  const { user } = useAuth();
  const { expenses, deleteExpense, clearExpenses } = useExpenses(); // 👈 incluir clearExpenses
  const navigation = useNavigation<any>();

  const [filter, setFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"Todos" | "Hoy" | "Semana" | "Mes">("Todos");

  // 👇 Switch para tema manual
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

  const categoryIcons: Record<string, string> = {
    Comida: "🍔",
    Transporte: "🚗",
    Ocio: "🎉",
    Otros: "💡",
  };

  // Confirmación al eliminar
  const confirmDelete = (id: string) => {
    Alert.alert("Eliminar gasto", "¿Seguro que quieres eliminar este gasto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteExpense(id) },
    ]);
  };

  // 🔐 Cerrar sesión
  const handleLogout = async () => {
    try {
      clearExpenses(); // limpia lista local
      await signOut(auth); // Firebase logout
      navigation.replace("LoginScreen"); // vuelve al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Filtrar por fecha
  const filterByDate = (expenseDate: string) => {
    const date = new Date(expenseDate);
    const now = new Date();

    if (dateFilter === "Hoy") {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === "Semana") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return date >= startOfWeek && date <= endOfWeek;
    }
    if (dateFilter === "Mes") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Aplicar filtros
  const filteredExpenses = expenses.filter((e) => {
    const matchCategory = filter ? e.category === filter : true;
    const matchDate = filterByDate(e.date);
    return matchCategory && matchDate;
  });

  // Total del mes actual
  const currentMonth = new Date().getMonth();
  const totalMonth = expenses
    .filter((e) => new Date(e.date).getMonth() === currentMonth)
    .reduce((sum, e) => sum + e.amount, 0);

  // Datos para gráfico
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return Object.keys(grouped).map((cat, index) => ({
      name: cat,
      amount: grouped[cat],
      color: colors[index % colors.length],
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));
  }, [filteredExpenses, theme]);

  // Renderizar cada gasto
  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View>
        <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
        <Text style={[styles.category, { color: theme.subText }]}>
          {categoryIcons[item.category]} {item.category}
        </Text>
        <Text style={[styles.date, { color: theme.subText }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: theme.success }]}>
          L {item.amount.toFixed(2)}
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Botón editar */}
          <TouchableOpacity onPress={() => navigation.navigate("AddExpenseScreen", { expense: item })}>
            <Icon name="edit" size={24} color="#007AFF" />
          </TouchableOpacity>
          {/* Botón eliminar */}
          <TouchableOpacity onPress={() => confirmDelete(item.id)}>
            <Icon name="delete" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 🔘 Switch de tema y logout */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.text, marginRight: 8 }}>🌞 / 🌙</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.header, { color: theme.text }]}>Hola {user?.email}</Text>

      <Text style={[styles.total, { color: theme.success }]}>
        💰 Total este mes: L {totalMonth.toFixed(2)}
      </Text>
      

      <CustomButton title="Agregar gasto" onPress={() => navigation.navigate("AddExpenseScreen")} />

      {/* Filtros categoría */}
      <View style={styles.filters}>
        {["Todos", "Comida", "Transporte", "Ocio", "Otros"].map((cat) => (
          <CustomButton
            key={cat}
            title={cat}
            onPress={() => setFilter(cat === "Todos" ? null : cat)}
            variant={filter === cat ? "secondary" : "tertiary"}
          />
        ))}
      </View>

      {/* Filtros fecha */}
      <View style={styles.filters}>
        {["Todos", "Hoy", "Semana", "Mes"].map((f) => (
          <CustomButton
            key={f}
            title={f}
            onPress={() => setDateFilter(f as any)}
            variant={dateFilter === f ? "secondary" : "tertiary"}
          />
        ))}
      </View>

      {/* Gráfico */}
      {chartData.length > 0 && (
        <PieChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={200}
          chartConfig={{
            backgroundColor: theme.background,
            backgroundGradientFrom: theme.background,
            backgroundGradientTo: theme.background,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor={"amount"}
          backgroundColor={"transparent"}
          paddingLeft={"10"}
          absolute
        />
      )}

      {/* Lista de gastos */}
      {filteredExpenses.length === 0 ? (
        <Text style={[styles.noData, { color: theme.subText }]}>No hay gastos</Text>
      ) : (
        <FlatList
          data={filteredExpenses}
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
  container: { flex: 1, padding: 20 },
  header: { fontWeight: "bold", fontSize: 20, marginBottom: 10 },
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  list: { marginTop: 10 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  description: { fontSize: 16, fontWeight: "bold" },
  category: { marginTop: 2 },
  date: { fontSize: 12 },
  amount: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  rightSection: { alignItems: "flex-end", justifyContent: "space-between" },
  noData: { textAlign: "center", marginTop: 20 },
});


