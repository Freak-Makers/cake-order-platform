"use client";

import { useEffect, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Heart, Loader2, X, Plus, Minus, Calendar, MessageSquare } from "lucide-react";
import { getProducts } from "@/api/product.api";
import { createOrder } from "@/api/order.api";
import { Product } from "@/api/types";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function UserProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [requirements, setRequirements] = useState("");
  
  const router = useRouter();
  const { addItem } = useCart();

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

  const handleOrder = async () => {
    if (!selectedProduct) return;
    if (!pickupDateTime) {
      alert("픽업 일시를 선택해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      await createOrder({
        productId: selectedProduct.id,
        quantity: orderQuantity,
        pickupDateTime: new Date(pickupDateTime).toISOString(),
        requirements: requirements || undefined,
      });
      alert("주문이 완료되었습니다!");
      setSelectedProduct(null);
      router.push("/user/orders");
    } catch (e) {
      console.error("Order failed:", e);
      alert("주문에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addItem(selectedProduct, orderQuantity);
    alert("장바구니에 담겼습니다.");
    setSelectedProduct(null);
  };

  return (
    <UserLayout>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">케이크 라인업</h1>
        <p className="mt-2 text-zinc-500">정성을 담아 구운 달콤한 케이크들을 만나보세요.</p>
      </div>

      {isLoading && products.length === 0 ? (
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
            <Card 
              key={product.id} 
              className="overflow-hidden group border-none shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => {
                setSelectedProduct(product);
                setOrderQuantity(1);
              }}
            >
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
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-bold text-zinc-900">{product.price.toLocaleString()}원</p>
                  <Button 
                    disabled={product.status === "SOLD_OUT"}
                    className="gap-2 bg-pink-500 hover:bg-pink-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                  >
                    상세보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Detail & Order Modal */}
      {selectedProduct && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-zinc-500 backdrop-blur-sm hover:text-zinc-900"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-y-auto">
              <div className="md:w-1/2 aspect-square md:aspect-auto">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-8">
                <div className="mb-6">
                  <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">{selectedProduct.category}</span>
                  <h2 className="mt-2 text-3xl font-bold text-zinc-900">{selectedProduct.name}</h2>
                  <p className="mt-4 text-zinc-600 leading-relaxed">{selectedProduct.description || "상품 상세 설명이 없습니다."}</p>
                </div>

                <div className="mt-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">수량 선택</span>
                    <div className="flex items-center rounded-lg border border-zinc-200 p-1">
                      <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="p-2 hover:text-pink-500">
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center font-bold">{orderQuantity}</span>
                      <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="p-2 hover:text-pink-500">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl bg-zinc-50 p-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                        <Calendar size={14} /> 픽업 일시
                      </label>
                      <input 
                        type="datetime-local" 
                        value={pickupDateTime}
                        onChange={(e) => setPickupDateTime(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                        <MessageSquare size={14} /> 요청 사항
                      </label>
                      <textarea 
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="레터링 문구 등 요청사항을 입력해주세요."
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-pink-500 focus:outline-none h-20 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-6">
                    <div>
                      <p className="text-xs text-zinc-400">총 합계 금액</p>
                      <p className="text-2xl font-bold text-zinc-900">{(selectedProduct.price * orderQuantity).toLocaleString()}원</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleAddToCart} className="h-12 px-6">장바구니</Button>
                      <Button onClick={handleOrder} disabled={isLoading} className="h-12 px-8 bg-pink-500 hover:bg-pink-600">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "바로 주문"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </UserLayout>
  );
}
