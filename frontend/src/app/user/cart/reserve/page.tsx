"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { getAvailableSlots, createReservation } from "@/api/reservation.api";
import { ReservationSlot } from "@/api/types";

// 카트 항목 1건당 입력 상태. key 는 productId.
interface ItemForm {
  slotId: number | null;
  requirements: string;
}

export default function CartReservePage() {
  const router = useRouter();
  const { items, removeItem, clearCart } = useCart();

  const [slots, setSlots] = useState<ReservationSlot[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [forms, setForms] = useState<Record<number, ItemForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // CartContext 가 localStorage 에서 비동기 로드하므로, 초기 빈 상태 ↔ 실제 빈 상태를 구분하기 위한 가드.
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCartReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    getAvailableSlots()
      .then((s) => {
        setSlots(s);
        setSlotsLoaded(true);
      })
      .catch(() => {
        // 토스트는 fetch.server.ts 가 책임. 페이지는 슬롯 0개 상태로 둠.
        setSlotsLoaded(true);
      });
  }, []);

  // 카트 항목이 변할 때 폼 동기화 (새 항목은 빈 폼으로, 사라진 항목은 제거)
  useEffect(() => {
    setForms((prev) => {
      const next: Record<number, ItemForm> = {};
      for (const item of items) {
        next[item.id] = prev[item.id] ?? { slotId: null, requirements: "" };
      }
      return next;
    });
  }, [items]);

  // 다른 항목이 이미 선택한 슬롯 ID — UI 에서 disabled 처리
  const usedSlotIdsExcluding = (excludeProductId: number): Set<number> => {
    const used = new Set<number>();
    for (const item of items) {
      if (item.id === excludeProductId) continue;
      const sid = forms[item.id]?.slotId;
      if (sid != null) used.add(sid);
    }
    return used;
  };

  const allSlotPicked = useMemo(
    () => items.length > 0 && items.every((it) => forms[it.id]?.slotId != null),
    [items, forms],
  );

  const updateForm = (productId: number, patch: Partial<ItemForm>) => {
    setForms((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] ?? { slotId: null, requirements: "" }), ...patch },
    }));
  };

  const handleSubmit = async () => {
    if (!allSlotPicked || isSubmitting) return;
    setIsSubmitting(true);
    const succeededProductIds: number[] = [];
    try {
      // 순차 호출 — 중간 실패 시 그 시점에서 중단. 성공한 건은 카트에서 제거.
      for (const item of items) {
        const f = forms[item.id];
        if (!f?.slotId) continue;
        await createReservation({
          productId: item.id,
          slotId: f.slotId,
          quantity: item.quantity,
          requirements: f.requirements.trim() || null,
        });
        succeededProductIds.push(item.id);
      }
      clearCart();
      router.replace("/user/reservations");
    } catch (e) {
      // 토스트는 글로벌(fetch.server.ts)이 띄움. 페이지는 부분 성공 정리만.
      console.error("Reservation creation failed mid-way:", e);
      for (const pid of succeededProductIds) {
        removeItem(pid);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartReady) {
    return (
      <UserLayout>
        <p className="text-zinc-500">불러오는 중...</p>
      </UserLayout>
    );
  }

  if (items.length === 0) {
    return (
      <UserLayout>
        <div className="mx-auto max-w-xl space-y-4 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">장바구니가 비어 있습니다</h1>
          <p className="text-sm text-zinc-500">상품을 담으신 뒤 다시 시도해주세요.</p>
          <Button onClick={() => router.push("/user/products")} className="bg-pink-500 hover:bg-pink-600">
            상품 보러 가기
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">예약 작성</h1>
          <p className="mt-1 text-sm text-zinc-500">
            장바구니의 각 상품에 픽업 슬롯을 선택해주세요. 한 슬롯은 한 예약에만 배정됩니다.
          </p>
        </div>

        {slotsLoaded && slots.length === 0 ? (
          <div className="rounded-lg bg-amber-50 p-6 text-center text-sm text-amber-800 space-y-3">
            <p>현재 예약 가능한 시간이 없습니다.</p>
            <Button variant="outline" onClick={() => router.push("/user/products")}>
              상품으로 돌아가기
            </Button>
          </div>
        ) : (
          <>
            {items.map((item) => {
              const f = forms[item.id];
              const used = usedSlotIdsExcluding(item.id);
              return (
                <div key={item.id} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-zinc-900">{item.name}</h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        {item.quantity}개 · {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      픽업 슬롯 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={f?.slotId ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateForm(item.id, { slotId: v ? Number(v) : null });
                      }}
                      disabled={!slotsLoaded || isSubmitting}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    >
                      <option value="">{slotsLoaded ? "슬롯 선택..." : "불러오는 중..."}</option>
                      {slots.map((s) => {
                        const isUsedElsewhere = used.has(s.id);
                        return (
                          <option key={s.id} value={s.id} disabled={isUsedElsewhere}>
                            {new Date(s.startAt).toLocaleString("ko-KR")}
                            {isUsedElsewhere ? " (다른 항목에서 선택됨)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">요구사항 (선택)</label>
                    <textarea
                      value={f?.requirements ?? ""}
                      onChange={(e) => updateForm(item.id, { requirements: e.target.value })}
                      disabled={isSubmitting}
                      placeholder="알러지, 메시지 등"
                      rows={2}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/user/products")}
                disabled={isSubmitting}
                className="w-full sm:flex-1"
              >
                상품 더 보기
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!allSlotPicked || isSubmitting}
                className="w-full bg-pink-500 hover:bg-pink-600 sm:flex-[2]"
              >
                {isSubmitting ? "예약 신청 중..." : `${items.length}건 예약 신청`}
              </Button>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}
