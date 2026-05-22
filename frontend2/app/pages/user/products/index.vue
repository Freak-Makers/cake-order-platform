<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ShoppingCart, Heart, Loader2, X, Plus, Minus, Calendar, MessageSquare,
  Star, ThumbsUp, MessageCircle, ArrowRight, Sparkles, ChevronDown,
} from "lucide-vue-next";
import { getProducts, getProductCategories } from "~/api/product.api";
import { createReservation, getAvailableSlots } from "~/api/reservation.api";
import { getProductReviews, toggleReviewLike, createReview } from "~/api/review.api";
import type { Product, ProductSort, ReservationSlot, Review } from "~/api/types";
import { cn } from "~/utils/format";
import { useCartStore } from "~/stores/cart";

const PAGE_SIZE = 20;

const router = useRouter();
const cart = useCartStore();

const products = ref<Product[]>([]);
const cursor = ref<string | null>(null);
const hasNext = ref(true);
const isInitialLoading = ref(true);
const isFetchingMore = ref(false);
const categories = ref<string[]>(["전체"]);
const selectedProduct = ref<Product | null>(null);
const activeTab = ref<"order" | "reviews">("order");
const reviews = ref<Review[]>([]);
const selectedCategory = ref("전체");
const sortKey = ref<ProductSort>("latest");

// 예약 상태
const orderQuantity = ref(1);
const slots = ref<ReservationSlot[]>([]);
const selectedSlotId = ref<number | "">("");
const requirements = ref("");
const isReserving = ref(false);

// 후기 작성 상태
const newReviewContent = ref("");
const newReviewRating = ref(5);

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// 카테고리 + 슬롯 — 마운트 시 1회
onMounted(() => {
  getProductCategories()
    .then((res) => {
      categories.value = ["전체", ...res];
    })
    .catch((e) => console.error("Failed to fetch categories:", e));
  getAvailableSlots()
    .then((s) => {
      slots.value = s;
    })
    .catch((e) => console.error("Failed to fetch slots:", e));

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMore();
    },
    { rootMargin: "200px" },
  );
});

onBeforeUnmount(() => observer?.disconnect());

// 필터/정렬 변경 시 첫 페이지 재요청
watch(
  [selectedCategory, sortKey],
  async (_cur, _prev, onCleanup) => {
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });
    isInitialLoading.value = true;
    products.value = [];
    cursor.value = null;
    hasNext.value = true;
    try {
      const res = await getProducts({
        cursor: null,
        limit: PAGE_SIZE,
        category: selectedCategory.value === "전체" ? null : selectedCategory.value,
        sort: sortKey.value,
      });
      if (cancelled) return;
      products.value = res.items;
      cursor.value = res.nextCursor;
      hasNext.value = res.hasNext;
    } catch (e) {
      if (!cancelled) console.error("Failed to fetch products:", e);
    } finally {
      if (!cancelled) isInitialLoading.value = false;
    }
  },
  { immediate: true },
);

async function loadMore() {
  if (!hasNext.value || isFetchingMore.value || isInitialLoading.value || !cursor.value) return;
  isFetchingMore.value = true;
  try {
    const res = await getProducts({
      cursor: cursor.value,
      limit: PAGE_SIZE,
      category: selectedCategory.value === "전체" ? null : selectedCategory.value,
      sort: sortKey.value,
    });
    products.value = [...products.value, ...res.items];
    cursor.value = res.nextCursor;
    hasNext.value = res.hasNext;
  } catch (e) {
    console.error("Failed to fetch next page:", e);
  } finally {
    isFetchingMore.value = false;
  }
}

// sentinel 이 등장/제거될 때 observer 연결 갱신
watch(sentinel, (el, old) => {
  if (old && observer) observer.unobserve(old);
  if (el && observer) observer.observe(el);
});

// 모달 후기 탭 진입 시 후기 조회
watch([selectedProduct, activeTab], async () => {
  if (selectedProduct.value && activeTab.value === "reviews") {
    try {
      reviews.value = await getProductReviews(selectedProduct.value.id);
    } catch (e) {
      console.error("Failed to fetch reviews:", e);
    }
  }
});

function openProduct(product: Product) {
  selectedProduct.value = product;
  orderQuantity.value = 1;
  activeTab.value = "order";
}

