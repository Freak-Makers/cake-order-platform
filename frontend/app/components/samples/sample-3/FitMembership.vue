<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Check, X } from "lucide-vue-next";

interface Plan {
  id: string;
  name: string;
  monthly: number;
  description: string;
  highlight?: boolean;
}

const plans: Plan[] = [
  { id: "drop", name: "DROP-IN", monthly: 80000, description: "단발 1회 · 첫 체험 가능" },
  { id: "core", name: "CORE", monthly: 320000, description: "월 8회 · 가장 인기", highlight: true },
  { id: "elite", name: "ELITE", monthly: 580000, description: "주 3회 + 식단 코칭" },
];

const features = [
  { label: "1:1 퍼스널 세션", drop: 1, core: 8, elite: 12 },
  { label: "체성분 측정", drop: false, core: true, elite: true },
  { label: "식단 코칭", drop: false, core: false, elite: true },
  { label: "샤워실·라커", drop: true, core: true, elite: true },
  { label: "주말·심야 이용", drop: false, core: true, elite: true },
  { label: "단백질 쉐이크 무제한", drop: false, core: false, elite: true },
];

const billing = ref<"monthly" | "yearly">("monthly");

function targetPrice(plan: Plan): number {
  return billing.value === "monthly" ? plan.monthly : Math.round(plan.monthly * 0.85 * 12);
}

const displayed = ref<number[]>(plans.map((p) => p.monthly));
let raf: number | null = null;
function animateTo(targets: number[]) {
  if (raf) cancelAnimationFrame(raf);
  const start = displayed.value.slice();
  const startTs = performance.now();
  const duration = 450;
  const step = (now: number) => {
    const t = Math.min(1, (now - startTs) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    displayed.value = start.map((s, i) => Math.round(s + (targets[i]! - s) * eased));
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}
watch(billing, () => animateTo(plans.map((p) => targetPrice(p))));
onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf);
});

const billingLabel = computed(() => (billing.value === "monthly" ? "월" : "년 (15% off)"));
</script>

<template>
  <section class="relative bg-zinc-950 py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="mb-10 text-center sm:mb-14">
        <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-lime-300">— membership</p>
        <h2 class="mt-3 font-black uppercase leading-none tracking-tight text-white text-5xl sm:text-6xl lg:text-7xl">
          쓸 만큼만 결제
        </h2>
      </div>

      <!-- 토글 -->
      <div class="mb-12 flex justify-center">
        <div class="relative inline-flex border border-white/10 bg-white/[0.02]">
          <span
            :class="[
              'absolute inset-y-0 w-[50%] bg-lime-300 transition-transform duration-300 ease-out',
              billing === 'yearly' ? 'translate-x-full' : 'translate-x-0',
            ]"
            aria-hidden="true"
          />
          <button
            type="button"
            :class="['relative z-10 px-7 py-3 text-xs font-black uppercase tracking-wider transition-colors', billing === 'monthly' ? 'text-black' : 'text-zinc-400 hover:text-white']"
            @click="billing = 'monthly'"
          >
            월 결제
          </button>
          <button
            type="button"
            :class="['relative z-10 px-7 py-3 text-xs font-black uppercase tracking-wider transition-colors', billing === 'yearly' ? 'text-black' : 'text-zinc-400 hover:text-white']"
            @click="billing = 'yearly'"
          >
            연 결제 -15%
          </button>
        </div>
      </div>

      <!-- 카드 -->
      <ul class="grid gap-4 md:grid-cols-3">
        <li
          v-for="(p, i) in plans"
          :key="p.id"
          :class="[
            'relative flex flex-col border p-7 transition-colors sm:p-8',
            p.highlight
              ? 'border-lime-300 bg-lime-300 text-black'
              : 'border-white/10 bg-white/[0.02] text-white hover:border-white/30',
          ]"
        >
          <span
            v-if="p.highlight"
            class="absolute -top-3 left-7 inline-flex items-center bg-black px-3 py-1 text-[10px] font-black uppercase tracking-wider text-lime-300"
          >
            가장 인기
          </span>

          <h3 class="font-black uppercase tracking-tight text-3xl">{{ p.name }}</h3>
          <p :class="['mt-2 text-sm', p.highlight ? 'text-black/70' : 'text-zinc-400']">
            {{ p.description }}
          </p>

          <div class="mt-7 flex items-baseline gap-1.5">
            <span class="font-black tabular-nums tracking-tight text-5xl sm:text-6xl">
              ₩{{ displayed[i]!.toLocaleString() }}
            </span>
          </div>
          <span :class="['mt-1 text-xs', p.highlight ? 'text-black/60' : 'text-zinc-500']">/ {{ billingLabel }}</span>

          <a
            href="#"
            :class="[
              'mt-8 inline-flex h-12 items-center justify-center text-xs font-black uppercase tracking-wider transition-colors',
              p.highlight ? 'bg-black text-lime-300 hover:bg-zinc-900' : 'border border-white/20 text-white hover:border-lime-300 hover:text-lime-300',
            ]"
          >
            가입하기
          </a>
        </li>
      </ul>

      <!-- 비교표 -->
      <div class="mt-16 overflow-x-auto">
        <table class="w-full min-w-[640px] border-collapse">
          <thead>
            <tr class="border-b border-white/10">
              <th class="py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-500">포함 사항</th>
              <th v-for="p in plans" :key="p.id" class="py-4 text-center text-xs font-black uppercase tracking-wider text-zinc-500">
                {{ p.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="f in features"
              :key="f.label"
              class="group border-b border-white/5 transition-colors hover:bg-lime-300/[0.04]"
            >
              <td class="py-4 text-sm text-zinc-300 transition-colors group-hover:text-lime-300">{{ f.label }}</td>
              <td class="py-4 text-center">
                <template v-if="typeof f.drop === 'number'">
                  <span class="font-black tabular-nums text-white">{{ f.drop }}회</span>
                </template>
                <Check v-else-if="f.drop" :size="18" class="mx-auto text-lime-300" />
                <X v-else :size="16" class="mx-auto text-zinc-700" />
              </td>
              <td class="py-4 text-center">
                <template v-if="typeof f.core === 'number'">
                  <span class="font-black tabular-nums text-lime-300">{{ f.core }}회</span>
                </template>
                <Check v-else-if="f.core" :size="18" class="mx-auto text-lime-300" />
                <X v-else :size="16" class="mx-auto text-zinc-700" />
              </td>
              <td class="py-4 text-center">
                <template v-if="typeof f.elite === 'number'">
                  <span class="font-black tabular-nums text-white">{{ f.elite }}회</span>
                </template>
                <Check v-else-if="f.elite" :size="18" class="mx-auto text-lime-300" />
                <X v-else :size="16" class="mx-auto text-zinc-700" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
