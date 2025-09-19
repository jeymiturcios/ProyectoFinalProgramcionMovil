// CustomInput.tsx
import React, { useState } from "react";
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  value: string;
  title: string;
  type?: "text" | "password" | "email" | "number" | "numeric";
  onChange: (text: string) => void;
  required?: boolean;
};

export default function CustomInput({
  value,
  title,
  type = "text",
  onChange,
  required,
}: Props) {
  const [isSecureText, setIsSecureText] = useState(type === "password");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordField = type === "password";

  const keyboardType: KeyboardTypeOptions =
    type === "email"
      ? "email-address"
      : type === "number"
      ? "number-pad"
      : type === "numeric"
      ? "numeric"
      : "default";

  const getError = () => {
    if (required && !value) return "El campo es obligatorio";
    if (type === "email" && value && !value.includes("@"))
      return "Correo inválido";
    if (type === "password" && value && value.length < 6)
      return "La contraseña debe tener al menos 6 caracteres";
    return null;
  };

  const error = getError();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : styles.inputNormal,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={title}
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChange}
          secureTextEntry={isSecureText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isPasswordField && (
          <TouchableOpacity
            onPress={() => {
              setIsPasswordVisible(!isPasswordVisible);
              setIsSecureText(!isSecureText);
            }}
          >
            <Icon
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginVertical: 10,
    alignSelf: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  inputNormal: {
    borderColor: "#ccc",
  },
  inputError: {
    borderColor: "red",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  errorText: {
    marginTop: 5,
    color: "red",
    fontSize: 13,
  },
});
