const express = require('express');
const inviteController = require('../controllers/inviteController');
const { requireAuth, requireRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/doctors', requireAuth, requireRoles('ADMIN'), inviteController.inviteDoctor);
router.post('/patients', requireAuth, requireRoles('DOCTOR'), inviteController.invitePatient);
router.get('/validate', inviteController.validateInvite);
router.post('/accept', inviteController.acceptInvite);

module.exports = router;
