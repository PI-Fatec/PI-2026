# PI-2026 - HealthTrack AI

Projeto academico com arquitetura separada entre backend, frontend web e aplicativo mobile.

## Objetivo

Criar uma plataforma para registro de indicadores de saude, autenticacao de usuarios e analise de risco com apoio de IA.

## Visao geral para apresentacao

O HealthTrack AI centraliza o acompanhamento de pacientes com foco em prevencao e apoio a decisao clinica.

- Paciente registra dados de saude e acompanha score/alertas.
- Medico consulta pacientes e analisa risco.
- Administrador gerencia usuarios e monitora o sistema.
- Modulo de IA gera score de risco e identifica perfis.

## Stack do projeto

- Backend: Node.js + Express + Prisma + PostgreSQL + RabbitMQ
- Frontend Web: Next.js
- Frontend Mobile: React Native / Expo

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL
- RabbitMQ (opcional para fluxo de IA legado)

## Configuracao do backend

1. Entre na pasta do backend:

```bash
cd backend
```

2. Instale as dependencias:

```bash
npm install
```

3. Configure o arquivo `.env`:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/healthtrack?schema=public"
JWT_SECRET="sua_chave_secreta_super_segura"

# SMTP real para convites
SMTP_HOST="smtp.seuprovedor.com"
SMTP_PORT=587
SMTP_USER="usuario_smtp"
SMTP_PASS="senha_smtp"
SMTP_FROM="HealthTrack AI <no-reply@seudominio.com>"

# Links de convite
WEB_BASE_URL="http://localhost:3001"
MOBILE_DEEP_LINK_BASE="clientapp://invite"
```

4. Rode as migracoes do Prisma:

```bash
npx prisma migrate dev
```

5. Gere o client do Prisma (se necessario):

```bash
npx prisma generate
```

6. Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
```

Servidor padrao: http://localhost:3000

## Rotas principais (backend)

- `POST /api/auth/login`
- `POST /api/auth/register/self`
- `POST /api/invites/doctors` (ADMIN)
- `POST /api/invites/patients` (DOCTOR)
- `GET /api/invites/validate?token=...`
- `POST /api/invites/accept`
- `GET /api/doctors`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`
- `GET /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`
- `GET /api/records`
- `POST /api/records`
- `PUT /api/records/:id`
- `DELETE /api/records/:id`

## Scripts disponiveis no backend

- `npm run dev`: inicia o servidor com nodemon
