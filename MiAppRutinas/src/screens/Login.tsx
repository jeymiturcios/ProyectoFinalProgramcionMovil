import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, View, ActivityIndicator, Text } from "react-native";
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
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"personal" | "empresarial">("personal"); // 👈 tipo de usuario

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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
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
      Alert.alert("Error al iniciar sesión", error.message);
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
        userType, // 👈 guardamos tipo de usuario
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
    <View style={styles.container}>
      <View style={styles.backgroundCard}>
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

        {/* 👇 Selección de tipo de usuario */}
        <Text style={styles.label}>Selecciona tu tipo de usuario:</Text>
        <View style={styles.typeContainer}>
          <CustomButton
            title="Personal"
            variant={userType === "personal" ? "secondary" : "tertiary"}
            onPress={() => setUserType("personal")}
          />
          <CustomButton
            title="Empresarial"
            variant={userType === "empresarial" ? "secondary" : "tertiary"}
            onPress={() => setUserType("empresarial")}
          />
        </View>

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
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2C",
  },
});
