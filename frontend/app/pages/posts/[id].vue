<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Megaphone,
  MessageSquare,
  Pencil,
  Trash2,
  User,
  X,
  Check,
} from "lucide-vue-next";
import {
  getPost,
  togglePostLike,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "~/api/post.api";
import type { Comment, Post } from "~/api/types";
import { useAuthStore } from "~/stores/auth";

const COMMENT_PAGE_SIZE = 5;

const route = useRoute();
const postId = Number(route.params.id);
const auth = useAuthStore();

const post = ref<Post | null>(null);
const comments = ref<Comment[]>([]);
const totalComments = ref(0);
const commentOffset = ref(0);
const commentReloadTick = ref(0);
const commentText = ref("");
const isLoading = ref(true);
const isCommentsLoading = ref(false);
const isSubmitting = ref(false);
// 인라인 수정 상태: 어떤 댓글이 편집 중인지(commentId) + 현재 입력값
const editingCommentId = ref<number | null>(null);
const editingText = ref("");

// 게시글 본문은 한 번만
onMounted(async () => {
  if (!postId) return;
  try {
    post.value = await getPost(postId);
  } catch (e) {
    console.error("Failed to load post:", e);
  } finally {
    isLoading.value = false;
  }
});

// 댓글: offset / reloadTick 변경 시 재조회. cleanup 으로 stale 응답 무시.
watch(
  [commentOffset, commentReloadTick],
  async (_cur, _prev, onCleanup) => {
    if (!postId) return;
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });
    isCommentsLoading.value = true;
    try {
      const data = await getComments(postId, commentOffset.value, COMMENT_PAGE_SIZE);
      if (cancelled) return;
      comments.value = data.items;
      totalComments.value = data.total;
    } catch (e) {
      if (!cancelled) console.error("Failed to load comments:", e);
    } finally {
      if (!cancelled) isCommentsLoading.value = false;
    }
  },
  { immediate: true },
);

async function handleLike() {
  if (!post.value || !auth.isLoggedIn) return;
  try {
    await togglePostLike(post.value.id);
    post.value = {
      ...post.value,
      isLiked: !post.value.isLiked,
      likeCount: post.value.isLiked ? post.value.likeCount - 1 : post.value.likeCount + 1,
    };
  } catch (e) {
    console.error("Failed to toggle like:", e);
  }
}

async function handleSubmitComment() {
  if (!commentText.value.trim() || !auth.isLoggedIn) return;
  isSubmitting.value = true;
  try {
    await createComment(postId, { content: commentText.value.trim() });
    commentText.value = "";
    // 새 댓글이 첫 페이지 위에 오도록 offset 0 으로 리셋
    if (commentOffset.value !== 0) {
      commentOffset.value = 0;
    } else {
      commentReloadTick.value += 1;
    }
  } catch (e) {
    console.error("Failed to create comment:", e);
  } finally {
    isSubmitting.value = false;
  }
}

function startEditing(c: Comment) {
  editingCommentId.value = c.id;
  editingText.value = c.content;
}
function cancelEditing() {
  editingCommentId.value = null;
  editingText.value = "";
}

async function handleSaveEdit(commentId: number) {
  if (!editingText.value.trim()) return;
  try {
    const updated = await updateComment(postId, commentId, { content: editingText.value.trim() });
    comments.value = comments.value.map((c) => (c.id === commentId ? updated : c));
    cancelEditing();
  } catch (e) {
    console.error("Failed to update comment:", e);
  }
}

async function handleDeleteComment(commentId: number) {
  if (!confirm("이 댓글을 삭제할까요?")) return;
  try {
    await deleteComment(postId, commentId);
    comments.value = comments.value.filter((c) => c.id !== commentId);
    totalComments.value = Math.max(0, totalComments.value - 1);
    if (comments.value.length === 0 && commentOffset.value >= COMMENT_PAGE_SIZE) {
      commentOffset.value = Math.max(0, commentOffset.value - COMMENT_PAGE_SIZE);
    } else {
      commentReloadTick.value += 1;
    }
  } catch (e) {
    console.error("Failed to delete comment:", e);
  }
}

