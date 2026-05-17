"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Filter, Plus } from "lucide-react";

const orders = [
  { id: "ORD-001", customer: "김철수", product: "생딸기 생크림 케이크", pickup: "2024-05-12 14:00", price: 45000, status: "제작 중" },
  { id: "ORD-002", customer: "이영희", product: "초코 가나슈 케이크", pickup: "2024-05-12 16:30", price: 38000, status: "대기" },
  { id: "ORD-003", customer: "박지민", product: "망고 요거트 케이크", pickup: "2024-05-13 11:00", price: 42000, status: "완료" },
  { id: "ORD-004", customer: "최현우", product: "레드벨벳 크림치즈", pickup: "2024-05-13 18:00", price: 48000, status: "취소" },
];

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">주문 관리</h1>
          <p className="text-zinc-500">고객님들의 케이크 주문을 관리하세요.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          수동 주문 등록
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="flex gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="고객명 또는 주문 번호 검색..."
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={18} />
            필터
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">주문 정보</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">고객</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">픽업 일시</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">금액</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">상태</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-zinc-900">{order.id}</p>
                        <p className="text-xs text-zinc-500">{order.product}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{order.customer}</td>
                    <td className="px-6 py-4 text-zinc-600">{order.pickup}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900">{order.price.toLocaleString()}원</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === "완료" ? "bg-green-50 text-green-600" :
                        order.status === "제작 중" ? "bg-blue-50 text-blue-600" :
                        order.status === "취소" ? "bg-red-50 text-red-600" :
                        "bg-amber-50 text-amber-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">상세보기</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
