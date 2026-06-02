import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { healthAnalysisApi } from '@/lib/health-analysis-api';
import { recordsApi } from '@/lib/records-api';
import { useSession } from '@/providers/session-provider';
import { HealthRecord, HealthRecordType, HealthRecordTypeMeta, UpsertHealthRecordInput } from '@/types/record';

export const HEALTH_RECORD_TYPE_OPTIONS: HealthRecordTypeMeta[] = [
  { value: 'glicemia', label: 'Glicemia', unit: 'mg/dL', placeholder: 'Ex: 110' },
  { value: 'pressao_arterial', label: 'Pressão arterial', unit: 'mmHg', placeholder: 'Ex: 120' },
  { value: 'exame', label: 'Exame', unit: 'un', placeholder: 'Ex: 1.2' },
  { value: 'prontuario', label: 'Prontuário', unit: 'un', placeholder: 'Ex: 1' },
  { value: 'predicao_risco', label: 'Predição de risco', unit: '%', placeholder: 'Ex: 72' },
];

const ANALYSIS_MAX_POLLS = 15;
const ANALYSIS_POLL_INTERVAL_MS = 1200;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type HealthRecordsContextValue = {
  records: HealthRecord[];
  isLoading: boolean;
  isAnalyzingRisk: boolean;
  addRecord: (input: UpsertHealthRecordInput) => Promise<void>;
  updateRecord: (id: string, input: UpsertHealthRecordInput) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  requestRiskAnalysis: () => Promise<void>;
  getRecordById: (id: string) => HealthRecord | undefined;
  reloadRecords: () => Promise<void>;
};

const HealthRecordsContext = createContext<HealthRecordsContextValue | null>(null);

export function HealthRecordsProvider({ children }: PropsWithChildren) {
  const { token } = useSession();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);

  const reloadRecords = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    void reloadRecords();
  }, [reloadRecords]);

  const requestRiskAnalysis = useCallback(async () => {
    if (!token) return;

    setIsAnalyzingRisk(true);

    try {
      const createdRequest = await healthAnalysisApi.request(token);
      let lastStatus = createdRequest.status;

      for (
        let attempt = 0;
        attempt < ANALYSIS_MAX_POLLS && ['PENDING', 'PROCESSING'].includes(lastStatus);
        attempt += 1
      ) {
        await wait(ANALYSIS_POLL_INTERVAL_MS);
        const current = await healthAnalysisApi.getStatus(token, createdRequest.requestId);
        lastStatus = current.status;

        if (current.status === 'FAILED') {
          throw new Error(current.error || 'A IA nao conseguiu concluir a analise.');
        }
      }

      await reloadRecords();
    } finally {
      setIsAnalyzingRisk(false);
    }
  }, [reloadRecords, token]);

  const value = useMemo<HealthRecordsContextValue>(
    () => ({
      records: [...records].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()),
      isLoading,
      isAnalyzingRisk,
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
      requestRiskAnalysis,
      getRecordById: (id) => records.find((record) => record.id === id),
      reloadRecords,
    }),
    [isAnalyzingRisk, isLoading, records, reloadRecords, requestRiskAnalysis, token]
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
