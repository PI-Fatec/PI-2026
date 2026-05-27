const { prisma } = require('../lib/prisma');
const { signAuthToken } = require('../services/tokenService');
const { normalizeEmail } = require('../utils/parsers');

function mapAccount(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    doctorProfile: user.doctorProfile
      ? {
          id: user.doctorProfile.id,
          telefone: user.doctorProfile.telefone,
          crm: user.doctorProfile.crm,
          especialidade: user.doctorProfile.especialidade,
          clinica: user.doctorProfile.clinica,
          status: user.doctorProfile.status,
        }
      : null,
  };
}

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      include: { doctorProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Conta nao encontrada.' });
    }

    return res.json(mapAccount(user));
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao carregar conta.' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      include: { doctorProfile: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'Conta nao encontrada.' });
    }

    const userData = {};
    const nextName = String(req.body.name || req.body.nome || '').trim();
    const nextEmail = normalizeEmail(req.body.email);

    if (nextName) userData.name = nextName;
    if (nextEmail) userData.email = nextEmail;

    const doctorData = {};
    if (req.body.telefone !== undefined) doctorData.telefone = String(req.body.telefone || '').trim();
    if (req.body.crm !== undefined) doctorData.crm = String(req.body.crm || '').trim();
    if (req.body.especialidade !== undefined) doctorData.especialidade = String(req.body.especialidade || '').trim();
    if (req.body.clinica !== undefined) doctorData.clinica = String(req.body.clinica || '').trim();

    if (currentUser.role === 'DOCTOR' && Object.keys(doctorData).length > 0) {
      if (!currentUser.doctorProfile) {
        return res.status(404).json({ error: 'Perfil medico nao encontrado.' });
      }

      if (!doctorData.crm && req.body.crm !== undefined) {
        return res.status(400).json({ error: 'CRM nao pode ficar vazio.' });
      }

      await prisma.doctorProfile.update({
        where: { userId: currentUser.id },
        data: doctorData,
      });
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: userData,
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { doctorProfile: true },
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'Conta nao encontrada apos atualizacao.' });
    }

    const token = signAuthToken(updatedUser);

    return res.json({
      account: mapAccount(updatedUser),
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ja existe conta com e-mail ou CRM informado.' });
    }

    return res.status(500).json({ error: 'Falha ao atualizar conta.' });
  }
};
