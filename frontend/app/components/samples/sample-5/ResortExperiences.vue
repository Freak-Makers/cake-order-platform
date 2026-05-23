<script setup lang="ts">
import { ref } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const experiences = [
  {
    label: "Spa",
    title: "Forest Bathing Ritual",
    desc: "편백 숲 한가운데 노천 욕장. 90분 단독 사용 + 차담회.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    duration: "90 min",
    from: "₩ 180,000",
  },
  {
    label: "Dining",
    title: "Omakase Counter",
    desc: "10석. 제주 해녀가 그날 잡은 재료로만 구성하는 코스.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85",
    duration: "150 min",
    from: "₩ 250,000",
  },
  {
    label: "Wellness",
    title: "Sunrise Yoga",
    desc: "일출 시간에 절벽 위 데크에서. 비기너 환영.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=85",
    duration: "60 min",
    from: "Complimentary",
  },
  {
    label: "Adventure",
    title: "Private Sail",
    desc: "두 시간의 사적 요트. 와인 한 병이 함께 실립니다.",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=85",
    duration: "120 min",
    from: "₩ 480,000",
  },
  {
    label: "Local",
    title: "Tea Farm Walk",
    desc: "조용한 차밭을 걷고, 차밭 주인과 함께 잎을 따고 우려냅니다.",
    image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?auto=format&fit=crop&w=1200&q=85",
    duration: "180 min",
    from: "₩ 120,000",
  },
];

const scroller = ref<HTMLElement | null>(null);

function scrollBy(dir: 1 | -1) {
  const el = scroller.value;
  if (!el) return;
  const w = el.clientWidth * 0.7;
  el.scrollBy({ left: dir * w, behavior: "smooth" });
}
</script>

<template>
  <section class="relative bg-white py-24 sm:py-32 lg:py-40">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col gap-6 px-5 sm:px-10 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="font-serif text-xs italic tracking-[0.25em] text-stone-500">— experiences</p>
          <h2 class="mt-4 font-serif font-light leading-[1.05] tracking-tight text-stone-900 text-5xl sm:text-6xl lg:text-7xl">
            머무는 사이,<br />
            <span class="italic">하루를 채우는</span> 일들
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-12 w-12 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-all hover:border-stone-900 hover:bg-stone-900 hover:text-white"
            aria-label="이전"
            @click="scrollBy(-1)"
          >
            <ChevronLeft :size="20" />
          </button>
          <button
            type="button"
            class="flex h-12 w-12 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-all hover:border-stone-900 hover:bg-stone-900 hover:text-white"
            aria-label="다음"
            @click="scrollBy(1)"
          >
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>

      <div
        ref="scroller"
        class="resort-scroller mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:gap-6 sm:px-10"
      >
        <article
          v-for="(e, idx) in experiences"
          :key="e.title"
          class="group relative w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[34%]"
        >
          <div class="relative aspect-[3/4] overflow-hidden bg-stone-100">
            <img
              :src="e.image"
              :alt="e.title"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
            />
            <span class="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/90">
              {{ String(idx + 1).padStart(2, "0") }}
            </span>
            <span class="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 font-serif text-[10px] italic text-stone-700 backdrop-blur">
              {{ e.label }}
            </span>
          </div>
          <div class="mt-5">
            <h3 class="font-serif text-2xl text-stone-900 sm:text-3xl">{{ e.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-stone-600">{{ e.desc }}</p>
            <div class="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 text-xs">
              <span class="text-stone-500">{{ e.duration }}</span>
              <span class="font-medium text-stone-900">{{ e.from }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.resort-scroller {
  scrollbar-width: none;
}
.resort-scroller::-webkit-scrollbar {
  display: none;
}
</style>
