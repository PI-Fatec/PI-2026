# Backend — API de Ordens de Serviço (OS)
Documentação **somente do backend**: endpoints, regras de autorização (RBAC) e mensageria com workers.

---

## 1) Visão geral do backend
O backend fornece:
- Autenticação (JWT)
- API REST para Ordens de Serviço (OS)
- Persistência em banco (ex.: PostgreSQL)
- Regras de autorização (roles)
- Registro de histórico de status
- **Mensageria** (eventos de domínio) + **workers consumidores** para processamento assíncrono
- Realtime para clientes (SSE ou WebSocket) com base em eventos do sistema

---

## 2) Autenticação
- Header obrigatório (rotas protegidas):  
  `Authorization: Bearer <accessToken>`
- Tokens:
  - `accessToken` (curta duração)
  - `refreshToken` (renovação)

---

## 3) Regras de autorização (RBAC)

### 3.1 Roles
- **ADMIN**
  - Controle total: usuários + todas as OS + operações administrativas
- **MANAGER**
  - Gerencia OS (criar/editar/atribuir/mudar status) e consulta relatórios
- **TECH**
  - Acessa **apenas OS atribuídas a ele** (padrão)
  - Pode mudar status dentro das regras e anexar/registrar comentários

> Escopo TECH: `orders.assignee_id == user.id` (ownership)

### 3.2 Matriz de permissões (resumo)
**Usuários**
- `GET /users/me`: ADMIN, MANAGER, TECH
- `GET /users` (listar técnicos): ADMIN, MANAGER
- `POST /users` (opcional): ADMIN
- `PATCH /users/:id` (opcional): ADMIN

**Ordens (OS)**
- `GET /orders`: ADMIN/MANAGER (todas), TECH (apenas atribuídas)
- `POST /orders`: ADMIN/MANAGER (TECH opcional)
- `GET /orders/:id`: ADMIN/MANAGER; TECH (se atribuída)
- `PATCH /orders/:id`: ADMIN/MANAGER
- `POST /orders/:id/assign`: ADMIN/MANAGER
- `POST /orders/:id/status`: ADMIN/MANAGER; TECH (se atribuída)
- `GET /orders/:id/history`: ADMIN/MANAGER; TECH (se atribuída)

**Anexos**
- `POST /orders/:id/attachments`: ADMIN/MANAGER; TECH (se atribuída)
- `GET /orders/:id/attachments`: ADMIN/MANAGER; TECH (se atribuída)

**Realtime**
- `GET /events` (SSE) ou `WS /realtime`: autenticado (filtrado por role/escopo)

### 3.3 Regras de transição de status
Status: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `PAUSED`, `DONE`, `CANCELED`

Transições sugeridas:
- `OPEN` → `ASSIGNED` (ADMIN/MANAGER)
- `ASSIGNED` → `IN_PROGRESS` (TECH da OS, ADMIN/MANAGER)
- `IN_PROGRESS` → `PAUSED` (TECH da OS, ADMIN/MANAGER)
- `PAUSED` → `IN_PROGRESS` (TECH da OS, ADMIN/MANAGER)
- `IN_PROGRESS` → `DONE` (TECH da OS, ADMIN/MANAGER)
- `OPEN|ASSIGNED|IN_PROGRESS|PAUSED` → `CANCELED` (ADMIN/MANAGER)

Regras adicionais:
- Toda mudança de status deve criar registro em `order_status_history`
- Transição inválida retorna `409 Conflict`

---

## 4) Mensageria

### 4.1 Objetivo
A mensageria desacopla ações assíncronas do request HTTP:
- notificações (push/email)
- monitoramento/alertas de SLA
- integração com Mineração/ML (serviço Python)
- auditoria e atualização realtime

### 4.2 Estratégia recomendada: Outbox Pattern
1) API grava a alteração no banco (ex.: cria OS / muda status)
2) Na **mesma transação**, grava um registro em `outbox_events` com status `PENDING`
3) Um worker (Outbox Publisher) publica o evento no broker
4) Marca evento como `SENT` (ou `FAILED` com tentativas e erro)

Benefícios:
- Evita perder eventos quando o broker está fora
- Garante consistência entre BD e publicação de eventos

### 4.3 Eventos de domínio
Eventos publicados (exchange/topic `os.events` ou equivalente):
- `ORDER_CREATED`
- `ORDER_ASSIGNED`
- `ORDER_STATUS_CHANGED`
- `ORDER_ATTACHMENT_ADDED`
- `SLA_DUE_SOON`
- `SLA_BREACHED`
- `ML_PREDICTION_REQUESTED`
- `ML_PREDICTION_READY`

