import { getCatalog, getTasks, createTask } from './api-service.js';

// --- VERIFICACIÓN DE AUTENTICACIÓN ---
// Si no hay token, se redirige al login. Esta es nuestra "guardia".
if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
}

// --- ELEMENTOS DEL DOM ---
const logoutButton = document.getElementById('logout-button');
const tabCrear = document.getElementById('tab-crear');
const tabGestionar = document.getElementById('tab-gestionar');
const vistaCrear = document.getElementById('vista-crear');
const vistaGestionar = document.getElementById('vista-gestionar');
const form = document.getElementById('formulario-tarea');
const taskListContainer = document.getElementById('lista-tareas-container');
const createTaskButton = document.getElementById('btn-crear-tarea');

// Selects del formulario
const selects = {
    cliente: document.getElementById('select-cliente'),
    proyecto: document.getElementById('select-proyecto'),
    provincia: document.getElementById('select-provincia'),
    ciudad: document.getElementById('select-ciudad'),
    unidadNegocio: document.getElementById('select-unidad-negocio'),
    agencia: document.getElementById('select-agencia'),
    equipo: document.getElementById('select-equipo'),
};

// Inputs de información del equipo
const equipoInfo = {
    nombre: document.getElementById('info-nombre-equipo'),
    caracteristicas: document.getElementById('info-caracteristicas-equipo'),
}

// --- DATOS GLOBALES ---
let todosLosEquipos = [];

// --- MANEJO DE PESTAÑAS ---
function cambiarVista(vistaActiva) {
    if (vistaActiva === 'crear') {
        vistaCrear.classList.add('active');
        vistaGestionar.classList.remove('active');
        tabCrear.classList.add('active');
        tabGestionar.classList.remove('active');
    } else {
        vistaCrear.classList.remove('active');
        vistaGestionar.classList.add('active');
        tabCrear.classList.remove('active');
        tabGestionar.classList.add('active');
        cargarYMostrarTareas(); // Recargamos las tareas al cambiar a esta vista
    }
}

// --- LÓGICA DE RENDERIZADO ---
function popularSelect(selectElement, items, { placeholder, valueKey = 'id', textKey = 'nombre' }) {
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        selectElement.appendChild(option);
    });
    selectElement.disabled = false;
}

async function cargarYMostrarTareas() {
    taskListContainer.innerHTML = '<p>Cargando tareas...</p>';
    try {
        const tareas = await getTasks();
        if (tareas.length === 0) {
            taskListContainer.innerHTML = '<p>No hay tareas creadas todavía.</p>';
            return;
        }

        taskListContainer.innerHTML = ''; // Limpiamos el contenedor
        tareas.forEach(tarea => {
            // Creamos la tarjeta de la tarea
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <div class="task-card-header">
                    <h3 class="task-card-title">${tarea.equipo_nombre || 'Equipo no especificado'}</h3>
                    <span class="task-card-status ${tarea.estado}">${tarea.estado}</span>
                </div>
                <div class="task-card-body">
                    <p><strong>Nº Serie:</strong> ${tarea.equipo_id}</p>
                    <p><strong>Localidad:</strong> ${tarea.agencia_nombre}</p>
                    <p><strong>Cliente:</strong> ${tarea.cliente_nombre}</p>
                </div>
                <div class="task-card-footer">
                    <button class="task-card-button delete" data-task-id="${tarea.id}">Eliminar</button>
                </div>
            `;
            taskListContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        taskListContainer.innerHTML = '<p class="error-message">Error al cargar las tareas.</p>';
    }
}

// --- LÓGICA DE FORMULARIO Y CASCADA ---
async function inicializarFormulario() {
    try {
        const [clientes, provincias] = await Promise.all([
            getCatalog('clientes'),
            getCatalog('provincias'),
        ]);
        popularSelect(selects.cliente, clientes, { placeholder: 'Seleccione un cliente' });
        popularSelect(selects.provincia, provincias, { placeholder: 'Seleccione una provincia' });
    } catch (error) {
        console.error('Error inicializando el formulario:', error);
    }
}

selects.provincia.addEventListener('change', async (e) => {
    const provinciaId = e.target.value;
    // Resetear selects dependientes
    selects.ciudad.innerHTML = '<option>Cargando...</option>';
    selects.ciudad.disabled = true;

    if (provinciaId) {
        const params = new URLSearchParams({ provincia_id: provinciaId });
        const ciudades = await getCatalog('ciudades', params);
        popularSelect(selects.ciudad, ciudades, { placeholder: 'Seleccione una ciudad' });
    }
});

selects.agencia.addEventListener('change', async (e) => {
    const agenciaId = e.target.value;
    selects.equipo.innerHTML = '<option>Cargando...</option>';
    selects.equipo.disabled = true;

    if (agenciaId) {
        const params = new URLSearchParams({ agencia_id: agenciaId });
        todosLosEquipos = await getCatalog('equipos', params);
        popularSelect(selects.equipo, todosLosEquipos, { placeholder: 'Seleccione un Nº de Serie' });
    }
});

selects.equipo.addEventListener('change', (e) => {
    const equipoId = e.target.value;
    if (equipoId) {
        const equipoSeleccionado = todosLosEquipos.find(eq => eq.id === equipoId);
        if (equipoSeleccionado) {
            equipoInfo.nombre.value = equipoSeleccionado.nombre;
            equipoInfo.caracteristicas.value = `${equipoSeleccionado.modelo} - ${equipoSeleccionado.caracteristicas}`;
            createTaskButton.disabled = false;
        }
    } else {
        equipoInfo.nombre.value = '';
        equipoInfo.caracteristicas.value = '';
        createTaskButton.disabled = true;
    }
});

// Lógica de cascada simplificada (para proyectos, unidades, agencias)
// En una app real, esta lógica sería más compleja y se basaría en más llamadas a la API
selects.cliente.addEventListener('change', () => { selects.proyecto.disabled = false; });
selects.ciudad.addEventListener('change', () => { selects.agencia.disabled = false; selects.unidadNegocio.disabled = false; });


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    createTaskButton.disabled = true;
    createTaskButton.textContent = 'Creando...';

    // Recolectamos todos los datos del formulario
    const taskData = {
        cliente_id: selects.cliente.value,
        cliente_nombre: selects.cliente.options[selects.cliente.selectedIndex].text,
        proyecto_id: selects.proyecto.value,
        provincia_id: selects.provincia.value,
        ciudad_id: selects.ciudad.value,
        unidad_negocio_id: selects.unidadNegocio.value,
        agencia_id: selects.agencia.value,
        agencia_nombre: selects.agencia.options[selects.agencia.selectedIndex].text,
        equipo_id: selects.equipo.value,
        equipo_nombre: equipoInfo.nombre.value,
    };

    try {
        await createTask(taskData);
        alert('¡Tarea creada con éxito!');
        form.reset(); // Limpiamos el formulario
        // Resetear selects a su estado inicial
        Object.values(selects).forEach(s => s.disabled = true);
        inicializarFormulario();
        cambiarVista('gestionar'); // Cambiamos a la vista de gestión para ver la nueva tarea
    } catch (error) {
        console.error(error);
        alert('Hubo un error al crear la tarea.');
    } finally {
        createTaskButton.disabled = false;
        createTaskButton.textContent = 'Crear Tarea';
    }
});


// --- INICIALIZACIÓN ---
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});

tabCrear.addEventListener('click', () => cambiarVista('crear'));
tabGestionar.addEventListener('click', () => cambiarVista('gestionar'));

// Iniciar la aplicación
inicializarFormulario();
