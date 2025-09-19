import "fast-text-encoding";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./src/screens/Login";
import Home from "./src/screens/Home";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import { AuthProvider } from "./src/contexts/AuthContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { ExpenseProvider } from "./src/contexts/ExpenseContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import SignUp from "./src/screens/SignUp";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ExpenseProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="LoginScreen">
                <Stack.Screen name="LoginScreen" component={Login} />
                <Stack.Screen name="HomeScreen" component={Home} />
                <Stack.Screen name="AddExpenseScreen" component={AddExpenseScreen} />
                <Stack.Screen name="SignUp" component={SignUp} />
              </Stack.Navigator>
            </NavigationContainer>
          </ExpenseProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}