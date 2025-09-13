// CustomButton.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary';
}

export default function CustomButton({ title, onPress, variant='primary' }: Props){
    const styles = getStyles(variant);

    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const getStyles = (variant: 'primary' | 'secondary' | 'tertiary') => StyleSheet.create({
    button: {
        height: 45,
        paddingHorizontal: 12,
        marginVertical: 8,
        borderRadius: 5,
        backgroundColor:
          variant === 'primary' ? '#1c1c30' :
          variant === 'secondary' ? '#65659c' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: variant === 'primary' || variant === 'secondary' ? '#fff' : '#000',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
