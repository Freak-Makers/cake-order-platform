<script setup lang="ts">
import { ref } from "vue";
import { ImageIcon, Loader2, X } from "lucide-vue-next";
import { createPost, updatePost } from "~/api/post.api";
import type { AdminPost, Product } from "~/api/types";

const props = defineProps<{
  mode: "create" | "edit";
  initial?: AdminPost;
  products: Product[];
}>();
const emit = defineEmits<{ close: []; success: [] }>();

const isEdit = props.mode === "edit" && !!props.initial;
const title = ref(isEdit ? props.initial!.title : "");
const content = ref(isEdit ? props.initial!.content : "");
const imageUrl = ref(isEdit ? props.initial!.imageUrl ?? "" : "");
const productId = ref(isEdit && props.initial!.productId != null ? String(props.initial!.productId) : "");
const isNotice = ref(isEdit ? props.initial!.isNotice : false);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

async function handleSubmit() {
  error.value = null;
  if (!title.value.trim() || !content.value.trim()) {
    error.value = "제목과 본문은 필수입니다.";
    return;
  }
  isSubmitting.value = true;
  try {
    const body = {
      title: title.value.trim(),
      content: content.value.trim(),
      imageUrl: imageUrl.value.trim() || null,
      productId: productId.value.trim() ? Number(productId.value) : null,
      isNotice: isNotice.value,
    };
    if (props.mode === "create") {
      await createPost(body);
    } else if (props.initial) {
      await updatePost(props.initial.id, body);
    }
    emit("success");
    emit("close");
  } catch (err) {
    console.error("Failed to save post:", err);
    error.value = "저장에 실패했습니다.";
  } finally {
    isSubmitting.value = false;
  }
}

function hideImage(e: Event) {
  (e.target as HTMLImageElement).style.display = "none";
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[88vh]">
      <div class="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
        <h2 class="text-base font-bold text-zinc-900 sm:text-lg">
          {{ mode === "create" ? "새 게시글 작성" : "게시글 수정" }}
        </h2>
        <button
          class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          aria-label="닫기"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <form class="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">제목 *</label>
          <input
            v-model="title"
            type="text"
            required
            placeholder="신메뉴 출시! ..."
            class="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">본문 *</label>
          <textarea
            v-model="content"
            required
            :rows="6"
            class="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">이미지 URL (선택)</label>
          <div class="flex items-start gap-3">
            <input
              v-model="imageUrl"
              type="url"
              placeholder="https://..."
              class="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
            <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-300">
              <img
                v-if="imageUrl"
                :src="imageUrl"
                alt="미리보기"
                class="h-full w-full object-cover"
                @error="hideImage"
              />
              <ImageIcon v-else :size="28" />
            </div>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">연결 상품 (선택)</label>
          <select
            v-model="productId"
            class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
          >
            <option value="">연결 안 함</option>
            <option v-for="p in products" :key="p.id" :value="String(p.id)">
              [{{ p.category }}] {{ p.name }}
            </option>
          </select>
        </div>

        <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-sm text-zinc-700">
          <input v-model="isNotice" type="checkbox" class="h-4 w-4 accent-pink-500" />
          <span class="font-medium">📌 공지로 지정 (목록 최상단 고정)</span>
        </label>

        <div v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</div>

        <div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" :disabled="isSubmitting" class="w-full sm:w-auto" @click="emit('close')">
            취소
          </Button>
          <Button type="submit" :disabled="isSubmitting" class="w-full gap-2 bg-pink-500 hover:bg-pink-600 sm:w-auto">
            <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
            {{ mode === "create" ? "등록" : "저장" }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
