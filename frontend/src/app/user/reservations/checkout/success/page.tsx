"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserLayout } from "@/components/layout/UserLayout";
import { confirmPayment } from "@/api/payment.api";

// 결제 성공 후 reservations 로 자동 이동까지 잠깐 노출하는 시간(ms).
const REDIRECT_DELAY_MS = 1500;

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [done, setDone] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      // 정보가 부족하면 그대로 reservations 로 보냄. (alert 가 뜨는 케이스는 아니지만 막막한 정지를 피함.)
      router.replace("/user/reservations");
      return;
    }

    confirmPayment({ paymentKey, orderId, amount: Number(amount) })
      .then(() => {
        setDone(true);
        // 잠깐 "결제 완료" 노출 후 자동 이동.
        setTimeout(() => router.replace("/user/reservations"), REDIRECT_DELAY_MS);
      })
      .catch((e) => {
        // fetch.server.ts 의 alert 가 이미 사용자에게 에러를 알림. 페이지는 멈추지 않고 reservations 로.
        console.error("Confirm failed:", e);
        router.replace("/user/reservations");
      });
  }, [searchParams, router]);

  return (
    <UserLayout>
      <div className="mx-auto max-w-xl space-y-6 text-center">
        {done ? (
          <>
            <h1 className="text-2xl font-bold text-pink-600">결제가 완료되었습니다 🎉</h1>
            <p className="text-zinc-500">예약 내역 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">결제 승인 중...</h1>
            <p className="text-zinc-500">잠시만 기다려 주세요.</p>
          </>
        )}
      </div>
    </UserLayout>
  );
}
