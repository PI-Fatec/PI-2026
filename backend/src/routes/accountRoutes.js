const express = require('express');
const accountController = require('../controllers/accountController');
const { requireAuth, requireRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), accountController.getMe);
router.put('/me', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), accountController.updateMe);

module.exports = router;
