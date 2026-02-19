export type UserRole = "ADMIN" | "MANAGER" | "TECH";

export type OrderPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OrderStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "DONE"
  | "CANCELED";

export type User = {
  id: string; // uuid
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderListItem = {
  id: string;
  title: string;
  category: string;
  priority: OrderPriority;
  status: OrderStatus;
  assignee?: { id: string; name: string } | null;
  dueAt?: string | null;
  createdAt: string;
};

export type OrderDetail = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  priority: OrderPriority;
  status: OrderStatus;
  customerName?: string | null;
  locationText?: string | null;
  assignee?: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderHistoryItem = {
  id: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: { id: string; name: string };
  note?: string | null;
  changedAt: string;
};

export type Attachment = {
  id: string;
  orderId: string;
  uploadedBy: string;
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
};

export type Comment = {
  id: string;
  orderId: string;
  authorId: string;
  message: string;
  createdAt: string;
};

export type OutboxStatus = "PENDING" | "SENT" | "FAILED";

export type EventType =
  | "ORDER_CREATED"
  | "ORDER_ASSIGNED"
  | "ORDER_STATUS_CHANGED"
  | "ORDER_ATTACHMENT_ADDED"
  | "SLA_DUE_SOON"
  | "SLA_BREACHED"
  | "ML_PREDICTION_REQUESTED"
  | "ML_PREDICTION_READY";

export type EventMessage<T = any> = {
  eventId: string;
  type: EventType;
  occurredAt: string;
  orderId: string;
  actorId: string;
  data: T;
};

export type LoginRequest = { email: string; password: string };
export type TokenResponse = { accessToken: string; refreshToken: string; expiresIn: number };

export type CreateOrderRequest = {
  title: string;
  description?: string;
  category: string;
  priority?: OrderPriority;
  customerName?: string;
  locationText?: string;
  dueAt?: string;
};

export type ChangeStatusRequest = { toStatus: OrderStatus; note?: string };
export type AssignOrderRequest = { assigneeId: string };
