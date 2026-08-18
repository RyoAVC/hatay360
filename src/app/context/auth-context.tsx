import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "../lib/api";

type AuthContextType = {
  isLoggedIn: boolean;
  isConfigured: boolean;
  isChecking: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<{ authenticated: boolean; configured: boolean; username: string | null }>("/api/auth/session")
      .then((session) => {
        if (!active) return;
        setIsLoggedIn(session.authenticated);
        setIsConfigured(session.configured);
        setUsername(session.username);
      })
      .catch(() => {
        if (!active) return;
        setIsLoggedIn(false);
        setIsConfigured(false);
        setUsername(null);
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (nextUsername: string, password: string) => {
    try {
      const result = await apiRequest<{ ok: boolean; username: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: nextUsername, password }),
      });
      setIsLoggedIn(true);
      setUsername(result.username);
      return true;
    } catch {
      setIsLoggedIn(false);
      setUsername(null);
      return false;
    }
  };

  const logout = async () => {
    await apiRequest<{ ok: boolean }>("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setIsLoggedIn(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isConfigured, isChecking, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth AuthProvider içinde kullanılmalıdır.");
  }
  return context;
}
