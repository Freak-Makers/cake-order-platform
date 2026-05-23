<script setup lang="ts">
import { ref } from "vue";
import { Plus } from "lucide-vue-next";

const faqs = [
  {
    q: "한국어 회의도 인식이 잘 되나요?",
    a: "네. 한국어 화자 인식·요약에 최적화된 모델을 사용합니다. 5명 동시 발화·전문 용어가 섞인 회의에서도 평균 93% 이상의 정확도를 보입니다.",
  },
  {
    q: "회의 데이터는 어디에 저장되나요?",
    a: "모든 데이터는 한국 리전(AWS Seoul)에 암호화되어 저장됩니다. 저장 기간은 플랜별로 다르며, Business 플랜은 보존 정책을 직접 정할 수 있습니다.",
  },
  {
    q: "Slack 외에 다른 도구도 연동되나요?",
    a: "Slack · Notion · Jira · Linear · Microsoft Teams 를 기본 지원합니다. Webhook 으로 자체 시스템 연동도 가능합니다.",
  },
  {
    q: "14일 무료 체험 후 자동 결제되나요?",
    a: "아니요. 신용카드 없이 체험할 수 있으며, 체험 종료 후 별도 결제 없이는 유료 전환되지 않습니다.",
  },
  {
    q: "오프라인 회의(녹음기) 도 가능한가요?",
    a: "네. mp3 · wav · m4a 등 일반 오디오 파일 업로드를 지원하며, 화상회의 통합과 동일한 결과를 받으실 수 있습니다.",
  },
];

const open = ref<number | null>(0);
function toggle(idx: number) {
  open.value = open.value === idx ? null : idx;
}
</script>

<template>
  <section class="py-20 sm:py-28">
    <div class="mx-auto max-w-3xl px-4 sm:px-6">
      <div class="text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">FAQ</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">자주 묻는 질문</h2>
      </div>

      <ul class="mt-10 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <li v-for="(f, idx) in faqs" :key="f.q">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.02] sm:px-6"
            :aria-expanded="open === idx"
            @click="toggle(idx)"
          >
            <span class="text-sm font-medium text-zinc-100 sm:text-base">{{ f.q }}</span>
            <Plus
              :size="18"
              :class="[
                'shrink-0 text-zinc-500 transition-transform duration-300',
                open === idx ? 'rotate-45 text-violet-300' : '',
              ]"
            />
          </button>
          <div
            :class="[
              'grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out',
              open === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            ]"
          >
            <div class="min-h-0">
              <p class="px-5 pb-5 text-sm leading-relaxed text-zinc-400 sm:px-6">{{ f.a }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
