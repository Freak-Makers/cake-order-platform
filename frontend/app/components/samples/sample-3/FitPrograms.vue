<script setup lang="ts">
import { computed, ref } from "vue";
import { Dumbbell, Flame, HeartPulse } from "lucide-vue-next";

interface Program {
  id: string;
  icon: typeof Dumbbell;
  label: string;
  tagline: string;
  desc: string;
  schedule: string[];
  image: string;
  highlights: { label: string; value: string }[];
}

const programs: Program[] = [
  {
    id: "weight",
    icon: Dumbbell,
    label: "STRENGTH",
    tagline: "근육은 거짓말하지 않는다",
    desc:
      "체형 분석부터 1:1 자세 교정, PR 갱신까지 — 가장 빠르게 변하는 사람들이 선택한 클래식 프로그램.",
    schedule: ["월·수·금 06:00", "월·수·금 19:00", "화·목 21:00"],
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1400&q=80",
    highlights: [
      { label: "주 권장 횟수", value: "3회" },
      { label: "1세션", value: "60분" },
      { label: "그룹 인원", value: "1:1" },
    ],
  },
  {
    id: "hiit",
    icon: Flame,
    label: "HIIT",
    tagline: "30분, 더 이상 변명은 없다",
    desc:
      "유산소·근력·코어를 한 세션에. 짧고 강하게 — 효율을 추구하는 직장인에게 가장 인기.",
    schedule: ["월·수·금 12:00 점심", "화·목 07:00", "토 11:00"],
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1400&q=80",
    highlights: [
      { label: "1세션 소모", value: "650kcal" },
      { label: "심박존", value: "Z4~Z5" },
      { label: "그룹 인원", value: "최대 6명" },
    ],
  },
  {
    id: "rehab",
    icon: HeartPulse,
    label: "REHAB",
    tagline: "다시, 더 단단하게",
    desc:
      "물리치료 전공 트레이너가 진행하는 회복·자세 교정 프로그램. 만성 통증·재활 목적.",
    schedule: ["화·목 10:00", "월·수·금 16:00", "토 13:00"],
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=80",
    highlights: [
      { label: "분석 도구", value: "X-ray 연계" },
      { label: "1세션", value: "75분" },
      { label: "그룹 인원", value: "1:1" },
    ],
  },
];

const activeId = ref<string>(programs[0]!.id);
const active = computed(() => programs.find((p) => p.id === activeId.value)!);
</script>

<template>
  <section id="programs" class="relative bg-black py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="mb-12 grid gap-3 sm:mb-16 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-lime-300">— our programs</p>
          <h2 class="mt-3 font-black uppercase leading-none tracking-tight text-white text-5xl sm:text-6xl lg:text-7xl">
            세 가지 길.<br />
            하나의 결과.
          </h2>
        </div>
        <p class="max-w-xs text-sm text-zinc-400">
          체형과 목적에 따라 다른 프로그램을 추천합니다.
          첫 상담 후 가장 맞는 루트를 함께 정해 드려요.
        </p>
      </div>

      <!-- 탭 버튼 -->
      <div class="flex flex-wrap gap-2 border-b border-white/10 pb-1">
        <button
          v-for="p in programs"
          :key="p.id"
          type="button"
          :class="[
            'group relative inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 sm:px-5 sm:text-sm',
            activeId === p.id
              ? 'border-lime-300 text-lime-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-200',
          ]"
          @click="activeId = p.id"
        >
          <component :is="p.icon" :size="14" />
          {{ p.label }}
        </button>
      </div>

      <!-- 탭 내용 -->
      <div class="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="absolute transition duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <div :key="active.id" class="relative aspect-[4/3] overflow-hidden lg:aspect-[5/4]">
            <img :src="active.image" :alt="active.label" class="h-full w-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
            <div class="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-lime-300/50 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-lime-300 backdrop-blur">
              <component :is="active.icon" :size="12" />
              {{ active.label }}
            </div>
            <p class="absolute bottom-5 left-5 right-5 font-black uppercase leading-tight tracking-tight text-white text-3xl sm:text-4xl">
              {{ active.tagline }}
            </p>
          </div>
        </Transition>

        <div class="flex flex-col justify-between gap-7">
          <div>
            <Transition
              enter-active-class="transition duration-500 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="absolute transition duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
              mode="out-in"
            >
              <p :key="active.id + '-desc'" class="text-base leading-relaxed text-zinc-300 sm:text-lg">
                {{ active.desc }}
              </p>
            </Transition>
          </div>

          <dl class="grid grid-cols-3 gap-3">
            <div
              v-for="h in active.highlights"
              :key="h.label"
              class="border border-white/10 p-4 transition-colors hover:border-lime-300/50"
            >
              <dt class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{{ h.label }}</dt>
              <dd class="mt-2 font-black tracking-tight text-white text-xl sm:text-2xl">{{ h.value }}</dd>
            </div>
          </dl>

          <div>
            <p class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">주간 스케줄</p>
            <ul class="mt-3 space-y-2">
              <li
                v-for="s in active.schedule"
                :key="s"
                class="flex items-center justify-between border-b border-white/5 py-2 text-sm text-zinc-300"
              >
                <span class="font-mono">{{ s }}</span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-lime-300">예약 가능</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
