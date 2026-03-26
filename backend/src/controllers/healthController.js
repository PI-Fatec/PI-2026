const { PrismaClient } = require('@prisma/client');
const { sendToAIQueue } = require('../services/queueService');

const prisma = new PrismaClient();

// Garanta que está escrito "exports.createIndicator"
exports.createIndicator = async (req, res) => {
  try {
    const { userId, bmi, highBloodPress } = req.body;

    const newIndicator = await prisma.healthIndicator.create({
      data: {
        userId,
        bmi,
        highBloodPress,
      },
    });

    const aiPayload = {
      indicatorId: newIndicator.id,
      userId: newIndicator.userId,
      features: { bmi, highBloodPress },
    };

    await sendToAIQueue(aiPayload);

    res.status(201).json({
      message: 'Indicadores registrados. Análise de risco em processamento pela IA.',
      data: newIndicator,
    });
  } catch (error) {
    console.error('Erro ao criar indicador:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};