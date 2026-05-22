<script setup lang="ts">
import { computed, markRaw, onMounted, ref } from "vue";
import { ShoppingBag, Users, TrendingUp, Clock, Loader2 } from "lucide-vue-next";
import { formatPrice } from "~/utils/format";
import { getAdminReservationsPage } from "~/api/reservation.api";
import { getDashboardStats, type AdminDashboardStats } from "~/api/dashboard.api";
import type { AdminReservation } from "~/api/types";
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();
const isAdmin = computed(() => auth.isLoggedIn && auth.role === "ADMIN");

const STATUS_LABEL: Record<AdminReservation["status"], string> = {
  REQUESTED: "신청",
  CONFIRMED: "확정",
  PAID: "결제 완료",
  COMPLETED: "픽업 완료",
  CANCELLED: "취소",
};

const STATUS_BADGE: Record<AdminReservation["status"], string> = {
  REQUESTED: "bg-amber-50 text-amber-600",
  CONFIRMED: "bg-blue-50 text-blue-600",
  PAID: "bg-purple-50 text-purple-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-600",
};

const STAT_META = [
  { key: "todayReservationCount", label: "오늘의 예약", suffix: "건", icon: markRaw(ShoppingBag), color: "text-blue-600", bg: "bg-blue-50" },
  { key: "pendingReservationCount", label: "처리 대기", suffix: "건", icon: markRaw(Clock), color: "text-amber-600", bg: "bg-amber-50" },
  { key: "totalCustomerCount", label: "누적 고객 수", suffix: "명", icon: markRaw(Users), color: "text-purple-600", bg: "bg-purple-50" },
  { key: "totalRevenue", label: "누적 매출액", suffix: "", icon: markRaw(TrendingUp), color: "text-pink-600", bg: "bg-pink-50" },
] as const;

const stats = ref<AdminDashboardStats | null>(null);
const recent = ref<AdminReservation[]>([]);
const isLoading = ref(true);

const statCards = computed(() => {
  const s = stats.value;
  if (!s) return [];
  return STAT_META.map((m) => ({
    ...m,
    value: m.key === "totalRevenue" ? formatPrice(s.totalRevenue) : `${s[m.key]}${m.suffix}`,
  }));
});

onMounted(async () => {
  // 비로그인/일반 유저 가드 — DashboardLayout 이 redirect 를 처리하지만 한 박자 먼저 막음.
  if (auth.isLoading || !isAdmin.value) return;
  try {
    const [s, r] = await Promise.all([
      getDashboardStats(),
      getAdminReservationsPage({ offset: 0, limit: 5 }),
    ]);
    stats.value = s;
    recent.value = r.items;
  } catch (e) {
    console.error("Failed to fetch dashboard data:", e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <DashboardLayout>
    <div v-if="isLoading" class="flex h-64 items-center justify-center">
      <Loader2 class="h-8 w-8 animate-spin text-pink-500" />
    </div>

    <template v-else>
      <div class="mb-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <Card v-for="stat in statCards" :key="stat.label">
          <CardContent class="flex items-center gap-4 p-4 sm:p-6">
            <div class="rounded-xl p-3" :class="[stat.bg, stat.color]">
              <component :is="stat.icon" :size="24" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-zinc-500">{{ stat.label }}</p>
              <p class="truncate text-xl font-bold text-zinc-900 sm:text-2xl">{{ stat.value }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle>최근 예약 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-zinc-100 text-zinc-400">
                    <th class="pb-3 font-medium">예약 번호</th>
                    <th class="pb-3 font-medium">고객명</th>
                    <th class="pb-3 font-medium">상품</th>
                    <th class="pb-3 text-right font-medium">상태</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50">
                  <tr v-for="r in recent" :key="r.id" class="group">
                    <td class="py-4 font-medium text-zinc-900">{{ r.reservationNumber }}</td>
                    <td class="py-4 text-zinc-600">{{ r.customerName }}</td>
                    <td class="py-4 text-zinc-600">{{ r.productName }}</td>
                    <td class="py-4 text-right">
                      <span
                        class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                        :class="STATUS_BADGE[r.status]"
                      >
                        {{ STATUS_LABEL[r.status] }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="recent.length === 0">
                    <td colspan="4" class="py-10 text-center text-zinc-400">최근 예약이 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="rounded-lg bg-zinc-50 p-4">
                <p class="text-sm font-semibold text-zinc-900">백엔드 연결 상태</p>
                <p class="mt-1 flex items-center gap-1 text-xs font-medium text-green-600">
                  <span class="h-2 w-2 rounded-full bg-green-500" />
                  정상 작동 중
                </p>
              </div>
              <div class="rounded-lg bg-zinc-50 p-4">
                <p class="text-sm font-semibold text-zinc-900">실시간 데이터 동기화</p>
                <p class="mt-1 text-xs text-zinc-500">최근 업데이트: 방금 전</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </DashboardLayout>
</template>
