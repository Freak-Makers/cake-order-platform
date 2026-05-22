<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ChevronLeft, ChevronRight, Plus, Trash2, Wand2, X } from "lucide-vue-next";
import { createSlot, deleteSlot, getAdminSlots } from "~/api/reservation.api";
import type { ReservationSlot } from "~/api/types";

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const CAL_HEADER = ["일", "월", "화", "수", "목", "금", "토"];
const INTERVAL_OPTIONS = [15, 30, 60, 90, 120];

// JS Date.getDay() 0=일,1=월,...,6=토 → 폼 인덱스(월=0...일=6) 로 변환
function jsDayToIdx(jsDay: number): number {
  return (jsDay + 6) % 7;
}
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function splitDateTime(startAt: string): { date: string; time: string } {
  const d = new Date(startAt);
  return {
    date: formatYmd(d),
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}
function enumerateDates(startStr: string, endStr: string, weekdayFlags: boolean[]): Date[] {
  if (!startStr || !endStr) return [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (start > end) return [];

  const out: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const idx = jsDayToIdx(cursor.getDay());
    if (weekdayFlags[idx]) out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
function parseHM(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}
function fillTimes(startHM: string, endHM: string, intervalMin: number): string[] {
  const startMin = parseHM(startHM);
  const endMin = parseHM(endHM);
  if (startMin == null || endMin == null) return [];
  if (intervalMin <= 0) return [];
  if (endMin <= startMin) return [];

  const out: string[] = [];
  for (let m = startMin; m < endMin; m += intervalMin) {
    out.push(`${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`);
  }
  return out;
}
function startOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
// 6주 × 7일 grid (일요일 시작). 이전/다음 달 날짜로 채움.
function getMonthMatrix(viewMonth: Date): Date[][] {
  const first = startOfMonth(viewMonth);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

const slots = ref<ReservationSlot[]>([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

// 폼 상태 (기간/요일/시간)
const startDate = ref("");
const endDate = ref("");
const weekdays = ref<boolean[]>([true, true, true, true, true, true, true]);
const fillStart = ref("10:00");
const fillEnd = ref("18:00");
const fillInterval = ref(60);
const times = ref<string[]>([""]);

// 달력 뷰 상태
const viewMonth = ref<Date>(startOfMonth(new Date()));
const selectedDate = ref<string | null>(null);

async function fetchSlots() {
  try {
    slots.value = await getAdminSlots();
  } catch (e) {
    console.error("Failed to fetch slots:", e);
  } finally {
    isLoading.value = false;
  }
}
onMounted(fetchSlots);

// === 폼 핸들러 ===
function handleAddTime() {
  times.value = [...times.value, ""];
}
function handleRemoveTime(idx: number) {
  times.value = times.value.length === 1 ? [""] : times.value.filter((_, i) => i !== idx);
}
function handleFillTimes() {
  const filled = fillTimes(fillStart.value, fillEnd.value, fillInterval.value);
  if (filled.length === 0) {
    error.value = "자동 채우기 입력을 확인하세요 (시작 < 종료, 간격 > 0).";
    return;
  }
  error.value = null;
  times.value = filled;
}
function setAllWeekdays(value: boolean) {
  weekdays.value = Array(7).fill(value);
}
function setWeekdaysOnly() {
  weekdays.value = [true, true, true, true, true, false, false];
}
function setWeekendOnly() {
  weekdays.value = [false, false, false, false, false, true, true];
}
function toggleWeekday(idx: number) {
  weekdays.value = weekdays.value.map((v, i) => (i === idx ? !v : v));
}

const previewCount = computed(() => {
  const dates = enumerateDates(startDate.value, endDate.value, weekdays.value);
  const cleanTimes = times.value.map((t) => t.trim()).filter(Boolean);
  return dates.length * cleanTimes.length;
});

async function handleSubmit() {
  error.value = null;

  const dates = enumerateDates(startDate.value, endDate.value, weekdays.value);
  const cleanTimes = Array.from(new Set(times.value.map((t) => t.trim()).filter(Boolean)));

  if (!startDate.value || !endDate.value) {
    error.value = "기간을 선택하세요.";
    return;
  }
  if (new Date(startDate.value) > new Date(endDate.value)) {
    error.value = "시작일이 종료일보다 늦습니다.";
    return;
  }
  if (dates.length === 0) {
    error.value = "선택한 요일에 해당하는 날짜가 없습니다.";
    return;
  }
  if (cleanTimes.length === 0) {
    error.value = "시간을 하나 이상 입력하세요.";
    return;
  }

  isSubmitting.value = true;
  let createdTotal = 0;
  const attemptedTotal = dates.length * cleanTimes.length;
  try {
    for (const d of dates) {
      const created = await createSlot({ date: formatYmd(d), times: cleanTimes });
      createdTotal += created.length;
    }
    const skipped = attemptedTotal - createdTotal;
    alert(`${createdTotal}개 슬롯 생성 (요청 ${attemptedTotal}개 중 ${skipped}개는 중복으로 skip)`);
    times.value = [""];
    await fetchSlots();
  } catch (err) {
    console.error("Failed to create slots:", err);
    error.value = "슬롯 생성 중 오류가 발생했습니다.";
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete(id: number) {
  if (!confirm("해당 슬롯을 삭제하시겠습니까?")) return;
  try {
    await deleteSlot(id);
    await fetchSlots();
  } catch (e) {
    console.error("Failed to delete slot:", e);
  }
}

// === 달력 데이터 ===
const slotsByDate = computed(() => {
  const map: Record<string, ReservationSlot[]> = {};
  slots.value.forEach((s) => {
    const { date } = splitDateTime(s.startAt);
    (map[date] ??= []).push(s);
  });
  Object.values(map).forEach((arr) => arr.sort((a, b) => a.startAt.localeCompare(b.startAt)));
  return map;
});

const monthMatrix = computed(() => getMonthMatrix(viewMonth.value));
const todayYmd = formatYmd(new Date());
const slotsForSelected = computed(() =>
  selectedDate.value ? slotsByDate.value[selectedDate.value] ?? [] : [],
);
const selectedTimesCount = computed(() => times.value.filter((t) => t.trim()).length);

function handlePrevMonth() {
  viewMonth.value = addMonths(viewMonth.value, -1);
}
function handleNextMonth() {
  viewMonth.value = addMonths(viewMonth.value, 1);
}
function handleToday() {
  const today = new Date();
  viewMonth.value = startOfMonth(today);
  selectedDate.value = formatYmd(today);
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 sm:space-y-8">
      <div>
        <h1 class="text-xl font-bold text-zinc-900 sm:text-2xl">예약 가능 슬롯 관리</h1>
        <p class="mt-1 text-sm text-zinc-500">
          기간·요일·시간을 골라 한 번에 여러 슬롯을 만들 수 있습니다. 중복된 시간은 자동으로 건너뜁니다.
        </p>
      </div>

      <!-- 등록 폼 -->
      <Card>
        <CardContent class="p-4 sm:p-6">
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <section class="space-y-2">
              <h2 class="text-sm font-bold text-zinc-900">1. 예약 가능 기간</h2>
              <div class="flex flex-wrap items-center gap-2">
                <input
                  v-model="startDate"
                  type="date"
                  class="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                />
                <span class="text-zinc-400">~</span>
                <input
                  v-model="endDate"
                  type="date"
                  class="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                />
              </div>
            </section>

            <section class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-sm font-bold text-zinc-900">2. 요일</h2>
                <div class="flex gap-1 text-xs">
                  <button type="button" class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 hover:bg-zinc-50" @click="setAllWeekdays(true)">전체</button>
                  <button type="button" class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 hover:bg-zinc-50" @click="setWeekdaysOnly">평일</button>
                  <button type="button" class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 hover:bg-zinc-50" @click="setWeekendOnly">주말</button>
                  <button type="button" class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 hover:bg-zinc-50" @click="setAllWeekdays(false)">해제</button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(label, idx) in WEEKDAY_LABELS"
                  :key="label"
                  type="button"
                  :class="[
                    'h-10 w-10 rounded-full border text-sm font-bold transition',
                    weekdays[idx]
                      ? 'border-pink-500 bg-pink-50 text-pink-600'
                      : 'border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50',
                  ]"
                  @click="toggleWeekday(idx)"
                >
                  {{ label }}
                </button>
              </div>
            </section>

            <section class="space-y-3">
              <h2 class="text-sm font-bold text-zinc-900">3. 시간</h2>

              <div class="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 p-3">
                <div>
                  <label class="mb-1 block text-xs text-zinc-500">시작 시각</label>
                  <input v-model="fillStart" type="time" class="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none" />
                </div>
                <span class="pb-2 text-zinc-400">~</span>
                <div>
                  <label class="mb-1 block text-xs text-zinc-500">종료 시각</label>
                  <input v-model="fillEnd" type="time" class="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none" />
                </div>
                <div>
                  <label class="mb-1 block text-xs text-zinc-500">간격</label>
                  <select v-model.number="fillInterval" class="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none">
                    <option v-for="m in INTERVAL_OPTIONS" :key="m" :value="m">{{ m }}분</option>
                  </select>
                </div>
                <Button type="button" variant="outline" class="gap-1" @click="handleFillTimes">
                  <Wand2 :size="14" />
                  채우기
                </Button>
              </div>

              <div>
                <p class="mb-1 text-xs text-zinc-500">선택된 시간 ({{ selectedTimesCount }}개)</p>
                <ul class="flex flex-wrap gap-2">
                  <li v-for="(t, idx) in times" :key="idx" class="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1">
                    <input v-model="times[idx]" type="time" class="w-24 border-0 bg-transparent text-sm focus:outline-none" />
                    <button type="button" class="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" aria-label="시간 제거" @click="handleRemoveTime(idx)">
                      <X :size="14" />
                    </button>
                  </li>
                  <li>
                    <button type="button" class="flex h-full items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50" @click="handleAddTime">
                      <Plus :size="14" /> 추가
                    </button>
                  </li>
                </ul>
              </div>
            </section>

            <div class="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
              <p class="text-sm text-zinc-500">
                예상 생성 슬롯: <span class="font-bold text-zinc-900">{{ previewCount }}</span>개
                <span class="text-xs text-zinc-400"> (중복은 자동 skip)</span>
              </p>
              <Button type="submit" :disabled="isSubmitting || previewCount === 0" class="bg-pink-500 hover:bg-pink-600">
                {{ isSubmitting ? "등록 중..." : "등록" }}
              </Button>
            </div>

            <div v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</div>
          </form>
        </CardContent>
      </Card>

      <!-- 달력 뷰 -->
      <div class="space-y-3">
        <h2 class="text-lg font-bold">등록된 슬롯</h2>

        <Card>
          <CardContent class="p-3 sm:p-6">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-1">
                <button type="button" class="rounded-md p-2 text-zinc-500 hover:bg-zinc-100" aria-label="이전 달" @click="handlePrevMonth">
                  <ChevronLeft :size="18" />
                </button>
                <h3 class="px-2 text-base font-bold text-zinc-900">
                  {{ viewMonth.getFullYear() }}년 {{ viewMonth.getMonth() + 1 }}월
                </h3>
                <button type="button" class="rounded-md p-2 text-zinc-500 hover:bg-zinc-100" aria-label="다음 달" @click="handleNextMonth">
                  <ChevronRight :size="18" />
                </button>
              </div>
              <Button size="sm" variant="outline" @click="handleToday">오늘</Button>
            </div>

            <div class="grid grid-cols-7 border-b border-zinc-100 pb-2 text-center text-xs font-medium text-zinc-400">
              <div
                v-for="(label, i) in CAL_HEADER"
                :key="label"
                :class="i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''"
              >
                {{ label }}
              </div>
            </div>

            <div class="mt-2 grid grid-cols-7 gap-1">
              <button
                v-for="d in monthMatrix.flat()"
                :key="formatYmd(d) + (d.getMonth() === viewMonth.getMonth() ? '' : '-out')"
                type="button"
                :class="[
                  'relative flex aspect-square flex-col items-center justify-start gap-0.5 rounded-md border p-1 text-xs transition sm:p-1.5',
                  formatYmd(d) === selectedDate ? 'border-pink-500 bg-pink-50' : 'border-transparent hover:bg-zinc-50',
                  d.getMonth() === viewMonth.getMonth() ? '' : 'opacity-40',
                ]"
                @click="selectedDate = formatYmd(d)"
              >
                <span
                  :class="[
                    'leading-none',
                    formatYmd(d) === todayYmd ? 'font-bold text-blue-600' : '',
                    formatYmd(d) !== todayYmd && d.getDay() === 0 ? 'text-red-500' : '',
                    formatYmd(d) !== todayYmd && d.getDay() === 6 ? 'text-blue-500' : '',
                    formatYmd(d) !== todayYmd && d.getDay() !== 0 && d.getDay() !== 6 ? 'text-zinc-700' : '',
                  ]"
                >
                  {{ d.getDate() }}
                </span>
                <template v-if="(slotsByDate[formatYmd(d)]?.length ?? 0) > 0">
                  <span class="mt-auto inline-block h-1.5 w-1.5 rounded-full bg-pink-500" />
                  <span class="text-[10px] font-bold text-pink-600">{{ slotsByDate[formatYmd(d)]?.length }}</span>
                </template>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4 sm:p-6">
            <p v-if="isLoading" class="text-zinc-500">불러오는 중...</p>
            <p v-else-if="!selectedDate" class="text-sm text-zinc-400">
              달력에서 날짜를 선택하면 등록된 시간대를 볼 수 있습니다.
            </p>
            <div v-else class="space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-bold text-zinc-900">
                  {{ selectedDate }}
                  <span class="text-xs font-medium text-zinc-500">({{ slotsForSelected.length }}개)</span>
                </p>
              </div>
              <p v-if="slotsForSelected.length === 0" class="text-sm text-zinc-400">
                이 날짜에 등록된 슬롯이 없습니다.
              </p>
              <ul v-else class="flex flex-wrap gap-2">
                <li
                  v-for="s in slotsForSelected"
                  :key="s.id"
                  class="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  {{ splitDateTime(s.startAt).time }}
                  <button class="text-zinc-400 hover:text-red-500" aria-label="삭제" @click="handleDelete(s.id)">
                    <Trash2 :size="12" />
                  </button>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>
