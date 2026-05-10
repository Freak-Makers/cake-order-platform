"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      completeLogin(code);
    }
  }, [code]);

  const completeLogin = async (authCode: string) => {
    try {
      // Backend: @GetMapping("/login/kakao") fun login(@RequestParam code: String)
      await api.get(`/api/v1/users/login/kakao?code=${authCode}`);
      // Success! Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login completion failed", error);
      // Redirect back to login with error
      router.push("/login?error=auth_failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      <p className="mt-4 text-zinc-600 font-medium">로그인 처리 중입니다...</p>
    </div>
  );
}
