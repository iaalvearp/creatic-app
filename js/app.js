// creaticWeb/js/app.js
import { getCatalog, getTasks, createTask, updateTask, deleteTask } from './api-service.js';

// --- VERIFICACIÓN DE AUTENTICACIÓN ---
if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
}

// --- ELEMENTOS DEL DOM ---
const logoutButton = document.getElementById('logout-button');
const tabCrear = document.getElementById('tab-crear');
const tabGestionar = document.getElementById('tab-gestionar');
const tabInformes = document.getElementById('tab-informes');
const vistaCrear = document.getElementById('vista-crear');
const vistaGestionar = document.getElementById('vista-gestionar');
const vistaInformes = document.getElementById('vista-informes');
const form = document.getElementById('formulario-tarea');
const taskListContainer = document.getElementById('lista-tareas-container');
const informesListContainer = document.getElementById('lista-informes-container');
const fichaContainer = document.getElementById('ficha-container');
const btnVolverLista = document.getElementById('btn-volver-lista');
const submitButton = document.getElementById('btn-submit-form');
const cancelButton = document.getElementById('btn-cancelar');
const formTitle = document.getElementById('form-title');
const informesHeader = document.querySelector('#vista-informes .gestion-header');

const selects = {
    cliente: document.getElementById('select-cliente'),
    proyecto: document.getElementById('select-proyecto'),
    provincia: document.getElementById('select-provincia'),
    ciudad: document.getElementById('select-ciudad'),
    unidadNegocio: document.getElementById('select-unidad-negocio'),
    agencia: document.getElementById('select-agencia'),
    equipo: document.getElementById('select-equipo'),
    tecnico: document.getElementById('select-tecnico'),
};

const equipoInfo = {
    nombre: document.getElementById('info-nombre-equipo'),
    caracteristicas: document.getElementById('info-caracteristicas-equipo'),
};


// --- ESTADO GLOBAL ---
let modoFormulario = 'crear';
let idTareaEditando = null;
let todosLosDatosDeCatalogos = {};
let tareasCompletadasSimuladas = [];

// --- LÓGICA DE DATOS SIMULADOS ---
function simularDatosDeTecnico(tarea) {
    const datosSimulados = {
        ...tarea,
        estado: 'Completado',
        fecha_completado: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        observaciones_preventivo: 'Se realizó limpieza general del equipo y organización del cableado. No se encontraron alarmas visuales.',
        observaciones_correctivo: 'N/A',
        actividades_preventivo: [1, 2, 4, 5, 6, 8],
        actividades_correctivo: [],
        actividades_diagnostico: [1, 2, 3, 5, 6],
        fotos_preventivo: ['assets/logo.png', 'assets/favicon.png'],
        fotos_correctivo: [],
    };
    return datosSimulados;
}


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
}

function resetSelect(selectElement, message = 'Seleccione...') {
    selectElement.innerHTML = `<option value="">-- ${message} --</option>`;
    selectElement.disabled = true;
}

// --- MANEJO DE PESTAÑAS Y VISTAS ---
function cambiarVista(vistaActiva) {
    vistaCrear.classList.toggle('active', vistaActiva === 'crear');
    vistaGestionar.classList.toggle('active', vistaActiva === 'gestionar');
    vistaInformes.classList.toggle('active', vistaActiva === 'informes');

    tabCrear.classList.toggle('active', vistaActiva === 'crear');
    tabGestionar.classList.toggle('active', vistaActiva === 'gestionar');
    tabInformes.classList.toggle('active', vistaActiva === 'informes');

    if (vistaActiva !== 'ficha') {
        fichaContainer.classList.add('hidden');
        informesHeader.classList.remove('hidden');
        informesListContainer.classList.remove('hidden');
    }

    if (vistaActiva === 'gestionar') cargarYMostrarTareas();
    if (vistaActiva === 'informes') cargarTareasParaInformes();
}

