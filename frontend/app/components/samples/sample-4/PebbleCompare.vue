<script setup lang="ts">
import { Check, Minus } from "lucide-vue-next";

interface Row {
  label: string;
  pebble: boolean | string;
  bank: boolean | string;
  others: boolean | string;
}

const rows: Row[] = [
  { label: "12개 금융기관 통합 조회", pebble: true, bank: false, others: true },
  { label: "자동 잔돈 저축", pebble: true, bank: false, others: false },
  { label: "ETF 자동 분할 매수", pebble: true, bank: false, others: false },
  { label: "AI 카테고리별 인사이트", pebble: true, bank: false, others: "일부" },
  { label: "주간 자동 리포트", pebble: true, bank: false, others: false },
  { label: "월 이용료", pebble: "무료", bank: "무료", others: "₩4,900~" },
  { label: "광고 표시", pebble: false, bank: true, others: true },
];
</script>

<template>
  <section class="relative bg-slate-50 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Compare</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          다른 앱과 무엇이 다를까요?
        </h2>
      </div>

      <div class="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50">
                <th class="px-6 py-5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  기능
                </th>
                <th class="px-6 py-5 text-center text-xs font-semibold">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text font-bold tracking-tight text-transparent">
                    Pebble
                  </span>
                </th>
                <th class="px-6 py-5 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                  은행 앱
                </th>
                <th class="px-6 py-5 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                  타사 가계부
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.label"
                class="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-indigo-50/40"
              >
                <td class="px-6 py-4 text-sm text-slate-700 transition-colors group-hover:text-slate-900 group-hover:font-medium">
                  {{ row.label }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span v-if="typeof row.pebble === 'string'" class="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-700">
                    {{ row.pebble }}
                  </span>
                  <span v-else-if="row.pebble" class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Check :size="14" :stroke-width="3" />
                  </span>
                  <Minus v-else :size="16" class="mx-auto text-slate-300" />
                </td>
                <td class="px-6 py-4 text-center">
                  <span v-if="typeof row.bank === 'string'" class="text-sm font-medium text-slate-700">{{ row.bank }}</span>
                  <Check v-else-if="row.bank" :size="14" class="mx-auto text-slate-400" />
                  <Minus v-else :size="16" class="mx-auto text-slate-300" />
                </td>
                <td class="px-6 py-4 text-center">
                  <span v-if="typeof row.others === 'string'" class="text-sm font-medium text-slate-700">{{ row.others }}</span>
                  <Check v-else-if="row.others" :size="14" class="mx-auto text-slate-400" />
                  <Minus v-else :size="16" class="mx-auto text-slate-300" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-slate-500">
        * 2026년 5월 기준 자체 비교 · 타사 가계부는 시장 점유율 상위 2개 앱의 평균.
      </p>
    </div>
  </section>
</template>
