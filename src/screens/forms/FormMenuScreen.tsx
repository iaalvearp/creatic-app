// En: src/screens/forms/FormMenuScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/typography';
import { FormMenuScreenProps } from '../../navigation/types';

// ✅ 1. Rellenamos el array para eliminar el error 'any[]'
const formSections = [
  'Información General',
  'Información de Equipo',
  'Actividades de Mantenimiento',
  'Tareas de Diagnóstico',
  'Reporte Fotográfico',
  'Firmas',
];

const FormMenuScreen = ({ route, navigation }: FormMenuScreenProps) => {
  const { tarea } = route.params;

  // ✅ 2. Completamos la lógica de navegación para todos los botones
  const handleSectionPress = (section: string) => {
    const equipoId = tarea.id;

    switch (section) {
      case 'Información General':
        navigation.navigate('InformacionGeneral', { equipoId });
        break;
      case 'Información de Equipo':
        navigation.navigate('InformacionEquipo', { equipoId });
        break;
      case 'Actividades de Mantenimiento':
        navigation.navigate('ActividadesMantenimiento', { equipoId });
        break;
      case 'Tareas de Diagnóstico':
        navigation.navigate('TareasDiagnostico', { equipoId });
        break;
      case 'Reporte Fotográfico':
        navigation.navigate('ReporteFotografico', { equipoId });
        break;
      case 'Firmas':
        navigation.navigate('Firmas', { equipoId });
        break;
      default:
        console.log(`Ruta no definida para: ${section}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Formulario: </Text>
          <Text style={[styles.title, { color: COLORS.secondary }]}>
            {tarea.equipo}
          </Text>
        </View>

        {formSections.map(section => (
          <TouchableOpacity
            key={section}
            style={styles.menuButton}
            onPress={() => handleSectionPress(section)}
          >
            <Text style={styles.menuButtonText}>{section}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontFamily: FONTS.VersosVariableTest, // Corregido según tu `typography.js`
    fontSize: 22,
    color: COLORS.black,
  },
  menuButton: {
    width: '80%',
    backgroundColor: COLORS.secondary,
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  menuButtonText: {
    fontFamily: FONTS.VersosVariableTest, // Corregido según tu `typography.js`
    color: COLORS.white,
    fontSize: 18,
  },
});

export default FormMenuScreen;
