# Data Mining / Mineração de Dados — Serviço de Predição (Python)
Documentação **somente da parte de Mineração de Dados**: escopo, pipeline, endpoints do serviço Python e integração com o backend via mensageria.

---

## 1) Visão geral
A Mineração de Dados é entregue como um **serviço separado** (microserviço) em Python (ex.: FastAPI).  
Ele recebe dados do backend (features), retorna previsões e pode registrar métricas/versões de modelo.

Objetivos típicos para o tema **Ordens de Serviço (OS)**:
- **Predizer risco de estourar SLA** (classificação)
- **Estimativa de tempo de resolução (ETA)** (regressão)
- **Clusterização de OS por padrão** (não supervisionado) — opcional

---

## 2) Entradas, saídas e responsabilidades

### 2.1 O que o serviço de Mineração faz
- Valida payload de features
- Carrega modelo (versão ativa)
- Executa inferência (predict)
- Retorna resultados (ex.: `slaRisk`, `etaMinutes`)
- (Opcional) Treina modelos em lote via endpoint de treino ou job agendado
- (Opcional) Armazena artefatos e métricas de treino

### 2.2 O que o backend faz (integração)
- Monta features a partir de `orders`, `order_status_history` etc.
- Publica evento `ML_PREDICTION_REQUESTED` (mensageria) ou chama o serviço diretamente
- Persiste o resultado (ex.: tabela `orders_prediction` ou colunas na OS)
- Publica `ML_PREDICTION_READY` para realtime/painéis

---

## 3) Dataset e features (proposta)

### 3.1 Fonte de dados (exemplos)
- `orders` (categoria, prioridade, localização, dueAt, timestamps)
- `order_status_history` (tempos entre status, quantidade de pausas)
- (Opcional) `users` (perfil técnico: volume de OS, média de resolução)

### 3.2 Target (rótulos)
- **Classificação (SLA):** `slaBreached` (0/1)  
  Ex.: `1` se `doneAt > dueAt` (ou se `CANCELED` e regra definida)
- **Regressão (ETA):** `resolutionMinutes`  
  Ex.: diferença entre `createdAt` e `doneAt` (ou `inProgressAt` e `doneAt`)

### 3.3 Features sugeridas (mínimo)
- `priority` (one-hot)
- `category` (one-hot)
- `createdHour` (0–23)
- `createdDayOfWeek` (0–6)
- `hasAssignee` (0/1)
- `assigneeWorkloadOpen` (número de OS abertas atribuídas, no momento) — opcional
- `timeSinceCreatedMinutes` (para predição online) — opcional
- `dueInMinutes` (tempo até dueAt) — opcional

> Observação: manter features simples reduz risco e facilita explicação na banca.

---

## 4) Modelos (sugestão técnica)
### 4.1 Supervisionado (recomendado)
- Classificação SLA: Logistic Regression / RandomForest / XGBoost (se permitido)
- Regressão ETA: RandomForestRegressor / GradientBoostingRegressor

Métricas:
- Classificação: AUC, F1, Precision/Recall
- Regressão: MAE (minutos), RMSE

### 4.2 Não supervisionado (opcional)
- KMeans para clusterizar OS por padrão (categoria/prioridade/tempo médio)
- Métrica: silhouette score (quando aplicável)

---

## 5) Versionamento de modelo e rastreabilidade
Recomendado manter:
- `modelVersion` (ex.: `2026-05-01_001`)
- `trainedAt`
- `featuresSchemaVersion`
- Artefatos: `model.pkl` + `preprocess.pkl` (ou pipeline único)

Armazenamento:
- Local (para faculdade): pasta `models/`
- Cloud: S3 (ou equivalente)

---

## 6) Endpoints do serviço Python (FastAPI)

### 6.1 Healthcheck
#### GET `/health`
200:
```json
{ "status": "ok" }
```

### 6.2 Inferência (online)
#### POST `/predict`
**Acesso:** interno (rede privada) ou com API key  
Body (exemplo mínimo):
```json
{
  "requestId": "uuid",
  "orderId": "uuid",
  "features": {
    "priority": "HIGH",
    "category": "TI",
    "createdHour": 14,
    "createdDayOfWeek": 2,
    "hasAssignee": 1,
    "dueInMinutes": 720
  }
}
```

