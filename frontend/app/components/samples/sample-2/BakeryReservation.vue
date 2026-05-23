<script setup lang="ts">
import { computed, ref } from "vue";
import { Cake, Calendar, Check, MessageSquareHeart, Ruler } from "lucide-vue-next";

interface Menu {
  id: string;
  name: string;
  ko: string;
  price: number;
}

const menus: Menu[] = [
  { id: "fraise", name: "Fraise des Bois", ko: "생딸기 생크림", price: 48000 },
  { id: "cassis", name: "Cassis Royale", ko: "까시스 무스", price: 52000 },
  { id: "noir", name: "Chocolat Noir 70%", ko: "다크 가나슈", price: 46000 },
  { id: "pistache", name: "Pistache & Framboise", ko: "피스타치오 라즈베리", price: 56000 },
];

const sizes = [
  { id: "1", label: "1호", desc: "지름 15cm · 2~3인", extra: 0 },
  { id: "2", label: "2호", desc: "지름 18cm · 4~5인", extra: 12000 },
  { id: "3", label: "3호", desc: "지름 21cm · 6~7인", extra: 24000 },
] as const;

const timeSlots = ["11:00", "13:00", "15:00", "17:00", "19:00"];

// 각 step 별 이미지 — 단계가 바뀔 때마다 cross-fade.
const stepImages = [
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1551879400-111a9087cd86?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=1000&q=80",
];

const steps = [
  { icon: Cake, label: "메뉴" },
  { icon: Ruler, label: "사이즈" },
  { icon: Calendar, label: "픽업" },
  { icon: MessageSquareHeart, label: "메시지" },
  { icon: Check, label: "완료" },
];

const step = ref(0);
const selected = ref({
  menuId: "" as string,
  sizeId: "" as string,
  date: "",
  time: "",
  message: "",
});

const selectedMenu = computed(() => menus.find((m) => m.id === selected.value.menuId) ?? null);
const selectedSize = computed(() => sizes.find((s) => s.id === selected.value.sizeId) ?? null);
const totalPrice = computed(
  () => (selectedMenu.value?.price ?? 0) + (selectedSize.value?.extra ?? 0),
);

function canNext(): boolean {
  if (step.value === 0) return !!selected.value.menuId;
  if (step.value === 1) return !!selected.value.sizeId;
  if (step.value === 2) return !!selected.value.date && !!selected.value.time;
  if (step.value === 3) return true;
  return false;
}
function next() {
  if (canNext() && step.value < 4) step.value += 1;
}
function prev() {
  if (step.value > 0) step.value -= 1;
}
function reset() {
  step.value = 0;
  selected.value = { menuId: "", sizeId: "", date: "", time: "", message: "" };
}

// 픽업 가능 날짜 — 모레부터 7일.
const dateOptions = computed(() => {
  const out: { value: string; label: string; weekday: string }[] = [];
  const week = ["일", "월", "화", "수", "목", "금", "토"];
  const base = new Date();
  for (let i = 2; i < 9; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const value = `${d.getMonth() + 1}/${d.getDate()}`;
    out.push({ value, label: value, weekday: week[d.getDay()]! });
  }
  return out;
});
</script>

