"use client";

import { useEffect, useRef, useState } from "react";
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

  const [recordState, setRecordState] = useState<"idle" | "recording" | "done" | "error">("idle");
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    if (!reservationIdStr || !code || !message) return;
    recorded.current = true;

    setRecordState("recording");
    failPayment({
      reservationId: Number(reservationIdStr),
      paymentKey: null,
      orderId,
      code,
      message,
    })
      .then(() => setRecordState("done"))
      .catch((e) => {
        console.error("Failed to record payment failure:", e);
        setRecordState("error");
      });
  }, [reservationIdStr, code, message, orderId]);

  return (
    <UserLayout>
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">결제가 취소되었거나 실패했습니다</h1>
        <div className="rounded-lg bg-red-50 p-4 text-left text-sm text-red-700 space-y-1">
          {code && <p><span className="font-medium">code</span>: {code}</p>}
          {message && <p><span className="font-medium">message</span>: {message}</p>}
          {orderId && <p><span className="font-medium">orderId</span>: {orderId}</p>}
        </div>
        {recordState === "recording" && (
          <p className="text-xs text-zinc-500">실패 내역을 기록 중...</p>
        )}
        {recordState === "error" && (
          <p className="text-xs text-amber-600">실패 내역 기록에 실패했지만 다시 결제할 수 있습니다.</p>
        )}
        <Button onClick={() => router.push("/user/reservations")}>내 예약으로 돌아가기</Button>
      </div>
    </UserLayout>
  );
}
