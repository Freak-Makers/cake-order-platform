<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

definePageMeta({ layout: false });

// 페이지 전용 serif 폰트 로딩 — Cormorant Garamond + Inter.
useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600&display=swap",
    },
  ],
});
</script>

<template>
  <div class="bakery-root min-h-screen bg-amber-50/40 text-stone-800 antialiased">
    <!-- 상단 네비 -->
    <header class="sticky top-0 z-40 border-b border-stone-200/60 bg-amber-50/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <NuxtLink to="/samples" class="group flex items-center gap-2 text-xs font-medium tracking-wider text-stone-500 hover:text-stone-900">
          <ArrowLeft :size="14" class="transition-transform group-hover:-translate-x-0.5" />
          샘플 목록
        </NuxtLink>

        <NuxtLink to="/samples/sample-2" class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-amber-300 font-serif text-base italic text-white">M</span>
          <span class="hidden font-serif text-lg italic text-stone-900 sm:inline">Maison de Sucre</span>
        </NuxtLink>

        <nav class="hidden items-center gap-7 font-serif text-sm italic text-stone-600 md:flex">
          <a href="#signatures" class="hover:text-rose-600">시그니처</a>
          <a href="#reserve" class="hover:text-rose-600">예약</a>
          <a href="#" class="hover:text-rose-600">이야기</a>
          <a href="#" class="hover:text-rose-600">찾아오시는 길</a>
        </nav>

        <a
          href="#reserve"
          class="inline-flex h-10 items-center rounded-full bg-stone-900 px-5 text-xs font-medium text-white transition-colors hover:bg-rose-600"
        >
          홀케이크 예약
        </a>
      </div>
    </header>

    <BakeryHero />
    <BakerySignatures />
    <BakeryDaily />
    <BakeryStory />
    <BakeryReservation />
    <BakeryVisit />

    <footer class="border-t border-stone-200/70 bg-amber-50/60 py-12">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
        <div class="text-center sm:text-left">
          <p class="font-serif text-2xl italic text-stone-900">Maison de Sucre</p>
          <p class="mt-1 text-xs text-stone-500">since 2019 · Seongsu, Seoul</p>
        </div>
        <ul class="flex gap-6 text-xs text-stone-500">
          <li><a href="#" class="hover:text-rose-600">이용약관</a></li>
          <li><a href="#" class="hover:text-rose-600">개인정보</a></li>
          <li><a href="#" class="hover:text-rose-600">취소·환불</a></li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.bakery-root {
  font-family: "Inter", -apple-system, system-ui, sans-serif;
}
.bakery-root :deep(.font-serif) {
  font-family: "Cormorant Garamond", "Noto Serif KR", serif;
  letter-spacing: -0.01em;
}
</style>
