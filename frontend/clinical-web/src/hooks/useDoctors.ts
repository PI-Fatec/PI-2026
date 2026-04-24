'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { doctorApi } from '@/services/doctorApi';
import { Doctor, DoctorFilters, NewDoctorInput, UpdateDoctorInput } from '@/types/doctor';
import { useAuth } from '@/hooks/useAuth';

const initialFilters: DoctorFilters = {
  busca: '',
  status: 'TODOS',
  clinica: '',
};

export const useDoctors = () => {
  const { session } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState<DoctorFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = useCallback(
    async (currentFilters: DoctorFilters) => {
      if (!session?.token) {
        setDoctors([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const list = await doctorApi.list(currentFilters, session.token);
        setDoctors(list);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao carregar medicos.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [session?.token],
  );

  useEffect(() => {
    void loadDoctors(filters);
  }, [filters, loadDoctors]);

  const createDoctor = useCallback(
    async (payload: NewDoctorInput) => {
      if (!session?.token) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      setIsSaving(true);
      setError(null);

      try {
        const created = await doctorApi.invite(payload, session.token);
        await loadDoctors(filters);
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel convidar medico.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadDoctors, session?.token],
  );

  const updateDoctor = useCallback(
    async (id: string, payload: UpdateDoctorInput) => {
      if (!session?.token) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      setIsSaving(true);
      setError(null);

      try {
        const updated = await doctorApi.update(id, payload, session.token);
        await loadDoctors(filters);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel atualizar medico.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadDoctors, session?.token],
  );

  const removeDoctor = useCallback(
    async (id: string) => {
      if (!session?.token) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      setIsSaving(true);
      setError(null);

      try {
        await doctorApi.remove(id, session.token);
        await loadDoctors(filters);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel remover medico.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadDoctors, session?.token],
  );

  const mergeFilters = useCallback((partial: Partial<DoctorFilters>) => {
    setFilters((current) => ({ ...current, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const summary = useMemo(() => {
    const total = doctors.length;
    const ativos = doctors.filter((doctor) => doctor.status === 'ATIVO').length;
    const clinicas = new Set(doctors.map((doctor) => doctor.clinica)).size;

    return { total, ativos, clinicas };
  }, [doctors]);

  return {
    doctors,
    filters,
    summary,
    isLoading,
    isSaving,
    error,
    createDoctor,
    updateDoctor,
    removeDoctor,
    setFilters: mergeFilters,
    resetFilters,
    reload: () => loadDoctors(filters),
  };
};
