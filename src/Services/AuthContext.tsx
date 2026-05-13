import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { login as loginRequest } from './auth.service';
import { register as registerRequest } from './auth.service';

type AuthContextType = {
  token: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    null
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    null
  );

  const parseEmailFromToken = (token: string): string | null => {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const json = atob(padded);
      const data = JSON.parse(json) as { sub?: string };
      return data.sub ?? null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      setUserEmail(parseEmailFromToken(stored));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { token } = await loginRequest(
      email,
      password
    );

    localStorage.setItem('token', token);
    setToken(token);
    setUserEmail(parseEmailFromToken(token));
  };

  const register = async (email: string, password: string) => {
    const { token } = await registerRequest(
      email,
      password
    );

    localStorage.setItem('token', token);
    setToken(token);
    setUserEmail(parseEmailFromToken(token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserEmail(null);
  };

  const value = useMemo(
    () => ({
      token,
      userEmail,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout
    }),
    [token, userEmail]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe usarse dentro de AuthProvider'
    );
  }

  return context;
}
