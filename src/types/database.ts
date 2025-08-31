// src/types/database.ts

export interface Rol {
  id: number;
  nombre: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string; // En un app real, esto no debería existir en el cliente
  rolId: number;
}

export interface Cliente {
  id: number;
  nombre: string;
}

export interface UnidadNegocio {
  id: number;
  clienteId: number;
  nombre: string;
}

export interface Ubicacion {
  id: number;
  unidadNegocioId: number;
  nombre: string;
}

export interface TipoEquipo {
  id: number;
  nombre: string;
  caracteristicas: string;
  unidad: string;
}

export interface Tarea {
  id: number;
  usuarioId: number;
  ubicacionId: number;
  tipoEquipoId: number;
  estado: string;
}

// Este es el tipo para la tarea "enriquecida" que devuelve tu servicio
export interface TareaEnriquecida extends Tarea {
  equipo: string;
  ubicacionNombre: string;
  unidadNegocioNombre: string;
}

// Finalmente, definimos la estructura completa del archivo JSON
export interface Database {
  roles: Rol[];
  usuarios: Usuario[];
  clientes: Cliente[];
  unidadesNegocio: UnidadNegocio[];
  ubicaciones: Ubicacion[];
  tiposEquipo: TipoEquipo[];
  tareas: Tarea[];
}
