import apiClient from "@/api/api-client";
import { Payment, PaymentPrepareResponse } from "@/api/types";

// User: 결제 준비 (백엔드 검증 + 토스용 메타 발급)
export async function preparePayment(reservationId: number) {
  return apiClient.post<PaymentPrepareResponse, { reservationId: number }>(
    "/api/v1/payments/prepare",
    { reservationId }
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

// User: 내 결제 내역
export async function getMyPayments() {
  return apiClient.get<Payment[]>("/api/v1/payments/my");
}
