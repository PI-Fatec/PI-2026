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

const ANALYSIS_MAX_POLLS = 15;
const ANALYSIS_POLL_INTERVAL_MS = 1200;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const usePatients = () => {
  const { session } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisPatientId, setAnalysisPatientId] = useState<string | null>(null);
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

  const requestRiskAnalysis = useCallback(
    async (patientProfileId: string) => {
      if (!session?.token) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      setAnalysisPatientId(patientProfileId);
      setError(null);

      try {
        const createdRequest = await patientApi.requestRiskAnalysis(patientProfileId, session.token);
        let lastStatus = createdRequest.status;

        for (
          let attempt = 0;
          attempt < ANALYSIS_MAX_POLLS && ['PENDING', 'PROCESSING'].includes(lastStatus);
          attempt += 1
        ) {
          await wait(ANALYSIS_POLL_INTERVAL_MS);
          const current = await patientApi.getRiskAnalysisStatus(createdRequest.requestId, session.token);
          lastStatus = current.status;

          if (current.status === 'FAILED') {
            throw new Error(current.error || 'A IA nao conseguiu concluir a analise.');
          }
        }

        await loadPatients(filters);
        return { ...createdRequest, status: lastStatus };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel solicitar analise de risco.';
        setError(message);
        throw err;
      } finally {
        setAnalysisPatientId(null);
      }
    },
    [filters, loadPatients, session?.token],
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
    analysisPatientId,
    error,
    createPatient,
    updatePatient,
    removePatient,
    getPatientById,
    requestRiskAnalysis,
    setFilters: mergeFilters,
    resetFilters,
    reload: () => loadPatients(filters),
  };
};
