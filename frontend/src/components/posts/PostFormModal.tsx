"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createPost, updatePost } from "@/api/post.api";
import { AdminPost, Product } from "@/api/types";

interface Props {
  mode: "create" | "edit";
  initial?: AdminPost;
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export function PostFormModal({ mode, initial, products, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productId, setProductId] = useState<string>("");
  const [isNotice, setIsNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setTitle(initial.title);
      setContent(initial.content);
      setImageUrl(initial.imageUrl ?? "");
      setProductId(initial.productId != null ? String(initial.productId) : "");
      setIsNotice(initial.isNotice);
    }
  }, [mode, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError("제목과 본문은 필수입니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
        productId: productId.trim() ? Number(productId) : null,
        isNotice,
      };
      if (mode === "create") {
        await createPost(body);
      } else if (initial) {
        await updatePost(initial.id, body);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save post:", err);
      setError("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[88vh]">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-bold text-zinc-900 sm:text-lg">
            {mode === "create" ? "새 게시글 작성" : "게시글 수정"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="신메뉴 출시! ..."
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">본문 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">이미지 URL (선택)</label>
            <div className="flex items-start gap-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
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
            <label className="mb-1 block text-sm font-medium text-zinc-700">연결 상품 (선택)</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
            >
              <option value="">연결 안 함</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.category}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={isNotice}
              onChange={(e) => setIsNotice(e.target.checked)}
              className="h-4 w-4 accent-pink-500"
            />
            <span className="font-medium">📌 공지로 지정 (목록 최상단 고정)</span>
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full gap-2 bg-pink-500 hover:bg-pink-600 sm:w-auto">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {mode === "create" ? "등록" : "저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
