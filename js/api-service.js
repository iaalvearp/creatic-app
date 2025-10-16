// --- PUNTO CENTRAL DE CONFIGURACIÓN ---
// Cambia esta variable para apuntar a producción o a desarrollo.
const ENTORNO = 'mock'; // Cambia a 'produccion' cuando sea necesario

const CONFIG = {
    mock: {
        BASE_URL: 'https://api-mock.iaalvearp.workers.dev'
    },
    produccion: {
        BASE_URL: 'http://184.174.39.191:8000'
    }
};
const API_URL = CONFIG[ENTORNO].BASE_URL;

/**
 * Realiza una petición de login a la API.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<any>} Los datos de la respuesta.
 */
async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Credenciales incorrectas');
    return response.json();
}

/**
 * Obtiene una lista de un catálogo específico.
 * @param {string} nombreCatalogo - ej: 'provincias', 'clientes'.
 * @param {URLSearchParams} [params] - Parámetros opcionales para filtrar.
 * @returns {Promise<any[]>} La lista de items del catálogo.
 */
async function getCatalog(nombreCatalogo, params) {
    const url = new URL(`${API_URL}/${nombreCatalogo}`);
    if (params) {
        url.search = params.toString();
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error al cargar el catálogo: ${nombreCatalogo}`);
    return response.json();
}

/**
 * Obtiene la lista completa de tareas.
 * @returns {Promise<any[]>} La lista de tareas.
 */
async function getTasks() {
    const response = await fetch(`${API_URL}/tareas`);
    if (!response.ok) throw new Error('Error al cargar las tareas');
    return response.json();
}

/**
 * Crea una nueva tarea.
 * @param {object} taskData - Los datos de la tarea a crear.
 * @returns {Promise<any>} La tarea recién creada.
 */
async function createTask(taskData) {
    const response = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Error al crear la tarea');
    return response.json();
}

// Aquí podríamos añadir deleteTask, updateTask, etc. en el futuro

export { login, getCatalog, getTasks, createTask };
