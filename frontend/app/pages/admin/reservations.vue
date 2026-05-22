<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronLeft, ChevronRight, Search } from "lucide-vue-next";
import {
  type AdminReservationsDirection,
  type AdminReservationsSort,
  adminCancelReservation,
  confirmReservation,
  getAdminReservationsPage,
} from "~/api/reservation.api";
import type { AdminReservation, ReservationStatus } from "~/api/types";
import { formatPrice } from "~/utils/format";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "신청",
  CONFIRMED: "확정",
  PAID: "결제 완료",
  COMPLETED: "픽업 완료",
  CANCELLED: "취소",
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  REQUESTED: "bg-amber-50 text-amber-600",
  CONFIRMED: "bg-blue-50 text-blue-600",
  PAID: "bg-purple-50 text-purple-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-600",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS: { value: ReservationStatus | ""; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "REQUESTED", label: "신청" },
  { value: "CONFIRMED", label: "확정" },
  { value: "PAID", label: "결제 완료" },
  { value: "COMPLETED", label: "픽업 완료" },
  { value: "CANCELLED", label: "취소" },
];

const items = ref<AdminReservation[]>([]);
const total = ref(0);
const offset = ref(0);
const limit = ref(20);
const statusFilter = ref<ReservationStatus | "">("");
const keyword = ref("");
const debouncedKeyword = ref("");
const sortBy = ref<AdminReservationsSort>("createdAt");
const sortDir = ref<AdminReservationsDirection>("desc");
const isLoading = ref(true);
const confirmingId = ref<number | null>(null);

function handleSort(field: AdminReservationsSort) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDir.value = "desc";
  }
  offset.value = 0;
}

// 키워드 디바운스 (300ms)
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
watch(keyword, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = keyword.value.trim();
  }, 300);
});

// 키워드 변경 시 offset 0 으로
watch(debouncedKeyword, () => {
  offset.value = 0;
});

async function fetchReservations() {
  isLoading.value = true;
  try {
    const data = await getAdminReservationsPage({
      offset: offset.value,
      limit: limit.value,
      status: statusFilter.value || undefined,
      keyword: debouncedKeyword.value || undefined,
      sort: sortBy.value,
      direction: sortDir.value,
    });
    items.value = data.items;
    total.value = data.total;
    if (data.offset !== offset.value) offset.value = data.offset;
  } catch (e) {
    console.error("Failed to fetch reservations:", e);
  } finally {
    isLoading.value = false;
  }
}

watch(
  [offset, limit, statusFilter, debouncedKeyword, sortBy, sortDir],
  fetchReservations,
  { immediate: true },
);

async function handleConfirm(id: number) {
  confirmingId.value = id;
  try {
    await confirmReservation(id);
    await fetchReservations();
  } catch (e) {
    console.error("Failed to confirm reservation:", e);
  } finally {
    confirmingId.value = null;
  }
}

async function handleCancel(id: number) {
  if (!confirm("이 예약을 취소하시겠어요? PAID 상태라도 결제 row 는 그대로 — 환불은 별도로 처리해야 합니다.")) return;
  confirmingId.value = id;
  try {
    await adminCancelReservation(id);
    await fetchReservations();
  } catch (e) {
    console.error("Failed to cancel reservation:", e);
  } finally {
    confirmingId.value = null;
  }
}

function handleStatusChange() {
  offset.value = 0;
}
function handleLimitChange() {
  offset.value = 0;
}

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const canPrev = computed(() => offset.value >= limit.value);
const canNext = computed(() => offset.value + items.value.length < total.value);
const filterActive = computed(() => statusFilter.value !== "" || debouncedKeyword.value !== "");

