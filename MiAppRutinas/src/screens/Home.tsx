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
  ActivityIndicator,
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
  const { user, logout } = useAuth(); // 👈 ahora user trae email y userType
  const { expenses, deleteExpense, clearExpenses, addExpense } = useExpenses();
  const navigation = useNavigation<any>();

  const [filter, setFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"Todos" | "Hoy" | "Semana" | "Mes">("Todos");

  // Switches para tema y gráfico
  const [darkMode, setDarkMode] = useState(false);
  const [showChart, setShowChart] = useState(true); // Inicialmente visible


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
      clearExpenses();
      await signOut(auth); // Firebase
      logout(); // Contexto
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };


  // Filtrar por fecha
  const filterByDate = (expenseDate: string) => {
    const date = new Date(expenseDate);
    const now = new Date();

    // Normalizar fechas para comparación
    const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const normalizedDate = normalizeDate(date);
    const normalizedNow = normalizeDate(now);

    if (dateFilter === "Hoy") {
      return normalizedDate.getTime() === normalizedNow.getTime();
    }
    if (dateFilter === "Semana") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const normalizedStart = normalizeDate(startOfWeek);
      const normalizedEnd = normalizeDate(endOfWeek);
      return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
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
  const renderItem = ({ item }: any) => {
    const expenseDate = new Date(item.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Normalizar fechas para comparación (solo año, mes, día)
    const normalizeDate = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };
    
    const normalizedExpenseDate = normalizeDate(expenseDate);
    const normalizedToday = normalizeDate(today);
    const normalizedYesterday = normalizeDate(yesterday);
    
    // Formatear fecha en formato DD/M/YYYY
    const day = expenseDate.getDate();
    const month = expenseDate.getMonth() + 1; // Los meses empiezan en 0
    const year = expenseDate.getFullYear();
    const dateText = `${day}/${month}/${year}`;

    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.leftSection}>
          <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
          <View style={styles.expenseInfo}>
            <Text style={[styles.category, { color: theme.subText }]}>
              {categoryIcons[item.category]} {item.category}
            </Text>
            <Text style={[styles.date, { color: theme.subText }]}>
              📅 {dateText}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: theme.success }]}>
            L {item.amount.toFixed(2)}
          </Text>
          <View style={styles.actionButtons}>
            {/* Botón editar */}
            <TouchableOpacity onPress={() => navigation.navigate("AddExpenseScreen", { expense: item })}>
              <Icon name="edit" size={20} color="#007AFF" />
            </TouchableOpacity>
            {/* Botón eliminar */}
            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Icon name="delete" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Loader mientras carga
  if (!expenses) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.success} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Cargando gastos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
        bounces={true}
        ListHeaderComponent={() => (
          <View style={styles.headerSection}>
            {/* Switches y logout */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: theme.text, marginRight: 8 }}>🌞 / 🌙</Text>
                <Switch value={darkMode} onValueChange={setDarkMode} />
              </View>

              <TouchableOpacity onPress={handleLogout}>
                <Icon name="logout" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Usuario con tipo */}
            <Text style={[styles.header, { color: theme.text }]}>
              Hola {user?.email} {user?.userType && `(${user.userType})`}
            </Text>

            <Text style={[styles.total, { color: theme.success }]}>
              💰 Total este mes: L {totalMonth.toFixed(2)}
            </Text>

            <CustomButton title="Agregar gasto" onPress={() => navigation.navigate("AddExpenseScreen")} />

            {/* Filtros categoría mejorados */}
            <View style={styles.categoryContainer}>
              {["Todos", "Comida", "Transporte", "Ocio", "Otros"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    { 
                      backgroundColor: filter === cat ? theme.success : theme.card,
                      borderColor: theme.border,
                    }
                  ]}
                  onPress={() => setFilter(cat === "Todos" ? null : cat)}
                >
                  <Text style={[
                    styles.categoryText,
                    { 
                      color: filter === cat ? '#fff' : theme.text,
                      fontWeight: filter === cat ? 'bold' : 'normal'
                    }
                  ]}>
                    {cat === "Todos" ? "Todos" : `${categoryIcons[cat]} ${cat}`}
                  </Text>
                </TouchableOpacity>
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

            {/* Botón mostrar/ocultar gráfico */}
            <CustomButton 
              title={showChart ? "📊 Ocultar Gráfico" : "📊 Mostrar Gráfico"} 
              onPress={() => setShowChart(!showChart)} 
              variant={showChart ? "primary" : "secondary"}
            />

            {/* Gráfico centrado */}
            {showChart && (
              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: theme.text }]}>📊 Resumen de Gastos</Text>
                {chartData.length > 0 ? (
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
                ) : (
                  <View style={styles.noChartData}>
                    <Text style={[styles.noChartText, { color: theme.subText }]}>
                      No hay gastos para mostrar en el gráfico
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.noData, { color: theme.subText }]}>No hay gastos</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", "#FF9F1C"];

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerSection: {
    paddingBottom: 10,
  },
  header: { fontWeight: "bold", fontSize: 20, marginBottom: 10 },
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  // Nuevos estilos para categorías mejoradas
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    minWidth: "18%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    fontSize: 12,
    textAlign: "center",
  },
  list: { 
    paddingBottom: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    minHeight: 200,
  },
  // Estilos para el gráfico
  chartContainer: {
    marginTop: 15,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  noChartData: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noChartText: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  // Estilos mejorados para las tarjetas
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  leftSection: {
    flex: 1,
    marginRight: 10,
  },
  expenseInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  description: { 
    fontSize: 16, 
    fontWeight: "bold",
    marginBottom: 4,
  },
  category: { 
    fontSize: 12,
    fontWeight: "500",
  },
  date: { 
    fontSize: 12,
    fontWeight: "500",
  },
  amount: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 8,
    textAlign: "right",
  },
  rightSection: { 
    alignItems: "flex-end", 
    justifyContent: "space-between",
    minWidth: 80,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  noData: { textAlign: "center", marginTop: 20 },
});