Payload base (exemplo):
```json
{
  "eventId": "uuid",
  "type": "ORDER_STATUS_CHANGED",
  "occurredAt": "2026-02-19T12:00:00Z",
  "orderId": "uuid",
  "actorId": "uuid",
  "data": {
    "fromStatus": "ASSIGNED",
    "toStatus": "IN_PROGRESS",
    "note": "Iniciando atendimento"
  }
}
```

---

## 5) Workers (papéis e responsabilidades)

### 5.1 Outbox Publisher Worker (obrigatório se usar Outbox)
**Responsabilidade:** publicar eventos `PENDING` da tabela `outbox_events` no broker.
- Input: `outbox_events (PENDING)`
- Output: broker (`os.events`)
- Side effects: atualiza `outbox_events` para `SENT` ou `FAILED`

### 5.2 Notification Worker
**Responsabilidade:** notificar mudanças relevantes.
- Consome: `ORDER_ASSIGNED`, `SLA_DUE_SOON`, `SLA_BREACHED`
- Ações: enviar push/email/alerta (pode ser simulado no projeto)
- Persistência opcional: `notifications` (se quiser histórico)

### 5.3 SLA Worker
**Responsabilidade:** avaliar prazos e gerar eventos de SLA.
- Consome: `ORDER_CREATED`, `ORDER_STATUS_CHANGED`
- Lógica:
  - calcula se a OS está perto de estourar (`SLA_DUE_SOON`)
  - detecta estouro (`SLA_BREACHED`)
- Publica: `SLA_DUE_SOON`, `SLA_BREACHED`

### 5.4 ML Orchestrator Worker (ponte com Python)
**Responsabilidade:** integrar com o serviço de mineração/ML.
- Consome: `ML_PREDICTION_REQUESTED` (ou decide com base em `ORDER_CREATED/STATUS_CHANGED`)
- Ações:
  - monta features
  - chama serviço Python (ex.: FastAPI `/predict`)
  - salva resultado (ex.: `orders_prediction` ou campos na OS)
- Publica: `ML_PREDICTION_READY`

### 5.5 Realtime Gateway (SSE/WS)
**Responsabilidade:** entregar eventos para clientes em tempo real.
- Fonte:
  - diretamente do broker, ou
  - de um stream interno que recebe eventos do broker
- Filtragem:
  - ADMIN/MANAGER: recebem tudo
  - TECH: recebem apenas eventos das OS atribuídas

---

## 6) Endpoints (REST)

### 6.1 Auth
#### POST `/auth/login`
Acesso: público  
Body:
```json
{ "email": "user@exemplo.com", "password": "senha" }
```
200:
```json
{ "accessToken": "...", "refreshToken": "...", "expiresIn": 3600 }
```

#### POST `/auth/refresh`
Acesso: público  
Body:
```json
{ "refreshToken": "..." }
```
200:
```json
{ "accessToken": "...", "refreshToken": "...", "expiresIn": 3600 }
```

#### POST `/auth/logout` (opcional)
Acesso: autenticado  
Invalida refresh token (conforme implementação).

---

### 6.2 Users
#### GET `/users/me`
Acesso: ADMIN, MANAGER, TECH  
200:
```json
{ "id":"...", "name":"...", "email":"...", "role":"TECH" }
```

#### GET `/users?role=TECH&isActive=true&search=jo`
Acesso: ADMIN, MANAGER  
Lista usuários (principalmente técnicos).

#### POST `/users` (opcional)
Acesso: ADMIN  
Cria usuário.

#### PATCH `/users/:id` (opcional)
Acesso: ADMIN  
Atualiza usuário (nome, role, ativo).

---

### 6.3 Orders
#### GET `/orders`
Acesso:
- ADMIN/MANAGER: todas
- TECH: apenas atribuídas  
Query (exemplos):
- `status=OPEN`
- `priority=HIGH`
- `category=TI`
- `assigneeId=<uuid>`
- `createdFrom=2026-02-01&createdTo=2026-02-19`
- `page=1&pageSize=20&sort=-createdAt`

