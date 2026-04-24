export type DoctorStatus = 'ATIVO' | 'INATIVO';

export interface Doctor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  crm: string;
  especialidade: string;
  clinica: string;
  status: DoctorStatus;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DoctorFilters {
  busca?: string;
  status?: DoctorStatus | 'TODOS';
  clinica?: string;
}

export type NewDoctorInput = Omit<Doctor, 'id' | 'criadoEm' | 'atualizadoEm'>;

export type UpdateDoctorInput = Partial<NewDoctorInput>;

export interface DoctorRepository {
  list: (filters?: DoctorFilters) => Promise<Doctor[]>;
  create: (payload: NewDoctorInput) => Promise<Doctor>;
  update: (id: string, payload: UpdateDoctorInput) => Promise<Doctor>;
  remove: (id: string) => Promise<void>;
}
