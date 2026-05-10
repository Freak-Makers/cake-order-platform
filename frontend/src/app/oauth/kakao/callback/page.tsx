"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {useEffect} from "react";
import {getKakaoLogin} from "@/api/user.api";

export default function KakaoCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    const handleKakaoLoginCallback = async () => {
      // code 또는 state가 없으면 로그인 페이지로 에러와 함께 리다이렉트
      if (!code || !state) {
        console.error("Kakao login error: Missing code or state from URL parameters.");
        alert("카카오 로그인에 실패했습니다.\n다시 시도해주세요.");
        router.push("/login?error=kakao_missing_params");
        return;
      }

      try {
        // 백엔드 API로 code와 state를 전달하여 accessToken 요청
        const response = await getKakaoLogin(code);
        const accessToken = response.accessToken;
        console.log("Kakao login successful, accessToken received:", accessToken);
        // TODO: 발급받은 accessToken을 안전하게 저장 (예: localStorage, HttpOnly 쿠키, Context API 등)

        router.push("/");

      } catch (e) {
        console.error("Kakao login backend API error:", e);
        alert("카카오 로그인에 실패했습니다.\n다시 시도해주세요.");
        router.push("/login?error=kakao_login_failed");
      }
    };

    handleKakaoLoginCallback();
  }, [code, router, state]); // dependency empty → 최초 1번만 실행

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-lg text-zinc-700">카카오 로그인을 처리 중입니다...</p>
        <p className="mt-2 text-sm text-zinc-500">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
}
