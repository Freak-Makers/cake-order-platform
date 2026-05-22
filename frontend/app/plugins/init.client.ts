import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";

// 앱 마운트 전에 인증/장바구니 상태를 localStorage 에서 1회 복원.
export default defineNuxtPlugin(() => {
  useAuthStore().init();
  useCartStore().init();
});
