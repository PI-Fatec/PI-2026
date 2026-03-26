const { PrismaClient } = require('@prisma/client');
const { sendToAIQueue } = require('../services/queueService');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

exports.createIndicator = async (req, res) => {
  try {
    const { userId, bmi, highBloodPress, highChol, smoker, physActivity, fruits, veggies } = req.body;

    // 1. Salva os dados clínicos no banco (PostgreSQL)
    const newIndicator = await prisma.healthIndicator.create({
      data: {
        userId,
        bmi,
        highBloodPress,
        highChol,
        smoker,
        physActivity,
        fruits,
        veggies
      }
    });

    // 2. Monta o payload para a IA (assíncrono)
    const aiPayload = {
      indicatorId: newIndicator.id,
      userId: newIndicator.userId,
      features: { bmi, highBloodPress, highChol, smoker, physActivity, fruits, veggies }
    };

    // 3. Envia para a fila do RabbitMQ
    await sendToAIQueue(aiPayload);

    // 4. Retorna em menos de 5 segundos conforme requisito não-funcional
    res.status(201).json({
      message: 'Indicadores registrados. Análise de risco em processamento pela IA.',
      data: newIndicator
    });

  } catch (error) {
    console.error('Erro ao criar indicador:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};