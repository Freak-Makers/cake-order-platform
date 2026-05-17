"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShoppingBag, Users, TrendingUp, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const stats = [
  { label: "오늘의 주문", value: "12건", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "대기 중인 케이크", value: "5개", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "이번 달 누적 고객", value: "128명", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "이번 달 예상 매출", value: formatPrice(1250000), icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50" },
];

const recentOrders = [
  { id: "#ORD-001", customer: "김철수", product: "생딸기 생크림 케이크", date: "2024-05-10", status: "제작 중" },
  { id: "#ORD-002", customer: "이영희", product: "초코 가나슈 케이크", date: "2024-05-10", status: "대기" },
  { id: "#ORD-003", customer: "박지민", product: "망고 요거트 케이크", date: "2024-05-09", status: "완료" },
];

export default function DashboardPage() {
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
                      <td className="py-4 font-medium text-zinc-900">{order.id}</td>
                      <td className="py-4 text-zinc-600">{order.customer}</td>
                      <td className="py-4 text-zinc-600">{order.product}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === "완료" ? "bg-green-50 text-green-600" :
                          order.status === "제작 중" ? "bg-blue-50 text-blue-600" :
                          "bg-amber-50 text-amber-600"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">시스템 점검 안내</p>
                <p className="mt-1 text-xs text-zinc-500">내일 새벽 2시부터 4시까지 정기 점검이 있을 예정입니다.</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">신규 테마 출시!</p>
                <p className="mt-1 text-xs text-zinc-500">여름 한정판 케이크 주문서를 확인해보세요.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
