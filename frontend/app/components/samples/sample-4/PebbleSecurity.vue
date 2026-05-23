<script setup lang="ts">
import { Eye, Fingerprint, Lock, ShieldCheck } from "lucide-vue-next";

const items = [
  {
    icon: ShieldCheck,
    title: "금융위 등록 마이데이터 사업자",
    desc: "신용정보업 라이선스(NICE/KCB) 보유, 정기 감사 통과.",
  },
  {
    icon: Lock,
    title: "AES-256 + TLS 1.3 암호화",
    desc: "데이터는 저장·전송 시 모두 군사용 등급의 암호화를 적용합니다.",
  },
  {
    icon: Fingerprint,
    title: "생체 인증 + 2FA",
    desc: "지문·Face ID + OTP 이중 인증. 송금·매수 시 다시 한번 확인.",
  },
  {
    icon: Eye,
    title: "조회만, 출금은 불가능",
    desc: "Pebble 은 자산 조회·자동매수만 가능하며, 임의 출금은 원천 차단되어 있습니다.",
  },
];

const certs = [
  "ISO 27001",
  "ISO 27701",
  "ISMS-P",
  "PCI DSS",
  "SOC 2 Type II",
];
</script>

<template>
  <section class="relative bg-gradient-to-b from-indigo-50 via-white to-white py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Security</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          돈을 다루니까,<br />보안은 타협 없이
        </h2>
        <p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          시중은행과 동일한 등급의 인프라와 인증 체계로 운영합니다.
        </p>
      </div>

      <ul class="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        <li
          v-for="it in items"
          :key="it.title"
          class="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
        >
          <div class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <component :is="it.icon" :size="20" />
          </div>
          <h3 class="mt-4 text-base font-semibold text-slate-900">{{ it.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ it.desc }}</p>
        </li>
      </ul>

      <!-- 인증 로고 띠 -->
      <div class="mt-14 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <p class="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          국제·국내 인증
        </p>
        <ul class="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <li
            v-for="c in certs"
            :key="c"
            class="font-mono text-lg font-bold tracking-tight text-slate-300 transition-colors hover:text-slate-700"
          >
            {{ c }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
