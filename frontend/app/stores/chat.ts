import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { Client, type IMessage } from "@stomp/stompjs";
import type {
  AdminChatRoom,
  ChatMessage,
  ChatPushMessage,
  ChatRoom,
} from "~/api/types";
import {
  getAdminMessages,
  getAdminRooms,
  getMyMessages,
  getMyRoom,
  markAdminRoomRead,
  markMyRoomRead,
} from "~/api/chat.api";
import { useAuthStore } from "~/stores/auth";
import { resolveWsUrl } from "~/utils/ws-url";
import { showToast } from "~/utils/toast";

/**
 * STOMP 클라이언트 + 채팅 상태.
 *
 * 메시지 정렬은 항상 "최신부터(desc)" 로 보관한다. UI 가 표시할 때 reverse() 한다.
 * 새 메시지는 항상 배열 맨 앞(prepend)에 들어간다.
 */
export const useChatStore = defineStore("chat", () => {
  // STOMP 클라이언트는 reactive 로 감싸지 않기 위해 모듈 변수로 보관.
  let client: Client | null = null;

  const connected = ref(false);

  // 고객 모드 상태
  const myRoom = ref<ChatRoom | null>(null);

  // 관리자 모드 상태
  const adminRooms = ref<AdminChatRoom[]>([]);

  // roomId → 메시지 배열(desc 정렬)
  const messagesByRoom = ref<Record<number, ChatMessage[]>>({});

  // 화면에서 현재 보고 있는 채팅방. 페이지/패널이 진입/이탈 시 set/clear.
  const activeRoomId = ref<number | null>(null);

  // 메뉴 badge 용 총 unread.
  const unreadTotal = computed(() => {
    const auth = useAuthStore();
    if (auth.role === "ADMIN") {
      return adminRooms.value.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
    }
    return myRoom.value?.unreadCount ?? 0;
  });

  function getMessages(roomId: number): ChatMessage[] {
    return messagesByRoom.value[roomId] ?? [];
  }

  // STOMP 연결 -----------------------------------------------------------

  function connect() {
    if (client && client.active) return;
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    client = new Client({
      brokerURL: resolveWsUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        connected.value = true;
        client?.subscribe("/user/queue/messages", (frame: IMessage) => {
          try {
            const payload = JSON.parse(frame.body) as ChatPushMessage;
            onIncoming(payload);
          } catch (e) {
            console.error("[chat] failed to parse message", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("[chat] STOMP error", frame.headers["message"], frame.body);
      },
      onWebSocketClose: () => {
        connected.value = false;
      },
      onWebSocketError: (e) => {
        console.error("[chat] websocket error", e);
      },
    });
    client.activate();
  }

  function disconnect() {
    if (!client) return;
    void client.deactivate();
    client = null;
    connected.value = false;
  }

  function reset() {
    disconnect();
    myRoom.value = null;
    adminRooms.value = [];
    messagesByRoom.value = {};
    activeRoomId.value = null;
  }

  // 송수신 ---------------------------------------------------------------

  function sendMessage(roomId: number, rawContent: string): boolean {
    const content = rawContent.trim();
    if (!content) return false;
    if (content.length > 2000) {
      showToast("메시지가 너무 깁니다 (최대 2000자)", { variant: "error" });
      return false;
    }
    if (!client?.active) {
      showToast("채팅 서버에 연결되어 있지 않습니다", { variant: "error" });
      return false;
    }

    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ roomId, content }),
    });

    // 백엔드는 본인에게 push 하지 않으므로 로컬에 즉시 임시 메시지를 append.
    const auth = useAuthStore();
    const senderType = auth.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
    const senderId = senderType === "CUSTOMER"
      ? myRoom.value?.customerId ?? 0
      : adminRooms.value.find((r) => r.id === roomId)?.adminId ?? 0;

    const tempMessage: ChatMessage = {
      id: -Date.now(), // 음수 sentinel — 새로고침 시 REST 영구 ID 로 대체됨
      roomId,
      senderId,
      senderType,
      content,
      sentAt: new Date().toISOString(),
    };
    prependMessage(roomId, tempMessage);

    // 방 메타 갱신 (last preview, lastMessageAt). unread 는 본인은 그대로.
    updateRoomLastMessage(roomId, tempMessage);
    return true;
  }

  function onIncoming(payload: ChatPushMessage) {
    const msg: ChatMessage = {
      id: payload.messageId,
      roomId: payload.roomId,
      senderId: payload.senderId,
      senderType: payload.senderType,
      content: payload.content,
      sentAt: payload.sentAt,
    };
    prependMessage(payload.roomId, msg);
    updateRoomLastMessage(payload.roomId, msg);

    const auth = useAuthStore();
    const isActive = activeRoomId.value === payload.roomId;

    if (isActive) {
      // 현재 보고 있는 방이면 자동 markRead.
      if (auth.role === "ADMIN") {
        void markAdminRoomRead(payload.roomId).catch(() => undefined);
        setAdminUnread(payload.roomId, 0);
      } else {
        void markMyRoomRead(payload.roomId).catch(() => undefined);
        if (myRoom.value) myRoom.value.unreadCount = 0;
      }
    } else {
      // 다른 화면에 있을 때만 토스트 + unread 증가.
      if (auth.role === "ADMIN") {
        bumpAdminUnread(payload.roomId);
        const room = adminRooms.value.find((r) => r.id === payload.roomId);
        const who = room?.customerNickname ?? "고객";
        showToast(`${who}: ${truncatePreview(payload.content)}`, { variant: "info" });
      } else {
        if (myRoom.value && myRoom.value.id === payload.roomId) {
          myRoom.value.unreadCount += 1;
        }
        showToast(`사장님: ${truncatePreview(payload.content)}`, { variant: "info" });
      }
    }
  }

  // 헬퍼 -----------------------------------------------------------------

  function prependMessage(roomId: number, msg: ChatMessage) {
    const arr = messagesByRoom.value[roomId] ?? [];
    messagesByRoom.value = { ...messagesByRoom.value, [roomId]: [msg, ...arr] };
  }

  function updateRoomLastMessage(roomId: number, msg: ChatMessage) {
    if (myRoom.value && myRoom.value.id === roomId) {
      myRoom.value.lastMessageAt = msg.sentAt;
      myRoom.value.lastMessagePreview = msg.content.slice(0, 200);
    }
    const idx = adminRooms.value.findIndex((r) => r.id === roomId);
    if (idx >= 0) {
      const updated: AdminChatRoom = {
        ...adminRooms.value[idx]!,
        lastMessageAt: msg.sentAt,
        lastMessagePreview: msg.content.slice(0, 200),
      };
      // 최신 메시지가 도착한 방을 목록 맨 앞으로 이동.
      const next = adminRooms.value.slice();
      next.splice(idx, 1);
      next.unshift(updated);
      adminRooms.value = next;
    }
  }

  function bumpAdminUnread(roomId: number) {
    const idx = adminRooms.value.findIndex((r) => r.id === roomId);
    if (idx < 0) return;
    const target = adminRooms.value[idx]!;
    adminRooms.value = adminRooms.value.map((r, i) =>
      i === idx ? { ...target, unreadCount: target.unreadCount + 1 } : r,
    );
  }

  function setAdminUnread(roomId: number, count: number) {
    adminRooms.value = adminRooms.value.map((r) =>
      r.id === roomId ? { ...r, unreadCount: count } : r,
    );
  }

  function truncatePreview(content: string): string {
    const trimmed = content.trim();
    if (trimmed.length <= 40) return trimmed;
    return trimmed.slice(0, 40) + "…";
  }

  // 로딩 -----------------------------------------------------------------

  async function loadMyRoomAndMessages(limit = 50) {
    const room = await getMyRoom();
    myRoom.value = room;
    const page = await getMyMessages(room.id, 0, limit);
    messagesByRoom.value = { ...messagesByRoom.value, [room.id]: page.items };
  }

  async function loadAdminRooms(offset = 0, limit = 20, replace = true) {
    const page = await getAdminRooms(offset, limit);
    if (replace) {
      adminRooms.value = page.items;
    } else {
      // append (중복 제거)
      const existing = new Set(adminRooms.value.map((r) => r.id));
      const merged = adminRooms.value.slice();
      for (const r of page.items) if (!existing.has(r.id)) merged.push(r);
      adminRooms.value = merged;
    }
  }

  async function loadMessagesForRoom(roomId: number, offset = 0, limit = 50) {
    const auth = useAuthStore();
    const page = auth.role === "ADMIN"
      ? await getAdminMessages(roomId, offset, limit)
      : await getMyMessages(roomId, offset, limit);
    messagesByRoom.value = { ...messagesByRoom.value, [roomId]: page.items };
  }

  async function setActiveRoom(roomId: number | null) {
    activeRoomId.value = roomId;
    if (roomId == null) return;
    const auth = useAuthStore();
    try {
      if (auth.role === "ADMIN") {
        await markAdminRoomRead(roomId);
        setAdminUnread(roomId, 0);
      } else {
        await markMyRoomRead(roomId);
        if (myRoom.value && myRoom.value.id === roomId) {
          myRoom.value.unreadCount = 0;
        }
      }
    } catch {
      // 토스트는 fetch.ts 에서 자동
    }
  }

  return {
    connected,
    myRoom,
    adminRooms,
    messagesByRoom,
    activeRoomId,
    unreadTotal,
    getMessages,
    connect,
    disconnect,
    reset,
    sendMessage,
    loadMyRoomAndMessages,
    loadAdminRooms,
    loadMessagesForRoom,
    setActiveRoom,
  };
});
