import React, { Suspense } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { TareaIndividualEnriquecida } from '../types/database';
import TaskList from '../components/features/TaskList';
import { COLORS } from '../theme/colors';
import { RootStackNavigationProp } from '../navigation/types'; // 👈 1. Importamos nuestro nuevo tipo

const HomeScreen = () => {
  // 2. Le pasamos el "mapa" a nuestro "GPS"
  const navigation = useNavigation<RootStackNavigationProp>();
  const { usuario } = useAuth();

  const handleTaskPress = (tarea: TareaIndividualEnriquecida) => {
    // Ahora, esta línea es 100% segura y no dará error
    navigation.navigate('Formularios', {
      screen: 'FormMenu',
      params: { tarea: tarea },
    });
  };

  if (!usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Suspense
        fallback={
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        }
      >
        <TaskList userId={(usuario as any).id} onTaskPress={handleTaskPress} />
      </Suspense>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
