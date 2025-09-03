import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import HomeScreen from '../screen/HomeScreen';
import FormularioScreen from '../screen/FormularioScreen';
import SincronizarScreen from '../screen/SincronizarScreen';
import { useAuth } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

// Componente personalizado para añadir el botón de "Cerrar Sesión"
const CustomDrawerContent = (props: any) => {
  const { cerrarSesion } = useAuth();
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Cerrar Sesión" onPress={() => cerrarSesion()} />
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Inicio" component={HomeScreen} />
      <Drawer.Screen name="Formulario" component={FormularioScreen} />
      <Drawer.Screen name="Sincronizar" component={SincronizarScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
