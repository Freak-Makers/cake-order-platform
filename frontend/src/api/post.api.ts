import apiClient from "@/api/api-client";
import {
  AdminPost,
  AdminPostsResponse,
  Comment,
  CommentsResponse,
  Post,
  PostsResponse,
} from "@/api/types";

// User: 게시글 목록 (offset 페이지네이션 + 키워드 필터, 공지 최상단 → 최신순)
export interface PostsQuery {
  offset?: number;
  limit?: number;
  keyword?: string;
}
export async function getAllPostsPage(params: PostsQuery = {}) {
  const qs = new URLSearchParams();
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.keyword && params.keyword.trim()) qs.set("keyword", params.keyword.trim());
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiClient.get<PostsResponse>(`/api/v1/posts${suffix}`);
}

// User: 게시글 상세 (호출 시 조회수 +1)
export async function getPost(id: number) {
  return apiClient.get<Post>(`/api/v1/posts/${id}`);
}

// User: 게시글 좋아요 토글
export async function togglePostLike(id: number) {
  return apiClient.post<void>(`/api/v1/posts/${id}/like`);
}

// User: 댓글 목록 (offset 페이지네이션)
export async function getComments(postId: number, offset = 0, limit = 5) {
  const qs = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return apiClient.get<CommentsResponse>(`/api/v1/posts/${postId}/comments?${qs}`);
}

// User: 댓글 작성
export interface CreateCommentRequest {
  content: string;
}
export async function createComment(postId: number, data: CreateCommentRequest) {
  return apiClient.post<Comment, CreateCommentRequest>(
    `/api/v1/posts/${postId}/comments`,
    data
  );
}

// User: 댓글 수정 (작성자 본인만)
export async function updateComment(postId: number, commentId: number, data: CreateCommentRequest) {
  return apiClient.put<Comment, CreateCommentRequest>(
    `/api/v1/posts/${postId}/comments/${commentId}`,
    data
  );
}

// User: 댓글 삭제 (작성자 본인만, 서버 소프트 딜리트)
export async function deleteComment(postId: number, commentId: number) {
  return apiClient.delete<void>(`/api/v1/posts/${postId}/comments/${commentId}`);
}

// Admin: 게시글 목록 (offset 기반 페이지네이션, 공지 먼저 → 최신순)
export async function getAdminPostsPage(offset = 0, limit = 20) {
  const qs = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return apiClient.get<AdminPostsResponse>(`/api/v1/admin/posts?${qs}`);
}

// Admin: 게시글 등록
export interface CreatePostRequest {
  title: string;
  content: string;
  productId?: number | null;
  imageUrl?: string | null;
  isNotice?: boolean;
}
export async function createPost(data: CreatePostRequest) {
  return apiClient.post<AdminPost, CreatePostRequest>("/api/v1/admin/posts", data);
}

// Admin: 게시글 수정 (보낸 필드만 갱신)
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  productId?: number | null;
  imageUrl?: string | null;
  isNotice?: boolean;
}
export async function updatePost(id: number, data: UpdatePostRequest) {
  return apiClient.put<AdminPost, UpdatePostRequest>(`/api/v1/admin/posts/${id}`, data);
}

// Admin: 게시글 삭제 (서버에서 soft delete 처리)
export async function deletePost(id: number) {
  return apiClient.delete<void>(`/api/v1/admin/posts/${id}`);
}
