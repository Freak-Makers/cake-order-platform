import {ErrorResponse, SuccessResponse} from "@/api/types";
import { ApiError } from "@/api/api-error";
import { showToast } from "@/lib/toast";

const baseUrl = 'http://localhost:8080';

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {

  let response: Response;

  // 호출자가 명시한 헤더를 우선하고, 토큰이 있으면 Authorization 자동 첨부
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (typeof window !== "undefined" && !headers.Authorization) {
    const token = localStorage.getItem("accessToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    response = await fetch(baseUrl + url, {
      credentials: "include",
      ...options,
      headers,
    });

  } catch (error) {
    // ✅ NETWORK ERROR — 백엔드 다운, DNS 실패, CORS 차단, 네트워크 단절 등
    // fetch 가 throw 한 시점이라 HTTP 응답 자체가 없음 → 4xx/5xx 분기로 가지 못함.
    // 4xx/5xx 와 같은 사용자 경험을 위해 페이지 하단 토스트로 알리고 그대로 throw.
    console.error("[NETWORK ERROR]", error);
    showToast("9000: 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      9000,
      null,
      error,
    );
  }

  // ✅ DEBUG BODY LOG
  const debug = response.clone();

  try {
    const body = await debug.json();
    console.log("[RESPONSE BODY]", body);
  } catch {
    console.log("[RESPONSE BODY] (not json)");
  }

  // ✅ HTTP ERROR (4xx, 5xx)
  if (!response.ok) {
    let errorBody: ErrorResponse | null = null;

    try {
      errorBody = await response.json();
    } catch {
      // body 없는 경우
    }

    console.debug("[HTTP ERROR]");
    console.debug("status:", response.status);

    if (errorBody) {
      showToast(`${errorBody.code}: ${errorBody.message}`);
      throw new ApiError(errorBody.message, errorBody.code, response.status, errorBody.details);
    } else {
      showToast("9999: 일시적인 오류입니다. 잠시 후 다시 시도해주세요.");
      throw new ApiError(`HTTP ${response.status}`, 9999, response.status);
    }
  }

  // ✅ SUCCESS INTERCEPTOR (Axios response.data 역할)
  const result: SuccessResponse<T> = await response.json();

  return result.data;
}

export default fetchApi;
