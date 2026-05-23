<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=85",
    title: "Hwadam Stay",
    subtitle: "정원 위, 새벽 안개",
  },
  {
    src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=85",
    title: "Hwadam Stay",
    subtitle: "여백이 머무는 곳",
  },
  {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85",
    title: "Hwadam Stay",
    subtitle: "고요한 사적 풀",
  },
];

const categories = ["All Suites", "Garden Villa", "Cliff House", "Hanok Annex"] as const;
type Cat = (typeof categories)[number];

const activeIdx = ref(0);
const activeCat = ref<Cat>("All Suites");
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    activeIdx.value = (activeIdx.value + 1) % slides.length;
  }, 6500);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <section class="relative isolate min-h-screen overflow-hidden bg-stone-900 text-white">
    <!-- Ken Burns 이미지 슬라이드 -->
    <div class="absolute inset-0 -z-10">
      <div
        v-for="(s, i) in slides"
        :key="s.src"
        :class="[
          'absolute inset-0 transition-opacity duration-[1800ms] ease-out',
          activeIdx === i ? 'opacity-100' : 'opacity-0',
        ]"
      >
        <img
          :src="s.src"
          :alt="s.subtitle"
          :class="['h-full w-full object-cover', activeIdx === i ? 'animate-[ken-burns_8s_ease-out_forwards]' : '']"
        />
      </div>
    </div>
    <!-- 더 짙은 vignette -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-stone-900/40 via-transparent to-stone-900/80" aria-hidden="true" />

    <!-- 상단 라벨 -->
    <div class="relative mx-auto flex max-w-7xl flex-col px-5 pt-32 sm:px-10 sm:pt-40">
      <p class="font-serif text-xs italic tracking-[0.3em] text-white/80 sm:text-sm">
        — JEJU · BOUTIQUE STAY · EST. 2018
      </p>
    </div>

    <!-- 중앙 헤드라인 -->
    <div class="relative mx-auto flex max-w-7xl flex-col items-start px-5 pt-12 sm:px-10 lg:pt-20">
      <h1 class="max-w-3xl font-serif font-light leading-[0.95] tracking-tight text-white text-6xl sm:text-8xl lg:text-[10rem]">
        Time,
        <br />
        <span class="italic">whispered</span>.
      </h1>
      <p class="mt-7 max-w-md font-serif text-base italic leading-relaxed text-white/85 sm:text-lg">
        제주 서남부 절벽 위, 단 11개의 객실.<br />
        시간을 천천히 지나가게 두는 곳.
      </p>
    </div>

    <!-- 하단 locator + 슬라이드 인디케이터 -->
    <div class="absolute inset-x-0 bottom-0">
      <div class="mx-auto max-w-7xl px-5 pb-8 sm:px-10 sm:pb-12">
        <!-- locator 탭 (가로 스크롤 가능) -->
        <div class="flex items-center justify-between border-t border-white/20 pt-6">
          <ul class="flex gap-1 overflow-x-auto text-xs sm:gap-3 sm:text-sm">
            <li v-for="c in categories" :key="c">
              <button
                type="button"
                :class="[
                  'shrink-0 rounded-full border px-3.5 py-1.5 font-serif italic tracking-tight transition-all duration-300 sm:px-5 sm:py-2',
                  activeCat === c
                    ? 'border-white bg-white text-stone-900'
                    : 'border-white/30 text-white/80 hover:border-white hover:text-white',
                ]"
                @click="activeCat = c"
              >
                {{ c }}
              </button>
            </li>
          </ul>
          <div class="hidden items-center gap-3 sm:flex">
            <span class="font-mono text-xs text-white/60">
              {{ String(activeIdx + 1).padStart(2, "0") }} / {{ String(slides.length).padStart(2, "0") }}
            </span>
            <div class="flex items-center gap-1.5">
              <button
                v-for="(_, i) in slides"
                :key="i"
                type="button"
                :class="[
                  'h-px transition-all duration-500',
                  activeIdx === i ? 'w-12 bg-white' : 'w-6 bg-white/40 hover:bg-white/70',
                ]"
                :aria-label="`슬라이드 ${i + 1}`"
                @click="activeIdx = i"
              />
            </div>
          </div>
        </div>

        <p class="mt-4 font-serif text-2xl italic text-white sm:text-3xl">
          {{ slides[activeIdx]!.subtitle }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes ken-burns {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.12) translate(-1.5%, -1.5%); }
}
</style>
