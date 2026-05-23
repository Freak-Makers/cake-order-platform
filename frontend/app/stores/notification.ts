import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { AppNotification, NotificationPushMessage } from "~/api/types";
import {
  getAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "~/api/notification.api";
import { showToast } from "~/utils/toast";

const MAX_ITEMS = 50;

export const useNotificationStore = defineStore("notification", () => {
  const items = ref<AppNotification[]>([]);
  const unread = ref(0);
  const loaded = ref(false);
  const isOpen = ref(false);

  const hasUnread = computed(() => unread.value > 0);

  async function load(limit = 10) {
    const page = await getAdminNotifications(0, limit);
    items.value = page.items;
    unread.value = page.unreadCount;
    loaded.value = true;
  }

  function handleIncoming(payload: NotificationPushMessage) {
    const next: AppNotification = {
      id: payload.id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      linkUrl: payload.linkUrl,
      readAt: null,
      createdAt: payload.createdAt,
    };
    // 중복 prevention (네트워크 재전송 등)
    if (items.value.some((it) => it.id === next.id)) return;
    items.value = [next, ...items.value].slice(0, MAX_ITEMS);
    unread.value += 1;
    showToast(`${next.title} — ${next.body}`, { variant: "info" });
  }

  async function markRead(id: number) {
    const target = items.value.find((it) => it.id === id);
    if (target && target.readAt) return; // 이미 읽음
    try {
      await markNotificationRead(id);
    } catch {
      return;
    }
    items.value = items.value.map((it) =>
      it.id === id ? { ...it, readAt: new Date().toISOString() } : it,
    );
    unread.value = Math.max(0, unread.value - 1);
  }

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
    } catch {
      return;
    }
    const now = new Date().toISOString();
    items.value = items.value.map((it) => (it.readAt ? it : { ...it, readAt: now }));
    unread.value = 0;
  }

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function reset() {
    items.value = [];
    unread.value = 0;
    loaded.value = false;
    isOpen.value = false;
  }

  return {
    items,
    unread,
    loaded,
    isOpen,
    hasUnread,
    load,
    handleIncoming,
    markRead,
    markAllRead,
    open,
    close,
    toggle,
    reset,
  };
});
