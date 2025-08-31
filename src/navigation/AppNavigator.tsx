import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screen/LoginScreen'; // Apunta al archivo LoginScreen
import HomeScreen from '../screen/HomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { usuario } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {usuario ? (
          <Stack.Screen
            name="Inicio"
            component={HomeScreen}
            options={{ title: 'Mis Tareas Asignadas' }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen} // Ahora es el componente correcto
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
