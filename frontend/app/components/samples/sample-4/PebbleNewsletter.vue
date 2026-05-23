<script setup lang="ts">
import { ref } from "vue";
import { Check, Mail } from "lucide-vue-next";

const email = ref("");
const submitted = ref(false);

function submit() {
  if (!email.value) return;
  submitted.value = true;
}
</script>

<template>
  <section class="bg-white py-20 sm:py-24">
    <div class="mx-auto max-w-3xl px-5 text-center sm:px-8">
      <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
        <Mail :size="22" />
      </div>
      <h2 class="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        매주 일요일, 머니레터를 받아보세요
      </h2>
      <p class="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
        이번 주 시장 동향, 재테크 팁, 신상 ETF — 5분 안에 읽히도록 정리해 보내드립니다.
      </p>

      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <form
          v-if="!submitted"
          key="form"
          class="mx-auto mt-7 flex max-w-md flex-col gap-2 sm:flex-row"
          @submit.prevent="submit"
        >
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="h-12 flex-1 rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
          <button
            type="submit"
            class="inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            구독하기
          </button>
        </form>
        <div
          v-else
          key="done"
          class="mx-auto mt-7 inline-flex max-w-md items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700"
        >
          <Check :size="16" />
          구독해주셔서 감사합니다. 이번 주 일요일에 첫 호 보내드릴게요.
        </div>
      </Transition>

      <p class="mt-4 text-xs text-slate-400">언제든 1클릭으로 구독 취소할 수 있어요.</p>
    </div>
  </section>
</template>
