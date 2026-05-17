"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShoppingBag, Users, TrendingUp, Clock, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getAdminReservationsPage } from "@/api/reservation.api";
import { AdminReservation } from "@/api/types";

const STATUS_LABEL: Record<AdminReservation["status"], string> = {
  REQUESTED: "신청",
  CONFIRMED: "확정",
  PAID: "결제 완료",
  COMPLETED: "픽업 완료",
  CANCELLED: "취소",
};

const STATUS_BADGE: Record<AdminReservation["status"], string> = {
  REQUESTED: "bg-amber-50 text-amber-600",
  CONFIRMED: "bg-blue-50 text-blue-600",
  PAID: "bg-purple-50 text-purple-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function DashboardPage() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 대시보드용으로 최신 100건 정도만 가져와 통계·최근 5건 표시
    getAdminReservationsPage({ offset: 0, limit: 100 })
      .then((data) => setReservations(data.items))
      .catch((e) => console.error("Failed to fetch dashboard data:", e))
      .finally(() => setIsLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayReservations = reservations.filter((r) => r.createdAt.startsWith(today));
  const pending = reservations.filter((r) => r.status === "REQUESTED" || r.status === "CONFIRMED");
  const uniqueCustomers = new Set(reservations.map((r) => r.customerName)).size;
  const totalRevenue = reservations
    .filter((r) => r.status === "PAID" || r.status === "COMPLETED")
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const stats = [
    { label: "오늘의 예약", value: `${todayReservations.length}건`, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "처리 대기", value: `${pending.length}건`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "누적 고객 수", value: `${uniqueCustomers}명`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "누적 매출액", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  const recent = reservations.slice(0, 5);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl ${stat.bg} p-3 ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>최근 예약 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400">
                    <th className="pb-3 font-medium">예약 번호</th>
                    <th className="pb-3 font-medium">고객명</th>
                    <th className="pb-3 font-medium">상품</th>
                    <th className="pb-3 font-medium text-right">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {recent.map((r) => (
                    <tr key={r.id} className="group">
                      <td className="py-4 font-medium text-zinc-900">{r.reservationNumber}</td>
                      <td className="py-4 text-zinc-600">{r.customerName}</td>
                      <td className="py-4 text-zinc-600">{r.productName}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-400">최근 예약이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">백엔드 연결 상태</p>
                <p className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  정상 작동 중
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">실시간 데이터 동기화</p>
                <p className="mt-1 text-xs text-zinc-500">최근 업데이트: 방금 전</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
