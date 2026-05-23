<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ArrowUpRight } from "lucide-vue-next";

const suites = [
  {
    no: "01",
    name: "Garden Villa",
    nameKo: "정원이 있는 별채",
    size: "112㎡",
    occupancy: "2 guests",
    desc:
      "사적인 정원과 노천탕이 딸린 단층 별채. 새벽엔 안개가, 저녁엔 풀벌레가 함께합니다.",
    from: "₩ 680,000",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85",
    side: "left",
  },
  {
    no: "02",
    name: "Cliff House",
    nameKo: "절벽 위 독채",
    size: "168㎡",
    occupancy: "4 guests",
    desc:
      "방 안에서 수평선이 끝나지 않는 곳. 무한 풀 (Infinity pool) 과 와이드 테라스.",
    from: "₩ 1,240,000",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=85",
    side: "right",
  },
  {
    no: "03",
    name: "Hanok Annex",
    nameKo: "한옥 부속채",
    size: "88㎡",
    occupancy: "2 guests",
    desc:
      "처마 깊은 작은 한옥. 마루에 앉아 차 한 잔, 그 시간 자체가 객실입니다.",
    from: "₩ 520,000",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=85",
    side: "left",
  },
];

// 마운트 직후 다음 프레임에서 fade-in 시작 — 스크롤 위치와 무관하게 항상 표시되도록.
const loaded = ref(false);
onMounted(() => {
  requestAnimationFrame(() => {
    loaded.value = true;
  });
});
</script>

<template>
  <section class="relative bg-stone-50 py-24 sm:py-32 lg:py-40">
    <div class="mx-auto max-w-7xl px-5 sm:px-10">
      <div class="max-w-2xl">
        <p class="font-serif text-xs italic tracking-[0.25em] text-stone-500">— suites & villas</p>
        <h2 class="mt-4 font-serif font-light leading-[1.05] tracking-tight text-stone-900 text-5xl sm:text-6xl lg:text-7xl">
          단 11개의<br />
          <span class="italic">독립된 공간</span>
        </h2>
      </div>

      <div class="mt-20 space-y-32 sm:mt-28 sm:space-y-44">
        <article
          v-for="(s, idx) in suites"
          :key="s.no"
          :class="[
            'relative grid items-center gap-y-6 transition-all duration-1000 ease-out lg:grid-cols-12 lg:gap-x-6',
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          ]"
          :style="{ transitionDelay: `${idx * 150}ms` }"
        >
          <!-- 이미지 -->
          <div
            :class="[
              'relative aspect-[5/6] overflow-hidden lg:aspect-[4/5]',
              s.side === 'left' ? 'lg:col-span-7' : 'lg:col-span-7 lg:col-start-6',
            ]"
          >
            <img
              :src="s.image"
              :alt="s.name"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-105"
            />
            <span class="absolute left-5 top-5 font-mono text-xs text-white/90 sm:text-sm">{{ s.no }} / 03</span>
          </div>

          <!-- 텍스트 카드 — 이미지와 겹치도록 -->
          <div
            :class="[
              'relative bg-white p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.2)] sm:p-9 lg:p-10',
              s.side === 'left'
                ? 'lg:col-span-5 lg:col-start-7 lg:row-start-1 lg:-ml-16 lg:mt-32'
                : 'lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:-mr-16 lg:mt-32 lg:text-right',
            ]"
          >
            <p class="font-serif text-xs italic tracking-wider text-stone-500">{{ s.nameKo }}</p>
            <h3 class="mt-1 font-serif font-light tracking-tight text-stone-900 text-3xl sm:text-4xl">
              {{ s.name }}
            </h3>
            <dl
              :class="[
                'mt-6 flex gap-6 text-xs uppercase tracking-wider text-stone-500',
                s.side === 'right' ? 'lg:justify-end' : '',
              ]"
            >
              <div>
                <dt class="text-stone-400">Size</dt>
                <dd class="mt-1 font-medium text-stone-800">{{ s.size }}</dd>
              </div>
              <div>
                <dt class="text-stone-400">Up to</dt>
                <dd class="mt-1 font-medium text-stone-800">{{ s.occupancy }}</dd>
              </div>
              <div>
                <dt class="text-stone-400">From</dt>
                <dd class="mt-1 font-medium text-stone-800">{{ s.from }}</dd>
              </div>
            </dl>
            <p class="mt-6 text-sm leading-relaxed text-stone-600">{{ s.desc }}</p>
            <a
              href="#"
              :class="[
                'group mt-7 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-900 transition-colors hover:text-stone-500',
                s.side === 'right' ? 'lg:flex-row-reverse' : '',
              ]"
            >
              View suite
              <ArrowUpRight :size="14" class="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
