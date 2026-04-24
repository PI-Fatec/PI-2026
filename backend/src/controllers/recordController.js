const { prisma } = require('../lib/prisma');

exports.listRecords = async (req, res) => {
  try {
    const requestedPatientId = req.query.patientUserId ? String(req.query.patientUserId) : null;

    const patientUserId = req.auth.role === 'PATIENT' ? req.auth.userId : requestedPatientId;

    if (!patientUserId) {
      return res.status(400).json({ error: 'patientUserId e obrigatorio para este perfil.' });
    }

    const records = await prisma.healthRecord.findMany({
      where: { patientUserId },
      orderBy: { recordedAt: 'desc' },
    });

    return res.json(records);
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao listar registros.' });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const requestedPatientId = req.body.patientUserId ? String(req.body.patientUserId) : null;
    const patientUserId = req.auth.role === 'PATIENT' ? req.auth.userId : requestedPatientId;

    if (!patientUserId) {
      return res.status(400).json({ error: 'patientUserId e obrigatorio para este perfil.' });
    }

    const profile = await prisma.patientProfile.findUnique({ where: { userId: patientUserId } });

    const record = await prisma.healthRecord.create({
      data: {
        patientUserId,
        patientProfileId: profile?.id,
        type: req.body.type,
        value: Number(req.body.value),
        unit: String(req.body.unit || ''),
        notes: String(req.body.notes || ''),
        recordedAt: req.body.recordedAt ? new Date(req.body.recordedAt) : new Date(),
      },
    });

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao criar registro.' });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const id = String(req.params.id || '');
    const current = await prisma.healthRecord.findUnique({ where: { id } });

    if (!current) {
      return res.status(404).json({ error: 'Registro nao encontrado.' });
    }

    if (req.auth.role === 'PATIENT' && current.patientUserId !== req.auth.userId) {
      return res.status(403).json({ error: 'Sem permissao para editar este registro.' });
    }

    const updated = await prisma.healthRecord.update({
      where: { id },
      data: {
        ...(req.body.type ? { type: req.body.type } : {}),
        ...(req.body.value !== undefined ? { value: Number(req.body.value) } : {}),
        ...(req.body.unit !== undefined ? { unit: String(req.body.unit) } : {}),
        ...(req.body.notes !== undefined ? { notes: String(req.body.notes) } : {}),
        ...(req.body.recordedAt ? { recordedAt: new Date(req.body.recordedAt) } : {}),
      },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao atualizar registro.' });
  }
};

exports.removeRecord = async (req, res) => {
  try {
    const id = String(req.params.id || '');
    const current = await prisma.healthRecord.findUnique({ where: { id } });

    if (!current) {
      return res.status(404).json({ error: 'Registro nao encontrado.' });
    }

    if (req.auth.role === 'PATIENT' && current.patientUserId !== req.auth.userId) {
      return res.status(403).json({ error: 'Sem permissao para excluir este registro.' });
    }

    await prisma.healthRecord.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao excluir registro.' });
  }
};