const commentPage = computed(() => Math.floor(commentOffset.value / COMMENT_PAGE_SIZE) + 1);
const totalCommentPages = computed(() => Math.max(1, Math.ceil(totalComments.value / COMMENT_PAGE_SIZE)));
const canPrev = computed(() => commentOffset.value >= COMMENT_PAGE_SIZE);
const canNext = computed(() => commentOffset.value + comments.value.length < totalComments.value);

function handlePrevComments() {
  if (canPrev.value) commentOffset.value = Math.max(0, commentOffset.value - COMMENT_PAGE_SIZE);
}
function handleNextComments() {
  if (canNext.value) commentOffset.value = commentOffset.value + COMMENT_PAGE_SIZE;
}
</script>

<template>
  <UserLayout>
    <div class="mx-auto max-w-3xl">
      <!-- 뒤로가기 -->
      <NuxtLink
        to="/posts"
        class="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-pink-500 sm:mb-6"
      >
        <ArrowLeft :size="14" />
        목록으로
      </NuxtLink>

      <p v-if="isLoading" class="text-sm text-zinc-500">불러오는 중...</p>
      <p v-else-if="!post" class="text-sm text-zinc-500">게시글을 찾을 수 없습니다.</p>

      <article v-else class="space-y-8">
        <!-- 헤더 -->
        <header class="space-y-4 border-b border-zinc-100 pb-6">
          <div v-if="post.isNotice">
            <span
              class="inline-flex items-center gap-1 rounded-full bg-pink-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
            >
              <Megaphone :size="11" />
              공지
            </span>
          </div>
          <h1 class="text-2xl font-bold leading-snug text-zinc-900 sm:text-3xl">
            {{ post.title }}
          </h1>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 sm:text-sm">
            <span>{{ new Date(post.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) }}</span>
            <span class="text-zinc-200">·</span>
            <span class="flex items-center gap-1">
              <Eye :size="14" />
              {{ post.viewCount.toLocaleString() }}
            </span>
            <span class="flex items-center gap-1" :class="post.isLiked ? 'text-pink-500' : ''">
              <Heart :size="14" :fill="post.isLiked ? 'currentColor' : 'none'" />
              {{ post.likeCount.toLocaleString() }}
            </span>
            <span class="flex items-center gap-1">
              <MessageSquare :size="14" />
              {{ totalComments.toLocaleString() }}
            </span>
          </div>
        </header>

        <!-- 본문 이미지 -->
        <div
          v-if="post.imageUrl"
          class="overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50"
        >
          <img :src="post.imageUrl" :alt="post.title" class="w-full object-cover" />
        </div>

        <!-- 본문 -->
        <div class="whitespace-pre-wrap text-[15px] leading-[1.85] text-zinc-700 sm:text-base">{{ post.content }}</div>

        <!-- 좋아요 -->
        <div class="flex flex-col items-center gap-2 py-4">
          <button
            type="button"
            :disabled="!auth.isLoggedIn"
            class="group inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            :class="post.isLiked
              ? 'border-pink-200 bg-pink-50 text-pink-600'
              : 'border-zinc-200 bg-white text-zinc-700 hover:border-pink-200 hover:text-pink-600'"
            @click="handleLike"
          >
            <Heart
              :size="16"
              :fill="post.isLiked ? 'currentColor' : 'none'"
              class="transition-transform group-hover:scale-110"
            />
            좋아요 {{ post.likeCount.toLocaleString() }}
          </button>
          <p v-if="!auth.isLoggedIn" class="text-[11px] text-zinc-400">좋아요는 로그인 후 가능합니다.</p>
        </div>

        <!-- 댓글 영역 -->
        <section class="space-y-5 border-t border-zinc-100 pt-8">
          <div class="flex items-center gap-2">
            <MessageSquare :size="18" class="text-zinc-700" />
            <h2 class="text-base font-bold text-zinc-900 sm:text-lg">댓글</h2>
            <span class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
              {{ totalComments }}
            </span>
          </div>

          <!-- 댓글 입력 -->
          <form
            v-if="auth.isLoggedIn"
            class="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition-colors focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 sm:p-4"
            @submit.prevent="handleSubmitComment"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-500">
              <User :size="16" />
            </div>
            <input
              v-model="commentText"
              type="text"
              placeholder="따뜻한 댓글을 남겨주세요"
              class="flex-1 bg-transparent py-2 text-sm placeholder:text-zinc-400 focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              class="shrink-0"
              :disabled="isSubmitting || !commentText.trim()"
            >
              {{ isSubmitting ? "등록 중..." : "등록" }}
            </Button>
          </form>
          <div
            v-else
            class="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-center text-xs text-zinc-500"
          >
            댓글은 로그인 후 작성할 수 있습니다.
          </div>

          <!-- 댓글 리스트 -->
          <p v-if="isCommentsLoading" class="text-sm text-zinc-400">댓글을 불러오는 중...</p>
          <div
            v-else-if="comments.length === 0"
            class="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-400"
          >
            아직 댓글이 없어요. 첫 댓글을 남겨보세요!
          </div>
          <template v-else>
            <ul class="space-y-3">
              <li
                v-for="c in comments"
                :key="c.id"
                class="flex gap-3 rounded-2xl border border-zinc-100 bg-white p-4 transition-colors hover:border-zinc-200"
              >
                <!-- 아바타 -->
                <div class="shrink-0">
                  <img
                    v-if="c.authorProfileImageUrl"
                    :src="c.authorProfileImageUrl"
                    :alt="c.authorName"
                    class="h-9 w-9 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-pink-200 text-xs font-bold text-pink-600"
                  >
                    {{ c.authorName.charAt(0).toUpperCase() }}
                  </div>
                </div>

                <!-- 본문 -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 text-xs">
                      <span class="font-semibold text-zinc-800">{{ c.authorName }}</span>
                      <span class="text-zinc-300">·</span>
                      <span class="text-zinc-400">{{ new Date(c.createdAt).toLocaleString("ko-KR") }}</span>
                    </div>
                    <div v-if="c.isMine && editingCommentId !== c.id" class="flex items-center gap-0.5">
                      <button
                        class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                        title="수정"
                        @click="startEditing(c)"
                      >
                        <Pencil :size="13" />
                      </button>
                      <button
                        class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="삭제"
                        @click="handleDeleteComment(c.id)"
                      >
                        <Trash2 :size="13" />
                      </button>
                    </div>
                  </div>

                  <div v-if="editingCommentId === c.id" class="mt-2 flex gap-2">
                    <input
                      v-model="editingText"
                      type="text"
                      class="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                    <button
                      class="inline-flex items-center justify-center rounded-lg bg-pink-500 px-2.5 py-1 text-white transition-colors hover:bg-pink-600 disabled:opacity-50"
                      title="저장"
                      :disabled="!editingText.trim()"
                      @click="handleSaveEdit(c.id)"
                    >
                      <Check :size="14" />
                    </button>
                    <button
                      class="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-2.5 py-1 text-zinc-500 transition-colors hover:bg-zinc-50"
                      title="취소"
                      @click="cancelEditing"
                    >
                      <X :size="14" />
                    </button>
                  </div>
                  <p v-else class="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-700">
                    {{ c.content }}
                  </p>
                </div>
              </li>
            </ul>

            <!-- 댓글 페이지네이션 -->
            <div class="flex items-center justify-between gap-3 pt-2 text-xs sm:text-sm">
              <span class="text-zinc-500">
                <span class="font-bold text-zinc-900">{{ commentPage }}</span>
                <span class="mx-1 text-zinc-300">/</span>
                {{ totalCommentPages }}
              </span>
              <div class="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  class="gap-1"
                  :disabled="!canPrev || isCommentsLoading"
                  @click="handlePrevComments"
                >
                  <ChevronLeft :size="14" />
                  이전
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  class="gap-1"
                  :disabled="!canNext || isCommentsLoading"
                  @click="handleNextComments"
                >
                  다음
                  <ChevronRight :size="14" />
                </Button>
              </div>
            </div>
          </template>
        </section>
      </article>
    </div>
  </UserLayout>
</template>
