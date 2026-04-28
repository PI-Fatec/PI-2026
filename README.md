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

## Prototipo do frontend (Figma)

- Link do design: [HealtrackAi no Figma](https://www.figma.com/design/oK361aGZKi5FkkehAJ6Oq7/HealtrackAi?node-id=0-1&p=f)

## Base de Dados

O projeto utiliza a seguinte base de dados para treinamento e análise de modelos preditivos:

https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset/data?select=diabetes_012_health_indicators_BRFSS2015.csv

## Stack do projeto

- Backend: Node.js + Express + Prisma + PostgreSQL + RabbitMQ
- Frontend Web: Next.js
- Frontend Mobile: React Native / Expo

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL
- RabbitMQ (opcional para fluxo de IA legado)

## Requisitos Funcionais

Principais funcionalidades do sistema:

1. Cadastro e login de pacientes e médicos  
2. Registro de indicadores de saúde (IMC, pressão, hábitos)  
3. Dashboard com análise de risco  
4. Geração de alertas clínicos  
5. Treinamento de modelo supervisionado
6. Classificação de risco (baixo, médio, alto)  
7. Clusterização de perfis comportamentais

## Requisitos Não Funcionais

1. Interface simples e intuitiva  
2. Tempo de resposta inferior a 5 segundos  
3. Segurança com criptografia HTTPS  
4. Disponibilidade mínima de 99%  
3. Escalabilidade para múltiplos usuários  
2. Persistência de dados e logs  
1. Explicabilidade dos modelos de IA

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

6. Rode a seed do admin padrao:

```bash
npx prisma db seed
```

Credenciais iniciais:

- E-mail: `admin@healthtrack.com`
- Senha: `admin123`

7. Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
```

Servidor padrao: http://localhost:3000

## Backend com Docker

1. Entre na pasta do backend:

```bash
cd backend
```

2. Garanta que o `.env` tenha os hosts dos servicos Docker:

```env
DATABASE_URL="postgresql://healthtrack:healthtrack@postgres:5432/healthtrack?schema=public"
RABBITMQ_URL="amqp://rabbitmq:5672"
```

3. Suba os containers:

```bash
docker compose up --build
```

Esse fluxo ja executa `prisma db seed` no startup do backend para garantir o admin padrao.

4. Para derrubar os containers:

```bash
docker compose down
```

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
- `npm run seed`: executa seed do Prisma

## Prints Web
Tela de login<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/c78efb13-faac-4477-a161-37e6cbe48578" />
Tela de cadastro<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/b8e7c8c0-9e9e-4a3a-ad51-e3407d482a88" />
Tela de dashboard<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/f3e00cb8-1d3c-4400-8fdf-9ca2167db7c1" />
Tela de gerenciar pacientes<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/79ec1bf6-4b8c-43b5-bbad-543e6b78decf" />
Tela de cadastro de pacientes<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/00786d3c-3849-4909-b1ff-adc15dd6ae05" />
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/5ee5eca8-d0e7-4c34-856e-05934f216851" />
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/2979a5d4-231d-4f05-ac93-857e33eace63" />


