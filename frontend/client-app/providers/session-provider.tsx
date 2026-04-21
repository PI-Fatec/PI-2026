import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = '@healthtrack:token';
const ONBOARDING_KEY = '@healthtrack:onboarding-complete';

type SessionContextValue = {
  isLoading: boolean;
  hasOnboarded: boolean;
  token: string | null;
  completeOnboarding: () => Promise<void>;
  signIn: (nextToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [storedToken, onboardingDone] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);

        setToken(storedToken);
        setHasOnboarded(onboardingDone === 'true');
      } catch (error) {
        console.warn('Falha ao carregar sessao local.', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  const completeOnboarding = async () => {
    setHasOnboarded(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const signIn = async (nextToken: string) => {
    setToken(nextToken);
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
  };

  const signOut = async () => {
    setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
  };

  const value = useMemo(
    () => ({
      isLoading,
      hasOnboarded,
      token,
      completeOnboarding,
      signIn,
      signOut,
    }),
    [hasOnboarded, isLoading, token]
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
