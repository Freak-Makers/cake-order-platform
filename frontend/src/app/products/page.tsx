"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, ChevronRight, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { deleteProduct, getAdminProducts } from "@/api/product.api";
import { Product } from "@/api/types";
import { ProductFormModal } from "@/components/products/ProductFormModal";

const STATUS_BADGE: Record<Product["status"], string> = {
  AVAILABLE: "bg-green-50 text-green-600",
  SOLD_OUT: "bg-red-50 text-red-600",
  HIDDEN: "bg-zinc-100 text-zinc-500",
};
const STATUS_LABEL: Record<Product["status"], string> = {
  AVAILABLE: "판매 중",
  SOLD_OUT: "품절",
  HIDDEN: "숨김",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminProducts(offset, limit);
      setItems(data.items);
      setTotal(data.total);
      // 백엔드가 보정한 offset 으로 동기화
      if (data.offset !== offset) setOffset(data.offset);
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setIsLoading(false);
    }
  }, [offset, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      // 마지막 항목 삭제로 페이지가 비게 되면 이전 페이지로
      if (items.length === 1 && offset >= limit) {
        setOffset(offset - limit);
      } else {
        await fetchProducts();
      }
    } catch (e) {
      console.error("Failed to delete product:", e);
    } finally {
      setDeletingId(null);
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = offset >= limit;
  const canNext = offset + items.length < total;

  const handlePrev = () => canPrev && setOffset(Math.max(0, offset - limit));
  const handleNext = () => canNext && setOffset(offset + limit);
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setOffset(0);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">상품 관리</h1>
          <p className="text-sm text-zinc-500">총 {total}건</p>
        </div>
        <Button className="gap-2 bg-pink-500 hover:bg-pink-600" onClick={handleOpenCreate}>
          <Plus size={18} />
          새 상품 등록
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">이미지</th>
                  <th className="px-6 py-3 font-medium">상품명</th>
                  <th className="px-6 py-3 font-medium">카테고리</th>
                  <th className="px-6 py-3 font-medium text-right">가격</th>
                  <th className="px-6 py-3 font-medium">상태</th>
                  <th className="px-6 py-3 text-right font-medium">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-400">
                      등록된 상품이 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/60">
                      <td className="px-6 py-3">
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-zinc-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3 font-medium text-zinc-900">{p.name}</td>
                      <td className="px-6 py-3 text-zinc-600">{p.category}</td>
                      <td className="px-6 py-3 text-right text-zinc-900">{p.price.toLocaleString()}원</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}>
                          {STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            onClick={() => handleOpenEdit(p)}
                          >
                            <Edit2 size={14} />
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            <Trash2 size={14} />
                            {deletingId === p.id ? "삭제 중..." : "삭제"}
                          </Button>
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

      {/* 페이지네이션 컨트롤 */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
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
              onClick={handlePrev}
              disabled={!canPrev || isLoading}
              className="gap-1"
            >
              <ChevronLeft size={14} />
              이전
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNext}
              disabled={!canNext || isLoading}
              className="gap-1"
            >
              다음
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductFormModal
          mode={editingProduct ? "edit" : "create"}
          initial={editingProduct ?? undefined}
          onClose={handleCloseModal}
          onSuccess={fetchProducts}
        />
      )}
    </DashboardLayout>
  );
}
