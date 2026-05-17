import {ErrorResponse, SuccessResponse} from "@/api/types";

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
    // ✅ NETWORK ERROR
    console.error("[NETWORK ERROR]", error);
    throw error;
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
      alert(`${errorBody?.code}: ${errorBody?.message}`);
    } else {
      alert(`9999: 일시적인 오류입니다. 잠시 후 시돋해주세요.`);
    }

    throw errorBody ?? new Error(`HTTP ${response.status}`);
  }

  // ✅ SUCCESS INTERCEPTOR (Axios response.data 역할)
  const result: SuccessResponse<T> = await response.json();

  return result.data;
}

export default fetchApi;
