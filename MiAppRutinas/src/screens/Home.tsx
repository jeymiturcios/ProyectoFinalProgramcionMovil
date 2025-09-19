import React, { useMemo, useState, useEffect } from "react";
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
import { fetchUSDToHNL } from "../services/exchangeRateService";

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
  const { expenses, deleteExpense, clearExpenses, addExpense, forceReloadFromFirebase } = useExpenses();
  const navigation = useNavigation<any>();

  const [dateFilter, setDateFilter] = useState<"Todos" | "Hoy" | "Semana" | "Mes">("Todos");

  // Switches para tema y gráfico
  const [darkMode, setDarkMode] = useState(false);
  const [showChart, setShowChart] = useState(true); // Inicialmente visible

  // Estado para el tipo de cambio
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingExchangeRate, setLoadingExchangeRate] = useState(true);
  const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);


  const theme = darkMode ? darkTheme : lightTheme;

  // Función para formatear números con separador de miles
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Efecto para cargar el tipo de cambio
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        setLoadingExchangeRate(true);
        setExchangeRateError(null);
        const rate = await fetchUSDToHNL();
        setExchangeRate(rate);
      } catch (error) {
        console.error('Error loading exchange rate:', error);
        setExchangeRateError('Error al cargar el tipo de cambio');
      } finally {
        setLoadingExchangeRate(false);
      }
    };

    loadExchangeRate();
  }, []);

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
    const matchDate = filterByDate(e.date);
    return matchDate;
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
              {categoryIcons[item.category]} {categoryLabels[item.category] || item.category}
            </Text>
            <Text style={[styles.date, { color: theme.subText }]}>
              📅 {dateText}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: theme.success }]}>
            L {formatNumber(item.amount)}
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

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.refreshButton, { backgroundColor: theme.background }]} 
                  onPress={forceReloadFromFirebase}
                >
                  <Icon name="refresh" size={22} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout}>
                  <Icon name="logout" size={28} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Usuario con icono de perfil */}
            <View style={styles.userProfileContainer}>
              <View style={[styles.profileIcon, { backgroundColor: theme.success }]}>
                <Icon name="person" size={24} color="#fff" />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userEmail, { color: theme.text }]}>
                  {user?.email}
                </Text>
                {user?.userType && (
                  <Text style={[styles.userType, { color: theme.subText }]}>
                    {user.userType}
                  </Text>
                )}
              </View>
            </View>

            {/* Información financiera compacta */}
            <View style={[styles.financialInfoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.financialRow}>
                <Text style={[styles.financialLabel, { color: theme.text }]}>
                  💰 Total este mes:
                </Text>
                <Text style={[styles.financialValue, { color: theme.success }]}>
                  L {formatNumber(totalMonth)}
                </Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={[styles.financialLabel, { color: theme.text }]}>
                  💱 Precio del dolar:
                </Text>
                {loadingExchangeRate ? (
                  <ActivityIndicator size="small" color={theme.success} />
                ) : exchangeRateError ? (
                  <Text style={[styles.exchangeRateError, { color: '#FF3B30' }]}>
                    Error
                  </Text>
                ) : (
                  <Text style={[styles.financialValue, { color: theme.success }]}>
                    L {exchangeRate ? formatNumber(exchangeRate) : '0.00'}
                  </Text>
                )}
              </View>
            </View>

            <CustomButton title="Agregar gasto" onPress={() => navigation.navigate("AddExpenseScreen")} />


            {/* Filtros fecha compactos */}
            <View style={[styles.filtersContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.filtersTitle, { color: theme.text }]}>📅 Filtros:</Text>
              <View style={styles.filtersRow}>
                {["Todos", "Hoy", "Semana", "Mes"].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.filterButton,
                      { 
                        backgroundColor: dateFilter === f ? theme.success : theme.background,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setDateFilter(f as any)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      { color: dateFilter === f ? "#fff" : theme.text }
                    ]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  // Estilos para el perfil de usuario
  userProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userType: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  // Estilos para información financiera
  financialInfoCard: {
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
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // Estilos para filtros
  filtersContainer: {
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
  filtersTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
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
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  // Estilos para errores
  exchangeRateError: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