200:
```json
{
  "data": [
    {
      "id":"...",
      "title":"Impressora não imprime",
      "category":"TI",
      "priority":"MEDIUM",
      "status":"ASSIGNED",
      "assignee": { "id":"...", "name":"..." },
      "dueAt":"2026-03-01T12:00:00Z",
      "createdAt":"2026-02-19T12:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 123
}
```

#### POST `/orders`
Acesso: ADMIN, MANAGER (TECH opcional)  
Body:
```json
{
  "title": "Impressora não imprime",
  "description": "Erro no driver",
  "category": "TI",
  "priority": "MEDIUM",
  "customerName": "Fulano",
  "locationText": "Sala 02",
  "dueAt": "2026-03-01T12:00:00Z"
}
```
201:
```json
{ "id":"..." }
```
Mensageria: `ORDER_CREATED` (via Outbox)

#### GET `/orders/:id`
Acesso: ADMIN/MANAGER; TECH se atribuída  
200:
```json
{
  "id":"...",
  "title":"...",
  "description":"...",
  "category":"TI",
  "priority":"MEDIUM",
  "status":"OPEN",
  "customerName":"...",
  "locationText":"...",
  "assignee": null,
  "dueAt":"...",
  "createdBy": { "id":"...", "name":"..." },
  "createdAt":"...",
  "updatedAt":"..."
}
```

#### PATCH `/orders/:id`
Acesso: ADMIN, MANAGER  
Atualiza dados (não muda status por aqui).  
Body (exemplo):
```json
{ "priority":"HIGH", "dueAt":"2026-03-02T12:00:00Z" }
```
Mensageria (opcional): `ORDER_UPDATED`

#### POST `/orders/:id/assign`
Acesso: ADMIN, MANAGER  
Body:
```json
{ "assigneeId": "uuid-do-tecnico" }
```
200: OS atualizada  
Mensageria: `ORDER_ASSIGNED` (via Outbox)

#### POST `/orders/:id/status`
Acesso:
- ADMIN/MANAGER: qualquer OS
- TECH: apenas OS atribuída + transição válida  
Body:
```json
{ "toStatus": "IN_PROGRESS", "note": "Iniciando atendimento" }
```
200: OS atualizada  
Banco: cria registro em `order_status_history`  
Mensageria: `ORDER_STATUS_CHANGED` (via Outbox)

#### GET `/orders/:id/history`
Acesso: ADMIN/MANAGER; TECH se atribuída  
200:
```json
[
  {
    "id":"...",
    "fromStatus":"ASSIGNED",
    "toStatus":"IN_PROGRESS",
    "changedBy": { "id":"...", "name":"..." },
    "note":"...",
    "changedAt":"..."
  }
]
```

---

### 6.4 Attachments
#### POST `/orders/:id/attachments`
Acesso: ADMIN/MANAGER; TECH se atribuída  
Upload: `multipart/form-data` com campo `file`  
201:
```json
{ "id":"...", "fileUrl":"...", "fileName":"foto.jpg" }
```
Mensageria: `ORDER_ATTACHMENT_ADDED` (via Outbox)

#### GET `/orders/:id/attachments`
Acesso: ADMIN/MANAGER; TECH se atribuída  
Lista anexos.

---

### 6.5 Realtime (para painéis)
Escolher SSE ou WebSocket.

#### GET `/events` (SSE)
Acesso: autenticado  
Retorna stream com eventos relevantes.  
Filtragem por role (TECH recebe apenas suas OS).

#### `WS /realtime` (alternativo)
Acesso: autenticado  
Canal de eventos em tempo real.

---

### 6.6 Integração com Mineração (serviço Python)
O backend orquestra e persiste resultados.

#### POST `/orders/:id/predict`
Acesso: ADMIN, MANAGER  
Ações:
- publica `ML_PREDICTION_REQUESTED` (via Outbox) **ou** chama diretamente o worker/serviço
200:
```json
{ "orderId":"...", "slaRisk": 0.78, "etaMinutes": 240 }
```
Mensageria: `ML_PREDICTION_READY` (quando finalizado)

#### GET `/orders/:id/prediction`
Acesso: ADMIN/MANAGER; TECH se atribuída  
Retorna última predição salva.

---

## 7) DTOs (schemas de request/response)

### 7.1 Auth DTOs
**LoginRequest**
```json
{ "email": "string", "password": "string" }
```

**TokenResponse**
```json
{ "accessToken": "string", "refreshToken": "string", "expiresIn": 3600 }
```

**RefreshRequest**
```json
{ "refreshToken": "string" }
```

