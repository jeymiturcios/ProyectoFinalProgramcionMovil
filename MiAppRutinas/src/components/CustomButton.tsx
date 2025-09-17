import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary";
};

export default function CustomButton({ title, onPress, variant = "primary" }: Props) {
  const styles = getStyles(variant);

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}


const getStyles = (variant: "primary" | "secondary" | "tertiary") => {
  return StyleSheet.create({
    button: {
      height: 50,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        variant === "primary"
          ? "#2ECC71" // verde sólido
          : variant === "secondary"
          ? "transparent" // transparente con borde
          : "transparent", // tertiary también transparente
      borderWidth: variant === "secondary" ? 2 : 0,
      borderColor: variant === "secondary" ? "#2ECC71" : "transparent",
    },
    text: {
      fontWeight: variant === "tertiary" ? "normal" : "bold",
      fontSize: variant === "tertiary" ? 14 : 16,
      color:
        variant === "primary"
          ? "#fff" // texto blanco
          : variant === "secondary"
          ? "#2ECC71" // verde
          : "#7F8C8D", // gris
    },
  });
};
