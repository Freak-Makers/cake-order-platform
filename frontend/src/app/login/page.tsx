"use client";

import {useState} from "react";
import {Button} from "@/components/ui/Button";
import {MessageSquare, User, ShieldCheck, Lock, Mail, ChevronLeft} from "lucide-react";
import {getKakaoLoginUrl, loginAdmin} from "@/api/user.api";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      const response = await getKakaoLoginUrl();
      window.location.href = response.url;
    } catch (e) {
      console.warn(e);
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginAdmin({
        email: adminEmail,
        password: adminPassword,
      });
      login(response.accessToken, response.role, {
        id: response.id,
        nickname: response.nickname,
        email: response.email ?? adminEmail ?? null,
        profileImageUrl: null,
        provider: "ADMIN",
      });
      router.push("/dashboard");
    } catch (e) {
      console.error("Admin login failed:", e);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl shadow-zinc-200/50">
        {/* Header */}
        <div className="relative bg-white p-6 pb-4 text-center sm:p-8">
          <Link
            href="/"
            className="absolute left-4 top-6 flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-600 sm:left-6 sm:top-8"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">홈으로</span>
          </Link>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500 text-white">
            <MessageSquare size={24} fill="currentColor"/>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Cake Admin</h1>
          <p className="mt-2 text-sm text-zinc-500 sm:text-base">원하시는 체험 모드를 선택해주세요.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              activeTab === "admin"
                ? "border-b-2 border-pink-500 text-pink-600"
                : "text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            <ShieldCheck size={18} />
            사장님 체험
          </button>
          <button
            onClick={() => setActiveTab("user")}
            className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              activeTab === "user"
                ? "border-b-2 border-pink-500 text-pink-600"
                : "text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            <User size={18} />
            사용자 체험
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {activeTab === "admin" ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700" htmlFor="email">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700" htmlFor="password">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    id="password"
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 h-11 bg-pink-500 hover:bg-pink-600 text-white"
              >
                {isLoading ? "로그인 중..." : "관리자 로그인"}
              </Button>
              <p className="text-center text-xs text-zinc-400 mt-4">
                사장님 전용 관리 도구를 체험해볼 수 있습니다.
              </p>
            </form>
          ) : (
            <div className="space-y-6">
              <Button
                onClick={handleKakaoLogin}
                disabled={isLoading}
                className="w-full h-11 gap-3 bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90 focus-visible:ring-[#FEE500]"
              >
                {isLoading ? (
                  "연결 중..."
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 3c-4.97 0-9 3.134-9 7 0 2.508 1.657 4.7 4.156 6.014l-.994 3.64c-.06.222.063.45.27.55a.443.443 0 0 0 .185.04.456.456 0 0 0 .34-.153l4.288-2.858c.25.02.503.033.755.033 4.97 0 9-3.134 9-7s-4.03-7-9-7z"/>
                    </svg>
                    카카오로 간편하게 시작하기
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-zinc-400">
                사용자로서 케이크를 예약하고 주문하는 과정을 체험합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

