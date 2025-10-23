// creaticWeb/js/api-service.js
// --- PUNTO CENTRAL DE CONFIGURACIÓN ---
const ENTORNO = 'mock'; // Cambia a 'mock' si necesitas pruebas offline
const CONFIG = {
    mock: { BASE_URL: 'https://api-mock.iaalvearp.workers.dev' },
    produccion: { BASE_URL: 'http://184.174.39.191:8000' } // Asegúrate que el puerto sea el correcto (80 o 8000)
};
const API_URL = CONFIG[ENTORNO].BASE_URL;

// --- Helper para obtener el token (Necesitarás implementar cómo guardarlo/leerlo) ---
function getAuthToken() {
    // Ejemplo: Leer el token guardado en localStorage
    return localStorage.getItem('accessToken');
    // Si usas otro método (sessionStorage, memoria), ajústalo aquí.
}

// --- Helper para crear cabeceras con autenticación ---
function createAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// --- FUNCIONES DE LA API ---

async function login(email, password) {
    const response = await fetch(`${API_URL} / auth / login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        // Intenta obtener más detalles del error si es posible
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Credenciales incorrectas');
    }
    const data = await response.json();
    // Ejemplo: Guardar el token después del login
    if (data.tokens && data.tokens.access_token) {
        localStorage.setItem('accessToken', data.tokens.access_token);
    }
    return data; // Devuelve toda la respuesta (tokens, user, tasks)
}

/**
 * ¡CORREGIDO!
 * Obtiene todos los catálogos necesarios para el frontend.
 */
async function getAllCatalogs() {
    const response = await fetch(`${API_URL} / catalogos / all`, {
        method: 'GET',
        headers: createAuthHeaders(), // <-- Añade autenticación
    });
    if (!response.ok) {
        // Manejo de error si el token expiró o es inválido
        if (response.status === 401) {
            // Aquí podrías redirigir al login o intentar refrescar el token
            throw new Error('Sesión inválida o expirada. Por favor, inicia sesión de nuevo.');
        }
        throw new Error('Error al cargar los catálogos');
    }
    return response.json();
}

/**
 * ¡CORREGIDO!
 * Obtiene las tareas del usuario autenticado.
 */
async function getTasks() {
    const response = await fetch(`${API_URL} / tareas`, {
        method: 'GET',
        headers: createAuthHeaders(), // <-- Añade autenticación
    });
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Sesión inválida o expirada.');
        }
        throw new Error('Error al cargar las tareas');
    }
    return response.json();
}

// --- Funciones CRUD para Tareas (Requieren Endpoints en Backend) ---
// Estas funciones ahora incluyen autenticación, pero necesitan
// que implementes los endpoints POST, PUT/PATCH, DELETE en tu API FastAPI.

async function createTask(taskData) {
    // Verifica que el backend espere este formato (usuario_id, equipo_id)
    const response = await fetch(`${API_URL} / tareas`, {
        method: 'POST',
        headers: createAuthHeaders(), // <-- Añade autenticación
        body: JSON.stringify(taskData),
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error('Sesión inválida o expirada.');
        // Considera manejar errores de validación (422) aquí
        throw new Error('Error al crear la tarea');
    }
    return response.json();
}

async function updateTask(taskId, taskData) {
    // Considera usar PATCH en lugar de PUT si solo actualizas algunos campos
    const response = await fetch(`${API_URL} / tareas / ${taskId}`, {
        method: 'PATCH', // Cambiado a PATCH (o usa PUT si prefieres reemplazo completo)
        headers: createAuthHeaders(), // <-- Añade autenticación
        body: JSON.stringify(taskData),
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error('Sesión inválida o expirada.');
        throw new Error('Error al actualizar la tarea');
    }
    // PATCH/PUT a menudo devuelven el objeto actualizado
    return response.json();
}


async function deleteTask(taskId) {
    const response = await fetch(`${API_URL}/tareas/${taskId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(), // <-- Añade autenticación
    });
    // DELETE exitoso a menudo devuelve 204 No Content
    if (!response.ok && response.status !== 204) {
        if (response.status === 401) throw new Error('Sesión inválida o expirada.');
        throw new Error('Error al eliminar la tarea');
    }
    // No hay cuerpo JSON que devolver en un 204
}

// Exporta las funciones corregidas y la nueva getAllCatalogs
export { login, getAllCatalogs, getTasks, createTask, updateTask, deleteTask };