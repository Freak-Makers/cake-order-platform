"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserLayout } from "@/components/layout/UserLayout";
import { getAllPostsPage } from "@/api/post.api";
import { Post } from "@/api/types";
import { ChevronLeft, ChevronRight, Eye, Heart, ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function PostsPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    setOffset(0);
  }, [debouncedKeyword]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllPostsPage({
        offset,
        limit,
        keyword: debouncedKeyword || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
      if (data.offset !== offset) setOffset(data.offset);
    } catch (e) {
      console.error("Failed to fetch posts:", e);
    } finally {
      setIsLoading(false);
    }
  }, [offset, limit, debouncedKeyword]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = offset >= limit;
  const canNext = offset + items.length < total;

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">홍보 게시글</h1>
            <p className="mt-1 text-sm text-zinc-500">
              총 {total}건{debouncedKeyword && ` · "${debouncedKeyword}" 검색`}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="제목으로 검색"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-zinc-500">불러오는 중...</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center text-zinc-400">
            {debouncedKeyword
              ? "검색 결과가 없습니다."
              : "아직 등록된 게시글이 없습니다."}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-zinc-300">
                    {post.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <ImageIcon size={22} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {post.isNotice && (
                        <span className="shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          공지
                        </span>
                      )}
                      <h2 className="truncate text-sm font-bold text-zinc-900">{post.title}</h2>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{post.content}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-zinc-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.viewCount}
                      </span>
                      <span className={`flex items-center gap-1 ${post.isLiked ? "text-pink-500" : ""}`}>
                        <Heart size={12} fill={post.isLiked ? "currentColor" : "none"} />
                        {post.likeCount}
                      </span>
                    </div>
                    <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                </Link>
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
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setOffset(0);
              }}
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
    </UserLayout>
  );
}
