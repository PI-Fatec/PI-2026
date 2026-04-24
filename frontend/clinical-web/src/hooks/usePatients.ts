'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { patientApi } from '@/services/patientApi';
import { NewPatientInput, Patient, PatientFilters, UpdatePatientInput } from '@/types/patient';
import { useAuth } from '@/hooks/useAuth';

const defaultFilters: PatientFilters = {
  busca: '',
  risco: 'TODOS',
  status: 'TODOS',
  dataInicio: '',
  dataFim: '',
};

export const usePatients = () => {
  const { session } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(
    async (currentFilters: PatientFilters) => {
      if (!session?.token) {
        setPatients([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const list = await patientApi.list(currentFilters, session.token);
        setPatients(list);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao carregar pacientes.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [session?.token],
  );

  useEffect(() => {
    void loadPatients(filters);
  }, [filters, loadPatients]);

  const createPatient = useCallback(
    async (payload: NewPatientInput) => {
      if (!session?.token) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      setIsSaving(true);
      setError(null);

      try {
        const createdPatient = await patientApi.invite(payload, session.token);
        await loadPatients(filters);
        return createdPatient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel convidar paciente.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadPatients, session?.token],
  );

  const updatePatient = useCallback(
    async (id: string, payload: UpdatePatientInput) => {
      if (!session?.token) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      setIsSaving(true);
      setError(null);

      try {
        const updatedPatient = await patientApi.update(id, payload, session.token);
        await loadPatients(filters);
        return updatedPatient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel atualizar paciente.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadPatients, session?.token],
  );

  const removePatient = useCallback(
    async (id: string) => {
      if (!session?.token) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      setIsSaving(true);
      setError(null);

      try {
        await patientApi.remove(id, session.token);
        await loadPatients(filters);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel excluir paciente.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadPatients, session?.token],
  );

  const getPatientById = useCallback(
    async (id: string) => {
      if (!session?.token) {
        return null;
      }

      try {
        return await patientApi.getById(id, session.token);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel carregar detalhes do paciente.';
        setError(message);
        return null;
      }
    },
    [session?.token],
  );

  const mergeFilters = useCallback((partial: Partial<PatientFilters>) => {
    setFilters((current) => ({ ...current, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const summary = useMemo(() => {
    const total = patients.length;
    const ativos = patients.filter((patient) => patient.status === 'ATIVO').length;
    const altoRisco = patients.filter((patient) => patient.risco === 'ALTO').length;

    return { total, ativos, altoRisco };
  }, [patients]);

  return {
    patients,
    filters,
    summary,
    isLoading,
    isSaving,
    error,
    createPatient,
    updatePatient,
    removePatient,
    getPatientById,
    setFilters: mergeFilters,
    resetFilters,
    reload: () => loadPatients(filters),
  };
};
