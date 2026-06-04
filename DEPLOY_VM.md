# Deploy HealthTrack AI na VM

Este guia descreve o fluxo para subir backend, banco, RabbitMQ e IA em uma VM, além de configurar web na Vercel e mobile apontando para a API.

## 1. Preparar a VM

Instale Docker e Docker Compose:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
```

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd PI-2026
```

## 2. Configurar o `.env` do backend

Crie o arquivo:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Na VM usando Docker Compose, deixe as conexões internas assim:

```env
PORT=3000
DATABASE_URL="postgresql://healthtrack:healthtrack@postgres:5432/healthtrack?schema=public"
RABBITMQ_URL="amqp://rabbitmq:5672"
RABBITMQ_HEALTH_QUEUE="health_data_queue"
JWT_SECRET="troque-por-uma-chave-grande-e-secreta"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="HealthTrack AI <seu-email@gmail.com>"

AI_WEBHOOK_SECRET="mesmo-segredo-usado-na-ia"
```

Importante:

- Não envie `.env` para o Git.
- O `.env` deve ser enviado manualmente para a VM ou configurado no provedor.
- `AI_WEBHOOK_SECRET` no backend precisa ser igual ao segredo usado pela IA.
- Se usar Gmail, `SMTP_PASS` deve ser senha de app, não a senha normal da conta.

## 3. Configurar o `.env` da IA

Crie o arquivo:

```bash
cp IA/.env.example IA/.env
nano IA/.env
```

Para rodar a IA dentro do Docker Compose, use:

```env
RABBITMQ_URL="amqp://rabbitmq:5672"
RABBITMQ_HEALTH_QUEUE="health_data_queue"
BACKEND_AI_WEBHOOK_URL="http://backend:3000/api/webhooks/ai-results"
AI_WEBHOOK_SECRET="mesmo-segredo-usado-no-backend"
```

## 4. Subir containers na VM

Entre na pasta do backend, onde está o `docker-compose.yml`:

```bash
cd backend
docker compose up -d --build
```

Esse comando sobe:

- Postgres
- RabbitMQ
- Backend
- IA worker

O backend executa automaticamente:

```bash
npx prisma generate
npx prisma db push --accept-data-loss
```

## 5. Conferir se está tudo rodando

Veja os containers:

```bash
docker compose ps
```

Veja os logs:

```bash
docker compose logs -f backend
docker compose logs -f ai-worker
docker compose logs -f rabbitmq
```

Teste o backend:

```bash
curl http://IP_DA_VM:3000/api/healthz
```

Teste a IA:

```bash
curl http://IP_DA_VM:8000/healthz
```

## 6. Acessar RabbitMQ

Painel:

```text
http://IP_DA_VM:15672
```

Login padrão, se não foi alterado:

```text
usuario: guest
senha: guest
```

Observação: em produção, o ideal é criar um usuário próprio para o RabbitMQ e não expor a porta `15672` publicamente.

## 7. Configurar o web na Vercel

Na Vercel, configure a variável de ambiente do projeto web:

```env
NEXT_PUBLIC_API_BASE_URL=http://IP_DA_VM:3000
```

Se tiver domínio com HTTPS, prefira:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.seudominio.com
```

Depois faça o deploy normalmente pela Vercel.

Para testar build local do web:

```bash
cd frontend/clinical-web
npm install
npm run build
```

## 8. Configurar o mobile

No app mobile, configure:

```bash
cd frontend/client-app
nano .env.local
```

Use:

```env
EXPO_PUBLIC_API_BASE_URL=http://IP_DA_VM:3000
```

Se o app for testado fora da rede local, não use `localhost`. Use o IP público da VM ou domínio.

## 9. Testar fluxo completo

1. Acesse o web.
2. Cadastre ou edite um paciente com os campos clínicos.
3. Clique para solicitar análise de IA.
4. O backend deve registrar nos logs que enviou dados para a fila.
5. O RabbitMQ deve receber mensagem na fila `health_data_queue`.
6. A IA worker deve consumir a mensagem.
7. A IA deve chamar o webhook do backend.
8. O paciente deve aparecer com risco atualizado no web/mobile.

Comandos úteis para acompanhar:

```bash
cd backend
docker compose logs -f backend ai-worker rabbitmq
```

## 10. Atualizar deploy depois de mudar código

Na VM:

```bash
cd PI-2026
git pull
cd backend
docker compose up -d --build
```

Não use este comando se quiser manter os dados:

```bash
docker compose down -v
```

O `-v` remove volumes, incluindo o banco Postgres.

Pode usar:

```bash
docker compose down
docker compose up -d --build
```

Assim os containers são recriados, mas o volume do banco é mantido.
