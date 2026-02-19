import { createHttp } from "./http";

export type OrderStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "PAUSED" | "DONE" | "CANCELED";
export type OrderPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OrderListItem = {
  id: string;
  title: string;
  category: string;
  priority: OrderPriority;
  status: OrderStatus;
  dueAt?: string;
  createdAt: string;
};

export function createOrdersApi(http: ReturnType<typeof createHttp>) {
  return {
    list: (query = "") => http.request<{ data: OrderListItem[] }>(`/orders${query}`),
    detail: (id: string) => http.request<any>(`/orders/${id}`),
    changeStatus: (id: string, toStatus: OrderStatus, note?: string) =>
      http.request<any>(`/orders/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ toStatus, note })
      })
  };
}
