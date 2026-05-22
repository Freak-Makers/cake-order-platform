import apiClient from "~/api/api-client";
import type { Payment, PaymentPrepareResponse } from "~/api/types";

// User: 결제 준비 (백엔드 검증 + 토스용 메타 발급)
export async function preparePayment(reservationId: number) {
  return apiClient.post<PaymentPrepareResponse, { reservationId: number }>(
    "/api/v1/payments/prepare",
    { reservationId },
  );
}

// User: 토스 결제 승인 (성공 콜백에서 호출)
export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}
export async function confirmPayment(data: ConfirmPaymentRequest) {
  return apiClient.post<Payment, ConfirmPaymentRequest>("/api/v1/payments/confirm", data);
}

// User: 결제 실패 기록 (위젯/토스 결제창에서 취소·실패 시 호출)
export interface FailPaymentRequest {
  reservationId: number;
  paymentKey?: string | null;
  orderId?: string | null;
  code: string;
  message: string;
}
export async function failPayment(data: FailPaymentRequest) {
  return apiClient.post<Payment, FailPaymentRequest>("/api/v1/payments/fail", data);
}

// User: 내 결제 내역 전체
export async function getMyPayments() {
  return apiClient.get<Payment[]>("/api/v1/payments/my");
}

// User: 특정 예약의 가장 최근 결제 1건 (없으면 null)
export async function getPaymentByReservation(reservationId: number) {
  return apiClient.get<Payment | null>(`/api/v1/payments/by-reservation/${reservationId}`);
}
