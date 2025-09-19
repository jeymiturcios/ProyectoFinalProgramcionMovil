import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, View, ActivityIndicator, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { useTheme } from "../contexts/ThemeContext";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export default function Login({ navigation }: any) {
  const { themeColors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // 👀 Detectar si hay un usuario activo
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigation.replace("HomeScreen");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.success} />
      </View>
    );
  }

  // 🔓 Iniciar sesión
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Debes ingresar correo y contraseña");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        Alert.alert("Error", "Debes verificar tu correo antes de entrar");
        await signOut(auth);
        return;
      }
      navigation.replace("HomeScreen");
    } catch (error: any) {
      let errorMessage = "Error al iniciar sesión";
      
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email o contraseña incorrectos. Verifica tus datos.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No existe una cuenta con este email. Regístrate primero.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos fallidos. Espera un momento.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Error de conexión. Verifica tu internet.";
      }
      
      Alert.alert("Error al iniciar sesión", errorMessage);
    }
  };

  // 📝 Registrarse
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Debes ingresar correo y contraseña");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Guardar en Firestore 👇
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        userType: "personal", // 👈 tipo por defecto
        createdAt: new Date().toISOString(),
      });

      await sendEmailVerification(userCredential.user);
      Alert.alert(
        "Registro exitoso",
        "Revisa tu correo para verificar tu cuenta antes de iniciar sesión"
      );
      await signOut(auth);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      Alert.alert("Error al registrarse", error.message);
    }
  };

  // 🔑 Recuperar contraseña
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Introduce tu correo para recuperar contraseña");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Éxito", "Revisa tu correo para resetear la contraseña");
    } catch (error: any) {
      Alert.alert("Error al recuperar contraseña", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.backgroundCard, { backgroundColor: themeColors.card }]}>
        {/* Título con ícono */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>Organizador</Text>
          <Text style={styles.moneyIcon}>💰</Text>
        </View>
        <Text style={[styles.subtitle, { color: themeColors.subText }]}>
          Controla tus finanzas fácilmente
        </Text>

        <CustomInput
          title="Correo"
          value={email}
          type="email"
          onChange={setEmail}
          required
        />
        <CustomInput
          title="Contraseña"
          value={password}
          type="password"
          onChange={setPassword}
          required
        />

        <CustomButton title="Iniciar Sesión" onPress={handleLogin} variant="primary" />
        <CustomButton title="Registrarse" onPress={handleSignUp} variant="secondary" />
        <CustomButton title="Olvidé mi contraseña" onPress={handleForgotPassword} variant="tertiary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backgroundCard: {
    borderRadius: 20,
    padding: 30,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  titleIcon: {
    marginLeft: 8,
  },
  moneyIcon: {
    fontSize: 24,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "500",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
