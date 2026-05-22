<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { MessageSquare, User, ShieldCheck, Lock, Mail, ChevronLeft } from "lucide-vue-next";
import { getKakaoLoginUrl, loginAdmin } from "~/api/user.api";
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();
const router = useRouter();

const isLoading = ref(false);
const activeTab = ref<"admin" | "user">("admin");
const adminEmail = ref("");
const adminPassword = ref("");

async function handleKakaoLogin() {
  isLoading.value = true;
  try {
    const response = await getKakaoLoginUrl();
    window.location.href = response.url;
  } catch (e) {
    console.warn(e);
    isLoading.value = false;
  }
}

async function handleAdminLogin() {
  isLoading.value = true;
  try {
    const response = await loginAdmin({
      email: adminEmail.value,
      password: adminPassword.value,
    });
    auth.login(response.accessToken, response.role, {
      id: response.id,
      nickname: response.nickname,
      email: response.email ?? adminEmail.value ?? null,
      profileImageUrl: null,
      provider: "ADMIN",
    });
    router.push("/dashboard");
  } catch (e) {
    console.error("Admin login failed:", e);
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
    <div class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl shadow-zinc-200/50">
      <!-- Header -->
      <div class="relative bg-white p-6 pb-4 text-center sm:p-8">
        <NuxtLink
          to="/"
          class="absolute left-4 top-6 flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-600 sm:left-6 sm:top-8"
        >
          <ChevronLeft :size="18" />
          <span class="hidden sm:inline">홈으로</span>
        </NuxtLink>
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500 text-white">
          <MessageSquare :size="24" fill="currentColor" />
        </div>
        <h1 class="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Cake Admin</h1>
        <p class="mt-2 text-sm text-zinc-500 sm:text-base">원하시는 체험 모드를 선택해주세요.</p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-zinc-100">
        <button
          :class="[
            'flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors',
            activeTab === 'admin'
              ? 'border-b-2 border-pink-500 text-pink-600'
              : 'text-zinc-500 hover:bg-zinc-50',
          ]"
          @click="activeTab = 'admin'"
        >
          <ShieldCheck :size="18" />
          사장님 체험
        </button>
        <button
          :class="[
            'flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors',
            activeTab === 'user'
              ? 'border-b-2 border-pink-500 text-pink-600'
              : 'text-zinc-500 hover:bg-zinc-50',
          ]"
          @click="activeTab = 'user'"
        >
          <User :size="18" />
          사용자 체험
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 sm:p-8">
        <form v-if="activeTab === 'admin'" class="space-y-4" @submit.prevent="handleAdminLogin">
          <div class="space-y-2">
            <label class="text-sm font-medium text-zinc-700" for="email">이메일</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" :size="18" />
              <input
                id="email"
                v-model="adminEmail"
                type="email"
                required
                placeholder="admin@example.com"
                class="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-zinc-700" for="password">비밀번호</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" :size="18" />
              <input
                id="password"
                v-model="adminPassword"
                type="password"
                required
                placeholder="••••••••"
                class="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>
          <Button
            type="submit"
            :disabled="isLoading"
            class="mt-4 h-11 w-full bg-pink-500 text-white hover:bg-pink-600"
          >
            {{ isLoading ? "로그인 중..." : "관리자 로그인" }}
          </Button>
          <p class="mt-4 text-center text-xs text-zinc-400">
            사장님 전용 관리 도구를 체험해볼 수 있습니다.
          </p>
        </form>

        <div v-else class="space-y-6">
          <Button
            :disabled="isLoading"
            class="h-11 w-full gap-3 bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90 focus-visible:ring-[#FEE500]"
            @click="handleKakaoLogin"
          >
            <template v-if="isLoading">연결 중...</template>
            <template v-else>
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 3c-4.97 0-9 3.134-9 7 0 2.508 1.657 4.7 4.156 6.014l-.994 3.64c-.06.222.063.45.27.55a.443.443 0 0 0 .185.04.456.456 0 0 0 .34-.153l4.288-2.858c.25.02.503.033.755.033 4.97 0 9-3.134 9-7s-4.03-7-9-7z"
                />
              </svg>
              카카오로 간편하게 시작하기
            </template>
          </Button>
          <p class="text-center text-xs text-zinc-400">
            사용자로서 케이크를 예약하고 주문하는 과정을 체험합니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
