<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { User } from "lucide-vue-next";
import type { UserInfo } from "~/api/types";

// 부모는 반드시 `relative` 컨테이너여야 함 — popover 가 absolute right-0 으로 정렬됨.
const props = defineProps<{
  userInfo: UserInfo | null;
  isOpen: boolean;
}>();
const emit = defineEmits<{ close: [] }>();

const PROVIDER_LABEL: Record<UserInfo["provider"], string> = {
  KAKAO: "카카오 계정",
  ADMIN: "관리자 계정",
};
const PROVIDER_BADGE: Record<UserInfo["provider"], string> = {
  KAKAO: "bg-amber-50 text-amber-700",
  ADMIN: "bg-zinc-100 text-zinc-700",
};

const rootRef = ref<HTMLElement | null>(null);

// mousedown 으로 잡아야 toggle 버튼 클릭 시 즉시 close → 재오픈 사이클 발생 방지
function handleMouseDown(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) emit("close");
}
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    }
  },
);

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleMouseDown);
  document.removeEventListener("keydown", handleKeyDown);
});

function hideImage(e: Event) {
  (e.target as HTMLImageElement).style.display = "none";
}
</script>

<template>
  <div
    v-if="isOpen && userInfo"
    ref="rootRef"
    role="dialog"
    aria-label="내 정보"
    class="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
  >
    <div class="flex items-center gap-3 border-b border-zinc-100 p-4">
      <div class="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100 text-zinc-400">
        <img
          v-if="userInfo.profileImageUrl"
          :src="userInfo.profileImageUrl"
          :alt="userInfo.nickname"
          class="h-full w-full object-cover"
          @error="hideImage"
        />
        <User v-else :size="48" class="p-2" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-zinc-900">{{ userInfo.nickname }}</p>
        <p v-if="userInfo.email" class="truncate text-xs text-zinc-500">{{ userInfo.email }}</p>
      </div>
    </div>
    <div class="p-3">
      <span
        class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
        :class="PROVIDER_BADGE[userInfo.provider]"
      >
        {{ PROVIDER_LABEL[userInfo.provider] }}
      </span>
    </div>
  </div>
</template>
