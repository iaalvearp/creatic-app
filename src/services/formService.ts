import db from '../db/database.json';
import tareasDB from '../db/tareas.json'; // Importamos las tareas para buscar el equipo
import { Database } from '../types/database';

const database: Database = db;

export const formService = {
  // Obtiene los datos iniciales para el formulario de Información General
  getInformacionGeneralData: (equipoId: string) => {
    // 1. Buscamos el equipo/tarea específico en nuestra lista de tareas
    let equipoEnTarea;
    for (const grupo of tareasDB) {
      const encontrado = grupo.equipos.find(e => e.id === equipoId);
      if (encontrado) {
        equipoEnTarea = encontrado;
        break;
      }
    }

    if (!equipoEnTarea) return null;

    const equipoCompleto = database.tiposEquipos.find(
      e => e.id === equipoEnTarea.id,
    );
    if (!equipoCompleto) return null;

    // Hacemos los "JOIN" para obtener los nombres en lugar de IDs
    const cliente = database.clientes.find(
      c => c.id === equipoCompleto.cliente,
    )?.nombreCompleto;

    let provincia = '';
    let unidadNegocio = '';
    let agencia = '';

    const ubicacionData = database.ubicacion.find(
      u => u.id === equipoCompleto.provincia,
    );
    if (ubicacionData) {
      provincia = ubicacionData.provincia;
      const unData = ubicacionData.unidadNegocio.find(
        un => un.id === equipoCompleto.unidadNegocio,
      );
      if (unData) {
        unidadNegocio = unData.nombre;
        const agData = unData.agencia.find(
          ag => ag.id === equipoCompleto.agencia,
        );
        if (agData) {
          agencia = agData.nombre;
        }
      }
    }

    // Preparamos las listas de opciones para los dropdowns
    const opcionesProvincia = database.ubicacion.map(u => ({
      label: u.provincia,
      value: u.id,
    }));
    const opcionesUnidadNegocio =
      ubicacionData?.unidadNegocio.map(un => ({
        label: un.nombre,
        value: un.id,
      })) || [];
    const opcionesAgencia =
      ubicacionData?.unidadNegocio
        .find(un => un.id === equipoCompleto.unidadNegocio)
        ?.agencia.map(ag => ({ label: ag.nombre, value: ag.id })) || [];

    return {
      datosPrecargados: {
        cliente,
        provincia: equipoCompleto.provincia,
        unidadNegocio: equipoCompleto.unidadNegocio,
        agencia: equipoCompleto.agencia,
      },
      listasDeOpciones: {
        provincias: opcionesProvincia,
        unidadesNegocio: opcionesUnidadNegocio,
        agencias: opcionesAgencia,
      },
    };
  },
};
