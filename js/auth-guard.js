// Este archivo centraliza la lógica de permisos y protección de rutas.

/**
 * Obtiene el ID de rol del usuario logueado desde localStorage.
 * @returns {number} 1 (Técnico), 2 (Supervisor), 3 (Admin), o 0 (No logueado/Sin rol).
 */
function getUserRole() {
    // Leemos el 'userRole' que guardamos durante el login
    return parseInt(localStorage.getItem('userRole') || 0);
}

/**
 * @returns {boolean} True si el usuario es Administrador.
 */
export function esAdmin() {
    // 3 es el ID para Administrador según tu JSON
    return getUserRole() === 3;
}

/**
 * @returns {boolean} True si el usuario es Supervisor O Administrador.
 */
export function esSupervisor() {
    // Los Admins (3) también son Supervisores (>= 2)
    return getUserRole() >= 2;
}

/**
 * @returns {boolean} True si el usuario es al menos Técnico (está logueado).
 */
export function esTecnico() {
    return getUserRole() >= 1;
}

/**
 * Esta función debe llamarse en CADA página que requiera estar logueado.
 * Revisa si hay un token, si no, redirige a la página de login.
 */
export function protegerPagina() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.warn('Acceso denegado: No hay token. Redirigiendo al login.');
        // Ajusta la ruta si tu login.html está en otro lugar (ej. /login.html o /index.html)
        window.location.href = 'login.html';
    }
}

/**
 * Esta función aplica la visibilidad a las clases CSS
 * basadas en el rol del usuario.
 * Debe llamarse DESPUÉS de que el DOM esté cargado.
 */
export function aplicarVisibilidadPorRol() {
    // Primero, ocultamos todo por precaución
    document.querySelectorAll('.admin-only, .supervisor-only').forEach(el => {
        el.style.display = 'none';
    });

    // Luego, mostramos lo que corresponde
    if (esAdmin()) {
        // El Admin ve todo
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.supervisor-only').forEach(el => el.style.display = 'block');
    } else if (esSupervisor()) {
        // El Supervisor ve lo suyo, pero no lo de admin
        document.querySelectorAll('.supervisor-only').forEach(el => el.style.display = 'block');
    }
    // El Técnico (rol 1) no necesita hacer nada,
    // ya que .admin-only y .supervisor-only permanecen ocultos.
}