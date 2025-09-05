import React, { Suspense } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { TareaEnriquecida } from '../types/database';
import TaskList from '../components/features/TaskList';
import { COLORS } from '../theme/colors';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { usuario } = useAuth();

  const handleTaskPress = (tarea: TareaEnriquecida) => {
    // Navegamos a la nueva ruta 'Formularios' y pasamos la tarea como parámetro
    // @ts-ignore
    navigation.navigate('Formularios', { tarea });
  };

  if (!usuario) return null;

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
