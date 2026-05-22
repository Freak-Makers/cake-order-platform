// 백엔드 호출 실패 시 fetch.ts 가 throw 하는 통일 에러 타입.
// 호출자 catch 에서 `e instanceof ApiError` 로 가드하면 code/httpStatus 를 일관되게 읽을 수 있음.
export class ApiError extends Error {
  constructor(
    message: string,
    // 백엔드 errorCode (1xxx 대) | 9000(네트워크 단절) | 9999(HTTP 4xx/5xx 인데 응답 바디 없음)
    public readonly code: number | string,
    // null = HTTP 응답 자체가 없었던 네트워크 에러
    public readonly httpStatus: number | null,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
