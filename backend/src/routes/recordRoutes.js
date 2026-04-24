const express = require('express');
const recordController = require('../controllers/recordController');
const { requireAuth, requireRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), recordController.listRecords);
router.post('/', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), recordController.createRecord);
router.put('/:id', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), recordController.updateRecord);
router.delete('/:id', requireAuth, requireRoles('ADMIN', 'DOCTOR', 'PATIENT'), recordController.removeRecord);

module.exports = router;
