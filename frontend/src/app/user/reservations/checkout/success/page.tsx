"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { confirmPayment } from "@/api/payment.api";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"confirming" | "done" | "error">("confirming");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setErrorMessage("결제 정보가 부족합니다.");
      setState("error");
      return;
    }

    confirmPayment({ paymentKey, orderId, amount: Number(amount) })
      .then(() => setState("done"))
      .catch((e) => {
        console.error("Confirm failed:", e);
        setErrorMessage("결제 승인 중 오류가 발생했습니다.");
        setState("error");
      });
  }, [searchParams]);

  return (
    <UserLayout>
      <div className="mx-auto max-w-xl space-y-6 text-center">
        {state === "confirming" && (
          <>
            <h1 className="text-2xl font-bold">결제 승인 중...</h1>
            <p className="text-zinc-500">잠시만 기다려 주세요.</p>
          </>
        )}
        {state === "done" && (
          <>
            <h1 className="text-2xl font-bold text-pink-600">결제가 완료되었습니다 🎉</h1>
            <p className="text-zinc-500">예약 내역에서 결제 상태를 확인할 수 있습니다.</p>
            <Button onClick={() => router.push("/user/reservations")}>내 예약으로 이동</Button>
          </>
        )}
        {state === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-600">결제 처리 실패</h1>
            <p className="text-zinc-500">{errorMessage}</p>
            <Button variant="outline" onClick={() => router.push("/user/reservations")}>
              내 예약으로 이동
            </Button>
          </>
        )}
      </div>
    </UserLayout>
  );
}
