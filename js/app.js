import { getCatalog, getTasks, createTask } from './api-service.js';

console.log(" Módulo app.js cargado correctamente.");

// --- VERIFICACIÓN DE AUTENTICACIÓN ---
if (!localStorage.getItem('authToken')) {
    console.warn(" No se encontró authToken. Redirigiendo a login.html");
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

const selects = {
    cliente: document.getElementById('select-cliente'),
    proyecto: document.getElementById('select-proyecto'),
    provincia: document.getElementById('select-provincia'),
    ciudad: document.getElementById('select-ciudad'),
    unidadNegocio: document.getElementById('select-unidad-negocio'),
    agencia: document.getElementById('select-agencia'),
    equipo: document.getElementById('select-equipo'),
};

const equipoInfo = {
    nombre: document.getElementById('info-nombre-equipo'),
    caracteristicas: document.getElementById('info-caracteristicas-equipo'),
};

// --- DATOS GLOBALES (Caché de catálogos) ---
let todosLosEquipos = [];
let todasLasAgencias = [];
let todasLasUnidades = [];

// --- LÓGICA DE RENDERIZADO Y UTILIDADES ---
function popularSelect(selectElement, items, { placeholder, valueKey = 'id', textKey = 'nombre' }) {
    selectElement.innerHTML = `<option value="">-- ${placeholder} --</option>`;
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        selectElement.appendChild(option);
    });
    selectElement.disabled = false;
    console.log(` Poplado select '${selectElement.id}' con ${items.length} items.`);
}

function resetSelect(selectElement, message = 'Seleccione...') {
    selectElement.innerHTML = `<option value="">-- ${message} --</option>`;
    selectElement.disabled = true;
}

// --- MANEJO DE PESTAÑAS ---
function cambiarVista(vistaActiva) {
    console.log(`Cambiando a vista: ${vistaActiva}`);
    vistaCrear.classList.toggle('active', vistaActiva === 'crear');
    vistaGestionar.classList.toggle('active', vistaActiva !== 'crear');
    tabCrear.classList.toggle('active', vistaActiva === 'crear');
    tabGestionar.classList.toggle('active', vistaActiva !== 'crear');
    if (vistaActiva !== 'crear') {
        cargarYMostrarTareas();
    }
}

