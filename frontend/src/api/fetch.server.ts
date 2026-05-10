import {ErrorResponse, SuccessResponse} from "@/api/types";

const baseUrl = 'http://localhost:8080';

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {

  let response: Response;

  try {
    response = await fetch(baseUrl + url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
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