### 7.2 User DTOs
**UserResponse**
```json
{ "id": "uuid", "name": "string", "email": "string", "role": "ADMIN|MANAGER|TECH" }
```

**UserCreateRequest (opcional)**
```json
{ "name": "string", "email": "string", "password": "string", "role": "ADMIN|MANAGER|TECH" }
```

**UserUpdateRequest (opcional)**
```json
{ "name": "string", "role": "ADMIN|MANAGER|TECH", "isActive": true }
```

### 7.3 Orders DTOs
**OrderCreateRequest**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "customerName": "string",
  "locationText": "string",
  "dueAt": "ISO-8601 timestamp"
}
```

**OrderUpdateRequest**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "customerName": "string",
  "locationText": "string",
  "dueAt": "ISO-8601 timestamp"
}
```

**OrderAssignRequest**
```json
{ "assigneeId": "uuid" }
```

**OrderStatusChangeRequest**
```json
{ "toStatus": "OPEN|ASSIGNED|IN_PROGRESS|PAUSED|DONE|CANCELED", "note": "string" }
```

**OrderListItem**
```json
{
  "id": "uuid",
  "title": "string",
  "category": "string",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "status": "OPEN|ASSIGNED|IN_PROGRESS|PAUSED|DONE|CANCELED",
  "assignee": { "id": "uuid", "name": "string" },
  "dueAt": "ISO-8601 timestamp",
  "createdAt": "ISO-8601 timestamp"
}
```

**OrderDetailResponse**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "status": "OPEN|ASSIGNED|IN_PROGRESS|PAUSED|DONE|CANCELED",
  "customerName": "string",
  "locationText": "string",
  "assignee": { "id": "uuid", "name": "string" },
  "dueAt": "ISO-8601 timestamp",
  "createdBy": { "id": "uuid", "name": "string" },
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

### 7.4 History DTOs
**OrderHistoryItem**
```json
{
  "id": "uuid",
  "fromStatus": "OPEN|ASSIGNED|IN_PROGRESS|PAUSED|DONE|CANCELED",
  "toStatus": "OPEN|ASSIGNED|IN_PROGRESS|PAUSED|DONE|CANCELED",
  "changedBy": { "id": "uuid", "name": "string" },
  "note": "string",
  "changedAt": "ISO-8601 timestamp"
}
```

### 7.5 Attachments DTOs
**AttachmentResponse**
```json
{
  "id": "uuid",
  "fileUrl": "string",
  "fileName": "string",
  "mimeType": "string",
  "sizeBytes": 0,
  "createdAt": "ISO-8601 timestamp"
}
```

### 7.6 Realtime / Events DTOs
**EventMessage**
```json
{
  "eventId": "uuid",
  "type": "ORDER_CREATED|ORDER_ASSIGNED|ORDER_STATUS_CHANGED|ORDER_ATTACHMENT_ADDED|SLA_DUE_SOON|SLA_BREACHED|ML_PREDICTION_REQUESTED|ML_PREDICTION_READY",
  "occurredAt": "ISO-8601 timestamp",
  "orderId": "uuid",
  "actorId": "uuid",
  "data": {}
}
```

### 7.7 Mineração DTOs
**PredictionResponse**
```json
{ "orderId": "uuid", "slaRisk": 0.0, "etaMinutes": 0 }
```

---

## 8) Códigos de resposta (padrão)
- `200` OK
- `201` Created
- `400` Bad Request (validação)
- `401` Unauthorized
- `403` Forbidden (role/ownership)
- `404` Not Found
- `409` Conflict (transição de status inválida / regra de negócio)
- `500` Internal Server Error

---

## 9) Fluxos mínimos (para demonstrar mensageria)
1) Criar OS: `POST /orders`  
   - BD: insere `orders`
   - Outbox: `ORDER_CREATED (PENDING)`
   - Worker Outbox publica no broker
2) Atribuir técnico: `POST /orders/:id/assign`  
   - Outbox: `ORDER_ASSIGNED`
   - Notification Worker notifica TECH
3) Mudar status: `POST /orders/:id/status`  
   - BD: registra `order_status_history`
   - Outbox: `ORDER_STATUS_CHANGED`
   - SLA Worker avalia prazos e pode publicar `SLA_*`
4) Integração ML:
   - Outbox: `ML_PREDICTION_REQUESTED`
   - ML Worker chama Python `/predict`
   - Publica `ML_PREDICTION_READY` e persiste resultado
