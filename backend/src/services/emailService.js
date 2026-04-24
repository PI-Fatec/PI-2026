const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendInviteEmail({ to, role, inviterName, webUrl, deepLinkUrl }) {
  const readableRole = role === 'DOCTOR' ? 'medico' : 'cliente';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2>Convite de acesso - HealthTrack AI</h2>
      <p>Voce recebeu um convite para criar sua conta como <strong>${readableRole}</strong>.</p>
      <p>Responsavel pelo convite: <strong>${inviterName}</strong>.</p>
      <p>Escolha como deseja continuar:</p>
      <div style="margin: 20px 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${webUrl}" style="background: #1d4ed8; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">Concluir no Portal Web</a>
        <a href="${deepLinkUrl}" style="background: #0f172a; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">Concluir no App</a>
      </div>
      <p>Este link expira em 24 horas e so pode ser usado uma vez.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Convite de acesso ao HealthTrack AI',
    html,
  });
}

module.exports = {
  sendInviteEmail,
};
