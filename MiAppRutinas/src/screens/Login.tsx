import { Alert, Button, StyleSheet, Text, View } from "react-native";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { i18n, useLanguage } from "../contexts/LanguageContext";

export default function Login ({navigation}: any) {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const {login, isAllowed} = useAuth();

const handleOnChangeEmail = (email: string) => {
    setEmail(email);
}
const handleOnChangePassword = (pwd: string) => {
    setPassword(pwd);
} 
const handleLogin = () => {
try {
    if (!email || !password){
        Alert.alert('Error', 'Por favor complete todos los campos');
        return;
    }
    //navegacion de pantallas con envio de parametros de ruta
    login(email);
    navigation.navigate('HomeScreen', {correo: email});
    
    // navegacion de pantallas sin envio de parametros
    // navigation.navigate('HomeScreen');
} catch (error: any){

}
};

return(
        <View style={styles.container}>
        <View style={styles.backgroundCard}>
            <CustomInput 
            type="email" 
            value={email} 
            title={"Correo"} 
            onChange={handleOnChangeEmail}            
            />
            <CustomInput type="password" 
            value={password} 
            title={"Contraseña"} 
            onChange={handleOnChangePassword}/>
            
            {/* //boton sin traduccion */}
            {/* <CustomButton title="Iniciar Sesion" */}

            {/* //boton con traduccion automatica */}
             <CustomButton title={i18n.t('signIn')}
            onPress={handleLogin}/>

            <CustomButton title= {i18n.t('signUp')}
            onPress={()=>{}} 
            variant={'secondary'}/>

            <CustomButton title={i18n.t('forgotPassword')}
            onPress={()=>{}} 
            variant={'tertiary'}/>

        </View>
        </View>
    );
}


const styles = StyleSheet.create({
     container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E2C', // Fondo oscuro moderno
        padding: 20,
    },
    backgroundCard: {
        backgroundColor: '#FFFFFF', // Fondo blanco para contraste
        borderRadius: 15, // Bordes más redondeados
        padding: 30,
        width: '85%',
        shadowColor: '#000', // Sombra para dar profundidad
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
})