async function handleReserve() {
  if (!selectedProduct.value) return;
  if (!selectedSlotId.value) {
    alert("픽업 날짜(슬롯)를 선택해주세요.");
    return;
  }
  try {
    isReserving.value = true;
    await createReservation({
      productId: selectedProduct.value.id,
      slotId: Number(selectedSlotId.value),
      quantity: orderQuantity.value,
      requirements: requirements.value || null,
    });
    alert("예약 신청이 완료되었습니다. 사장님 확정 후 결제 단계로 진행됩니다.");
    selectedProduct.value = null;
    selectedSlotId.value = "";
    requirements.value = "";
    router.push("/user/reservations");
  } catch (e) {
    console.error("Reservation failed:", e);
    alert("예약 신청에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isReserving.value = false;
  }
}

function handleAddToCart() {
  if (!selectedProduct.value) return;
  cart.addItem(selectedProduct.value, orderQuantity.value);
  alert("장바구니에 담겼습니다.");
  selectedProduct.value = null;
}

async function handleLikeReview(reviewId: number) {
  try {
    await toggleReviewLike(reviewId);
    reviews.value = reviews.value.map((r) =>
      r.id === reviewId
        ? { ...r, isLiked: !r.isLiked, likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1 }
        : r,
    );
  } catch (e) {
    console.error("Failed to like review:", e);
  }
}

async function handleSubmitReview() {
  if (!selectedProduct.value) return;
  if (!newReviewContent.value.trim()) return;
  try {
    const review = await createReview(selectedProduct.value.id, {
      content: newReviewContent.value,
      rating: newReviewRating.value,
    });
    reviews.value = [review, ...reviews.value];
    newReviewContent.value = "";
    newReviewRating.value = 5;
  } catch (e) {
    console.error("Failed to submit review:", e);
  }
}

function openDetail() {
  if (!selectedProduct.value) return;
  const id = selectedProduct.value.id;
  selectedProduct.value = null;
  router.push(`/user/products/${id}`);
}
</script>

<template>
  <UserLayout>
    <!-- Hero -->
    <section class="relative mb-12 overflow-hidden rounded-2xl border border-rose-100/70 bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50/60 px-5 py-14 sm:mb-16 sm:rounded-[2rem] sm:px-8 sm:py-20 md:mb-20 md:px-16 md:py-28">
      <div class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-amber-100/40 blur-3xl" />
      <div class="pointer-events-none absolute inset-x-6 top-5 hidden items-center justify-between text-[10px] font-medium uppercase tracking-[0.4em] text-stone-400 sm:flex sm:inset-x-12 sm:top-8">
        <span>Maison de Gâteau</span>
        <span class="hidden md:inline">No. 001</span>
      </div>
      <div class="pointer-events-none absolute inset-x-6 bottom-5 hidden items-center justify-between text-[10px] font-medium uppercase tracking-[0.4em] text-stone-400 sm:flex sm:inset-x-12 sm:bottom-8">
        <span class="hidden md:inline">Seoul · 2026</span>
        <span>Spring Collection</span>
      </div>

      <div class="relative z-10 mx-auto max-w-3xl text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-rose-500 backdrop-blur sm:mb-6 sm:px-4 sm:py-1.5 sm:text-[11px] sm:tracking-[0.3em]">
          <Sparkles :size="12" /> Hand-crafted, made to order
        </div>
        <h1 class="text-balance text-3xl font-light leading-[1.1] tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.05] md:text-6xl">
          오늘의 작은 사치,
          <br />
          <span class="font-serif italic text-rose-500">한 조각의</span> 케이크.
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-balance text-sm leading-relaxed text-stone-500 sm:mt-8 sm:text-base md:text-lg">
          엄선된 재료와 한 분의 파티시에가 빚어내는 디자인. <br class="hidden md:inline" />
          특별한 하루를 위한 단 하나의 케이크를 만나보세요.
        </p>
        <div class="mt-7 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-stone-400 sm:mt-10 sm:text-xs">
          <span class="h-px w-8 bg-stone-300 sm:w-10" />
          Today's Selection
          <span class="h-px w-8 bg-stone-300 sm:w-10" />
        </div>
      </div>
    </section>

    <!-- Filter / Sort -->
    <div class="mb-10 flex flex-col gap-6 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div class="flex flex-col gap-3">
        <span class="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400">Collection</span>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="cn(
              'relative py-1 text-sm transition-colors',
              selectedCategory === cat ? 'font-semibold text-stone-900' : 'text-stone-400 hover:text-stone-700',
            )"
            @click="selectedCategory = cat"
          >
            {{ cat }}
            <span v-if="selectedCategory === cat" class="absolute -bottom-[7px] left-0 right-0 h-px bg-stone-900" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <span class="text-sm text-stone-500">
          <span class="font-semibold text-stone-900">{{ products.length }}</span>
          <span class="ml-1 text-xs uppercase tracking-[0.2em] text-stone-400">items{{ hasNext ? "+" : "" }}</span>
        </span>
        <div class="relative">
          <select
            v-model="sortKey"
            class="appearance-none rounded-full border border-stone-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 focus:border-stone-900 focus:outline-none"
          >
            <option value="latest">최신순</option>
            <option value="priceAsc">낮은 가격순</option>
            <option value="priceDesc">높은 가격순</option>
          </select>
          <ChevronDown :size="14" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>
    </div>

    <!-- 초기 로딩 스켈레톤 -->
    <div v-if="isInitialLoading" class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="i in 8" :key="i" class="animate-pulse">
        <div class="mb-3 aspect-[3/4] rounded-xl bg-stone-100" />
        <div class="h-3 w-16 rounded bg-stone-100" />
        <div class="mt-2 h-4 w-3/4 rounded bg-stone-100" />
        <div class="mt-2 h-4 w-1/3 rounded bg-stone-100" />
      </div>
    </div>

    <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-32 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-stone-200 text-stone-300">
        <Sparkles :size="22" />
      </div>
      <p class="text-sm text-stone-500">선택한 컬렉션에 아직 등록된 케이크가 없습니다.</p>
    </div>

    <template v-else>
      <!-- Featured — 첫 상품을 와이드 에디토리얼 카드로 -->
      <article
        v-if="products[0]"
        class="group mb-14 grid cursor-pointer overflow-hidden rounded-3xl border border-stone-200/70 bg-white md:h-60 md:grid-cols-12"
        @click="openProduct(products[0])"
      >
        <div class="relative aspect-[2/1] overflow-hidden bg-stone-100 md:col-span-7 md:aspect-auto">
          <img
            :src="products[0].imageUrl"
            :alt="products[0].name"
            class="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-stone-900/20 via-transparent to-transparent" />
          <div class="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/40 bg-white/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.25em] text-stone-700 backdrop-blur">
            <Sparkles :size="10" class="text-rose-500" /> Editor's Pick
          </div>
          <div
            v-if="products[0].status === 'SOLD_OUT'"
            class="absolute inset-0 flex items-center justify-center bg-stone-900/50 backdrop-blur-[2px]"
          >
            <span class="rounded-full border border-white/30 bg-white/90 px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-900">
              Sold Out
            </span>
          </div>
        </div>
        <div class="flex flex-col justify-between gap-3 p-4 md:col-span-5 md:p-5">
          <div>
            <div class="flex items-center justify-between">
              <span class="font-serif text-[11px] tracking-[0.25em] text-stone-400">— 01</span>
              <span class="text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                {{ products[0].category }}
              </span>
            </div>
            <h2 class="mt-2 text-balance text-lg font-light leading-[1.2] tracking-tight text-stone-900 md:text-xl">
              {{ products[0].name }}
            </h2>
            <p v-if="products[0].description" class="mt-1.5 line-clamp-1 text-[12px] leading-relaxed text-stone-500">
              {{ products[0].description }}
            </p>
          </div>
          <div class="flex items-end justify-between border-t border-stone-100 pt-2.5">
            <div class="flex items-baseline gap-2">
              <p class="text-base font-light tracking-tight text-stone-900">
                {{ products[0].price.toLocaleString() }}
                <span class="ml-1 text-[10px] font-normal text-stone-400">KRW</span>
              </p>
              <span class="flex items-center gap-0.5 text-[10px] text-stone-500">
                <Star :size="10" class="fill-amber-400 text-amber-400" />
                <span class="font-medium text-stone-700">4.8</span>
              </span>
            </div>
            <span class="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.25em] text-stone-900 transition-colors group-hover:text-rose-500">
              View detail
              <ArrowRight :size="11" class="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </article>

      <!-- Section eyebrow -->
      <div v-if="products.length > 1" class="mb-8 flex items-center gap-4">
        <span class="h-px flex-1 bg-stone-200" />
        <span class="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400">
          This Week's Selection
        </span>
        <span class="h-px flex-1 bg-stone-200" />
      </div>

      <!-- Grid — 나머지 상품 -->
      <div class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <article
          v-for="(product, i) in products.slice(1)"
          :key="product.id"
          class="group cursor-pointer"
          @click="openProduct(product)"
        >
          <div class="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-stone-100">
            <img
              :src="product.imageUrl"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
            />
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/45 via-stone-900/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <span class="absolute left-4 top-4 font-serif text-[11px] tracking-[0.25em] text-stone-700/80 mix-blend-multiply">
              — {{ String(i + 2).padStart(2, "0") }}
            </span>

            <button
              class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-stone-400 backdrop-blur-md transition-all hover:bg-white hover:text-rose-500"
              aria-label="찜하기"
              @click.stop
            >
              <Heart :size="14" />
            </button>

            <div
              v-if="product.status === 'SOLD_OUT'"
              class="absolute inset-0 flex items-center justify-center bg-stone-900/50 backdrop-blur-[2px]"
            >
              <span class="rounded-full border border-white/30 bg-white/90 px-4 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-900">
                Sold Out
              </span>
            </div>

            <div class="absolute inset-x-4 bottom-4 flex translate-y-3 items-center justify-between text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span class="text-[10px] font-medium uppercase tracking-[0.3em]">View detail</span>
              <ArrowRight :size="12" />
            </div>
          </div>

          <div class="px-0.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
                {{ product.category }}
              </span>
              <div class="flex items-center gap-1 text-[10px] text-stone-500">
                <Star :size="10" class="fill-amber-400 text-amber-400" />
                <span class="font-medium text-stone-700">4.8</span>
                <span class="text-stone-400">(128)</span>
              </div>
            </div>
            <h3 class="mt-1.5 line-clamp-1 text-sm font-medium leading-snug text-stone-900 transition-colors group-hover:text-rose-500">
              {{ product.name }}
            </h3>
            <p v-if="product.description" class="mt-1 line-clamp-1 text-[11px] leading-relaxed text-stone-400">
              {{ product.description }}
            </p>
            <div class="mt-2.5 flex items-end justify-between border-t border-stone-100 pt-2">
              <p class="text-sm font-medium tracking-tight text-stone-900">
                {{ product.price.toLocaleString() }}
                <span class="ml-1 text-[10px] font-normal text-stone-400">KRW</span>
              </p>
              <span class="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400 transition-colors group-hover:text-stone-900">
                Order →
              </span>
            </div>
          </div>
        </article>

        <!-- 추가 로딩 스켈레톤 -->
        <template v-if="isFetchingMore">
          <div v-for="i in 4" :key="`skeleton-${i}`" class="animate-pulse">
            <div class="mb-3 aspect-[3/4] rounded-xl bg-stone-100" />
            <div class="h-3 w-16 rounded bg-stone-100" />
            <div class="mt-2 h-4 w-3/4 rounded bg-stone-100" />
            <div class="mt-2 h-4 w-1/3 rounded bg-stone-100" />
          </div>
        </template>
      </div>

      <!-- Sentinel — 보이면 다음 페이지 로드 -->
      <div v-if="hasNext" ref="sentinel" class="h-12" aria-hidden="true" />
      <div
        v-if="!hasNext && products.length > 0"
        class="mt-16 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-stone-400"
      >
        <span class="h-px w-10 bg-stone-200" />
        End of Collection
        <span class="h-px w-10 bg-stone-200" />
      </div>
    </template>

    <!-- Product Detail & Order Modal -->
    <template v-if="selectedProduct">
      <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" @click="selectedProduct = null" />
      <div class="fixed inset-x-2 top-[2%] bottom-[2%] z-50 mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-x-4 sm:top-[5%] sm:bottom-[5%] sm:rounded-3xl">
        <button
          class="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 text-stone-500 backdrop-blur-md transition-all hover:rotate-90 hover:bg-white hover:text-stone-900 sm:right-6 sm:top-6"
          @click="selectedProduct = null"
        >
          <X :size="22" />
        </button>

        <div class="flex h-full flex-col md:flex-row">
          <!-- Left: Image -->
          <div class="h-48 shrink-0 overflow-hidden bg-stone-100 sm:h-64 md:h-auto md:w-1/2">
            <img :src="selectedProduct.imageUrl" :alt="selectedProduct.name" class="h-full w-full object-cover" />
          </div>

          <!-- Right: Content -->
          <div class="flex flex-1 flex-col overflow-hidden">
            <div class="border-b border-stone-100 p-5 pb-4 sm:p-8">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 sm:text-xs">
                {{ selectedProduct.category }}
              </span>
              <h2 class="mt-2 text-xl font-black leading-tight text-stone-900 sm:text-3xl">
                {{ selectedProduct.name }}
              </h2>
              <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p class="text-xl font-black text-stone-900 sm:text-2xl">
                  {{ selectedProduct.price.toLocaleString() }}원
                </p>
                <button
                  class="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-rose-500"
                  @click="openDetail"
                >
                  상세 보기 →
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-stone-100 px-5 sm:px-8">
              <button
                :class="cn(
                  'flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition-all sm:py-4',
                  activeTab === 'order' ? 'border-rose-500 text-rose-600' : 'border-transparent text-stone-400 hover:text-stone-600',
                )"
                @click="activeTab = 'order'"
              >
                <ShoppingCart :size="18" /> 주문 정보
              </button>
              <button
                :class="cn(
                  'ml-6 flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition-all sm:ml-8 sm:py-4',
                  activeTab === 'reviews' ? 'border-rose-500 text-rose-600' : 'border-transparent text-stone-400 hover:text-stone-600',
                )"
                @click="activeTab = 'reviews'"
              >
                <MessageCircle :size="18" /> 후기 ({{ reviews.length || 0 }})
              </button>
            </div>

            <!-- Tab Content -->
            <div class="custom-scrollbar flex-1 overflow-y-auto p-5 sm:p-8">
              <div v-if="activeTab === 'order'" class="space-y-8">
                <div>
                  <h4 class="mb-3 text-sm font-bold text-stone-900">상품 설명</h4>
                  <p class="text-sm leading-relaxed text-stone-600">
                    {{ selectedProduct.description || "이 케이크에 대한 상세 설명이 아직 준비되지 않았습니다. 매장에 문의해주세요!" }}
                  </p>
                </div>

                <div class="space-y-6 rounded-2xl bg-stone-50 p-6">
                  <div class="flex items-center justify-between">
                    <label class="text-sm font-bold text-stone-700">수량 선택</label>
                    <div class="flex items-center rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
                      <button
                        class="p-2 transition-colors hover:text-rose-500"
                        @click="orderQuantity = Math.max(1, orderQuantity - 1)"
                      >
                        <Minus :size="18" />
                      </button>
                      <span class="w-12 text-center text-lg font-black">{{ orderQuantity }}</span>
                      <button class="p-2 transition-colors hover:text-rose-500" @click="orderQuantity = orderQuantity + 1">
                        <Plus :size="18" />
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-xs font-bold uppercase text-stone-500">
                      <Calendar :size="14" class="text-rose-500" /> 픽업 가능 날짜
                    </label>
                    <select
                      v-model="selectedSlotId"
                      class="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="">날짜를 선택하세요</option>
                      <option v-for="s in slots" :key="s.id" :value="s.id">
                        {{ new Date(s.startAt).toLocaleString("ko-KR") }}
                      </option>
                    </select>
                    <p v-if="slots.length === 0" class="text-xs text-stone-400">
                      사장님이 등록한 예약 가능 날짜가 없습니다.
                    </p>
                  </div>

                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-xs font-bold uppercase text-stone-500">
                      <MessageSquare :size="14" class="text-rose-500" /> 특별 요청 사항
                    </label>
                    <textarea
                      v-model="requirements"
                      placeholder="레터링 문구 (최대 10자), 알레르기 유의사항 등을 적어주세요."
                      class="h-24 w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="space-y-8">
                <!-- Review Stats Summary -->
                <div class="flex items-center gap-6 rounded-2xl bg-stone-50 p-6">
                  <div class="text-center">
                    <div class="text-3xl font-black text-stone-900">4.8</div>
                    <div class="mt-1 flex gap-0.5">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        :size="12"
                        :class="cn('fill-amber-400 text-amber-400', i === 5 && 'opacity-30')"
                      />
                    </div>
                  </div>
                  <div class="flex-1 space-y-1.5">
                    <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-2">
                      <span class="w-2 text-[10px] font-bold text-stone-400">{{ star }}</span>
                      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                        <div
                          class="h-full bg-amber-400"
                          :style="{ width: star === 5 ? '80%' : star === 4 ? '15%' : '2%' }"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Review List -->
                <div class="divide-y divide-stone-100">
                  <div v-if="reviews.length === 0" class="py-10 text-center text-stone-400">
                    <MessageCircle class="mx-auto mb-3 opacity-20" :size="32" />
                    <p class="text-sm">
                      아직 작성된 후기가 없습니다. <br />첫 번째 후기의 주인공이 되어보세요!
                    </p>
                  </div>
                  <div v-for="review in reviews" v-else :key="review.id" class="py-6">
                    <div class="mb-3 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="h-8 w-8 overflow-hidden rounded-full bg-stone-200">
                          <img
                            :src="review.authorProfileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`"
                            alt=""
                          />
                        </div>
                        <div>
                          <p class="text-sm font-bold text-stone-900">{{ review.authorName }}</p>
                          <div class="mt-0.5 flex gap-0.5">
                            <Star
                              v-for="i in 5"
                              :key="i"
                              :size="10"
                              :class="i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'"
                            />
                          </div>
                        </div>
                      </div>
                      <span class="text-[10px] font-medium text-stone-400">
                        {{ new Date(review.createdAt).toLocaleDateString() }}
                      </span>
                    </div>
                    <p class="mb-4 text-sm leading-relaxed text-stone-600">{{ review.content }}</p>
                    <button
                      :class="cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                        review.isLiked
                          ? 'border-rose-500 bg-rose-50 text-rose-600'
                          : 'border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600',
                      )"
                      @click="handleLikeReview(review.id)"
                    >
                      <ThumbsUp :size="14" :class="review.isLiked ? 'fill-rose-500' : ''" />
                      {{ review.likeCount }}
                    </button>
                  </div>
                </div>

                <!-- Review Input -->
                <form class="mt-8 border-t border-stone-100 pt-8" @submit.prevent="handleSubmitReview">
                  <h4 class="mb-4 text-sm font-bold text-stone-900">후기 남기기</h4>
                  <div class="mb-4 flex gap-2">
                    <button
                      v-for="i in 5"
                      :key="i"
                      type="button"
                      class="transition-transform hover:scale-125"
                      @click="newReviewRating = i"
                    >
                      <Star
                        :size="24"
                        :class="i <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'"
                      />
                    </button>
                  </div>
                  <textarea
                    v-model="newReviewContent"
                    placeholder="이 케이크는 어떠셨나요? 다른 고객님들을 위해 후기를 남겨주세요."
                    class="h-32 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10"
                  />
                  <Button type="submit" :disabled="!newReviewContent.trim()" class="mt-4 w-full bg-stone-900 text-white hover:bg-stone-800">
                    후기 등록
                  </Button>
                </form>
              </div>
            </div>

            <!-- Footer: Order Button (Order Tab only) -->
            <div
              v-if="activeTab === 'order'"
              class="border-t border-stone-100 p-5 pt-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] sm:p-8 sm:pt-6"
            >
              <div class="mb-3 flex items-center justify-between sm:mb-4">
                <span class="font-medium text-stone-500">최종 결제 금액</span>
                <span class="text-2xl font-black text-rose-500 sm:text-3xl">
                  {{ (selectedProduct.price * orderQuantity).toLocaleString() }}원
                </span>
              </div>
              <div class="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  class="h-12 flex-1 border-2 text-sm font-bold sm:h-14 sm:text-base"
                  @click="handleAddToCart"
                >
                  장바구니 담기
                </Button>
                <Button
                  :disabled="isReserving || !selectedSlotId"
                  class="h-12 flex-[2] bg-rose-500 text-sm font-black text-white shadow-lg shadow-rose-200 hover:bg-rose-600 sm:h-14 sm:text-base"
                  @click="handleReserve"
                >
                  <Loader2 v-if="isReserving" class="animate-spin" :size="24" />
                  <template v-else>예약 신청</template>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UserLayout>
</template>

<style>
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
</style>
