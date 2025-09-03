import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet } from 'react-native'; // Importamos componentes para la UI
import HomeScreen from '../screen/HomeScreen';
import SincronizarScreen from '../screen/SincronizarScreen';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors'; // Importamos nuestros colores
import { FONTS } from '../theme/typography'; // Importamos nuestras fuentes
import database from '../db/database.json'; // Importamos la DB para buscar el rol

const Drawer = createDrawerNavigator();

// --- Componente Personalizado para el Contenido del Menú ---
const CustomDrawerContent = (props: any) => {
  const { usuario, cerrarSesion } = useAuth();

  // Buscamos el nombre del rol usando el rolId del usuario
  const rol = database.roles.find(
    r => r.id === (usuario as any)?.rolId,
  )?.nombre;

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: COLORS.secondary, color: COLORS.white }}
    >
      {/* SECCIÓN 1: Cabecera con Logo y Datos del Usuario */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/images/logo-white.png')}
          style={styles.logo}
        />
        <Text style={styles.userName}>{(usuario as any)?.nombre}</Text>
        <Text style={styles.userRole}>{rol || 'Rol no definido'}</Text>
      </View>

      {/* SECCIÓN 2: Items del Menú (Inicio, Sincronizar, etc.) */}
      <DrawerItemList {...props} />

      {/* SECCIÓN 3: Separador y Botón de Cerrar Sesión */}
      <View style={styles.footerContainer}>
        <View style={styles.separator} />
        <DrawerItem
          label="Cerrar Sesión"
          labelStyle={styles.logoutLabel}
          onPress={() => cerrarSesion()}
        />
      </View>
    </DrawerContentScrollView>
  );
};

// --- Componente Principal del Navegador ---
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      drawerContent={props => <CustomDrawerContent {...props} />}
      // Aquí añadimos los estilos para los items del menú
      screenOptions={{
        drawerActiveBackgroundColor: COLORS.secondary, // Color de fondo para el item activo
        drawerActiveTintColor: COLORS.white, // Color de texto para el item activo
        drawerInactiveTintColor: COLORS.white, // Color de texto para items inactivos
        drawerLabelStyle: {
          fontFamily: FONTS.VersosVariableTest,
          textAlign: 'center',
          fontSize: 16,
        },
      }}
    >
      {/* Removemos la pantalla "Formulario" */}
      <Drawer.Screen name="Inicio" component={HomeScreen} />
      <Drawer.Screen name="Sincronizar" component={SincronizarScreen} />
    </Drawer.Navigator>
  );
};

// --- Estilos para el Contenido Personalizado ---
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  userName: {
    fontFamily: FONTS.VersosVariableTest,
    fontSize: 24,
    color: COLORS.white,
  },
  userRole: {
    fontFamily: FONTS.BricolageGrotesqueRegular,
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
  },
  footerContainer: {
    paddingTop: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  logoutLabel: {
    fontFamily: FONTS.VersosVariableTest,
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
});

export default DrawerNavigator;
