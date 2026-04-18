'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { mockDoctorService } from '@/services/mockDoctorService';
import { Doctor, DoctorFilters, NewDoctorInput, UpdateDoctorInput } from '@/types/doctor';

const initialFilters: DoctorFilters = {
  busca: '',
  status: 'TODOS',
  clinica: '',
};

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState<DoctorFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = useCallback(async (currentFilters: DoctorFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const list = await mockDoctorService.list(currentFilters);
      setDoctors(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar medicos.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDoctors(filters);
  }, [filters, loadDoctors]);

  const createDoctor = useCallback(
    async (payload: NewDoctorInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const created = await mockDoctorService.create(payload);
        await loadDoctors(filters);
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel cadastrar medico.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadDoctors],
  );

  const updateDoctor = useCallback(
    async (id: string, payload: UpdateDoctorInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const updated = await mockDoctorService.update(id, payload);
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
    [filters, loadDoctors],
  );

  const removeDoctor = useCallback(
    async (id: string) => {
      setIsSaving(true);
      setError(null);

      try {
        await mockDoctorService.remove(id);
        await loadDoctors(filters);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nao foi possivel remover medico.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [filters, loadDoctors],
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
