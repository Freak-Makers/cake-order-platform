<script setup lang="ts">
// 가짜 고객사 로고 — wordmark 만으로 brand 느낌 연출.
const brandsTop = ["Lemonade", "Northwind", "Atlas Studio", "Riverside", "Forma", "Helix"];
const brandsBottom = ["Quanta", "Pebble", "Mosaic", "Kindred", "Vertex", "Loop"];
</script>

<template>
  <section class="border-y border-white/5 bg-white/[0.02] py-10 sm:py-12">
    <p class="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
      이미 1,200+ 팀이 Noteflow 로 회의를 정리합니다
    </p>

    <div class="mt-8 space-y-4 overflow-hidden">
      <!-- 두 줄, 서로 반대 방향으로 흐르는 marquee -->
      <div class="group flex select-none gap-12 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <ul class="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center gap-12">
          <li
            v-for="b in [...brandsTop, ...brandsTop]"
            :key="b + '-a'"
            class="text-2xl font-bold tracking-tight text-zinc-500 transition-colors hover:text-zinc-200"
          >
            {{ b }}
          </li>
        </ul>
        <ul aria-hidden="true" class="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center gap-12">
          <li v-for="b in brandsTop" :key="b + '-b'" class="text-2xl font-bold tracking-tight text-zinc-500">
            {{ b }}
          </li>
        </ul>
      </div>
      <div class="flex select-none gap-12 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <ul class="flex shrink-0 animate-[marquee-reverse_35s_linear_infinite] items-center gap-12">
          <li
            v-for="b in [...brandsBottom, ...brandsBottom]"
            :key="b + '-c'"
            class="text-2xl font-bold tracking-tight text-zinc-500 transition-colors hover:text-zinc-200"
          >
            {{ b }}
          </li>
        </ul>
        <ul aria-hidden="true" class="flex shrink-0 animate-[marquee-reverse_35s_linear_infinite] items-center gap-12">
          <li v-for="b in brandsBottom" :key="b + '-d'" class="text-2xl font-bold tracking-tight text-zinc-500">
            {{ b }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
@keyframes marquee-reverse {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
</style>
