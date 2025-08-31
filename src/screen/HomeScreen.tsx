import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../service/taskService';
import { COLORS } from '../theme/colors';
import { FONTS } from '../theme/typography';
import { TareaEnriquecida } from '../types/database'; // Importamos el nuevo tipo

const HomeScreen = () => {
  const { usuario } = useAuth();
  // Le decimos a useState que guardará un array de tareas enriquecidas
  const [tareas, setTareas] = useState<TareaEnriquecida[]>([]);

  useEffect(() => {
    if (usuario) {
      // @ts-ignore
      const userTasks = taskService.getTasksByUserId(usuario.id);
      setTareas(userTasks);
    }
  }, [usuario]);

  // Tipamos el parámetro "item" para solucionar el error
  const renderTaskCard = ({ item }: { item: TareaEnriquecida }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.equipo}</Text>
      <Text style={styles.cardSubtitle}>
        {item.unidadNegocioNombre} - {item.ubicacionNombre}
      </Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{item.estado}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <FlatList
      data={tareas}
      renderItem={renderTaskCard}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No tienes tareas asignadas.</Text>
      }
    />
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: FONTS.MyriadProRegular,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontFamily: FONTS.BricolageGrotesqueRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#FFC107', // Amarillo para 'pendiente'
  },
  statusText: {
    fontFamily: FONTS.MyriadProRegular,
    fontSize: 12,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontFamily: FONTS.BricolageGrotesqueRegular,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
