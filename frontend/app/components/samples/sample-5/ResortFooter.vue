<script setup lang="ts">
import { ref } from "vue";
import { Check, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-vue-next";

const email = ref("");
const subscribed = ref(false);
function subscribe() {
  if (!email.value) return;
  subscribed.value = true;
}
</script>

<template>
  <section class="relative bg-stone-900 text-stone-200">
    <!-- 약도/연락 + 뉴스레터 -->
    <div class="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-10 sm:py-32 lg:grid-cols-[1.1fr_1fr]">
      <!-- 좌측 — 뉴스레터 -->
      <div>
        <p class="font-serif text-xs italic tracking-[0.25em] text-stone-400">— stay in touch</p>
        <h2 class="mt-4 font-serif font-light leading-[1.05] tracking-tight text-white text-5xl sm:text-6xl lg:text-7xl">
          계절이 바뀔 때마다,<br />
          <span class="italic">초대장처럼.</span>
        </h2>
        <p class="mt-6 max-w-md text-sm leading-relaxed text-stone-400 sm:text-base">
          Hwadam Stay 의 비공개 패키지·이벤트 소식을 가장 먼저 전해드립니다.
        </p>

        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <form
            v-if="!subscribed"
            key="form"
            class="mt-8 flex max-w-md flex-col gap-2 sm:flex-row sm:items-end"
            @submit.prevent="subscribe"
          >
            <div class="flex-1">
              <label class="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                Email address
              </label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="you@example.com"
                class="mt-1 h-11 w-full border-b border-stone-700 bg-transparent px-0 text-sm text-white placeholder:text-stone-600 focus:border-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              class="inline-flex h-11 items-center justify-center border border-white px-6 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-stone-900"
            >
              구독
            </button>
          </form>
          <div
            v-else
            key="done"
            class="mt-8 inline-flex items-center gap-2 border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
          >
            <Check :size="16" />
            구독해주셔서 감사합니다.
          </div>
        </Transition>
      </div>

      <!-- 우측 — 약도 + 연락 -->
      <div class="space-y-6">
        <!-- 약도 (제주도 단순화 SVG) -->
        <div class="relative overflow-hidden bg-stone-800 p-6">
          <svg viewBox="0 0 360 220" class="h-48 w-full">
            <!-- 제주도 단순 윤곽 -->
            <path
              d="M40 130 Q 20 100 50 80 Q 100 50 180 55 Q 270 60 320 95 Q 345 130 300 160 Q 220 185 130 175 Q 70 165 40 130 Z"
              fill="#1c1917"
              stroke="#57534e"
              stroke-width="1"
            />
            <!-- 한라산 -->
            <circle cx="180" cy="115" r="5" fill="#a8a29e" />
            <text x="180" y="105" text-anchor="middle" font-size="9" font-style="italic" fill="#a8a29e" font-family="serif">한라산</text>

            <!-- 위치 마커 -->
            <g transform="translate(95 145)">
              <circle r="14" fill="#fde68a" opacity="0.2" class="animate-ping origin-center" />
              <circle r="6" fill="#fde68a" />
            </g>
            <text x="95" y="172" text-anchor="middle" font-size="10" font-style="italic" fill="#fde68a" font-family="serif">
              Hwadam Stay
            </text>

            <!-- 제주공항 -->
            <circle cx="220" cy="80" r="3" fill="#78716c" />
            <text x="220" y="72" text-anchor="middle" font-size="8" fill="#78716c">JEJU AIRPORT</text>
          </svg>
        </div>

        <ul class="space-y-4 text-sm">
          <li class="flex items-start gap-3">
            <MapPin :size="16" class="mt-0.5 shrink-0 text-stone-500" />
            <div>
              <p class="text-white">제주 서귀포시 안덕면 화담로 117</p>
              <p class="text-xs text-stone-500">제주공항에서 차로 약 50분</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <Phone :size="16" class="mt-0.5 shrink-0 text-stone-500" />
            <div>
              <p class="text-white">+82 64 1234 5678</p>
              <p class="text-xs text-stone-500">평일 09:00 – 19:00 / 컨시어지 24h</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <Mail :size="16" class="mt-0.5 shrink-0 text-stone-500" />
            <div>
              <p class="text-white">reservations@hwadamstay.kr</p>
              <p class="text-xs text-stone-500">예약 / 단체 / 프레스 문의</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 최하단 -->
    <div class="border-t border-stone-800">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-7 text-xs text-stone-500 sm:flex-row sm:px-10">
        <p class="font-serif text-base italic text-white">Hwadam Stay</p>
        <ul class="flex items-center gap-5">
          <li><a href="#" aria-label="Instagram" class="hover:text-white"><Instagram :size="16" /></a></li>
          <li><a href="#" aria-label="Youtube" class="hover:text-white"><Youtube :size="16" /></a></li>
        </ul>
        <p>© 2026 Hwadam Stay · 사업자등록번호 000-00-00000</p>
      </div>
    </div>
  </section>
</template>
