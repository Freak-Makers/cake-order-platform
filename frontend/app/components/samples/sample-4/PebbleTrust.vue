<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

interface Stat {
  prefix?: string;
  suffix?: string;
  value: number;
  label: string;
  format?: "number" | "decimal";
}

const stats: Stat[] = [
  { value: 480000, suffix: "+", label: "누적 가입자" },
  { prefix: "₩", value: 12, suffix: "조+", label: "관리 자산" },
  { value: 4.9, suffix: "", label: "App Store 평점", format: "decimal" },
  { value: 99.97, suffix: "%", label: "서비스 가동률", format: "decimal" },
];

const sectionRef = ref<HTMLElement | null>(null);
const displayed = ref<number[]>(stats.map(() => 0));
const started = ref(false);

let observer: IntersectionObserver | null = null;
let raf: number | null = null;

function animate() {
  const startTs = performance.now();
  const duration = 1600;
  const step = (now: number) => {
    const t = Math.min(1, (now - startTs) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    displayed.value = stats.map((s) => s.value * eased);
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

function fmt(stat: Stat, val: number): string {
  if (stat.format === "decimal") return val.toFixed(stat.value < 10 ? 1 : 2);
  return Math.round(val).toLocaleString();
}
</script>

<template>
  <section ref="sectionRef" class="border-y border-slate-200 bg-white py-14 sm:py-16">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <ul class="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
        <li v-for="(s, i) in stats" :key="s.label" class="text-center">
          <p class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text tabular-nums text-transparent">
              <span v-if="s.prefix">{{ s.prefix }}</span>{{ fmt(s, displayed[i] ?? 0) }}<span v-if="s.suffix">{{ s.suffix }}</span>
            </span>
          </p>
          <p class="mt-2 text-xs font-medium uppercase tracking-wider text-slate-500 sm:text-sm">
            {{ s.label }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
