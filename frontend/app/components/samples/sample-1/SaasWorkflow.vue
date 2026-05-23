<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Cpu, Mic, Send, Sparkles } from "lucide-vue-next";

const steps = [
  { icon: Mic, label: "회의 녹음", desc: "Zoom · Meet · 오프라인 마이크 자동 캡처" },
  { icon: Cpu, label: "AI 처리", desc: "화자 인식 + GPT-4 요약 평균 12초" },
  { icon: Sparkles, label: "구조화", desc: "결정·액션·논의 카테고리 자동 분류" },
  { icon: Send, label: "자동 공유", desc: "Slack · Notion · Jira 로 즉시 전달" },
];

const sectionRef = ref<HTMLElement | null>(null);
const drawn = ref(false);
let observer: IntersectionObserver | null = null;

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
  <section ref="sectionRef" class="border-y border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Workflow</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          녹음 → 정리 → 공유, 평균 12초
        </h2>
      </div>

      <div class="relative mt-16">
        <!-- SVG 연결선 — 데스크탑에서만 표시. stroke-dasharray 로 draw. -->
        <svg
          class="pointer-events-none absolute inset-x-0 top-1/2 -z-10 hidden h-24 w-full -translate-y-1/2 lg:block"
          viewBox="0 0 800 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="wfLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.2" />
              <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M40 40 C 200 0, 280 80, 400 40 S 600 0, 760 40"
            fill="none"
            stroke="url(#wfLine)"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-dasharray="1200"
            :stroke-dashoffset="drawn ? 0 : 1200"
            class="transition-[stroke-dashoffset] duration-[1800ms] ease-out"
          />
        </svg>

        <ol class="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <li
            v-for="(s, idx) in steps"
            :key="s.label"
            :class="[
              'transition-all duration-700',
              drawn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
            ]"
            :style="{ transitionDelay: drawn ? `${idx * 150}ms` : '0ms' }"
          >
            <div class="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur sm:p-6">
              <div class="flex items-center justify-between">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <component :is="s.icon" :size="18" />
                </div>
                <span class="font-mono text-[11px] text-zinc-500">0{{ idx + 1 }}</span>
              </div>
              <h3 class="mt-4 text-base font-semibold text-zinc-100">{{ s.label }}</h3>
              <p class="mt-1 text-sm leading-relaxed text-zinc-400">{{ s.desc }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
