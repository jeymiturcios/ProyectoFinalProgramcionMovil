// CustomInput.tsx
import React, { useState } from "react";
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
    value: string;
    title: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'numeric';
    onChange: (text: string) => void;
    required?: boolean;
}

export default function CustomInput({ value, title, type = "text", onChange, required }: Props) {
    const [isSecureText, setIsSecureText] = useState(type === 'password');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPasswordField = type === "password";
    const keyboardType: KeyboardTypeOptions = 
        type === 'email' ? 'email-address' :
        type === 'number' ? 'number-pad' :
        type === 'numeric' ? 'numeric' :
        'default';

    const getError = () => {
        if (required && !value) return "El campo es obligatorio";
        if (type === "email" && value && !value.includes("@")) return "Correo inválido";
        if (type === "password" && value && value.length < 4) return "La contraseña es muy corta";
    }
    const error = getError();

    return (
        <View style={{ marginBottom: 10 }}>
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <TextInput
                    style={styles.input}
                    placeholder={title}
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={isSecureText}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {isPasswordField && (
                    <TouchableOpacity onPress={() => {
                        setIsPasswordVisible(!isPasswordVisible);
                        setIsSecureText(!isSecureText);
                    }}>
                        <Icon name={isPasswordVisible ? 'visibility-off' : 'visibility'} size={20} color="#000" />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 12,
        backgroundColor: '#f9f9f9',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
    },
    inputError: {
        borderColor: 'red',
    },
    error: {
        color: 'red',
        marginTop: 4,
    },
});
