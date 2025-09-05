import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InformacionGeneralScreenProps } from '../../navigation/types';
import BotonPrincipal from '../../components/common/BotonPrincipal';

const InformacionGeneralScreen = ({
  route,
  navigation,
}: InformacionGeneralScreenProps) => {
  // Obtenemos el ID de la tarea que pasamos como parámetro
  const { tareaId } = route.params;

  const handleSaveAndContinue = () => {
    console.log(
      'Guardando datos de Información General para la tarea:',
      tareaId,
    );
    // Navegamos a la siguiente pantalla del formulario
    navigation.navigate('InformacionEquipo', { tareaId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Información General</Text>
        <Text style={styles.subtitle}>Tarea ID: {tareaId}</Text>

        {/* Aquí irían todos los inputs de este formulario */}

        <BotonPrincipal
          title="Guardar y Continuar"
          onPress={handleSaveAndContinue}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default InformacionGeneralScreen;
