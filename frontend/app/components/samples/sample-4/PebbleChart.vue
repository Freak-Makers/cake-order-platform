<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

// 라인 차트 — 가상의 1년 포트폴리오 가치. scroll 진입 시 stroke-dasharray 로 draw.
const sectionRef = ref<HTMLElement | null>(null);
const drawn = ref(false);
let observer: IntersectionObserver | null = null;

const points = [
  10, 14, 12, 18, 22, 19, 28, 32, 30, 38, 42, 50,
];
const labels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

const W = 800;
const H = 320;
const PAD_L = 40;
const PAD_R = 20;
const PAD_T = 30;
const PAD_B = 40;
const innerW = W - PAD_L - PAD_R;
const innerH = H - PAD_T - PAD_B;
const max = Math.max(...points) * 1.15;

const linePath = computed(() => {
  return points
    .map((p, i) => {
      const x = PAD_L + (i * innerW) / (points.length - 1);
      const y = PAD_T + innerH - (p / max) * innerH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
});

const fillPath = computed(() => {
  const start = `${PAD_L} ${PAD_T + innerH}`;
  const mid = points
    .map((p, i) => {
      const x = PAD_L + (i * innerW) / (points.length - 1);
      const y = PAD_T + innerH - (p / max) * innerH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const end = `L ${PAD_L + innerW} ${PAD_T + innerH} L ${start} Z`;
  return mid + end;
});

const dots = computed(() =>
  points.map((p, i) => ({
    x: PAD_L + (i * innerW) / (points.length - 1),
    y: PAD_T + innerH - (p / max) * innerH,
  })),
);

onMounted(() => {
  if (!sectionRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          drawn.value = true;
          observer?.disconnect();
        }
      }
    },
    { threshold: 0.3 },
  );
  observer.observe(sectionRef.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section ref="sectionRef" class="relative bg-white py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="grid items-end gap-3 sm:grid-cols-[1fr_auto] sm:gap-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Performance</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            실제 사용자 1년 평균 수익
          </h2>
        </div>
        <div class="flex gap-6">
          <div>
            <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">최근 12개월</p>
            <p class="mt-1 flex items-baseline gap-1 text-3xl font-bold text-slate-900">
              <span>+ 11.2</span><span class="text-xl text-emerald-500">%</span>
            </p>
          </div>
          <div>
            <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">KOSPI 평균</p>
            <p class="mt-1 flex items-baseline gap-1 text-3xl font-bold text-slate-400">
              <span>+ 6.4</span><span class="text-xl">%</span>
            </p>
          </div>
        </div>
      </div>

      <div class="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6">
        <svg
          :viewBox="`0 0 ${W} ${H}`"
          class="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-label="포트폴리오 추이"
        >
          <defs>
            <linearGradient id="pebbleArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="pebbleLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
          </defs>

          <!-- y axis grid -->
          <g class="text-[11px]" font-family="inherit">
            <g v-for="(v, i) in [0, 0.25, 0.5, 0.75, 1]" :key="i">
              <line
                :x1="PAD_L"
                :x2="W - PAD_R"
                :y1="PAD_T + innerH * (1 - v)"
                :y2="PAD_T + innerH * (1 - v)"
                stroke="#e2e8f0"
                stroke-dasharray="3 4"
              />
              <text
                :x="PAD_L - 8"
                :y="PAD_T + innerH * (1 - v) + 4"
                text-anchor="end"
                fill="#94a3b8"
              >
                {{ Math.round(max * v) }}%
              </text>
            </g>
          </g>

          <!-- area fill (단순 fade in) -->
          <path
            :d="fillPath"
            fill="url(#pebbleArea)"
            :class="[
              'transition-opacity duration-[1500ms] ease-out',
              drawn ? 'opacity-100' : 'opacity-0',
            ]"
            :style="{ transitionDelay: drawn ? '900ms' : '0ms' }"
          />

          <!-- line draw via stroke-dasharray -->
          <path
            :d="linePath"
            fill="none"
            stroke="url(#pebbleLine)"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="2000"
            :stroke-dashoffset="drawn ? 0 : 2000"
            class="transition-[stroke-dashoffset] duration-[1800ms] ease-out"
          />

          <!-- dots -->
          <g>
            <circle
              v-for="(d, i) in dots"
              :key="i"
              :cx="d.x"
              :cy="d.y"
              :r="i === dots.length - 1 ? 6 : 3"
              :fill="i === dots.length - 1 ? '#a855f7' : '#ffffff'"
              :stroke="i === dots.length - 1 ? '#fff' : '#6366f1'"
              stroke-width="2"
              :class="['transition-opacity duration-300', drawn ? 'opacity-100' : 'opacity-0']"
              :style="{ transitionDelay: drawn ? `${1400 + i * 60}ms` : '0ms' }"
            />
          </g>

          <!-- x axis labels -->
          <g class="text-[11px]" font-family="inherit">
            <text
              v-for="(l, i) in labels"
              :key="l"
              :x="PAD_L + (i * innerW) / (points.length - 1)"
              :y="H - 14"
              text-anchor="middle"
              fill="#94a3b8"
            >
              {{ l }}
            </text>
          </g>
        </svg>
      </div>

      <p class="mt-4 text-center text-xs text-slate-500">
        * 2023.11 — 2024.10 기준 Pebble 사용자 평균 (자산가중평균) · 과거 수익이 미래를 보장하지 않습니다.
      </p>
    </div>
  </section>
</template>