// --- LÓGICA DE LA PESTAÑA "GESTIONAR" ---
async function cargarYMostrarTareas() {
    taskListContainer.innerHTML = '<p>Cargando tareas...</p>';
    try {
        if (Object.keys(todosLosDatosDeCatalogos).length === 0) await inicializarAplicacion();
        const tareas = await getTasks();
        if (tareas.length === 0) {
            taskListContainer.innerHTML = '<p>No hay tareas creadas todavía.</p>';
            return;
        }

        taskListContainer.innerHTML = '';
        tareas.forEach(tarea => {
            const card = document.createElement('div');
            card.className = 'task-card';
            const equipoData = todosLosDatosDeCatalogos.equipos?.find(e => e.id === tarea.equipo_id) || {};
            const ciudadData = todosLosDatosDeCatalogos.ciudades?.find(c => c.id == tarea.ciudad_id) || {};

            card.innerHTML = `
                <div class="task-card-header">
                    <h3 class="task-card-title">${tarea.equipo_nombre || 'Equipo no especificado'}</h3>
                    <span class="task-card-status ${tarea.estado}">${tarea.estado}</span>
                </div>
                <div class="task-card-body">
                    <p><strong>Nº Serie:</strong> ${tarea.equipo_id}</p>
                    <p><strong>Modelo:</strong> ${equipoData.modelo || 'N/A'}</p>
                    <p><strong>Ciudad:</strong> ${ciudadData.nombre || 'N/A'}</p>
                    <p><strong>Localidad:</strong> ${tarea.agencia_nombre}</p>
                    <p><strong>Asignado a:</strong> ${tarea.tecnico_nombre || 'No asignado'}</p>
                </div>
                <div class="task-card-footer">
                    <button class="task-card-button edit" data-task='${JSON.stringify(tarea)}'>Editar</button>
                    <button class="task-card-button delete" data-task-id="${tarea.id}">Eliminar</button>
                </div>
            `;
            taskListContainer.appendChild(card);
        });
    } catch (error) {
        taskListContainer.innerHTML = '<p class="error-message">Error al cargar las tareas.</p>';
    }
}

// --- LÓGICA DE LA PESTAÑA "INFORMES" ---
async function cargarTareasParaInformes() {
    informesListContainer.innerHTML = '<p>Cargando tareas...</p>';
    try {
        if (Object.keys(todosLosDatosDeCatalogos).length === 0) await inicializarAplicacion();

        const tareas = await getTasks();
        tareasCompletadasSimuladas = tareas.map(simularDatosDeTecnico);

        const tareasCompletadas = tareasCompletadasSimuladas.filter(t => t.estado === 'Completado');

        if (tareasCompletadas.length === 0) {
            informesListContainer.innerHTML = '<p>No hay tareas completadas para generar informes.</p>';
            return;
        }

        informesListContainer.innerHTML = '';
        tareasCompletadas.forEach(tarea => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.dataset.taskData = JSON.stringify(tarea);
            const ciudadData = todosLosDatosDeCatalogos.ciudades?.find(c => c.id == tarea.ciudad_id) || {};
            card.innerHTML = `
                <div class="task-card-header">
                    <h3 class="task-card-title">${tarea.equipo_nombre}</h3>
                    <span class="task-card-status Completado">Completado</span>
                </div>
                <div class="task-card-body">
                    <p><strong>Nº Serie:</strong> ${tarea.equipo_id}</p>
                    <p><strong>Ciudad:</strong> ${ciudadData.nombre || 'N/A'}</p>
                    <p><strong>Técnico:</strong> ${tarea.tecnico_nombre}</p>
                    <p><strong>Fecha:</strong> ${tarea.fecha_completado}</p>
                </div>
            `;
            informesListContainer.appendChild(card);
        });
    } catch (error) {
        informesListContainer.innerHTML = '<p class="error-message">Error al cargar las tareas.</p>';
    }
}

function mostrarFichaDeMantenimiento(tarea) {
    informesHeader.classList.add('hidden');
    informesListContainer.classList.add('hidden');
    fichaContainer.classList.remove('hidden');

    document.getElementById('info-cliente').textContent = tarea.cliente_nombre;
    document.getElementById('info-fecha').textContent = tarea.fecha_completado;
    document.getElementById('info-proyecto').textContent = todosLosDatosDeCatalogos.proyectos.find(p => p.id == tarea.proyecto_id)?.nombre || 'N/A';
    document.getElementById('info-provincia').textContent = todosLosDatosDeCatalogos.provincias.find(p => p.id == tarea.provincia_id)?.nombre || 'N/A';
    document.getElementById('info-ciudad').textContent = todosLosDatosDeCatalogos.ciudades.find(c => c.id == tarea.ciudad_id)?.nombre || 'N/A';
    document.getElementById('info-unidad-negocio').textContent = todosLosDatosDeCatalogos.unidades_negocio.find(u => u.id == tarea.unidad_negocio_id)?.nombre || 'N/A';
    document.getElementById('info-agencia').textContent = tarea.agencia_nombre;

    const equipo = todosLosDatosDeCatalogos.equipos.find(e => e.id === tarea.equipo_id);
    document.getElementById('info-tipo-equipo').textContent = equipo?.nombre || 'N/A';
    document.getElementById('info-modelo-equipo').textContent = equipo?.modelo || 'N/A';
    document.getElementById('info-serie-equipo').textContent = tarea.equipo_id;

    document.getElementById('obs-preventivo').value = tarea.observaciones_preventivo;
    document.getElementById('obs-correctivo').value = tarea.observaciones_correctivo;
}


