<script setup lang="ts">
import { Mic, Sparkles, Workflow } from "lucide-vue-next";

const features = [
  {
    icon: Mic,
    title: "한국어 화자 인식",
    desc: "각자 다른 마이크 없이도 누가 무엇을 말했는지 자동 구분. 5명까지 동시 인식.",
    accent: "from-violet-500/30 to-violet-500/0",
  },
  {
    icon: Sparkles,
    title: "GPT-4 turbo 요약",
    desc: "단순 받아쓰기를 넘어, 결정사항·액션·이슈를 카테고리별로 분류된 회의록으로.",
    accent: "from-sky-500/30 to-sky-500/0",
  },
  {
    icon: Workflow,
    title: "도구 자동 연동",
    desc: "Slack · Notion · Jira 로 액션 아이템을 자동 전달. 더 이상 회의 후 복붙 작업 X.",
    accent: "from-emerald-500/30 to-emerald-500/0",
  },
];
</script>

<template>
  <section class="py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Features</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          말하기만 하면, 나머지는 Noteflow 가
        </h2>
        <p class="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
          회의 → 받아쓰기 → 요약 → 액션 아이템 → 협업 도구 전달. 5단계를 한 흐름으로.
        </p>
      </div>

      <ul class="mt-14 grid gap-4 sm:gap-5 md:grid-cols-3">
        <li
          v-for="f in features"
          :key="f.title"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04] sm:p-7"
        >
          <div
            :class="['pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100', f.accent]"
            aria-hidden="true"
          />
          <div class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200">
            <component :is="f.icon" :size="20" />
          </div>
          <h3 class="mt-5 text-lg font-semibold text-zinc-100">{{ f.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ f.desc }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
