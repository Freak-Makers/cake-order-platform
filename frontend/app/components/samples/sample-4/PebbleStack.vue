<script setup lang="ts">
import { Layers, PiggyBank, Repeat, Wallet } from "lucide-vue-next";

const features = [
  {
    icon: Wallet,
    eyebrow: "01 — 통합",
    title: "12개 금융기관, 한 화면에",
    desc: "은행·증권·카드·연금까지. 카드사 앱 12개를 열 필요가 없습니다.",
    accent: "from-indigo-500 to-blue-600",
    visual: "accounts",
  },
  {
    icon: PiggyBank,
    eyebrow: "02 — 자동 저축",
    title: "잔돈은 알아서 모아둘게요",
    desc: "결제할 때마다 100원 단위 올림. 의식하지 않아도 1년에 평균 ₩384,000.",
    accent: "from-violet-500 to-fuchsia-500",
    visual: "save",
  },
  {
    icon: Repeat,
    eyebrow: "03 — 자동 매수",
    title: "월급날, 알아서 ETF 분할 매수",
    desc: "코스피200·S&P500 등 11개 인덱스. 주문 시간·금액·종목 자유 설정.",
    accent: "from-blue-600 to-cyan-500",
    visual: "buy",
  },
  {
    icon: Layers,
    eyebrow: "04 — 인사이트",
    title: "이번 달, 어디에 가장 많이 썼는지",
    desc: "AI 가 분석한 카테고리별 지출과 이상치 알림. 매주 일요일 리포트 자동 발송.",
    accent: "from-fuchsia-500 to-indigo-600",
    visual: "insight",
  },
];
</script>

<template>
  <section id="features" class="relative bg-slate-50 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Features</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          돈의 흐름을 한눈에,<br />결정은 더 빠르게
        </h2>
      </div>

      <!-- sticky stack 카드들 — 위로 스크롤하면 위쪽 카드가 sticky 로 고정되고 그 위로 다음 카드가 올라옴. -->
      <div class="relative mt-16 space-y-6">
        <div
          v-for="(f, idx) in features"
          :key="f.title"
          class="sticky overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_30px_60px_-30px_rgba(99,102,241,0.25)]"
          :style="{ top: `${80 + idx * 24}px` }"
        >
          <div class="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
            <div class="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
              <span class="font-mono text-xs uppercase tracking-wider text-slate-400">{{ f.eyebrow }}</span>
              <div
                :class="[
                  'mt-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                  f.accent,
                ]"
              >
                <component :is="f.icon" :size="22" />
              </div>
              <h3 class="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {{ f.title }}
              </h3>
              <p class="mt-3 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">{{ f.desc }}</p>
            </div>

            <!-- visual -->
            <div :class="['relative flex items-center justify-center overflow-hidden bg-gradient-to-br p-8 sm:p-10', f.accent]">
              <!-- accounts visual -->
              <ul v-if="f.visual === 'accounts'" class="grid w-full max-w-sm grid-cols-3 gap-2">
                <li
                  v-for="(b, i) in ['KB', '신한', '우리', '하나', 'NH', '카뱅', '토스', 'IBK', 'SC']"
                  :key="b"
                  :class="[
                    'flex aspect-square items-center justify-center rounded-2xl bg-white/95 text-xs font-bold text-slate-700 shadow-md transition-transform',
                    i % 3 === 1 ? 'translate-y-3' : '',
                  ]"
                >
                  {{ b }}
                </li>
              </ul>

              <!-- save visual -->
              <div v-else-if="f.visual === 'save'" class="w-full max-w-sm space-y-3 rounded-2xl bg-white/95 p-5 shadow-xl">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">스타벅스</span>
                  <span class="font-bold text-slate-900">₩ 4,800 → ₩ 5,000</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">올리브영</span>
                  <span class="font-bold text-slate-900">₩ 17,300 → ₩ 17,400</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">CU</span>
                  <span class="font-bold text-slate-900">₩ 3,250 → ₩ 3,300</span>
                </div>
                <div class="rounded-xl bg-emerald-50 p-3 text-center">
                  <p class="text-[10px] uppercase tracking-wider text-emerald-600">이번 주 저축</p>
                  <p class="mt-1 text-xl font-bold text-emerald-700">₩ 4,250</p>
                </div>
              </div>

              <!-- buy visual -->
              <div v-else-if="f.visual === 'buy'" class="w-full max-w-sm space-y-3 rounded-2xl bg-white/95 p-5 shadow-xl">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span class="text-xs font-medium text-slate-500">매월 25일 09:00</span>
                  <span class="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700">자동</span>
                </div>
                <ul class="space-y-2 text-xs">
                  <li class="flex items-center justify-between"><span class="text-slate-600">KODEX 200</span><span class="font-bold text-slate-900">₩ 100,000</span></li>
                  <li class="flex items-center justify-between"><span class="text-slate-600">TIGER S&P500</span><span class="font-bold text-slate-900">₩ 150,000</span></li>
                  <li class="flex items-center justify-between"><span class="text-slate-600">QQQ</span><span class="font-bold text-slate-900">₩ 50,000</span></li>
                </ul>
                <div class="rounded-xl bg-slate-50 p-3 text-center">
                  <p class="text-[10px] uppercase tracking-wider text-slate-500">월 자동 매수</p>
                  <p class="mt-1 text-xl font-bold text-slate-900">₩ 300,000</p>
                </div>
              </div>

              <!-- insight visual -->
              <div v-else class="w-full max-w-sm rounded-2xl bg-white/95 p-5 shadow-xl">
                <p class="text-[10px] uppercase tracking-wider text-slate-500">주간 리포트</p>
                <p class="mt-1 text-lg font-bold text-slate-900">10월 4주차</p>
                <svg viewBox="0 0 260 100" class="mt-3 h-24 w-full">
                  <g v-for="(h, i) in [40, 60, 30, 75, 45, 90, 55]" :key="i">
                    <rect
                      :x="i * 36 + 8"
                      :y="100 - h"
                      width="22"
                      :height="h"
                      rx="4"
                      :fill="i === 5 ? 'url(#peak)' : '#e0e7ff'"
                    />
                  </g>
                  <defs>
                    <linearGradient id="peak" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#f43f5e" />
                      <stop offset="100%" stop-color="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <p class="mt-2 rounded-lg bg-rose-50 p-2 text-[10px] text-rose-700">
                  토요일에 지출이 평균보다 +52%. 이상치 감지됨.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- spacer 로 마지막 카드 한 번 더 보이는 여백 확보 -->
        <div class="h-20" />
      </div>
    </div>
  </section>
</template>
