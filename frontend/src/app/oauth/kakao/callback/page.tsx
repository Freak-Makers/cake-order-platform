"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {useEffect, useRef} from "react";
import {getKakaoLogin} from "@/api/user.api";
import {useAuth} from "@/context/AuthContext";

export default function KakaoCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const hasCalled = useRef(false);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    const handleKakaoLoginCallback = async () => {
      // 이미 호출된 경우 중복 실행 방지
      if (hasCalled.current) return;
      hasCalled.current = true;

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
        
        // Context를 통해 로그인 처리 및 토큰 저장
        login(accessToken);

        router.push("/");

      } catch (e) {
        console.error("Kakao login backend API error:", e);
        // 에러 발생 시 플래그를 초기화하여 재시도 가능하게 하거나 그대로 유지
        // 여기선 재시도보다는 에러 알림 후 리다이렉트
        alert("카카오 로그인에 실패했습니다.\n다시 시도해주세요.");
        router.push("/login?error=kakao_login_failed");
      }
    };

    handleKakaoLoginCallback();
  }, [code, router, state, login]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-lg text-zinc-700">카카오 로그인을 처리 중입니다...</p>
        <p className="mt-2 text-sm text-zinc-500">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
}
