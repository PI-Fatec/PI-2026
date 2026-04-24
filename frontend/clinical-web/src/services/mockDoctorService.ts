import { Doctor, DoctorRepository } from '@/types/doctor';

const MOCK_DELAY_MS = 260;

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

const normalize = (value: string) => value.trim().toLowerCase();

const nowIso = () => new Date().toISOString();

let doctorsDb: Doctor[] = [
  {
    id: 'doc-001',
    nome: 'Dr. Ricardo Silva',
    email: 'ricardo.silva@healthtrack.com',
    telefone: '(11) 99123-1122',
    crm: 'CRM12345',
    especialidade: 'Cardiologia',
    clinica: 'Clinica Central',
    status: 'ATIVO',
    criadoEm: '2026-03-12T09:00:00.000Z',
    atualizadoEm: '2026-04-15T11:40:00.000Z',
  },
  {
    id: 'doc-002',
    nome: 'Dra. Ana Costa',
    email: 'ana.costa@healthtrack.com',
    telefone: '(11) 99244-3344',
    crm: 'CRM99887',
    especialidade: 'Neurologia',
    clinica: 'Unidade Norte',
    status: 'ATIVO',
    criadoEm: '2026-02-22T13:10:00.000Z',
    atualizadoEm: '2026-04-14T15:00:00.000Z',
  },
  {
    id: 'doc-003',
    nome: 'Dr. Felipe Moura',
    email: 'felipe.moura@healthtrack.com',
    telefone: '(11) 99333-6677',
    crm: 'CRM77665',
    especialidade: 'Clinico Geral',
    clinica: 'Clinica Central',
    status: 'INATIVO',
    criadoEm: '2026-01-18T08:45:00.000Z',
    atualizadoEm: '2026-04-01T10:20:00.000Z',
  },
];

export const mockDoctorService: DoctorRepository = {
  async list(filters = {}) {
    await wait();

    const { busca, status = 'TODOS', clinica } = filters;

    return doctorsDb
      .filter((doctor) => {
        if (status !== 'TODOS' && doctor.status !== status) {
          return false;
        }

        if (clinica && normalize(clinica) && normalize(doctor.clinica) !== normalize(clinica)) {
          return false;
        }

        if (busca) {
          const target = normalize(busca);
          const matches =
            normalize(doctor.nome).includes(target) ||
            normalize(doctor.crm).includes(target) ||
            normalize(doctor.email).includes(target);

          if (!matches) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => Number(new Date(b.atualizadoEm)) - Number(new Date(a.atualizadoEm)));
  },

  async create(payload) {
    await wait();

    const crmExists = doctorsDb.some((doctor) => normalize(doctor.crm) === normalize(payload.crm));

    if (crmExists) {
      throw new Error('Ja existe um medico cadastrado com este CRM.');
    }

    const emailExists = doctorsDb.some((doctor) => normalize(doctor.email) === normalize(payload.email));

    if (emailExists) {
      throw new Error('Ja existe um medico cadastrado com este e-mail.');
    }

    const timestamp = nowIso();

    const createdDoctor: Doctor = {
      ...payload,
      id: `doc-${Date.now()}`,
      criadoEm: timestamp,
      atualizadoEm: timestamp,
    };

    doctorsDb = [createdDoctor, ...doctorsDb];

    return createdDoctor;
  },

  async update(id, payload) {
    await wait();

    const current = doctorsDb.find((doctor) => doctor.id === id);

    if (!current) {
      throw new Error('Medico nao encontrado para atualizacao.');
    }

    const updatedDoctor: Doctor = {
      ...current,
      ...payload,
      atualizadoEm: nowIso(),
    };

    doctorsDb = doctorsDb.map((doctor) => (doctor.id === id ? updatedDoctor : doctor));

    return updatedDoctor;
  },

  async remove(id) {
    await wait();

    const totalBefore = doctorsDb.length;
    doctorsDb = doctorsDb.filter((doctor) => doctor.id !== id);

    if (doctorsDb.length === totalBefore) {
      throw new Error('Medico nao encontrado para exclusao.');
    }
  },
};
