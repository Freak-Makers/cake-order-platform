"use client";

import { useEffect, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { getMyOrders } from "@/api/order.api";
import { Order } from "@/api/types";
import { Loader2, Package } from "lucide-react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (e) {
        console.error("Failed to fetch my orders:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "주문 대기";
      case "MAKING": return "제작 중";
      case "READY": return "픽업 대기";
      case "COMPLETED": return "수령 완료";
      case "CANCELLED": return "취소됨";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-amber-600 bg-amber-50";
      case "MAKING": return "text-blue-600 bg-blue-50";
      case "READY": return "text-pink-600 bg-pink-50";
      case "COMPLETED": return "text-green-600 bg-green-50";
      case "CANCELLED": return "text-red-600 bg-red-50";
      default: return "text-zinc-600 bg-zinc-50";
    }
  };

  return (
    <UserLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">내 주문 내역</h1>
        <p className="mt-2 text-zinc-500">주문하신 케이크의 진행 상황을 확인하세요.</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-zinc-400">
          <Package size={48} className="mb-4 opacity-20" />
          <p>아직 주문한 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        {order.orderNumber}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-1">{order.productName}</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                      픽업 일시: {new Date(order.pickupDateTime).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                      <p className="text-sm text-zinc-500">수량: {order.quantity}개</p>
                      <p className="text-lg font-bold text-zinc-900">
                        총 {order.totalPrice.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  {order.requirements && (
                    <div className="bg-zinc-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-zinc-100">
                      <p className="text-xs font-bold text-zinc-400 uppercase mb-2">요청 사항</p>
                      <p className="text-sm text-zinc-600">{order.requirements}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
