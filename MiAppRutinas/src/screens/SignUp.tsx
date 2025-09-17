import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import UserTypeSelector from "../components/UserTypeSelector";
import { useAuth } from "../contexts/AuthContext";

export default function SignUp({ navigation }: any) {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [userType, setUserType] = useState<"personal" | "business">("personal");

  const { register } = useAuth();

  const handleRegister = async () => {
    // validaciones básicas
    if (!name || !email || !password || !repeatPassword || !userType) {
      Alert.alert("Error", "Completa todos los campos requeridos");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      // Si tu AuthContext.register admite más campos, pásalos aquí.
      // En el ejemplo mínimo usamos: register(email, password, userType)
      await register(email, password, userType);
      Alert.alert("Éxito", "Cuenta creada correctamente");
      navigation.navigate("Login");
    } catch (err: any) {
      // firebase devuelve mensajes útiles: muéstralo
      Alert.alert("Error", err?.message || "No se pudo registrar");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Crear cuenta</Text>
        <Text style={styles.subheader}>Empieza a controlar tus finanzas</Text>

        {/* Nombre */}
        <CustomInput title="Nombre completo" value={name} onChange={setName} required />

        {/* Correo */}
        <CustomInput title="Correo" type="email" value={email} onChange={setEmail} required />

        {/* Contraseña */}
        <CustomInput title="Contraseña" type="password" value={password} onChange={setPassword} required />

        <CustomInput title="Repetir contraseña" type="password" value={repeatPassword} onChange={setRepeatPassword} required />

        {/* Selector tipo de usuario (mejorado con colores) */}
        <Text style={styles.label}>Tipo de usuario</Text>
        <UserTypeSelector value={userType} onChange={setUserType} />

        {/* Campos adicionales si es empresa */}
        {userType === "business" && (
          <>
            <CustomInput title="Nombre de la empresa" value={companyName} onChange={setCompanyName} />
            <CustomInput title="RUC / NIT" value={companyId} onChange={setCompanyId} />
          </>
        )}

        {/* Botones */}
        <CustomButton title="Registrarse" onPress={handleRegister} variant="primary" />

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#1E1E2C",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f1720",
    textAlign: "center",
    marginBottom: 6,
  },
  subheader: {
    fontSize: 14,
    color: "#5b6168",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  backLink: {
    marginTop: 12,
    alignItems: "center",
  },
  backText: {
    color: "#2ECC71",
    fontWeight: "600",
  },
});
