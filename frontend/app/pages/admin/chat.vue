<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ArrowLeft, MessageSquare, Send, User } from "lucide-vue-next";
import { useChatStore } from "~/stores/chat";

const chat = useChatStore();

const selectedRoomId = ref<number | null>(null);
const input = ref("");
const isLoading = ref(false);
const isLoadingMessages = ref(false);
const feedRef = ref<HTMLElement | null>(null);
const stickToBottom = ref(true);

const selectedRoom = computed(() =>
  chat.adminRooms.find((r) => r.id === selectedRoomId.value) ?? null,
);

const messages = computed(() => {
  const roomId = selectedRoomId.value;
  if (roomId == null) return [];
  return [...chat.getMessages(roomId)].reverse();
});

onMounted(async () => {
  isLoading.value = true;
  try {
    await chat.loadAdminRooms();
  } catch (e) {
    console.error("Failed to load admin chat rooms:", e);
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  void chat.setActiveRoom(null);
});

watch(selectedRoomId, async (roomId) => {
  if (roomId == null) {
    await chat.setActiveRoom(null);
    return;
  }
  isLoadingMessages.value = true;
  try {
    await chat.loadMessagesForRoom(roomId);
    await chat.setActiveRoom(roomId);
    await nextTick();
    scrollToBottom(true);
    stickToBottom.value = true;
  } catch (e) {
    console.error("Failed to load messages:", e);
  } finally {
    isLoadingMessages.value = false;
  }
});

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
  stickToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
}

function onSend() {
  const roomId = selectedRoomId.value;
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
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    onSend();
  }
}

function formatRoomTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function hideImage(e: Event) {
  (e.target as HTMLImageElement).style.display = "none";
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-3 sm:space-y-4">
      <div class="flex items-center gap-2">
        <h1 class="flex items-center gap-2 text-xl font-bold text-zinc-900 sm:text-2xl">
          <MessageSquare :size="22" class="text-pink-500" />
          고객 채팅
        </h1>
        <span
          v-if="chat.unreadTotal > 0"
          class="rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white"
        >
          {{ chat.unreadTotal }}
        </span>
      </div>

      <div class="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 lg:grid-cols-[20rem_1fr]">
        <!-- 좌측: 채팅방 목록 -->
        <aside
          :class="[
            'flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white',
            selectedRoomId != null ? 'hidden lg:flex' : 'flex',
          ]"
        >
          <div class="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700">
            채팅방 ({{ chat.adminRooms.length }})
          </div>
          <div class="flex-1 overflow-y-auto">
            <p v-if="isLoading" class="p-4 text-sm text-zinc-400">불러오는 중...</p>
            <p
              v-else-if="chat.adminRooms.length === 0"
              class="p-6 text-center text-sm text-zinc-400"
            >
              아직 채팅방이 없습니다.
            </p>
            <ul v-else class="divide-y divide-zinc-100">
              <li v-for="room in chat.adminRooms" :key="room.id">
                <button
                  type="button"
                  :class="[
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50',
                    selectedRoomId === room.id ? 'bg-pink-50' : '',
                  ]"
                  @click="selectedRoomId = room.id"
                >
                  <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                    <img
                      v-if="room.customerProfileImageUrl"
                      :src="room.customerProfileImageUrl"
                      :alt="room.customerNickname"
                      class="h-full w-full object-cover"
                      @error="hideImage"
                    />
                    <User v-else :size="20" class="m-auto h-full text-zinc-400" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-baseline justify-between gap-2">
                      <p class="truncate text-sm font-semibold text-zinc-900">
                        {{ room.customerNickname }}
                      </p>
                      <span class="shrink-0 text-[11px] text-zinc-400">
                        {{ formatRoomTime(room.lastMessageAt) }}
                      </span>
                    </div>
                    <p class="mt-0.5 truncate text-xs text-zinc-500">
                      {{ room.lastMessagePreview || "메시지가 없습니다" }}
                    </p>
                  </div>
                  <span
                    v-if="room.unreadCount > 0"
                    class="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1.5 text-[11px] font-bold text-white"
                  >
                    {{ room.unreadCount }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <!-- 우측: 메시지 + 입력 -->
        <section
          :class="[
            'flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white',
            selectedRoomId == null ? 'hidden lg:flex' : 'flex',
          ]"
        >
          <template v-if="!selectedRoom">
            <div class="flex flex-1 flex-col items-center justify-center gap-2 text-zinc-400">
              <MessageSquare :size="48" />
              <p class="text-sm">채팅방을 선택하세요.</p>
            </div>
          </template>

          <template v-else>
            <header class="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
              <button
                type="button"
                class="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 lg:hidden"
                aria-label="목록으로"
                @click="selectedRoomId = null"
              >
                <ArrowLeft :size="20" />
              </button>
              <div class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                <img
                  v-if="selectedRoom.customerProfileImageUrl"
                  :src="selectedRoom.customerProfileImageUrl"
                  :alt="selectedRoom.customerNickname"
                  class="h-full w-full object-cover"
                  @error="hideImage"
                />
                <User v-else :size="20" class="m-auto h-full text-zinc-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-zinc-900">
                  {{ selectedRoom.customerNickname }}
                </p>
                <p class="text-[11px] text-zinc-400">
                  <span v-if="chat.connected" class="text-emerald-600">● 연결됨</span>
                  <span v-else>○ 연결 대기 중</span>
                </p>
              </div>
            </header>

            <div
              ref="feedRef"
              class="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              @scroll="onScroll"
            >
              <p v-if="isLoadingMessages" class="text-center text-sm text-zinc-400">
                불러오는 중...
              </p>
              <p
                v-else-if="messages.length === 0"
                class="text-center text-sm text-zinc-400"
              >
                메시지가 없습니다.
              </p>
              <template v-else>
                <div
                  v-for="m in messages"
                  :key="m.id"
                  :class="[
                    'flex items-end gap-2',
                    m.senderType === 'ADMIN' ? 'justify-end' : 'justify-start',
                  ]"
                >
                  <div
                    :class="[
                      'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                      m.senderType === 'ADMIN'
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
              class="flex items-end gap-2 border-t border-zinc-200 px-3 py-3"
              @submit.prevent="onSend"
            >
              <textarea
                v-model="input"
                rows="1"
                placeholder="답장 입력 (Shift+Enter 줄바꿈)"
                class="max-h-32 flex-1 resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
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
        </section>
      </div>
    </div>
  </DashboardLayout>
</template>
