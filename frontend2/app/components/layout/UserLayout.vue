<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Cake, ShoppingCart, User, LogOut, X, Trash2, Plus, Minus, Menu } from "lucide-vue-next";
import { cn } from "~/utils/format";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";

const NAV_ITEMS = [
  { href: "/user/products", label: "상품 목록" },
  { href: "/user/reservations", label: "내 예약" },
  { href: "/user/favorites", label: "내 찜" },
  { href: "/posts", label: "홍보글" },
];

const auth = useAuthStore();
const cart = useCartStore();
const route = useRoute();
const router = useRouter();

const isCartOpen = ref(false);
const isMenuOpen = ref(false);
const isInfoOpen = ref(false);

// 라우트 이동 시 모바일 메뉴 / 내 정보 popover 자동 닫기
watch(
  () => route.path,
  () => {
    isMenuOpen.value = false;
    isInfoOpen.value = false;
  },
);

function handleReserveFromCart() {
  isCartOpen.value = false;
  router.push("/user/cart/reserve");
}

function hideImage(e: Event) {
  (e.target as HTMLImageElement).style.display = "none";
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <header class="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 md:hidden"
            aria-label="메뉴 열기"
            @click="isMenuOpen = true"
          >
            <Menu :size="22" />
          </button>
          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-white">
              <Cake :size="20" />
            </div>
            <span class="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">Cake Order</span>
          </NuxtLink>
        </div>

        <nav class="hidden items-center gap-6 md:flex lg:gap-8">
          <NuxtLink
            v-for="item in NAV_ITEMS"
            :key="item.href"
            :to="item.href"
            class="text-sm font-medium text-zinc-600 hover:text-pink-600"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-3 sm:gap-4">
          <template v-if="!auth.isLoading">
            <template v-if="auth.isLoggedIn">
              <button
                class="relative text-zinc-600 hover:text-pink-600"
                aria-label="장바구니 열기"
                @click="isCartOpen = true"
              >
                <ShoppingCart :size="22" />
                <span
                  v-if="cart.totalCount > 0"
                  class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white"
                >
                  {{ cart.totalCount }}
                </span>
              </button>
              <div class="relative">
                <button
                  type="button"
                  class="block h-8 w-8 overflow-hidden rounded-full bg-zinc-200 transition-opacity hover:opacity-80"
                  aria-label="내 정보 열기"
                  aria-haspopup="dialog"
                  :aria-expanded="isInfoOpen"
                  @mousedown.stop="isInfoOpen = !isInfoOpen"
                >
                  <img
                    v-if="auth.userInfo?.profileImageUrl"
                    :src="auth.userInfo.profileImageUrl"
                    :alt="auth.userInfo.nickname"
                    class="h-full w-full object-cover"
                    @error="hideImage"
                  />
                  <User v-else :size="32" class="p-1 text-zinc-400" />
                </button>
                <UserInfoPopover
                  :user-info="auth.userInfo"
                  :is-open="isInfoOpen"
                  @close="isInfoOpen = false"
                />
              </div>
              <button
                class="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                aria-label="로그아웃"
                @click="auth.logout()"
              >
                <LogOut :size="18" />
              </button>
            </template>
            <NuxtLink v-else to="/login">
              <Button variant="outline" size="sm">로그인</Button>
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- 모바일 네비게이션 Drawer -->
    <template v-if="isMenuOpen">
      <div
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
        aria-hidden="true"
        @click="isMenuOpen = false"
      />
      <div class="fixed left-0 top-0 z-50 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl md:hidden">
        <div class="flex items-center justify-between border-b p-5">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-white">
              <Cake :size="20" />
            </div>
            <span class="text-lg font-bold tracking-tight">Cake Order</span>
          </div>
          <button
            class="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="메뉴 닫기"
            @click="isMenuOpen = false"
          >
            <X :size="22" />
          </button>
        </div>
        <nav class="flex flex-col gap-1 p-3">
          <NuxtLink
            v-for="item in NAV_ITEMS"
            :key="item.href"
            :to="item.href"
            :class="cn(
              'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
              route.path === item.href || route.path.startsWith(item.href + '/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-zinc-700 hover:bg-zinc-50',
            )"
            @click="isMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </template>

    <!-- Cart Drawer -->
    <template v-if="isCartOpen">
      <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" @click="isCartOpen = false" />
      <div class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl">
        <div class="flex h-full flex-col">
          <div class="flex items-center justify-between border-b p-4 sm:p-6">
            <h2 class="text-lg font-bold sm:text-xl">장바구니</h2>
            <button class="text-zinc-400 hover:text-zinc-600" @click="isCartOpen = false">
              <X :size="24" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 sm:p-6">
            <div
              v-if="cart.items.length === 0"
              class="flex h-full flex-col items-center justify-center text-zinc-400"
            >
              <ShoppingCart :size="48" class="mb-4 opacity-20" />
              <p>장바구니가 비어 있습니다.</p>
            </div>
            <div v-else class="space-y-6">
              <div v-for="item in cart.items" :key="item.id" class="flex gap-4">
                <div class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  <img :src="item.imageUrl" :alt="item.name" class="h-full w-full object-cover" />
                </div>
                <div class="flex flex-1 flex-col">
                  <div class="flex justify-between gap-2">
                    <h3 class="text-sm font-bold text-zinc-900">{{ item.name }}</h3>
                    <button class="text-zinc-400 hover:text-red-500" @click="cart.removeItem(item.id)">
                      <Trash2 :size="16" />
                    </button>
                  </div>
                  <p class="text-xs text-zinc-500">{{ item.price.toLocaleString() }}원</p>
                  <div class="mt-auto flex flex-wrap items-center gap-3">
                    <div class="flex items-center rounded-md border border-zinc-200">
                      <button class="p-1 hover:text-pink-500" @click="cart.updateQuantity(item.id, item.quantity - 1)">
                        <Minus :size="14" />
                      </button>
                      <span class="w-8 text-center text-xs font-medium">{{ item.quantity }}</span>
                      <button class="p-1 hover:text-pink-500" @click="cart.updateQuantity(item.id, item.quantity + 1)">
                        <Plus :size="14" />
                      </button>
                    </div>
                    <p class="text-sm font-bold">{{ (item.price * item.quantity).toLocaleString() }}원</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="cart.items.length > 0" class="space-y-4 border-t p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <span class="text-zinc-500">결제 예정 금액</span>
              <span class="text-xl font-bold">{{ cart.totalPrice.toLocaleString() }}원</span>
            </div>
            <Button
              class="h-12 w-full bg-pink-500 text-base font-bold hover:bg-pink-600"
              @click="handleReserveFromCart"
            >
              예약하기
            </Button>
          </div>
        </div>
      </div>
    </template>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <slot />
    </main>
  </div>
</template>
