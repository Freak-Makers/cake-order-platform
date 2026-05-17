"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Cake, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UserLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-white">
              <Cake size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">Cake Order</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/user/products" className="text-sm font-medium text-zinc-600 hover:text-pink-600">상품 목록</Link>
            <Link href="/user/orders" className="text-sm font-medium text-zinc-600 hover:text-pink-600">내 주문</Link>
          </nav>

          <div className="flex items-center gap-4">
            {!isLoading && (
              isLoggedIn ? (
                <>
                  <button className="relative text-zinc-600 hover:text-pink-600">
                    <ShoppingCart size={22} />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">2</span>
                  </button>
                  <div className="h-8 w-8 rounded-full bg-zinc-200 overflow-hidden">
                    <User size={32} className="text-zinc-400 p-1" />
                  </div>
                  <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">로그인</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