function handlePrev() {
  if (canPrev.value) offset.value = Math.max(0, offset.value - limit.value);
}
function handleNext() {
  if (canNext.value) offset.value = offset.value + limit.value;
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-bold text-zinc-900 sm:text-2xl">예약 관리</h1>
          <p class="text-sm text-zinc-500">
            총 {{ total }}건<template v-if="filterActive"> (필터 적용)</template>
          </p>
        </div>
      </div>

      <!-- 필터 바 -->
      <Card>
        <CardContent class="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div class="w-full sm:w-auto">
            <label class="mb-1 block text-xs text-zinc-500">상태</label>
            <select
              v-model="statusFilter"
              class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-pink-500 focus:outline-none sm:w-auto"
              @change="handleStatusChange"
            >
              <option v-for="o in STATUS_OPTIONS" :key="o.value || 'all'" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </div>
          <div class="w-full flex-1 sm:min-w-[200px]">
            <label class="mb-1 block text-xs text-zinc-500">예약번호 검색</label>
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                v-model="keyword"
                type="text"
                placeholder="RES-... 일부 입력"
                class="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 테이블 -->
      <Card>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-zinc-100">
                <tr class="text-zinc-400">
                  <th class="px-6 py-4 font-medium">예약 번호</th>
                  <SortableTh field="createdAt" label="신청 시간" :sort-by="sortBy" :sort-dir="sortDir" @sort="handleSort" />
                  <th class="px-6 py-4 font-medium">고객</th>
                  <th class="px-6 py-4 font-medium">상품</th>
                  <SortableTh field="slotStartAt" label="픽업 일시" :sort-by="sortBy" :sort-dir="sortDir" @sort="handleSort" />
                  <SortableTh field="quantity" label="수량" :sort-by="sortBy" :sort-dir="sortDir" @sort="handleSort" />
                  <SortableTh field="totalPrice" label="금액" :sort-by="sortBy" :sort-dir="sortDir" @sort="handleSort" />
                  <SortableTh field="status" label="상태" :sort-by="sortBy" :sort-dir="sortDir" @sort="handleSort" />
                  <th class="px-6 py-4 text-right font-medium">액션</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-50">
                <tr v-if="isLoading">
                  <td colspan="9" class="py-10 text-center text-zinc-400">불러오는 중...</td>
                </tr>
                <tr v-else-if="items.length === 0">
                  <td colspan="9" class="py-10 text-center text-zinc-400">
                    {{ filterActive ? "조건에 맞는 예약이 없습니다." : "예약이 없습니다." }}
                  </td>
                </tr>
                <tr v-for="r in items" v-else :key="r.id" class="hover:bg-zinc-50/60">
                  <td class="px-6 py-4 font-medium text-zinc-900">{{ r.reservationNumber }}</td>
                  <td class="px-6 py-4 text-zinc-600">{{ new Date(r.createdAt).toLocaleString("ko-KR") }}</td>
                  <td class="px-6 py-4 text-zinc-600">{{ r.customerName }}</td>
                  <td class="px-6 py-4 text-zinc-600">{{ r.productName }}</td>
                  <td class="px-6 py-4 text-zinc-600">{{ new Date(r.slotStartAt).toLocaleString("ko-KR") }}</td>
                  <td class="px-6 py-4 text-zinc-600">{{ r.quantity }}</td>
                  <td class="px-6 py-4 text-zinc-600">{{ formatPrice(r.totalPrice) }}</td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      :class="STATUS_BADGE[r.status]"
                    >
                      {{ STATUS_LABEL[r.status] }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        v-if="r.status === 'REQUESTED'"
                        size="sm"
                        :disabled="confirmingId === r.id"
                        @click="handleConfirm(r.id)"
                      >
                        {{ confirmingId === r.id ? "확정 중..." : "확정" }}
                      </Button>
                      <Button
                        v-if="r.status !== 'CANCELLED' && r.status !== 'COMPLETED'"
                        size="sm"
                        variant="outline"
                        class="text-red-600 hover:bg-red-50"
                        :disabled="confirmingId === r.id"
                        @click="handleCancel(r.id)"
                      >
                        취소
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <!-- 페이지네이션 -->
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div class="flex items-center gap-2 text-zinc-500">
          <span>페이지당</span>
          <select
            v-model.number="limit"
            class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm focus:border-pink-500 focus:outline-none"
            @change="handleLimitChange"
          >
            <option v-for="n in PAGE_SIZE_OPTIONS" :key="n" :value="n">{{ n }}개</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-zinc-500">
            <span class="font-bold text-zinc-900">{{ currentPage }}</span> / {{ totalPages }} 페이지
          </span>
          <div class="flex gap-1">
            <Button size="sm" variant="outline" class="gap-1" :disabled="!canPrev || isLoading" @click="handlePrev">
              <ChevronLeft :size="14" />
              이전
            </Button>
            <Button size="sm" variant="outline" class="gap-1" :disabled="!canNext || isLoading" @click="handleNext">
              다음
              <ChevronRight :size="14" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
