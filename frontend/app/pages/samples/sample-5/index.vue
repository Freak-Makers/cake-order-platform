<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

definePageMeta({ layout: false });

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap",
    },
  ],
});
</script>

<template>
  <div class="resort-root min-h-screen bg-stone-50 text-stone-800 antialiased lg:cursor-none">
    <!-- 상단 네비 — 처음에는 hero 위에 떠 있음 -->
    <header class="fixed inset-x-0 top-0 z-30">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-10 sm:py-8">
        <NuxtLink
          to="/samples"
          class="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80 hover:text-white"
          data-cursor="back"
        >
          <ArrowLeft :size="12" class="transition-transform group-hover:-translate-x-0.5" />
          samples
        </NuxtLink>

        <NuxtLink to="/samples/sample-5" class="font-serif text-2xl italic text-white sm:text-3xl" data-cursor="home">
          Hwadam Stay
        </NuxtLink>

        <nav class="hidden items-center gap-7 font-serif text-sm italic text-white/80 md:flex">
          <a href="#" class="hover:text-white" data-cursor="explore">Suites</a>
          <a href="#" class="hover:text-white" data-cursor="explore">Experiences</a>
          <a href="#" class="hover:text-white" data-cursor="explore">Journal</a>
        </nav>

        <a
          href="#"
          class="hidden border border-white/40 px-5 py-2 text-[10px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-stone-900 md:inline-block"
          data-cursor="book now"
        >
          Reserve
        </a>
      </div>
    </header>

    <ResortHero />
    <ResortSuites />
    <ResortExperiences />
    <ResortGallery />
    <ResortPress />
    <ResortFooter />

    <ResortBookingBar />
    <ResortCursor />
  </div>
</template>

<style scoped>
.resort-root {
  font-family: "Inter", -apple-system, system-ui, sans-serif;
}
.resort-root :deep(.font-serif) {
  font-family: "Playfair Display", "Noto Serif KR", serif;
  letter-spacing: -0.005em;
}
</style>
