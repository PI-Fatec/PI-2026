import { AuthSession, UserRole } from '@/types/auth';

export interface AccountDoctorProfile {
  id: string;
  telefone: string;
  crm: string;
  especialidade: string;
  clinica: string;
  status: 'ATIVO' | 'INATIVO';
}

export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  doctorProfile: AccountDoctorProfile | null;
}

export interface UpdateAccountInput {
  name: string;
  email: string;
  telefone?: string;
  crm?: string;
  especialidade?: string;
  clinica?: string;
}

export interface UpdateAccountResult {
  account: AccountProfile;
  session: AuthSession;
}
