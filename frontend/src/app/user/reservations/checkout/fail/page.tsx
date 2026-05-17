"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";

export default function CheckoutFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  return (
    <UserLayout>
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">결제가 취소되었거나 실패했습니다</h1>
        <div className="rounded-lg bg-red-50 p-4 text-left text-sm text-red-700 space-y-1">
          {code && <p><span className="font-medium">code</span>: {code}</p>}
          {message && <p><span className="font-medium">message</span>: {message}</p>}
          {orderId && <p><span className="font-medium">orderId</span>: {orderId}</p>}
        </div>
        <Button onClick={() => router.push("/user/reservations")}>내 예약으로 돌아가기</Button>
      </div>
    </UserLayout>
  );
}
