"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { CreditCard } from "lucide-react";
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
  const [widgetReady, setWidgetReady] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const prepareInitialized = useRef(false);
  const widgetsInitialized = useRef(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    if (prepareInitialized.current || !reservationId) return;
    prepareInitialized.current = true;
    preparePayment(reservationId)
      .then(setPrepare)
      .catch((e) => {
        console.error("Failed to prepare payment:", e);
        setError("결제 준비에 실패했습니다. 확정된 예약인지 확인해주세요.");
      });
  }, [reservationId]);

  useEffect(() => {
    if (!prepare || widgetsInitialized.current) return;
    widgetsInitialized.current = true;

    (async () => {
      try {
        const tossPayments = await loadTossPayments(prepare.clientKey);
        const widgets = tossPayments.widgets({ customerKey: prepare.customerKey });
        await widgets.setAmount({ currency: "KRW", value: prepare.amount });
        // Toss 공식 예제는 순차 await — 병렬(Promise.all)은 SDK 내부 상태 경쟁으로 실패할 수 있음.
        await widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        });
        // variantKey 미지정 → SDK 기본값 사용. 테스트 머천트에 커스텀 약관 variant 가 없을 수 있어서 안전한 기본값.
        await widgets.renderAgreement({
          selector: "#agreement",
        });
        widgetsRef.current = widgets;
        setWidgetReady(true);
      } catch (e) {
        console.error("Failed to render Toss widgets:", e);
        const err = e as { code?: string; name?: string; message?: string };
        const tag = err.code ?? err.name ?? "Unknown";
        const msg = err.message ?? "";
        setError(`결제 위젯을 불러오지 못했습니다. (${tag}: ${msg})`);
      }
    })();
  }, [prepare]);

  const handlePay = async () => {
    if (!prepare || !widgetsRef.current || isRequesting) return;
    setIsRequesting(true);
    try {
      // Redirect 방식: 성공 시 successUrl 로 이동, 실패 시 failUrl 로 이동. 정상 흐름에서는 이 줄 이후가 실행되지 않음.
      await widgetsRef.current.requestPayment({
        orderId: prepare.orderId,
        orderName: prepare.orderName,
        customerName: prepare.customerName,
        successUrl: prepare.successUrl,
        failUrl: prepare.failUrl,
      });
    } catch (e) {
      console.error("requestPayment failed:", e);
      setIsRequesting(false);
    }
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">결제하기</h1>
          <p className="mt-1 text-sm text-zinc-500">
            토스페이먼츠 결제위젯에서 결제수단을 선택하고 결제를 진행하세요.
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

        {prepare && !widgetReady && !error && (
          <p className="text-sm text-zinc-500">결제 위젯을 불러오는 중...</p>
        )}

        {/* Toss 결제수단/약관 위젯 마운트 포인트. prepare 가 준비되기 전엔 비어있다가 SDK 가 채워 넣음. */}
        <div id="payment-method" className="min-h-[200px]" />
        <div id="agreement" />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/user/reservations")}
            className="flex-1"
            disabled={isRequesting}
          >
            취소
          </Button>
          <Button
            onClick={handlePay}
            disabled={!widgetReady || isRequesting}
            className="flex-[2] gap-2 bg-pink-500 hover:bg-pink-600"
          >
            <CreditCard size={16} />
            {isRequesting ? "결제창 이동 중..." : "결제하기"}
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}
