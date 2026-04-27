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

async function sendInviteEmail({ to, role, inviterName, webUrl, appOpenUrl, deepLinkUrl }) {
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
        <a href="${appOpenUrl}" style="background: #0f172a; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">Concluir no App</a>
      </div>
      <div style="margin-top: 16px; border: 1px solid #d9e2ef; border-radius: 8px; padding: 12px; background: #f8fbff;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Se o botao "Concluir no App" nao abrir:</strong></p>
        <p style="margin: 0 0 8px 0; font-size: 14px;">1. Abra o app HealthTrack no celular.</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;">2. Copie e cole este link no navegador do celular:</p>
        <p style="margin: 0; font-size: 13px; word-break: break-all; color: #0f172a;"><code>${deepLinkUrl}</code></p>
      </div>
      <p>Este link expira em 24 horas e so pode ser usado uma vez.</p>
    </div>
  `;

  const text = `
Convite de acesso - HealthTrack AI

Voce recebeu um convite para criar sua conta como ${readableRole}.
Responsavel pelo convite: ${inviterName}.

Concluir no Portal Web:
${webUrl}

Concluir no App:
${appOpenUrl}

Se o cliente de e-mail bloquear o clique no link do app, copie e cole o link acima no navegador do celular.
Este link expira em 24 horas e so pode ser usado uma vez.
  `.trim();

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Convite de acesso ao HealthTrack AI',
    html,
    text,
  });
}

module.exports = {
  sendInviteEmail,
};
