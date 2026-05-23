<script setup lang="ts">
import { onMounted, ref } from "vue";

interface Photo {
  src: string;
  caption: string;
  span: string; // tailwind aspect 클래스
}

const photos: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85",
    caption: "사적인 노천탕",
    span: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=85",
    caption: "절벽 위 무한 풀",
    span: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1519160558534-579f5106e43f?auto=format&fit=crop&w=1200&q=85",
    caption: "라이브러리 라운지",
    span: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=1200&q=85",
    caption: "오마카세 카운터",
    span: "aspect-square",
  },
  {
    src: "https://images.unsplash.com/photo-1542353436-312f0e1f67ff?auto=format&fit=crop&w=1200&q=85",
    caption: "정원의 차담회",
    span: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1200&q=85",
    caption: "조식 — 죽순과 약초죽",
    span: "aspect-[4/3]",
  },
];

// 마운트 직후 다음 프레임에서 fade-in 시작 — 스크롤 위치와 무관하게 항상 표시되도록.
// (예전 IntersectionObserver 방식은 masonry 두 번째 row 가 viewport 밖이면 영영 opacity-0 으로 남는 문제가 있었음)
const loaded = ref(false);
onMounted(() => {
  requestAnimationFrame(() => {
    loaded.value = true;
  });
});
</script>

<template>
  <section class="relative bg-stone-100 py-24 sm:py-32 lg:py-40">
    <div class="mx-auto max-w-7xl px-5 sm:px-10">
      <div class="grid items-end gap-6 sm:grid-cols-[1fr_auto]">
        <div class="max-w-2xl">
          <p class="font-serif text-xs italic tracking-[0.25em] text-stone-500">— gallery</p>
          <h2 class="mt-4 font-serif font-light leading-[1.05] tracking-tight text-stone-900 text-5xl sm:text-6xl lg:text-7xl">
            <span class="italic">스쳐 지나가는</span><br />순간들
          </h2>
        </div>
        <a
          href="#"
          class="hidden text-xs font-medium uppercase tracking-[0.2em] text-stone-700 hover:text-stone-400 sm:inline-block"
        >
          전체 보기 →
        </a>
      </div>

      <!-- masonry — columns 사용 -->
      <div class="mt-14 columns-2 gap-3 sm:gap-5 lg:columns-3">
        <figure
          v-for="(p, idx) in photos"
          :key="p.src"
          :class="[
            'group relative mb-3 break-inside-avoid overflow-hidden bg-stone-200 transition-all duration-1000 sm:mb-5',
            p.span,
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          ]"
          :style="{ transitionDelay: `${(idx % 3) * 120}ms` }"
        >
          <img
            :src="p.src"
            :alt="p.caption"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
          />
          <!-- caption slide-in -->
          <figcaption
            class="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent p-5 transition-transform duration-500 group-hover:translate-y-0"
          >
            <p class="font-serif text-lg italic text-white">{{ p.caption }}</p>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
