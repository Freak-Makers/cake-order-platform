<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowRight, Play, Sparkles } from "lucide-vue-next";

// 가짜 회의록 transcript — 한 줄씩 타이핑되어 등장.
const transcript = [
  { speaker: "지훈", color: "text-violet-300", text: "다음 분기 OKR 초안 공유드릴게요." },
  { speaker: "은서", color: "text-sky-300", text: "마케팅 예산은 이번에 15% 줄였어요." },
  { speaker: "AI", color: "text-emerald-300", text: "정리된 액션 아이템 3개 — 김지훈에게 할당됨." },
  { speaker: "민호", color: "text-fuchsia-300", text: "그럼 신규 채용은 다음 회의에서 다시 다룰까요?" },
];

const visibleLines = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    if (visibleLines.value < transcript.length) {
      visibleLines.value += 1;
    } else {
      // 잠시 멈춘 뒤 처음부터 다시.
      setTimeout(() => (visibleLines.value = 0), 1800);
    }
  }, 1400);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <section class="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-32">
    <!-- 배경 그라데이션 글로우 -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-violet-600/20 blur-3xl" />
      <div class="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-3xl" />
    </div>

    <div class="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
      <div>
        <div class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur">
          <Sparkles :size="12" class="text-violet-300" />
          GPT-4 turbo · 한국어 최적화
        </div>

        <h1 class="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          회의는 끝났는데
          <br />
          <span class="bg-gradient-to-r from-violet-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
            정리는 아직이세요?
          </span>
        </h1>

        <p class="mt-6 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
          Noteflow 가 회의 중 말한 모든 것을 받아쓰고, 요약·태스크·결정사항으로 정리합니다.
          한국어 화자 인식·문맥 요약·자동 슬랙 공유까지 자동으로.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#pricing"
            class="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            14일 무료로 시작하기
            <ArrowRight :size="16" class="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#preview"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-zinc-200 backdrop-blur transition-colors hover:bg-white/10"
          >
            <Play :size="14" />
            제품 데모 보기 (2분)
          </a>
        </div>

        <p class="mt-6 text-xs text-zinc-500">신용카드 없이 시작 · 언제든 해지</p>
      </div>

      <!-- 가짜 transcript 미니 데모 -->
      <div class="relative">
        <div class="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/30 via-transparent to-sky-500/30 blur" aria-hidden="true" />
        <div class="relative rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl sm:p-6">
          <div class="flex items-center justify-between border-b border-white/5 pb-3">
            <div class="flex items-center gap-2">
              <span class="flex h-2.5 w-2.5 rounded-full bg-red-400" />
              <span class="flex h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
              실시간 · 2분 23초
            </div>
          </div>

          <ul class="mt-4 space-y-3 font-mono text-[13px] leading-relaxed sm:text-sm">
            <li
              v-for="(line, idx) in transcript"
              :key="idx"
              :class="[
                'transition-all duration-500',
                idx < visibleLines ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
              ]"
            >
              <span :class="['font-semibold', line.color]">{{ line.speaker }}</span>
              <span class="text-zinc-500"> · </span>
              <span class="text-zinc-300">{{ line.text }}</span>
            </li>
          </ul>

          <div class="mt-5 rounded-xl border border-white/5 bg-black/40 p-3">
            <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-300">AI 요약</p>
            <p class="mt-1 text-xs leading-relaxed text-zinc-300">
              마케팅 예산 15% 감축 결정. 신규 채용은 다음 회의로 이월.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
