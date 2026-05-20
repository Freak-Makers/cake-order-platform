import apiClient from "@/api/api-client";

export interface AdminDashboardStats {
  todayReservationCount: number;    // slotStartAt 이 오늘인 활성 예약 수
  pendingReservationCount: number;  // status = REQUESTED 인 예약 수
  totalCustomerCount: number;       // PAID 결제 1건 이상 보유한 고유 user 수
  totalRevenue: number;             // PAID 결제의 amount 합 (KRW)
}

export async function getDashboardStats() {
  return apiClient.get<AdminDashboardStats>("/api/v1/admin/dashboard/stats");
}
