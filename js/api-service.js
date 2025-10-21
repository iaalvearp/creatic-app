// creaticWeb/js/api-service.js
// --- PUNTO CENTRAL DE CONFIGURACIÓN ---
const ENTORNO = 'produccion'; // Cambia a 'produccion' cuando sea necesario
const CONFIG = {
    mock: { BASE_URL: 'https://api-mock.iaalvearp.workers.dev' },
    produccion: { BASE_URL: 'http://184.174.39.191:8000' }
};
const API_URL = CONFIG[ENTORNO].BASE_URL;

// --- FUNCIONES DE LA API ---

async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Credenciales incorrectas');
    return response.json();
}

async function getCatalog(nombreCatalogo, params) {
    const url = new URL(`${API_URL}/${nombreCatalogo}`);
    if (params) url.search = params.toString();
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error al cargar el catálogo: ${nombreCatalogo}`);
    return response.json();
}

async function getTasks() {
    const response = await fetch(`${API_URL}/tareas`);
    if (!response.ok) throw new Error('Error al cargar las tareas');
    return response.json();
}

async function createTask(taskData) {
    const response = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Error al crear la tarea');
    return response.json();
}

async function updateTask(taskId, taskData) {
    const response = await fetch(`${API_URL}/tareas/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Error al actualizar la tarea');
    return response.json();
}

/**
 * ¡NUEVA FUNCIÓN!
 * Elimina una tarea existente.
 * @param {string} taskId - El ID de la tarea a eliminar.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
    const response = await fetch(`${API_URL}/tareas/${taskId}`, {
        method: 'DELETE',
    });
    // Un status 204 (No Content) no tiene cuerpo JSON, por eso lo manejamos diferente.
    if (!response.ok && response.status !== 204) {
        throw new Error('Error al eliminar la tarea');
    }
}

export { login, getCatalog, getTasks, createTask, updateTask, deleteTask };

