# PI-2026 - HealthTrack AI

Projeto academico com arquitetura separada entre backend, frontend web e aplicativo mobile.

## Objetivo

Criar uma plataforma para registro de indicadores de saude, autenticacao de usuarios e analise de risco com apoio de IA.

## Stack do projeto

- Backend: Node.js + Express + Prisma + PostgreSQL + RabbitMQ
- Frontend Web: Next.js
- Frontend Mobile: React Native

## Estrutura do repositorio

Atualmente o repositorio possui o backend implementado:

- backend/
  - src/
  - prisma/
  - package.json



## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL
- RabbitMQ

## Configuracao do backend

1. Entre na pasta do backend:

```bash
cd backend
```

2. Instale as dependencias:

```bash
npm install
```

3. Configure o arquivo .env (exemplo):

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/healthtrack?schema=public"
RABBITMQ_URL="amqp://localhost"
JWT_SECRET="sua_chave_secreta_super_segura"
```

4. Rode as migracoes do Prisma:

```bash
npx prisma migrate dev
```

5. Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
```

Servidor padrao: http://localhost:3000

## Rotas atuais (backend)

- POST /api/auth/register
- POST /api/auth/login
- POST /api/health/indicators


## Scripts disponiveis no backend

- npm run dev: inicia o servidor com nodemon

