"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createProduct, updateProduct } from "@/api/product.api";
import { Product, ProductStatus } from "@/api/types";

interface Props {
  mode: "create" | "edit";
  initial?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "AVAILABLE", label: "판매 중" },
  { value: "SOLD_OUT", label: "품절" },
  { value: "HIDDEN", label: "숨김" },
];

export function ProductFormModal({ mode, initial, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProductStatus>("AVAILABLE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setName(initial.name);
      setCategory(initial.category);
      setPrice(String(initial.price));
      setImageUrl(initial.imageUrl);
      setDescription(initial.description ?? "");
      setStatus(initial.status);
    }
  }, [mode, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    if (!name.trim() || !category.trim() || !imageUrl.trim() || !description.trim()) {
      setError("모든 필드를 입력해주세요.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("가격은 0보다 큰 숫자여야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createProduct({
          name: name.trim(),
          description: description.trim(),
          category: category.trim(),
          price: priceNum,
          imageUrl: imageUrl.trim(),
        });
      } else if (initial) {
        await updateProduct(initial.id, {
          name: name.trim(),
          description: description.trim(),
          category: category.trim(),
          price: priceNum,
          imageUrl: imageUrl.trim(),
          status,
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      console.error("Failed to save product:", e);
      setError("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-2xl -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">
            {mode === "create" ? "새 상품 등록" : "상품 수정"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] space-y-5 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">상품명 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="생딸기 생크림 케이크"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">카테고리 *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                placeholder="홀케이크"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">가격 (원) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="45000"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            {mode === "edit" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">노출 상태</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이미지 URL *</label>
            <div className="flex items-start gap-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                placeholder="https://..."
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-300">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="미리보기"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <ImageIcon size={28} />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">상품 설명 *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="국산 설향 딸기가 듬뿍 들어간 케이크"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 bg-pink-500 hover:bg-pink-600">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {mode === "create" ? "등록" : "저장"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
