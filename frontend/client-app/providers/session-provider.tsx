import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { authApi, AppRole } from '@/lib/auth-api';

const TOKEN_KEY = '@healthtrack:token';
const ONBOARDING_KEY = '@healthtrack:onboarding-complete';
const USER_KEY = '@healthtrack:user';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
};

type SessionContextValue = {
  isLoading: boolean;
  hasOnboarded: boolean;
  token: string | null;
  user: SessionUser | null;
  userName: string;
  completeOnboarding: () => Promise<void>;
  signInWithCredentials: (identifier: string, password: string) => Promise<void>;
  acceptInvite: (payload: {
    token: string;
    role: 'DOCTOR' | 'PATIENT';
    email: string;
    name: string;
    password: string;
    telefone?: string;
    crm?: string;
    especialidade?: string;
    clinica?: string;
    cpf?: string;
    dataNascimento?: string;
    sexo?: 'Masculino' | 'Feminino' | 'Outro';
  }) => Promise<void>;
  validateInvite: (token: string) => Promise<{ valid: boolean; role: 'DOCTOR' | 'PATIENT'; email: string; expiresAt: string }>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [storedToken, onboardingDone, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        setToken(storedToken);
        setUser(storedUser ? (JSON.parse(storedUser) as SessionUser) : null);
        setHasOnboarded(onboardingDone === 'true');
      } catch (error) {
        console.warn('Falha ao carregar sessão local.', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadState();
  }, []);

  const completeOnboarding = async () => {
    setHasOnboarded(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const persistAuth = async (nextToken: string, nextUser: SessionUser) => {
    setToken(nextToken);
    setUser(nextUser);
    await Promise.all([AsyncStorage.setItem(TOKEN_KEY, nextToken), AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser))]);
  };

  const signInWithCredentials = async (identifier: string, password: string) => {
    const payload = await authApi.login(identifier, password);

    if (payload.user.role !== 'PATIENT') {
      throw new Error('Somente pacientes podem acessar este aplicativo.');
    }

    await persistAuth(payload.token, payload.user);
  };

  const validateInvite = async (inviteToken: string) => authApi.validateInvite(inviteToken);

  const acceptInvite = async (payload: {
    token: string;
    role: 'DOCTOR' | 'PATIENT';
    email: string;
    name: string;
    password: string;
    telefone?: string;
    crm?: string;
    especialidade?: string;
    clinica?: string;
    cpf?: string;
    dataNascimento?: string;
    sexo?: 'Masculino' | 'Feminino' | 'Outro';
  }) => {
    const response = await authApi.acceptInvite(payload);

    if (response.user.role !== 'PATIENT') {
      throw new Error('Somente convites de pacientes podem ser finalizados no aplicativo.');
    }

    await persistAuth(response.token, response.user);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  };

  const value = useMemo(
    () => ({
      isLoading,
      hasOnboarded,
      token,
      user,
      userName: user?.name ?? '',
      completeOnboarding,
      signInWithCredentials,
      acceptInvite,
      validateInvite,
      signOut,
    }),
    [hasOnboarded, isLoading, token, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession precisa estar dentro de SessionProvider.');
  }

  return context;
}
