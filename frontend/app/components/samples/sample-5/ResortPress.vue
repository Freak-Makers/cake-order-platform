<script setup lang="ts">
const presses = [
  { name: "Condé Nast Traveler", quote: "한국의 가장 조용한 호텔" },
  { name: "The New York Times", quote: "36 Hours in Jeju 추천" },
  { name: "Monocle", quote: "Quality of Life Top 50" },
  { name: "Wallpaper*", quote: "Design Hotels 2024" },
  { name: "AD France", quote: "Tradition meets stillness" },
];
</script>

<template>
  <section class="relative bg-white py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-5 sm:px-10">
      <p class="text-center font-serif text-xs italic tracking-[0.25em] text-stone-400">
        — as featured in
      </p>
      <ul class="mt-10 grid grid-cols-2 gap-y-8 gap-x-8 sm:grid-cols-3 lg:grid-cols-5">
        <li
          v-for="p in presses"
          :key="p.name"
          class="group text-center transition-opacity hover:opacity-100"
        >
          <p class="font-serif text-lg italic tracking-tight text-stone-700 transition-colors group-hover:text-stone-900 sm:text-xl">
            {{ p.name }}
          </p>
          <p class="mt-2 text-[10px] uppercase tracking-[0.2em] text-stone-400">
            "{{ p.quote }}"
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
