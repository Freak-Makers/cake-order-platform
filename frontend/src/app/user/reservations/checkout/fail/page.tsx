"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { failPayment } from "@/api/payment.api";

export default function CheckoutFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");
  const reservationIdStr = searchParams.get("reservationId");
  const reservationId = reservationIdStr ? Number(reservationIdStr) : null;

  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    if (!reservationId || !code || !message) return;
    recorded.current = true;

    // 백엔드 감사 로그용. 실패해도 alert 가 책임지고 사용자에게 알림 — 페이지 자체에는 별도 UI 표시 안 함.
    failPayment({
      reservationId,
      paymentKey: null,
      orderId,
      code,
      message,
    }).catch((e) => {
      console.error("Failed to record payment failure:", e);
    });
  }, [reservationId, code, message, orderId]);

  return (
    <UserLayout>
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-xl font-bold text-red-600 sm:text-2xl">결제가 취소되었거나 실패했습니다</h1>
        <div className="rounded-lg bg-red-50 p-4 text-left text-sm text-red-700 space-y-1">
          {code && <p><span className="font-medium">code</span>: {code}</p>}
          {message && <p><span className="font-medium">message</span>: {message}</p>}
          {orderId && <p><span className="font-medium">orderId</span>: {orderId}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {reservationId && (
            <Button
              onClick={() => router.push(`/user/reservations/${reservationId}/checkout`)}
              className="w-full bg-pink-500 hover:bg-pink-600 sm:flex-1"
            >
              다시 결제하기
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push("/user/reservations")}
            className="w-full sm:flex-1"
          >
            내 예약으로 돌아가기
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}
