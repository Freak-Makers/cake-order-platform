<script setup lang="ts">
import { ref } from "vue";
import { Instagram } from "lucide-vue-next";

interface Trainer {
  name: string;
  nameKo: string;
  speciality: string;
  years: string;
  image: string;
  bio: string;
}

const trainers: Trainer[] = [
  {
    name: "JAY KIM",
    nameKo: "김재성",
    speciality: "Strength · Powerlifting",
    years: "11년차",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
    bio: "전 국가대표 파워리프터 출신. 데드리프트 PR 280kg.",
  },
  {
    name: "SUMI HAN",
    nameKo: "한수미",
    speciality: "Functional · HIIT",
    years: "8년차",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80",
    bio: "ACE-CPT, 미국 NASM 인증. 직장인 다이어트 전문.",
  },
  {
    name: "TAE OH",
    nameKo: "오태형",
    speciality: "Rehab · Posture",
    years: "9년차",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
    bio: "물리치료학 석사. 척추·골반 교정 1,200건 누적.",
  },
  {
    name: "MIN PARK",
    nameKo: "박민지",
    speciality: "Mobility · Yoga Fusion",
    years: "6년차",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    bio: "전 발레 무용수. 유연성과 코어 컨디셔닝.",
  },
];

const cards = ref<HTMLElement[]>([]);

// 3D tilt — 마우스 위치에 따라 perspective rotate.
function onMove(e: MouseEvent, idx: number) {
  const el = cards.value[idx];
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
}
function onLeave(idx: number) {
  const el = cards.value[idx];
  if (!el) return;
  el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
}
</script>

<template>
  <section class="relative bg-zinc-950 py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="mb-12 flex flex-col justify-between gap-3 sm:mb-16 sm:flex-row sm:items-end">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-lime-300">— our coaches</p>
          <h2 class="mt-3 font-black uppercase leading-none tracking-tight text-white text-5xl sm:text-6xl lg:text-7xl">
            결과를 만드는<br />사람들
          </h2>
        </div>
        <p class="max-w-xs text-sm text-zinc-400">
          모든 트레이너는 평균 9년 이상의 현장 경험과 국내·외 자격증을 보유하고 있습니다.
        </p>
      </div>

      <ul class="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        <li
          v-for="(t, idx) in trainers"
          :key="t.name"
          class="group relative aspect-[3/4] cursor-pointer overflow-hidden bg-zinc-900 transition-transform duration-300 [transform-style:preserve-3d]"
          :ref="(el) => { if (el) cards[idx] = el as HTMLElement; }"
          @mousemove="(e) => onMove(e as MouseEvent, idx)"
          @mouseleave="onLeave(idx)"
        >
          <!-- 이미지: 기본 흑백 → hover 시 컬러 -->
          <img
            :src="t.image"
            :alt="t.name"
            loading="lazy"
            draggable="false"
            class="absolute inset-0 h-full w-full select-none object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
          <!-- 그라데이션 오버레이 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <!-- 기본 라벨 -->
          <div class="absolute left-4 top-4 text-[10px] font-bold uppercase tracking-wider text-lime-300">
            {{ String(idx + 1).padStart(2, "0") }}
          </div>

          <!-- 하단 정보: hover 시 슬라이드 업 -->
          <div class="absolute inset-x-0 bottom-0 p-5">
            <p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{{ t.speciality }}</p>
            <p class="mt-1 font-black uppercase tracking-tight text-white text-xl sm:text-2xl">{{ t.name }}</p>
            <p class="text-xs text-zinc-400">{{ t.nameKo }} · {{ t.years }}</p>

            <!-- hover 시 슬라이드 업 되는 추가 정보 -->
            <div class="grid max-h-0 grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-500 group-hover:max-h-40 group-hover:grid-rows-[1fr]">
              <div class="min-h-0">
                <p class="mt-3 text-xs leading-relaxed text-zinc-300">{{ t.bio }}</p>
                <a
                  href="#"
                  class="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-lime-300 hover:text-lime-200"
                >
                  <Instagram :size="12" /> @{{ t.name.toLowerCase().replace(" ", "_") }}
                </a>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
