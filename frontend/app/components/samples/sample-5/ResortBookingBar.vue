<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowUpRight, Calendar, Moon, Users } from "lucide-vue-next";

// 일정량 이상 스크롤하면 sticky bar 가 dock 됨.
const docked = ref(false);
function onScroll() {
  docked.value = window.scrollY > window.innerHeight * 0.6;
}
onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));

const checkIn = ref("");
const nights = ref(2);
const guests = ref(2);
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-full"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-300"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-full"
  >
    <div
      v-if="docked"
      class="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-4xl sm:inset-x-6 sm:bottom-6"
    >
      <div class="relative overflow-hidden rounded-full border border-stone-200 bg-white/95 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <form class="grid grid-cols-1 items-stretch divide-y divide-stone-100 sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:divide-x sm:divide-y-0" @submit.prevent>
          <label class="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50 sm:py-4">
            <Calendar :size="16" class="shrink-0 text-stone-500" />
            <div class="min-w-0 flex-1">
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">Check-in</p>
              <input
                v-model="checkIn"
                type="date"
                class="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
            </div>
          </label>
          <label class="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50 sm:py-4">
            <Moon :size="16" class="shrink-0 text-stone-500" />
            <div class="min-w-0 flex-1">
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">Nights</p>
              <select v-model.number="nights" class="w-full bg-transparent text-sm text-stone-900 focus:outline-none">
                <option v-for="n in 7" :key="n" :value="n">{{ n }} night{{ n > 1 ? "s" : "" }}</option>
              </select>
            </div>
          </label>
          <label class="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50 sm:py-4">
            <Users :size="16" class="shrink-0 text-stone-500" />
            <div class="min-w-0 flex-1">
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">Guests</p>
              <select v-model.number="guests" class="w-full bg-transparent text-sm text-stone-900 focus:outline-none">
                <option v-for="n in 6" :key="n" :value="n">{{ n }} guest{{ n > 1 ? "s" : "" }}</option>
              </select>
            </div>
          </label>
          <button
            type="submit"
            class="group inline-flex items-center justify-center gap-2 bg-stone-900 px-7 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-stone-700"
          >
            Reserve
            <ArrowUpRight :size="14" class="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>
