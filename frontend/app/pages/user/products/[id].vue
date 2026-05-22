<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Bookmark, Heart, ShoppingCart, Star } from "lucide-vue-next";
import { getProduct, toggleProductLike } from "~/api/product.api";
import { addFavorite, removeFavorite } from "~/api/favorite.api";
import { getProductReviews, createReview, toggleReviewLike } from "~/api/review.api";
import type { Product, Review } from "~/api/types";
import { formatPrice } from "~/utils/format";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";

const route = useRoute();
const router = useRouter();
const productId = Number(route.params.id);
const auth = useAuthStore();
const cart = useCartStore();

const product = ref<Product | null>(null);
const reviews = ref<Review[]>([]);
const quantity = ref(1);
const reviewContent = ref("");
const reviewRating = ref(5);
const isLoading = ref(true);
const isSubmittingReview = ref(false);

onMounted(async () => {
  if (!productId) return;
  try {
    const [p, r] = await Promise.all([getProduct(productId), getProductReviews(productId)]);
    product.value = p;
    reviews.value = r;
  } catch (e) {
    console.error("Failed to load product detail:", e);
  } finally {
    isLoading.value = false;
  }
});

async function handleLike() {
  if (!product.value || !auth.isLoggedIn) return;
  try {
    await toggleProductLike(product.value.id);
    product.value = {
      ...product.value,
      isLiked: !product.value.isLiked,
      likeCount: product.value.isLiked ? product.value.likeCount - 1 : product.value.likeCount + 1,
    };
  } catch (e) {
    console.error("Failed to toggle product like:", e);
  }
}

async function handleToggleFavorite() {
  if (!product.value || !auth.isLoggedIn) return;
  const willBeFavorited = !product.value.isFavorited;
  // 낙관적 업데이트 — 실패 시 글로벌 토스트가 알려주고 catch 에서 롤백.
  product.value = { ...product.value, isFavorited: willBeFavorited };
  try {
    if (willBeFavorited) {
      await addFavorite(product.value.id);
    } else {
      await removeFavorite(product.value.id);
    }
  } catch (e) {
    console.error("Failed to toggle favorite:", e);
    if (product.value) product.value = { ...product.value, isFavorited: !willBeFavorited };
  }
}

function handleAddToCart() {
  if (!product.value) return;
  cart.addItem(product.value, quantity.value);
}

async function handleSubmitReview() {
  if (!product.value || !reviewContent.value.trim()) return;
  isSubmittingReview.value = true;
  try {
    const review = await createReview(product.value.id, {
      content: reviewContent.value.trim(),
      rating: reviewRating.value,
    });
    reviews.value = [review, ...reviews.value];
    reviewContent.value = "";
    reviewRating.value = 5;
  } catch (e) {
    console.error("Failed to create review:", e);
  } finally {
    isSubmittingReview.value = false;
  }
}

async function handleToggleReviewLike(reviewId: number) {
  try {
    await toggleReviewLike(reviewId);
    reviews.value = reviews.value.map((r) =>
      r.id === reviewId
        ? { ...r, isLiked: !r.isLiked, likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1 }
        : r,
    );
  } catch (e) {
    console.error("Failed to toggle review like:", e);
  }
}
</script>

