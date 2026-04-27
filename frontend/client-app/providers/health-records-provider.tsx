import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { recordsApi } from '@/lib/records-api';
import { useSession } from '@/providers/session-provider';
import { HealthRecord, HealthRecordType, HealthRecordTypeMeta, UpsertHealthRecordInput } from '@/types/record';

export const HEALTH_RECORD_TYPE_OPTIONS: HealthRecordTypeMeta[] = [
  { value: 'glicemia', label: 'Glicemia', unit: 'mg/dL', placeholder: 'Ex: 110' },
  { value: 'pressao_arterial', label: 'Pressão arterial', unit: 'mmHg', placeholder: 'Ex: 120' },
  { value: 'alimentacao', label: 'Alimentação', unit: 'kcal', placeholder: 'Ex: 550' },
  { value: 'exame', label: 'Exame', unit: 'un', placeholder: 'Ex: 1.2' },
  { value: 'prontuario', label: 'Prontuário', unit: 'un', placeholder: 'Ex: 1' },
  { value: 'predicao_risco', label: 'Predição de risco', unit: '%', placeholder: 'Ex: 72' },
];

type HealthRecordsContextValue = {
  records: HealthRecord[];
  isLoading: boolean;
  addRecord: (input: UpsertHealthRecordInput) => Promise<void>;
  updateRecord: (id: string, input: UpsertHealthRecordInput) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordById: (id: string) => HealthRecord | undefined;
  reloadRecords: () => Promise<void>;
};

const HealthRecordsContext = createContext<HealthRecordsContextValue | null>(null);

export function HealthRecordsProvider({ children }: PropsWithChildren) {
  const { token } = useSession();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reloadRecords = async () => {
    if (!token) {
      setRecords([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await recordsApi.list(token);
      setRecords(response);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reloadRecords();
  }, [token]);

  const value = useMemo<HealthRecordsContextValue>(
    () => ({
      records: [...records].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()),
      isLoading,
      addRecord: async (input) => {
        if (!token) return;
        const created = await recordsApi.create(token, input);
        setRecords((current) => [created, ...current]);
      },
      updateRecord: async (id, input) => {
        if (!token) return;
        const updated = await recordsApi.update(token, id, input);
        setRecords((current) => current.map((record) => (record.id === id ? updated : record)));
      },
      deleteRecord: async (id) => {
        if (!token) return;
        await recordsApi.remove(token, id);
        setRecords((current) => current.filter((record) => record.id !== id));
      },
      getRecordById: (id) => records.find((record) => record.id === id),
      reloadRecords,
    }),
    [isLoading, records, token]
  );

  return <HealthRecordsContext.Provider value={value}>{children}</HealthRecordsContext.Provider>;
}

export function useHealthRecords() {
  const context = useContext(HealthRecordsContext);

  if (!context) {
    throw new Error('useHealthRecords deve ser usado dentro de HealthRecordsProvider');
  }

  return context;
}

export function getRecordTypeMeta(type: HealthRecordType): HealthRecordTypeMeta {
  return HEALTH_RECORD_TYPE_OPTIONS.find((option) => option.value === type) ?? HEALTH_RECORD_TYPE_OPTIONS[0];
}

export type { HealthRecord, HealthRecordType, UpsertHealthRecordInput };
