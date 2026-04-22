import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type HealthRecordType =
  | 'glicemia'
  | 'pressao_arterial'
  | 'alimentacao'
  | 'exame'
  | 'prontuario'
  | 'predicao_risco';

type HealthRecordTypeMeta = {
  value: HealthRecordType;
  label: string;
  unit: string;
  placeholder: string;
};

export const HEALTH_RECORD_TYPE_OPTIONS: HealthRecordTypeMeta[] = [
  { value: 'glicemia', label: 'Glicemia', unit: 'mg/dL', placeholder: 'Ex: 110' },
  { value: 'pressao_arterial', label: 'Pressao arterial', unit: 'mmHg', placeholder: 'Ex: 120' },
  { value: 'alimentacao', label: 'Alimentacao', unit: 'kcal', placeholder: 'Ex: 550' },
  { value: 'exame', label: 'Exame', unit: 'un', placeholder: 'Ex: 1.2' },
  { value: 'prontuario', label: 'Prontuario', unit: 'un', placeholder: 'Ex: 1' },
  { value: 'predicao_risco', label: 'Predicao de risco', unit: '%', placeholder: 'Ex: 72' },
];

export type HealthRecord = {
  id: string;
  type: HealthRecordType;
  value: number;
  unit: string;
  notes: string;
  recordedAt: string;
};

type UpsertHealthRecordInput = {
  type: HealthRecordType;
  value: number;
  unit: string;
  notes: string;
  recordedAt: string;
};

type HealthRecordsContextValue = {
  records: HealthRecord[];
  addRecord: (input: UpsertHealthRecordInput) => void;
  updateRecord: (id: string, input: UpsertHealthRecordInput) => void;
  deleteRecord: (id: string) => void;
  getRecordById: (id: string) => HealthRecord | undefined;
};

const initialRecords: HealthRecord[] = [
  {
    id: 'r1',
    type: 'glicemia',
    value: 190,
    unit: 'mg/dL',
    notes: 'Antes do cafe da manha',
    recordedAt: '2026-04-22T10:00:00.000Z',
  },
  {
    id: 'r2',
    type: 'glicemia',
    value: 305,
    unit: 'mg/dL',
    notes: 'Apos almoco',
    recordedAt: '2026-04-22T12:00:00.000Z',
  },
  {
    id: 'r3',
    type: 'pressao_arterial',
    value: 125,
    unit: 'mmHg',
    notes: 'Pressao apos caminhada leve',
    recordedAt: '2026-04-22T15:00:00.000Z',
  },
  {
    id: 'r4',
    type: 'alimentacao',
    value: 640,
    unit: 'kcal',
    notes: 'Almoco com carboidratos moderados',
    recordedAt: '2026-04-22T17:00:00.000Z',
  },
];

const HealthRecordsContext = createContext<HealthRecordsContextValue | null>(null);

export function HealthRecordsProvider({ children }: PropsWithChildren) {
  const [records, setRecords] = useState<HealthRecord[]>(initialRecords);

  const value = useMemo<HealthRecordsContextValue>(
    () => ({
      records: [...records].sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      ),
      addRecord: (input) => {
        setRecords((current) => [
          ...current,
          {
            id: `r${Date.now()}`,
            ...input,
          },
        ]);
      },
      updateRecord: (id, input) => {
        setRecords((current) =>
          current.map((record) => {
            if (record.id !== id) {
              return record;
            }

            return { ...record, ...input };
          })
        );
      },
      deleteRecord: (id) => {
        setRecords((current) => current.filter((record) => record.id !== id));
      },
      getRecordById: (id) => records.find((record) => record.id === id),
    }),
    [records]
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
  return (
    HEALTH_RECORD_TYPE_OPTIONS.find((option) => option.value === type) ?? HEALTH_RECORD_TYPE_OPTIONS[0]
  );
}

