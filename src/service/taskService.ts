import database from '../db/database.json'; // Corregimos la ruta
import {
  Database,
  Tarea,
  TipoEquipo,
  Ubicacion,
  UnidadNegocio,
} from '../types/database';

// Le decimos a TypeScript que nuestro JSON importado tiene la forma de la interfaz "Database"
const db: Database = database;

export const taskService = {
  getTasksByUserId: (userId: number) => {
    // 1. Filtra las tareas
    const userTasks = db.tareas.filter(
      (tarea: Tarea) => tarea.usuarioId === userId,
    );

    // 2. "Enriquece" cada tarea
    const enrichedTasks = userTasks.map(tarea => {
      const tipoEquipo = db.tiposEquipo.find(
        (t: TipoEquipo) => t.id === tarea.tipoEquipoId,
      );
      const ubicacion = db.ubicaciones.find(
        (u: Ubicacion) => u.id === tarea.ubicacionId,
      );
      const unidadNegocio = db.unidadesNegocio.find(
        (un: UnidadNegocio) => un.id === ubicacion?.unidadNegocioId,
      );

      return {
        ...tarea,
        equipo: tipoEquipo?.nombre || 'Desconocido',
        ubicacionNombre: ubicacion?.nombre || 'Desconocida',
        unidadNegocioNombre: unidadNegocio?.nombre || 'Desconocida',
      };
    });

    return enrichedTasks;
  },
};
