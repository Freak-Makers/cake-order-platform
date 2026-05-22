<script setup lang="ts">
import { ref } from "vue";
import { X, Loader2, ImageIcon } from "lucide-vue-next";
import { createProduct, updateProduct } from "~/api/product.api";
import type { Product, ProductStatus } from "~/api/types";

const props = defineProps<{
  mode: "create" | "edit";
  initial?: Product;
}>();
const emit = defineEmits<{ close: []; success: [] }>();

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "AVAILABLE", label: "판매 중" },
  { value: "SOLD_OUT", label: "품절" },
  { value: "HIDDEN", label: "숨김" },
];

const isEdit = props.mode === "edit" && !!props.initial;
const name = ref(isEdit ? props.initial!.name : "");
const category = ref(isEdit ? props.initial!.category : "");
const price = ref(isEdit ? String(props.initial!.price) : "");
const imageUrl = ref(isEdit ? props.initial!.imageUrl : "");
const description = ref(isEdit ? props.initial!.description ?? "" : "");
const status = ref<ProductStatus>(isEdit ? props.initial!.status : "AVAILABLE");
const isSubmitting = ref(false);
const error = ref<string | null>(null);

async function handleSubmit() {
  error.value = null;

  const priceNum = Number(price.value);
  if (!name.value.trim() || !category.value.trim() || !imageUrl.value.trim() || !description.value.trim()) {
    error.value = "모든 필드를 입력해주세요.";
    return;
  }
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    error.value = "가격은 0보다 큰 숫자여야 합니다.";
    return;
  }

  isSubmitting.value = true;
  try {
    if (props.mode === "create") {
      await createProduct({
        name: name.value.trim(),
        description: description.value.trim(),
        category: category.value.trim(),
        price: priceNum,
        imageUrl: imageUrl.value.trim(),
      });
    } else if (props.initial) {
      await updateProduct(props.initial.id, {
        name: name.value.trim(),
        description: description.value.trim(),
        category: category.value.trim(),
        price: priceNum,
        imageUrl: imageUrl.value.trim(),
        status: status.value,
      });
    }
    emit("success");
    emit("close");
  } catch (e) {
    console.error("Failed to save product:", e);
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
          {{ mode === "create" ? "새 상품 등록" : "상품 수정" }}
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
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-700">상품명 *</label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="생딸기 생크림 케이크"
              class="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-700">카테고리 *</label>
            <input
              v-model="category"
              type="text"
              required
              placeholder="홀케이크"
              class="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-700">가격 (원) *</label>
            <input
              v-model="price"
              type="number"
              required
              :min="1"
              :step="1"
              inputmode="numeric"
              placeholder="45000"
              class="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
          <div v-if="mode === 'edit'">
            <label class="mb-1 block text-sm font-medium text-zinc-700">노출 상태</label>
            <select
              v-model="status"
              class="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option v-for="o in STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">이미지 URL *</label>
          <div class="flex items-start gap-3">
            <input
              v-model="imageUrl"
              type="url"
              required
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
          <label class="mb-1 block text-sm font-medium text-zinc-700">상품 설명 *</label>
          <textarea
            v-model="description"
            required
            :rows="4"
            placeholder="국산 설향 딸기가 듬뿍 들어간 케이크"
            class="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
        </div>

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
