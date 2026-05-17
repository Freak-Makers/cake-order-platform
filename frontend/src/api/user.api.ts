import apiClient from "@/api/api-client";

export interface KakaoLoginUrlResponse {
  url: string;
}

export async function getKakaoLoginUrl() {
  return apiClient.get<KakaoLoginUrlResponse>(
    "/api/v1/users/login/kakao/url"
  );
}

export interface KakaoLoginSuccessResponse {
  id: number;
  nickname: string;
  email?: string | null;
  profileImageUrl?: string | null;
  accessToken: string;
}

export async function getKakaoLogin(code: string) {
  const query = new URLSearchParams({
    code,
  });

  return apiClient.get<KakaoLoginSuccessResponse>(
    `/api/v1/users/login/kakao?${query.toString()}`
  );
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  id: number;
  nickname: string;
  email?: string | null;
  role: string;
  accessToken: string;
}

export async function loginAdmin(data: AdminLoginRequest) {
  return apiClient.post<AdminLoginResponse, AdminLoginRequest>(
    "/api/v1/admin/users/login",
    data
  );
}