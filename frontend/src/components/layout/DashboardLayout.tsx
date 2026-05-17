import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="pl-64">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-500">사장님 환영합니다!</h2>
            <div className="flex items-center gap-4">
              {!isLoading && isLoggedIn && (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  <LogOut size={18} />
                  로그아웃
                </button>
              )}
              <div className="h-8 w-8 rounded-full bg-zinc-200" />
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
