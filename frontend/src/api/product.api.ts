import apiClient from "@/api/api-client";
import { Product } from "@/api/types";

// User: 상품 목록 조회
export async function getProducts() {
  return apiClient.get<Product[]>("/api/v1/products");
}

// User: 상품 상세 조회
export async function getProduct(id: number) {
  return apiClient.get<Product>(`/api/v1/products/${id}`);
}

// Admin: 상품 등록
export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl: string;
}

export async function createProduct(data: CreateProductRequest) {
  return apiClient.post<Product, CreateProductRequest>("/api/v1/admin/products", data);
}

// Admin: 상품 수정
export async function updateProduct(id: number, data: Partial<CreateProductRequest>) {
  return apiClient.put<Product, Partial<CreateProductRequest>>(`/api/v1/admin/products/${id}`, data);
}

// Admin: 상품 삭제
export async function deleteProduct(id: number) {
  return apiClient.delete<void>(`/api/v1/admin/products/${id}`);
}
