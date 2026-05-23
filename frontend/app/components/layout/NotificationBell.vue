<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Bell, CheckCheck } from "lucide-vue-next";
import { useNotificationStore } from "~/stores/notification";
import type { AppNotification } from "~/api/types";

const noti = useNotificationStore();
const router = useRouter();
const rootRef = ref<HTMLElement | null>(null);

function onClickOutside(e: MouseEvent) {
  if (!noti.isOpen) return;
  const root = rootRef.value;
  if (root && !root.contains(e.target as Node)) {
    noti.close();
  }
}

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onClickOutside);
});

async function onItemClick(item: AppNotification) {
  // 읽음 처리는 비동기, 화면 이동을 먼저.
  noti.close();
  void noti.markRead(item.id);
  if (item.linkUrl) {
    router.push(item.linkUrl);
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="relative rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      aria-label="알림 열기"
      :aria-expanded="noti.isOpen"
      @mousedown.stop="noti.toggle()"
    >
      <Bell :size="20" />
      <span
        v-if="noti.unread > 0"
        class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white"
      >
        {{ noti.unread > 99 ? "99+" : noti.unread }}
      </span>
    </button>

    <div
      v-if="noti.isOpen"
      class="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl sm:w-96"
      role="dialog"
    >
      <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h3 class="text-sm font-semibold text-zinc-900">알림</h3>
        <button
          v-if="noti.unread > 0"
          type="button"
          class="flex items-center gap-1 text-xs font-medium text-pink-600 hover:text-pink-700"
          @click="noti.markAllRead()"
        >
          <CheckCheck :size="14" />
          모두 읽음
        </button>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <p
          v-if="noti.items.length === 0"
          class="p-6 text-center text-sm text-zinc-400"
        >
          알림이 없습니다.
        </p>
        <ul v-else class="divide-y divide-zinc-100">
          <li v-for="item in noti.items" :key="item.id">
            <button
              type="button"
              :class="[
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50',
                item.readAt ? 'opacity-70' : '',
              ]"
              @click="onItemClick(item)"
            >
              <span
                :class="[
                  'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                  item.readAt ? 'bg-zinc-300' : 'bg-pink-500',
                ]"
                aria-hidden="true"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-2">
                  <p class="truncate text-sm font-semibold text-zinc-900">
                    {{ item.title }}
                  </p>
                  <span class="shrink-0 text-[11px] text-zinc-400">
                    {{ formatTime(item.createdAt) }}
                  </span>
                </div>
                <p class="mt-0.5 line-clamp-2 text-xs text-zinc-600">
                  {{ item.body }}
                </p>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
