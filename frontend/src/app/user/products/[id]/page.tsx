"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bookmark, Heart, ShoppingCart, Star } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { getProduct, toggleProductLike } from "@/api/product.api";
import { addFavorite, removeFavorite } from "@/api/favorite.api";
import { getProductReviews, createReview, toggleReviewLike } from "@/api/review.api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Product, Review } from "@/api/types";
import { formatPrice } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = Number(params.id);
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      getProduct(productId).then(setProduct),
      getProductReviews(productId).then(setReviews),
    ])
      .catch((e) => console.error("Failed to load product detail:", e))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleLike = async () => {
    if (!product || !isLoggedIn) return;
    try {
      await toggleProductLike(product.id);
      setProduct({
        ...product,
        isLiked: !product.isLiked,
        likeCount: product.isLiked ? product.likeCount - 1 : product.likeCount + 1,
      });
    } catch (e) {
      console.error("Failed to toggle product like:", e);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product || !isLoggedIn) return;
    const willBeFavorited = !product.isFavorited;
    // 낙관적 업데이트 — 실패 시 글로벌 토스트가 알려주고 catch 에서 롤백.
    setProduct({ ...product, isFavorited: willBeFavorited });
    try {
      if (willBeFavorited) {
        await addFavorite(product.id);
      } else {
        await removeFavorite(product.id);
      }
    } catch (e) {
      console.error("Failed to toggle favorite:", e);
      setProduct({ ...product, isFavorited: !willBeFavorited });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewContent.trim()) return;
    setIsSubmittingReview(true);
    try {
      const review = await createReview(product.id, {
        content: reviewContent.trim(),
        rating: reviewRating,
      });
      setReviews([review, ...reviews]);
      setReviewContent("");
      setReviewRating(5);
    } catch (e) {
      console.error("Failed to create review:", e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleReviewLike = async (reviewId: number) => {
    try {
      await toggleReviewLike(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, isLiked: !r.isLiked, likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1 }
            : r,
        ),
      );
    } catch (e) {
      console.error("Failed to toggle review like:", e);
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <p className="text-zinc-500">불러오는 중...</p>
      </UserLayout>
    );
  }
  if (!product) {
    return (
      <UserLayout>
        <p className="text-zinc-500">상품을 찾을 수 없습니다.</p>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <div className="overflow-hidden rounded-2xl bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
          </div>
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{product.name}</h1>
            <p className="text-xl font-bold text-pink-600 sm:text-2xl">{formatPrice(product.price)}</p>
            {product.description && (
              <p className="whitespace-pre-wrap text-sm text-zinc-600 leading-relaxed">{product.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleLike}
                disabled={!isLoggedIn}
                className="gap-2"
              >
                <Heart
                  size={18}
                  fill={product.isLiked ? "currentColor" : "none"}
                  className={product.isLiked ? "text-pink-500" : ""}
                />
                좋아요 {product.likeCount}
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                disabled={!isLoggedIn}
                className="gap-2"
              >
                <Bookmark
                  size={18}
                  fill={product.isFavorited ? "currentColor" : "none"}
                  className={product.isFavorited ? "text-amber-500" : ""}
                />
                {product.isFavorited ? "찜됨" : "찜하기"}
              </Button>
              {!isLoggedIn && (
                <p className="text-xs text-zinc-400">좋아요/찜은 로그인 후 가능합니다.</p>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm font-medium text-zinc-700">수량</label>
              <div className="flex items-center rounded-md border border-zinc-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-zinc-500 hover:text-pink-500"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-zinc-500 hover:text-pink-500"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button variant="outline" onClick={handleAddToCart} className="gap-2">
                <ShoppingCart size={16} />
                장바구니 담기
              </Button>
              <Button
                onClick={() => router.push("/user/cart/reserve")}
                className="gap-2 bg-pink-500 hover:bg-pink-600"
              >
                예약하기
              </Button>
            </div>
          </div>
        </div>

        <section className="space-y-4 border-t border-zinc-100 pt-6 sm:pt-8">
          <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">후기 ({reviews.length})</h2>

          {isLoggedIn && (
            <form onSubmit={handleSubmitReview} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-zinc-700">평점</label>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating(n)}
                    className="text-yellow-500"
                  >
                    <Star size={18} fill={n <= reviewRating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={3}
                placeholder="후기를 남겨주세요"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmittingReview || !reviewContent.trim()}>
                  {isSubmittingReview ? "등록 중..." : "후기 등록"}
                </Button>
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-400">아직 후기가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-zinc-100 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-medium text-zinc-700">{r.authorName}</span>
                      <span>·</span>
                      <span>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{r.content}</p>
                  <button
                    onClick={() => handleToggleReviewLike(r.id)}
                    disabled={!isLoggedIn}
                    className="mt-2 flex items-center gap-1 text-xs text-zinc-400 hover:text-pink-500 disabled:opacity-50"
                  >
                    <Heart size={14} fill={r.isLiked ? "currentColor" : "none"} className={r.isLiked ? "text-pink-500" : ""} />
                    {r.likeCount}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </UserLayout>
  );
}
