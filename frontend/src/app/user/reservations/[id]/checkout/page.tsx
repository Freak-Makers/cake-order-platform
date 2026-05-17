"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, XCircle } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { preparePayment } from "@/api/payment.api";
import { PaymentPrepareResponse } from "@/api/types";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const reservationId = Number(params.id);

  const [prepare, setPrepare] = useState<PaymentPrepareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !reservationId) return;
    initialized.current = true;
    preparePayment(reservationId)
      .then(setPrepare)
      .catch((e) => {
        console.error("Failed to prepare payment:", e);
        setError("결제 준비에 실패했습니다. 확정된 예약인지 확인해주세요.");
      });
  }, [reservationId]);

  const handleSuccess = () => {
    if (!prepare) return;
    setIsSubmitting(true);
    const mockPaymentKey = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const qs = new URLSearchParams({
      paymentKey: mockPaymentKey,
      orderId: prepare.orderId,
      amount: String(prepare.amount),
    });
    router.push(`/user/reservations/checkout/success?${qs.toString()}`);
  };

  const handleFail = () => {
    if (!prepare) return;
    setIsSubmitting(true);
    const qs = new URLSearchParams({
      code: "MOCK_USER_CANCELLED",
      message: "사용자가 결제를 취소했습니다 (시뮬레이션)",
      orderId: prepare.orderId,
    });
    router.push(`/user/reservations/checkout/fail?${qs.toString()}`);
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Toss 모의 결제 (시뮬레이션)
          </span>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">결제하기</h1>
          <p className="mt-1 text-sm text-zinc-500">
            실제 토스 결제 위젯이 연결되지 않은 상태입니다. 아래 버튼으로 결제 성공/실패 흐름을 테스트할 수 있습니다.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {prepare ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-sm text-zinc-500">{prepare.orderName}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">{formatPrice(prepare.amount)}</p>
            <div className="mt-4 space-y-1 text-xs text-zinc-400">
              <p>주문번호: <span className="font-mono">{prepare.orderId}</span></p>
              <p>고객: {prepare.customerName}</p>
            </div>
          </div>
        ) : !error && (
          <p className="text-zinc-500">결제 정보를 불러오는 중...</p>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/user/reservations")}
            className="flex-1"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            variant="outline"
            onClick={handleFail}
            disabled={!prepare || isSubmitting}
            className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle size={16} />
            결제 실패
          </Button>
          <Button
            onClick={handleSuccess}
            disabled={!prepare || isSubmitting}
            className="flex-[2] gap-2 bg-pink-500 hover:bg-pink-600"
          >
            <CreditCard size={16} />
            결제 성공
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}
