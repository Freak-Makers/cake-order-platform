<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ChevronLeft, ChevronRight, Edit2, Eye, Heart, Plus, Trash2 } from "lucide-vue-next";
import { deletePost, getAdminPostsPage } from "~/api/post.api";
import { getProducts } from "~/api/product.api";
import type { AdminPost, Product } from "~/api/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const items = ref<AdminPost[]>([]);
const total = ref(0);
const offset = ref(0);
const limit = ref(20);
const products = ref<Product[]>([]);
const isLoading = ref(true);

const isFormOpen = ref(false);
const editingPost = ref<AdminPost | null>(null);
const detailPost = ref<AdminPost | null>(null);
const deletingId = ref<number | null>(null);

async function fetchPosts() {
  isLoading.value = true;
  try {
    const data = await getAdminPostsPage(offset.value, limit.value);
    items.value = data.items;
    total.value = data.total;
    if (data.offset !== offset.value) offset.value = data.offset;
  } catch (e) {
    console.error("Failed to fetch admin posts:", e);
  } finally {
    isLoading.value = false;
  }
}

async function fetchProducts() {
  try {
    products.value = (await getProducts({ limit: 100 })).items;
  } catch (e) {
    console.error("Failed to fetch products:", e);
  }
}

watch([offset, limit], fetchPosts, { immediate: true });
onMounted(fetchProducts);

function productNameById(id: number | null | undefined) {
  if (id == null) return null;
  return products.value.find((p) => p.id === id)?.name ?? `상품 #${id}`;
}

function handleOpenCreate() {
  editingPost.value = null;
  isFormOpen.value = true;
}
function handleOpenEdit(post: AdminPost) {
  editingPost.value = post;
  isFormOpen.value = true;
}
function handleCloseForm() {
  isFormOpen.value = false;
  editingPost.value = null;
}

async function handleDelete(id: number) {
  if (!confirm("정말 이 게시글을 삭제하시겠습니까? 연결된 댓글·좋아요가 함께 정리됩니다.")) return;
  deletingId.value = id;
  try {
    await deletePost(id);
    if (items.value.length === 1 && offset.value >= limit.value) {
      offset.value = offset.value - limit.value;
    } else {
      await fetchPosts();
    }
  } catch (e) {
    console.error("Failed to delete post:", e);
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
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-bold text-zinc-900 sm:text-2xl">게시글 관리</h1>
          <p class="text-sm text-zinc-500">총 {{ total }}건</p>
        </div>
        <Button class="w-full gap-2 bg-pink-500 hover:bg-pink-600 sm:w-auto" @click="handleOpenCreate">
          <Plus :size="18" />
          새 게시글 작성
        </Button>
      </div>

      <p v-if="isLoading" class="text-zinc-500">불러오는 중...</p>

      <Card v-else-if="items.length === 0">
        <CardContent class="py-16 text-center text-zinc-400">아직 등록된 게시글이 없습니다.</CardContent>
      </Card>

      <ul v-else class="space-y-3">
        <li v-for="p in items" :key="p.id">
          <div
            role="button"
            tabindex="0"
            class="block w-full cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 text-left transition-shadow hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
            @click="detailPost = p"
            @keydown.enter.prevent="detailPost = p"
            @keydown.space.prevent="detailPost = p"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span
                    v-if="p.isNotice"
                    class="shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white"
                  >
                    공지
                  </span>
                  <p class="truncate font-medium text-zinc-900">{{ p.title }}</p>
                </div>
                <p class="mt-1 line-clamp-1 text-xs text-zinc-500">{{ p.content }}</p>
                <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                  <span class="flex items-center gap-1">
                    <Eye :size="12" /> {{ p.viewCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Heart :size="12" /> {{ p.likeCount }}
                  </span>
                  <span>·</span>
                  <span>{{ new Date(p.createdAt).toLocaleString("ko-KR") }}</span>
                  <template v-if="p.productId != null">
                    <span>·</span>
                    <span class="text-pink-500">{{ productNameById(p.productId) }}</span>
                  </template>
                </div>
              </div>
              <div class="flex shrink-0 gap-1" @click.stop>
                <button
                  class="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  aria-label="수정"
                  @click.stop="handleOpenEdit(p)"
                >
                  <Edit2 :size="16" />
                </button>
                <button
                  class="rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  aria-label="삭제"
                  :disabled="deletingId === p.id"
                  @click.stop="handleDelete(p.id)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>
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

    <PostFormModal
      v-if="isFormOpen"
      :mode="editingPost ? 'edit' : 'create'"
      :initial="editingPost ?? undefined"
      :products="products"
      @close="handleCloseForm"
      @success="fetchPosts"
    />

    <PostDetailModal
      v-if="detailPost"
      :post="detailPost"
      :products="products"
      @close="detailPost = null"
    />
  </DashboardLayout>
</template>
