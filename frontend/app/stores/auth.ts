import { defineStore } from "pinia";
import { ref } from "vue";
import { navigateTo } from "#imports";
import type { UserInfo } from "~/api/types";

const TOKEN_KEY = "accessToken";
const ROLE_KEY = "userRole";
const USER_INFO_KEY = "userInfo";
const FRESH_SESSION_KEY = "authSessionStarted";

// JWT 단일·무상태 인증. 토큰/role/userInfo 를 localStorage 에 저장.
export const useAuthStore = defineStore("auth", () => {
  const isLoggedIn = ref(false);
  const role = ref<string | null>(null);
  const userInfo = ref<UserInfo | null>(null);
  const isLoading = ref(true);

  function readStoredUserInfo(): UserInfo | null {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserInfo;
    } catch {
      // 손상된 값은 무시하고 정리
      localStorage.removeItem(USER_INFO_KEY);
      return null;
    }
  }

  // 초기화: 새 브라우저 세션의 첫 진입이면 토큰/role/userInfo 를 비우고 시작
  // (서버/탭 재시작 후 로그아웃 상태). init.client 플러그인에서 1회 호출.
  function init() {
    if (!sessionStorage.getItem(FRESH_SESSION_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      sessionStorage.setItem(FRESH_SESSION_KEY, "1");
    }
    const token = localStorage.getItem(TOKEN_KEY);
    isLoggedIn.value = !!token;
    role.value = localStorage.getItem(ROLE_KEY);
    userInfo.value = readStoredUserInfo();
    isLoading.value = false;
  }

  function login(token: string, newRole: string | null, info: UserInfo | null = null) {
    localStorage.setItem(TOKEN_KEY, token);
    if (newRole) localStorage.setItem(ROLE_KEY, newRole);
    else localStorage.removeItem(ROLE_KEY);
    if (info) localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
    else localStorage.removeItem(USER_INFO_KEY);
    isLoggedIn.value = true;
    role.value = newRole;
    userInfo.value = info;
    isLoading.value = false;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    isLoggedIn.value = false;
    role.value = null;
    userInfo.value = null;
    isLoading.value = false;
    navigateTo("/login");
  }

  return { isLoggedIn, role, userInfo, isLoading, init, login, logout };
});
