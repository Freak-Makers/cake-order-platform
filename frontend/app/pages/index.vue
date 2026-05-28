<script setup lang="ts">
import { ArrowRight, Cake, CheckCircle2, LogOut, LayoutDashboard } from "lucide-vue-next";
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();

const features = [
  { title: "간편한 소셜 로그인", desc: "별도의 회원가입 없이 카카오 계정으로 3초 만에 시작하세요." },
  { title: "직관적인 주문 관리", desc: "제작 대기, 제작 중, 픽업 대기 등 상태별로 주문을 관리합니다." },
  { title: "안전한 결제 연동", desc: "토스 페이먼츠 연동으로 신용카드, 계좌이체 등 다양한 결제를 지원합니다." },
];
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white font-sans text-zinc-900">
    <!-- Header -->
    <header class="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-white">
            <Cake :size="20" />
          </div>
          <span class="text-lg font-bold tracking-tight sm:text-xl">Cake Admin</span>
        </div>

        <div class="flex items-center gap-1 sm:gap-2">
          <template v-if="!auth.isLoading">
            <template v-if="auth.isLoggedIn">
              <NuxtLink to="/dashboard">
                <Button variant="ghost" class="gap-2">
                  <LayoutDashboard :size="18" />
                  <span class="hidden sm:inline">대시보드</span>
                </Button>
              </NuxtLink>
              <Button variant="ghost" class="gap-2 text-zinc-600" @click="auth.logout()">
                <LogOut :size="18" />
                <span class="hidden sm:inline">로그아웃</span>
              </Button>
            </template>
            <NuxtLink v-else to="/login">
              <Button variant="ghost">로그인</Button>
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-1 pt-24 sm:pt-32">
      <section class="px-5 py-12 text-center sm:px-6 sm:py-20">
        <div class="mx-auto max-w-3xl">
          <h1 class="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            주문 케이크 사장님을 위한 <br class="hidden sm:inline" />
            <span class="text-pink-500">가장 스마트한 주문 관리</span>
          </h1>
          <p class="mt-6 text-base text-zinc-600 sm:mt-8 sm:text-xl">
            카카오톡 주문서 확인부터 결제 관리까지, <br class="hidden sm:inline" />
            이제 Cake Admin으로 한 곳에서 편리하게 관리하세요.
          </p>
          <div class="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            <NuxtLink v-if="auth.isLoggedIn" to="/dashboard">
              <Button size="lg" class="h-12 w-full gap-2 px-6 text-base sm:h-14 sm:w-auto sm:px-8">
                대시보드로 이동
                <ArrowRight :size="20" />
              </Button>
            </NuxtLink>
            <NuxtLink v-else to="/login">
              <Button size="lg" class="h-12 w-full gap-2 px-6 text-base sm:h-14 sm:w-auto sm:px-8">
                무료로 시작하기
                <ArrowRight :size="20" />
              </Button>
            </NuxtLink>
            <Button size="lg" variant="outline" class="h-12 w-full px-6 text-base sm:h-14 sm:w-auto sm:px-8">
              <NuxtLink to="#features">기능 살펴보기</NuxtLink>
            </Button>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="scroll-mt-24 bg-zinc-50 px-5 py-16 sm:px-6 sm:py-24">
        <div class="mx-auto max-w-7xl">
          <div class="grid gap-10 md:grid-cols-3 md:gap-12">
            <div v-for="(feature, i) in features" :key="i" class="flex flex-col gap-4 sm:gap-5">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <CheckCircle2 :size="24" />
              </div>
              <h3 class="text-lg font-bold sm:text-xl">{{ feature.title }}</h3>
              <p class="leading-relaxed text-zinc-600">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-zinc-100 px-5 py-8 sm:px-6 sm:py-12">
      <div class="mx-auto max-w-7xl text-center text-sm text-zinc-400">
        <p>© 2024 Cake Order Platform. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
