import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationContainer>
            <Stack.Navigator initialRouteName='LoginScreen'>
                  <Stack.Screen name='LoginScreen' component={Login} /> 
                  <Stack.Screen name ='HomeScreen' component={Home}/>     
            </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>

  );
};

