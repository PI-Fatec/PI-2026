const { prisma } = require('../lib/prisma');
const { signAuthToken } = require('../services/tokenService');
const { normalizeEmail, toBoolean, toInt, toNumber } = require('../utils/parsers');

function mapAccount(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    doctorProfile: user.doctorProfile
      ? {
          id: user.doctorProfile.id,
          telefone: user.doctorProfile.telefone,
          crm: user.doctorProfile.crm,
          especialidade: user.doctorProfile.especialidade,
          clinica: user.doctorProfile.clinica,
          status: user.doctorProfile.status,
        }
      : null,
    patientProfile: user.patientProfile
      ? {
          id: user.patientProfile.id,
          cpf: user.patientProfile.cpf,
          dataNascimento: user.patientProfile.dataNascimento,
          sexo: user.patientProfile.sexo,
          telefone: user.patientProfile.telefone,
          alturaCm: user.patientProfile.alturaCm,
          pesoKg: user.patientProfile.pesoKg,
          imc: user.patientProfile.imc,
          pressaoSistolica: user.patientProfile.pressaoSistolica,
          pressaoDiastolica: user.patientProfile.pressaoDiastolica,
          glicemiaMgDl: user.patientProfile.glicemiaMgDl,
          fumante: user.patientProfile.fumante,
          colesterolAlto: user.patientProfile.colesterolAlto,
          atividadeFisica: user.patientProfile.atividadeFisica,
          historicoAvc: user.patientProfile.historicoAvc,
          doencaCardiaca: user.patientProfile.doencaCardiaca,
          consomeFrutas: user.patientProfile.consomeFrutas,
          consomeVegetais: user.patientProfile.consomeVegetais,
          dificuldadeCaminhar: user.patientProfile.dificuldadeCaminhar,
          diabetes: user.patientProfile.diabetes,
          consumoAlcoolDoses: user.patientProfile.consumoAlcoolDoses,
          estadoGeralSaude: user.patientProfile.estadoGeralSaude,
          risco: user.patientProfile.risco,
          probabilidadeRisco: user.patientProfile.probabilidadeRisco,
          status: user.patientProfile.status,
        }
      : null,
  };
}

function hasOwn(body, field) {
  return Object.prototype.hasOwnProperty.call(body, field);
}

function parseOptionalDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildPatientData(body) {
  const patientData = {};

  if (hasOwn(body, 'cpf')) patientData.cpf = String(body.cpf || '').trim();
  if (hasOwn(body, 'dataNascimento')) patientData.dataNascimento = parseOptionalDate(body.dataNascimento);
  if (hasOwn(body, 'sexo')) patientData.sexo = body.sexo;
  if (hasOwn(body, 'telefone')) patientData.telefone = String(body.telefone || '').trim();
  if (hasOwn(body, 'alturaCm')) patientData.alturaCm = toNumber(body.alturaCm, 170);
  if (hasOwn(body, 'pesoKg')) patientData.pesoKg = toNumber(body.pesoKg, 70);
  if (hasOwn(body, 'imc')) patientData.imc = toNumber(body.imc, 24.2);
  if (!hasOwn(body, 'imc') && hasOwn(body, 'alturaCm') && hasOwn(body, 'pesoKg')) {
    const alturaCm = toNumber(body.alturaCm, 170);
    const pesoKg = toNumber(body.pesoKg, 70);
    patientData.imc = Number((pesoKg / Math.pow(alturaCm / 100, 2)).toFixed(1));
  }
  if (hasOwn(body, 'pressaoSistolica')) patientData.pressaoSistolica = toInt(body.pressaoSistolica, 120);
  if (hasOwn(body, 'pressaoDiastolica')) patientData.pressaoDiastolica = toInt(body.pressaoDiastolica, 80);
  if (hasOwn(body, 'glicemiaMgDl')) patientData.glicemiaMgDl = toNumber(body.glicemiaMgDl, 96);
  if (hasOwn(body, 'fumante')) patientData.fumante = toBoolean(body.fumante, false);
  if (hasOwn(body, 'colesterolAlto')) patientData.colesterolAlto = toBoolean(body.colesterolAlto, false);
  if (hasOwn(body, 'atividadeFisica')) patientData.atividadeFisica = toBoolean(body.atividadeFisica, true);
  if (hasOwn(body, 'historicoAvc')) patientData.historicoAvc = toBoolean(body.historicoAvc, false);
  if (hasOwn(body, 'doencaCardiaca')) patientData.doencaCardiaca = toBoolean(body.doencaCardiaca, false);
  if (hasOwn(body, 'consomeFrutas')) patientData.consomeFrutas = toBoolean(body.consomeFrutas, true);
  if (hasOwn(body, 'consomeVegetais')) patientData.consomeVegetais = toBoolean(body.consomeVegetais, true);
  if (hasOwn(body, 'dificuldadeCaminhar')) patientData.dificuldadeCaminhar = toBoolean(body.dificuldadeCaminhar, false);
  if (hasOwn(body, 'diabetes')) patientData.diabetes = toBoolean(body.diabetes, false);
  if (hasOwn(body, 'consumoAlcoolDoses')) patientData.consumoAlcoolDoses = toInt(body.consumoAlcoolDoses, 0);
  if (hasOwn(body, 'estadoGeralSaude')) patientData.estadoGeralSaude = body.estadoGeralSaude;

  return patientData;
}

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      include: { doctorProfile: true, patientProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Conta nao encontrada.' });
    }

    return res.json(mapAccount(user));
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao carregar conta.' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      include: { doctorProfile: true, patientProfile: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'Conta nao encontrada.' });
    }

    const userData = {};
    const nextName = String(req.body.name || req.body.nome || '').trim();
    const nextEmail = normalizeEmail(req.body.email);

    if (nextName) userData.name = nextName;
    if (nextEmail) userData.email = nextEmail;

    const doctorData = {};
    if (req.body.telefone !== undefined) doctorData.telefone = String(req.body.telefone || '').trim();
    if (req.body.crm !== undefined) doctorData.crm = String(req.body.crm || '').trim();
    if (req.body.especialidade !== undefined) doctorData.especialidade = String(req.body.especialidade || '').trim();
    if (req.body.clinica !== undefined) doctorData.clinica = String(req.body.clinica || '').trim();

    if (currentUser.role === 'DOCTOR' && Object.keys(doctorData).length > 0) {
      if (!currentUser.doctorProfile) {
        return res.status(404).json({ error: 'Perfil medico nao encontrado.' });
      }

      if (!doctorData.crm && req.body.crm !== undefined) {
        return res.status(400).json({ error: 'CRM nao pode ficar vazio.' });
      }

      await prisma.doctorProfile.update({
        where: { userId: currentUser.id },
        data: doctorData,
      });
    }

    const patientData = buildPatientData(req.body);
    if (currentUser.role === 'PATIENT' && Object.keys(patientData).length > 0) {
      if (!currentUser.patientProfile) {
        return res.status(404).json({ error: 'Perfil do paciente nao encontrado.' });
      }

      await prisma.patientProfile.update({
        where: { userId: currentUser.id },
        data: patientData,
      });
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: userData,
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { doctorProfile: true, patientProfile: true },
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'Conta nao encontrada apos atualizacao.' });
    }

    const token = signAuthToken(updatedUser);

    return res.json({
      account: mapAccount(updatedUser),
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
      return res.status(409).json({ error: 'Ja existe conta com e-mail ou CRM informado.' });
    }

    return res.status(500).json({ error: 'Falha ao atualizar conta.' });
  }
};
