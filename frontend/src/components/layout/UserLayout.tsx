"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Cake, ShoppingCart, User, LogOut, X, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function UserLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, logout } = useAuth();
  const { items, totalCount, totalPrice, updateQuantity, removeItem } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const handleReserveFromCart = () => {
    setIsCartOpen(false);
    router.push("/user/cart/reserve");
  };

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
            <Link href="/user/reservations" className="text-sm font-medium text-zinc-600 hover:text-pink-600">내 예약</Link>
            <Link href="/user/favorites" className="text-sm font-medium text-zinc-600 hover:text-pink-600">내 찜</Link>
            <Link href="/posts" className="text-sm font-medium text-zinc-600 hover:text-pink-600">홍보글</Link>
          </nav>

          <div className="flex items-center gap-4">
            {!isLoading && (
              isLoggedIn ? (
                <>
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-zinc-600 hover:text-pink-600"
                  >
                    <ShoppingCart size={22} />
                    {totalCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                        {totalCount}
                      </span>
                    )}
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

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-xl font-bold">장바구니</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-zinc-400">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p>장바구니가 비어 있습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-lg bg-zinc-100">
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                            <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500">{item.price.toLocaleString()}원</p>
                          <div className="mt-auto flex items-center gap-3">
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
                <div className="border-t p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">결제 예정 금액</span>
                    <span className="text-xl font-bold">{totalPrice.toLocaleString()}원</span>
                  </div>
                  <Button
                    onClick={handleReserveFromCart}
                    className="w-full h-12 text-base font-bold bg-pink-500 hover:bg-pink-600"
                  >
                    예약하기
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
