<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronLeft, ChevronRight, Eye, Heart, ImageIcon, Megaphone, Search } from "lucide-vue-next";
import { getAllPostsPage } from "~/api/post.api";
import type { Post } from "~/api/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const items = ref<Post[]>([]);
const total = ref(0);
const offset = ref(0);
const limit = ref(20);
const keyword = ref("");
const debouncedKeyword = ref("");
const isLoading = ref(true);

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
watch(keyword, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = keyword.value.trim();
  }, 300);
});

watch(debouncedKeyword, () => {
  offset.value = 0;
});

async function fetchPosts() {
  isLoading.value = true;
  try {
    const data = await getAllPostsPage({
      offset: offset.value,
      limit: limit.value,
      keyword: debouncedKeyword.value || undefined,
    });
    items.value = data.items;
    total.value = data.total;
    if (data.offset !== offset.value) offset.value = data.offset;
  } catch (e) {
    console.error("Failed to fetch posts:", e);
  } finally {
    isLoading.value = false;
  }
}

watch([offset, limit, debouncedKeyword], fetchPosts, { immediate: true });

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const canPrev = computed(() => offset.value >= limit.value);
const canNext = computed(() => offset.value + items.value.length < total.value);

function handlePrev() {
  if (canPrev.value) offset.value = Math.max(0, offset.value - limit.value);
}
function handleNext() {
  if (canNext.value) offset.value = offset.value + limit.value;
}
function handleLimitChange() {
  offset.value = 0;
}
</script>

<template>
  <UserLayout>
    <div class="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <!-- 페이지 헤더 -->
      <header class="space-y-4">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wider text-pink-500">Community</p>
          <h1 class="text-2xl font-bold text-zinc-900 sm:text-3xl">홍보 게시글</h1>
          <p class="text-sm text-zinc-500">
            새로 나온 케이크 소식과 이벤트를 확인해 보세요.
          </p>
        </div>

        <!-- 검색바 -->
        <div class="relative">
          <Search :size="16" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            v-model="keyword"
            type="text"
            placeholder="궁금한 게시글을 검색해 보세요"
            class="w-full rounded-full border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
          />
        </div>

        <!-- 결과 요약 -->
        <div class="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs text-zinc-500">
          <p>
            <span class="font-semibold text-zinc-900">{{ total }}</span>건의 게시글
            <template v-if="debouncedKeyword">
              · <span class="text-pink-500">"{{ debouncedKeyword }}"</span> 검색 결과
            </template>
          </p>
          <p class="hidden text-zinc-400 sm:block">최신순</p>
        </div>
      </header>

      <!-- 로딩 -->
      <div v-if="isLoading" class="space-y-3">
        <div
          v-for="n in 4"
          :key="n"
          class="flex animate-pulse gap-4 rounded-2xl border border-zinc-100 bg-white p-5"
        >
          <div class="h-20 w-20 shrink-0 rounded-xl bg-zinc-100" />
          <div class="flex-1 space-y-2 py-1">
            <div class="h-3 w-1/3 rounded bg-zinc-100" />
            <div class="h-4 w-3/4 rounded bg-zinc-100" />
            <div class="h-3 w-1/2 rounded bg-zinc-100" />
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div
        v-else-if="items.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-20 text-center"
      >
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <Search :size="22" />
        </div>
        <p class="text-sm font-semibold text-zinc-700">
          {{ debouncedKeyword ? "검색 결과가 없습니다." : "아직 등록된 게시글이 없습니다." }}
        </p>
        <p class="mt-1 text-xs text-zinc-400">
          {{ debouncedKeyword ? "다른 키워드로 검색해 보세요." : "곧 새로운 소식이 올라올 거예요." }}
        </p>
      </div>

      <!-- 게시글 리스트 -->
      <ul v-else class="space-y-3">
        <li v-for="post in items" :key="post.id">
          <NuxtLink
            :to="`/posts/${post.id}`"
            class="group flex gap-4 rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md sm:gap-5 sm:p-5"
            :class="post.isNotice ? 'border-pink-200 bg-pink-50/30' : 'border-zinc-100 hover:border-pink-200'"
          >
            <!-- 썸네일 -->
            <div
              class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-zinc-300 sm:h-24 sm:w-24"
            >
              <img
                v-if="post.imageUrl"
                :src="post.imageUrl"
                :alt="post.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <ImageIcon v-else :size="26" />
            </div>

            <!-- 본문 -->
            <div class="flex min-w-0 flex-1 flex-col justify-between">
              <div class="min-w-0">
                <!-- 배지 -->
                <div v-if="post.isNotice" class="mb-2 flex items-center gap-1.5">
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    <Megaphone :size="10" />
                    공지
                  </span>
                </div>
                <h2
                  class="line-clamp-2 text-sm font-bold text-zinc-900 transition-colors group-hover:text-pink-600 sm:text-base"
                >
                  {{ post.title }}
                </h2>
                <p class="mt-1 line-clamp-1 text-xs text-zinc-500 sm:line-clamp-2 sm:text-sm">
                  {{ post.content }}
                </p>
              </div>

              <!-- 메타데이터 -->
              <div class="mt-2 flex items-center gap-3 text-[11px] text-zinc-400 sm:mt-3 sm:text-xs">
                <span>{{ new Date(post.createdAt).toLocaleDateString("ko-KR") }}</span>
                <span class="text-zinc-200">·</span>
                <span class="flex items-center gap-1">
                  <Eye :size="12" />
                  {{ post.viewCount.toLocaleString() }}
                </span>
                <span class="flex items-center gap-1" :class="post.isLiked ? 'text-pink-500' : ''">
                  <Heart :size="12" :fill="post.isLiked ? 'currentColor' : 'none'" />
                  {{ post.likeCount.toLocaleString() }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <!-- 페이지네이션 -->
      <div
        v-if="!isLoading && items.length > 0"
        class="flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-5 sm:flex-row"
      >
        <div class="order-2 flex items-center gap-2 text-xs text-zinc-500 sm:order-1">
          <span>페이지당</span>
          <select
            v-model.number="limit"
            class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
            @change="handleLimitChange"
          >
            <option v-for="n in PAGE_SIZE_OPTIONS" :key="n" :value="n">{{ n }}개</option>
          </select>
        </div>
        <div class="order-1 flex items-center gap-3 text-xs sm:order-2 sm:text-sm">
          <span class="text-zinc-500">
            <span class="font-bold text-zinc-900">{{ currentPage }}</span>
            <span class="mx-1 text-zinc-300">/</span>
            {{ totalPages }}
          </span>
          <div class="flex gap-1">
            <Button size="sm" variant="outline" class="gap-1" :disabled="!canPrev || isLoading" @click="handlePrev">
              <ChevronLeft :size="14" />
              이전
            </Button>
            <Button size="sm" variant="outline" class="gap-1" :disabled="!canNext || isLoading" @click="handleNext">
              다음
              <ChevronRight :size="14" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>
