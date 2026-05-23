<script setup lang="ts">
import { computed, ref } from "vue";
import { CheckCircle2, FileText, ListChecks, Slack } from "lucide-vue-next";

const tabs = [
  { id: "transcript", icon: FileText, label: "받아쓰기" },
  { id: "summary", icon: ListChecks, label: "AI 요약" },
  { id: "actions", icon: CheckCircle2, label: "액션 아이템" },
  { id: "slack", icon: Slack, label: "Slack 공유" },
] as const;
type TabId = (typeof tabs)[number]["id"];

const active = ref<TabId>("transcript");
const activeTab = computed(() => tabs.find((t) => t.id === active.value)!);
</script>

<template>
  <section id="preview" class="py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Product preview</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          한 화면으로 끝나는 회의의 사이클
        </h2>
      </div>

      <!-- 탭 -->
      <div class="mt-10 flex flex-wrap justify-center gap-2">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          :class="[
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
            active === t.id
              ? 'border-white/20 bg-white/10 text-white shadow-[0_0_0_4px_rgba(139,92,246,0.15)]'
              : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
          ]"
          @click="active = t.id"
        >
          <component :is="t.icon" :size="14" />
          {{ t.label }}
        </button>
      </div>

      <!-- 큰 mockup -->
      <div class="relative mt-10">
        <div class="absolute -inset-x-6 -inset-y-4 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-transparent blur-2xl" aria-hidden="true" />
        <div class="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur">
          <!-- 윈도우 헤더 -->
          <div class="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <div class="flex items-center gap-2">
              <span class="flex h-2.5 w-2.5 rounded-full bg-red-400" />
              <span class="flex h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div class="rounded-md bg-black/30 px-3 py-1 font-mono text-[11px] text-zinc-400">
              app.noteflow.io / meetings / 2024-Q4-okr
            </div>
            <div class="h-2.5 w-2.5" />
          </div>

          <!-- 화면 영역 -->
          <div class="relative min-h-[400px] p-5 sm:p-8">
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in absolute inset-x-5 sm:inset-x-8"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
              mode="out-in"
            >
              <!-- TRANSCRIPT -->
              <div v-if="active === 'transcript'" key="transcript" class="space-y-4">
                <h3 class="font-mono text-sm text-zinc-500">2024 Q4 OKR 정기 회의 · 32분</h3>
                <ul class="space-y-3 text-sm">
                  <li class="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <p class="text-xs text-violet-300">지훈 · 00:24</p>
                    <p class="mt-1 leading-relaxed text-zinc-200">다음 분기 OKR 초안을 공유합니다. 핵심은 ARR 30% 성장, 신규 채용 동결, 마케팅 효율 개선입니다.</p>
                  </li>
                  <li class="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <p class="text-xs text-sky-300">은서 · 02:11</p>
                    <p class="mt-1 leading-relaxed text-zinc-200">마케팅 예산은 이번 분기에 비해 15% 줄였어요. 대신 컨텐츠 채널로 무게중심을 옮길 예정입니다.</p>
                  </li>
                  <li class="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <p class="text-xs text-fuchsia-300">민호 · 05:48</p>
                    <p class="mt-1 leading-relaxed text-zinc-200">그럼 신규 채용은 다음 회의에서 한 번 더 다루는 것으로 정리할까요?</p>
                  </li>
                </ul>
              </div>

              <!-- SUMMARY -->
              <div v-else-if="active === 'summary'" key="summary" class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] p-5">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-300">결정사항</p>
                  <ul class="mt-3 space-y-2 text-sm text-zinc-200">
                    <li>· 다음 분기 ARR 목표 30% 성장 확정</li>
                    <li>· 마케팅 예산 15% 감축</li>
                    <li>· 신규 채용은 다음 회의로 이월</li>
                  </ul>
                </div>
                <div class="rounded-lg border border-amber-400/20 bg-amber-500/[0.06] p-5">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-amber-300">논의 필요</p>
                  <ul class="mt-3 space-y-2 text-sm text-zinc-200">
                    <li>· 컨텐츠 채널 인력 충원 여부</li>
                    <li>· 엔터프라이즈 영업 강화 시점</li>
                  </ul>
                </div>
                <div class="rounded-lg border border-violet-400/20 bg-violet-500/[0.06] p-5 sm:col-span-2">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-violet-300">3줄 요약</p>
                  <p class="mt-3 text-sm leading-relaxed text-zinc-200">
                    Q4 OKR 핵심은 ARR 30% 성장. 마케팅 예산 -15%, 컨텐츠 채널로 무게중심 이동. 신규 채용은 다음 정기 회의에서 재논의.
                  </p>
                </div>
              </div>

              <!-- ACTIONS -->
              <div v-else-if="active === 'actions'" key="actions" class="space-y-3">
                <div
                  v-for="a in [
                    { who: '지훈', task: 'Q4 OKR 최종안 작성', due: '10/15', color: 'bg-violet-400' },
                    { who: '은서', task: '컨텐츠 채널 KPI 정의', due: '10/18', color: 'bg-sky-400' },
                    { who: '민호', task: '엔터프라이즈 영업 ROI 검토', due: '10/22', color: 'bg-emerald-400' },
                    { who: '소연', task: 'Slack 자동화 배포', due: '10/12', color: 'bg-rose-400' },
                  ]"
                  :key="a.task"
                  class="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4"
                >
                  <span :class="['h-2.5 w-2.5 rounded-full', a.color]" />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-zinc-100">{{ a.task }}</p>
                    <p class="text-xs text-zinc-500">담당: {{ a.who }} · 마감 {{ a.due }}</p>
                  </div>
                  <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300">
                    Jira #ENG-{{ Math.floor(Math.random() * 900 + 100) }}
                  </span>
                </div>
              </div>

              <!-- SLACK -->
              <div v-else key="slack" class="mx-auto max-w-md rounded-lg border border-white/5 bg-white/[0.02] p-5">
                <div class="flex items-center gap-3 border-b border-white/5 pb-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-md bg-violet-500/20 text-violet-300">
                    <Slack :size="18" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-zinc-100">#product-okr</p>
                    <p class="text-xs text-zinc-500">Noteflow Bot · 방금</p>
                  </div>
                </div>
                <div class="mt-4 space-y-3 text-sm">
                  <p class="font-medium text-zinc-100">📝 2024 Q4 OKR 정기 회의 요약</p>
                  <p class="leading-relaxed text-zinc-300">Q4 핵심은 ARR 30% 성장. 마케팅 -15%, 컨텐츠 채널 강화. 신규 채용은 다음 회의 이월.</p>
                  <p class="text-xs text-zinc-500">액션 4개 · 결정 3개 · 32분 분량 → <span class="text-sky-300 underline">전체 보기</span></p>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <p class="mt-6 text-center text-xs text-zinc-500">
        탭을 눌러 화면이 어떻게 전환되는지 직접 확인해 보세요 · 현재 보고 있는 화면: {{ activeTab.label }}
      </p>
    </div>
  </section>
</template>
