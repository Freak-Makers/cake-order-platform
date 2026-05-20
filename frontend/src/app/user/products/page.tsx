"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Heart, Loader2, X, Plus, Minus, Calendar, MessageSquare, Star, ThumbsUp, MessageCircle, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { getProducts, getProductCategories } from "@/api/product.api";
import { createReservation, getAvailableSlots } from "@/api/reservation.api";
import { getProductReviews, toggleReviewLike, createReview } from "@/api/review.api";
import { Product, ProductSort, ReservationSlot, Review } from "@/api/types";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function UserProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"order" | "reviews">("order");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [sortKey, setSortKey] = useState<ProductSort>("latest");

  // Reservation State
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [slots, setSlots] = useState<ReservationSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | "">("");
  const [requirements, setRequirements] = useState("");
  const [isReserving, setIsReserving] = useState(false);

  // New Review State
  const [newReviewContent, setNewReviewContent] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  const router = useRouter();
  const { addItem } = useCart();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 카테고리 + 슬롯 — 마운트 시 1회
  useEffect(() => {
    getProductCategories()
      .then((res) => setCategories(["전체", ...res]))
      .catch((e) => console.error("Failed to fetch categories:", e));
    getAvailableSlots()
      .then(setSlots)
      .catch((e) => console.error("Failed to fetch slots:", e));
  }, []);

  // 필터/정렬 변경 시 첫 페이지 재요청
  useEffect(() => {
    let cancelled = false;
    setIsInitialLoading(true);
    setProducts([]);
    setCursor(null);
    setHasNext(true);
    getProducts({
      cursor: null,
      limit: PAGE_SIZE,
      category: selectedCategory === "전체" ? null : selectedCategory,
      sort: sortKey,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.items);
        setCursor(res.nextCursor);
        setHasNext(res.hasNext);
      })
      .catch((e) => {
        if (!cancelled) console.error("Failed to fetch products:", e);
      })
      .finally(() => {
        if (!cancelled) setIsInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, sortKey]);

  const loadMore = useCallback(async () => {
    if (!hasNext || isFetchingMore || isInitialLoading || !cursor) return;
    setIsFetchingMore(true);
    try {
      const res = await getProducts({
        cursor,
        limit: PAGE_SIZE,
        category: selectedCategory === "전체" ? null : selectedCategory,
        sort: sortKey,
      });
      setProducts((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
      setHasNext(res.hasNext);
    } catch (e) {
      console.error("Failed to fetch next page:", e);
    } finally {
      setIsFetchingMore(false);
    }
  }, [cursor, hasNext, isFetchingMore, isInitialLoading, selectedCategory, sortKey]);

  // IntersectionObserver — sentinel 진입 시 다음 페이지
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

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

  const handleReserve = async () => {
    if (!selectedProduct) return;
    if (!selectedSlotId) {
      alert("픽업 날짜(슬롯)를 선택해주세요.");
      return;
    }

    try {
      setIsReserving(true);
      await createReservation({
        productId: selectedProduct.id,
        slotId: Number(selectedSlotId),
        quantity: orderQuantity,
        requirements: requirements || null,
      });
      alert("예약 신청이 완료되었습니다. 사장님 확정 후 결제 단계로 진행됩니다.");
      setSelectedProduct(null);
      setSelectedSlotId("");
      setRequirements("");
      router.push("/user/reservations");
    } catch (e) {
      console.error("Reservation failed:", e);
      alert("예약 신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsReserving(false);
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
      {/* Hero — editorial, blush-toned */}
      <section className="relative mb-12 overflow-hidden rounded-2xl border border-rose-100/70 bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50/60 px-5 py-14 sm:mb-16 sm:rounded-[2rem] sm:px-8 sm:py-20 md:mb-20 md:px-16 md:py-28">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-6 top-5 hidden items-center justify-between text-[10px] font-medium uppercase tracking-[0.4em] text-stone-400 sm:flex sm:inset-x-12 sm:top-8">
          <span>Maison de Gâteau</span>
          <span className="hidden md:inline">No. 001</span>
        </div>
        <div className="pointer-events-none absolute inset-x-6 bottom-5 hidden items-center justify-between text-[10px] font-medium uppercase tracking-[0.4em] text-stone-400 sm:flex sm:inset-x-12 sm:bottom-8">
          <span className="hidden md:inline">Seoul · 2026</span>
          <span>Spring Collection</span>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-rose-500 backdrop-blur sm:mb-6 sm:px-4 sm:py-1.5 sm:text-[11px] sm:tracking-[0.3em]">
            <Sparkles size={12} /> Hand-crafted, made to order
          </div>
          <h1 className="text-balance text-3xl font-light leading-[1.1] tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.05] md:text-6xl">
            오늘의 작은 사치,
            <br />
            <span className="font-serif italic text-rose-500">한 조각의</span> 케이크.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-sm leading-relaxed text-stone-500 sm:mt-8 sm:text-base md:text-lg">
            엄선된 재료와 한 분의 파티시에가 빚어내는 디자인. <br className="hidden md:inline" />
            특별한 하루를 위한 단 하나의 케이크를 만나보세요.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-stone-400 sm:mt-10 sm:text-xs">
            <span className="h-px w-8 bg-stone-300 sm:w-10" />
            Today's Selection
            <span className="h-px w-8 bg-stone-300 sm:w-10" />
          </div>
        </div>
      </section>

      {/* Filter / Sort */}
      <div className="mb-10 flex flex-col gap-6 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400">Collection</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "relative py-1 text-sm transition-colors",
                    active ? "font-semibold text-stone-900" : "text-stone-400 hover:text-stone-700",
                  )}
                >
                  {cat}
                  {active && <span className="absolute -bottom-[7px] left-0 right-0 h-px bg-stone-900" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm text-stone-500">
            <span className="font-semibold text-stone-900">{products.length}</span>
            <span className="ml-1 text-xs uppercase tracking-[0.2em] text-stone-400">items{hasNext ? "+" : ""}</span>
          </span>
          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as ProductSort)}
              className="appearance-none rounded-full border border-stone-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 focus:border-stone-900 focus:outline-none"
            >
              <option value="latest">최신순</option>
              <option value="priceAsc">낮은 가격순</option>
              <option value="priceDesc">높은 가격순</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-3 aspect-[3/4] rounded-xl bg-stone-100" />
              <div className="h-3 w-16 rounded bg-stone-100" />
              <div className="mt-2 h-4 w-3/4 rounded bg-stone-100" />
              <div className="mt-2 h-4 w-1/3 rounded bg-stone-100" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-stone-200 text-stone-300">
            <Sparkles size={22} />
          </div>
          <p className="text-sm text-stone-500">선택한 컬렉션에 아직 등록된 케이크가 없습니다.</p>
        </div>
      ) : (
        <>
          {/* Featured — 첫 상품을 와이드 에디토리얼 카드로 */}
          {products[0] && (() => {
            const featured = products[0];
            return (
              <article
                onClick={() => {
                  setSelectedProduct(featured);
                  setOrderQuantity(1);
                  setActiveTab("order");
                }}
                className="group mb-14 grid cursor-pointer overflow-hidden rounded-3xl border border-stone-200/70 bg-white md:h-60 md:grid-cols-12"
              >
                <div className="relative aspect-[2/1] overflow-hidden bg-stone-100 md:col-span-7 md:aspect-auto">
                  <img
                    src={featured.imageUrl}
                    alt={featured.name}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-stone-900/20 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/40 bg-white/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.25em] text-stone-700 backdrop-blur">
                    <Sparkles size={10} className="text-rose-500" /> Editor's Pick
                  </div>
                  {featured.status === "SOLD_OUT" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50 backdrop-blur-[2px]">
                      <span className="rounded-full border border-white/30 bg-white/90 px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-900">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-3 p-4 md:col-span-5 md:p-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-[11px] tracking-[0.25em] text-stone-400">— 01</span>
                      <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                        {featured.category}
                      </span>
                    </div>
                    <h2 className="mt-2 text-balance text-lg font-light leading-[1.2] tracking-tight text-stone-900 md:text-xl">
                      {featured.name}
                    </h2>
                    {featured.description && (
                      <p className="mt-1.5 line-clamp-1 text-[12px] leading-relaxed text-stone-500">
                        {featured.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end justify-between border-t border-stone-100 pt-2.5">
                    <div className="flex items-baseline gap-2">
                      <p className="text-base font-light tracking-tight text-stone-900">
                        {featured.price.toLocaleString()}
                        <span className="ml-1 text-[10px] font-normal text-stone-400">KRW</span>
                      </p>
                      <span className="flex items-center gap-0.5 text-[10px] text-stone-500">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="font-medium text-stone-700">4.8</span>
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.25em] text-stone-900 transition-colors group-hover:text-rose-500">
                      View detail
                      <ArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })()}

          {/* Section eyebrow */}
          {products.length > 1 && (
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400">
                This Week's Selection
              </span>
              <span className="h-px flex-1 bg-stone-200" />
            </div>
          )}

          {/* Grid — 나머지 상품 */}
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.slice(1).map((product, i) => {
              const idx = i + 1;
              return (
                <article
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product);
                    setOrderQuantity(1);
                    setActiveTab("order");
                  }}
                >
                  <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-stone-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/45 via-stone-900/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <span className="absolute left-4 top-4 font-serif text-[11px] tracking-[0.25em] text-stone-700/80 mix-blend-multiply">
                      — {String(idx + 1).padStart(2, "0")}
                    </span>

                    <button
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-stone-400 backdrop-blur-md transition-all hover:bg-white hover:text-rose-500"
                      onClick={(e) => { e.stopPropagation(); }}
                      aria-label="찜하기"
                    >
                      <Heart size={14} />
                    </button>

                    {product.status === "SOLD_OUT" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50 backdrop-blur-[2px]">
                        <span className="rounded-full border border-white/30 bg-white/90 px-4 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-900">
                          Sold Out
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-x-4 bottom-4 flex translate-y-3 items-center justify-between text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="text-[10px] font-medium uppercase tracking-[0.3em]">View detail</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>

                  <div className="px-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-stone-500">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="font-medium text-stone-700">4.8</span>
                        <span className="text-stone-400">(128)</span>
                      </div>
                    </div>
                    <h3 className="mt-1.5 text-sm font-medium leading-snug text-stone-900 transition-colors group-hover:text-rose-500 line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-stone-400">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-2.5 flex items-end justify-between border-t border-stone-100 pt-2">
                      <p className="text-sm font-medium tracking-tight text-stone-900">
                        {product.price.toLocaleString()}
                        <span className="ml-1 text-[10px] font-normal text-stone-400">KRW</span>
                      </p>
                      <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400 transition-colors group-hover:text-stone-900">
                        Order →
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* 추가 로딩 스켈레톤 */}
            {isFetchingMore && Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="mb-3 aspect-[3/4] rounded-xl bg-stone-100" />
                <div className="h-3 w-16 rounded bg-stone-100" />
                <div className="mt-2 h-4 w-3/4 rounded bg-stone-100" />
                <div className="mt-2 h-4 w-1/3 rounded bg-stone-100" />
              </div>
            ))}
          </div>

          {/* Sentinel — 보이면 다음 페이지 로드 */}
          {hasNext && <div ref={sentinelRef} className="h-12" aria-hidden="true" />}
          {!hasNext && products.length > 0 && (
            <div className="mt-16 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-stone-400">
              <span className="h-px w-10 bg-stone-200" />
              End of Collection
              <span className="h-px w-10 bg-stone-200" />
            </div>
          )}
        </>
      )}

      {/* Product Detail & Order Modal */}
      {selectedProduct && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          <div className="fixed inset-x-2 top-[2%] bottom-[2%] z-50 mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 sm:inset-x-4 sm:top-[5%] sm:bottom-[5%] sm:rounded-3xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 text-stone-500 backdrop-blur-md transition-all hover:bg-white hover:text-stone-900 hover:rotate-90 sm:right-6 sm:top-6"
            >
              <X size={22} />
            </button>

            <div className="flex h-full flex-col md:flex-row">
              {/* Left: Image (Stays top on mobile) */}
              <div className="h-48 shrink-0 overflow-hidden bg-stone-100 sm:h-64 md:h-auto md:w-1/2">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover" />
              </div>

              {/* Right: Content */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Fixed Header */}
                <div className="border-b border-stone-100 p-5 pb-4 sm:p-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 sm:text-xs">{selectedProduct.category}</span>
                  <h2 className="mt-2 text-xl font-black leading-tight text-stone-900 sm:text-3xl">{selectedProduct.name}</h2>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xl font-black text-stone-900 sm:text-2xl">{selectedProduct.price.toLocaleString()}원</p>
                    <button
                      onClick={() => {
                        const id = selectedProduct.id;
                        setSelectedProduct(null);
                        router.push(`/user/products/${id}`);
                      }}
                      className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-rose-500"
                    >
                      상세 보기 →
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-100 px-5 sm:px-8">
                  <button
                    onClick={() => setActiveTab("order")}
                    className={cn(
                      "flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition-all sm:py-4",
                      activeTab === "order" ? "border-rose-500 text-rose-600" : "border-transparent text-stone-400 hover:text-stone-600"
                    )}
                  >
                    <ShoppingCart size={18} /> 주문 정보
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={cn(
                      "ml-6 flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition-all sm:ml-8 sm:py-4",
                      activeTab === "reviews" ? "border-rose-500 text-rose-600" : "border-transparent text-stone-400 hover:text-stone-600"
                    )}
                  >
                    <MessageCircle size={18} /> 후기 ({reviews.length || 0})
                  </button>
                </div>

                {/* Tab Content: Scrollable */}
                <div className="custom-scrollbar flex-1 overflow-y-auto p-5 sm:p-8">
                  {activeTab === "order" ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 mb-3">상품 설명</h4>
                        <p className="text-sm leading-relaxed text-stone-600">{selectedProduct.description || "이 케이크에 대한 상세 설명이 아직 준비되지 않았습니다. 매장에 문의해주세요!"}</p>
                      </div>

                      <div className="space-y-6 rounded-2xl bg-stone-50 p-6">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-stone-700">수량 선택</label>
                          <div className="flex items-center rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
                            <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="p-2 transition-colors hover:text-rose-500">
                              <Minus size={18} />
                            </button>
                            <span className="w-12 text-center text-lg font-black">{orderQuantity}</span>
                            <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="p-2 transition-colors hover:text-rose-500">
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase">
                            <Calendar size={14} className="text-rose-500" /> 픽업 가능 날짜
                          </label>
                          <select
                            value={selectedSlotId}
                            onChange={(e) => setSelectedSlotId(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          >
                            <option value="">날짜를 선택하세요</option>
                            {slots.map((s) => (
                              <option key={s.id} value={s.id}>{new Date(s.startAt).toLocaleString("ko-KR")}</option>
                            ))}
                          </select>
                          {slots.length === 0 && (
                            <p className="text-xs text-stone-400">사장님이 등록한 예약 가능 날짜가 없습니다.</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase">
                            <MessageSquare size={14} className="text-rose-500" /> 특별 요청 사항
                          </label>
                          <textarea 
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            placeholder="레터링 문구 (최대 10자), 알레르기 유의사항 등을 적어주세요."
                            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 h-24 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      {/* Review Stats Summary */}
                      <div className="flex items-center gap-6 rounded-2xl bg-stone-50 p-6">
                        <div className="text-center">
                          <div className="text-3xl font-black text-stone-900">4.8</div>
                          <div className="flex gap-0.5 mt-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} className={cn("fill-amber-400 text-amber-400", i === 5 && "opacity-30")} />)}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5,4,3,2,1].map(star => (
                            <div key={star} className="flex items-center gap-2">
                              <span className="w-2 text-[10px] font-bold text-stone-400">{star}</span>
                              <div className="h-1.5 flex-1 rounded-full bg-stone-200 overflow-hidden">
                                <div className="h-full bg-amber-400" style={{ width: star === 5 ? "80%" : star === 4 ? "15%" : "2%" }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review List */}
                      <div className="divide-y divide-stone-100">
                        {reviews.length === 0 ? (
                          <div className="py-10 text-center text-stone-400">
                            <MessageCircle className="mx-auto mb-3 opacity-20" size={32} />
                            <p className="text-sm">아직 작성된 후기가 없습니다. <br/>첫 번째 후기의 주인공이 되어보세요!</p>
                          </div>
                        ) : (
                          reviews.map((review) => (
                            <div key={review.id} className="py-6">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-stone-200 overflow-hidden">
                                    <img src={review.authorProfileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`} alt="" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-stone-900">{review.authorName}</p>
                                    <div className="flex gap-0.5 mt-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} className={cn(i < review.rating ? "fill-amber-400 text-amber-400" : "text-stone-200")} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] text-stone-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm leading-relaxed text-stone-600 mb-4">{review.content}</p>
                              <button 
                                onClick={() => handleLikeReview(review.id)}
                                className={cn(
                                  "flex items-center gap-1.5 text-xs font-bold transition-colors px-3 py-1.5 rounded-full border",
                                  review.isLiked ? "border-rose-500 bg-rose-50 text-rose-600" : "border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300"
                                )}
                              >
                                <ThumbsUp size={14} className={review.isLiked ? "fill-rose-500" : ""} />
                                {review.likeCount}
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Review Input */}
                      <form onSubmit={handleSubmitReview} className="mt-8 border-t border-stone-100 pt-8">
                        <h4 className="text-sm font-bold text-stone-900 mb-4">후기 남기기</h4>
                        <div className="mb-4 flex gap-2">
                          {[1,2,3,4,5].map(i => (
                            <button 
                              key={i} 
                              type="button"
                              onClick={() => setNewReviewRating(i)}
                              className="transition-transform hover:scale-125"
                            >
                              <Star size={24} className={cn(i <= newReviewRating ? "fill-amber-400 text-amber-400" : "text-stone-200")} />
                            </button>
                          ))}
                        </div>
                        <textarea 
                          value={newReviewContent}
                          onChange={(e) => setNewReviewContent(e.target.value)}
                          placeholder="이 케이크는 어떠셨나요? 다른 고객님들을 위해 후기를 남겨주세요."
                          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 h-32 resize-none"
                        />
                        <Button type="submit" disabled={!newReviewContent.trim()} className="mt-4 w-full bg-stone-900 text-white hover:bg-stone-800">후기 등록</Button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Fixed Footer: Order Button (Only show on Order Tab) */}
                {activeTab === "order" && (
                  <div className="border-t border-stone-100 p-5 pt-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] sm:p-8 sm:pt-6">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <span className="font-medium text-stone-500">최종 결제 금액</span>
                      <span className="text-2xl font-black text-rose-500 sm:text-3xl">{(selectedProduct.price * orderQuantity).toLocaleString()}원</span>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <Button variant="outline" onClick={handleAddToCart} className="h-12 flex-1 border-2 text-sm font-bold sm:h-14 sm:text-base">장바구니 담기</Button>
                      <Button
                        onClick={handleReserve}
                        disabled={isReserving || !selectedSlotId}
                        className="h-12 flex-[2] bg-rose-500 text-sm font-black text-white shadow-lg shadow-rose-200 hover:bg-rose-600 sm:h-14 sm:text-base"
                      >
                        {isReserving ? <Loader2 className="animate-spin" size={24} /> : "예약 신청"}
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
