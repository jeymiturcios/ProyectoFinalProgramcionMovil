import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = {
  value: "personal" | "business";
  onChange: (val: "personal" | "business") => void;
};

export default function UserTypeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, value === "personal" && styles.active]}
        onPress={() => onChange("personal")}
      >
        <Icon
          name="account"
          size={20}
          color={value === "personal" ? "#fff" : "#555"}
        />
        <Text style={[styles.text, value === "personal" && styles.activeText]}>
          Personal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, value === "business" && styles.active]}
        onPress={() => onChange("business")}
      >
        <Icon
          name="office-building"
          size={20}
          color={value === "business" ? "#fff" : "#555"}
        />
        <Text style={[styles.text, value === "business" && styles.activeText]}>
          Empresarial
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 4,
    marginVertical: 15,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  active: {
    backgroundColor: "#1c1c30",
  },
  text: {
    color: "#555",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
});
 