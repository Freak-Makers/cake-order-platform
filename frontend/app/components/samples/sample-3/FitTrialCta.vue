<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";

defineEmits<{ openTrial: [] }>();
</script>

<template>
  <section class="relative isolate overflow-hidden bg-black py-24 sm:py-32">
    <!-- 배경 텍스트 -->
    <div
      class="pointer-events-none absolute inset-x-0 top-1/2 -z-0 -translate-y-1/2 select-none whitespace-nowrap text-center font-black uppercase tracking-tighter text-lime-300/[0.06] text-[22vw] leading-none"
      aria-hidden="true"
    >
      START TODAY
    </div>

    <div class="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
      <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-lime-300">— ready?</p>
      <h2 class="mt-4 font-black uppercase leading-[0.9] tracking-tight text-white text-5xl sm:text-7xl lg:text-8xl">
        지금 시작해.<br />
        <span class="text-lime-300">내일은 늦어.</span>
      </h2>
      <p class="mx-auto mt-6 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
        첫 1:1 PT 세션, 체성분 분석, 1주일 시설 이용 모두 무료. 약속만 잡으세요.
      </p>

      <button
        type="button"
        class="group mx-auto mt-10 inline-flex h-16 items-center justify-center gap-3 bg-lime-300 px-10 text-sm font-black uppercase tracking-wider text-black transition-all duration-200 hover:bg-lime-200 hover:translate-x-1"
        @click="$emit('openTrial')"
      >
        무료 체험 신청
        <ArrowRight :size="20" class="transition-transform group-hover:translate-x-1" />
      </button>

      <p class="mt-4 text-xs text-zinc-500">신용카드 불필요 · 약속 후 24시간 내 컨택</p>
    </div>
  </section>
</template>
