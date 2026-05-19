import apiClient from "@/api/api-client";
import { Favorite } from "@/api/types";

// 찜 추가 (멱등 — 이미 찜한 상태면 백엔드가 그대로 통과)
export async function addFavorite(productId: number) {
  return apiClient.post<void>(`/api/v1/favorites/${productId}`);
}

// 찜 제거 (멱등 — 없으면 그대로 통과)
export async function removeFavorite(productId: number) {
  return apiClient.delete<void>(`/api/v1/favorites/${productId}`);
}

// 내 찜 목록 (최신 추가순)
export async function getMyFavorites() {
  return apiClient.get<Favorite[]>("/api/v1/favorites/my");
}
