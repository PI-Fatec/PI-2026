import {
  NewPatientInput,
  Patient,
  PatientRepository,
} from '@/types/patient';

const MOCK_DELAY_MS = 350;

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

const getAge = (date: string) => {
  const birth = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
};

const getRiskMetrics = (patient: NewPatientInput | Patient) => {
  let score = 0;

  if (patient.fumante) score += 0.18;
  if (!patient.atividadeFisica) score += 0.14;
  if (patient.historicoAvc) score += 0.23;
  if (patient.diabetes) score += 0.19;

  if (patient.consumoAlcoolDoses >= 14) score += 0.13;
  else if (patient.consumoAlcoolDoses >= 8) score += 0.07;

  if (patient.imc >= 30) score += 0.12;
  else if (patient.imc >= 25) score += 0.06;

  if (patient.glicemiaMgDl >= 126) score += 0.12;
  else if (patient.glicemiaMgDl >= 100) score += 0.05;

  if (patient.pressaoSistolica >= 140 || patient.pressaoDiastolica >= 90) score += 0.12;

  const capped = Number(Math.min(score, 0.98).toFixed(2));

  if (capped >= 0.55) {
    return { probabilidadeRisco: capped, risco: 'ALTO' as const };
  }

  if (capped >= 0.3) {
    return { probabilidadeRisco: capped, risco: 'MEDIO' as const };
  }

  return { probabilidadeRisco: capped, risco: 'BAIXO' as const };
};

const normalize = (value: string) => value.trim().toLowerCase();

const normalizeDateRange = (date: string, edge: 'start' | 'end') => {
  const target = new Date(date);

  if (edge === 'start') {
    target.setHours(0, 0, 0, 0);
  } else {
    target.setHours(23, 59, 59, 999);
  }

  return target;
};

const nowIso = () => new Date().toISOString();

let patientsDb: Patient[] = [
  {
    id: 'pac-001',
    nomeCompleto: 'Ana Maria Silveira',
    cpf: '123.456.789-45',
    dataNascimento: '1987-08-13',
    sexo: 'Feminino',
    telefone: '(11) 99111-1111',
    email: 'ana.silveira@email.com',
    alturaCm: 163,
    pesoKg: 74,
    imc: 27.9,
    pressaoSistolica: 138,
    pressaoDiastolica: 88,
    glicemiaMgDl: 108,
    fumante: false,
    atividadeFisica: true,
    historicoAvc: false,
    diabetes: false,
    consumoAlcoolDoses: 2,
    estadoGeralSaude: 'BOM',
    risco: 'MEDIO',
    probabilidadeRisco: 0.33,
    status: 'ATIVO',
    criadoEm: '2026-04-08T10:15:00.000Z',
    atualizadoEm: '2026-04-17T09:20:00.000Z',
  },
  {
    id: 'pac-002',
    nomeCompleto: 'Joao Pedro Santos',
    cpf: '987.654.321-10',
    dataNascimento: '1976-02-02',
    sexo: 'Masculino',
    telefone: '(11) 99222-2222',
    email: 'joao.pedro@email.com',
    alturaCm: 171,
    pesoKg: 92,
    imc: 31.5,
    pressaoSistolica: 149,
    pressaoDiastolica: 95,
    glicemiaMgDl: 131,
    fumante: true,
    atividadeFisica: false,
    historicoAvc: true,
    diabetes: true,
    consumoAlcoolDoses: 10,
    estadoGeralSaude: 'ATENCAO',
    risco: 'ALTO',
    probabilidadeRisco: 0.77,
    status: 'ATIVO',
    criadoEm: '2026-04-01T07:30:00.000Z',
    atualizadoEm: '2026-04-17T13:05:00.000Z',
  },
  {
    id: 'pac-003',
    nomeCompleto: 'Carla Lemos',
    cpf: '554.908.713-91',
    dataNascimento: '1994-12-20',
    sexo: 'Feminino',
    telefone: '(11) 99333-3333',
    email: 'carla.lemos@email.com',
    alturaCm: 168,
    pesoKg: 63,
    imc: 22.3,
    pressaoSistolica: 118,
    pressaoDiastolica: 76,
    glicemiaMgDl: 89,
    fumante: false,
    atividadeFisica: true,
    historicoAvc: false,
    diabetes: false,
    consumoAlcoolDoses: 1,
    estadoGeralSaude: 'MUITO_BOM',
    risco: 'BAIXO',
    probabilidadeRisco: 0.12,
    status: 'ATIVO',
    criadoEm: '2026-03-26T09:10:00.000Z',
    atualizadoEm: '2026-04-15T16:00:00.000Z',
  },
  {
    id: 'pac-004',
    nomeCompleto: 'Roberto Barbosa',
    cpf: '332.118.000-08',
    dataNascimento: '1969-06-15',
    sexo: 'Masculino',
    telefone: '(11) 99444-4444',
    email: 'roberto.barbosa@email.com',
    alturaCm: 175,
    pesoKg: 84,
    imc: 27.4,
    pressaoSistolica: 126,
    pressaoDiastolica: 82,
    glicemiaMgDl: 98,
    fumante: false,
    atividadeFisica: false,
    historicoAvc: false,
    diabetes: false,
    consumoAlcoolDoses: 5,
    estadoGeralSaude: 'BOM',
    risco: 'MEDIO',
    probabilidadeRisco: 0.34,
    status: 'INATIVO',
    criadoEm: '2026-03-20T11:00:00.000Z',
    atualizadoEm: '2026-04-11T11:40:00.000Z',
  },
];

