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
- Frontend Mobile: React Native

## Prototipo do frontend (Figma)

- Link do design: [HealtrackAi no Figma](https://www.figma.com/design/oK361aGZKi5FkkehAJ6Oq7/HealtrackAi?node-id=0-1&p=f)

## Diagramas da apresentacao

### 1) Modelo conceitual de dominio

Representa os principais relacionamentos do negocio:

- Paciente pertence a uma clinica.
- Paciente pode ser atendido por medico(s).
- Paciente possui prontuario.
- Paciente registra glicemia, pressao e alimentacao.
- Paciente possui historico de exames e resultados de risco (IA).

![Modelo conceitual](f2205be7-7ade-4d20-a76d-99a09e391254.jpeg)

### 2) Casos de uso, arquitetura e fluxo de mensageria

O conjunto abaixo resume o comportamento fim a fim da solucao:

- Casos de uso por ator (Paciente, Medico, Administrador e IA).
- Arquitetura com app do paciente, backend, fila RabbitMQ, banco e servico de IA/ML.
- Fluxo assincrono: novo registro -> fila -> IA -> score de risco -> atualizacao de painel/alertas.

![Casos de uso, arquitetura e fluxo](d2dc8d61-10d1-4a6c-910b-a91421853c68.jpeg)

### 3) Modelo logico de dados

Diagrama de banco com entidades de autenticacao, cadastro clinico e analitica:

- Base de usuarios e perfis: `usuario`, `medico`, `clinica`, `paciente`.
- Registro clinico: `prontuario`, `glicemia`, `pressao_arterial`, `alimentacao`, `exame`.
- IA e eventos: `predicao_risco`, `dataset_ia`, `evento_mensageria`.

![Modelo logico do banco](9759f911-806a-452e-b508-8993525f7e13.jpeg)

## Estrutura do repositorio

Atualmente o repositorio possui o backend implementado:

- backend/
  - src/
  - prisma/
  - package.json

Estrutura alvo do projeto:

- backend/
- frontend-web/ (Next.js)
- mobile/ (React Native)

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

