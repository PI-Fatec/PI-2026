const bcrypt = require('bcrypt');
const { prisma } = require('../lib/prisma');
const { signAuthToken } = require('../services/tokenService');
const { normalizeEmail, toBoolean, toInt, toNumber } = require('../utils/parsers');

function parseOptionalDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildPatientProfilePayload(body) {
  const alturaCm = toNumber(body.alturaCm, 170);
  const pesoKg = toNumber(body.pesoKg, 70);
  const imc = body.imc ? toNumber(body.imc, 24.2) : Number((pesoKg / Math.pow(alturaCm / 100, 2)).toFixed(1));

  return {
    cpf: String(body.cpf || '').trim(),
    dataNascimento: parseOptionalDate(body.dataNascimento),
    sexo: body.sexo || 'Outro',
    telefone: String(body.telefone || '').trim(),
    alturaCm,
    pesoKg,
    imc,
    pressaoSistolica: toInt(body.pressaoSistolica, 120),
    pressaoDiastolica: toInt(body.pressaoDiastolica, 80),
    glicemiaMgDl: toNumber(body.glicemiaMgDl, 96),
    fumante: toBoolean(body.fumante, false),
    colesterolAlto: toBoolean(body.colesterolAlto, false),
    atividadeFisica: toBoolean(body.atividadeFisica, true),
    historicoAvc: toBoolean(body.historicoAvc, false),
    doencaCardiaca: toBoolean(body.doencaCardiaca, false),
    consomeFrutas: toBoolean(body.consomeFrutas, true),
    consomeVegetais: toBoolean(body.consomeVegetais, true),
    dificuldadeCaminhar: toBoolean(body.dificuldadeCaminhar, false),
    diabetes: toBoolean(body.diabetes, false),
    consumoAlcoolDoses: toInt(body.consumoAlcoolDoses, 0),
    estadoGeralSaude: body.estadoGeralSaude || 'BOM',
    status: body.status || 'ATIVO',
  };
}

exports.registerSelf = async (req, res) => {
  try {
    const role = req.body.role;
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const name = String(req.body.name || '').trim();

    if (!['DOCTOR', 'PATIENT'].includes(role)) {
      return res.status(403).json({ error: 'Auto-cadastro permitido somente para medico ou cliente.' });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nome, e-mail e senha sao obrigatorios.' });
    }

    if (role === 'DOCTOR' && !req.body.crm) {
      return res.status(400).json({ error: 'CRM e obrigatorio para medico.' });
    }

    if (role === 'PATIENT' && !req.body.cpf) {
      return res.status(400).json({ error: 'CPF e obrigatorio para cliente.' });
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
        ...(role === 'PATIENT'
          ? {
              patientProfile: {
                create: buildPatientProfilePayload(req.body),
              },
            }
          : {}),
        ...(role === 'DOCTOR'
          ? {
              doctorProfile: {
                create: {
                  telefone: String(req.body.telefone || '').trim(),
                  crm: String(req.body.crm || '').trim(),
                  especialidade: String(req.body.especialidade || '').trim(),
                  clinica: String(req.body.clinica || '').trim(),
                  status: req.body.status || 'ATIVO',
                },
              },
            }
          : {}),
      },
    });

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

    return res.status(500).json({ error: 'Erro ao registrar usuario.', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || '').trim();
    const password = String(req.body.password || '');
    const portal = String(req.body.portal || '').trim().toUpperCase();

    if (!identifier || !password || !portal) {
      return res.status(400).json({ error: 'Identificador, senha e portal sao obrigatorios.' });
    }

    if (!['CLINICAL_WEB', 'MOBILE_APP'].includes(portal)) {
      return res.status(400).json({ error: 'Portal de acesso invalido.' });
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

    if (portal === 'CLINICAL_WEB' && !['ADMIN', 'DOCTOR'].includes(user.role)) {
      return res.status(403).json({ error: 'Este usuario nao possui acesso ao portal clinico.' });
    }

    if (portal === 'MOBILE_APP' && user.role !== 'PATIENT') {
      return res.status(403).json({ error: 'Este usuario nao possui acesso ao aplicativo do paciente.' });
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
