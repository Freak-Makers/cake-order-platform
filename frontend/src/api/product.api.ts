import apiClient from "@/api/api-client";
import { AdminProductsResponse, Product, ProductSort, ProductStatus, ProductsResponse } from "@/api/types";

export interface GetProductsParams {
  cursor?: string | null;
  limit?: number;
  category?: string | null;
  sort?: ProductSort;
}

// User: 상품 목록 조회 (커서 페이지네이션, public)
export async function getProducts(params: GetProductsParams = {}) {
  const qs = new URLSearchParams();
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.category && params.category !== "전체") qs.set("category", params.category);
  if (params.sort) qs.set("sort", params.sort);
  const query = qs.toString();
  return apiClient.get<ProductsResponse>(`/api/v1/products${query ? `?${query}` : ""}`);
}

// User: 상품 카테고리 목록
export async function getProductCategories() {
  return apiClient.get<string[]>("/api/v1/products/categories");
}

// Admin: 상품 목록 조회 (offset 기반 페이지네이션, 최신순)
export async function getAdminProducts(offset = 0, limit = 20) {
  const qs = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return apiClient.get<AdminProductsResponse>(`/api/v1/admin/products?${qs}`);
}

// User: 상품 상세 조회
export async function getProduct(id: number) {
  return apiClient.get<Product>(`/api/v1/products/${id}`);
}

// Admin: 상품 등록 / 수정 공용 페이로드 (수정은 모든 필드 optional 로 전달)
export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl: string;
  status?: ProductStatus;
}

export async function createProduct(data: CreateProductRequest) {
  return apiClient.post<Product, CreateProductRequest>("/api/v1/admin/products", data);
}

// Admin: 상품 수정 (보낸 필드만 갱신)
export async function updateProduct(id: number, data: Partial<CreateProductRequest>) {
  return apiClient.put<Product, Partial<CreateProductRequest>>(`/api/v1/admin/products/${id}`, data);
}

// Admin: 상품 삭제
export async function deleteProduct(id: number) {
  return apiClient.delete<void>(`/api/v1/admin/products/${id}`);
}
