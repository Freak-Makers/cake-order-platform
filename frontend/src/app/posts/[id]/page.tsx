"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  getPost,
  togglePostLike,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/api/post.api";
import { Comment, Post } from "@/api/types";
import { ChevronLeft, ChevronRight, Eye, Heart, MessageSquare, Pencil, Trash2, X, Check } from "lucide-react";

const COMMENT_PAGE_SIZE = 5;

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);
  const { isLoggedIn } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [commentOffset, setCommentOffset] = useState(0);
  const [commentReloadTick, setCommentReloadTick] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 인라인 수정 상태: 어떤 댓글이 편집 중인지(commentId) + 현재 입력값
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // 게시글 본문은 한 번만
  useEffect(() => {
    if (!postId) return;
    getPost(postId)
      .then(setPost)
      .catch((e) => console.error("Failed to load post:", e))
      .finally(() => setIsLoading(false));
  }, [postId]);

  // 댓글: offset / reloadTick 변경 시 재조회. cleanup 으로 stale 응답 무시.
  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    setIsCommentsLoading(true);
    getComments(postId, commentOffset, COMMENT_PAGE_SIZE)
      .then((data) => {
        if (cancelled) return;
        console.log("[comments] fetched", {
          offset: commentOffset,
          got: data.items.length,
          total: data.total,
          ids: data.items.map((c) => c.id),
        });
        setComments(data.items);
        setTotalComments(data.total);
      })
      .catch((e) => {
        if (!cancelled) console.error("Failed to load comments:", e);
      })
      .finally(() => {
        if (!cancelled) setIsCommentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId, commentOffset, commentReloadTick]);

  const handleLike = async () => {
    if (!post || !isLoggedIn) return;
    try {
      await togglePostLike(post.id);
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
      });
    } catch (e) {
      console.error("Failed to toggle like:", e);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isLoggedIn) return;
    setIsSubmitting(true);
    try {
      await createComment(postId, { content: commentText.trim() });
      setCommentText("");
      // 새 댓글이 첫 페이지 위에 오도록 offset 0 으로 리셋
      if (commentOffset !== 0) {
        setCommentOffset(0); // 의존성 변경 → 자동 재조회
      } else {
        setCommentReloadTick((t) => t + 1); // offset 동일하면 tick 으로 트리거
      }
    } catch (e) {
      console.error("Failed to create comment:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditingText(c.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editingText.trim()) return;
    try {
      const updated = await updateComment(postId, commentId, { content: editingText.trim() });
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      cancelEditing();
    } catch (e) {
      console.error("Failed to update comment:", e);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    try {
      await deleteComment(postId, commentId);
      // 현재 페이지에서 삭제된 댓글만 빼고 total 도 보정. 페이지가 비면 한 페이지 앞으로 당김.
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalComments((t) => Math.max(0, t - 1));
      if (comments.length === 1 && commentOffset >= COMMENT_PAGE_SIZE) {
        setCommentOffset(Math.max(0, commentOffset - COMMENT_PAGE_SIZE));
      } else {
        setCommentReloadTick((t) => t + 1);
      }
    } catch (e) {
      console.error("Failed to delete comment:", e);
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <p className="text-zinc-500">불러오는 중...</p>
      </UserLayout>
    );
  }

  if (!post) {
    return (
      <UserLayout>
        <p className="text-zinc-500">게시글을 찾을 수 없습니다.</p>
      </UserLayout>
    );
  }

  const commentPage = Math.floor(commentOffset / COMMENT_PAGE_SIZE) + 1;
  const totalCommentPages = Math.max(1, Math.ceil(totalComments / COMMENT_PAGE_SIZE));
  const canPrev = commentOffset >= COMMENT_PAGE_SIZE;
  const canNext = commentOffset + comments.length < totalComments;

  return (
    <UserLayout>
      <article className="space-y-6">
        <header className="space-y-3">
          <div className="flex items-start gap-2">
            {post.isNotice && (
              <span className="mt-1 shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white">
                공지
              </span>
            )}
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{post.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 sm:gap-4">
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={16} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "text-pink-500" : ""} />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={16} />
              {totalComments}
            </span>
          </div>
        </header>

        {post.imageUrl && (
          <div className="overflow-hidden rounded-xl bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        <div className="whitespace-pre-wrap text-zinc-700 leading-relaxed">{post.content}</div>

        <div>
          <Button
            variant={post.isLiked ? "default" : "outline"}
            onClick={handleLike}
            disabled={!isLoggedIn}
            className="gap-2"
          >
            <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
            좋아요 {post.likeCount}
          </Button>
          {!isLoggedIn && (
            <p className="mt-2 text-xs text-zinc-400">좋아요는 로그인 후 가능합니다.</p>
          )}
        </div>

        <section className="space-y-4 border-t border-zinc-100 pt-6">
          <h2 className="text-lg font-bold">댓글 {totalComments}</h2>

          {isLoggedIn ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none"
              />
              <Button type="submit" disabled={isSubmitting || !commentText.trim()}>
                {isSubmitting ? "등록 중..." : "등록"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-zinc-400">댓글은 로그인 후 작성할 수 있습니다.</p>
          )}

          {isCommentsLoading ? (
            <p className="text-sm text-zinc-400">댓글을 불러오는 중...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-zinc-400">아직 댓글이 없습니다.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {comments.map((c) => {
                  const isEditing = editingCommentId === c.id;
                  return (
                    <li key={c.id} className="rounded-lg border border-zinc-100 bg-white p-4">
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-700">{c.authorName}</span>
                          <span>·</span>
                          <span>{new Date(c.createdAt).toLocaleString("ko-KR")}</span>
                        </div>
                        {c.isMine && !isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditing(c)}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                              title="수정"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-sm focus:border-pink-500 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(c.id)}
                            disabled={!editingText.trim()}
                            className="rounded-md bg-pink-500 px-2 py-1 text-white hover:bg-pink-600 disabled:opacity-50"
                            title="저장"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-500 hover:bg-zinc-50"
                            title="취소"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{c.content}</p>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-500">
                  <span className="font-bold text-zinc-900">{commentPage}</span> / {totalCommentPages} 페이지
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      canPrev && setCommentOffset(Math.max(0, commentOffset - COMMENT_PAGE_SIZE))
                    }
                    disabled={!canPrev || isCommentsLoading}
                    className="gap-1"
                  >
                    <ChevronLeft size={14} />
                    이전
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => canNext && setCommentOffset(commentOffset + COMMENT_PAGE_SIZE)}
                    disabled={!canNext || isCommentsLoading}
                    className="gap-1"
                  >
                    다음
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </article>
    </UserLayout>
  );
}
