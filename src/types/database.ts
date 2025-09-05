// --- Interfaces para database.json ---
export interface Rol {
  id: number;
  nombre: string;
}
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rolId: number;
}
export interface Cliente {
  id: number;
  nombre: string;
  nombreCompleto: string;
}
export interface Agencia {
  id: number;
  nombre: string;
}
export interface UnidadNegocio {
  id: number;
  nombre: string;
  agencia: Agencia[];
}
export interface Ubicacion {
  id: number;
  provincia: string;
  unidadNegocio: UnidadNegocio[];
}
export interface TipoEquipo {
  id: string;
  nombre: string;
  caracteristicas: string;
  modelo: string;
  cliente: number;
  provincia: number;
  unidadNegocio: number;
  agencia: number;
}
export interface Estado {
  id: number;
  nombre: string;
}

export interface Database {
  roles: Rol[];
  usuarios: Usuario[];
  clientes: Cliente[];
  ubicacion: Ubicacion[];
  tiposEquipos: TipoEquipo[];
  estados: Estado[];
}

// --- Interfaces para tareas.json ---
export interface EquipoEnTarea {
  id: string;
  nombre: string;
  modelo: string;
  caracteristicas: string;
  estadoId: number;
}

export interface TareaAgrupada {
  id: number;
  clienteId: number;
  provinciaId: number;
  unidadNegocioId: number;
  usuarioId: number;
  equipos: EquipoEnTarea[];
}

// --- Tipo para el objeto final que usará la UI ---
export interface TareaIndividualEnriquecida
  extends Omit<EquipoEnTarea, 'estadoId'> {
  tareaId: number;
  estado: string; // El nombre del estado, ej: "pendiente"
}
