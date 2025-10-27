
import { login } from './api-service.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const loginButton = document.getElementById('login-button');

// Si el usuario ya está logueado (revisamos 'accessToken'), lo mandamos a la app
if (localStorage.getItem('accessToken')) {
    window.location.href = 'index.html';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = '';
    loginButton.textContent = 'Ingresando...';
    loginButton.disabled = true;

    try {
        // 1. Llamamos a login. api-service.js se encarga de guardar
        //    'accessToken' y 'userRole' en localStorage.
        await login(emailInput.value, passwordInput.value);

        // 2. Solo redirigimos
        window.location.href = 'index.html';

    } catch (error) {
        errorMessage.textContent = 'Error: Usuario o contraseña incorrectos.';
        loginButton.textContent = 'Ingresar';
        loginButton.disabled = false;
    }
});