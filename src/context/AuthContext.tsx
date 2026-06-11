'use client';

/**
 * AuthContext — estado global de autenticación.
 *
 * Estrategia: el objeto `user` se persiste en localStorage bajo la clave
 * `fercadi_user`. Al montar el provider se rehidrata ese valor para que
 * las páginas del cliente ya tengan al usuario disponible sin un fetch.
 *
 * Limitación conocida: no existe firma criptográfica ni token de sesión.
 * Un atacante que acceda al dispositivo puede forjar `fercadi_user` con
 * otro `id`. La validación real de autorización ocurre siempre en el
 * servidor — ver `lib/admin.ts > requerirAdmin()`.
 */

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  nombre: string;
  correo: string;
  /** 'admin' desbloquea el menú y las rutas /admin. La fuente de verdad es la BD. */
  rol?: 'admin' | 'usuario';
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  /** Guarda el usuario en estado y localStorage tras un login exitoso. */
  login: (userData: User) => void;
  /** Limpia el estado y borra el localStorage. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Rehidratar desde localStorage en el primer render del cliente.
  useEffect(() => {
    const stored = localStorage.getItem('fercadi_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fercadi_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fercadi_user');
  };

  const isAdmin = user?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
