import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "../config/firebase";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // 👀 Detectar usuario ya autenticado
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Iniciar sesión
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
      Alert.alert("Error", error.message);
    }
  };

  // Registrarse
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Debes ingresar correo y contraseña");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      Alert.alert(
        "Registro exitoso",
        "Revisa tu correo para verificar tu cuenta antes de iniciar sesión"
      );
      await signOut(auth); 
      setEmail("");
      setPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Recuperar contraseña
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Introduce tu correo para recuperar contraseña");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Éxito", "Revisa tu correo para resetear contraseña");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundCard}>
        <Text style={styles.title}>Organizador 💰</Text>
        <Text style={styles.subtitle}>Controla tus finanzas facilmente</Text>

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
    backgroundColor: "#1E1E2C",
    padding: 20,
  },
  backgroundCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 30,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E1E2C",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2C",
  },
});
