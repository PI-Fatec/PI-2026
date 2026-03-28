# PI-2026 - HealthTrack AI

Projeto academico com arquitetura separada entre backend, frontend web e aplicativo mobile.

## Objetivo

Criar uma plataforma para registro de indicadores de saude, autenticacao de usuarios e analise de risco com apoio de IA.

## Base de Dados

O projeto utiliza a seguinte base de dados para treinamento e análise de modelos preditivos:

https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset/data?select=diabetes_012_health_indicators_BRFSS2015.csv

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

---

## Requisitos Funcionais

Principais funcionalidades do sistema:

1. Cadastro e login de pacientes e médicos  
2. Registro de indicadores de saúde (IMC, pressão, hábitos)  
3. Registro de hábitos alimentares e atividade física  
4. Dashboard com análise de risco  
5. Geração de alertas clínicos  
6. Treinamento de modelos supervisionados  
7. Classificação de risco (baixo, médio, alto)  
8. Clusterização de perfis comportamentais  
9. Atualização assíncrona via mensageria  

---

## Requisitos Não Funcionais

1. Interface simples e intuitiva  
2. Tempo de resposta inferior a 5 segundos  
3. Segurança com criptografia HTTPS  
4. Disponibilidade mínima de 99%  
5. Escalabilidade para múltiplos usuários  
6. Persistência de dados e logs  
7. Explicabilidade dos modelos de IA  