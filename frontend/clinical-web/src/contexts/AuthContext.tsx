'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { clearAuthSessionCookies, readAuthSessionCookies, setAuthSessionCookies } from '@/services/authSession';
import { authApi } from '@/services/authApi';
import { AuthSession, LoginInput } from '@/types/auth';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (credentials: LoginInput) => Promise<AuthSession>;
  logout: () => void;
  setSession: (session: AuthSession) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSessionState] = useState<AuthSession | null>(() => readAuthSessionCookies());

  const setSession = (nextSession: AuthSession) => {
    setAuthSessionCookies(nextSession, true);
    setSessionState(nextSession);
  };

  const login = async (credentials: LoginInput) => {
    const authenticatedSession = await authApi.login(credentials);
    setAuthSessionCookies(authenticatedSession, credentials.remember);
    setSessionState(authenticatedSession);
    return authenticatedSession;
  };

  const logout = () => {
    clearAuthSessionCookies();
    setSessionState(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      isBootstrapping: false,
      login,
      logout,
      setSession,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};