<template>
  <UserLayout>
    <p v-if="isLoading" class="text-zinc-500">불러오는 중...</p>
    <p v-else-if="!product" class="text-zinc-500">상품을 찾을 수 없습니다.</p>

    <div v-else class="mx-auto max-w-4xl space-y-8 sm:space-y-10">
      <div class="grid gap-6 md:grid-cols-2 md:gap-8">
        <div class="overflow-hidden rounded-2xl bg-zinc-100">
          <img :src="product.imageUrl" :alt="product.name" class="aspect-square w-full object-cover" />
        </div>
        <div class="flex flex-col gap-4">
          <span class="inline-flex w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
            {{ product.category }}
          </span>
          <h1 class="text-2xl font-bold text-zinc-900 sm:text-3xl">{{ product.name }}</h1>
          <p class="text-xl font-bold text-pink-600 sm:text-2xl">{{ formatPrice(product.price) }}</p>
          <p v-if="product.description" class="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
            {{ product.description }}
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <Button variant="outline" :disabled="!auth.isLoggedIn" class="gap-2" @click="handleLike">
              <Heart
                :size="18"
                :fill="product.isLiked ? 'currentColor' : 'none'"
                :class="product.isLiked ? 'text-pink-500' : ''"
              />
              좋아요 {{ product.likeCount }}
            </Button>
            <Button variant="outline" :disabled="!auth.isLoggedIn" class="gap-2" @click="handleToggleFavorite">
              <Bookmark
                :size="18"
                :fill="product.isFavorited ? 'currentColor' : 'none'"
                :class="product.isFavorited ? 'text-amber-500' : ''"
              />
              {{ product.isFavorited ? "찜됨" : "찜하기" }}
            </Button>
            <p v-if="!auth.isLoggedIn" class="text-xs text-zinc-400">좋아요/찜은 로그인 후 가능합니다.</p>
          </div>

          <div class="mt-4 flex items-center gap-3">
            <label class="text-sm font-medium text-zinc-700">수량</label>
            <div class="flex items-center rounded-md border border-zinc-200">
              <button
                class="px-3 py-1 text-zinc-500 hover:text-pink-500"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                −
              </button>
              <span class="w-10 text-center text-sm font-medium">{{ quantity }}</span>
              <button class="px-3 py-1 text-zinc-500 hover:text-pink-500" @click="quantity = quantity + 1">
                +
              </button>
            </div>
          </div>

          <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button variant="outline" class="gap-2" @click="handleAddToCart">
              <ShoppingCart :size="16" />
              장바구니 담기
            </Button>
            <Button class="gap-2 bg-pink-500 hover:bg-pink-600" @click="router.push('/user/cart/reserve')">
              예약하기
            </Button>
          </div>
        </div>
      </div>

      <section class="space-y-4 border-t border-zinc-100 pt-6 sm:pt-8">
        <h2 class="text-lg font-bold text-zinc-900 sm:text-xl">후기 ({{ reviews.length }})</h2>

        <form
          v-if="auth.isLoggedIn"
          class="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
          @submit.prevent="handleSubmitReview"
        >
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-zinc-700">평점</label>
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="text-yellow-500"
              @click="reviewRating = n"
            >
              <Star :size="18" :fill="n <= reviewRating ? 'currentColor' : 'none'" />
            </button>
          </div>
          <textarea
            v-model="reviewContent"
            :rows="3"
            placeholder="후기를 남겨주세요"
            class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <div class="flex justify-end">
            <Button type="submit" :disabled="isSubmittingReview || !reviewContent.trim()">
              {{ isSubmittingReview ? "등록 중..." : "후기 등록" }}
            </Button>
          </div>
        </form>

        <p v-if="reviews.length === 0" class="text-sm text-zinc-400">아직 후기가 없습니다.</p>
        <ul v-else class="space-y-3">
          <li v-for="r in reviews" :key="r.id" class="rounded-lg border border-zinc-100 bg-white p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs text-zinc-500">
                <span class="font-medium text-zinc-700">{{ r.authorName }}</span>
                <span>·</span>
                <span>{{ new Date(r.createdAt).toLocaleDateString("ko-KR") }}</span>
              </div>
              <div class="flex items-center gap-1 text-yellow-500">
                <Star v-for="i in r.rating" :key="i" :size="14" fill="currentColor" />
              </div>
            </div>
            <p class="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{{ r.content }}</p>
            <button
              :disabled="!auth.isLoggedIn"
              class="mt-2 flex items-center gap-1 text-xs text-zinc-400 hover:text-pink-500 disabled:opacity-50"
              @click="handleToggleReviewLike(r.id)"
            >
              <Heart :size="14" :fill="r.isLiked ? 'currentColor' : 'none'" :class="r.isLiked ? 'text-pink-500' : ''" />
              {{ r.likeCount }}
            </button>
          </li>
        </ul>
      </section>
    </div>
  </UserLayout>
</template>
