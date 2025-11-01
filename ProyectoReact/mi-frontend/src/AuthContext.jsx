// Ruta: src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // <-- Importar jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  // --- Nuevo estado para guardar info del usuario ---
  const [user, setUser] = useState(null);
  // --------------------------------------------------

  // Efecto para decodificar el token cuando cambie
  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        console.log("[AuthContext] Token decodificado:", decodedUser);
        // Guarda la info relevante (ajusta según tu token real)
        setUser({
          id: decodedUser.id,
          username: decodedUser.username, // O el claim que uses para el nombre/email
          roles: Array.isArray(decodedUser.roles)
                   ? decodedUser.roles
                   : (decodedUser.roles ? decodedUser.roles.split(',').map(r => r.trim()) : [])
        });
        localStorage.setItem('jwtToken', token);
      } catch (error) {
        console.error("[AuthContext] Token inválido, limpiando:", error);
        localStorage.removeItem('jwtToken');
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null); // No hay token, no hay usuario
      localStorage.removeItem('jwtToken');
    }
  }, [token]); // Se ejecuta cuando 'token' cambia

  // Funciones login/logout (solo actualizan el token)
  const login = useCallback((newToken) => {
    if (newToken) setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null); // Limpia user al hacer logout
  }, []);

  // --- Exponer 'user' en el contexto ---
  const value = { token, user, login, logout };
  // ------------------------------------

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};