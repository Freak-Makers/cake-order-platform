"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cancelMyReservation, getMyReservations } from "@/api/reservation.api";
import { getMyPayments } from "@/api/payment.api";
import { Payment, Reservation, ReservationStatus } from "@/api/types";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "확정 대기",
  CONFIRMED: "확정됨 (결제 필요)",
  PAID: "결제 완료",
  COMPLETED: "픽업 완료",
  CANCELLED: "취소됨",
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  REQUESTED: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PAID: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-zinc-100 text-zinc-500",
};

export default function UserReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [paymentsByReservation, setPaymentsByReservation] = useState<Record<number, Payment>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [reservs, payments] = await Promise.all([getMyReservations(), getMyPayments()]);
        setReservations(reservs);
        const map: Record<number, Payment> = {};
        payments.forEach((p) => {
          map[p.reservationId] = p;
        });
        setPaymentsByReservation(map);
      } catch (e) {
        console.error("Failed to load reservations:", e);
      } finally {
        setIsLoading(false);
      }
    };
    refresh();
  }, []);

  const handlePay = (id: number) => {
    router.push(`/user/reservations/${id}/checkout`);
  };

  const handleCancel = async (id: number) => {
    if (!confirm("예약을 취소하시겠어요? 슬롯이 해제되어 다른 분이 예약할 수 있습니다.")) return;
    try {
      const updated = await cancelMyReservation(id);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      // 토스트는 글로벌이 띄움. 페이지 상태는 그대로.
      console.error("Failed to cancel reservation:", e);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">내 예약</h1>

        {isLoading ? (
          <p className="text-zinc-500">불러오는 중...</p>
        ) : reservations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-zinc-500">
              아직 예약한 내역이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {reservations.map((r) => {
              const payment = paymentsByReservation[r.id];
              return (
                <li key={r.id}>
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-xs font-medium text-zinc-400">{r.reservationNumber}</span>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>
                              {STATUS_LABEL[r.status]}
                            </span>
                          </div>
                          <h2 className="text-base font-bold text-zinc-900 sm:text-lg">{r.productName}</h2>
                          <p className="text-sm text-zinc-500">
                            픽업 {new Date(r.slotStartAt).toLocaleString("ko-KR")} · 수량 {r.quantity} · {formatPrice(r.totalPrice)}
                          </p>
                          {r.requirements && (
                            <p className="text-xs text-zinc-400">요청: {r.requirements}</p>
                          )}
                          {payment && (
                            <p className="text-xs text-purple-600">
                              결제 #{payment.id} · {payment.status}
                              {payment.paidAt && ` · ${new Date(payment.paidAt).toLocaleString()}`}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          {r.status === "CONFIRMED" && (
                            <Button onClick={() => handlePay(r.id)} className="flex-1 sm:flex-none">결제하기</Button>
                          )}
                          {(r.status === "REQUESTED" || r.status === "CONFIRMED") && (
                            <Button
                              variant="outline"
                              onClick={() => handleCancel(r.id)}
                              className="flex-1 text-red-600 hover:bg-red-50 sm:flex-none"
                            >
                              취소
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </UserLayout>
  );
}
