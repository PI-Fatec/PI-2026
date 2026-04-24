const express = require('express');
const doctorController = require('../controllers/doctorController');
const { requireAuth, requireRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requireRoles('ADMIN', 'DOCTOR'), doctorController.listDoctors);
router.put('/:id', requireAuth, requireRoles('ADMIN'), doctorController.updateDoctor);
router.delete('/:id', requireAuth, requireRoles('ADMIN'), doctorController.removeDoctor);

module.exports = router;
