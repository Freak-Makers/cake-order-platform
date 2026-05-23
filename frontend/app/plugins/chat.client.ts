import { watch } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useChatStore } from "~/stores/chat";
import { useNotificationStore } from "~/stores/notification";

/**
 * 로그인 상태가 true 가 되면 STOMP CONNECT, false 가 되면 DISCONNECT + reset.
 *
 * init.client.ts 가 먼저 auth.init() 을 호출해 localStorage 의 토큰을 복원하므로,
 * 새 탭에서 첫 진입 시에도 watch immediate 평가 시점에 정확한 isLoggedIn 값을 사용한다.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore();
  const chat = useChatStore();
  const notification = useNotificationStore();

  watch(
    () => auth.isLoggedIn,
    (loggedIn) => {
      if (loggedIn) {
        chat.connect();
        if (auth.role === "ADMIN") {
          // 사이드바·헤더 badge 가 정확해지도록 채팅방 + 알림 목록을 미리 채움.
          void chat.loadAdminRooms().catch(() => undefined);
          void notification.load().catch(() => undefined);
        } else {
          void chat.loadMyRoomAndMessages().catch(() => undefined);
        }
      } else {
        chat.reset();
      }
    },
    { immediate: true },
  );
});
