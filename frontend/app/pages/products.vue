<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronLeft, ChevronRight, Edit2, Loader2, Plus, Trash2 } from "lucide-vue-next";
import { deleteProduct, getAdminProducts } from "~/api/product.api";
import type { Product } from "~/api/types";

const STATUS_BADGE: Record<Product["status"], string> = {
  AVAILABLE: "bg-green-50 text-green-600",
  SOLD_OUT: "bg-red-50 text-red-600",
  HIDDEN: "bg-zinc-100 text-zinc-500",
};
const STATUS_LABEL: Record<Product["status"], string> = {
  AVAILABLE: "판매 중",
  SOLD_OUT: "품절",
  HIDDEN: "숨김",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const items = ref<Product[]>([]);
const total = ref(0);
const offset = ref(0);
const limit = ref(20);
const isLoading = ref(true);
const editingProduct = ref<Product | null>(null);
const isModalOpen = ref(false);
const deletingId = ref<number | null>(null);

async function fetchProducts() {
  isLoading.value = true;
  try {
    const data = await getAdminProducts(offset.value, limit.value);
    items.value = data.items;
    total.value = data.total;
    // 백엔드가 보정한 offset 으로 동기화
    if (data.offset !== offset.value) offset.value = data.offset;
  } catch (e) {
    console.error("Failed to fetch products:", e);
  } finally {
    isLoading.value = false;
  }
}

watch([offset, limit], fetchProducts, { immediate: true });

function handleOpenCreate() {
  editingProduct.value = null;
  isModalOpen.value = true;
}
function handleOpenEdit(product: Product) {
  editingProduct.value = product;
  isModalOpen.value = true;
}
function handleCloseModal() {
  isModalOpen.value = false;
  editingProduct.value = null;
}

async function handleDelete(id: number) {
  if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;
  deletingId.value = id;
  try {
    await deleteProduct(id);
    // 마지막 항목 삭제로 페이지가 비게 되면 이전 페이지로
    if (items.value.length === 1 && offset.value >= limit.value) {
      offset.value = offset.value - limit.value;
    } else {
      await fetchProducts();
    }
  } catch (e) {
    console.error("Failed to delete product:", e);
  } finally {
    deletingId.value = null;
  }
}

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
  <DashboardLayout>
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">상품 관리</h1>
        <p class="text-sm text-zinc-500">총 {{ total }}건</p>
      </div>
      <Button class="w-full gap-2 bg-pink-500 hover:bg-pink-600 sm:w-auto" @click="handleOpenCreate">
        <Plus :size="18" />
        새 상품 등록
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-zinc-100 text-zinc-400">
              <tr>
                <th class="px-6 py-3 font-medium">이미지</th>
                <th class="px-6 py-3 font-medium">상품명</th>
                <th class="px-6 py-3 font-medium">카테고리</th>
                <th class="px-6 py-3 text-right font-medium">가격</th>
                <th class="px-6 py-3 font-medium">상태</th>
                <th class="px-6 py-3 text-right font-medium">액션</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-50">
              <tr v-if="isLoading">
                <td colspan="6" class="py-16 text-center">
                  <Loader2 class="mx-auto h-6 w-6 animate-spin text-pink-500" />
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="py-16 text-center text-zinc-400">등록된 상품이 없습니다.</td>
              </tr>
              <tr v-for="p in items" v-else :key="p.id" class="hover:bg-zinc-50/60">
                <td class="px-6 py-3">
                  <div class="h-12 w-12 overflow-hidden rounded-md bg-zinc-100">
                    <img
                      :src="p.imageUrl"
                      :alt="p.name"
                      class="h-full w-full object-cover"
                      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                    />
                  </div>
                </td>
                <td class="px-6 py-3 font-medium text-zinc-900">{{ p.name }}</td>
                <td class="px-6 py-3 text-zinc-600">{{ p.category }}</td>
                <td class="px-6 py-3 text-right text-zinc-900">{{ p.price.toLocaleString() }}원</td>
                <td class="px-6 py-3">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="STATUS_BADGE[p.status]"
                  >
                    {{ STATUS_LABEL[p.status] }}
                  </span>
                </td>
                <td class="px-6 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <Button size="sm" variant="outline" class="gap-1 text-xs" @click="handleOpenEdit(p)">
                      <Edit2 :size="14" />
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      class="gap-1 text-xs text-red-500 hover:text-red-600"
                      :disabled="deletingId === p.id"
                      @click="handleDelete(p.id)"
                    >
                      <Trash2 :size="14" />
                      {{ deletingId === p.id ? "삭제 중..." : "삭제" }}
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- 페이지네이션 컨트롤 -->
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
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

    <ProductFormModal
      v-if="isModalOpen"
      :mode="editingProduct ? 'edit' : 'create'"
      :initial="editingProduct ?? undefined"
      @close="handleCloseModal"
      @success="fetchProducts"
    />
  </DashboardLayout>
</template>
