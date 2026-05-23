<script setup lang="ts">
import { ArrowDown, Play } from "lucide-vue-next";

defineEmits<{ openTrial: [] }>();
</script>

<template>
  <section class="relative isolate flex min-h-screen flex-col overflow-hidden bg-black">
    <!-- 비디오 배경 (autoplay·muted·loop) + 정적 fallback -->
    <video
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=85"
      class="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
    >
      <source
        src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-doing-a-running-workout-2799-large.mp4"
        type="video/mp4"
      />
    </video>
    <!-- 진한 그라데이션 오버레이 -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/40 to-black" />
    <!-- 그리드 라인 -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 opacity-[0.15] [background-image:linear-gradient(rgba(190,242,100,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(190,242,100,0.4)_1px,transparent_1px)] [background-size:80px_80px]"
      aria-hidden="true"
    />

    <div class="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-20 pt-32 sm:px-8 sm:pt-40 lg:pt-44">
      <div class="flex items-center gap-3">
        <span class="relative flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-400" />
        </span>
        <span class="text-[11px] font-bold uppercase tracking-[0.3em] text-lime-300">
          Now training · Seoul Hannam
        </span>
      </div>

      <h1 class="mt-6 font-black uppercase leading-[0.85] tracking-tighter text-white">
        <span class="block text-6xl sm:text-7xl lg:text-[8.5rem] xl:text-[10rem]">
          NO EXCUSES
        </span>
        <span class="mt-2 block bg-gradient-to-r from-lime-200 to-lime-400 bg-clip-text text-6xl text-transparent sm:text-7xl lg:text-[8.5rem] xl:text-[10rem]">
          JUST REPS.
        </span>
      </h1>

      <p class="mt-8 max-w-md text-sm leading-relaxed text-zinc-300 sm:text-base">
        IRONHAUS 는 결과로 증명합니다. 12주 후, 거울 앞 당신은 다른 사람일 거예요.
        프리미엄 1:1 퍼스널 트레이닝, 첫 세션 무료.
      </p>

      <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          class="group inline-flex h-14 items-center justify-center gap-3 rounded-none bg-lime-300 px-7 text-sm font-black uppercase tracking-wider text-black transition-all duration-200 hover:bg-lime-200 hover:translate-x-1"
          @click="$emit('openTrial')"
        >
          무료 체험 신청
          <span class="text-xl">→</span>
        </button>
        <a
          href="#programs"
          class="inline-flex h-14 items-center justify-center gap-2 rounded-none border border-white/20 bg-white/5 px-7 text-sm font-bold uppercase tracking-wider text-white backdrop-blur transition-colors hover:bg-white/10"
        >
          <Play :size="14" />
          프로그램 보기
        </a>
      </div>

      <a
        href="#programs"
        class="mt-16 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 transition-colors hover:text-lime-300"
      >
        scroll down
        <ArrowDown :size="14" class="animate-bounce" />
      </a>
    </div>

    <!-- 끝없이 흐르는 marquee — 트레이너 이름 -->
    <div class="relative border-y border-white/10 bg-black py-5">
      <div class="flex select-none gap-12 overflow-hidden">
        <ul class="flex shrink-0 animate-[fit-marquee_30s_linear_infinite] items-center gap-12">
          <li
            v-for="t in [
              'JAY KIM',
              '+',
              'SUMI HAN',
              '+',
              'TAE OH',
              '+',
              'MIN PARK',
              '+',
              'ROY CHOI',
              '+',
              'HANA LEE',
              '+',
            ]"
            :key="t + '-a'"
            class="font-black uppercase tracking-tight text-white text-4xl sm:text-5xl"
            :class="t === '+' ? 'text-lime-300' : ''"
          >
            {{ t }}
          </li>
        </ul>
        <ul aria-hidden="true" class="flex shrink-0 animate-[fit-marquee_30s_linear_infinite] items-center gap-12">
          <li
            v-for="t in ['JAY KIM', '+', 'SUMI HAN', '+', 'TAE OH', '+', 'MIN PARK', '+', 'ROY CHOI', '+', 'HANA LEE', '+']"
            :key="t + '-b'"
            class="font-black uppercase tracking-tight text-white text-4xl sm:text-5xl"
            :class="t === '+' ? 'text-lime-300' : ''"
          >
            {{ t }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fit-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
</style>
