<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

interface Polaroid {
  src: string;
  caption: string;
  rotate: string;
}

const polaroids: Polaroid[] = [
  {
    src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=700&q=80",
    caption: "새벽 4시, 첫 도우 반죽",
    rotate: "-rotate-3",
  },
  {
    src: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=700&q=80",
    caption: "올해 첫 딸기 입고",
    rotate: "rotate-2",
  },
  {
    src: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=700&q=80",
    caption: "구워낸 직후의 향",
    rotate: "-rotate-2",
  },
  {
    src: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=700&q=80",
    caption: "주말 단골 손님과",
    rotate: "rotate-3",
  },
];

const refs = ref<HTMLElement[]>([]);
const visible = ref<boolean[]>(polaroids.map(() => false));
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const idx = refs.value.indexOf(e.target as HTMLElement);
        if (idx >= 0 && e.isIntersecting) visible.value[idx] = true;
      }
    },
    { threshold: 0.2 },
  );
  refs.value.forEach((r) => r && observer?.observe(r));
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section class="relative overflow-hidden py-20 sm:py-28">
    <div class="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
      <!-- 왼쪽: 인터뷰 long-form -->
      <div>
        <p class="font-serif text-sm italic text-rose-500">— our story</p>
        <h2 class="mt-2 font-serif text-4xl font-light leading-[1.15] tracking-tight text-stone-900 sm:text-5xl">
          "케이크는 결국,<br />그날 하루의 이야기예요."
        </h2>

        <div class="mt-8 space-y-5 text-sm leading-[1.85] text-stone-600 sm:text-base">
          <p>
            2019년 겨울, 성수동 작은 공방에서 시작했어요. 처음엔 친구들 생일 케이크를 만들어
            나누는 일이었는데, 어느 순간부터 모르는 분들이 인스타로 주문을 부탁하시더라구요.
          </p>
          <p>
            지금도 하루에 굽는 케이크는 8~10개를 넘기지 않아요. 한 조각이 누구의 어떤
            날을 위한 것인지 떠올리며 만들 수 있는 양 — 딱 그만큼.
          </p>
          <blockquote class="border-l-2 border-rose-400 pl-5 font-serif text-lg italic leading-relaxed text-stone-800 sm:text-xl">
            "오래 머무는 손님일수록 케이크가 조금씩 그분을 닮아가요. 그게 이 일을
            계속하는 이유에요."
          </blockquote>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
            — 김유진, Maison de Sucre 오너 파티시에
          </p>
        </div>
      </div>

      <!-- 오른쪽: polaroid 그리드 -->
      <div class="relative mx-auto grid w-full max-w-md grid-cols-2 gap-5 sm:gap-6">
        <div
          v-for="(p, idx) in polaroids"
          :key="p.caption"
          :ref="(el) => { if (el) refs[idx] = el as HTMLElement; }"
          :class="[
            'group cursor-pointer rounded-sm bg-white p-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.25)] transition-all duration-700',
            visible[idx] ? `opacity-100 ${p.rotate} translate-y-0` : 'opacity-0 translate-y-4',
            idx % 2 === 1 ? 'mt-8' : '',
            'hover:!rotate-0 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.3)]',
          ]"
          :style="{ transitionDelay: `${idx * 120}ms` }"
        >
          <div class="aspect-square overflow-hidden bg-stone-100">
            <img
              :src="p.src"
              :alt="p.caption"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <p class="mt-3 px-1 text-center font-serif text-xs italic text-stone-600 sm:text-sm">
            {{ p.caption }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