<template>
  <section id="reserve" class="bg-gradient-to-b from-amber-50/60 to-rose-50/40 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="mb-10 text-center sm:mb-14">
        <p class="font-serif text-sm italic text-rose-500">— reservation</p>
        <h2 class="mt-2 font-serif text-4xl font-light tracking-tight text-stone-900 sm:text-5xl">
          홀케이크는 이틀 전 예약
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
          모든 케이크는 픽업일 아침에 굽습니다. 픽업 2일 전까지 주문 부탁드려요.
        </p>
      </div>

      <div class="grid gap-8 overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-40px_rgba(190,90,90,0.3)] lg:grid-cols-[1fr_1.05fr]">
        <!-- 좌측: 일러스트 이미지 (step 별 cross-fade) -->
        <div class="relative aspect-[5/4] overflow-hidden bg-rose-50 lg:aspect-auto">
          <div
            v-for="(src, idx) in stepImages"
            :key="src"
            :class="[
              'absolute inset-0 transition-opacity duration-700',
              step === idx ? 'opacity-100' : 'opacity-0',
            ]"
          >
            <img :src="src" alt="" class="h-full w-full object-cover" />
          </div>
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-rose-900/30 via-transparent to-transparent" />
          <span class="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 font-serif text-xs italic text-stone-700 backdrop-blur">
            step {{ step + 1 }} / 5 — {{ steps[step]!.label }}
          </span>
        </div>

        <!-- 우측: 폼 -->
        <div class="flex flex-col p-7 sm:p-10">
          <!-- step indicator -->
          <ol class="mb-7 flex items-center gap-1.5">
            <li
              v-for="(s, idx) in steps"
              :key="s.label"
              :class="[
                'h-1 flex-1 rounded-full transition-all duration-500',
                idx <= step ? 'bg-rose-500' : 'bg-stone-200',
              ]"
            />
          </ol>

          <div class="flex-1">
            <!-- STEP 0 메뉴 -->
            <div v-if="step === 0">
              <h3 class="font-serif text-2xl text-stone-900">어떤 케이크가 좋으세요?</h3>
              <ul class="mt-5 grid grid-cols-2 gap-3">
                <li v-for="m in menus" :key="m.id">
                  <button
                    type="button"
                    :class="[
                      'flex w-full flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-200',
                      selected.menuId === m.id
                        ? 'border-rose-400 bg-rose-50/60 ring-2 ring-rose-200'
                        : 'border-stone-200 bg-white hover:border-rose-300 hover:bg-rose-50/30',
                    ]"
                    @click="selected.menuId = m.id"
                  >
                    <span class="font-serif text-base text-stone-900">{{ m.name }}</span>
                    <span class="font-serif text-xs italic text-rose-500">{{ m.ko }}</span>
                    <span class="mt-1 text-xs text-stone-500">₩{{ m.price.toLocaleString() }}</span>
                  </button>
                </li>
              </ul>
            </div>

            <!-- STEP 1 사이즈 -->
            <div v-else-if="step === 1">
              <h3 class="font-serif text-2xl text-stone-900">몇 명이 함께 드실 거예요?</h3>
              <ul class="mt-5 space-y-2.5">
                <li v-for="s in sizes" :key="s.id">
                  <button
                    type="button"
                    :class="[
                      'flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200',
                      selected.sizeId === s.id
                        ? 'border-rose-400 bg-rose-50/60 ring-2 ring-rose-200'
                        : 'border-stone-200 bg-white hover:border-rose-300 hover:bg-rose-50/30',
                    ]"
                    @click="selected.sizeId = s.id"
                  >
                    <div>
                      <p class="font-serif text-lg text-stone-900">{{ s.label }}</p>
                      <p class="text-xs text-stone-500">{{ s.desc }}</p>
                    </div>
                    <span class="text-xs font-medium text-rose-600">
                      {{ s.extra > 0 ? `+ ₩${s.extra.toLocaleString()}` : "기본" }}
                    </span>
                  </button>
                </li>
              </ul>
            </div>

            <!-- STEP 2 픽업 -->
            <div v-else-if="step === 2">
              <h3 class="font-serif text-2xl text-stone-900">언제 가지러 오실까요?</h3>
              <p class="mt-1 text-xs text-stone-500">픽업 가능한 날짜와 시간을 선택해 주세요.</p>
              <div class="mt-5">
                <p class="text-xs font-medium uppercase tracking-wider text-stone-500">날짜</p>
                <ul class="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  <li v-for="d in dateOptions" :key="d.value">
                    <button
                      type="button"
                      :class="[
                        'flex w-full flex-col items-center rounded-xl border py-2 transition-all duration-200',
                        selected.date === d.value
                          ? 'border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                          : 'border-stone-200 text-stone-600 hover:border-rose-300',
                      ]"
                      @click="selected.date = d.value"
                    >
                      <span class="text-[10px] uppercase tracking-wider opacity-70">{{ d.weekday }}</span>
                      <span class="text-sm font-medium">{{ d.label }}</span>
                    </button>
                  </li>
                </ul>
              </div>
              <div class="mt-5">
                <p class="text-xs font-medium uppercase tracking-wider text-stone-500">시간</p>
                <ul class="mt-2 flex flex-wrap gap-2">
                  <li v-for="t in timeSlots" :key="t">
                    <button
                      type="button"
                      :class="[
                        'rounded-full border px-4 py-1.5 text-sm transition-colors',
                        selected.time === t
                          ? 'border-rose-400 bg-rose-500 text-white'
                          : 'border-stone-200 text-stone-700 hover:border-rose-300',
                      ]"
                      @click="selected.time = t"
                    >
                      {{ t }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- STEP 3 메시지 -->
            <div v-else-if="step === 3">
              <h3 class="font-serif text-2xl text-stone-900">전하실 말 있으세요?</h3>
              <p class="mt-1 text-xs text-stone-500">레터링·알러지·기념일 메모 모두 좋아요.</p>
              <textarea
                v-model="selected.message"
                rows="5"
                placeholder="예: 생일축하해 ♡ 라고 레터링 부탁드려요"
                class="mt-5 w-full resize-none rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-800 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <!-- STEP 4 완료 -->
            <div v-else-if="step === 4">
              <div class="flex flex-col items-center text-center">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <Check :size="28" />
                </div>
                <h3 class="mt-5 font-serif text-3xl text-stone-900">예약이 접수됐어요</h3>
                <p class="mt-2 text-sm leading-relaxed text-stone-600">
                  확인 카카오톡을 곧 보내드릴게요. 픽업일에 뵙겠습니다.
                </p>
                <dl class="mt-7 w-full space-y-2 rounded-2xl bg-rose-50/60 p-5 text-sm">
                  <div class="flex justify-between"><dt class="text-stone-500">메뉴</dt><dd class="font-medium text-stone-800">{{ selectedMenu?.name }}</dd></div>
                  <div class="flex justify-between"><dt class="text-stone-500">사이즈</dt><dd class="font-medium text-stone-800">{{ selectedSize?.label }}</dd></div>
                  <div class="flex justify-between"><dt class="text-stone-500">픽업</dt><dd class="font-medium text-stone-800">{{ selected.date }} · {{ selected.time }}</dd></div>
                  <div class="flex justify-between border-t border-rose-100 pt-2"><dt class="text-stone-500">합계</dt><dd class="font-serif text-lg text-rose-700">₩{{ totalPrice.toLocaleString() }}</dd></div>
                </dl>
                <button
                  type="button"
                  class="mt-6 text-xs font-medium uppercase tracking-wider text-stone-500 underline-offset-4 hover:text-rose-600 hover:underline"
                  @click="reset"
                >
                  새 예약 시작하기
                </button>
              </div>
            </div>
          </div>

          <!-- nav buttons -->
          <div v-if="step < 4" class="mt-8 flex items-center justify-between gap-3 border-t border-stone-100 pt-6">
            <button
              type="button"
              class="text-sm font-medium text-stone-500 disabled:opacity-30"
              :disabled="step === 0"
              @click="prev"
            >
              ← 이전
            </button>
            <div class="text-xs text-stone-500">
              <span v-if="selectedMenu">{{ selectedMenu.name }}</span>
              <span v-if="selectedSize"> · {{ selectedSize.label }}</span>
              <span v-if="totalPrice"> · ₩{{ totalPrice.toLocaleString() }}</span>
            </div>
            <button
              type="button"
              :class="[
                'inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-all',
                canNext()
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'cursor-not-allowed bg-stone-200 text-stone-400',
              ]"
              :disabled="!canNext()"
              @click="next"
            >
              {{ step === 3 ? "예약 확정" : "다음" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
