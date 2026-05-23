<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Check } from "lucide-vue-next";

interface Plan {
  name: string;
  monthly: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    monthly: 12000,
    description: "1인 또는 작은 팀이 워밍업하기 좋은 시작 플랜",
    features: ["월 10시간 회의 처리", "기본 요약 / 액션 추출", "이메일 자동 공유", "30일 회의 보관"],
  },
  {
    name: "Team",
    monthly: 39000,
    description: "정기 회의 많은 8~15인 팀에게 가장 인기",
    features: [
      "월 50시간 회의 처리",
      "GPT-4 turbo 요약 (속도 2배)",
      "Slack · Notion · Jira 연동",
      "1년 회의 보관",
      "도메인 통합 검색",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    monthly: 89000,
    description: "보안·감사·SSO 요구가 있는 50인 이상 조직",
    features: [
      "무제한 회의 처리",
      "SSO / SCIM 지원",
      "감사 로그 · 보존 정책 커스텀",
      "전담 매니저 + 99.9% SLA",
      "온프레미스 옵션",
    ],
  },
];

const billing = ref<"monthly" | "yearly">("monthly");

// 표시 가격(원) — 연간은 17% 할인.
function targetPrice(plan: Plan): number {
  return billing.value === "monthly" ? plan.monthly : Math.round(plan.monthly * 0.83);
}

// 카운트업: billing 토글 시 부드럽게 변경.
const displayed = ref<number[]>(plans.map((p) => p.monthly));
let raf: number | null = null;

function animateTo(targets: number[]) {
  if (raf) cancelAnimationFrame(raf);
  const start = displayed.value.slice();
  const startTs = performance.now();
  const duration = 500;

  const step = (now: number) => {
    const t = Math.min(1, (now - startTs) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    displayed.value = start.map((s, i) => Math.round(s + (targets[i]! - s) * eased));
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

watch(billing, () => {
  animateTo(plans.map((p) => targetPrice(p)));
});

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf);
});

const savedLabel = computed(() => (billing.value === "yearly" ? "연간 결제로 17% 절약" : "월 결제 (언제든 해지)"));
</script>

<template>
  <section id="pricing" class="py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Pricing</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          쓸 만큼만, 단순한 요금
        </h2>
        <p class="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">{{ savedLabel }}</p>
      </div>

      <!-- 토글 -->
      <div class="mt-8 flex justify-center">
        <div class="relative inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
          <span
            :class="[
              'absolute inset-y-1 w-[50%] rounded-full bg-white/10 transition-transform duration-300 ease-out',
              billing === 'yearly' ? 'translate-x-full' : 'translate-x-0',
            ]"
            aria-hidden="true"
          />
          <button
            type="button"
            :class="['relative z-10 px-5 py-2 text-sm font-medium transition-colors', billing === 'monthly' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200']"
            @click="billing = 'monthly'"
          >
            월간
          </button>
          <button
            type="button"
            :class="['relative z-10 px-5 py-2 text-sm font-medium transition-colors', billing === 'yearly' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200']"
            @click="billing = 'yearly'"
          >
            연간 <span class="ml-1 text-[10px] text-emerald-300">-17%</span>
          </button>
        </div>
      </div>

      <!-- 카드 -->
      <ul class="mt-12 grid gap-5 md:grid-cols-3">
        <li
          v-for="(p, i) in plans"
          :key="p.name"
          :class="[
            'relative flex flex-col rounded-2xl border p-6 sm:p-7',
            p.highlighted
              ? 'border-violet-400/40 bg-gradient-to-b from-violet-500/[0.08] to-transparent shadow-[0_0_60px_-20px_rgba(139,92,246,0.4)]'
              : 'border-white/10 bg-white/[0.02]',
          ]"
        >
          <span
            v-if="p.highlighted"
            class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
          >
            가장 인기
          </span>
          <h3 class="text-lg font-semibold text-zinc-100">{{ p.name }}</h3>
          <p class="mt-1 text-sm text-zinc-400">{{ p.description }}</p>

          <div class="mt-6 flex items-baseline gap-1">
            <span class="text-4xl font-bold tracking-tight text-white tabular-nums">
              ₩{{ displayed[i]!.toLocaleString() }}
            </span>
            <span class="text-sm text-zinc-500">/ {{ billing === "monthly" ? "월" : "월 (연간)" }}</span>
          </div>

          <ul class="mt-6 space-y-2.5">
            <li v-for="f in p.features" :key="f" class="flex items-start gap-2 text-sm text-zinc-300">
              <Check :size="16" class="mt-0.5 shrink-0 text-violet-300" />
              <span>{{ f }}</span>
            </li>
          </ul>

          <a
            href="#"
            :class="[
              'mt-7 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition-colors',
              p.highlighted
                ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                : 'border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10',
            ]"
          >
            {{ p.highlighted ? "지금 시작하기" : "선택하기" }}
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>
