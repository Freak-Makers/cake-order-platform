"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, ChevronRight, Edit2, Eye, Heart, Plus, Trash2 } from "lucide-react";
import { deletePost, getAdminPostsPage } from "@/api/post.api";
import { getProducts } from "@/api/product.api";
import { AdminPost, Product } from "@/api/types";
import { PostFormModal } from "@/components/posts/PostFormModal";
import { PostDetailModal } from "@/components/posts/PostDetailModal";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AdminPostsPage() {
  const [items, setItems] = useState<AdminPost[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [detailPost, setDetailPost] = useState<AdminPost | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminPostsPage(offset, limit);
      setItems(data.items);
      setTotal(data.total);
      if (data.offset !== offset) setOffset(data.offset);
    } catch (e) {
      console.error("Failed to fetch admin posts:", e);
    } finally {
      setIsLoading(false);
    }
  }, [offset, limit]);

  const fetchProducts = async () => {
    try {
      setProducts((await getProducts({ limit: 100 })).items);
    } catch (e) {
      console.error("Failed to fetch products:", e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const productNameById = (id: number | null | undefined) =>
    id == null ? null : products.find((p) => p.id === id)?.name ?? `상품 #${id}`;

  const handleOpenCreate = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (post: AdminPost) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPost(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까? 연결된 댓글·좋아요가 함께 정리됩니다.")) return;
    setDeletingId(id);
    try {
      await deletePost(id);
      if (items.length === 1 && offset >= limit) {
        setOffset(offset - limit);
      } else {
        await fetchPosts();
      }
    } catch (e) {
      console.error("Failed to delete post:", e);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">게시글 관리</h1>
            <p className="text-sm text-zinc-500">총 {total}건</p>
          </div>
          <Button className="gap-2 bg-pink-500 hover:bg-pink-600" onClick={handleOpenCreate}>
            <Plus size={18} />
            새 게시글 작성
          </Button>
        </div>

        {isLoading ? (
          <p className="text-zinc-500">불러오는 중...</p>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-zinc-400">
              아직 등록된 게시글이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {items.map((p) => (
              <li key={p.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailPost(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetailPost(p);
                    }
                  }}
                  className="block w-full cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 text-left transition-shadow hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {p.isNotice && (
                          <span className="shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            공지
                          </span>
                        )}
                        <p className="truncate font-medium text-zinc-900">{p.title}</p>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{p.content}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {p.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> {p.likeCount}
                        </span>
                        <span>·</span>
                        <span>{new Date(p.createdAt).toLocaleString("ko-KR")}</span>
                        {p.productId != null && (
                          <>
                            <span>·</span>
                            <span className="text-pink-500">{productNameById(p.productId)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(p);
                        }}
                        className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                        aria-label="수정"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        disabled={deletingId === p.id}
                        className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        aria-label="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

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
      </div>

      {isFormOpen && (
        <PostFormModal
          mode={editingPost ? "edit" : "create"}
          initial={editingPost ?? undefined}
          products={products}
          onClose={handleCloseForm}
          onSuccess={fetchPosts}
        />
      )}

      {detailPost && (
        <PostDetailModal
          post={detailPost}
          products={products}
          onClose={() => setDetailPost(null)}
        />
      )}
    </DashboardLayout>
  );
}
