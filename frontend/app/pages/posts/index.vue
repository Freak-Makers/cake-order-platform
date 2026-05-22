<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronLeft, ChevronRight, Eye, Heart, ImageIcon, Search } from "lucide-vue-next";
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
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 class="text-xl font-bold text-zinc-900 sm:text-2xl">홍보 게시글</h1>
          <p class="mt-1 text-sm text-zinc-500">
            총 {{ total }}건<template v-if="debouncedKeyword"> · "{{ debouncedKeyword }}" 검색</template>
          </p>
        </div>
        <div class="relative w-full sm:max-w-xs">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            v-model="keyword"
            type="text"
            placeholder="제목으로 검색"
            class="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-pink-500 focus:outline-none"
          />
        </div>
      </div>

      <p v-if="isLoading" class="text-zinc-500">불러오는 중...</p>

      <div
        v-else-if="items.length === 0"
        class="rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center text-zinc-400"
      >
        {{ debouncedKeyword ? "검색 결과가 없습니다." : "아직 등록된 게시글이 없습니다." }}
      </div>

      <ul v-else class="space-y-2">
        <li v-for="post in items" :key="post.id">
          <NuxtLink
            :to="`/posts/${post.id}`"
            class="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-zinc-300">
              <img
                v-if="post.imageUrl"
                :src="post.imageUrl"
                :alt="post.title"
                class="h-full w-full object-cover"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <ImageIcon v-else :size="22" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span
                  v-if="post.isNotice"
                  class="shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white"
                >
                  공지
                </span>
                <h2 class="truncate text-sm font-bold text-zinc-900">{{ post.title }}</h2>
              </div>
              <p class="mt-1 line-clamp-1 text-xs text-zinc-500">{{ post.content }}</p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-1 text-xs text-zinc-400">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <Eye :size="12" />
                  {{ post.viewCount }}
                </span>
                <span class="flex items-center gap-1" :class="post.isLiked ? 'text-pink-500' : ''">
                  <Heart :size="12" :fill="post.isLiked ? 'currentColor' : 'none'" />
                  {{ post.likeCount }}
                </span>
              </div>
              <span>{{ new Date(post.createdAt).toLocaleDateString("ko-KR") }}</span>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <!-- 페이지네이션 -->
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div class="flex items-center gap-2 text-zinc-500">
          <span>페이지당</span>
          <select
            v-model.number="limit"
            class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm focus:border-pink-500 focus:outline-none"
            @change="handleLimitChange"
          >
            <option v-for="n in PAGE_SIZE_OPTIONS" :key="n" :value="n">{{ n }}개</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-zinc-500">
            <span class="font-bold text-zinc-900">{{ currentPage }}</span> / {{ totalPages }} 페이지
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
