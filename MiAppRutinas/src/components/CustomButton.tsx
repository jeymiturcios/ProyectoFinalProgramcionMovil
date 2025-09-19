// CustomButton.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary';
}

export default function CustomButton({ title, onPress, variant='primary' }: Props){
    const { themeColors } = useTheme();
    const styles = getStyles(variant, themeColors);

    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const getStyles = (variant: 'primary' | 'secondary' | 'tertiary', themeColors: any) => StyleSheet.create({
    button: {
        height: 50,
        paddingHorizontal: 20,
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor:
          variant === 'primary' ? themeColors.success :
          variant === 'secondary' ? 'transparent' : 'transparent',
        borderWidth: variant === 'secondary' ? 2 : variant === 'tertiary' ? 1 : 0,
        borderColor: variant === 'secondary' ? themeColors.success : 
                    variant === 'tertiary' ? themeColors.border : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: variant === 'primary' ? themeColors.success : 'transparent',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        color: variant === 'primary' ? '#fff' : 
               variant === 'secondary' ? themeColors.success : themeColors.text,
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
});
