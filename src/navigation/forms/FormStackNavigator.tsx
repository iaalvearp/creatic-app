import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FormMenuScreen from '../../screens/forms/FormMenuScreen';
import InformacionGeneralScreen from '../../screens/forms/InformacionGeneralScreen'; // 👈 1. Importamos el nuevo componente
import { FormStackNavigatorParamList } from '../types';

const Stack = createNativeStackNavigator<FormStackNavigatorParamList>();

const FormStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FormMenu"
        component={FormMenuScreen}
        options={{ title: 'Detalle de Tarea' }}
      />
      {/* 2. Añadimos la pantalla a nuestro navegador */}
      <Stack.Screen
        name="InformacionGeneral"
        component={InformacionGeneralScreen}
        options={{ title: 'Información General' }}
      />

      {/* Añadiremos las otras aquí cuando creemos sus componentes:
      
      <Stack.Screen
        name="InformacionEquipo"
        component={InformacionEquipoScreen}
        options={{ title: 'Información de Equipo' }}
      />
      ...etc
      */}
    </Stack.Navigator>
  );
};

export default FormStackNavigator;
