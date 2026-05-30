const { prisma } = require('../lib/prisma');
const { sendToAIQueue } = require('../services/queueService');
const { toNumber } = require('../utils/parsers');

const MODEL_FEATURES = [
  'HighBP',
  'HighChol',
  'BMI',
  'Smoker',
  'Stroke',
  'HeartDiseaseorAttack',
  'PhysActivity',
  'Fruits',
  'Veggies',
  'HvyAlcoholConsump',
  'DiffWalk',
  'Sex',
  'Age',
];

function getAgeBucket(dateValue) {
  if (!dateValue) return null;
  const birthDate = new Date(dateValue);
  if (Number.isNaN(birthDate.getTime())) return null;
  const diffMs = Date.now() - birthDate.getTime();
  const age = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));

  if (age < 25) return 1;
  if (age < 30) return 2;
  if (age < 35) return 3;
  if (age < 40) return 4;
  if (age < 45) return 5;
  if (age < 50) return 6;
  if (age < 55) return 7;
  if (age < 60) return 8;
  if (age < 65) return 9;
  if (age < 70) return 10;
  if (age < 75) return 11;
  if (age < 80) return 12;
  return 13;
}

function mapSexValue(sex) {
  if (sex === 'Masculino') return 1;
  if (sex === 'Feminino') return 0;
  return 0;
}

function normalizeFeatures(input) {
  const missing = [];
  const normalized = {};

  MODEL_FEATURES.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      normalized[key] = toNumber(input[key], 0);
    } else {
      normalized[key] = 0;
      missing.push(key);
    }
  });

  return { normalized, missing };
}

function buildFeaturesFromProfile(profile) {
  if (!profile) return null;

  const systolic = toNumber(profile.pressaoSistolica, 0);
  const diastolic = toNumber(profile.pressaoDiastolica, 0);
  const highBP = systolic >= 140 || diastolic >= 90 ? 1 : 0;
  const ageBucket = getAgeBucket(profile.dataNascimento);
  const bmi = toNumber(profile.imc, 0);

  const featureInput = {
    HighBP: highBP,
    HighChol: 0,
    BMI: bmi,
    Smoker: profile.fumante ? 1 : 0,
    Stroke: profile.historicoAvc ? 1 : 0,
    HeartDiseaseorAttack: 0,
    PhysActivity: profile.atividadeFisica ? 1 : 0,
    Fruits: 0,
    Veggies: 0,
    HvyAlcoholConsump: toNumber(profile.consumoAlcoolDoses, 0) >= 7 ? 1 : 0,
    DiffWalk: 0,
    Sex: mapSexValue(profile.sexo),
    Age: ageBucket ?? 9,
  };

  const dataQuality = [];

  if (!profile.dataNascimento) dataQuality.push('Age');
  if (!profile.imc && !profile.pesoKg && !profile.alturaCm) dataQuality.push('BMI');
  if (profile.consumoAlcoolDoses === null || profile.consumoAlcoolDoses === undefined) dataQuality.push('HvyAlcoholConsump');

  return { featureInput, dataQuality };
}

exports.createAnalysisRequest = async (req, res) => {
  try {
    const requestedByUserId = req.auth.userId;
    const requestedPatientUserId = req.auth.role === 'PATIENT'
      ? req.auth.userId
      : (req.body.patientUserId ? String(req.body.patientUserId) : req.auth.userId);

    const profile = requestedPatientUserId
      ? await prisma.patientProfile.findUnique({ where: { userId: requestedPatientUserId } })
      : null;

    const incomingFeatures = req.body.features && typeof req.body.features === 'object'
      ? req.body.features
      : null;

    let features;
    let dataQuality = [];
    let source = 'client';

    if (incomingFeatures) {
      const normalized = normalizeFeatures(incomingFeatures);
      features = normalized.normalized;
      dataQuality = normalized.missing;
    } else {
      const derived = buildFeaturesFromProfile(profile);
      if (!derived) {
        return res.status(400).json({ error: 'Informe features ou tenha um perfil de paciente valido.' });
      }
      const normalized = normalizeFeatures(derived.featureInput);
      features = normalized.normalized;
      dataQuality = [...new Set([...normalized.missing, ...derived.dataQuality])];
      source = 'profile';
    }

    const request = await prisma.healthAnalysisRequest.create({
      data: {
        patientUserId: requestedPatientUserId || null,
        patientProfileId: profile?.id || null,
        requestedByUserId,
        status: 'PENDING',
        payload: {
          features,
          dataQuality,
          source,
          model: 'diabetes-v1',
        },
      },
    });

    await sendToAIQueue({
      requestId: request.id,
      patientUserId: requestedPatientUserId || null,
      requestedByUserId,
      features,
      requestedAt: new Date().toISOString(),
    });

    await prisma.healthAnalysisRequest.update({
      where: { id: request.id },
      data: { status: 'PROCESSING' },
    });

    return res.status(202).json({
      requestId: request.id,
      status: 'PROCESSING',
      dataQuality,
    });
  } catch (error) {
    console.error('Erro ao solicitar analise de risco:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getAnalysisStatus = async (req, res) => {
  try {
    const requestId = String(req.params.id || '');
    const request = await prisma.healthAnalysisRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      return res.status(404).json({ error: 'Solicitacao nao encontrada.' });
    }

    if (req.auth.role === 'PATIENT' && request.patientUserId !== req.auth.userId) {
      return res.status(403).json({ error: 'Sem permissao para ver esta solicitacao.' });
    }

    return res.json({
      requestId: request.id,
      status: request.status,
      result: request.result,
      error: request.error,
      createdAt: request.createdAt,
      completedAt: request.completedAt,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar status.' });
  }
};