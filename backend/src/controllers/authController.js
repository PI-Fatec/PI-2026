const bcrypt = require('bcrypt');
const { prisma } = require('../lib/prisma');
const { signAuthToken } = require('../services/tokenService');
const { computeRiskMetrics } = require('../services/riskService');
const { normalizeEmail, toBoolean, toInt, toNumber } = require('../utils/parsers');

function extractPatientPayload(body) {
  const alturaCm = toNumber(body.alturaCm, 170);
  const pesoKg = toNumber(body.pesoKg, 70);
  const imc = body.imc ? toNumber(body.imc, 24.2) : Number((pesoKg / Math.pow(alturaCm / 100, 2)).toFixed(1));

  const payload = {
    cpf: String(body.cpf || '').trim(),
    dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
    sexo: body.sexo || 'Outro',
    telefone: String(body.telefone || '').trim(),
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
    estadoGeralSaude: body.estadoGeralSaude || 'BOM',
    status: body.status || 'ATIVO',
  };

  const metrics = computeRiskMetrics(payload);
  return { ...payload, ...metrics };
}

exports.registerSelf = async (req, res) => {
  try {
    const role = req.body.role;
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const name = String(req.body.name || '').trim();

    if (!['DOCTOR', 'PATIENT'].includes(role)) {
      return res.status(400).json({ error: 'Role invalida para auto-cadastro.' });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nome, e-mail e senha sao obrigatorios.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ja existe usuario com este e-mail.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
        accountStatus: 'ACTIVE',
      },
    });

    if (role === 'DOCTOR') {
      if (!req.body.crm) {
        return res.status(400).json({ error: 'CRM e obrigatorio para medico.' });
      }

      await prisma.doctorProfile.create({
        data: {
          userId: created.id,
          telefone: String(req.body.telefone || '').trim(),
          crm: String(req.body.crm || '').trim(),
          especialidade: String(req.body.especialidade || '').trim(),
          clinica: String(req.body.clinica || '').trim(),
          status: req.body.status || 'ATIVO',
        },
      });
    }

    if (role === 'PATIENT') {
      if (!req.body.cpf) {
        return res.status(400).json({ error: 'CPF e obrigatorio para cliente.' });
      }

      const patientPayload = extractPatientPayload(req.body);
      await prisma.patientProfile.create({
        data: {
          userId: created.id,
          ...patientPayload,
        },
      });
    }

    const token = signAuthToken(created);

    return res.status(201).json({
      token,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ja existe registro unico com os dados informados.' });
    }

    return res.status(500).json({ error: 'Erro ao registrar usuario.' });
  }
};

exports.login = async (req, res) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identificador e senha sao obrigatorios.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizeEmail(identifier) },
          {
            doctorProfile: {
              crm: identifier,
            },
          },
        ],
      },
      include: {
        doctorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais invalidas.' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ error: 'Credenciais invalidas.' });
    }

    if (!user.isActive || user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ error: 'Conta inativa ou pendente de ativacao.' });
    }

    const token = signAuthToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao autenticar usuario.' });
  }
};