200:
```json
{
  "requestId": "uuid",
  "orderId": "uuid",
  "modelVersion": "2026-05-01_001",
  "predictions": {
    "slaRisk": 0.78,
    "etaMinutes": 240
  }
}
```

Erros:
- 400: features inválidas / faltando campos
- 500: modelo indisponível

### 6.3 Treino (opcional)
#### POST `/train`
**Acesso:** admin interno  
Body:
```json
{
  "datasetRef": "s3://bucket/datasets/orders.csv",
  "trainConfig": {
    "testSize": 0.2,
    "randomState": 42
  }
}
```

202:
```json
{ "jobId": "uuid", "status": "queued" }
```

### 6.4 Status de treino (opcional)
#### GET `/train/jobs/:jobId`
200:
```json
{
  "jobId": "uuid",
  "status": "running",
  "progress": 0.6,
  "modelVersion": null
}
```

Quando finalizado:
```json
{
  "jobId": "uuid",
  "status": "done",
  "modelVersion": "2026-05-01_001",
  "metrics": { "auc": 0.84, "f1": 0.71, "maeMinutes": 55 }
}
```

### 6.5 Listar versões (opcional)
#### GET `/models`
200:
```json
[
  { "modelVersion": "2026-05-01_001", "trainedAt": "2026-05-01T10:00:00Z" }
]
```

### 6.6 Ativar versão (opcional)
#### POST `/models/activate`
Body:
```json
{ "modelVersion": "2026-05-01_001" }
```
200:
```json
{ "activeModelVersion": "2026-05-01_001" }
```

---

## 7) Integração com o backend via mensageria

### 7.1 Eventos e fluxo
1) Backend publica `ML_PREDICTION_REQUESTED` (via Outbox)
2) **ML Orchestrator Worker** consome e chama `POST /predict`
3) Worker persiste resultado no banco (ex.: `orders_prediction`)
4) Worker publica `ML_PREDICTION_READY` (via Outbox/broker)
5) Realtime (SSE/WS) entrega ao Web/Desktop e o backend retorna em `GET /orders/:id/prediction`

### 7.2 Evento `ML_PREDICTION_REQUESTED` (exemplo)
```json
{
  "eventId": "uuid",
  "type": "ML_PREDICTION_REQUESTED",
  "occurredAt": "2026-05-10T12:00:00Z",
  "orderId": "uuid",
  "actorId": "uuid",
  "data": {
    "features": {
      "priority": "HIGH",
      "category": "TI",
      "createdHour": 14,
      "createdDayOfWeek": 2,
      "hasAssignee": 1,
      "dueInMinutes": 720
    }
  }
}
```

### 7.3 Evento `ML_PREDICTION_READY` (exemplo)
```json
{
  "eventId": "uuid",
  "type": "ML_PREDICTION_READY",
  "occurredAt": "2026-05-10T12:00:05Z",
  "orderId": "uuid",
  "actorId": "system",
  "data": {
    "modelVersion": "2026-05-01_001",
    "slaRisk": 0.78,
    "etaMinutes": 240
  }
}
```

---

## 8) Persistência do resultado (no backend)
Opções (escolher uma):

### 8.1 Tabela dedicada (recomendado)
`orders_prediction`
- `id` uuid (pk)
- `order_id` uuid (fk)
- `model_version` varchar
- `sla_risk` numeric(5,4)
- `eta_minutes` int
- `predicted_at` timestamp
- `features_snapshot` json (opcional)

### 8.2 Colunas na tabela `orders` (mais simples)
- `sla_risk` numeric
- `eta_minutes` int
- `ml_model_version` varchar
- `ml_predicted_at` timestamp

---

## 9) TDD e validações (Mineração)
Testes mínimos recomendados:
- **Unitário:** validação de schema de features; carregamento do modelo; retorno do `/predict`
- **Contrato:** payload de entrada/saída do `/predict` (ex.: usando pydantic)
- **Smoke test:** `/health` + `/predict` com payload fixo

---

## 10) Observabilidade e segurança (mínimo)
- Logs estruturados (requestId, orderId, modelVersion)
- Rate limit (opcional)
- API key ou rede privada (recomendado)
- Timeout e retry no worker (para chamadas ao Python)

---
