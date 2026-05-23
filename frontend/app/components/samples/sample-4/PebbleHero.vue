<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowRight, Star } from "lucide-vue-next";

// mockup 안의 3가지 화면이 3초마다 cross-fade.
const screens = ["portfolio", "spend", "goal"] as const;
type ScreenId = (typeof screens)[number];
const active = ref<ScreenId>("portfolio");
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    const idx = screens.indexOf(active.value);
    active.value = screens[(idx + 1) % screens.length]!;
  }, 3000);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <section class="relative overflow-hidden bg-white pt-28 pb-20 sm:pt-32 sm:pb-28 lg:pt-40">
    <!-- 배경 그라데이션 -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute right-[-10%] top-[-20%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-200 via-violet-200 to-transparent blur-3xl" />
      <div class="absolute left-[-15%] top-[40%] h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-sky-200 to-transparent opacity-60 blur-3xl" />
    </div>

    <div class="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
      <div>
        <div class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
          <Star :size="12" fill="currentColor" class="text-amber-400" />
          App Store · 4.9 · 12,000+ 리뷰
        </div>

        <h1 class="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          돈을 모으는 일이
          <br />
          <span class="bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-600 bg-clip-text text-transparent">
            돌처럼 단단해지도록.
          </span>
        </h1>

        <p class="mt-6 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
          국내 12개 은행·증권사를 한 화면에서. 자동 가계부, 목표 저축, ETF 자동매수까지
          돈에 관한 모든 것을 Pebble 하나로.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#download"
            class="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:gap-3"
          >
            앱 다운로드 (무료)
            <ArrowRight :size="16" class="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#features"
            class="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            기능 둘러보기
          </a>
        </div>

        <ul class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <li class="flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            금융위 등록 마이데이터 사업자
          </li>
          <li class="flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ISO 27001 인증
          </li>
        </ul>
      </div>

      <!-- iPhone mockup -->
      <div class="relative mx-auto">
        <!-- floating cards 배경 -->
        <div class="pointer-events-none absolute -left-12 top-12 hidden -rotate-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <span class="text-lg">↑</span>
            </div>
            <div>
              <p class="text-xs text-slate-500">이번 달 절약</p>
              <p class="text-sm font-bold text-slate-900">+ ₩187,200</p>
            </div>
          </div>
        </div>
        <div class="pointer-events-none absolute -right-8 bottom-16 hidden rotate-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
          <p class="text-[10px] uppercase tracking-wider text-slate-400">목표 달성</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">68<span class="text-base">%</span></p>
          <div class="mt-2 h-1 w-24 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full w-[68%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
        </div>

        <div class="relative mx-auto h-[600px] w-[290px] rounded-[44px] border-[10px] border-slate-900 bg-slate-900 shadow-[0_30px_80px_-20px_rgba(99,102,241,0.4)] sm:h-[640px] sm:w-[300px]">
          <!-- notch -->
          <div class="absolute left-1/2 top-1.5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-slate-900" />
          <!-- screen -->
          <div class="relative h-full w-full overflow-hidden rounded-[32px] bg-gradient-to-b from-indigo-50 to-white">
            <!-- status bar -->
            <div class="flex items-center justify-between px-6 pt-3 text-[10px] font-semibold text-slate-700">
              <span>9:41</span>
              <span>● ●●●</span>
            </div>

            <!-- screen 1: portfolio -->
            <Transition
              enter-active-class="transition-opacity duration-500"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="absolute inset-0 transition-opacity duration-500"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
              mode="out-in"
            >
              <div v-if="active === 'portfolio'" key="portfolio" class="absolute inset-x-0 top-10 px-5">
                <p class="text-[11px] text-slate-500">총 자산</p>
                <p class="text-2xl font-bold tracking-tight text-slate-900">₩ 42,189,000</p>
                <p class="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  + ₩ 824,300 (2.0%)
                </p>
                <div class="mt-5">
                  <svg viewBox="0 0 250 80" class="h-20 w-full">
                    <defs>
                      <linearGradient id="hChart" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.4" />
                        <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 60 L 30 55 L 60 58 L 90 40 L 120 45 L 150 30 L 180 35 L 210 20 L 250 12" fill="none" stroke="#6366f1" stroke-width="2" />
                    <path d="M0 60 L 30 55 L 60 58 L 90 40 L 120 45 L 150 30 L 180 35 L 210 20 L 250 12 L 250 80 L 0 80 Z" fill="url(#hChart)" />
                  </svg>
                </div>
                <ul class="mt-3 space-y-1.5 text-[11px]">
                  <li class="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm">
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-indigo-500" />
                      <span class="font-medium text-slate-700">국내 ETF</span>
                    </span>
                    <span class="font-bold text-slate-900">62%</span>
                  </li>
                  <li class="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm">
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-violet-500" />
                      <span class="font-medium text-slate-700">예적금</span>
                    </span>
                    <span class="font-bold text-slate-900">28%</span>
                  </li>
                  <li class="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm">
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-emerald-500" />
                      <span class="font-medium text-slate-700">현금</span>
                    </span>
                    <span class="font-bold text-slate-900">10%</span>
                  </li>
                </ul>
              </div>

              <!-- screen 2: spend -->
              <div v-else-if="active === 'spend'" key="spend" class="absolute inset-x-0 top-10 px-5">
                <p class="text-[11px] text-slate-500">이번 달 지출</p>
                <p class="text-2xl font-bold tracking-tight text-slate-900">₩ 1,247,000</p>
                <p class="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                  지난달 대비 +18%
                </p>
                <ul class="mt-4 space-y-2 text-[11px]">
                  <li class="rounded-xl bg-white p-3 shadow-sm">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-slate-700">식비</span>
                      <span class="font-bold text-slate-900">₩ 423,000</span>
                    </div>
                    <div class="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full w-[78%] rounded-full bg-indigo-500" />
                    </div>
                  </li>
                  <li class="rounded-xl bg-white p-3 shadow-sm">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-slate-700">교통</span>
                      <span class="font-bold text-slate-900">₩ 187,500</span>
                    </div>
                    <div class="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full w-[40%] rounded-full bg-violet-500" />
                    </div>
                  </li>
                  <li class="rounded-xl bg-white p-3 shadow-sm">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-slate-700">쇼핑</span>
                      <span class="font-bold text-slate-900">₩ 312,000</span>
                    </div>
                    <div class="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full w-[58%] rounded-full bg-emerald-500" />
                    </div>
                  </li>
                </ul>
              </div>

              <!-- screen 3: goal -->
              <div v-else key="goal" class="absolute inset-x-0 top-10 px-5">
                <p class="text-[11px] text-slate-500">목표 · 유럽 여행</p>
                <p class="text-2xl font-bold tracking-tight text-slate-900">₩ 3,400,000</p>
                <p class="mt-1 text-[10px] text-slate-500">목표 금액 ₩ 5,000,000</p>

                <div class="mt-5 flex justify-center">
                  <div class="relative h-32 w-32">
                    <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#goalGrad)"
                        stroke-width="8"
                        stroke-linecap="round"
                        stroke-dasharray="251.2"
                        stroke-dashoffset="80"
                      />
                      <defs>
                        <linearGradient id="goalGrad" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stop-color="#6366f1" />
                          <stop offset="100%" stop-color="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <p class="text-2xl font-bold text-slate-900">68%</p>
                      <p class="text-[9px] text-slate-500">달성</p>
                    </div>
                  </div>
                </div>

                <div class="mt-4 rounded-xl bg-white p-3 text-center shadow-sm">
                  <p class="text-[10px] text-slate-500">매월 자동 저축</p>
                  <p class="mt-0.5 text-base font-bold text-indigo-600">₩ 400,000</p>
                </div>
              </div>
            </Transition>

            <!-- bottom indicator -->
            <div class="absolute bottom-1.5 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-slate-900/30" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