export const mockPatientService: PatientRepository = {
  async list(filters = {}) {
    await wait();

    const { busca, risco = 'TODOS', status = 'TODOS', dataInicio, dataFim } = filters;

    return patientsDb
      .filter((patient) => {
        if (risco !== 'TODOS' && patient.risco !== risco) {
          return false;
        }

        if (status !== 'TODOS' && patient.status !== status) {
          return false;
        }

        if (busca) {
          const target = normalize(busca);
          const isMatch =
            normalize(patient.nomeCompleto).includes(target) ||
            normalize(patient.cpf).includes(target) ||
            normalize(patient.email).includes(target);

          if (!isMatch) {
            return false;
          }
        }

        const updatedAt = new Date(patient.atualizadoEm);

        if (dataInicio && updatedAt < normalizeDateRange(dataInicio, 'start')) {
          return false;
        }

        if (dataFim && updatedAt > normalizeDateRange(dataFim, 'end')) {
          return false;
        }

        return true;
      })
      .sort((a, b) => Number(new Date(b.atualizadoEm)) - Number(new Date(a.atualizadoEm)));
  },

  async getById(id) {
    await wait();
    return patientsDb.find((patient) => patient.id === id) ?? null;
  },

  async create(payload) {
    await wait();

    const existsCpf = patientsDb.some((patient) => patient.cpf === payload.cpf);

    if (existsCpf) {
      throw new Error('Ja existe um paciente cadastrado com este CPF.');
    }

    const metrics = getRiskMetrics(payload);
    const timestamp = nowIso();

    const createdPatient: Patient = {
      ...payload,
      id: `pac-${Date.now()}`,
      imc: Number(payload.imc.toFixed(1)),
      ...metrics,
      criadoEm: timestamp,
      atualizadoEm: timestamp,
    };

    patientsDb = [createdPatient, ...patientsDb];

    return createdPatient;
  },

  async update(id, payload) {
    await wait();

    const current = patientsDb.find((patient) => patient.id === id);

    if (!current) {
      throw new Error('Paciente nao encontrado para atualizacao.');
    }

    const updatedSource: Patient = {
      ...current,
      ...payload,
      atualizadoEm: nowIso(),
    };

    const metrics = getRiskMetrics(updatedSource);

    const updatedPatient: Patient = {
      ...updatedSource,
      imc: Number(updatedSource.imc.toFixed(1)),
      ...metrics,
    };

    patientsDb = patientsDb.map((patient) => (patient.id === id ? updatedPatient : patient));

    return updatedPatient;
  },

  async remove(id) {
    await wait();

    const currentCount = patientsDb.length;
    patientsDb = patientsDb.filter((patient) => patient.id !== id);

    if (patientsDb.length === currentCount) {
      throw new Error('Paciente nao encontrado para exclusao.');
    }
  },
};

export const getPatientAge = (patient: Pick<Patient, 'dataNascimento'>) => getAge(patient.dataNascimento);
