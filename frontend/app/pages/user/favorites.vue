<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Bookmark, Trash2 } from "lucide-vue-next";
import { getMyFavorites, removeFavorite } from "~/api/favorite.api";
import type { Favorite } from "~/api/types";
import { formatPrice } from "~/utils/format";

const favorites = ref<Favorite[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    favorites.value = await getMyFavorites();
  } catch (e) {
    console.error("Failed to load favorites:", e);
  } finally {
    isLoading.value = false;
  }
});

async function handleRemove(productId: number) {
  // 낙관적 제거 — 실패 시 글로벌 토스트.
  const before = favorites.value;
  favorites.value = favorites.value.filter((f) => f.productId !== productId);
  try {
    await removeFavorite(productId);
  } catch (e) {
    console.error("Failed to remove favorite:", e);
    favorites.value = before;
  }
}
</script>

<template>
  <UserLayout>
    <div class="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 class="flex items-center gap-2 text-xl font-bold text-zinc-900 sm:text-2xl">
          <Bookmark :size="24" class="text-amber-500" fill="currentColor" />
          내 찜 목록
        </h1>
        <p class="mt-1.5 text-sm text-zinc-500">
          관심 있는 케이크를 모아두는 공간입니다. 예약은 상품 상세에서 진행하세요.
        </p>
      </div>

      <p v-if="isLoading" class="text-zinc-500">불러오는 중...</p>

      <div
        v-else-if="favorites.length === 0"
        class="space-y-3 rounded-xl border border-zinc-200 bg-white p-10 text-center"
      >
        <Bookmark :size="48" class="mx-auto text-zinc-300" />
        <p class="text-sm text-zinc-500">아직 찜한 상품이 없습니다.</p>
        <NuxtLink to="/user/products">
          <Button class="bg-pink-500 hover:bg-pink-600">상품 보러 가기</Button>
        </NuxtLink>
      </div>

      <ul v-else class="grid gap-4 sm:gap-5 sm:grid-cols-2">
        <li v-for="f in favorites" :key="f.id" class="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <NuxtLink :to="`/user/products/${f.productId}`" class="block">
            <div class="aspect-[4/3] overflow-hidden bg-zinc-100">
              <img
                :src="f.productImageUrl"
                :alt="f.productName"
                class="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
          </NuxtLink>
          <div class="space-y-2.5 p-4 sm:p-5">
            <div class="flex items-start justify-between gap-2">
              <NuxtLink :to="`/user/products/${f.productId}`" class="font-bold text-zinc-900 hover:text-pink-600">
                {{ f.productName }}
              </NuxtLink>
              <button
                class="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                title="찜 해제"
                @click="handleRemove(f.productId)"
              >
                <Trash2 :size="16" />
              </button>
            </div>
            <p class="text-sm font-bold text-pink-600 sm:text-base">{{ formatPrice(f.productPrice) }}</p>
            <span
              v-if="f.productStatus !== 'AVAILABLE'"
              class="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
            >
              {{ f.productStatus === "SOLD_OUT" ? "품절" : "비공개" }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </UserLayout>
</template>