// --- LÓGICA DE FORMULARIO (Crear/Editar) ---
function resetFormularioAModoCrear() {
    form.reset();

    popularSelect(selects.cliente, todosLosDatosDeCatalogos.clientes || [], { placeholder: 'Seleccione un cliente', textKey: 'nombre_completo' });
    popularSelect(selects.provincia, todosLosDatosDeCatalogos.provincias || [], { placeholder: 'Seleccione una provincia' });
    popularSelect(selects.tecnico, todosLosDatosDeCatalogos.tecnicos || [], { placeholder: 'Seleccione un técnico' });
    selects.tecnico.disabled = false;

    resetSelect(selects.proyecto, 'Seleccione un cliente...');
    resetSelect(selects.ciudad, 'Seleccione una provincia...');
    resetSelect(selects.agencia, 'Seleccione una ciudad...');
    resetSelect(selects.equipo, 'Seleccione una agencia...');
    resetSelect(selects.unidadNegocio, 'Seleccione...');

    Object.values(equipoInfo).forEach(i => i.value = '');

    modoFormulario = 'crear';
    idTareaEditando = null;
    if (formTitle) formTitle.textContent = 'Información General';
    submitButton.textContent = 'Crear Tarea';
    submitButton.disabled = true;
    cancelButton.style.display = 'none';
}

async function prepararFormularioParaEditar(tarea) {
    resetFormularioAModoCrear();
    cambiarVista('crear');
    if (formTitle) formTitle.textContent = `Editando Tarea: ${tarea.equipo_nombre || tarea.id}`;
    submitButton.textContent = 'Guardar Cambios';
    cancelButton.style.display = 'inline-block';
    modoFormulario = 'editar';
    idTareaEditando = tarea.id;

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    selects.cliente.value = tarea.cliente_id;
    await selects.cliente.dispatchEvent(new Event('change'));
    await delay(200);
    selects.proyecto.value = tarea.proyecto_id;

    selects.provincia.value = tarea.provincia_id;
    await selects.provincia.dispatchEvent(new Event('change'));
    await delay(200);
    selects.ciudad.value = tarea.ciudad_id;
    await selects.ciudad.dispatchEvent(new Event('change'));
    await delay(200);
    selects.agencia.value = tarea.agencia_id;
    await selects.agencia.dispatchEvent(new Event('change'));
    await delay(200);
    selects.equipo.value = tarea.equipo_id;
    selects.equipo.dispatchEvent(new Event('change'));

    selects.tecnico.value = tarea.tecnico_id;
}


// --- INICIALIZACIÓN Y EVENTOS ---
async function inicializarAplicacion() {
    try {
        const catalogosAObtener = [
            'clientes', 'proyectos', 'provincias', 'ciudades',
            'unidades_negocio', 'agencias', 'equipos', 'tecnicos'
        ];
        const promesas = catalogosAObtener.map(nombre => getCatalog(nombre));
        const resultados = await Promise.all(promesas);

        catalogosAObtener.forEach((nombre, index) => {
            todosLosDatosDeCatalogos[nombre] = resultados[index];
        });

        resetFormularioAModoCrear();
    } catch (error) {
        console.error('Error fatal inicializando catálogos:', error);
        alert('No se pudieron cargar los datos iniciales. Por favor, recargue la página.');
    }
}

