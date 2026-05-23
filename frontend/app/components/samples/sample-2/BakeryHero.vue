<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowDown } from "lucide-vue-next";

// 스크롤 parallax — 배경 이미지가 더 느리게 움직임.
const heroRef = ref<HTMLElement | null>(null);
const offset = ref(0);

function onScroll() {
  const el = heroRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  // 화면 상단에서부터의 거리 비례.
  offset.value = Math.max(-rect.top * 0.4, 0);
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <section ref="heroRef" class="relative h-[88vh] min-h-[600px] overflow-hidden">
    <!-- parallax 배경 이미지 -->
    <div
      class="absolute inset-0 -z-10 scale-110 bg-cover bg-center"
      :style="{
        backgroundImage: `url('https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1800&q=85')`,
        transform: `translateY(${offset}px) scale(1.1)`,
      }"
    />
    <!-- 따뜻한 톤 오버레이 -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-rose-900/30 via-rose-900/10 to-amber-50/95" />

    <div class="mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-28">
      <span class="font-serif text-sm italic text-white/90 sm:text-base">— since 2019, Seongsu</span>
      <h1 class="mt-3 font-serif text-5xl font-light leading-[1.05] text-white sm:text-6xl lg:text-[5.5rem]">
        오늘 아침,
        <br />
        <span class="italic">손으로</span> 구워낸
        <br />
        한 조각.
      </h1>
      <p class="mt-6 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
        무염버터·국산 밀가루·그날 받은 과일만 사용해, 매일 한정 수량으로 굽는
        작은 베이커리 — Maison de Sucre.
      </p>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="#signatures"
          class="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-rose-900 transition-all duration-300 hover:bg-rose-50 hover:shadow-lg sm:px-7"
        >
          시그니처 메뉴 보기
        </a>
        <a
          href="#reserve"
          class="inline-flex h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20 sm:px-7"
        >
          홀케이크 예약
        </a>
      </div>

      <a
        href="#signatures"
        class="mt-12 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
      >
        scroll
        <ArrowDown :size="14" class="animate-bounce" />
      </a>
    </div>
  </section>
</template>
