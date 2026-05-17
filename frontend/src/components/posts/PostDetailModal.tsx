"use client";

import { Eye, Heart, X } from "lucide-react";
import { AdminPost, Product } from "@/api/types";

interface Props {
  post: AdminPost;
  products: Product[];
  onClose: () => void;
}

export function PostDetailModal({ post, products, onClose }: Props) {
  const product = post.productId != null ? products.find((p) => p.id === post.productId) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[80vh] max-w-2xl -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">게시글 상세</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          <div className="flex items-start gap-2">
            {post.isNotice && (
              <span className="shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white">
                공지
              </span>
            )}
            <h1 className="text-xl font-bold text-zinc-900">{post.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {post.likeCount}
            </span>
            <span>·</span>
            <span>{new Date(post.createdAt).toLocaleString("ko-KR")}</span>
            {product && (
              <>
                <span>·</span>
                <span className="rounded-full bg-pink-50 px-2 py-0.5 text-pink-600">
                  [{product.category}] {product.name}
                </span>
              </>
            )}
          </div>

          {post.imageUrl && (
            <div className="overflow-hidden rounded-xl bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{post.content}</p>
        </div>
      </div>
    </>
  );
}
