<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

interface Cake {
  name: string;
  ko: string;
  desc: string;
  price: number;
  image: string;
}

const cakes: Cake[] = [
  {
    name: "Fraise des Bois",
    ko: "생딸기 생크림",
    desc: "국산 설향 딸기와 동물성 생크림. 매일 아침 다듬어 올립니다.",
    price: 48000,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Cassis Royale",
    ko: "까시스 무스",
    desc: "프랑스산 까시스 퓌레로 만든 진한 베리 무스 — 글루텐 프리.",
    price: 52000,
    image: "https://images.unsplash.com/photo-1567171466295-4afa63d45416?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Mille Feuille Vanille",
    ko: "바닐라 밀푀유",
    desc: "마다가스카르 바닐라빈과 100겹 페이스트리, 하루 12개 한정.",
    price: 9500,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Chocolat Noir 70%",
    ko: "다크 가나슈",
    desc: "벨기에 깔리바우트 70% 다크와 헤이즐넛 프랄린.",
    price: 46000,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Pistache & Framboise",
    ko: "피스타치오 라즈베리",
    desc: "이탈리아 시칠리아 피스타치오와 산미 강한 라즈베리의 조합.",
    price: 56000,
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Tarte au Citron",
    ko: "레몬 머랭 타르트",
    desc: "이탈리안 머랭 + 새콤한 레몬 커드, 산뜻한 디저트.",
    price: 8500,
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=1000&q=80",
  },
];

const scroller = ref<HTMLElement | null>(null);
const activeIdx = ref(0);
let autoplay: ReturnType<typeof setInterval> | null = null;
let isUserDragging = false;

// drag 지원
let dragStartX = 0;
let dragStartScroll = 0;
let isDown = false;

function onPointerDown(e: PointerEvent) {
  if (!scroller.value) return;
  isDown = true;
  isUserDragging = true;
  dragStartX = e.clientX;
  dragStartScroll = scroller.value.scrollLeft;
  scroller.value.setPointerCapture(e.pointerId);
  scroller.value.style.cursor = "grabbing";
}
function onPointerMove(e: PointerEvent) {
  if (!isDown || !scroller.value) return;
  scroller.value.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
}
function onPointerUp(e: PointerEvent) {
  if (!scroller.value) return;
  isDown = false;
  scroller.value.style.cursor = "grab";
  try {
    scroller.value.releasePointerCapture(e.pointerId);
  } catch {
    // 일부 환경에서 capture 가 풀려있을 수 있음 — 무시.
  }
  setTimeout(() => (isUserDragging = false), 1500);
}

function scrollToIdx(idx: number) {
  if (!scroller.value) return;
  const el = scroller.value;
  const card = el.children[idx] as HTMLElement | undefined;
  if (!card) return;
  el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
}

function next() {
  activeIdx.value = (activeIdx.value + 1) % cakes.length;
  scrollToIdx(activeIdx.value);
}
function prev() {
  activeIdx.value = (activeIdx.value - 1 + cakes.length) % cakes.length;
  scrollToIdx(activeIdx.value);
}

function onScroll() {
  const el = scroller.value;
  if (!el) return;
  // 가장 중앙에 가까운 카드의 인덱스 계산.
  const center = el.scrollLeft + el.clientWidth / 2;
  let best = 0;
  let bestDist = Infinity;
  Array.from(el.children).forEach((c, i) => {
    const card = c as HTMLElement;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const d = Math.abs(cardCenter - center);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  activeIdx.value = best;
}

onMounted(() => {
  autoplay = setInterval(() => {
    if (!isUserDragging) next();
  }, 4500);
});

onBeforeUnmount(() => {
  if (autoplay) clearInterval(autoplay);
});

const activeCake = computed(() => cakes[activeIdx.value]);
</script>

<template>
  <section id="signatures" class="relative py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="flex flex-col items-baseline justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p class="font-serif text-sm italic text-rose-500">— our signature</p>
          <h2 class="mt-2 font-serif text-4xl font-light tracking-tight text-stone-900 sm:text-5xl">
            사장님이 매일,<br class="sm:hidden" /> 하나씩 만들어내는 케이크
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-all hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="이전"
            @click="prev"
          >
            <ChevronLeft :size="18" />
          </button>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-all hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="다음"
            @click="next"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>

      <div class="mt-10">
        <div
          ref="scroller"
          class="bakery-scroller flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [-webkit-overflow-scrolling:touch]"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @scroll="onScroll"
        >
          <article
            v-for="(c, idx) in cakes"
            :key="c.name"
            :class="[
              'group relative w-[78%] shrink-0 snap-center overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-30px_rgba(190,90,90,0.25)] transition-transform duration-500 sm:w-[55%] lg:w-[40%]',
              activeIdx === idx ? 'scale-[1.0]' : 'scale-[0.96] opacity-90',
            ]"
            draggable="false"
          >
            <div class="relative aspect-[4/5] overflow-hidden bg-rose-50">
              <img
                :src="c.image"
                :alt="c.name"
                draggable="false"
                class="h-full w-full select-none object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <span class="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-serif text-xs italic text-stone-700 backdrop-blur">
                {{ String(idx + 1).padStart(2, "0") }} / {{ String(cakes.length).padStart(2, "0") }}
              </span>
            </div>
            <div class="space-y-2 p-6 sm:p-7">
              <p class="font-serif text-xs italic text-rose-500">{{ c.ko }}</p>
              <h3 class="font-serif text-2xl text-stone-900">{{ c.name }}</h3>
              <p class="text-sm leading-relaxed text-stone-600">{{ c.desc }}</p>
              <p class="pt-2 text-sm font-medium text-stone-800">
                ₩{{ c.price.toLocaleString() }}
              </p>
            </div>
          </article>
        </div>

        <!-- progress dots -->
        <div class="mt-6 flex justify-center gap-1.5">
          <button
            v-for="(c, idx) in cakes"
            :key="c.name + '-dot'"
            type="button"
            :class="[
              'h-1.5 rounded-full transition-all duration-300',
              activeIdx === idx ? 'w-8 bg-rose-500' : 'w-1.5 bg-stone-300 hover:bg-stone-400',
            ]"
            :aria-label="`${idx + 1}번째 케이크`"
            @click="() => { activeIdx = idx; scrollToIdx(idx); }"
          />
        </div>

        <p v-if="activeCake" class="mt-6 text-center font-serif text-sm italic text-stone-500">
          지금 보고 계신 것 — {{ activeCake.name }} · {{ activeCake.ko }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bakery-scroller {
  scrollbar-width: none;
}
.bakery-scroller::-webkit-scrollbar {
  display: none;
}
</style>
