import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FormMenuScreen from '../screens/forms/FormMenuScreen';
import { FormStackNavigatorParamList } from './types';

// 2. Pasa el contrato al crear el Stack
const Stack = createNativeStackNavigator<FormStackNavigatorParamList>();

const FormStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FormMenu"
        component={FormMenuScreen}
        options={{ title: 'Detalle de Tarea' }}
      />
      {/* Aquí añadiremos las otras pantallas luego */}
    </Stack.Navigator>
  );
};

export default FormStackNavigator;
