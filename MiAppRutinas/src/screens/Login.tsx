import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { auth } from "../config/firebase";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  // Registrarse con verificación de correo
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
      await signOut(auth); // cerrar sesión hasta que verifique su email
      setEmail("");
      setPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Olvidé contraseña
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E2C',
    padding: 20,
  },
  backgroundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 30,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});



