'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { clearAuthSessionCookies, readAuthSessionCookies, setAuthSessionCookies } from '@/services/authSession';
import { mockAuthService } from '@/services/mockAuthService';
import { AuthSession, LoginInput } from '@/types/auth';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (credentials: LoginInput) => Promise<AuthSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSessionCookies());

  const login = async (credentials: LoginInput) => {
    const authenticatedSession = await mockAuthService.login(credentials);
    setAuthSessionCookies(authenticatedSession, credentials.remember);
    setSession(authenticatedSession);
    return authenticatedSession;
  };

  const logout = () => {
    clearAuthSessionCookies();
    setSession(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      isBootstrapping: false,
      login,
      logout,
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