async function cargarYMostrarTareas() {
    taskListContainer.innerHTML = '<p>Cargando tareas...</p>';
    try {
        console.log(" Pidiendo tareas a la API...");
        const tareas = await getTasks();
        console.log(" Tareas recibidas:", tareas);
        if (tareas.length === 0) {
            taskListContainer.innerHTML = '<p>No hay tareas creadas todavía.</p>';
            return;
        }

        taskListContainer.innerHTML = '';
        tareas.forEach(tarea => {
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
        console.error(" Fallo al cargar tareas:", error);
        taskListContainer.innerHTML = '<p class="error-message">Error al cargar las tareas.</p>';
    }
}

// --- LÓGICA DE FORMULARIO Y CASCADA ---
async function inicializarFormulario() {
    console.log(" Iniciando carga de catálogos para el formulario...");
    try {
        const [clientes, provincias, unidades] = await Promise.all([
            getCatalog('clientes'),
            getCatalog('provincias'),
            getCatalog('unidades_negocio'),
        ]);
        console.log(" Catálogos iniciales recibidos:", { clientes, provincias, unidades });

        todasLasUnidades = unidades;
        popularSelect(selects.cliente, clientes, { placeholder: 'Seleccione un cliente', textKey: 'nombre_completo' });
        popularSelect(selects.provincia, provincias, { placeholder: 'Seleccione una provincia' });
    } catch (error) {
        console.error('Error fatal inicializando el formulario:', error);
        alert('No se pudieron cargar los datos iniciales. Revise la consola para más detalles.');
    }
}

selects.cliente.addEventListener('change', async (e) => {
    const clienteId = e.target.value;
    resetSelect(selects.proyecto, 'Seleccione un cliente...');
    if (clienteId) {
        console.log(`Cliente seleccionado: ${clienteId}. Pidiendo proyectos...`);
        const params = new URLSearchParams({ cliente_id: clienteId });
        const proyectos = await getCatalog('proyectos', params);
        popularSelect(selects.proyecto, proyectos, { placeholder: 'Seleccione un proyecto' });
    }
});

selects.provincia.addEventListener('change', async (e) => {
    const provinciaId = e.target.value;
    resetSelect(selects.ciudad, 'Seleccione una provincia...');
    resetSelect(selects.agencia, 'Seleccione una ciudad...');
    resetSelect(selects.equipo, 'Seleccione una agencia...');
    if (provinciaId) {
        console.log(`Provincia seleccionada: ${provinciaId}. Pidiendo ciudades...`);
        const params = new URLSearchParams({ provincia_id: provinciaId });
        const ciudades = await getCatalog('ciudades', params);
        popularSelect(selects.ciudad, ciudades, { placeholder: 'Seleccione una ciudad' });
    }
});

selects.ciudad.addEventListener('change', async (e) => {
    const ciudadId = e.target.value;
    resetSelect(selects.agencia, 'Seleccione una ciudad...');
    resetSelect(selects.equipo, 'Seleccione una agencia...');
    if (ciudadId) {
        console.log(`Ciudad seleccionada: ${ciudadId}. Pidiendo agencias...`);
        const params = new URLSearchParams({ ciudad_id: ciudadId });
        const agencias = await getCatalog('agencias', params);
        todasLasAgencias = agencias;
        popularSelect(selects.agencia, agencias, { placeholder: 'Seleccione una agencia' });
    }
});

selects.agencia.addEventListener('change', async (e) => {
    const agenciaId = e.target.value;
    resetSelect(selects.equipo, 'Seleccione una agencia...');
    resetSelect(selects.unidadNegocio, 'Seleccione...');

    const agenciaSeleccionada = todasLasAgencias.find(a => a.id == agenciaId);
    if (agenciaSeleccionada) {
        const unidad = todasLasUnidades.find(u => u.id === agenciaSeleccionada.unidad_negocio_id);
        if (unidad) {
            popularSelect(selects.unidadNegocio, [unidad], { placeholder: unidad.nombre });
            selects.unidadNegocio.value = unidad.id; // La pre-seleccionamos
        }
    }

    if (agenciaId) {
        console.log(`Agencia seleccionada: ${agenciaId}. Pidiendo equipos...`);
        const params = new URLSearchParams({ agencia_id: agenciaId });
        todosLosEquipos = await getCatalog('equipos', params);
        // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
        // Le decimos explícitamente que use el 'id' para el texto visible.
        popularSelect(selects.equipo, todosLosEquipos, { placeholder: 'Seleccione un Nº de Serie', textKey: 'id' });
    }
});

selects.equipo.addEventListener('change', (e) => {
    const equipoId = e.target.value;
    equipoInfo.nombre.value = '';
    equipoInfo.caracteristicas.value = '';
    createTaskButton.disabled = true;

    if (equipoId) {
        const equipoSeleccionado = todosLosEquipos.find(eq => eq.id === equipoId);
        if (equipoSeleccionado) {
            equipoInfo.nombre.value = equipoSeleccionado.nombre;
            equipoInfo.caracteristicas.value = `${equipoSeleccionado.modelo} - ${equipoSeleccionado.caracteristicas}`;
            createTaskButton.disabled = false;
        }
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    createTaskButton.disabled = true;
    createTaskButton.textContent = 'Creando...';

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
    console.log("Enviando nueva tarea:", taskData);

    try {
        await createTask(taskData);
        alert('¡Tarea creada con éxito!');
        form.reset();
        Object.values(selects).forEach(s => resetSelect(s));
        inicializarFormulario();
        cambiarVista('gestionar');
    } catch (error) {
        alert('Hubo un error al crear la tarea.');
        console.error("Fallo al crear tarea:", error);
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

