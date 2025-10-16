import { login } from './api-service.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const loginButton = document.getElementById('login-button');

// Si el usuario ya está logueado, lo mandamos a la app principal
if (localStorage.getItem('authToken')) {
    window.location.href = 'index.html';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = '';
    loginButton.textContent = 'Ingresando...';
    loginButton.disabled = true;

    try {
        const data = await login(emailInput.value, passwordInput.value);
        // Guardamos el token de forma segura
        localStorage.setItem('authToken', data.tokens.access_token);
        // Redirigimos a la página principal
        window.location.href = 'index.html';
    } catch (error) {
        errorMessage.textContent = 'Error: Usuario o contraseña incorrectos.';
        loginButton.textContent = 'Ingresar';
        loginButton.disabled = false;
    }
});
