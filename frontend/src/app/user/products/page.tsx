"use client";

import { useEffect, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { getProducts } from "@/api/product.api";
import { Product } from "@/api/types";

export default function UserProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (e) {
        console.error("Failed to fetch products:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <UserLayout>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">케이크 라인업</h1>
        <p className="mt-2 text-zinc-500">정성을 담아 구운 달콤한 케이크들을 만나보세요.</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
          <p>등록된 상품이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group border-none shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-zinc-400 backdrop-blur-sm transition-colors hover:bg-white hover:text-pink-500">
                  <Heart size={20} />
                </button>
                {product.status === "SOLD_OUT" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <span className="rounded-full bg-white px-4 py-1 text-sm font-bold text-zinc-900">품절</span>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-pink-500 uppercase tracking-wider">{product.category}</span>
                  <h3 className="mt-1 text-xl font-bold text-zinc-900">{product.name}</h3>
                  {product.description && (
                    <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{product.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-bold text-zinc-900">{product.price.toLocaleString()}원</p>
                  <Button 
                    disabled={product.status === "SOLD_OUT"}
                    className="gap-2 bg-pink-500 hover:bg-pink-600"
                  >
                    <ShoppingCart size={18} />
                    주문하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