// --- EVENT LISTENERS ---
selects.cliente.addEventListener('change', (e) => {
    const clienteId = e.target.value;
    resetSelect(selects.proyecto, 'Seleccione un cliente...');
    if (clienteId) {
        const proyectosFiltrados = todosLosDatosDeCatalogos.proyectos.filter(p => p.cliente_id == clienteId);
        popularSelect(selects.proyecto, proyectosFiltrados, { placeholder: 'Seleccione un proyecto' });
    }
});
selects.provincia.addEventListener('change', (e) => {
    const provinciaId = e.target.value;
    resetSelect(selects.ciudad, 'Seleccione una provincia...');
    resetSelect(selects.agencia, 'Seleccione una ciudad...');
    resetSelect(selects.equipo, 'Seleccione una agencia...');
    if (provinciaId) {
        const ciudadesFiltradas = todosLosDatosDeCatalogos.ciudades.filter(c => c.provincia_id == provinciaId);
        popularSelect(selects.ciudad, ciudadesFiltradas, { placeholder: 'Seleccione una ciudad' });
    }
});
selects.ciudad.addEventListener('change', (e) => {
    const ciudadId = e.target.value;
    resetSelect(selects.agencia, 'Seleccione una ciudad...');
    resetSelect(selects.equipo, 'Seleccione una agencia...');
    if (ciudadId) {
        const agenciasFiltradas = todosLosDatosDeCatalogos.agencias.filter(a => a.ciudad_id == ciudadId);
        popularSelect(selects.agencia, agenciasFiltradas, { placeholder: 'Seleccione una agencia' });
    }
});
selects.agencia.addEventListener('change', (e) => {
    const agenciaId = e.target.value;
    resetSelect(selects.equipo, 'Seleccione una agencia...');
    const agenciaSeleccionada = todosLosDatosDeCatalogos.agencias?.find(a => a.id == agenciaId);
    if (agenciaSeleccionada) {
        // ¡CORRECCIÓN DEL TYPO!
        const unidad = todosLosDatosDeCatalogos.unidades_negocio.find(u => u.id === agenciaSeleccionada.unidad_negocio_id);
        if (unidad) {
            popularSelect(selects.unidadNegocio, [unidad], { placeholder: unidad.nombre });
            selects.unidadNegocio.value = unidad.id;
        }
    } else {
        resetSelect(selects.unidadNegocio, 'Seleccione...');
    }
    if (agenciaId) {
        const equiposFiltrados = todosLosDatosDeCatalogos.equipos.filter(eq => eq.agencia_id == agenciaId);
        popularSelect(selects.equipo, equiposFiltrados, { placeholder: 'Seleccione un Nº de Serie', textKey: 'id' });
    }
});
selects.equipo.addEventListener('change', (e) => {
    const equipoId = e.target.value;
    equipoInfo.nombre.value = '';
    equipoInfo.caracteristicas.value = '';
    submitButton.disabled = true;
    if (equipoId) {
        const equipoSeleccionado = todosLosDatosDeCatalogos.equipos?.find(eq => eq.id === equipoId);
        if (equipoSeleccionado) {
            equipoInfo.nombre.value = equipoSeleccionado.nombre;
            equipoInfo.caracteristicas.value = `${equipoSeleccionado.modelo} - ${equipoSeleccionado.caracteristicas}`;
            submitButton.disabled = false;
        }
    }
});

taskListContainer.addEventListener('click', async (e) => {
    const editButton = e.target.closest('.edit');
    if (editButton) {
        try {
            const tareaData = JSON.parse(editButton.dataset.task);
            await prepararFormularioParaEditar(tareaData);
        } catch (error) {
            console.error('Error al preparar el formulario para editar:', error);
            alert('Ocurrió un error al intentar editar la tarea.');
        }
        return;
    }

    const deleteButton = e.target.closest('.delete');
    if (deleteButton) {
        const taskId = deleteButton.dataset.taskId;
        if (confirm('¿Está seguro de que desea eliminar esta tarea? Esta acción no se puede deshacer.')) {
            try {
                await deleteTask(taskId);
                alert('Tarea eliminada con éxito.');
                await cargarYMostrarTareas();
            } catch (error) {
                console.error('Error al eliminar la tarea:', error);
                alert('No se pudo eliminar la tarea.');
            }
        }
    }
});


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = modoFormulario === 'crear' ? 'Creando...' : 'Guardando...';

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
        tecnico_id: selects.tecnico.value,
        tecnico_nombre: selects.tecnico.options[selects.tecnico.selectedIndex].text.trim(),
    };

    try {
        if (modoFormulario === 'crear') {
            await createTask(taskData);
            alert('¡Tarea creada con éxito!');
        } else {
            await updateTask(idTareaEditando, taskData);
            alert('¡Tarea actualizada con éxito!');
        }
        resetFormularioAModoCrear();
        cambiarVista('gestionar');
    } catch (error) {
        alert(`Hubo un error al ${modoFormulario === 'crear' ? 'crear' : 'actualizar'} la tarea.`);
        submitButton.disabled = false;
        if (modoFormulario === 'editar') {
            submitButton.textContent = 'Guardar Cambios';
        } else {
            submitButton.textContent = 'Crear Tarea';
        }
    }
});

cancelButton.addEventListener('click', resetFormularioAModoCrear);
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});
tabCrear.addEventListener('click', () => {
    resetFormularioAModoCrear();
    cambiarVista('crear');
});
tabGestionar.addEventListener('click', () => cambiarVista('gestionar'));
tabInformes.addEventListener('click', () => cambiarVista('informes'));

btnVolverLista.addEventListener('click', () => {
    informesHeader.classList.remove('hidden');
    informesListContainer.classList.remove('hidden');
    fichaContainer.classList.add('hidden');
});

informesListContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.task-card');
    if (card && card.dataset.taskData) {
        const tarea = JSON.parse(card.dataset.taskData);
        mostrarFichaDeMantenimiento(tarea);
    }
});

// --- INICIALIZACIÓN DE LA APP ---
inicializarAplicacion();

