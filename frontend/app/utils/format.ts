import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind 클래스 병합 — 조건부 클래스 + 충돌 클래스 정리
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 원화 포맷 (예: ₩45,000)
export function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}
