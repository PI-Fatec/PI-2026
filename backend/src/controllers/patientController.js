const { prisma } = require('../lib/prisma');
const { computeRiskMetrics } = require('../services/riskService');
const { toBoolean, toInt, toNumber } = require('../utils/parsers');

function mapPatient(item) {
  return {
    id: item.id,
    nomeCompleto: item.user.name,
    cpf: item.cpf,
    dataNascimento: item.dataNascimento,
    sexo: item.sexo,
    telefone: item.telefone,
    email: item.user.email,
    alturaCm: item.alturaCm,
    pesoKg: item.pesoKg,
    imc: item.imc,
    pressaoSistolica: item.pressaoSistolica,
    pressaoDiastolica: item.pressaoDiastolica,
    glicemiaMgDl: item.glicemiaMgDl,
    fumante: item.fumante,
    atividadeFisica: item.atividadeFisica,
    historicoAvc: item.historicoAvc,
    diabetes: item.diabetes,
    consumoAlcoolDoses: item.consumoAlcoolDoses,
    estadoGeralSaude: item.estadoGeralSaude,
    risco: item.risco,
    probabilidadeRisco: item.probabilidadeRisco,
    status: item.status,
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt,
  };
}

function buildPatientUpdate(body, keepComputed = false) {
  const alturaCm = toNumber(body.alturaCm, 170);
  const pesoKg = toNumber(body.pesoKg, 70);
  const imc = body.imc ? toNumber(body.imc, 24.2) : Number((pesoKg / Math.pow(alturaCm / 100, 2)).toFixed(1));

  const payload = {
    cpf: body.cpf,
    dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
    sexo: body.sexo,
    telefone: body.telefone,
    alturaCm,
    pesoKg,
    imc,
    pressaoSistolica: toInt(body.pressaoSistolica, 120),
    pressaoDiastolica: toInt(body.pressaoDiastolica, 80),
    glicemiaMgDl: toNumber(body.glicemiaMgDl, 96),
    fumante: toBoolean(body.fumante, false),
    atividadeFisica: toBoolean(body.atividadeFisica, true),
    historicoAvc: toBoolean(body.historicoAvc, false),
    diabetes: toBoolean(body.diabetes, false),
    consumoAlcoolDoses: toInt(body.consumoAlcoolDoses, 0),
    estadoGeralSaude: body.estadoGeralSaude,
    status: body.status,
  };

  const filtered = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

  if (keepComputed) {
    return filtered;
  }

  return { ...filtered, ...computeRiskMetrics(filtered) };
}

exports.listPatients = async (req, res) => {
  try {
    const { busca = '', risco = 'TODOS', status = 'TODOS', dataInicio = '', dataFim = '' } = req.query;

    const patients = await prisma.patientProfile.findMany({
      where: {
        ...(risco !== 'TODOS' ? { risco: String(risco) } : {}),
        ...(status !== 'TODOS' ? { status: String(status) } : {}),
        ...(dataInicio || dataFim
          ? {
              updatedAt: {
                ...(dataInicio ? { gte: new Date(`${dataInicio}T00:00:00.000Z`) } : {}),
                ...(dataFim ? { lte: new Date(`${dataFim}T23:59:59.999Z`) } : {}),
              },
            }
          : {}),
        ...(busca
          ? {
              OR: [
                { cpf: { contains: String(busca) } },
                { user: { name: { contains: String(busca), mode: 'insensitive' } } },
                { user: { email: { contains: String(busca), mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return res.json(patients.map(mapPatient));
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao listar clientes.' });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const id = String(req.params.id || '');

    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Cliente nao encontrado.' });
    }

    return res.json(mapPatient(patient));
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao carregar cliente.' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const id = String(req.params.id || '');

    const payload = buildPatientUpdate(req.body);

    const updated = await prisma.patientProfile.update({
      where: { id },
      data: {
        ...payload,
        user: {
          update: {
            ...(req.body.nomeCompleto ? { name: String(req.body.nomeCompleto).trim() } : {}),
            ...(req.body.email ? { email: String(req.body.email).trim().toLowerCase() } : {}),
          },
        },
      },
      include: {
        user: true,
      },
    });

    return res.json(mapPatient(updated));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ja existe cliente com CPF ou e-mail informado.' });
    }

    return res.status(500).json({ error: 'Falha ao atualizar cliente.' });
  }
};

exports.removePatient = async (req, res) => {
  try {
    const id = String(req.params.id || '');

    const patient = await prisma.patientProfile.findUnique({ where: { id } });

    if (!patient) {
      return res.status(404).json({ error: 'Cliente nao encontrado.' });
    }

    await prisma.user.delete({
      where: {
        id: patient.userId,
      },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao remover cliente.' });
  }
};
