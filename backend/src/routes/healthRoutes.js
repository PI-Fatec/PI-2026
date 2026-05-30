const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { requireAuth, requireRoles } = require('../middlewares/authMiddleware');

router.post('/analysis', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), healthController.createAnalysisRequest);
router.get('/analysis/:id', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), healthController.getAnalysisStatus);

module.exports = router;