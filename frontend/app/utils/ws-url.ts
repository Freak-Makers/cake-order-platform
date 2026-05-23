import { useRuntimeConfig } from "#imports";

// apiBase (http(s)) 를 ws(s) 로 치환한 STOMP 엔드포인트 URL 을 반환.
// 예: http://localhost:8080 → ws://localhost:8080/ws
//     https://api.example.com → wss://api.example.com/ws
export function resolveWsUrl(): string {
  const base = useRuntimeConfig().public.apiBase as string;
  const wsBase = base.replace(/^http/i, "ws");
  return `${wsBase.replace(/\/$/, "")}/ws`;
}
