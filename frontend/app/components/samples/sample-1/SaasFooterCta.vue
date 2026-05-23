<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
</script>

<template>
  <section class="relative overflow-hidden py-20 sm:py-28">
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-3xl" />
    </div>

    <div class="mx-auto max-w-3xl px-4 text-center sm:px-6">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        오늘 회의부터 다르게 정리해 보세요
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
        신용카드 없이 14일 무료. 회의 10시간 분량을 무료로 처리해 드립니다.
      </p>

      <form
        class="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
        @submit.prevent
      >
        <input
          type="email"
          required
          placeholder="work@company.com"
          class="h-12 flex-1 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
        <button
          type="submit"
          class="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          시작하기
          <ArrowRight :size="16" class="transition-transform group-hover:translate-x-1" />
        </button>
      </form>
      <p class="mt-3 text-xs text-zinc-500">SOC 2 Type II · ISO 27001 · 한국 리전 저장</p>
    </div>

    <footer class="mt-16 border-t border-white/5 pt-8">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-zinc-500 sm:flex-row sm:px-6">
        <p>© 2026 Noteflow, Inc.</p>
        <ul class="flex gap-5">
          <li><a href="#" class="hover:text-zinc-300">개인정보 처리방침</a></li>
          <li><a href="#" class="hover:text-zinc-300">이용약관</a></li>
          <li><a href="#" class="hover:text-zinc-300">보안</a></li>
        </ul>
      </div>
    </footer>
  </section>
</template>
