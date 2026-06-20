import { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '@/lib/apiClient';

interface AuthContextType {
  user: User | null;
  apiToken: string | null;
  authToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, authToken: string, apiToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readFromStorage<T>(key: string, parse = false): T | null {
  try {
    const val = localStorage.getItem(key);
    if (!val) return null;
    return parse ? JSON.parse(val) : (val as unknown as T);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => readFromStorage<User>('user', true));
  const [authToken, setAuthToken] = useState<string | null>(() => readFromStorage<string>('authToken'));
  const [apiToken, setApiToken] = useState<string | null>(() => readFromStorage<string>('apiToken'));

  const login = (userData: User, newAuthToken: string, newApiToken: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', newAuthToken);
    localStorage.setItem('apiToken', newApiToken);
    setUser(userData);
    setAuthToken(newAuthToken);
    setApiToken(newApiToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('apiToken');
    setUser(null);
    setAuthToken(null);
    setApiToken(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        apiToken,
        authToken,
        isAuthenticated: !!user && !!authToken,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
