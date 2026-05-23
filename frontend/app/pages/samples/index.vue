<script setup lang="ts">
import { ArrowUpRight, Code2, Mail, Palette, Rocket, Sparkles } from "lucide-vue-next";

definePageMeta({ layout: false });

interface SampleCard {
  slug: string;
  number: string;
  industry: string;
  title: string;
  description: string;
  tone: string;
  accent: string; // tailwind gradient class
  image: string;
  available: boolean;
}

const samples: SampleCard[] = [
  {
    slug: "/samples/sample-1",
    number: "01",
    industry: "B2B SaaS",
    title: "Noteflow — AI 회의록 협업 툴",
    description: "다크 베이스 + 보라/파랑 그라데이션. 데이터·텍스트 밀도 높은 화면을 깔끔하게 정돈하는 테크 스타트업 톤.",
    tone: "Dark · Tech · Minimal",
    accent: "from-violet-500 via-indigo-500 to-sky-400",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
    available: true,
  },
  {
    slug: "/samples/sample-2",
    number: "02",
    industry: "F&B / Bakery",
    title: "Maison de Sucre — 부티크 베이커리",
    description: "따뜻한 파스텔 + serif 헤딩. 손글씨 풍 카피와 부드러운 그림자로 인스타 감성을 살린 로컬 비즈니스.",
    tone: "Warm · Pastel · Serif",
    accent: "from-rose-300 via-amber-200 to-orange-300",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=80",
    available: true,
  },
  {
    slug: "/samples/sample-3",
    number: "03",
    industry: "Fitness",
    title: "IRONHAUS — 퍼스널 트레이닝 스튜디오",
    description: "블랙 베이스 + 네온 라임. 비디오 배경과 마키 텍스트로 에너제틱한 스포츠 톤을 강조.",
    tone: "Bold · Neon · Energetic",
    accent: "from-lime-300 via-emerald-400 to-cyan-400",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    available: true,
  },
  {
    slug: "/samples/sample-4",
    number: "04",
    industry: "Fintech",
    title: "Pebble — 개인 자산관리 앱",
    description: "클린 화이트 + 인디고 그라데이션. 디바이스 mockup과 sticky stack으로 모바일 핀테크의 신뢰를 전달.",
    tone: "Clean · Data · iOS-like",
    accent: "from-indigo-400 via-blue-500 to-violet-500",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    available: true,
  },
  {
    slug: "/samples/sample-5",
    number: "05",
    industry: "Luxury Travel",
    title: "Hwadam Stay — 부티크 리조트",
    description: "full-bleed 이미지 + 큼직한 serif. Ken Burns와 cursor follower로 매거진 같은 우아함을 연출.",
    tone: "Luxury · Serif · Spacious",
    accent: "from-stone-300 via-emerald-200 to-amber-200",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
    available: true,
  },
];
</script>

<template>
  <div class="min-h-screen bg-zinc-50 text-zinc-900">
    <header class="border-b border-zinc-200/70 bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <NuxtLink to="/samples" class="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900">
          <span class="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500" />
          FreakMakers
        </NuxtLink>
        <div class="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
          <Sparkles :size="12" class="text-pink-500" />
          Portfolio Samples
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <section class="mb-10 sm:mb-14">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">FreakMakers · Studio Portfolio</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          서로 다른 5개 업종으로 보여드리는
          <span class="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
            디자인 폭
          </span>
        </h1>
        <p class="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          하나의 톤·하나의 레이아웃에 갇히지 않습니다. SaaS 부터 럭셔리 리조트까지,
          각각의 업종 색에 맞춘 인터랙션과 디자인을 직접 확인해 보세요.
        </p>
      </section>

      <section class="mb-10 grid gap-4 sm:mb-14 sm:grid-cols-3 sm:gap-5">
        <div class="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Palette :size="16" />
          </div>
          <h3 class="mt-4 text-sm font-bold text-zinc-900">Design</h3>
          <p class="mt-1.5 text-xs leading-relaxed text-zinc-600">
            업종 톤에 맞춘 UI · 인터랙션 설계. 브랜딩과 컨버전을 동시에 잡습니다.
          </p>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Code2 :size="16" />
          </div>
          <h3 class="mt-4 text-sm font-bold text-zinc-900">Development</h3>
          <p class="mt-1.5 text-xs leading-relaxed text-zinc-600">
            Nuxt · Vue · TypeScript 기반의 모던 스택. 반응형 · 성능 · 접근성까지 챙깁니다.
          </p>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Rocket :size="16" />
          </div>
          <h3 class="mt-4 text-sm font-bold text-zinc-900">Launch &amp; Iterate</h3>
          <p class="mt-1.5 text-xs leading-relaxed text-zinc-600">
            런칭 후에도 데이터 보고 계속 개선. 한 번 만들고 끝내는 사이트 안 만듭니다.
          </p>
        </div>
      </section>

      <section class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="s in samples"
          :key="s.slug"
          :to="s.slug"
          :tabindex="s.available ? undefined : -1"
          :aria-disabled="s.available ? undefined : true"
          :class="[
            'group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300',
            s.available
              ? 'hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl'
              : 'pointer-events-none opacity-60',
          ]"
        >
          <div class="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-zinc-100">
            <img
              :src="s.image"
              :alt="s.title"
              loading="lazy"
              :class="[
                'h-full w-full object-cover transition-transform duration-700',
                s.available ? 'group-hover:scale-105' : 'grayscale',
              ]"
            />
            <div
              :class="['absolute inset-0 bg-gradient-to-br opacity-40 mix-blend-multiply', s.accent]"
              aria-hidden="true"
            />
            <div class="absolute left-4 top-4 flex items-center gap-2">
              <span class="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-zinc-900 backdrop-blur">
                {{ s.number }}
              </span>
              <span class="rounded-full bg-zinc-900/80 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                {{ s.industry }}
              </span>
            </div>
            <div
              v-if="!s.available"
              class="absolute right-4 top-4 rounded-full bg-zinc-900/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300"
            >
              Coming soon
            </div>
            <div
              v-else
              class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-900 shadow-md transition-transform duration-300 group-hover:rotate-45"
            >
              <ArrowUpRight :size="16" />
            </div>
          </div>

          <div class="flex flex-1 flex-col gap-2 p-5 sm:p-6">
            <h2 class="text-lg font-bold leading-snug">{{ s.title }}</h2>
            <p class="text-sm leading-relaxed text-zinc-600">{{ s.description }}</p>
            <p class="mt-auto pt-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              {{ s.tone }}
            </p>
          </div>
        </NuxtLink>
      </section>

      <section class="mt-14 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 px-6 py-10 text-white sm:mt-20 sm:px-10 sm:py-14">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div class="max-w-xl">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Start a project</p>
            <h2 class="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              다음 프로젝트, <span class="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">FreakMakers</span> 와 함께.
            </h2>
            <p class="mt-3 text-sm leading-relaxed text-zinc-300">
              업종 · 브랜드 톤 · 예산을 알려주시면, 2영업일 안에 제안서로 답변드립니다.
            </p>
          </div>
          <a
            href="mailto:freakmakers404@gmail.com"
            class="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-transform hover:-translate-y-0.5"
          >
            <Mail :size="16" />
            프로젝트 문의
            <ArrowUpRight :size="16" class="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </section>
    </main>

    <footer class="border-t border-zinc-200 py-8 text-center text-xs text-zinc-400">
      Built with FreakMakers
    </footer>
  </div>
</template>
