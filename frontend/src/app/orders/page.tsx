"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/api/order.api";
import { Order, OrderStatus } from "@/api/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;
    
    // 상태 순환: PENDING -> MAKING -> READY -> COMPLETED
    if (currentStatus === "PENDING") nextStatus = "MAKING";
    else if (currentStatus === "MAKING") nextStatus = "READY";
    else if (currentStatus === "READY") nextStatus = "COMPLETED";
    else return;

    try {
      await updateOrderStatus(orderId, nextStatus);
      await fetchOrders(); // 목록 새로고침
    } catch (e) {
      console.error("Failed to update order status:", e);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="고객명, 상품명 또는 주문 번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-pink-500" />
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-zinc-900">{order.orderNumber}</p>
                        <p className="text-xs text-zinc-500">{order.productName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{order.customerName}</td>
                    <td className="px-6 py-4 text-zinc-600">
                      {new Date(order.pickupDateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900">{order.totalPrice.toLocaleString()}원</td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-right space-x-2">
                      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, order.status)}
                        >
                          다음 단계
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">상세</Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-zinc-400">주문 내역이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
