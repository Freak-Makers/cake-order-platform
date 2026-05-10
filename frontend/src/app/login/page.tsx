"use client";

import {useState} from "react";
import {Button} from "@/components/ui/Button";
import {MessageSquare} from "lucide-react";
import {getKakaoLoginUrl} from "@/api/user.api";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsLoading(true);

    try {
      const response = await getKakaoLoginUrl();

      // 카카오 로그인 페이지로 이동
      window.location.href = response.url;

    } catch (e) {
      console.warn(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-zinc-200/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500 text-white">
            <MessageSquare size={24} fill="currentColor"/>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Cake Admin</h1>
          <p className="mt-2 text-zinc-500">사장님, 서비스 이용을 위해 로그인해주세요.</p>
        </div>

        <Button
          onClick={handleKakaoLogin} // This now directly initiates the login process
          disabled={isLoading}
          className="w-full gap-3 bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90 focus-visible:ring-[#FEE500]"
        >
          {isLoading ? (
            "로그인 중..."
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 3c-4.97 0-9 3.134-9 7 0 2.508 1.657 4.7 4.156 6.014l-.994 3.64c-.06.222.063.45.27.55a.443.443 0 0 0 .185.04.456.456 0 0 0 .34-.153l4.288-2.858c.25.02.503.033.755.033 4.97 0 9-3.134 9-7s-4.03-7-9-7z"/>
              </svg>
              카카오로 로그인하기
            </>
          )}
        </Button>

        <div className="mt-8 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
          계정이 없으신가요? 로그인 시 자동으로 회원가입이 진행됩니다.
        </div>
      </div>

      {/* KakaoLoginModal is removed */}
    </div>
  );
}

