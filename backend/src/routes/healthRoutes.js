const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
// const authMiddleware = require('../middlewares/authMiddleware'); // Omitido para simplificar agora

router.post('/indicators', healthController.createIndicator);

module.exports = router;