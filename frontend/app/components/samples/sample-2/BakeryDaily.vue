<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

interface DailyItem {
  badge: string;
  name: string;
  desc: string;
  remaining: string;
  image: string;
  tilt: string;
}

const items: DailyItem[] = [
  {
    badge: "오늘 굽기 · 11:30",
    name: "발효 크루아상",
    desc: "T55 밀가루 + 48시간 저온숙성. 결이 깊고 버터향이 진합니다.",
    remaining: "남은 수량 8개",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
    tilt: "-rotate-1",
  },
  {
    badge: "오늘 굽기 · 13:00",
    name: "흑임자 파운드",
    desc: "국산 흑임자와 잘 어울리는 콩가루 토핑. 차 한 잔과 함께.",
    remaining: "남은 수량 4조각",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=80",
    tilt: "rotate-1",
  },
  {
    badge: "오늘 굽기 · 15:30",
    name: "사과 타르틴",
    desc: "충주 부사와 시나몬 슈가, 부드러운 카라멜 글레이즈로 마무리.",
    remaining: "남은 수량 6개",
    image: "https://images.unsplash.com/photo-1464195244916-405fa0a82545?auto=format&fit=crop&w=900&q=80",
    tilt: "-rotate-1",
  },
];

// scroll fade-up
const cards = ref<HTMLElement[]>([]);
const visible = ref<boolean[]>(items.map(() => false));
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const idx = cards.value.indexOf(e.target as HTMLElement);
        if (idx >= 0 && e.isIntersecting) {
          visible.value[idx] = true;
        }
      }
    },
    { threshold: 0.15 },
  );
  cards.value.forEach((c) => c && observer?.observe(c));
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section class="bg-amber-50/60 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="mb-12 text-center sm:mb-16">
        <p class="font-serif text-sm italic text-rose-500">— today's bake</p>
        <h2 class="mt-2 font-serif text-4xl font-light tracking-tight text-stone-900 sm:text-5xl">
          오늘만 만나는, 그날의 빵
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
          매일 다른 빵 세 가지 — 다 팔리면 그날은 끝.
        </p>
      </div>

      <ul class="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        <li
          v-for="(it, idx) in items"
          :key="it.name"
          :ref="(el) => { if (el) cards[idx] = el as HTMLElement; }"
          :class="[
            'group relative overflow-hidden rounded-3xl bg-white shadow-[0_20px_40px_-20px_rgba(190,90,90,0.2)] transition-all duration-700',
            visible[idx] ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            `hover:${it.tilt} hover:-translate-y-1`,
          ]"
          :style="{ transitionDelay: `${idx * 120}ms` }"
        >
          <div class="aspect-[5/4] overflow-hidden bg-rose-50">
            <img
              :src="it.image"
              :alt="it.name"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div class="space-y-2 p-6 sm:p-7">
            <p class="inline-block rounded-full bg-rose-100 px-3 py-1 font-serif text-[11px] italic text-rose-600">
              {{ it.badge }}
            </p>
            <h3 class="font-serif text-2xl text-stone-900">{{ it.name }}</h3>
            <p class="text-sm leading-relaxed text-stone-600">{{ it.desc }}</p>
            <p class="pt-2 text-xs uppercase tracking-wider text-stone-400">{{ it.remaining }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
