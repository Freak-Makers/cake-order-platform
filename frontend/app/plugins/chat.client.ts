import { watch } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useChatStore } from "~/stores/chat";

/**
 * 로그인 상태가 true 가 되면 STOMP CONNECT, false 가 되면 DISCONNECT + reset.
 *
 * init.client.ts 가 먼저 auth.init() 을 호출해 localStorage 의 토큰을 복원하므로,
 * 새 탭에서 첫 진입 시에도 watch immediate 평가 시점에 정확한 isLoggedIn 값을 사용한다.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore();
  const chat = useChatStore();

  watch(
    () => auth.isLoggedIn,
    (loggedIn) => {
      if (loggedIn) {
        chat.connect();
        // 관리자라면 채팅방 목록을 미리 받아두면 메뉴 badge 가 정확해진다.
        if (auth.role === "ADMIN") {
          void chat.loadAdminRooms().catch(() => undefined);
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
