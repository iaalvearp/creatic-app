// Importamos nuestra base de datos simulada
import database from '../db/database.json';

// Esta es la variable que luego cambiarás por la URL real de tu API
const RUTA_DATOS = database;

export const authService = {
  login: (email: string, password: string) => {
    // Buscamos un usuario que coincida con el email y la contraseña
    const usuario = RUTA_DATOS.usuarios.find(
      u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );

    // Si encontramos un usuario, lo devolvemos. Si no, devolvemos null.
    // EN UN ENTORNO REAL: Aquí harías una llamada a la API con fetch() o axios()
    if (usuario) {
      // Devolvemos una copia del usuario sin la contraseña por seguridad
      const { password, ...usuarioSinPassword } = usuario;
      return usuarioSinPassword;
    }

    return null;
  },
};
