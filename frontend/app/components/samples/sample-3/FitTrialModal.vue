<script setup lang="ts">
import { ref, watch } from "vue";
import { Check, X } from "lucide-vue-next";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const form = ref({ name: "", phone: "", goal: "" });
const submitted = ref(false);

const goals = ["다이어트", "근육 증가", "체형 교정", "체력 강화"];

watch(
  () => props.open,
  (v) => {
    if (v) {
      submitted.value = false;
      form.value = { name: "", phone: "", goal: "" };
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);

function submit() {
  if (!form.value.name || !form.value.phone) return;
  submitted.value = true;
}

function onBackdropMouseDown(e: MouseEvent) {
  if (e.target === e.currentTarget) emit("close");
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      @mousedown="onBackdropMouseDown"
    >
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="open"
          class="relative w-full max-w-md border border-lime-300/30 bg-zinc-950 p-7 shadow-[0_0_80px_-20px_rgba(190,242,100,0.5)] sm:p-9"
        >
          <button
            type="button"
            class="absolute right-4 top-4 text-zinc-500 transition-colors hover:text-white"
            aria-label="닫기"
            @click="emit('close')"
          >
            <X :size="20" />
          </button>

          <template v-if="!submitted">
            <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-lime-300">— free trial</p>
            <h3 class="mt-3 font-black uppercase leading-tight tracking-tight text-white text-3xl">
              첫 세션 무료.<br />그 다음은 당신 선택.
            </h3>

            <form class="mt-7 space-y-4" @submit.prevent="submit">
              <div>
                <label class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">이름</label>
                <input
                  v-model="form.name"
                  required
                  type="text"
                  placeholder="홍길동"
                  class="mt-1.5 h-12 w-full border-b border-white/10 bg-transparent px-1 text-sm text-white placeholder:text-zinc-600 focus:border-lime-300 focus:outline-none"
                />
              </div>
              <div>
                <label class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">연락처</label>
                <input
                  v-model="form.phone"
                  required
                  type="tel"
                  placeholder="010-0000-0000"
                  class="mt-1.5 h-12 w-full border-b border-white/10 bg-transparent px-1 text-sm text-white placeholder:text-zinc-600 focus:border-lime-300 focus:outline-none"
                />
              </div>
              <div>
                <label class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">목표</label>
                <div class="mt-2 flex flex-wrap gap-2">
                  <button
                    v-for="g in goals"
                    :key="g"
                    type="button"
                    :class="[
                      'border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors',
                      form.goal === g
                        ? 'border-lime-300 bg-lime-300 text-black'
                        : 'border-white/15 text-zinc-300 hover:border-white/40',
                    ]"
                    @click="form.goal = g"
                  >
                    {{ g }}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                class="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 bg-lime-300 text-sm font-black uppercase tracking-wider text-black transition-colors hover:bg-lime-200"
              >
                예약 신청 →
              </button>
              <p class="text-center text-[10px] text-zinc-500">
                전송 즉시 IRONHAUS 매니저가 24시간 안에 연락드립니다.
              </p>
            </form>
          </template>

          <template v-else>
            <div class="text-center">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-300 text-black">
                <Check :size="32" :stroke-width="3" />
              </div>
              <h3 class="mt-5 font-black uppercase tracking-tight text-white text-3xl">
                예약 완료
              </h3>
              <p class="mt-3 text-sm text-zinc-400">
                {{ form.name }} 님, 곧 {{ form.phone }} 로 연락드릴게요.
                {{ form.goal ? `목표: ${form.goal}` : "" }}
              </p>
              <button
                type="button"
                class="mt-7 text-[10px] font-bold uppercase tracking-wider text-zinc-500 underline-offset-4 hover:text-lime-300 hover:underline"
                @click="emit('close')"
              >
                닫기
              </button>
            </div>
          </template>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
