const express = require('express');
const patientController = require('../controllers/patientController');
const { requireAuth, requireRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requireRoles('ADMIN', 'DOCTOR'), patientController.listPatients);
router.get('/:id', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), patientController.getPatientById);
router.put('/:id', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), patientController.updatePatient);
router.delete('/:id', requireAuth, requireRoles('ADMIN', 'DOCTOR'), patientController.removePatient);

module.exports = router;
