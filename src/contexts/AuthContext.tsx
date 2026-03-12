import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  adminEmail: null,
  login: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('prefetch_admin') === 'true');
  const [adminEmail, setAdminEmail] = useState<string | null>(() => localStorage.getItem('prefetch_admin_email'));

  const login = (email: string, password: string): boolean => {
    if (email === 'admin@prefetchsystems.co.ke' && password === 'admin123') {
      setIsAdmin(true);
      setAdminEmail(email);
      localStorage.setItem('prefetch_admin', 'true');
      localStorage.setItem('prefetch_admin_email', email);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminEmail(null);
    localStorage.removeItem('prefetch_admin');
    localStorage.removeItem('prefetch_admin_email');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, adminEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
