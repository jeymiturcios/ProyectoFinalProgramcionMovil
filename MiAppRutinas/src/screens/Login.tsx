import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { useAuth } from "../contexts/AuthContext";
import { i18n } from "../contexts/LanguageContext";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Por favor complete todos los campos");
        return;
      }

      login(email,password);

      navigation.navigate("HomeScreen", {
        correo: email,password
      });
    } catch (error: any) {
      Alert.alert("Error", "No se pudo iniciar sesión");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundCard}>
        <Text style={styles.title}>Organizador 💰</Text>
        <Text style={styles.subtitle}>Controla tus finanzas facilmente</Text>

        {/* Inputs */}
        <CustomInput
          value={email}
          onChange={setEmail}
          title="Correo"
          type="email"
          required
        />

        <CustomInput
          value={password}
          onChange={setPassword}
          title="Contraseña"
          type="password"
          required
        />

        {/* Botones */}
        <CustomButton title={i18n.t("signIn")} onPress={handleLogin} />

        <CustomButton
          title={i18n.t("signUp")}
          onPress={() => navigation.navigate("SignUp")}
          variant="secondary"
        />

        <CustomButton
          title={i18n.t("forgotPassword")}
          onPress={() => {}}
          variant="tertiary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2C", // Fondo oscuro
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
});
