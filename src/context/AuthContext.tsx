import React, { createContext, useState, useContext } from 'react';

// Define la estructura del usuario y las funciones del contexto
interface AuthContextData {
  usuario: object | null;
  iniciarSesion: (datosUsuario: object) => void;
  cerrarSesion: () => void;
}

// Crea el contexto con un valor inicial
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Crea el "Proveedor" que envolverá nuestra app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<object | null>(null);

  const iniciarSesion = (datosUsuario: object) => {
    setUsuario(datosUsuario);
  };

  const cerrarSesion = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

// Crea un "hook" personalizado para usar fácilmente el contexto en otras pantallas
export const useAuth = () => {
  return useContext(AuthContext);
};
