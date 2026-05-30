const { prisma } = require('../lib/prisma');
const { toNumber } = require('../utils/parsers');

function mapRiskLevel(probability) {
  if (probability >= 0.66) return 'ALTO';
  if (probability >= 0.33) return 'MEDIO';
  return 'BAIXO';
}

function validateSecret(req) {
  const expected = process.env.AI_WEBHOOK_SECRET;
  if (!expected) return true;
  const provided = req.headers['x-ai-secret'];
  return provided === expected;
}

exports.receiveAiResult = async (req, res) => {
  try {
    if (!validateSecret(req)) {
      return res.status(401).json({ error: 'Webhook nao autorizado.' });
    }

    const { requestId, status, result, error } = req.body || {};

    if (!requestId) {
      return res.status(400).json({ error: 'requestId e obrigatorio.' });
    }

    const current = await prisma.healthAnalysisRequest.findUnique({ where: { id: String(requestId) } });

    if (!current) {
      return res.status(404).json({ error: 'Solicitacao nao encontrada.' });
    }

    const nextStatus = status === 'FAILED' ? 'FAILED' : 'DONE';

    const updated = await prisma.healthAnalysisRequest.update({
      where: { id: current.id },
      data: {
        status: nextStatus,
        result: result || null,
        error: error ? String(error) : null,
        completedAt: new Date(),
      },
    });

    if (nextStatus === 'DONE' && updated.patientUserId && result) {
      const probability = toNumber(result.prob_com_diabetes ?? result.probabilidade ?? result.probability, 0);
      const riskLevel = result.risk_level || result.riskLevel || mapRiskLevel(probability);

      await prisma.patientProfile.update({
        where: { userId: updated.patientUserId },
        data: {
          risco: riskLevel,
          probabilidadeRisco: clampProbability(probability),
        },
      }).catch(() => null);

      await prisma.healthRecord.create({
        data: {
          patientUserId: updated.patientUserId,
          patientProfileId: updated.patientProfileId || null,
          type: 'predicao_risco',
          value: clampProbability(probability),
          unit: 'prob',
          notes: `Risco ${riskLevel}.`,
          recordedAt: new Date(),
        },
      }).catch(() => null);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao receber webhook da IA:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

function clampProbability(value) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
