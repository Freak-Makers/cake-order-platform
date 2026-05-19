"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = isLoggedIn && role === "ADMIN";

  // ADMIN 이 아니면 로그인 페이지로 (백엔드 1차 차단의 UX 보조)
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/login");
    }
  }, [isLoading, isAdmin, router]);

  // 라우트 이동 시 모바일 drawer 자동 닫기
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoading || !isAdmin) {
    return <div className="min-h-screen bg-zinc-50" />;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* 모바일 햄버거 */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 lg:hidden"
                aria-label="메뉴 열기"
              >
                <Menu size={22} />
              </button>
              <h2 className="text-sm font-medium text-zinc-500">사장님 환영합니다!</h2>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
              <div className="h-8 w-8 rounded-full bg-zinc-200" />
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
