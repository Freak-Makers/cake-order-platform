"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Calendar, Cake, FileText, Settings, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "대시보드", href: "/dashboard" },
  { icon: ShoppingBag, label: "예약 관리", href: "/admin/reservations" },
  { icon: Calendar, label: "예약 가능 슬롯", href: "/admin/reservation-slots" },
  { icon: Cake, label: "상품 관리", href: "/products" },
  { icon: FileText, label: "게시글 관리", href: "/admin/posts" },
  { icon: Settings, label: "설정", href: "/settings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isLoggedIn, isLoading, logout } = useAuth();

  // 모바일/태블릿(< lg) 에서는 drawer, lg 이상은 고정 사이드바.
  return (
    <>
      {/* Backdrop — 모바일에서만 보이고, drawer 가 열려 있을 때만 표시 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-zinc-200 bg-white p-6 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-pink-500" />
            <span className="text-xl font-bold tracking-tight">Cake Admin</span>
          </div>
          {/* 모바일 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 lg:hidden"
            aria-label="사이드바 닫기"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-pink-50 text-pink-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          {!isLoading && (
            isLoggedIn ? (
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                <LogOut size={20} />
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                <LogOut size={20} className="rotate-180" />
                로그인
              </Link>
            )
          )}
        </div>
      </aside>
    </>
  );
}
