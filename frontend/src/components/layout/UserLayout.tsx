"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Cake, ShoppingCart, User, LogOut, X, Trash2, Plus, Minus, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserInfoPopover } from "@/components/layout/UserInfoPopover";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/user/products", label: "상품 목록" },
  { href: "/user/reservations", label: "내 예약" },
  { href: "/user/favorites", label: "내 찜" },
  { href: "/posts", label: "홍보글" },
];

export function UserLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, logout, userInfo } = useAuth();
  const { items, totalCount, totalPrice, updateQuantity, removeItem } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 라우트 이동 시 모바일 메뉴 / 내 정보 popover 자동 닫기
  useEffect(() => {
    setIsMenuOpen(false);
    setIsInfoOpen(false);
  }, [pathname]);

  const handleReserveFromCart = () => {
    setIsCartOpen(false);
    router.push("/user/cart/reserve");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            {/* 모바일 햄버거 */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 md:hidden"
              aria-label="메뉴 열기"
            >
              <Menu size={22} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-white">
                <Cake size={20} />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">Cake Order</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-600 hover:text-pink-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {!isLoading && (
              isLoggedIn ? (
                <>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-zinc-600 hover:text-pink-600"
                    aria-label="장바구니 열기"
                  >
                    <ShoppingCart size={22} />
                    {totalCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                        {totalCount}
                      </span>
                    )}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        // popover 내부 mousedown 외부 감지와 충돌 방지: 토글은 직접 처리.
                        e.stopPropagation();
                        setIsInfoOpen((prev) => !prev);
                      }}
                      className="block h-8 w-8 overflow-hidden rounded-full bg-zinc-200 transition-opacity hover:opacity-80"
                      aria-label="내 정보 열기"
                      aria-haspopup="dialog"
                      aria-expanded={isInfoOpen}
                    >
                      {userInfo?.profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={userInfo.profileImageUrl}
                          alt={userInfo.nickname}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <User size={32} className="p-1 text-zinc-400" />
                      )}
                    </button>
                    <UserInfoPopover
                      userInfo={userInfo}
                      isOpen={isInfoOpen}
                      onClose={() => setIsInfoOpen(false)}
                    />
                  </div>
                  <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-zinc-900" aria-label="로그아웃">
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

      {/* 모바일 네비게이션 Drawer */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed left-0 top-0 z-50 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl md:hidden">
            <div className="flex items-center justify-between border-b p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-white">
                  <Cake size={20} />
                </div>
                <span className="text-lg font-bold tracking-tight">Cake Order</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="메뉴 닫기"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-pink-50 text-pink-600"
                        : "text-zinc-700 hover:bg-zinc-50",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4 sm:p-6">
                <h2 className="text-lg font-bold sm:text-xl">장바구니</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-zinc-400">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p>장바구니가 비어 있습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                            <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500">{item.price.toLocaleString()}원</p>
                          <div className="mt-auto flex flex-wrap items-center gap-3">
                            <div className="flex items-center rounded-md border border-zinc-200">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:text-pink-500"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:text-pink-500"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="text-sm font-bold">{(item.price * item.quantity).toLocaleString()}원</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="space-y-4 border-t p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">결제 예정 금액</span>
                    <span className="text-xl font-bold">{totalPrice.toLocaleString()}원</span>
                  </div>
                  <Button
                    onClick={handleReserveFromCart}
                    className="h-12 w-full bg-pink-500 text-base font-bold hover:bg-pink-600"
                  >
                    예약하기
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
