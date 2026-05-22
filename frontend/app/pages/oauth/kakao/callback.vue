<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getKakaoLogin } from "~/api/user.api";
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

let hasCalled = false;

onMounted(async () => {
  if (hasCalled) return;
  hasCalled = true;

  const code = route.query.code as string | undefined;
  const state = route.query.state as string | undefined;

  // code 또는 state가 없으면 로그인 페이지로 에러와 함께 리다이렉트
  if (!code || !state) {
    console.error("Kakao login error: Missing code or state from URL parameters.");
    alert("카카오 로그인에 실패했습니다.\n다시 시도해주세요.");
    router.push("/login?error=kakao_missing_params");
    return;
  }

  try {
    const response = await getKakaoLogin(code);
    // 토큰 + 사용자 정보 저장 (카카오 유저는 role 없음)
    auth.login(response.accessToken, null, {
      id: response.id,
      nickname: response.nickname,
      email: response.email ?? null,
      profileImageUrl: response.profileImageUrl ?? null,
      provider: "KAKAO",
    });
    router.push("/user/products");
  } catch (e) {
    console.error("Kakao login backend API error:", e);
    alert("카카오 로그인에 실패했습니다.\n다시 시도해주세요.");
    router.push("/login?error=kakao_login_failed");
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
    <div class="flex flex-col items-center justify-center text-center">
      <p class="text-lg text-zinc-700">카카오 로그인을 처리 중입니다...</p>
      <p class="mt-2 text-sm text-zinc-500">잠시만 기다려 주세요.</p>
    </div>
  </div>
</template>
