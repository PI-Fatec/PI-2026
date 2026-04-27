const bcrypt = require('bcrypt');
const { prisma } = require('../lib/prisma');
const { signAuthToken } = require('../services/tokenService');
const { normalizeEmail } = require('../utils/parsers');

exports.registerSelf = async (req, res) => {
  try {
    const role = req.body.role;
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const name = String(req.body.name || '').trim();

    if (role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Auto-cadastro permitido somente para medico.' });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nome, e-mail e senha sao obrigatorios.' });
    }

    if (!req.body.crm) {
      return res.status(400).json({ error: 'CRM e obrigatorio para medico.' });
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
