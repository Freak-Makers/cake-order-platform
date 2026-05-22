<script setup lang="ts">
import { computed } from "vue";
import { Eye, Heart, X } from "lucide-vue-next";
import type { AdminPost, Product } from "~/api/types";

const props = defineProps<{
  post: AdminPost;
  products: Product[];
}>();
const emit = defineEmits<{ close: [] }>();

const product = computed(() =>
  props.post.productId != null
    ? props.products.find((p) => p.id === props.post.productId) ?? null
    : null,
);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[88vh]">
      <div class="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
        <h2 class="text-base font-bold text-zinc-900 sm:text-lg">게시글 상세</h2>
        <button
          class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          aria-label="닫기"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <div class="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
        <div class="flex items-start gap-2">
          <span
            v-if="post.isNotice"
            class="mt-1 shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white"
          >
            공지
          </span>
          <h1 class="text-lg font-bold text-zinc-900 sm:text-xl">{{ post.title }}</h1>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span class="flex items-center gap-1">
            <Eye :size="14" />
            {{ post.viewCount }}
          </span>
          <span class="flex items-center gap-1">
            <Heart :size="14" />
            {{ post.likeCount }}
          </span>
          <span>·</span>
          <span>{{ new Date(post.createdAt).toLocaleString("ko-KR") }}</span>
          <template v-if="product">
            <span>·</span>
            <span class="rounded-full bg-pink-50 px-2 py-0.5 text-pink-600">
              [{{ product.category }}] {{ product.name }}
            </span>
          </template>
        </div>

        <div v-if="post.imageUrl" class="overflow-hidden rounded-xl bg-zinc-100">
          <img :src="post.imageUrl" :alt="post.title" class="w-full object-cover" />
        </div>

        <p class="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{{ post.content }}</p>
      </div>
    </div>
  </div>
</template>
