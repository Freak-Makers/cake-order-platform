"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShoppingBag, Users, TrendingUp, Clock, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getAllOrders } from "@/api/order.api";
import { Order } from "@/api/types";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 간단한 통계 계산
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
  const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "MAKING");
  const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;
  const totalRevenue = orders
    .filter(o => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const stats = [
    { label: "오늘의 주문", value: `${todayOrders.length}건`, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "대기 중인 케이크", value: `${pendingOrders.length}개`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "누적 고객 수", value: `${uniqueCustomers}명`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "누적 매출액", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  const recentOrders = orders.slice(0, 5);

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
            <CardTitle>최근 주문 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400">
                    <th className="pb-3 font-medium">주문 번호</th>
                    <th className="pb-3 font-medium">고객명</th>
                    <th className="pb-3 font-medium">상품</th>
                    <th className="pb-3 font-medium text-right">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="group">
                      <td className="py-4 font-medium text-zinc-900">{order.orderNumber}</td>
                      <td className="py-4 text-zinc-600">{order.customerName}</td>
                      <td className="py-4 text-zinc-600">{order.productName}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === "COMPLETED" ? "bg-green-50 text-green-600" :
                          order.status === "MAKING" ? "bg-blue-50 text-blue-600" :
                          order.status === "CANCELLED" ? "bg-red-50 text-red-600" :
                          "bg-amber-50 text-amber-600"
                        }`}>
                          {order.status === "PENDING" ? "대기" : 
                           order.status === "MAKING" ? "제작 중" :
                           order.status === "READY" ? "픽업 대기" :
                           order.status === "COMPLETED" ? "완료" : "취소"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-400">최근 주문이 없습니다.</td>
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
