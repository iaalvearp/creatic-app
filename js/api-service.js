
// --- PUNTO CENTRAL DE CONFIGURACIÓN ---
const ENTORNO = 'produccion'; // Cambiado a producción para usar la API real
const CONFIG = {
    mock: { BASE_URL: 'https://api-mock.iaalvearp.workers.dev' },
    produccion: { BASE_URL: 'https://api-mock.iaalvearp.workers.dev' } // Usando la API externa
};
const API_URL = CONFIG[ENTORNO].BASE_URL;

// Base de datos temporal mientras se migra
let mockTaskDatabase = [];

// --- Helpers de Auth ---
function getAuthToken() {
    return localStorage.getItem('accessToken');
}

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

/**
 * Login (Guarda 'accessToken' y 'userRole')
 */
async function login(email, password) {
    console.log("Autenticando con API externa...");

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Credenciales incorrectas');
        }

        const data = await response.json();

        if (data.tokens && data.user) {
            localStorage.setItem('accessToken', data.tokens.access_token);
            localStorage.setItem('userRole', data.user.rolId);
        }

        return data;
    } catch (error) {
        console.error("Error en el login desde la API:", error);
        // Simplemente volvemos a lanzar el error para que el formulario lo atrape
        throw error;
    }
}

/**
 * Obtiene todos los catálogos desde la API externa
 */
async function getAllCatalogs() {
    console.log("Cargando catálogos desde API externa...");

    try {
        const response = await fetch(`${API_URL}/catalogs`, {
            method: 'GET',
            headers: createAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener catálogos');
        }

        return await response.json();
    } catch (error) {
        console.error("Error al obtener catálogos desde la API:", error);
        // Simplemente volvemos a lanzar el error
        throw error;
    }
}

/**
 * Obtiene las tareas desde la API externa
 */
async function getTasks() {
    console.log("Obteniendo tareas desde API externa...");
    try {
        const cacheBuster = new Date().getTime(); // Crea un número único (ej: 1678886400000)
        const response = await fetch(`${API_URL}/tareas?cb=${cacheBuster}`, { // Añade el número a la URL
            method: 'GET',
            headers: createAuthHeaders()
        });
        if (!response.ok) {
            throw new Error('Error al obtener tareas');
        }
        return await response.json();
    } catch (error) {
        console.error("Error al obtener tareas desde la API:", error);
        throw error;
    }
}

/**
 * Crea una nueva tarea en la API externa
 */
async function createTask(taskData) {
    console.log('Creando tarea en API externa...', taskData);

    try {
        const response = await fetch(`${API_URL}/tareas`, {
            method: 'POST',
            headers: createAuthHeaders(),
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Error al crear tarea');
        }

        return await response.json();
    } catch (error) {
        console.error("Error al obtener tareas desde la API:", error);
        throw error;
    }
}

/**
 * Actualiza una tarea en la API externa
 */
async function updateTask(taskId, taskData) {
    console.log(`Actualizando tarea ${taskId} en API externa...`, taskData);

    try {
        const response = await fetch(`${API_URL}/tareas/${taskId}`, {
            method: 'PUT',
            headers: createAuthHeaders(),
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar tarea');
        }

        return await response.json();
    } catch (error) {
        console.error("Error al obtener tareas desde la API:", error);
        throw error;
    }
}

/**
 * Elimina una tarea de la API externa
 */
async function deleteTask(taskId) {
    console.log(`Eliminando tarea ${taskId} de API externa...`);

    try {
        const response = await fetch(`${API_URL}/tareas/${taskId}`, {
            method: 'DELETE',
            headers: createAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al eliminar tarea');
        }

        return; // No hay cuerpo JSON que devolver
    } catch (error) {
        console.error("Error al obtener tareas desde la API:", error);
        throw error;
    }
}

// Exporta las funciones
export { login, getAllCatalogs, getTasks, createTask, updateTask, deleteTask };