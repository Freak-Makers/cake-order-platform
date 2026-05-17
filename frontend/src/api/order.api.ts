import apiClient from "@/api/api-client";
import { Order, OrderStatus } from "@/api/types";

// User: 주문하기
export interface CreateOrderRequest {
  productId: number;
  quantity: number;
  pickupDateTime: string; // ISO 8601
  requirements?: string;
}

export async function createOrder(data: CreateOrderRequest) {
  return apiClient.post<{ orderId: number }, CreateOrderRequest>("/api/v1/orders", data);
}

// User: 내 주문 내역 조회
export async function getMyOrders() {
  return apiClient.get<Order[]>("/api/v1/orders/my");
}

// Admin: 전체 주문 내역 조회
export async function getAllOrders() {
  return apiClient.get<Order[]>("/api/v1/admin/orders");
}

// Admin: 주문 상태 변경
export async function updateOrderStatus(id: number, status: OrderStatus) {
  return apiClient.post<Order, { status: OrderStatus }>(`/api/v1/admin/orders/${id}/status`, { status });
}
