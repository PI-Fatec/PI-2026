import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = '@healthtrack:token';
const ONBOARDING_KEY = '@healthtrack:onboarding-complete';
const USER_NAME_KEY = '@healthtrack:user-name';

type SessionContextValue = {
  isLoading: boolean;
  hasOnboarded: boolean;
  token: string | null;
  userName: string;
  completeOnboarding: () => Promise<void>;
  signIn: (nextToken: string, nextUserName?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [storedToken, onboardingDone, storedUserName] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(USER_NAME_KEY),
        ]);

        setToken(storedToken);
        setUserName(storedUserName ?? '');
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

  const signIn = async (nextToken: string, nextUserName?: string) => {
    const normalizedName = nextUserName?.trim() ?? userName;
    setToken(nextToken);
    setUserName(normalizedName);
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, nextToken),
      AsyncStorage.setItem(USER_NAME_KEY, normalizedName),
    ]);
  };

  const signOut = async () => {
    setToken(null);
    setUserName('');
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_NAME_KEY);
  };

  const value = useMemo(
    () => ({
      isLoading,
      hasOnboarded,
      token,
      userName,
      completeOnboarding,
      signIn,
      signOut,
    }),
    [hasOnboarded, isLoading, token, userName]
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
