# ServiceDesk — Guia de Execução (Monorepo)

Este arquivo descreve como rodar o projeto localmente (Web + Mobile (Expo) + Desktop (Tauri) + Infra + Backend + ML) usando **npm workspaces**.

---

## 0) Estrutura esperada do repositório

```
PI-2026/
  apps/
    web/
    mobile/
    desktop/
  packages/
    types/
    api-client/          (opcional)
  services/
    backend/             (quando existir)
    ml/                  (quando existir)
  infra/
    docker-compose.yml
  docs/
  package.json
```

---

## 1) Pré-requisitos

### Geral
- Node.js LTS (recomendado 20+)
- npm (vem com Node)
- Git
- Docker Desktop (para Postgres/RabbitMQ)

### Mobile (Expo)
- Expo CLI (usa via `npx`/scripts; não precisa instalar global)
- Para rodar em dispositivo: app **Expo Go**
- Para rodar Android Emulator: Android Studio + SDK (opcional)

### Desktop (Tauri)
- Rust (toolchain) + Cargo
- Dependências do sistema para Tauri (variam por SO)
  - macOS: Xcode Command Line Tools

### Backend / ML (quando existirem)
- A definir 
- Python 3.11+ (FastAPI)

---

## 2) Setup inicial

Na raiz do repositório:

```bash
npm install
```

Verificar workspaces:

```bash
npm ls @servicedesk/types
```

---

## 3) Rodar Infra (Postgres + RabbitMQ)

Subir containers:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Ver status:

```bash
docker compose -f infra/docker-compose.yml ps
```

Parar:

```bash
docker compose -f infra/docker-compose.yml down
```

---

## 4) Package compartilhado: `@servicedesk/types`

Build do package:

```bash
npm -w @servicedesk/types run build
```

Verificar build:

```bash
ls packages/types/dist
```

---

## 5) Rodar Mobile (Expo)

### 5.1 Rodar (limpando cache)
Na raiz:

```bash
npm -w mobile run start -- --clear
```

Atalhos:
- Android: `npm -w mobile run android`
- iOS: `npm -w mobile run ios`
- Web (Expo): `npm -w mobile run web`

### 5.2 Observação (monorepo)
O Expo/Metro precisa do `apps/mobile/metro.config.js` para resolver `packages/*`.
Se o mobile já está rodando e importando `@servicedesk/types`, está OK.

---

## 6) Rodar Web (Next.js)

Dentro do app web:

```bash
cd apps/web
npm install
npm run dev
```

Ou via workspace (se o `package.json` do web tiver `name: "web"`):

```bash
npm -w web run dev
```

Acesse:
- `http://localhost:3000` (padrão)

---

## 7) Rodar Desktop (Tauri + React)

### 7.1 Rodar frontend (Vite)
Dentro do app desktop:

```bash
cd apps/desktop
npm install
npm run dev
```

### 7.2 Rodar Tauri
Ainda em `apps/desktop`:

```bash
npm run tauri dev
```

> Se `tauri` não estiver configurado como script, rode:
```bash
npx tauri dev
```

---

## 8) Rodar Backend () — quando existir


```

Padrão de URL (exemplo):
- `http://localhost:8080`

---

## 9) Rodar ML (FastAPI) — quando existir

```bash
cd services/ml
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
# .venv\Scripts\activate    # Windows

pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

Padrão de URL (exemplo):
- `http://localhost:8001`

---

## 10) Variáveis de ambiente (padrão sugerido)

### Mobile (Expo) — `apps/mobile/.env` (ou `app.config.ts`)
Exemplo:
- `EXPO_PUBLIC_API_BASE_URL=http://localhost:8080`

### Web (Next) — `apps/web/.env.local`
Exemplo:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`

### Desktop (Tauri) — `apps/desktop/.env`
Exemplo:
- `VITE_API_BASE_URL=http://localhost:8080`

### Backend — `services/backend/.env` (ou `application.yml`)
Exemplo:
- DB: `postgresql://localhost:5432/servicedesk`
- RabbitMQ: `amqp://localhost:5672`

---

## 11) Ordem recomendada para rodar tudo (dev)

1) Infra:
```bash
docker compose -f infra/docker-compose.yml up -d
```

2) Types:
```bash
npm -w @servicedesk/types run build
```

3) Backend:
```bash
cd services/backend && ./mvnw spring-boot:run
```

4) Mobile:
```bash
npm -w mobile run start -- --clear
```

5) Web:
```bash
npm -w web run dev
```

6) Desktop:
```bash
cd apps/desktop && npm run tauri dev
```

---

## 12) Troubleshooting rápido

### Expo: “Unable to resolve @servicedesk/types”
- Rode:
```bash
npm -w @servicedesk/types run build
npm -w mobile run start -- --clear
```
- Confirme `apps/mobile/metro.config.js` está correto.

### Expo: “Invalid hook call” / “multiple React copies”
- Confirme que `metro.config.js` está apontando para o `node_modules` da raiz do monorepo (sem duplicar React).

### Desktop Tauri não inicia
- Verifique Rust:
```bash
rustc --version
cargo --version
```
- Em macOS:
```bash
xcode-select --install
```

### Docker: portas ocupadas
- Postgres usa `5432`, RabbitMQ usa `5672` e painel `15672`
- Ajuste `infra/docker-compose.yml` se necessário.

---
