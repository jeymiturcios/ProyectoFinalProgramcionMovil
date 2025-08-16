import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {Text} from 'react-native';
import Login from './src/screens/Login';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
     <NavigationContainer>
        <Stack.Navigator initialRouteName='LoginScreen'>
              <Stack.Screen name='LoginScreen' component={Login} />        
            </Stack.Navigator>
     </NavigationContainer>
  );
};

