<script setup lang="ts">
import { ref } from "vue";
import { ArrowLeft, Menu, X as XIcon } from "lucide-vue-next";

definePageMeta({ layout: false });

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap",
    },
  ],
});

const trialOpen = ref(false);
const mobileMenuOpen = ref(false);

function openTrial() {
  trialOpen.value = true;
  mobileMenuOpen.value = false;
}
</script>

<template>
  <div class="fit-root min-h-screen bg-black text-white antialiased">
    <!-- 상단 네비 -->
    <header class="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div class="flex items-center gap-5">
          <NuxtLink to="/samples" class="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-lime-300">
            <ArrowLeft :size="14" class="transition-transform group-hover:-translate-x-0.5" />
            samples
          </NuxtLink>
          <div class="hidden h-4 w-px bg-white/10 sm:block" />
          <NuxtLink to="/samples/sample-3" class="flex items-center gap-2">
            <span class="font-black uppercase tracking-tighter text-white text-xl sm:text-2xl">
              IRON<span class="text-lime-300">HAUS</span>
            </span>
          </NuxtLink>
        </div>

        <nav class="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-wider text-zinc-400 md:flex">
          <a href="#programs" class="hover:text-lime-300">programs</a>
          <a href="#" class="hover:text-lime-300">coaches</a>
          <a href="#" class="hover:text-lime-300">results</a>
          <a href="#" class="hover:text-lime-300">membership</a>
        </nav>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="hidden h-10 items-center bg-lime-300 px-5 text-[11px] font-black uppercase tracking-wider text-black transition-colors hover:bg-lime-200 sm:inline-flex"
            @click="openTrial"
          >
            join trial
          </button>
          <button
            type="button"
            class="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
            aria-label="메뉴 열기"
            @click="mobileMenuOpen = true"
          >
            <Menu :size="20" />
          </button>
        </div>
      </div>
    </header>

    <!-- 모바일 메뉴 drawer -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-black md:hidden"
      >
        <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span class="font-black uppercase tracking-tighter text-white text-xl">
            IRON<span class="text-lime-300">HAUS</span>
          </span>
          <button type="button" class="text-white" aria-label="닫기" @click="mobileMenuOpen = false">
            <XIcon :size="22" />
          </button>
        </div>
        <nav class="flex flex-col p-6 text-3xl font-black uppercase tracking-tight">
          <a href="#programs" class="border-b border-white/10 py-5 text-white hover:text-lime-300" @click="mobileMenuOpen = false">programs</a>
          <a href="#" class="border-b border-white/10 py-5 text-white hover:text-lime-300" @click="mobileMenuOpen = false">coaches</a>
          <a href="#" class="border-b border-white/10 py-5 text-white hover:text-lime-300" @click="mobileMenuOpen = false">results</a>
          <a href="#" class="border-b border-white/10 py-5 text-white hover:text-lime-300" @click="mobileMenuOpen = false">membership</a>
          <button
            type="button"
            class="mt-8 inline-flex h-14 items-center justify-center bg-lime-300 text-sm font-black uppercase tracking-wider text-black"
            @click="openTrial"
          >
            join trial →
          </button>
        </nav>
      </div>
    </Transition>

    <FitHero @open-trial="openTrial" />
    <FitPrograms />
    <FitTrainers />
    <FitStats />
    <FitTestimonials />
    <FitMembership />
    <FitTrialCta @open-trial="openTrial" />

    <FitTrialModal :open="trialOpen" @close="trialOpen = false" />

    <footer class="border-t border-white/10 bg-black py-10">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
        <div>
          <p class="font-black uppercase tracking-tighter text-white text-2xl">
            IRON<span class="text-lime-300">HAUS</span>
          </p>
          <p class="mt-1 text-xs text-zinc-500">Seoul · Hannam · since 2014</p>
        </div>
        <ul class="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <li><a href="#" class="hover:text-lime-300">privacy</a></li>
          <li><a href="#" class="hover:text-lime-300">terms</a></li>
          <li><a href="#" class="hover:text-lime-300">careers</a></li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.fit-root {
  font-family: "Inter", -apple-system, system-ui, sans-serif;
  font-feature-settings: "ss01";
}
</style>
