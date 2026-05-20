"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { getMyFavorites, removeFavorite } from "@/api/favorite.api";
import { Favorite } from "@/api/types";
import { formatPrice } from "@/lib/utils";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyFavorites()
      .then(setFavorites)
      .catch((e) => console.error("Failed to load favorites:", e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRemove = async (productId: number) => {
    // 낙관적 제거 — 실패 시 글로벌 토스트.
    const before = favorites;
    setFavorites((prev) => prev.filter((f) => f.productId !== productId));
    try {
      await removeFavorite(productId);
    } catch (e) {
      console.error("Failed to remove favorite:", e);
      setFavorites(before);
    }
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-zinc-900 sm:text-2xl">
            <Bookmark size={24} className="text-amber-500" fill="currentColor" />
            내 찜 목록
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            관심 있는 케이크를 모아두는 공간입니다. 예약은 상품 상세에서 진행하세요.
          </p>
        </div>

        {isLoading ? (
          <p className="text-zinc-500">불러오는 중...</p>
        ) : favorites.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center space-y-3">
            <Bookmark size={48} className="mx-auto text-zinc-300" />
            <p className="text-sm text-zinc-500">아직 찜한 상품이 없습니다.</p>
            <Link href="/user/products">
              <Button className="bg-pink-500 hover:bg-pink-600">상품 보러 가기</Button>
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {favorites.map((f) => (
              <li key={f.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <Link href={`/user/products/${f.productId}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.productImageUrl} alt={f.productName} className="h-full w-full object-cover transition-transform hover:scale-105" />
                  </div>
                </Link>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/user/products/${f.productId}`} className="font-bold text-zinc-900 hover:text-pink-600">
                      {f.productName}
                    </Link>
                    <button
                      onClick={() => handleRemove(f.productId)}
                      className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                      title="찜 해제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-pink-600">{formatPrice(f.productPrice)}</p>
                  {f.productStatus !== "AVAILABLE" && (
                    <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {f.productStatus === "SOLD_OUT" ? "품절" : "비공개"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </UserLayout>
  );
}
