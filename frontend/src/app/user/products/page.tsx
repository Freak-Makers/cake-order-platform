"use client";

import { useEffect, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Heart, Loader2, X, Plus, Minus, Calendar, MessageSquare, Star, ThumbsUp, MessageCircle } from "lucide-react";
import { getProducts } from "@/api/product.api";
import { createOrder } from "@/api/order.api";
import { getProductReviews, toggleReviewLike, createReview } from "@/api/review.api";
import { Product, Review } from "@/api/types";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export default function UserProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"order" | "reviews">("order");
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Order State
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [requirements, setRequirements] = useState("");
  
  // New Review State
  const [newReviewContent, setNewReviewContent] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

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

  useEffect(() => {
    if (selectedProduct && activeTab === "reviews") {
      const fetchReviews = async () => {
        try {
          const data = await getProductReviews(selectedProduct.id);
          setReviews(data);
        } catch (e) {
          console.error("Failed to fetch reviews:", e);
        }
      };
      fetchReviews();
    }
  }, [selectedProduct, activeTab]);

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

  const handleLikeReview = async (reviewId: number) => {
    try {
      await toggleReviewLike(reviewId);
      // 로컬 상태 업데이트
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, isLiked: !r.isLiked, likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1 } 
          : r
      ));
    } catch (e) {
      console.error("Failed to like review:", e);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!newReviewContent.trim()) return;

    try {
      const review = await createReview(selectedProduct.id, {
        content: newReviewContent,
        rating: newReviewRating
      });
      setReviews([review, ...reviews]);
      setNewReviewContent("");
      setNewReviewRating(5);
    } catch (e) {
      console.error("Failed to submit review:", e);
    }
  };

  return (
    <UserLayout>
      {/* Hero Header */}
      <div className="relative mb-16 overflow-hidden rounded-3xl bg-pink-500 px-8 py-16 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">당신의 특별한 날을 위한 <br/>세상에 하나뿐인 케이크</h1>
          <p className="mt-6 text-lg text-pink-100 opacity-90">선별된 사장님들의 감각적인 디자인과 엄선된 재료로 만든 <br/>수제 케이크를 지금 바로 주문해보세요.</p>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-pink-400 opacity-20 blur-3xl" />
        <div className="absolute -bottom-20 right-20 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl" />
      </div>

      {/* Filter / Search Bar (Placeholder) */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {["전체", "홀케이크", "보틀케이크", "도시락케이크", "시즌한정"].map((cat) => (
            <button key={cat} className="whitespace-nowrap rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-600 transition-all hover:border-pink-500 hover:text-pink-500">
              {cat}
            </button>
          ))}
        </div>
        <div className="text-sm text-zinc-500">
          총 <span className="font-bold text-zinc-900">{products.length}</span>개의 상품
        </div>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer"
              onClick={() => {
                setSelectedProduct(product);
                setOrderQuantity(1);
                setActiveTab("order");
              }}
            >
              <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100 shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <button 
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-400 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-pink-500 hover:scale-110"
                  onClick={(e) => { e.stopPropagation(); /* 찜 기능 추후 구현 */ }}
                >
                  <Heart size={20} />
                </button>
                {product.status === "SOLD_OUT" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                    <span className="rounded-full bg-white px-6 py-2 text-sm font-bold tracking-tight text-zinc-900">품절</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 opacity-0 transition-all duration-300 group-hover:bottom-6 group-hover:opacity-100">
                  <span className="rounded-full bg-pink-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">상세보기</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">{product.category}</span>
                <h3 className="mt-1 text-lg font-bold text-zinc-900 line-clamp-1">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xl font-black text-zinc-900">{product.price.toLocaleString()}원</p>
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-zinc-700">4.8</span>
                    <span className="text-xs">(128)</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail & Order Modal */}
      {selectedProduct && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          <div className="fixed inset-x-4 top-[5%] bottom-[5%] z-50 mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute right-6 top-6 z-20 rounded-full bg-white/80 p-2 text-zinc-500 backdrop-blur-md transition-all hover:bg-white hover:text-zinc-900 hover:rotate-90"
            >
              <X size={24} />
            </button>
            
            <div className="flex h-full flex-col md:flex-row">
              {/* Left: Image (Stays top on mobile) */}
              <div className="md:w-1/2 h-64 md:h-auto overflow-hidden bg-zinc-100">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover" />
              </div>

              {/* Right: Content */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Fixed Header */}
                <div className="border-b border-zinc-100 p-8 pb-4">
                  <span className="text-xs font-black text-pink-500 uppercase tracking-[0.2em]">{selectedProduct.category}</span>
                  <h2 className="mt-2 text-3xl font-black text-zinc-900 leading-tight">{selectedProduct.name}</h2>
                  <p className="mt-3 text-2xl font-black text-zinc-900">{selectedProduct.price.toLocaleString()}원</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-100 px-8">
                  <button 
                    onClick={() => setActiveTab("order")}
                    className={cn(
                      "flex items-center gap-2 border-b-2 py-4 text-sm font-bold transition-all",
                      activeTab === "order" ? "border-pink-500 text-pink-600" : "border-transparent text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    <ShoppingCart size={18} /> 주문 정보
                  </button>
                  <button 
                    onClick={() => setActiveTab("reviews")}
                    className={cn(
                      "flex items-center gap-2 border-b-2 py-4 text-sm font-bold transition-all ml-8",
                      activeTab === "reviews" ? "border-pink-500 text-pink-600" : "border-transparent text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    <MessageCircle size={18} /> 상품 후기 ({reviews.length || 0})
                  </button>
                </div>

                {/* Tab Content: Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  {activeTab === "order" ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 mb-3">상품 설명</h4>
                        <p className="text-sm leading-relaxed text-zinc-600">{selectedProduct.description || "이 케이크에 대한 상세 설명이 아직 준비되지 않았습니다. 매장에 문의해주세요!"}</p>
                      </div>

                      <div className="space-y-6 rounded-2xl bg-zinc-50 p-6">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-zinc-700">수량 선택</label>
                          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
                            <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="p-2 transition-colors hover:text-pink-500">
                              <Minus size={18} />
                            </button>
                            <span className="w-12 text-center text-lg font-black">{orderQuantity}</span>
                            <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="p-2 transition-colors hover:text-pink-500">
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                            <Calendar size={14} className="text-pink-500" /> 픽업 희망 일시
                          </label>
                          <input 
                            type="datetime-local" 
                            value={pickupDateTime}
                            onChange={(e) => setPickupDateTime(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                            <MessageSquare size={14} className="text-pink-500" /> 특별 요청 사항
                          </label>
                          <textarea 
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            placeholder="레터링 문구 (최대 10자), 알레르기 유의사항 등을 적어주세요."
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 h-24 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      {/* Review Stats Summary */}
                      <div className="flex items-center gap-6 rounded-2xl bg-zinc-50 p-6">
                        <div className="text-center">
                          <div className="text-3xl font-black text-zinc-900">4.8</div>
                          <div className="flex gap-0.5 mt-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} className={cn("fill-amber-400 text-amber-400", i === 5 && "opacity-30")} />)}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5,4,3,2,1].map(star => (
                            <div key={star} className="flex items-center gap-2">
                              <span className="w-2 text-[10px] font-bold text-zinc-400">{star}</span>
                              <div className="h-1.5 flex-1 rounded-full bg-zinc-200 overflow-hidden">
                                <div className="h-full bg-amber-400" style={{ width: star === 5 ? "80%" : star === 4 ? "15%" : "2%" }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review List */}
                      <div className="divide-y divide-zinc-100">
                        {reviews.length === 0 ? (
                          <div className="py-10 text-center text-zinc-400">
                            <MessageCircle className="mx-auto mb-3 opacity-20" size={32} />
                            <p className="text-sm">아직 작성된 후기가 없습니다. <br/>첫 번째 후기의 주인공이 되어보세요!</p>
                          </div>
                        ) : (
                          reviews.map((review) => (
                            <div key={review.id} className="py-6">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-zinc-200 overflow-hidden">
                                    <img src={review.authorProfileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`} alt="" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-zinc-900">{review.authorName}</p>
                                    <div className="flex gap-0.5 mt-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} className={cn(i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200")} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] text-zinc-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm leading-relaxed text-zinc-600 mb-4">{review.content}</p>
                              <button 
                                onClick={() => handleLikeReview(review.id)}
                                className={cn(
                                  "flex items-center gap-1.5 text-xs font-bold transition-colors px-3 py-1.5 rounded-full border",
                                  review.isLiked ? "border-pink-500 bg-pink-50 text-pink-600" : "border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
                                )}
                              >
                                <ThumbsUp size={14} className={review.isLiked ? "fill-pink-500" : ""} />
                                {review.likeCount}
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Review Input */}
                      <form onSubmit={handleSubmitReview} className="mt-8 border-t border-zinc-100 pt-8">
                        <h4 className="text-sm font-bold text-zinc-900 mb-4">후기 남기기</h4>
                        <div className="mb-4 flex gap-2">
                          {[1,2,3,4,5].map(i => (
                            <button 
                              key={i} 
                              type="button"
                              onClick={() => setNewReviewRating(i)}
                              className="transition-transform hover:scale-125"
                            >
                              <Star size={24} className={cn(i <= newReviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-200")} />
                            </button>
                          ))}
                        </div>
                        <textarea 
                          value={newReviewContent}
                          onChange={(e) => setNewReviewContent(e.target.value)}
                          placeholder="이 케이크는 어떠셨나요? 다른 고객님들을 위해 후기를 남겨주세요."
                          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/10 h-32 resize-none"
                        />
                        <Button type="submit" disabled={!newReviewContent.trim()} className="mt-4 w-full bg-zinc-900 text-white hover:bg-zinc-800">후기 등록</Button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Fixed Footer: Order Button (Only show on Order Tab) */}
                {activeTab === "order" && (
                  <div className="border-t border-zinc-100 p-8 pt-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-zinc-500 font-medium">최종 결제 금액</span>
                      <span className="text-3xl font-black text-pink-500">{(selectedProduct.price * orderQuantity).toLocaleString()}원</span>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleAddToCart} className="h-14 flex-1 text-base font-bold border-2">장바구니 담기</Button>
                      <Button 
                        onClick={handleOrder} 
                        disabled={isLoading} 
                        className="h-14 flex-[2] bg-pink-500 hover:bg-pink-600 text-white text-base font-black shadow-lg shadow-pink-200"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : "지금 바로 예약하기"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </UserLayout>
  );
}
