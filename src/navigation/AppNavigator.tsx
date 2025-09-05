import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { usuario } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {usuario ? (
          // Si hay un usuario, muestra el Menú Lateral completo
          <Stack.Screen
            name="App" // Le damos un nombre genérico al contenedor del drawer
            component={DrawerNavigator}
            options={{ headerShown: false }} // Ocultamos el header del Stack
          />
        ) : (
          // Si NO hay usuario, muestra la pantalla de Login
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
