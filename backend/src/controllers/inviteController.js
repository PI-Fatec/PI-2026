const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { prisma } = require('../lib/prisma');
const { sendInviteEmail } = require('../services/emailService');
const { createRawInviteToken, hashInviteToken, getInviteExpiry } = require('../services/inviteService');
const { signAuthToken } = require('../services/tokenService');
const { computeRiskMetrics } = require('../services/riskService');
const { normalizeEmail, toBoolean, toInt, toNumber } = require('../utils/parsers');

const webBaseUrl = process.env.WEB_BASE_URL || 'http://localhost:3001';
const backendBaseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3000';
const mobileDeepLinkBase = process.env.MOBILE_DEEP_LINK_BASE || 'clientapp://invite';

function buildUrls(token) {
  const webUrl = `${webBaseUrl.replace(/\/$/, '')}/convite/aceitar?token=${token}`;
  const deepLinkUrl = `${mobileDeepLinkBase}${mobileDeepLinkBase.includes('?') ? '&' : '?'}token=${token}`;
  const appOpenUrl = `${backendBaseUrl.replace(/\/$/, '')}/api/invites/open-app?token=${encodeURIComponent(token)}`;
  return { webUrl, deepLinkUrl, appOpenUrl };
}

function mapDoctorProfile(profile, user) {
  return {
    id: profile.id,
    nome: user.name,
    email: user.email,
    telefone: profile.telefone,
    crm: profile.crm,
    especialidade: profile.especialidade,
    clinica: profile.clinica,
    status: profile.status,
    criadoEm: profile.createdAt,
    atualizadoEm: profile.updatedAt,
  };
}

function mapPatientProfile(profile, user) {
  return {
    id: profile.id,
    nomeCompleto: user.name,
    cpf: profile.cpf,
    dataNascimento: profile.dataNascimento,
    sexo: profile.sexo,
    telefone: profile.telefone,
    email: user.email,
    alturaCm: profile.alturaCm,
    pesoKg: profile.pesoKg,
    imc: profile.imc,
    pressaoSistolica: profile.pressaoSistolica,
    pressaoDiastolica: profile.pressaoDiastolica,
    glicemiaMgDl: profile.glicemiaMgDl,
    fumante: profile.fumante,
    atividadeFisica: profile.atividadeFisica,
    historicoAvc: profile.historicoAvc,
    diabetes: profile.diabetes,
    consumoAlcoolDoses: profile.consumoAlcoolDoses,
    estadoGeralSaude: profile.estadoGeralSaude,
    risco: profile.risco,
    probabilidadeRisco: profile.probabilidadeRisco,
    status: profile.status,
    criadoEm: profile.createdAt,
    atualizadoEm: profile.updatedAt,
  };
}

function buildPatientPayload(body) {
  const alturaCm = toNumber(body.alturaCm, 170);
  const pesoKg = toNumber(body.pesoKg, 70);
  const imc = body.imc ? toNumber(body.imc, 24.2) : Number((pesoKg / Math.pow(alturaCm / 100, 2)).toFixed(1));

  const base = {
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

  return { ...base, ...computeRiskMetrics(base) };
}

async function createInvite({ role, email, invitedById, invitedUserId, metadata }) {
  const rawToken = createRawInviteToken();
  const tokenHash = hashInviteToken(rawToken);

  const invite = await prisma.inviteToken.create({
    data: {
      tokenHash,
      email,
      role,
      invitedById,
      invitedUserId,
      expiresAt: getInviteExpiry(),
      metadata,
    },
  });

  return { rawToken, invite };
}

exports.inviteDoctor = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.nome || req.body.name || '').trim();
    const crm = String(req.body.crm || '').trim();

    if (!email || !name || !crm) {
      return res.status(400).json({ error: 'Nome, e-mail e CRM sao obrigatorios para convite medico.' });
    }

    const hashedTempPassword = await bcrypt.hash(crypto.randomUUID(), 10);

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedTempPassword,
        role: 'DOCTOR',
        isActive: false,
        accountStatus: 'PENDING',
        doctorProfile: {
          create: {
            telefone: String(req.body.telefone || '').trim(),
            crm,
            especialidade: String(req.body.especialidade || '').trim(),
            clinica: String(req.body.clinica || '').trim(),
            status: req.body.status || 'ATIVO',
          },
        },
      },
      include: { doctorProfile: true },
    });

    const { rawToken } = await createInvite({
      role: 'DOCTOR',
      email,
      invitedById: req.auth.userId,
      invitedUserId: createdUser.id,
      metadata: {
        doctorProfileId: createdUser.doctorProfile.id,
      },
    });

    const inviter = await prisma.user.findUnique({ where: { id: req.auth.userId } });
    const urls = buildUrls(rawToken);

    await sendInviteEmail({
      to: email,
      role: 'DOCTOR',
      inviterName: inviter?.name || 'Administrador',
      webUrl: urls.webUrl,
      appOpenUrl: urls.appOpenUrl,
      deepLinkUrl: urls.deepLinkUrl,
    });

    return res.status(201).json({
      message: 'Convite enviado para o medico.',
      doctor: mapDoctorProfile(createdUser.doctorProfile, createdUser),
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ja existe medico com e-mail ou CRM informado.' });
    }

    return res.status(500).json({ error: 'Falha ao enviar convite para medico.' });
  }
};

