<script setup lang="ts">
import { ref } from "vue";
import { ArrowLeft, Sparkles } from "lucide-vue-next";

definePageMeta({ layout: false });

// 마우스 추적 글로우 — CSS variable 로 radial-gradient 위치 갱신.
const rootRef = ref<HTMLElement | null>(null);
function onMouseMove(e: MouseEvent) {
  const el = rootRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  el.style.setProperty("--my", `${e.clientY - rect.top}px`);
}
</script>

<template>
  <div
    ref="rootRef"
    class="saas-root relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100 antialiased"
    @mousemove="onMouseMove"
  >
    <!-- 마우스 추적 글로우 -->
    <div class="saas-glow pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
    <!-- 도트 그리드 배경 -->
    <div class="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:24px_24px]" aria-hidden="true" />

    <!-- 상단 네비 -->
    <header class="sticky top-0 z-30 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <div class="flex items-center gap-6">
          <NuxtLink to="/samples" class="group flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100">
            <ArrowLeft :size="14" class="transition-transform group-hover:-translate-x-0.5" />
            샘플 목록
          </NuxtLink>
          <div class="hidden h-4 w-px bg-white/10 sm:block" />
          <div class="hidden items-center gap-2 sm:flex">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              <Sparkles :size="12" />
            </div>
            <span class="text-sm font-semibold tracking-tight">Noteflow</span>
          </div>
        </div>
        <nav class="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
          <a href="#preview" class="hover:text-zinc-100">기능</a>
          <a href="#pricing" class="hover:text-zinc-100">요금</a>
          <a href="#" class="hover:text-zinc-100">고객사례</a>
          <a href="#" class="hover:text-zinc-100">문서</a>
        </nav>
        <div class="flex items-center gap-2">
          <a href="#" class="hidden text-sm text-zinc-400 hover:text-zinc-100 sm:inline">로그인</a>
          <a href="#pricing" class="inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200">
            무료 시작
          </a>
        </div>
      </div>
    </header>

    <SaasHero />
    <SaasLogoCloud />
    <SaasFeatures />
    <SaasProductPreview />
    <SaasWorkflow />
    <SaasPricing />
    <SaasFaq />
    <SaasFooterCta />
  </div>
</template>

<style scoped>
.saas-glow {
  background: radial-gradient(
    600px circle at var(--mx, 50%) var(--my, 200px),
    rgba(139, 92, 246, 0.08),
    transparent 60%
  );
  transition: background 200ms ease;
}
</style>
