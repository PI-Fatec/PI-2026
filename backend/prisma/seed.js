const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@healthtrack.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Administrador HealthTrack';

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: ADMIN_NAME,
      password: passwordHash,
      role: 'ADMIN',
      isActive: true,
      accountStatus: 'ACTIVE',
    },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: 'ADMIN',
      isActive: true,
      accountStatus: 'ACTIVE',
    },
  });

  console.log(`Admin seed pronto: ${ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error('Falha ao executar seed do admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
