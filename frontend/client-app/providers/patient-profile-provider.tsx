import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { patientProfileApi } from '@/lib/patient-profile-api';
import { useSession } from '@/providers/session-provider';
import { PatientAccount, UpdatePatientProfileInput } from '@/types/patient-profile';

type PatientProfileContextValue = {
  account: PatientAccount | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  reloadProfile: () => Promise<void>;
  updateProfile: (payload: UpdatePatientProfileInput) => Promise<PatientAccount>;
};

const PatientProfileContext = createContext<PatientProfileContextValue | null>(null);

export function PatientProfileProvider({ children }: PropsWithChildren) {
  const { token } = useSession();
  const [account, setAccount] = useState<PatientAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadProfile = useCallback(async () => {
    if (!token) {
      setAccount(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await patientProfileApi.getMe(token);
      setAccount(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel carregar seu perfil.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reloadProfile();
  }, [reloadProfile]);

  const updateProfile = useCallback(
    async (payload: UpdatePatientProfileInput) => {
      if (!token) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await patientProfileApi.updateMe(token, payload);
        setAccount(response.account);
        return response.account;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel atualizar seu perfil.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [token]
  );

  const value = useMemo<PatientProfileContextValue>(
    () => ({
      account,
      isLoading,
      isSaving,
      error,
      reloadProfile,
      updateProfile,
    }),
    [account, error, isLoading, isSaving, reloadProfile, updateProfile]
  );

  return <PatientProfileContext.Provider value={value}>{children}</PatientProfileContext.Provider>;
}

export function usePatientProfile() {
  const context = useContext(PatientProfileContext);

  if (!context) {
    throw new Error('usePatientProfile precisa estar dentro de PatientProfileProvider.');
  }

  return context;
}
