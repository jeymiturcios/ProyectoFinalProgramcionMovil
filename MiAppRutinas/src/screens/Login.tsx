import { View } from "react-native";
import CustomButton from "../components/CustomButton";

export default function Login () {

    return(
        <View>
            <CustomButton title="Iniciar Sesion"onPress={()=>{}}/>
            <CustomButton title="Registrarme" onPress={()=>{}} />
        </View>
    );
}