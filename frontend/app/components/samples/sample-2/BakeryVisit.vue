<script setup lang="ts">
import { Clock, Instagram, MapPin, Phone } from "lucide-vue-next";

const hours = [
  { day: "월요일", time: "휴무" },
  { day: "화 — 금", time: "11:00 – 20:00" },
  { day: "토요일", time: "10:00 – 21:00" },
  { day: "일요일", time: "10:00 – 19:00" },
];

const instagrams = [
  "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=70",
  "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=600&q=70",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=70",
  "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=70",
  "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=600&q=70",
  "https://images.unsplash.com/photo-1551879400-111a9087cd86?auto=format&fit=crop&w=600&q=70",
];
</script>

<template>
  <section class="py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="mb-12 text-center sm:mb-16">
        <p class="font-serif text-sm italic text-rose-500">— visit us</p>
        <h2 class="mt-2 font-serif text-4xl font-light tracking-tight text-stone-900 sm:text-5xl">
          성수동의 작은 골목,<br class="sm:hidden" /> 메종 드 쉬크르
        </h2>
      </div>

      <div class="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        <!-- 약도 카드 (stylized SVG map) -->
        <div class="relative overflow-hidden rounded-3xl bg-amber-50/60">
          <svg
            viewBox="0 0 400 320"
            class="h-full w-full"
            aria-label="약도"
          >
            <!-- 길 -->
            <path d="M0 200 Q 80 180 160 200 T 320 200 T 400 220" stroke="#e7d9c4" stroke-width="36" fill="none" stroke-linecap="round" />
            <path d="M0 200 Q 80 180 160 200 T 320 200 T 400 220" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="6 8" />
            <path d="M180 0 L 180 320" stroke="#e7d9c4" stroke-width="28" />
            <path d="M180 0 L 180 320" stroke="#fff" stroke-width="2" stroke-dasharray="6 8" />

            <!-- 블록 -->
            <rect x="20" y="40" width="120" height="120" rx="12" fill="#f5e9d7" />
            <rect x="220" y="40" width="160" height="120" rx="12" fill="#f5e9d7" />
            <rect x="20" y="240" width="140" height="60" rx="12" fill="#f5e9d7" />
            <rect x="220" y="240" width="160" height="60" rx="12" fill="#f5e9d7" />

            <!-- 나무 -->
            <circle cx="60" cy="240" r="14" fill="#c7d5b6" />
            <circle cx="100" cy="245" r="10" fill="#c7d5b6" />
            <circle cx="280" cy="35" r="12" fill="#c7d5b6" />
            <circle cx="340" cy="245" r="14" fill="#c7d5b6" />

            <!-- 마커 -->
            <g transform="translate(155 175)">
              <circle r="22" fill="#f43f5e" opacity="0.15" class="animate-ping origin-center" />
              <circle r="14" fill="#f43f5e" />
              <text x="0" y="4" text-anchor="middle" font-size="14" font-family="serif" font-style="italic" fill="white">M</text>
            </g>
            <text x="180" y="155" text-anchor="middle" font-size="11" font-family="serif" font-style="italic" fill="#78716c">
              Maison de Sucre
            </text>
          </svg>

          <div class="absolute inset-x-5 bottom-5 rounded-2xl bg-white/90 p-4 backdrop-blur sm:inset-x-7 sm:bottom-7 sm:p-5">
            <p class="font-serif text-base text-stone-900">서울 성동구 성수이로 14길</p>
            <p class="mt-0.5 text-xs text-stone-500">2호선 성수역 3번 출구 도보 7분</p>
            <div class="mt-3 flex gap-2">
              <a href="#" class="inline-flex h-9 items-center rounded-full bg-stone-900 px-4 text-xs font-medium text-white hover:bg-stone-800">
                <MapPin :size="12" class="mr-1.5" />
                길찾기
              </a>
              <a href="#" class="inline-flex h-9 items-center rounded-full border border-stone-200 px-4 text-xs font-medium text-stone-700 hover:border-rose-300">
                <Phone :size="12" class="mr-1.5" />
                02-1234-5678
              </a>
            </div>
          </div>
        </div>

        <!-- 운영시간 카드 -->
        <div class="rounded-3xl bg-rose-50/60 p-7 sm:p-8">
          <div class="flex items-center gap-2 text-rose-600">
            <Clock :size="16" />
            <span class="text-xs font-medium uppercase tracking-[0.2em]">opening hours</span>
          </div>
          <h3 class="mt-3 font-serif text-3xl text-stone-900">운영 시간</h3>

          <dl class="mt-6 divide-y divide-rose-100/80">
            <div v-for="h in hours" :key="h.day" class="flex items-center justify-between py-3">
              <dt class="font-serif text-base text-stone-700">{{ h.day }}</dt>
              <dd :class="['text-sm', h.time === '휴무' ? 'text-rose-500' : 'text-stone-800']">
                {{ h.time }}
              </dd>
            </div>
          </dl>

          <p class="mt-6 rounded-2xl bg-white/70 p-4 font-serif text-sm italic leading-relaxed text-stone-600">
            "재료가 다 떨어진 날엔 평소보다 일찍 닫기도 해요. 멀리서 오실 땐 인스타로
            한 번만 더 확인 부탁드려요."
          </p>
        </div>
      </div>

      <!-- 인스타그램 피드 -->
      <div class="mt-16">
        <div class="flex items-end justify-between">
          <div>
            <p class="font-serif text-sm italic text-rose-500">— @maison_de_sucre</p>
            <h3 class="mt-1 font-serif text-2xl text-stone-900 sm:text-3xl">하루의 한 조각</h3>
          </div>
          <a href="#" class="hidden text-xs font-medium uppercase tracking-wider text-stone-500 hover:text-rose-600 sm:inline-flex sm:items-center sm:gap-1.5">
            <Instagram :size="14" /> 인스타그램에서 더 보기
          </a>
        </div>
        <ul class="mt-6 grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
          <li v-for="(src, i) in instagrams" :key="src">
            <a href="#" class="group relative block aspect-square overflow-hidden rounded-sm sm:rounded-md">
              <img :src="src" :alt="`피드 ${i + 1}`" loading="lazy" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div class="absolute inset-0 flex items-center justify-center bg-rose-900/0 transition-colors group-hover:bg-rose-900/40">
                <Instagram :size="20" class="text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
