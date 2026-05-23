<script setup lang="ts">
import { useRoute } from "vue-router";
import { LayoutDashboard, ShoppingBag, Calendar, Cake, FileText, MessageSquare, Settings, LogOut, X } from "lucide-vue-next";
import { cn } from "~/utils/format";
import { useAuthStore } from "~/stores/auth";
import { useChatStore } from "~/stores/chat";

withDefaults(defineProps<{ isOpen?: boolean }>(), { isOpen: false });
const emit = defineEmits<{ close: [] }>();

const menuItems = [
  { icon: LayoutDashboard, label: "대시보드", href: "/dashboard" },
  { icon: ShoppingBag, label: "예약 관리", href: "/admin/reservations" },
  { icon: Calendar, label: "예약 가능 슬롯", href: "/admin/reservation-slots" },
  { icon: Cake, label: "상품 관리", href: "/products" },
  { icon: FileText, label: "게시글 관리", href: "/admin/posts" },
  { icon: MessageSquare, label: "고객 채팅", href: "/admin/chat" },
  { icon: Settings, label: "설정", href: "/settings" },
];

const route = useRoute();
const auth = useAuthStore();
const chat = useChatStore();
</script>

<template>
  <!-- 모바일/태블릿(< lg) 에서는 drawer, lg 이상은 고정 사이드바. -->
  <div>
    <!-- Backdrop — 모바일에서만, drawer 가 열려 있을 때 -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
      aria-hidden="true"
      @click="emit('close')"
    />

    <aside
      :class="cn(
        'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-zinc-200 bg-white p-6 transition-transform duration-300 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )"
    >
      <div class="mb-8 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-lg bg-pink-500" />
          <span class="text-xl font-bold tracking-tight">Cake Admin</span>
        </div>
        <button
          type="button"
          class="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 lg:hidden"
          aria-label="사이드바 닫기"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <nav class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.href"
          :to="item.href"
          :class="cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            route.path === item.href
              ? 'bg-pink-50 text-pink-600'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
          )"
          @click="emit('close')"
        >
          <component :is="item.icon" :size="20" />
          <span class="flex-1">{{ item.label }}</span>
          <span
            v-if="item.href === '/admin/chat' && auth.isLoggedIn && chat.unreadTotal > 0"
            class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1.5 text-[11px] font-bold text-white"
          >
            {{ chat.unreadTotal }}
          </span>
        </NuxtLink>
      </nav>

      <div class="mt-auto pt-6">
        <template v-if="!auth.isLoading">
          <button
            v-if="auth.isLoggedIn"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            @click="auth.logout()"
          >
            <LogOut :size="20" />
            로그아웃
          </button>
          <NuxtLink
            v-else
            to="/login"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <LogOut :size="20" class="rotate-180" />
            로그인
          </NuxtLink>
        </template>
      </div>
    </aside>
  </div>
</template>
