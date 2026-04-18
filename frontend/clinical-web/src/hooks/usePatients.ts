'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { mockPatientService } from '@/services/mockPatientService';
import { NewPatientInput, Patient, PatientFilters, UpdatePatientInput } from '@/types/patient';

const defaultFilters: PatientFilters = {
  busca: '',
  risco: 'TODOS',
  status: 'TODOS',
  dataInicio: '',
  dataFim: '',
};

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async (currentFilters: PatientFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const list = await mockPatientService.list(currentFilters);
      setPatients(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar pacientes.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients(filters);
  }, [filters, loadPatients]);

  const createPatient = useCallback(
    async (payload: NewPatientInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const createdPatient = await mockPatientService.create(payload);
        await loadPatients(filters);
        return createdPatient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel cadastrar paciente.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadPatients],
  );

  const updatePatient = useCallback(
    async (id: string, payload: UpdatePatientInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const updatedPatient = await mockPatientService.update(id, payload);
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
    [filters, loadPatients],
  );

  const removePatient = useCallback(
    async (id: string) => {
      setIsSaving(true);
      setError(null);

      try {
        await mockPatientService.remove(id);
        await loadPatients(filters);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel excluir paciente.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadPatients],
  );

  const getPatientById = useCallback(async (id: string) => {
    try {
      return await mockPatientService.getById(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel carregar detalhes do paciente.';
      setError(message);
      return null;
    }
  }, []);

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
