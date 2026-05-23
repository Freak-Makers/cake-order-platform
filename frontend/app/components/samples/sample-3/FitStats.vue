<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  sub: string;
}

const stats: Stat[] = [
  { value: 2400, suffix: "+", label: "ACTIVE MEMBERS", sub: "월 정기 회원" },
  { value: 18000, suffix: "kg", label: "TOTAL LOSS", sub: "누적 회원 감량량" },
  { value: 96, suffix: "%", label: "RETENTION", sub: "3개월 이상 재등록" },
  { value: 11, suffix: "년", label: "SINCE 2014", sub: "한 자리에서" },
];

const displayed = ref<number[]>(stats.map(() => 0));
const sectionRef = ref<HTMLElement | null>(null);
const started = ref(false);
let observer: IntersectionObserver | null = null;
let raf: number | null = null;

function animate() {
  const startTs = performance.now();
  const duration = 1800;
  const targets = stats.map((s) => s.value);

  const step = (now: number) => {
    const t = Math.min(1, (now - startTs) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    displayed.value = targets.map((v) => Math.round(v * eased));
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

onMounted(() => {
  if (!sectionRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !started.value) {
          started.value = true;
          animate();
          observer?.disconnect();
        }
      }
    },
    { threshold: 0.3 },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  if (raf) cancelAnimationFrame(raf);
});

function format(n: number): string {
  return n.toLocaleString();
}
</script>

<template>
  <section
    ref="sectionRef"
    class="relative overflow-hidden border-y border-lime-300/20 bg-lime-300 py-16 sm:py-20"
  >
    <!-- 빅 배경 텍스트 -->
    <div
      class="pointer-events-none absolute inset-x-0 top-1/2 -z-0 -translate-y-1/2 select-none whitespace-nowrap text-center font-black uppercase tracking-tighter text-black/[0.06] text-[20vw] leading-none"
      aria-hidden="true"
    >
      IRONHAUS
    </div>

    <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
      <ul class="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        <li v-for="(s, idx) in stats" :key="s.label" class="border-l-2 border-black/30 pl-4 sm:pl-5">
          <div class="font-black tabular-nums tracking-tight text-black text-5xl sm:text-6xl lg:text-7xl">
            {{ format(displayed[idx] ?? 0) }}<span class="text-3xl sm:text-4xl">{{ s.suffix }}</span>
          </div>
          <p class="mt-2 text-[11px] font-black uppercase tracking-[0.2em] text-black">{{ s.label }}</p>
          <p class="text-xs text-black/60">{{ s.sub }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
