"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  AdminReservationsDirection,
  AdminReservationsSort,
  adminCancelReservation,
  confirmReservation,
  getAdminReservationsPage,
} from "@/api/reservation.api";
import { AdminReservation, ReservationStatus } from "@/api/types";
import { cn, formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "신청",
  CONFIRMED: "확정",
  PAID: "결제 완료",
  COMPLETED: "픽업 완료",
  CANCELLED: "취소",
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  REQUESTED: "bg-amber-50 text-amber-600",
  CONFIRMED: "bg-blue-50 text-blue-600",
  PAID: "bg-purple-50 text-purple-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-600",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS: { value: ReservationStatus | ""; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "REQUESTED", label: "신청" },
  { value: "CONFIRMED", label: "확정" },
  { value: "PAID", label: "결제 완료" },
  { value: "COMPLETED", label: "픽업 완료" },
  { value: "CANCELLED", label: "취소" },
];

export default function AdminReservationsPage() {
  const [items, setItems] = useState<AdminReservation[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "">("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [sortBy, setSortBy] = useState<AdminReservationsSort>("createdAt");
  const [sortDir, setSortDir] = useState<AdminReservationsDirection>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleSort = (field: AdminReservationsSort) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setOffset(0);
  };

  // 키워드 디바운스 (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminReservationsPage({
        offset,
        limit,
        status: statusFilter || undefined,
        keyword: debouncedKeyword || undefined,
        sort: sortBy,
        direction: sortDir,
      });
      setItems(data.items);
      setTotal(data.total);
      if (data.offset !== offset) setOffset(data.offset);
    } catch (e) {
      console.error("Failed to fetch reservations:", e);
    } finally {
      setIsLoading(false);
    }
  }, [offset, limit, statusFilter, debouncedKeyword, sortBy, sortDir]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleConfirm = async (id: number) => {
    setConfirmingId(id);
    try {
      await confirmReservation(id);
      await fetchReservations();
    } catch (e) {
      console.error("Failed to confirm reservation:", e);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("이 예약을 취소하시겠어요? PAID 상태라도 결제 row 는 그대로 — 환불은 별도로 처리해야 합니다.")) return;
    setConfirmingId(id);
    try {
      await adminCancelReservation(id);
      await fetchReservations();
    } catch (e) {
      console.error("Failed to cancel reservation:", e);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as ReservationStatus | "");
    setOffset(0);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setOffset(0);
  };

  // 키워드 변경 시 디바운스 후 offset 0 으로
  useEffect(() => {
    setOffset(0);
  }, [debouncedKeyword]);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = offset >= limit;
  const canNext = offset + items.length < total;

  const filterActive = statusFilter !== "" || debouncedKeyword !== "";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">예약 관리</h1>
            <p className="text-sm text-zinc-500">
              총 {total}건{filterActive && " (필터 적용)"}
            </p>
          </div>
        </div>

        {/* 필터 바 */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">상태</label>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs text-zinc-500">예약번호 검색</label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="RES-... 일부 입력"
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 테이블 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-100">
                  <tr className="text-zinc-400">
                    <th className="px-6 py-4 font-medium">예약 번호</th>
                    <SortableTh field="createdAt" label="신청 시간" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th className="px-6 py-4 font-medium">고객</th>
                    <th className="px-6 py-4 font-medium">상품</th>
                    <SortableTh field="slotStartAt" label="픽업 일시" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <SortableTh field="quantity" label="수량" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <SortableTh field="totalPrice" label="금액" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <SortableTh field="status" label="상태" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th className="px-6 py-4 text-right font-medium">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-zinc-400">불러오는 중...</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-zinc-400">
                        {filterActive ? "조건에 맞는 예약이 없습니다." : "예약이 없습니다."}
                      </td>
                    </tr>
                  ) : (
                    items.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50/60">
                        <td className="px-6 py-4 font-medium text-zinc-900">{r.reservationNumber}</td>
                        <td className="px-6 py-4 text-zinc-600">{new Date(r.createdAt).toLocaleString("ko-KR")}</td>
                        <td className="px-6 py-4 text-zinc-600">{r.customerName}</td>
                        <td className="px-6 py-4 text-zinc-600">{r.productName}</td>
                        <td className="px-6 py-4 text-zinc-600">{new Date(r.slotStartAt).toLocaleString("ko-KR")}</td>
                        <td className="px-6 py-4 text-zinc-600">{r.quantity}</td>
                        <td className="px-6 py-4 text-zinc-600">{formatPrice(r.totalPrice)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>
                            {STATUS_LABEL[r.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {r.status === "REQUESTED" && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirm(r.id)}
                                disabled={confirmingId === r.id}
                              >
                                {confirmingId === r.id ? "확정 중..." : "확정"}
                              </Button>
                            )}
                            {r.status !== "CANCELLED" && r.status !== "COMPLETED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(r.id)}
                                disabled={confirmingId === r.id}
                                className="text-red-600 hover:bg-red-50"
                              >
                                취소
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 페이지네이션 */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-zinc-500">
            <span>페이지당</span>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm focus:border-pink-500 focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}개
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500">
              <span className="font-bold text-zinc-900">{currentPage}</span> / {totalPages} 페이지
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => canPrev && setOffset(Math.max(0, offset - limit))}
                disabled={!canPrev || isLoading}
                className="gap-1"
              >
                <ChevronLeft size={14} />
                이전
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => canNext && setOffset(offset + limit)}
                disabled={!canNext || isLoading}
                className="gap-1"
              >
                다음
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SortableTh({
  field,
  label,
  sortBy,
  sortDir,
  onSort,
  align = "left",
}: {
  field: AdminReservationsSort;
  label: string;
  sortBy: AdminReservationsSort;
  sortDir: AdminReservationsDirection;
  onSort: (field: AdminReservationsSort) => void;
  align?: "left" | "right";
}) {
  const active = sortBy === field;
  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={cn("px-6 py-4 font-medium", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          active ? "text-zinc-900" : "hover:text-zinc-700",
        )}
      >
        {label}
        <Icon size={12} className={cn(!active && "opacity-40")} />
      </button>
    </th>
  );
}
