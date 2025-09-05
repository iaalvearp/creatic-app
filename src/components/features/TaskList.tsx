import React, { use } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { taskService } from '../../services/taskService';
import { TareaIndividualEnriquecida } from '../../types/database';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/typography';

interface TaskListProps {
  userId: number;
  onTaskPress: (task: TareaIndividualEnriquecida) => void;
}

const TaskList = ({ userId, onTaskPress }: TaskListProps) => {
  const tareas = use(taskService.getTareasParaUsuario(userId));

  const getStatusStyle = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return { backgroundColor: '#6c757d', color: COLORS.white }; // Gris
      case 'en progreso':
        return { backgroundColor: '#ffc107', color: COLORS.black }; // Amarillo
      case 'completado':
        return { backgroundColor: '#28a745', color: COLORS.white }; // Verde
      default:
        return { backgroundColor: '#E0E0E0', color: COLORS.textPrimary };
    }
  };

  const renderTaskCard = ({ item }: { item: TareaIndividualEnriquecida }) => {
    const statusStyle = getStatusStyle(item.estado);

    return (
      <TouchableOpacity style={styles.card} onPress={() => onTaskPress(item)}>
        <View style={styles.infoContainer}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardInfo}>Modelo: {item.modelo}</Text>
          <Text style={styles.cardInfo}>No. de Serie: {item.id}</Text>
          <Text style={styles.cardInfo}>
            Características: {item.caracteristicas}
          </Text>
        </View>
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: statusStyle.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {item.estado}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={tareas}
      renderItem={renderTaskCard}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No tienes tareas asignadas.</Text>
      }
    />
  );
};

// ... (Estilos actualizados abajo)
const styles = StyleSheet.create({
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    flexDirection: 'row', // Clave para la distribución
    justifyContent: 'space-between', // Clave para la distribución
  },
  infoContainer: {
    flex: 1, // Ocupa el espacio disponible
    marginRight: 10,
  },
  cardTitle: {
    fontFamily: FONTS.VersosVariableTest,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  cardInfo: {
    fontFamily: FONTS.BricolageGrotesqueRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  statusContainer: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30, // Altura fija para alinear
  },
  statusText: {
    fontFamily: FONTS.VersosVariableTest,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontFamily: FONTS.BricolageGrotesqueRegular,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default TaskList;
