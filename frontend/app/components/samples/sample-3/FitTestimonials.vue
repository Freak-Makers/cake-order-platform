<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ChevronLeft, ChevronRight, Quote } from "lucide-vue-next";

interface Testimonial {
  before: string;
  after: string;
  weeks: number;
  name: string;
  job: string;
  quote: string;
  avatar: string;
}

const items: Testimonial[] = [
  {
    before: "84kg / BF 28%",
    after: "72kg / BF 17%",
    weeks: 16,
    name: "정민호",
    job: "32세 · 개발자",
    quote: "야근만 하다 운동을 다시 시작했어요. 4개월 만에 거울에 비친 제 모습이 낯설 정도예요.",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
  },
  {
    before: "DL 60kg",
    after: "DL 120kg",
    weeks: 24,
    name: "한지영",
    job: "28세 · 마케터",
    quote: "처음엔 빈 봉도 무거웠는데. 지금은 같이 운동하는 친구들이 부탁할 정도가 됐어요.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  },
  {
    before: "허리 통증 매일",
    after: "통증 0일/주",
    weeks: 12,
    name: "오상훈",
    job: "41세 · 변호사",
    quote: "REHAB 프로그램이 정말 인생을 바꿨어요. 7년된 만성 통증이 거짓말처럼.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
];

const idx = ref(0);
let auto: ReturnType<typeof setInterval> | null = null;

function next() {
  idx.value = (idx.value + 1) % items.length;
}
function prev() {
  idx.value = (idx.value - 1 + items.length) % items.length;
}

onMounted(() => {
  auto = setInterval(next, 6000);
});
onBeforeUnmount(() => {
  if (auto) clearInterval(auto);
});
</script>

<template>
  <section class="relative bg-black py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="mb-12 grid gap-3 sm:mb-16 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-lime-300">— results</p>
          <h2 class="mt-3 font-black uppercase leading-none tracking-tight text-white text-5xl sm:text-6xl lg:text-7xl">
            우리는 결과로<br />말합니다
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center border border-white/20 text-white transition-colors hover:border-lime-300 hover:text-lime-300"
            aria-label="이전"
            @click="prev"
          >
            <ChevronLeft :size="18" />
          </button>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center border border-white/20 text-white transition-colors hover:border-lime-300 hover:text-lime-300"
            aria-label="다음"
            @click="next"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>

      <!-- 카드 -->
      <div class="relative overflow-hidden">
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-x-6"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="absolute inset-0 transition duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0 -translate-x-6"
          mode="out-in"
        >
          <article
            :key="idx"
            class="grid gap-8 border border-white/10 bg-white/[0.02] p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12"
          >
            <div>
              <Quote :size="40" class="text-lime-300" />
              <blockquote class="mt-5 font-black uppercase leading-tight tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl">
                "{{ items[idx]!.quote }}"
              </blockquote>
              <div class="mt-7 flex items-center gap-4">
                <img
                  :src="items[idx]!.avatar"
                  :alt="items[idx]!.name"
                  class="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p class="font-bold text-white">{{ items[idx]!.name }}</p>
                  <p class="text-xs text-zinc-400">{{ items[idx]!.job }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-col justify-center gap-4">
              <div class="grid grid-cols-3 gap-3">
                <div class="border border-white/10 p-4">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Before</p>
                  <p class="mt-1 font-black text-white">{{ items[idx]!.before }}</p>
                </div>
                <div class="border border-lime-300/40 bg-lime-300/[0.06] p-4">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-lime-300">After</p>
                  <p class="mt-1 font-black text-lime-300">{{ items[idx]!.after }}</p>
                </div>
                <div class="border border-white/10 p-4">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Weeks</p>
                  <p class="mt-1 font-black text-white">{{ items[idx]!.weeks }}w</p>
                </div>
              </div>
              <p class="text-xs text-zinc-500">
                * 모든 결과는 회원 본인의 동의 하에 공개되며 개인차가 있습니다.
              </p>
            </div>
          </article>
        </Transition>
      </div>

      <!-- progress dots -->
      <div class="mt-6 flex justify-center gap-1.5">
        <button
          v-for="(_, i) in items"
          :key="i"
          type="button"
          :class="[
            'h-1 transition-all duration-300',
            idx === i ? 'w-10 bg-lime-300' : 'w-1 bg-white/20 hover:bg-white/40',
          ]"
          :aria-label="`후기 ${i + 1}`"
          @click="idx = i"
        />
      </div>
    </div>
  </section>
</template>
