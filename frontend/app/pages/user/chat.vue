<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { MessageSquare, Send } from "lucide-vue-next";
import { useAuthStore } from "~/stores/auth";
import { useChatStore } from "~/stores/chat";

const auth = useAuthStore();
const chat = useChatStore();

const input = ref("");
const isLoading = ref(false);
const feedRef = ref<HTMLElement | null>(null);
const stickToBottom = ref(true);

const myRoomId = computed(() => chat.myRoom?.id ?? null);

// store 는 desc 정렬로 보관하므로 표시할 땐 reverse 해서 오래된→최신.
const messages = computed(() => {
  const roomId = myRoomId.value;
  if (roomId == null) return [];
  return [...chat.getMessages(roomId)].reverse();
});

onMounted(async () => {
  if (!auth.isLoggedIn) return;
  isLoading.value = true;
  try {
    await chat.loadMyRoomAndMessages();
    if (chat.myRoom) await chat.setActiveRoom(chat.myRoom.id);
    await nextTick();
    scrollToBottom(true);
  } catch (e) {
    console.error("Failed to load chat:", e);
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  void chat.setActiveRoom(null);
});

// 메시지가 새로 들어오면 (사용자가 아래쪽에 있을 때만) 자동 스크롤.
watch(messages, async () => {
  await nextTick();
  if (stickToBottom.value) scrollToBottom();
});

function scrollToBottom(force = false) {
  const el = feedRef.value;
  if (!el) return;
  if (force || stickToBottom.value) {
    el.scrollTop = el.scrollHeight;
  }
}

function onScroll() {
  const el = feedRef.value;
  if (!el) return;
  // 바닥으로부터 80px 이내면 stick.
  stickToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
}

function onSend() {
  const roomId = myRoomId.value;
  if (roomId == null) return;
  const text = input.value;
  if (!text.trim()) return;
  const ok = chat.sendMessage(roomId, text);
  if (ok) {
    input.value = "";
    stickToBottom.value = true;
    nextTick(() => scrollToBottom(true));
  }
}

function onKeydown(e: KeyboardEvent) {
  // Enter 전송, Shift+Enter 줄바꿈.
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    onSend();
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
</script>

<template>
  <UserLayout>
    <div class="mx-auto max-w-3xl">
      <div class="flex h-[calc(100dvh-10rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <header class="flex items-center gap-2 border-b border-zinc-200 px-4 py-4 sm:px-6">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <MessageSquare :size="18" />
          </div>
          <div>
            <h1 class="text-base font-bold text-zinc-900 sm:text-lg">사장님과의 채팅</h1>
            <p class="text-xs text-zinc-500">
              <span v-if="!auth.isLoggedIn">로그인 후 이용해주세요</span>
              <span v-else-if="chat.connected" class="text-emerald-600">● 연결됨</span>
              <span v-else class="text-zinc-400">○ 연결 대기 중</span>
            </p>
          </div>
        </header>

        <template v-if="!auth.isLoggedIn">
          <div class="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center sm:px-6">
            <MessageSquare :size="48" class="text-zinc-300" />
            <p class="text-sm text-zinc-500">로그인 후 사장님과 1:1 채팅을 시작할 수 있습니다.</p>
            <NuxtLink to="/login">
              <Button class="bg-pink-500 hover:bg-pink-600">로그인 하기</Button>
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <div
            ref="feedRef"
            class="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"
            @scroll="onScroll"
          >
            <p v-if="isLoading" class="text-center text-sm text-zinc-400">불러오는 중...</p>
            <p
              v-else-if="messages.length === 0"
              class="text-center text-sm text-zinc-400"
            >
              첫 메시지를 보내보세요.
            </p>
            <template v-else>
              <div
                v-for="m in messages"
                :key="m.id"
                :class="[
                  'flex items-end gap-2',
                  m.senderType === 'CUSTOMER' ? 'justify-end' : 'justify-start',
                ]"
              >
                <div
                  :class="[
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                    m.senderType === 'CUSTOMER'
                      ? 'bg-pink-500 text-white'
                      : 'bg-zinc-100 text-zinc-900',
                  ]"
                >
                  <p class="whitespace-pre-wrap break-words">{{ m.content }}</p>
                </div>
                <span class="text-[10px] text-zinc-400">{{ formatTime(m.sentAt) }}</span>
              </div>
            </template>
          </div>

          <form
            class="flex items-end gap-2 border-t border-zinc-200 bg-white px-4 py-4 sm:px-6"
            @submit.prevent="onSend"
          >
            <textarea
              v-model="input"
              rows="1"
              placeholder="메시지를 입력하세요 (Shift+Enter 줄바꿈)"
              class="max-h-32 flex-1 resize-none rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
              @keydown="onKeydown"
            />
            <button
              type="submit"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
              :disabled="!input.trim()"
              aria-label="전송"
            >
              <Send :size="18" />
            </button>
          </form>
        </template>
      </div>
    </div>
  </UserLayout>
</template>
