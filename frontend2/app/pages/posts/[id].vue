<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ChevronLeft, ChevronRight, Eye, Heart, MessageSquare, Pencil, Trash2, X, Check } from "lucide-vue-next";
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
    <p v-if="isLoading" class="text-zinc-500">불러오는 중...</p>
    <p v-else-if="!post" class="text-zinc-500">게시글을 찾을 수 없습니다.</p>

    <article v-else class="space-y-6">
      <header class="space-y-3">
        <div class="flex items-start gap-2">
          <span
            v-if="post.isNotice"
            class="mt-1 shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white"
          >
            공지
          </span>
          <h1 class="text-2xl font-bold text-zinc-900 sm:text-3xl">{{ post.title }}</h1>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-sm text-zinc-400 sm:gap-4">
          <span class="flex items-center gap-1">
            <Eye :size="16" />
            {{ post.viewCount }}
          </span>
          <span class="flex items-center gap-1">
            <Heart
              :size="16"
              :fill="post.isLiked ? 'currentColor' : 'none'"
              :class="post.isLiked ? 'text-pink-500' : ''"
            />
            {{ post.likeCount }}
          </span>
          <span class="flex items-center gap-1">
            <MessageSquare :size="16" />
            {{ totalComments }}
          </span>
        </div>
      </header>

      <div v-if="post.imageUrl" class="overflow-hidden rounded-xl bg-zinc-100">
        <img :src="post.imageUrl" :alt="post.title" class="w-full object-cover" />
      </div>

      <div class="whitespace-pre-wrap leading-relaxed text-zinc-700">{{ post.content }}</div>

      <div>
        <Button
          :variant="post.isLiked ? 'primary' : 'outline'"
          :disabled="!auth.isLoggedIn"
          class="gap-2"
          @click="handleLike"
        >
          <Heart :size="18" :fill="post.isLiked ? 'currentColor' : 'none'" />
          좋아요 {{ post.likeCount }}
        </Button>
        <p v-if="!auth.isLoggedIn" class="mt-2 text-xs text-zinc-400">좋아요는 로그인 후 가능합니다.</p>
      </div>

      <section class="space-y-4 border-t border-zinc-100 pt-6">
        <h2 class="text-lg font-bold">댓글 {{ totalComments }}</h2>

        <form v-if="auth.isLoggedIn" class="flex gap-2" @submit.prevent="handleSubmitComment">
          <input
            v-model="commentText"
            type="text"
            placeholder="댓글을 입력하세요"
            class="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none"
          />
          <Button type="submit" :disabled="isSubmitting || !commentText.trim()">
            {{ isSubmitting ? "등록 중..." : "등록" }}
          </Button>
        </form>
        <p v-else class="text-sm text-zinc-400">댓글은 로그인 후 작성할 수 있습니다.</p>

        <p v-if="isCommentsLoading" class="text-sm text-zinc-400">댓글을 불러오는 중...</p>
        <p v-else-if="comments.length === 0" class="text-sm text-zinc-400">아직 댓글이 없습니다.</p>
        <template v-else>
          <ul class="space-y-3">
            <li v-for="c in comments" :key="c.id" class="rounded-lg border border-zinc-100 bg-white p-4">
              <div class="flex items-center justify-between gap-2 text-xs text-zinc-500">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-zinc-700">{{ c.authorName }}</span>
                  <span>·</span>
                  <span>{{ new Date(c.createdAt).toLocaleString("ko-KR") }}</span>
                </div>
                <div v-if="c.isMine && editingCommentId !== c.id" class="flex items-center gap-1">
                  <button
                    class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    title="수정"
                    @click="startEditing(c)"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    class="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                    title="삭제"
                    @click="handleDeleteComment(c.id)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>

              <div v-if="editingCommentId === c.id" class="mt-2 flex gap-2">
                <input
                  v-model="editingText"
                  type="text"
                  class="flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-sm focus:border-pink-500 focus:outline-none"
                />
                <button
                  class="rounded-md bg-pink-500 px-2 py-1 text-white hover:bg-pink-600 disabled:opacity-50"
                  title="저장"
                  :disabled="!editingText.trim()"
                  @click="handleSaveEdit(c.id)"
                >
                  <Check :size="14" />
                </button>
                <button
                  class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-500 hover:bg-zinc-50"
                  title="취소"
                  @click="cancelEditing"
                >
                  <X :size="14" />
                </button>
              </div>
              <p v-else class="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{{ c.content }}</p>
            </li>
          </ul>

          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="text-zinc-500">
              <span class="font-bold text-zinc-900">{{ commentPage }}</span> / {{ totalCommentPages }} 페이지
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
  </UserLayout>
</template>
