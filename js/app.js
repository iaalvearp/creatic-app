// js/app.js
import { getAllCatalogs, getTasks, createTask, updateTask, deleteTask } from './api-service.js';
// Importamos esAdmin para las nuevas pestañas
import { protegerPagina, aplicarVisibilidadPorRol, esAdmin, esSupervisor } from './auth-guard.js';

// --- VERIFICACIÓN DE AUTENTICACIÓN ---
protegerPagina();

// Envolvemos TODA la lógica de la app en DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFINICIÓN DE ELEMENTOS DEL DOM ---
    // (Ahora están seguros dentro del listener)

    const logoutButton = document.getElementById('logout-button');

    // Pestañas
    const tabCreacionMasiva = document.getElementById('tab-creacion-masiva');
    const tabCrearEditar = document.getElementById('tab-crear-editar');
    const tabGestionar = document.getElementById('tab-gestionar');
    const tabInformes = document.getElementById('tab-informes');
    const tabIngresoBbdd = document.getElementById('tab-ingreso-bbdd');
    const tabEditarBbdd = document.getElementById('tab-editar-bbdd');

    // Vistas
    const vistaCreacionMasiva = document.getElementById('vista-creacion-masiva');
    const vistaCrearEditar = document.getElementById('vista-crear-editar');
    const vistaGestionar = document.getElementById('vista-gestionar');
    const vistaInformes = document.getElementById('vista-informes');
    const vistaIngresoBbdd = document.getElementById('vista-ingreso-bbdd');
    const vistaEditarBbdd = document.getElementById('vista-editar-bbdd');

    // Filtramos vistas/tabs nulos por si el rol no los renderiza
    const allVistas = [vistaCreacionMasiva, vistaCrearEditar, vistaGestionar, vistaInformes, vistaIngresoBbdd, vistaEditarBbdd].filter(v => v != null);
    const allTabs = [tabCreacionMasiva, tabCrearEditar, tabGestionar, tabInformes, tabIngresoBbdd, tabEditarBbdd].filter(t => t != null);

    // Formularios
    const formMasivo = document.getElementById('form-masivo');
    const formManual = document.getElementById('form-manual');

    // Elementos Pestaña Masiva
    const selectsMasivo = {
        cliente: document.getElementById('select-cliente-masivo'),
        proyecto: document.getElementById('select-proyecto-masivo'),
        tecnico: document.getElementById('select-tecnico-masivo'),
        unidadNegocio: document.getElementById('select-unidad-negocio-masivo'),
        submitButton: document.getElementById('btn-submit-masivo'),
        counter: document.getElementById('equipo-counter')
    };

    // Elementos Pestaña Manual/Editar
    const selectsManual = {
        cliente: document.getElementById('select-cliente-manual'),
        proyecto: document.getElementById('select-proyecto-manual'),
        tecnico: document.getElementById('select-tecnico-manual'),
        provincia: document.getElementById('select-provincia'),
        ciudad: document.getElementById('select-ciudad'),
        agencia: document.getElementById('select-agencia'),
        unidadNegocioInfo: document.getElementById('info-unidad-negocio'),
        equipo: document.getElementById('select-equipo'),
        submitButton: document.getElementById('btn-submit-manual'),
        cancelButton: document.getElementById('btn-cancelar-manual'),
        formTitle: document.getElementById('form-title-manual')
    };
    const equipoInfo = {
        nombre: document.getElementById('info-nombre-equipo'),
        caracteristicas: document.getElementById('info-caracteristicas-equipo'),
    };

    // Elementos Pestaña Gestionar
    const taskListContainer = document.getElementById('lista-tareas-container');
    const btnDeleteSelected = document.getElementById('btn-delete-selected');

    // Elementos Pestaña Informes
    const informesListContainer = document.getElementById('lista-informes-container');
    const fichaContainer = document.getElementById('ficha-container');
    const btnVolverLista = document.getElementById('btn-volver-lista');
    const btnExportarPDF = document.getElementById('btn-exportar-pdf');
    const informesHeader = document.querySelector('#vista-informes .gestion-header');


    // --- 2. ESTADO GLOBAL ---
    let modoFormulario = 'crear';
    let idTareaEditando = null;
    let todosLosDatosDeCatalogos = {};
    let tareasCompletadasSimuladas = [];
    let equiposAplanados = [];
    let equiposFiltradosMasivo = [];
    let tareasSeleccionadasParaBorrar = new Set();


    // --- 3. TODAS LAS FUNCIONES ---

    function popularSelect(selectElement, items, { placeholder, valueKey = 'id', textKey = 'nombre' }) {
        if (!selectElement) return; // Protección
        selectElement.innerHTML = `<option value="">-- ${placeholder} --</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[textKey];
            selectElement.appendChild(option);
        });
        selectElement.disabled = false;
    }

    function actualizarBotonBorrado() {
        if (!btnDeleteSelected) return; // Protección

        const count = tareasSeleccionadasParaBorrar.size;
        if (count > 0) {
            btnDeleteSelected.style.display = 'inline-block';
            btnDeleteSelected.textContent = `Eliminar Seleccionados (${count})`;
            btnDeleteSelected.disabled = false;
        } else {
            btnDeleteSelected.style.display = 'none';
            btnDeleteSelected.textContent = 'Eliminar Seleccionados (0)';
            btnDeleteSelected.disabled = true;
        }
    }

    function resetSelect(selectElement, message = 'Seleccione...') {
        if (!selectElement) return; // Protección
        selectElement.innerHTML = `<option value="">-- ${message} --</option>`;
        selectElement.disabled = true;
    }

    function cambiarVista(vistaActiva) {
        allVistas.forEach(vista => vista.classList.remove('active'));
        allTabs.forEach(tab => tab.classList.remove('active'));

        let vistaTarget, tabTarget;
        switch (vistaActiva) {
            case 'creacion-masiva':
                vistaTarget = vistaCreacionMasiva;
                tabTarget = tabCreacionMasiva;
                break;
            case 'crear-editar':
                vistaTarget = vistaCrearEditar;
                tabTarget = tabCrearEditar;
                break;
            case 'gestionar':
                vistaTarget = vistaGestionar;
                tabTarget = tabGestionar;
                break;
            case 'informes':
                vistaTarget = vistaInformes;
                tabTarget = tabInformes;
                break;
            case 'ingreso-bbdd':
                vistaTarget = vistaIngresoBbdd;
                tabTarget = tabIngresoBbdd;
                break;
            case 'editar-bbdd':
                vistaTarget = vistaEditarBbdd;
                tabTarget = tabEditarBbdd;
                break;
            default:
                vistaTarget = vistaGestionar;
                tabTarget = tabGestionar;
        }

        if (vistaTarget) vistaTarget.classList.add('active');
        if (tabTarget) tabTarget.classList.add('active');

        if (vistaActiva === 'informes') cargarTareasParaInformes();
    }

    async function cargarYMostrarTareas() {
        if (!taskListContainer) {
            console.warn('taskListContainer no existe en este DOM.');
            return;
        }

        taskListContainer.innerHTML = '<p>Cargando tareas...</p>';
        tareasSeleccionadasParaBorrar.clear();
        actualizarBotonBorrado();

        try {
            if (Object.keys(todosLosDatosDeCatalogos).length === 0) {
                await inicializarAplicacion();
            }

            const tareas = await getTasks();

            if (tareas.length === 0) {
                taskListContainer.innerHTML = '<p>No hay tareas creadas todavía.</p>';
                return;
            }

            taskListContainer.innerHTML = '';
            tareas.forEach(tarea => {
                const card = document.createElement('div');
                card.className = 'task-card';
                const editButtonDataset = JSON.stringify(tarea);
                const ciudadData = (todosLosDatosDeCatalogos.ubicacion || [])
                    .flatMap(u => u.ciudades)
                    .find(c => c.id == tarea.ciudad_id) || {};

                card.innerHTML = `
                    <div class="task-card-header">
                        <h3 class="task-card-title">${tarea.equipo_nombre || 'Equipo no especificado'}</h3>
                        <span class="task-card-status ${tarea.estado || 'pendiente'}">${tarea.estado || 'pendiente'}</span>
                    </div>
                    <div class="task-card-body">
                        <p><strong>Nº Serie:</strong> ${tarea.equipo_id}</p>
                        <p><strong>Ciudad:</strong> ${ciudadData.nombre || 'N/A'}</p>
                        <p><strong>Localidad:</strong> ${tarea.agencia_nombre || 'N/A'}</p>
                        <p><strong>Asignado a:</strong> ${tarea.tecnico_nombre || 'No asignado'}</p>
                    </div>
                    <div class="task-card-footer">
                        <button class="task-card-button edit" data-task='${editButtonDataset}'>Editar</button>
                        <button class="task-card-button delete" data-task-id="${tarea.id}">Eliminar</button>
                    </div>
                `;
                taskListContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Error en cargarYMostrarTareas:", error);
            if (taskListContainer) {
                taskListContainer.innerHTML = '<p class="error-message">Error al cargar las tareas.</p>';
            }
        }
    }

    async function cargarTareasParaInformes() {
        if (!informesListContainer) return;
        informesListContainer.innerHTML = '<p>Cargando tarea de ejemplo...</p>';
        try {
            if (Object.keys(todosLosDatosDeCatalogos).length === 0) {
                await inicializarAplicacion();
            }

            // Creamos la Tarea de Ejemplo
            const tareaEjemplo = {
                id: 999,
                cliente_id: 1,
                cliente_nombre: "CORPORACION NACIONAL DE ELECTRICIDAD CNEL EP",
                proyecto_id: 1,
                provincia_id: 9,
                ciudad_id: 3,
                unidad_negocio_id: 1,
                agencia_id: 1,
                agencia_nombre: "AGENCIA GUAYAQUIL",
                equipo_id: "21980107133GJ7000257",
                equipo_nombre: "SWITCH CAPA 3",
                tecnico_id: 104,
                tecnico_nombre: "Juan Carlos Viera",
                estado: 'Completado',
                fecha_completado: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                observaciones_preventivo: 'Se realizó limpieza general del equipo y organización del cableado. No se encontraron alarmas visuales.',
                observaciones_correctivo: 'N/A, el equipo opera con normalidad.',
                actividades_preventivo: [1, 2, 4, 5, 6, 8], // IDs de la tabla
                actividades_correctivo: [],
                actividades_diagnostico: [1, 2, 3, 5, 6],
                fotos_preventivo: ['assets/logo.png', 'assets/favicon.png'], // Rutas de ejemplo
                fotos_correctivo: [],
                fotos_capturas: ['assets/cnel.png'], // Ruta de ejemplo
            };

            tareasCompletadasSimuladas = [tareaEjemplo];
            informesListContainer.innerHTML = '';

            // Renderizamos la tarjeta de ejemplo
            const tarea = tareaEjemplo;
            const card = document.createElement('div');
            card.className = 'task-card';
            card.dataset.taskData = JSON.stringify(tarea);
            card.innerHTML = `
                <div class="task-card-header">
                    <h3 class="task-card-title">${tarea.equipo_nombre}</h3>
                    <span class="task-card-status Completado">Completado</span>
                </div>
                <div class="task-card-body">
                    <p><strong>Nº Serie:</strong> ${tarea.equipo_id}</p>
                    <p><strong>Técnico:</strong> ${tarea.tecnico_nombre}</p>
                    <p><strong>Fecha:</strong> ${tarea.fecha_completado}</p>
                </div>
            `;
            informesListContainer.appendChild(card);

        } catch (error) {
            console.error("Error en cargarTareasParaInformes:", error);
            informesListContainer.innerHTML = '<p class="error-message">Error al cargar la tarea de ejemplo.</p>';
        }
    }

    function mostrarFichaDeMantenimiento(tarea) {
        if (informesHeader) informesHeader.classList.add('hidden');
        if (informesListContainer) informesListContainer.classList.add('hidden');
        if (fichaContainer) fichaContainer.classList.remove('hidden');

        // Volcamos el HTML de la ficha
        const fichaHtml = document.getElementById('ficha-mantenimiento');
        if (fichaHtml && fichaHtml.innerHTML.trim() === '') {
            fichaHtml.innerHTML = `
            <div class="pdf-page">
                <div class="ficha-header"><img src="assets/logo.png" alt="Logo CreaTIC" class="ficha-logo"><div class="ficha-title-container"><h2 class="ficha-title">FICHA DE MANTENIMIENTO</h2><p class="ficha-subtitle">CONTRATO Nro. CNEL-OFC-GJ-006-2024</p></div><img src="./assets/cnel.png" alt="Logo CNEL" class="ficha-logo-cnel"></div>
                <div class="ficha-section"><h3>INFORMACIÓN GENERAL</h3><div class="info-grid"><div class="info-item"><label>CLIENTE:</label><span id="info-cliente"></span></div><div class="info-item"><label>FECHA (DD MM AAAA):</label><span id="info-fecha"></span></div><div class="info-item full-width"><label>NOMBRE DEL PROYECTO:</label><span id="info-proyecto"></span></div><div class="info-item"><label>PROVINCIA:</label><span id="info-provincia"></span></div><div class="info-item"><label>CIUDAD:</label><span id="info-ciudad"></span></div><div class="info-item"><label>NOMBRE UNIDAD DE NEGOCIO:</label><span id="info-unidad-negocio"></span></div><div class="info-item"><label>AGENCIA, OFICINA, SUBESTACIÓN:</label><span id="info-agencia"></span></div></div></div>
                <div class="ficha-section"><h3>INFORMACIÓN DE EQUIPO</h3><div class="info-grid"><div class="info-item"><label>TIPO DE EQUIPO:</label><span id="info-tipo-equipo"></span></div><div class="info-item"><label>MODELO DEL EQUIPO:</label><span id="info-modelo-equipo"></span></div><div class="info-item full-width"><label>NÚMERO DE SERIE DEL EQUIPO:</label><span id="info-serie-equipo"></span></div></div></div>
                <div class="ficha-section"><h3>ACTIVIDADES DE MANTENIMIENTO PREVENTIVO</h3><table class="actividades-table" id="tabla-preventivo">
                    <thead>
                        <tr>
                        <th style="width: 20px;">#</th>
                        <th>TAREA</th>
                        <th style="width: 30px; text-align: center;">X</th>
                        <th>OBSERVACION</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table><label class="obs-label">OBSERVACIONES / RECOMENDACIONES (PREVENTIVO)</label><textarea id="obs-preventivo" rows="4"></textarea></div>
                <div class="ficha-section"><h3>ACTIVIDADES DE MANTENIMIENTO CORRECTIVO</h3><table class="actividades-table" id="tabla-correctivo">
                    <thead>
                        <tr>
                        <th style="width: 20px;">#</th>
                        <th>TAREA</th>
                        <th style="width: 30px; text-align: center;">X</th>
                        <th>OBSERVACION</th>
                        </tr>
                    </thead>
                    <tbody>
                        </tbody>
                    </table><label class="obs-label">OBSERVACIONES / RECOMENDACIONES (CORRECTIVO)</label><textarea id="obs-correctivo" rows="4"></textarea></div>
                <div class="ficha-section"><h3>TAREAS DE DIAGNÓSTICO</h3><table class="actividades-table" id="tabla-diagnostico">
                    <thead>
                        <tr>
                        <th style="width: 20px;">#</th>
                        <th>TAREA</th>
                        <th style="width: 30px; text-align: center;">X</th>
                        <th>OBSERVACION</th>
                        </tr>
                    </thead>
                    <tbody>
                        </tbody>
                    </table></div>
                <div class="pdf-footer">Página 1</div>
            </div>
            <div class="pdf-page">
                <div class="ficha-header"><img src="assets/logo.png" alt="Logo CreaTIC" class="ficha-logo"><h2 class="ficha-title">REPORTE FOTOGRÁFICO</h2><img src="./assets/cnel.png" alt="Logo CNEL" class="ficha-logo-cnel"></div>
                <div class="ficha-section" id="seccion-fotos-preventivo"><h3>MANTENIMIENTO PREVENTIVO</h3><div id="fotos-preventivo" class="fotos-grid"></div></div>
                <div class="ficha-section" id="seccion-fotos-correctivo"><h3>MANTENIMIENTO CORRECTIVO</h3><div id="fotos-correctivo" class="fotos-grid"></div></div>
                <div class="pdf-footer">Página 2</div>
            </div>
            <div class="pdf-page">
                <div class="ficha-header"><img src="assets/logo.png" alt="Logo CreaTIC" class="ficha-logo"><h2 class="ficha-title">CAPTURAS Y FIRMAS</h2><img src="./assets/cnel.png" alt="Logo CNEL" class="ficha-logo-cnel"></div>
                <div class="ficha-section"><h3>CAPTURAS DE DIAGNÓSTICO</h3><div id="fotos-capturas" class="fotos-grid"></div></div>
                <div class="ficha-section"><h3>FIRMAS DE RESPONSABILIDAD</h3><div class="firmas-container"><div class="firma-box"><div id="firma-tecnico" class="firma-imagen"></div><label>Técnico Responsable</label><span id="firma-nombre-tecnico"></span></div><div class="firma-box"><div id="firma-cliente" class="firma-imagen"></div><label>Cliente (Administrador de Contrato)</label><span id="firma-nombre-cliente"></span></div></div></div>
                <div class="pdf-footer">Página 3</div>
            </div>
            `;

            // Rellenar tabla Preventivo
            const tbodyPreventivo = fichaHtml.querySelector('#tabla-preventivo tbody');
            if (tbodyPreventivo && todosLosDatosDeCatalogos.actividadesPreventivo) {
                todosLosDatosDeCatalogos.actividadesPreventivo.forEach((actividad, index) => {
                    const row = tbodyPreventivo.insertRow();
                    const realizado = (tarea.actividades_preventivo || []).includes(actividad.id); // Verifica si el ID está en la data de la tarea
                    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${actividad.nombre}</td>
            <td style="text-align: center;">${realizado ? 'X' : ''}</td>
            <td></td> 
        `;
                    // NOTA: La columna OBSERVACION se deja vacía por ahora.
                    // Necesitaríamos que la 'tarea' guarde qué 'posibleRespuesta' se eligió.
                });
            }

            // Rellenar tabla Correctivo
            const tbodyCorrectivo = fichaHtml.querySelector('#tabla-correctivo tbody');
            if (tbodyCorrectivo && todosLosDatosDeCatalogos.actividadesCorrectivo) {
                todosLosDatosDeCatalogos.actividadesCorrectivo.forEach((actividad, index) => {
                    const row = tbodyCorrectivo.insertRow();
                    const realizado = (tarea.actividades_correctivo || []).includes(actividad.id);
                    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${actividad.nombre}</td>
            <td style="text-align: center;">${realizado ? 'X' : ''}</td>
            <td></td> 
        `;
                });
            }

            // Rellenar tabla Diagnóstico
            const tbodyDiagnostico = fichaHtml.querySelector('#tabla-diagnostico tbody');
            if (tbodyDiagnostico && todosLosDatosDeCatalogos.tareasDiagnostico) {
                todosLosDatosDeCatalogos.tareasDiagnostico.forEach((actividad, index) => {
                    const row = tbodyDiagnostico.insertRow();
                    const realizado = (tarea.actividades_diagnostico || []).includes(actividad.id);
                    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${actividad.nombre}</td>
            <td style="text-align: center;">${realizado ? 'X' : ''}</td>
            <td></td> 
        `;
                });
            }
        }

        // --- PÁGINA 1: INFO GENERAL Y MANTENIMIENTO ---
        document.getElementById('info-cliente').textContent = tarea.cliente_nombre || 'N/A';
        document.getElementById('info-fecha').textContent = tarea.fecha_completado || 'N/A';
        document.getElementById('info-proyecto').textContent = (todosLosDatosDeCatalogos.clientes[0].proyectos || []).find(p => p.id == tarea.proyecto_id)?.nombre || 'N/A';
        document.getElementById('info-provincia').textContent = (todosLosDatosDeCatalogos.provincias || []).find(p => p.id == tarea.provincia_id)?.nombre || 'N/A';
        const ciudadData = (todosLosDatosDeCatalogos.ubicacion || []).flatMap(u => u.ciudades).find(c => c.id == tarea.ciudad_id) || {};
        document.getElementById('info-ciudad').textContent = ciudadData.nombre || 'N/A';
        document.getElementById('info-unidad-negocio').textContent = (todosLosDatosDeCatalogos.unidadesNegocio || []).find(u => u.id == tarea.unidad_negocio_id)?.nombre || 'N/A';
        document.getElementById('info-agencia').textContent = tarea.agencia_nombre || 'N/A';

        const equipo = equiposAplanados.find(e => e.id === tarea.equipo_id);
        document.getElementById('info-tipo-equipo').textContent = equipo?.nombre || 'N/A';
        document.getElementById('info-modelo-equipo').textContent = equipo?.modelo || 'N/A';
        document.getElementById('info-serie-equipo').textContent = tarea.equipo_id || 'N/A';

        document.getElementById('obs-preventivo').value = tarea.observaciones_preventivo;
        document.getElementById('obs-correctivo').value = tarea.observaciones_correctivo;

        // --- PÁGINA 2: FOTOS (Preventivo O Correctivo) ---
        const galeriaPreventivo = document.getElementById('fotos-preventivo');
        const seccionPreventivo = document.getElementById('seccion-fotos-preventivo');
        galeriaPreventivo.innerHTML = '';
        if (tarea.fotos_preventivo && tarea.fotos_preventivo.length > 0) {
            tarea.fotos_preventivo.forEach(url => {
                galeriaPreventivo.innerHTML += `<div class="foto-item"><img src="${url}" alt="Foto Preventivo"></div>`;
            });
            seccionPreventivo.style.display = 'block';
        } else {
            seccionPreventivo.style.display = 'none';
        }

        const galeriaCorrectivo = document.getElementById('fotos-correctivo');
        const seccionCorrectivo = document.getElementById('seccion-fotos-correctivo');
        galeriaCorrectivo.innerHTML = '';
        if (tarea.fotos_correctivo && tarea.fotos_correctivo.length > 0) {
            tarea.fotos_correctivo.forEach(url => {
                galeriaCorrectivo.innerHTML += `<div class="foto-item"><img src="${url}" alt="Foto Correctivo"></div>`;
            });
            seccionCorrectivo.style.display = 'block';
        } else {
            seccionCorrectivo.style.display = 'none';
        }

        // --- PÁGINA 3: CAPTURAS Y FIRMAS ---
        const galeriaCapturas = document.getElementById('fotos-capturas');
        galeriaCapturas.innerHTML = '';
        if (tarea.fotos_capturas && tarea.fotos_capturas.length > 0) {
            tarea.fotos_capturas.forEach(url => {
                galeriaCapturas.innerHTML += `<div class="foto-item"><img src="${url}" alt="Foto Captura"></div>`;
            });
        } else {
            galeriaCapturas.innerHTML = '<p class="no-fotos">No hay capturas.</p>';
        }

        document.getElementById('firma-nombre-tecnico').textContent = tarea.tecnico_nombre || 'N/A';
        document.getElementById('firma-nombre-cliente').textContent = '(Pendiente de firma)';
        document.getElementById('firma-tecnico').innerHTML = `<i>(Firma ${tarea.tecnico_nombre})</i>`;
        document.getElementById('firma-cliente').innerHTML = `<i>(Firma Cliente)</i>`;
    }


    async function exportarFichaComoPDF() {
        const { jsPDF } = window.jspdf;

        const paginas = document.querySelectorAll('.pdf-page');
        const serialNumber = document.getElementById('info-serie-equipo')?.textContent || 'SIN-SERIE';
        const fileName = `Ficha_Mantenimiento_${serialNumber}.pdf`;

        alert('Generando PDF multi-página... Esto puede tardar unos segundos.');
        if (btnExportarPDF) {
            btnExportarPDF.disabled = true;
            btnExportarPDF.textContent = 'Generando...';
        }

        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < paginas.length; i++) {
                const paginaHtml = paginas[i];

                const canvas = await html2canvas(paginaHtml, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });

                const imgData = canvas.toDataURL('image/png');
                const ratio = canvas.height / canvas.width;

                let imgHeight = pdfWidth * ratio;
                let imgWidth = pdfWidth;

                if (imgHeight > pdfHeight) {
                    imgHeight = pdfHeight;
                    imgWidth = imgHeight / ratio;
                }

                if (i > 0) {
                    pdf.addPage();
                }

                const x = (pdfWidth - imgWidth) / 2;
                const y = 0;

                pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            }

            pdf.save(fileName);

        } catch (error) {
            console.error("Error al exportar a PDF multi-página:", error);
            alert("Ocurrió un error al generar el PDF.");
        } finally {
            if (btnExportarPDF) {
                btnExportarPDF.disabled = false;
                btnExportarPDF.textContent = 'Exportar a PDF';
            }
        }
    }


    function resetFormMasivo() {
        if (!formMasivo) return; // Protección
        formMasivo.reset();
        const tecnicos = (todosLosDatosDeCatalogos.usuarios || []).filter(u => u.rolId === 1);

        popularSelect(selectsMasivo.cliente, todosLosDatosDeCatalogos.clientes || [], { placeholder: 'Seleccione un cliente', textKey: 'nombreCompleto' });
        popularSelect(selectsMasivo.tecnico, tecnicos, { placeholder: 'Seleccione un técnico' });
        popularSelect(selectsMasivo.unidadNegocio, todosLosDatosDeCatalogos.unidadesNegocio || [], { placeholder: 'Seleccione para lote...' });

        resetSelect(selectsMasivo.proyecto, 'Seleccione un cliente...');
        if (selectsMasivo.submitButton) {
            selectsMasivo.submitButton.disabled = true;
            selectsMasivo.submitButton.textContent = 'Crear Tareas';
        }
        if (selectsMasivo.counter) selectsMasivo.counter.textContent = '';
        equiposFiltradosMasivo = [];
    }

    function resetFormManual() {
        if (!formManual) return; // Protección
        formManual.reset();
        modoFormulario = 'crear';
        idTareaEditando = null;

        const tecnicos = (todosLosDatosDeCatalogos.usuarios || []).filter(u => u.rolId === 1);

        popularSelect(selectsManual.cliente, todosLosDatosDeCatalogos.clientes || [], { placeholder: 'Seleccione un cliente', textKey: 'nombreCompleto' });
        popularSelect(selectsManual.provincia, todosLosDatosDeCatalogos.provincias || [], { placeholder: 'Seleccione una provincia' });
        popularSelect(selectsManual.tecnico, tecnicos, { placeholder: 'Seleccione un técnico' });

        resetSelect(selectsManual.proyecto, 'Seleccione un cliente...');
        resetSelect(selectsManual.ciudad, 'Seleccione una provincia...');
        resetSelect(selectsManual.agencia, 'Seleccione una ciudad...');
        resetSelect(selectsManual.equipo, 'Seleccione una agencia...');

        if (selectsManual.unidadNegocioInfo) selectsManual.unidadNegocioInfo.value = '';
        if (equipoInfo.nombre) equipoInfo.nombre.value = '';
        if (equipoInfo.caracteristicas) equipoInfo.caracteristicas.value = '';

        if (selectsManual.formTitle) selectsManual.formTitle.textContent = 'Información General (Creación Manual)';
        if (selectsManual.submitButton) {
            selectsManual.submitButton.textContent = 'Crear Tarea';
            selectsManual.submitButton.disabled = true;
        }
        if (selectsManual.cancelButton) selectsManual.cancelButton.style.display = 'none';
    }

    async function prepararFormularioParaEditar(tarea) {
        const delay = (ms) => new Promise(res => setTimeout(res, ms)); // Delay local

        resetFormManual();
        cambiarVista('crear-editar');

        selectsManual.formTitle.textContent = `Editando Tarea: ${tarea.equipo_nombre || tarea.id}`;
        selectsManual.submitButton.textContent = 'Guardar Cambios';
        selectsManual.cancelButton.style.display = 'inline-block';
        modoFormulario = 'editar';
        idTareaEditando = tarea.id;

        // Carga en cascada
        selectsManual.cliente.value = tarea.cliente_id;
        if (selectsManual.cliente) await selectsManual.cliente.dispatchEvent(new Event('change'));
        await delay(50);
        selectsManual.proyecto.value = tarea.proyecto_id;

        selectsManual.provincia.value = tarea.provincia_id;
        if (selectsManual.provincia) await selectsManual.provincia.dispatchEvent(new Event('change'));
        await delay(50);
        selectsManual.ciudad.value = tarea.ciudad_id;
        if (selectsManual.ciudad) await selectsManual.ciudad.dispatchEvent(new Event('change'));
        await delay(50);
        selectsManual.agencia.value = tarea.agencia_id;
        if (selectsManual.agencia) await selectsManual.agencia.dispatchEvent(new Event('change'));
        await delay(50);
        selectsManual.equipo.value = tarea.equipo_id;
        if (selectsManual.equipo) selectsManual.equipo.dispatchEvent(new Event('change'));

        selectsManual.tecnico.value = tarea.tecnico_id;
    }

    async function inicializarAplicacion() {
        try {
            todosLosDatosDeCatalogos = await getAllCatalogs();

            equiposAplanados = [];
            if (todosLosDatosDeCatalogos.tiposEquipos) {
                for (const tipoEquipo of todosLosDatosDeCatalogos.tiposEquipos) {
                    for (const equipo of tipoEquipo.equipos) {
                        equiposAplanados.push({
                            ...equipo,
                            cliente_id: tipoEquipo.clienteId,
                            proyecto_id: tipoEquipo.proyectoId,
                            provincia_id: tipoEquipo.provinciaId,
                            ciudad_id: tipoEquipo.ciudadId,
                            agencia_id: tipoEquipo.agenciaId,
                            unidad_negocio_id: tipoEquipo.unidadNegocioId
                        });
                    }
                }
            }

            resetFormMasivo();
            resetFormManual();

            cambiarVista('gestionar');
            await cargarYMostrarTareas(); // Carga inicial

        } catch (error) {
            console.error('Error fatal inicializando catálogos:', error);
            alert('No se pudieron cargar los datos iniciales. Por favor, recargue la página.');
        }
    }


    // --- 4. EVENT LISTENERS ---

    // Aplicamos la visibilidad (¡ahora es seguro!)
    aplicarVisibilidadPorRol();

    // --- Pestañas ---
    if (tabCreacionMasiva) tabCreacionMasiva.addEventListener('click', () => {
        resetFormMasivo();
        cambiarVista('creacion-masiva');
    });
    if (tabCrearEditar) tabCrearEditar.addEventListener('click', () => {
        resetFormManual();
        cambiarVista('crear-editar');
    });
    if (tabGestionar) tabGestionar.addEventListener('click', () => {
        cambiarVista('gestionar');
        cargarYMostrarTareas(); // Recargamos al hacer clic
    });
    if (tabInformes) tabInformes.addEventListener('click', () => cambiarVista('informes'));
    if (tabIngresoBbdd) tabIngresoBbdd.addEventListener('click', () => cambiarVista('ingreso-bbdd'));
    if (tabEditarBbdd) tabEditarBbdd.addEventListener('click', () => cambiarVista('editar-bbdd'));

    // --- Formulario Masivo ---
    if (selectsMasivo.cliente) selectsMasivo.cliente.addEventListener('change', (e) => {
        const clienteId = e.target.value;
        const cliente = (todosLosDatosDeCatalogos.clientes || []).find(c => c.id == clienteId);
        resetSelect(selectsMasivo.proyecto, 'Seleccione un cliente...');
        if (cliente && cliente.proyectos) {
            popularSelect(selectsMasivo.proyecto, cliente.proyectos, { placeholder: 'Seleccione un proyecto' });
        }
    });

    if (selectsMasivo.unidadNegocio) selectsMasivo.unidadNegocio.addEventListener('change', (e) => {
        const unidadId = parseInt(e.target.value);
        if (unidadId) {
            equiposFiltradosMasivo = equiposAplanados.filter(eq => eq.unidad_negocio_id === unidadId);
            selectsMasivo.counter.textContent = `Se crearán ${equiposFiltradosMasivo.length} tareas para esta unidad.`;
            selectsMasivo.submitButton.disabled = equiposFiltradosMasivo.length === 0;
            selectsMasivo.submitButton.textContent = `Crear ${equiposFiltradosMasivo.length} Tareas`;
        } else {
            equiposFiltradosMasivo = [];
            selectsMasivo.counter.textContent = '';
            selectsMasivo.submitButton.disabled = true;
            selectsMasivo.submitButton.textContent = 'Crear Tareas';
        }
    });

    if (formMasivo) formMasivo.addEventListener('submit', async (e) => {
        e.preventDefault();
        selectsMasivo.submitButton.disabled = true;
        selectsMasivo.submitButton.textContent = `Creando ${equiposFiltradosMasivo.length} tareas...`;

        const tecnicoId = selectsMasivo.tecnico.value;
        const tecnicoNombre = selectsMasivo.tecnico.options[selectsMasivo.tecnico.selectedIndex].text.trim();
        const promesasDeCreacion = [];

        for (const equipo of equiposFiltradosMasivo) {
            const cliente = (todosLosDatosDeCatalogos.clientes || []).find(c => c.id == equipo.cliente_id) || {};
            // Busca la agencia correcta usando la ubicación específica del equipo
            let agenciaNombreCorrecto = 'N/A'; // Valor por defecto
            const provinciaData = (todosLosDatosDeCatalogos.ubicacion || []).find(u => u.id == equipo.provincia_id);
            const ciudadData = provinciaData?.ciudades.find(c => c.id == equipo.ciudad_id);
            const agenciaData = ciudadData?.agencia.find(a => a.id == equipo.agencia_id);
            if (agenciaData) {
                agenciaNombreCorrecto = agenciaData.nombre;
            }

            const taskData = {
                cliente_id: equipo.cliente_id,
                proyecto_id: equipo.proyecto_id,
                provincia_id: equipo.provincia_id,
                ciudad_id: equipo.ciudad_id,
                unidad_negocio_id: equipo.unidad_negocio_id,
                agencia_id: equipo.agencia_id,
                equipo_id: equipo.id,
                tecnico_id: tecnicoId,
                cliente_nombre: cliente.nombreCompleto,
                equipo_nombre: equipo.nombre,
                agencia_nombre: agenciaNombreCorrecto,
                tecnico_nombre: tecnicoNombre,
                estado: 'pendiente'
            };
            promesasDeCreacion.push(createTask(taskData));
        }

        try {
            await Promise.all(promesasDeCreacion);
            alert(`¡Éxito! Se crearon ${equiposFiltradosMasivo.length} tareas.`);
            resetFormMasivo();
            cambiarVista('gestionar');
            await cargarYMostrarTareas();
        } catch (error) {
            alert('Error al crear tareas en lote.');
            selectsMasivo.submitButton.disabled = false;
            selectsMasivo.submitButton.textContent = `Crear ${equiposFiltradosMasivo.length} Tareas`;
        }
    });

    // --- Formulario Manual ---
    if (selectsManual.cliente) selectsManual.cliente.addEventListener('change', (e) => {
        const clienteId = e.target.value;
        const cliente = (todosLosDatosDeCatalogos.clientes || []).find(c => c.id == clienteId);
        resetSelect(selectsManual.proyecto, 'Seleccione un cliente...');
        if (cliente && cliente.proyectos) {
            popularSelect(selectsManual.proyecto, cliente.proyectos, { placeholder: 'Seleccione un proyecto' });
        }
    });

    if (selectsManual.provincia) selectsManual.provincia.addEventListener('change', (e) => {
        const provinciaId = e.target.value;
        const ciudadesDeProvincia = (todosLosDatosDeCatalogos.ubicacion || [])
            .find(u => u.id == provinciaId)?.ciudades || [];
        resetSelect(selectsManual.ciudad, 'Seleccione una provincia...');
        resetSelect(selectsManual.agencia, 'Seleccione una ciudad...');
        resetSelect(selectsManual.equipo, 'Seleccione una agencia...');
        if (provinciaId) {
            popularSelect(selectsManual.ciudad, ciudadesDeProvincia, { placeholder: 'Seleccione una ciudad' });
        }
    });

    if (selectsManual.ciudad) selectsManual.ciudad.addEventListener('change', (e) => {
        const ciudadId = e.target.value;
        const provinciaId = selectsManual.provincia.value;
        const agenciasDeCiudad = (todosLosDatosDeCatalogos.ubicacion || [])
            .find(u => u.id == provinciaId)?.ciudades
            .find(c => c.id == ciudadId)?.agencia || [];
        resetSelect(selectsManual.agencia, 'Seleccione una ciudad...');
        resetSelect(selectsManual.equipo, 'Seleccione una agencia...');
        if (ciudadId) {
            popularSelect(selectsManual.agencia, agenciasDeCiudad, { placeholder: 'Seleccione una agencia' });
        }
    });

    if (selectsManual.agencia) selectsManual.agencia.addEventListener('change', (e) => {
        const agenciaId = e.target.value;
        const ciudadId = selectsManual.ciudad.value;
        const provinciaId = selectsManual.provincia.value;
        let agenciaSeleccionada = null;
        let equiposDeAgencia = [];

        if (agenciaId && ciudadId && provinciaId) {
            const provinciaData = (todosLosDatosDeCatalogos.ubicacion || []).find(u => u.id == provinciaId);
            const ciudadData = provinciaData?.ciudades.find(c => c.id == ciudadId);
            agenciaSeleccionada = ciudadData?.agencia.find(a => a.id == agenciaId);
        }

        if (agenciaSeleccionada) {
            const unidad = (todosLosDatosDeCatalogos.unidadesNegocio || []).find(u => u.id === agenciaSeleccionada.unidadNegocioId);
            selectsManual.unidadNegocioInfo.value = unidad ? unidad.nombre : 'N/A';
        } else {
            selectsManual.unidadNegocioInfo.value = '';
        }

        if (agenciaId) {
            equiposDeAgencia = equiposAplanados.filter(eq =>
                eq.agencia_id == agenciaId &&
                eq.ciudad_id == ciudadId &&
                eq.provincia_id == provinciaId
            );
        }

        resetSelect(selectsManual.equipo, 'Seleccione una agencia...');
        if (agenciaId) {
            popularSelect(selectsManual.equipo, equiposDeAgencia, { placeholder: 'Seleccione un Nº de Serie', textKey: 'id' });
        }
    });

    if (selectsManual.equipo) selectsManual.equipo.addEventListener('change', (e) => {
        const equipoId = e.target.value;
        equipoInfo.nombre.value = '';
        equipoInfo.caracteristicas.value = '';
        selectsManual.submitButton.disabled = true;
        if (equipoId) {
            const equipoSeleccionado = equiposAplanados.find(eq => eq.id === equipoId);
            if (equipoSeleccionado) {
                equipoInfo.nombre.value = equipoSeleccionado.nombre;
                equipoInfo.caracteristicas.value = `${equipoSeleccionado.modelo} - ${equipoSeleccionado.caracteristicas}`;
                selectsManual.submitButton.disabled = false;
            }
        }
    });

    if (formManual) formManual.addEventListener('submit', async (e) => {
        e.preventDefault();
        selectsManual.submitButton.disabled = true;
        selectsManual.submitButton.textContent = modoFormulario === 'crear' ? 'Creando...' : 'Guardando...';

        const agenciaSeleccionada = (todosLosDatosDeCatalogos.ubicacion || [])
            .flatMap(u => u.ciudades)
            .flatMap(c => c.agencia)
            .find(a => a.id == selectsManual.agencia.value);

        const taskData = {
            cliente_id: selectsManual.cliente.value,
            cliente_nombre: selectsManual.cliente.options[selectsManual.cliente.selectedIndex].text,
            proyecto_id: selectsManual.proyecto.value,
            provincia_id: selectsManual.provincia.value,
            ciudad_id: selectsManual.ciudad.value,
            unidad_negocio_id: agenciaSeleccionada ? agenciaSeleccionada.unidadNegocioId : null,
            agencia_id: selectsManual.agencia.value,
            agencia_nombre: selectsManual.agencia.options[selectsManual.agencia.selectedIndex].text,
            equipo_id: selectsManual.equipo.value,
            equipo_nombre: equipoInfo.nombre.value,
            tecnico_id: selectsManual.tecnico.value,
            tecnico_nombre: selectsManual.tecnico.options[selectsManual.tecnico.selectedIndex].text.trim(),
            estado: 'pendiente'
        };

        try {
            if (modoFormulario === 'crear') {
                await createTask(taskData);
                alert('¡Tarea creada con éxito!');
            } else {
                await updateTask(idTareaEditando, taskData);
                alert('¡Tarea actualizada con éxito!');
            }
            resetFormManual();
            cambiarVista('gestionar');
            await cargarYMostrarTareas();
        } catch (error) {
            alert(`Hubo un error al ${modoFormulario === 'crear' ? 'crear' : 'actualizar'} la tarea.`);
            selectsManual.submitButton.disabled = false;
            if (modoFormulario === 'editar') {
                selectsManual.submitButton.textContent = 'Guardar Cambios';
            } else {
                selectsManual.submitButton.textContent = 'Crear Tarea';
            }
        }
    });

    if (selectsManual.cancelButton) selectsManual.cancelButton.addEventListener('click', resetFormManual);

    // --- Botones Globales y de Tarjeta ---

    if (taskListContainer) taskListContainer.addEventListener('click', async (e) => {

        // Primero, manejamos los botones de editar y borrar
        const editButton = e.target.closest('.edit');
        if (editButton) {
            try {
                const tareaData = JSON.parse(editButton.dataset.task);
                await prepararFormularioParaEditar(tareaData);
            } catch (error) {
                console.error('Error al preparar el formulario para editar:', error);
                alert('Ocurrió un error al intentar editar la tarea.');
            }
            return; // Detiene si fue el botón editar
        }

        const deleteButton = e.target.closest('.delete');
        if (deleteButton) {
            const taskId = deleteButton.dataset.taskId;
            if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
                try {
                    await deleteTask(taskId);
                    alert('Tarea eliminada con éxito');
                    await cargarYMostrarTareas();
                } catch (error) {
                    console.error('Error al eliminar tarea:', error);
                    alert('Ocurrió un error al intentar eliminar la tarea.');
                }
            }
            return; // Detiene si fue el botón borrar
        }

        // Si no fue un botón, entonces fue un clic en la tarjeta para seleccionar/deseleccionar
        const card = e.target.closest('.task-card');
        if (card) {
            // Necesitamos el ID de la tarea. Lo podemos obtener del botón de borrar que está dentro
            const taskId = card.querySelector('.delete')?.dataset.taskId;
            if (!taskId) return; // Si no hay botón de borrar, no podemos obtener el ID

            // Toggle (alternar) la selección
            if (tareasSeleccionadasParaBorrar.has(taskId)) {
                tareasSeleccionadasParaBorrar.delete(taskId);
                card.classList.remove('selected');
            } else {
                tareasSeleccionadasParaBorrar.add(taskId);
                card.classList.add('selected');
            }
            actualizarBotonBorrado(); // Actualiza el contador del botón
        }
    });

    if (logoutButton) logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    });

    if (btnVolverLista) btnVolverLista.addEventListener('click', () => {
        if (informesHeader) informesHeader.classList.remove('hidden');
        if (informesListContainer) informesListContainer.classList.remove('hidden');
        if (fichaContainer) fichaContainer.classList.add('hidden');
    });

    if (informesListContainer) informesListContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.task-card');
        if (card && card.dataset.taskData) {
            const tarea = JSON.parse(card.dataset.taskData);
            mostrarFichaDeMantenimiento(tarea);
        }
    });

    if (btnExportarPDF) btnExportarPDF.addEventListener('click', exportarFichaComoPDF);

    if (btnDeleteSelected) {
        btnDeleteSelected.addEventListener('click', async () => {
            const count = tareasSeleccionadasParaBorrar.size;
            if (count === 0) return;

            if (!confirm(`¿Está seguro de que desea eliminar ${count} tarea(s)?`)) {
                return;
            }

            btnDeleteSelected.disabled = true;
            btnDeleteSelected.textContent = 'Eliminando...';

            try {
                const promesasDeBorrado = [];
                tareasSeleccionadasParaBorrar.forEach(taskId => {
                    promesasDeBorrado.push(deleteTask(taskId));
                });

                await Promise.all(promesasDeBorrado);
                alert(`Se eliminaron ${count} tareas con éxito.`);
                await cargarYMostrarTareas();

            } catch (error) {
                console.error('Error al eliminar tareas masivamente:', error);
                alert('Ocurrió un error al eliminar las tareas.');
                actualizarBotonBorrado();
            }
        });
    }

    // --- 5. INICIALIZACIÓN ---
    inicializarAplicacion();
});