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
4. Adequação à LGPD  
5. Disponibilidade mínima de 99%  
6. Escalabilidade para múltiplos usuários  
7. Persistência de dados e logs  
8. Explicabilidade dos modelos de IA  

## Prototipo do frontend (Figma)

- Link do design: [HealtrackAi no Figma](https://www.figma.com/design/oK361aGZKi5FkkehAJ6Oq7/HealtrackAi?node-id=0-1&p=f)

## Base de Dados

O projeto utiliza a seguinte base de dados para treinamento e análise de modelos preditivos:

https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset/data?select=diabetes_012_health_indicators_BRFSS2015.csv

## Diagramas da apresentacao

### 1) Modelo conceitual de dominio

Representa os principais relacionamentos do negocio:

- Paciente pertence a uma clinica.
- Paciente pode ser atendido por medico(s).
- Paciente possui prontuario.
- Paciente registra glicemia, pressao e alimentacao.
- Paciente possui historico de exames e resultados de risco (IA).

![Modelagem Conceitual](https://github.com/user-attachments/assets/9ca41301-8743-4db5-89ff-483b45bdad91)


### 2) Casos de uso, arquitetura e fluxo de mensageria

O conjunto abaixo resume o comportamento fim a fim da solucao:

- Casos de uso por ator (Paciente, Medico, Administrador e IA).
- Arquitetura com app do paciente, backend, fila RabbitMQ, banco e servico de IA/ML.
- Fluxo assincrono: novo registro -> fila -> IA -> score de risco -> atualizacao de painel/alertas.

<img width="1536" height="727" alt="Modelagem Inicial" src="https://github.com/user-attachments/assets/b54578cc-2429-4ba3-a6ef-176ea289b7bd" />


### 3) Modelo logico de dados

Diagrama de banco com entidades de autenticacao, cadastro clinico e analitica:

- Base de usuarios e perfis: `usuario`, `medico`, `clinica`, `paciente`.
- Registro clinico: `prontuario`, `glicemia`, `pressao_arterial`, `alimentacao`, `exame`.
- IA e eventos: `predicao_risco`, `dataset_ia`, `evento_mensageria`.

![Modelagem Logica](https://github.com/user-attachments/assets/3fa8deae-4760-4c96-b5e7-6371c927ac9d)


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
