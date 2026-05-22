<script setup lang="ts">
import { computed } from "vue";
import { Cake } from "lucide-vue-next";
import type { NuxtError } from "#app";

// 라우트에 매칭되지 않는 URL(404) 및 치명적 에러를 처리하는 Nuxt 전역 에러 페이지.
const props = defineProps<{
  error: NuxtError;
}>();

const isNotFound = computed(() => props.error?.statusCode === 404);

function handleGoHome() {
  // 에러 상태를 비우고 홈으로 이동
  clearError({ redirect: "/" });
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-8 text-center">
    <div class="flex items-center gap-2">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500 text-white">
        <Cake :size="22" />
      </div>
      <span class="text-lg font-bold tracking-tight text-zinc-900">Cake Order</span>
    </div>

    <p class="mt-10 text-6xl font-extrabold tracking-tight text-pink-500 sm:text-7xl">
      {{ error?.statusCode || 404 }}
    </p>
    <h1 class="mt-4 text-xl font-bold text-zinc-900 sm:text-2xl">
      {{ isNotFound ? "페이지를 찾을 수 없습니다" : "문제가 발생했습니다" }}
    </h1>
    <p class="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
      {{
        isNotFound
          ? "요청하신 주소가 존재하지 않거나 이동되었어요. 주소를 다시 확인해 주세요."
          : "예기치 못한 오류로 페이지를 표시할 수 없습니다. 잠시 후 다시 시도해 주세요."
      }}
    </p>

    <Button class="mt-8 bg-pink-500 hover:bg-pink-600" @click="handleGoHome">
      홈으로 돌아가기
    </Button>
  </div>
</template>
