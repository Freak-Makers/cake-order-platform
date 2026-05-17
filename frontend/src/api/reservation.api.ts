import apiClient from "@/api/api-client";
import {
  AdminReservation,
  AdminReservationsResponse,
  Reservation,
  ReservationSlot,
  ReservationStatus,
} from "@/api/types";

// User: 가능한 슬롯 목록
export async function getAvailableSlots() {
  return apiClient.get<ReservationSlot[]>("/api/v1/reservation-slots");
}

// User: 예약 신청
export interface CreateReservationRequest {
  productId: number;
  slotId: number;
  quantity: number;
  requirements?: string | null;
}
export async function createReservation(data: CreateReservationRequest) {
  return apiClient.post<Reservation, CreateReservationRequest>(
    "/api/v1/reservations",
    data
  );
}

// User: 내 예약 목록
export async function getMyReservations() {
  return apiClient.get<Reservation[]>("/api/v1/reservations/my");
}

// Admin: 슬롯 관리
export async function getAdminSlots() {
  return apiClient.get<ReservationSlot[]>("/api/v1/admin/reservation-slots");
}

export interface CreateSlotRequest {
  date: string; // YYYY-MM-DD
  times: string[]; // ["HH:mm", ...]
}
export async function createSlot(data: CreateSlotRequest) {
  return apiClient.post<ReservationSlot[], CreateSlotRequest>(
    "/api/v1/admin/reservation-slots",
    data
  );
}

export async function deleteSlot(id: number) {
  return apiClient.delete<void>(`/api/v1/admin/reservation-slots/${id}`);
}

// Admin: 전체 예약 (offset 페이지네이션 + status / keyword 필터 + 정렬)
export type AdminReservationsSort = "createdAt" | "slotStartAt" | "quantity" | "totalPrice" | "status";
export type AdminReservationsDirection = "asc" | "desc";

export interface AdminReservationsQuery {
  offset?: number;
  limit?: number;
  status?: ReservationStatus | "";
  keyword?: string;
  sort?: AdminReservationsSort;
  direction?: AdminReservationsDirection;
}
export async function getAdminReservationsPage(params: AdminReservationsQuery = {}) {
  const qs = new URLSearchParams();
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.keyword && params.keyword.trim()) qs.set("keyword", params.keyword.trim());
  if (params.sort) qs.set("sort", params.sort);
  if (params.direction) qs.set("direction", params.direction);
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiClient.get<AdminReservationsResponse>(`/api/v1/admin/reservations${suffix}`);
}

export async function confirmReservation(id: number) {
  return apiClient.post<AdminReservation>(`/api/v1/admin/reservations/${id}/confirm`);
}
