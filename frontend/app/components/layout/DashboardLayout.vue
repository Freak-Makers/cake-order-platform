<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LogOut, Menu, User } from "lucide-vue-next";
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const isSidebarOpen = ref(false);
const isInfoOpen = ref(false);

const isAdmin = computed(() => auth.isLoggedIn && auth.role === "ADMIN");

// ADMIN 이 아니면 로그인 페이지로 (백엔드 1차 차단의 UX 보조)
watchEffect(() => {
  if (!auth.isLoading && !isAdmin.value) {
    router.replace("/login");
  }
});

// 라우트 이동 시 모바일 drawer / 내 정보 popover 자동 닫기
watch(
  () => route.path,
  () => {
    isSidebarOpen.value = false;
    isInfoOpen.value = false;
  },
);

function hideImage(e: Event) {
  (e.target as HTMLImageElement).style.display = "none";
}
</script>

<template>
  <div v-if="auth.isLoading || !isAdmin" class="min-h-screen bg-zinc-50" />

  <div v-else class="min-h-screen bg-zinc-50">
    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
    <main class="lg:pl-64">
      <header
        class="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4 lg:px-8"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 lg:hidden"
              aria-label="메뉴 열기"
              @click="isSidebarOpen = true"
            >
              <Menu :size="22" />
            </button>
            <h2 class="text-sm font-medium text-zinc-500">사장님 환영합니다!</h2>
          </div>
          <div class="flex items-center gap-3 sm:gap-4">
            <NotificationBell />
            <button
              class="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              @click="auth.logout()"
            >
              <LogOut :size="18" />
              <span class="hidden sm:inline">로그아웃</span>
            </button>
            <div class="relative">
              <button
                type="button"
                class="block h-8 w-8 overflow-hidden rounded-full bg-zinc-200 transition-opacity hover:opacity-80"
                aria-label="내 정보 열기"
                aria-haspopup="dialog"
                :aria-expanded="isInfoOpen"
                @mousedown.stop="isInfoOpen = !isInfoOpen"
              >
                <img
                  v-if="auth.userInfo?.profileImageUrl"
                  :src="auth.userInfo.profileImageUrl"
                  :alt="auth.userInfo.nickname"
                  class="h-full w-full object-cover"
                  @error="hideImage"
                />
                <User v-else :size="32" class="p-1 text-zinc-400" />
              </button>
              <UserInfoPopover
                :user-info="auth.userInfo"
                :is-open="isInfoOpen"
                @close="isInfoOpen = false"
              />
            </div>
          </div>
        </div>
      </header>
      <div class="p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
