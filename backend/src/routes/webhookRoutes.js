const express = require('express');
const router = express.Router();
const aiWebhookController = require('../controllers/aiWebhookController');

router.post('/ai-results', aiWebhookController.receiveAiResult);

module.exports = router;
