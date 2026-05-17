import apiClient from "@/api/api-client";
import { Review } from "@/api/types";

// 상품별 후기 목록 조회
export async function getProductReviews(productId: number) {
  return apiClient.get<Review[]>(`/api/v1/products/${productId}/reviews`);
}

// 후기 등록
export interface CreateReviewRequest {
  content: string;
  rating: number;
}

export async function createReview(productId: number, data: CreateReviewRequest) {
  return apiClient.post<Review, CreateReviewRequest>(`/api/v1/products/${productId}/reviews`, data);
}

// 후기 좋아요 토글
export async function toggleReviewLike(reviewId: number) {
  return apiClient.post<void, {}>(`/api/v1/reviews/${reviewId}/like`, {});
}
