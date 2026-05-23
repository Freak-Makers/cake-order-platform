<script setup lang="ts">
import { Apple, Smartphone, Star } from "lucide-vue-next";
</script>

<template>
  <section id="download" class="relative overflow-hidden bg-slate-900 py-20 sm:py-28">
    <!-- 배경 그라데이션 -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -left-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/20 blur-3xl" />
      <div class="absolute -right-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 blur-3xl" />
    </div>

    <div class="relative mx-auto grid max-w-5xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Get the app</p>
        <h2 class="mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          1분이면 충분합니다.<br />지금 다운로드하세요.
        </h2>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
          iOS · Android 모두 무료. 가입 후 본인 인증 한 번이면 12개 금융기관 자동 연결.
        </p>

        <ul class="mt-7 flex items-center gap-3 text-xs text-slate-300">
          <li class="flex items-center gap-1.5">
            <Star :size="12" fill="currentColor" class="text-amber-300" />
            <span class="font-bold text-white">4.9</span>
            <span class="text-slate-500">App Store</span>
          </li>
          <li class="text-slate-700">·</li>
          <li class="flex items-center gap-1.5">
            <Star :size="12" fill="currentColor" class="text-amber-300" />
            <span class="font-bold text-white">4.8</span>
            <span class="text-slate-500">Google Play</span>
          </li>
        </ul>

        <div class="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="#"
            class="group inline-flex h-14 items-center gap-3 rounded-2xl bg-white px-6 text-slate-900 transition-transform hover:-translate-y-0.5"
          >
            <Apple :size="26" />
            <div class="flex flex-col items-start leading-tight">
              <span class="text-[10px] text-slate-500">Download on the</span>
              <span class="text-base font-bold">App Store</span>
            </div>
          </a>
          <a
            href="#"
            class="group inline-flex h-14 items-center gap-3 rounded-2xl bg-white px-6 text-slate-900 transition-transform hover:-translate-y-0.5"
          >
            <Smartphone :size="26" />
            <div class="flex flex-col items-start leading-tight">
              <span class="text-[10px] text-slate-500">Get it on</span>
              <span class="text-base font-bold">Google Play</span>
            </div>
          </a>
        </div>
      </div>

      <!-- QR 코드 카드 -->
      <div class="mx-auto rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur sm:p-8">
        <div class="rounded-2xl bg-white p-5">
          <!-- pseudo QR — 21x21 픽셀 패턴 -->
          <svg viewBox="0 0 21 21" class="mx-auto h-44 w-44" shape-rendering="crispEdges" aria-label="QR 코드">
            <rect width="21" height="21" fill="white" />
            <!-- corner markers -->
            <rect x="0" y="0" width="7" height="7" fill="black" />
            <rect x="1" y="1" width="5" height="5" fill="white" />
            <rect x="2" y="2" width="3" height="3" fill="black" />
            <rect x="14" y="0" width="7" height="7" fill="black" />
            <rect x="15" y="1" width="5" height="5" fill="white" />
            <rect x="16" y="2" width="3" height="3" fill="black" />
            <rect x="0" y="14" width="7" height="7" fill="black" />
            <rect x="1" y="15" width="5" height="5" fill="white" />
            <rect x="2" y="16" width="3" height="3" fill="black" />
            <!-- 데이터 패턴 (deterministic pseudo-random) -->
            <g fill="black">
              <rect v-for="(p, i) in [
                [8,1],[9,2],[10,1],[11,3],[12,1],[8,3],[10,5],[11,5],[12,3],
                [1,8],[3,9],[5,8],[2,10],[4,11],[1,12],[5,12],
                [8,8],[9,9],[10,8],[11,10],[12,9],[13,8],[14,10],[15,9],[17,8],[18,10],[20,9],
                [8,11],[10,11],[12,12],[13,11],[15,12],[17,11],[19,12],
                [9,13],[11,14],[13,13],[14,15],[16,13],[18,14],[20,13],
                [8,15],[10,15],[12,16],[14,17],[16,15],[18,17],[20,16],
                [9,18],[11,18],[13,19],[15,18],[17,19],[19,18],
                [8,20],[10,20],[12,20],[14,20],[16,20],[18,20],[20,20],
              ]"
                :key="i"
                :x="p[0]"
                :y="p[1]"
                width="1"
                height="1"
              />
            </g>
            <!-- 중앙 로고 영역 -->
            <rect x="9" y="9" width="3" height="3" fill="white" />
            <circle cx="10.5" cy="10.5" r="1" fill="#6366f1" />
          </svg>
        </div>
        <p class="mt-5 text-center text-sm font-medium text-white">카메라로 스캔하면<br />바로 설치</p>
        <p class="mt-1 text-center text-xs text-slate-400">iOS · Android 자동 인식</p>
      </div>
    </div>
  </section>
</template>
