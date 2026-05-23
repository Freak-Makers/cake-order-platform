<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

definePageMeta({ layout: false });
</script>

<template>
  <div class="pebble-root min-h-screen bg-white text-slate-900 antialiased">
    <!-- 상단 네비 -->
    <header class="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <div class="flex items-center gap-6">
          <NuxtLink to="/samples" class="group flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft :size="14" class="transition-transform group-hover:-translate-x-0.5" />
            샘플 목록
          </NuxtLink>
          <div class="hidden h-4 w-px bg-slate-200 sm:block" />
          <NuxtLink to="/samples/sample-4" class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-600 text-sm font-bold text-white">
              P
            </span>
            <span class="text-base font-bold tracking-tight">Pebble</span>
          </NuxtLink>
        </div>
        <nav class="hidden items-center gap-7 text-sm text-slate-600 md:flex">
          <a href="#features" class="hover:text-indigo-600">기능</a>
          <a href="#" class="hover:text-indigo-600">수익률</a>
          <a href="#" class="hover:text-indigo-600">보안</a>
          <a href="#" class="hover:text-indigo-600">고객센터</a>
        </nav>
        <a
          href="#download"
          class="inline-flex h-9 items-center rounded-full bg-slate-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          앱 다운로드
        </a>
      </div>
    </header>

    <PebbleHero />
    <PebbleTrust />
    <PebbleStack />
    <PebbleChart />
    <PebbleSecurity />
    <PebbleCompare />
    <PebbleAppCta />
    <PebbleNewsletter />

    <footer class="border-t border-slate-200 bg-slate-50 py-10">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-xs text-slate-500 sm:flex-row sm:px-8">
        <p>© 2026 Pebble Financial · 금융위 마이데이터 인가</p>
        <ul class="flex gap-5">
          <li><a href="#" class="hover:text-slate-900">이용약관</a></li>
          <li><a href="#" class="hover:text-slate-900">개인정보처리방침</a></li>
          <li><a href="#" class="hover:text-slate-900">전자금융약관</a></li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.pebble-root {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "Helvetica Neue", system-ui, sans-serif;
  font-feature-settings: "ss01", "cv01";
}
</style>
