import db from '../db/database.json'; // 1. Corregimos las rutas a tu nueva carpeta 'db'
import tareasDB from '../db/tareas.json';
import {
  Database,
  TareaAgrupada,
  TareaIndividualEnriquecida,
} from '../types/database';

const database: Database = db;

export const taskService = {
  getTareasParaUsuario: (
    userId: number,
  ): Promise<TareaIndividualEnriquecida[]> => {
    // 2. Quitamos el setTimeout, pero mantenemos la Promesa para React 19
    return new Promise(resolve => {
      const tareasDelUsuario: TareaAgrupada[] = tareasDB.filter(
        (tarea: TareaAgrupada) => tarea.usuarioId === userId,
      );

      let todasLasTareasIndividuales: TareaIndividualEnriquecida[] = [];

      tareasDelUsuario.forEach(tareaAgrupada => {
        const equiposDeLaTarea = tareaAgrupada.equipos.map(equipo => {
          // 3. (LA CORRECCIÓN PRINCIPAL) Movemos la lógica para buscar el estado DENTRO del bucle de equipos
          const estado =
            database.estados.find(e => e.id === equipo.estadoId)?.nombre ||
            'desconocido';

          // Excluimos estadoId para no tener datos redundantes
          const { estadoId, ...restoDelEquipo } = equipo;

          return {
            ...restoDelEquipo,
            tareaId: tareaAgrupada.id,
            estado: estado,
          };
        });

        todasLasTareasIndividuales = [
          ...todasLasTareasIndividuales,
          ...equiposDeLaTarea,
        ];
      });

      resolve(todasLasTareasIndividuales);
    });
  },
};
