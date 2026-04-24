const { prisma } = require('../lib/prisma');

function mapDoctor(item) {
  return {
    id: item.id,
    nome: item.user.name,
    email: item.user.email,
    telefone: item.telefone,
    crm: item.crm,
    especialidade: item.especialidade,
    clinica: item.clinica,
    status: item.status,
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt,
  };
}

exports.listDoctors = async (req, res) => {
  try {
    const { busca = '', status = 'TODOS', clinica = '' } = req.query;

    const doctors = await prisma.doctorProfile.findMany({
      where: {
        ...(status !== 'TODOS' ? { status } : {}),
        ...(clinica ? { clinica: { equals: String(clinica), mode: 'insensitive' } } : {}),
        ...(busca
          ? {
              OR: [
                { crm: { contains: String(busca), mode: 'insensitive' } },
                { user: { name: { contains: String(busca), mode: 'insensitive' } } },
                { user: { email: { contains: String(busca), mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return res.json(doctors.map(mapDoctor));
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao listar medicos.' });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const id = String(req.params.id || '');

    const updated = await prisma.doctorProfile.update({
      where: { id },
      data: {
        telefone: req.body.telefone,
        crm: req.body.crm,
        especialidade: req.body.especialidade,
        clinica: req.body.clinica,
        status: req.body.status,
        user: {
          update: {
            name: req.body.nome,
            email: req.body.email,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return res.json(mapDoctor(updated));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ja existe medico com dados unicos informados.' });
    }

    return res.status(500).json({ error: 'Falha ao atualizar medico.' });
  }
};

exports.removeDoctor = async (req, res) => {
  try {
    const id = String(req.params.id || '');

    const doctor = await prisma.doctorProfile.findUnique({ where: { id } });

    if (!doctor) {
      return res.status(404).json({ error: 'Medico nao encontrado.' });
    }

    await prisma.user.delete({
      where: {
        id: doctor.userId,
      },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao remover medico.' });
  }
};