exports.invitePatient = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.nomeCompleto || req.body.name || '').trim();
    const cpf = String(req.body.cpf || '').trim();

    if (!email || !name || !cpf) {
      return res.status(400).json({ error: 'Nome, e-mail e CPF sao obrigatorios para convite do cliente.' });
    }

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: req.auth.userId } });

    if (!doctor) {
      return res.status(403).json({ error: 'Somente medico pode enviar convite para cliente.' });
    }

    const patientPayload = buildPatientPayload(req.body);
    const hashedTempPassword = await bcrypt.hash(crypto.randomUUID(), 10);

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedTempPassword,
        role: 'PATIENT',
        isActive: false,
        accountStatus: 'PENDING',
        patientProfile: {
          create: {
            ...patientPayload,
            doctorId: doctor.id,
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });

    const { rawToken } = await createInvite({
      role: 'PATIENT',
      email,
      invitedById: req.auth.userId,
      invitedUserId: createdUser.id,
      metadata: {
        patientProfileId: createdUser.patientProfile.id,
      },
    });

    const inviter = await prisma.user.findUnique({ where: { id: req.auth.userId } });
    const urls = buildUrls(rawToken);

    await sendInviteEmail({
      to: email,
      role: 'PATIENT',
      inviterName: inviter?.name || 'Medico',
      webUrl: urls.webUrl,
      appOpenUrl: urls.appOpenUrl,
      deepLinkUrl: urls.deepLinkUrl,
    });

    return res.status(201).json({
      message: 'Convite enviado para o cliente.',
      patient: mapPatientProfile(createdUser.patientProfile, createdUser),
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ja existe cliente com e-mail ou CPF informado.' });
    }

    return res.status(500).json({ error: 'Falha ao enviar convite para cliente.' });
  }
};

exports.validateInvite = async (req, res) => {
  try {
    const rawToken = String(req.query.token || '');
    if (!rawToken) {
      return res.status(400).json({ error: 'Token e obrigatorio.' });
    }

    const tokenHash = hashInviteToken(rawToken);
    const invite = await prisma.inviteToken.findUnique({ where: { tokenHash } });

    if (!invite) {
      return res.status(404).json({ error: 'Convite nao encontrado.' });
    }

    if (invite.usedAt) {
      return res.status(400).json({ error: 'Convite ja utilizado.' });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Convite expirado.' });
    }

    return res.json({
      valid: true,
      role: invite.role,
      email: invite.email,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao validar convite.' });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const rawToken = String(req.body.token || '');
    const password = String(req.body.password || '');

    if (!rawToken || !password) {
      return res.status(400).json({ error: 'Token e senha sao obrigatorios.' });
    }

    const tokenHash = hashInviteToken(rawToken);
    const invite = await prisma.inviteToken.findUnique({ where: { tokenHash } });

    if (!invite) {
      return res.status(404).json({ error: 'Convite nao encontrado.' });
    }

    if (invite.usedAt) {
      return res.status(400).json({ error: 'Convite ja utilizado.' });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Convite expirado.' });
    }

    if (!invite.invitedUserId) {
      return res.status(400).json({ error: 'Convite sem usuario vinculado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: invite.invitedUserId },
      data: {
        password: hashedPassword,
        isActive: true,
        accountStatus: 'ACTIVE',
        name: req.body.name ? String(req.body.name).trim() : undefined,
      },
    });

    if (invite.role === 'DOCTOR' && req.body.crm) {
      await prisma.doctorProfile.update({
        where: { userId: updatedUser.id },
        data: {
          telefone: String(req.body.telefone || '').trim(),
          crm: String(req.body.crm || '').trim(),
          especialidade: String(req.body.especialidade || '').trim(),
          clinica: String(req.body.clinica || '').trim(),
        },
      });
    }

    if (invite.role === 'PATIENT') {
      const patientUpdate = buildPatientPayload(req.body);
      const nextCpf = String(req.body.cpf || '').trim();
      await prisma.patientProfile.update({
        where: { userId: updatedUser.id },
        data: {
          ...patientUpdate,
          ...(nextCpf ? { cpf: nextCpf } : {}),
        },
      });
    }

    await prisma.inviteToken.update({
      where: { id: invite.id },
      data: {
        usedAt: new Date(),
      },
    });

    const token = signAuthToken(updatedUser);

    return res.json({
      message: 'Convite aceito com sucesso.',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Dados unicos em conflito ao aceitar convite.' });
    }

    return res.status(500).json({ error: 'Falha ao aceitar convite.' });
  }
};

exports.openAppInvite = async (req, res) => {
  const token = String(req.query.token || '').trim();

  if (!token) {
    return res.status(400).send('Token de convite nao informado.');
  }

  const urls = buildUrls(token);
  const html = `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Abrir convite no app</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f4f8ff; color: #1f2f4d; }
      .wrap { max-width: 560px; margin: 48px auto; background: #fff; border: 1px solid #dbe4f1; border-radius: 12px; padding: 20px; }
      h1 { font-size: 20px; margin: 0 0 10px; }
      p { line-height: 1.5; margin: 0 0 12px; color: #4a6286; }
      .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
      a { text-decoration: none; border-radius: 8px; padding: 10px 14px; font-weight: 600; font-size: 14px; }
      .primary { background: #0f172a; color: #fff; }
      .secondary { background: #1d4ed8; color: #fff; }
      .helper { margin-top: 12px; font-size: 13px; color: #60779b; }
    </style>
  </head>
  <body>
    <main class="wrap">
      <h1>Abrindo seu convite no app...</h1>
      <p>Se o app nao abrir automaticamente, toque em <strong>Abrir no app</strong>.</p>
      <div class="actions">
        <a class="primary" href="${urls.deepLinkUrl}">Abrir no app</a>
        <a class="secondary" href="${urls.webUrl}">Continuar no portal web</a>
      </div>
      <p class="helper">Dica: no celular, o link do app pode exigir toque manual por seguranca do navegador.</p>
    </main>
    <script>
      const deepLink = ${JSON.stringify(urls.deepLinkUrl)};
      window.location.href = deepLink;
    </script>
  </body>
</html>
  `;

  return res.setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
};
