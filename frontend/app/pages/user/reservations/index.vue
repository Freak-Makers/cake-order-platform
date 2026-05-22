<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { cancelMyReservation, getMyReservations } from "~/api/reservation.api";
import { getMyPayments } from "~/api/payment.api";
import type { Payment, Reservation, ReservationStatus } from "~/api/types";
import { formatPrice } from "~/utils/format";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "확정 대기",
  CONFIRMED: "확정됨 (결제 필요)",
  PAID: "결제 완료",
  COMPLETED: "픽업 완료",
  CANCELLED: "취소됨",
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  REQUESTED: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PAID: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-zinc-100 text-zinc-500",
};

const router = useRouter();
const reservations = ref<Reservation[]>([]);
const paymentsByReservation = ref<Record<number, Payment>>({});
const isLoading = ref(true);

onMounted(async () => {
  try {
    const [reservs, payments] = await Promise.all([getMyReservations(), getMyPayments()]);
    reservations.value = reservs;
    const map: Record<number, Payment> = {};
    payments.forEach((p) => {
      map[p.reservationId] = p;
    });
    paymentsByReservation.value = map;
  } catch (e) {
    console.error("Failed to load reservations:", e);
  } finally {
    isLoading.value = false;
  }
});

function handlePay(id: number) {
  router.push(`/user/reservations/${id}/checkout`);
}

async function handleCancel(id: number) {
  if (!confirm("예약을 취소하시겠어요? 슬롯이 해제되어 다른 분이 예약할 수 있습니다.")) return;
  try {
    const updated = await cancelMyReservation(id);
    reservations.value = reservations.value.map((r) => (r.id === id ? updated : r));
  } catch (e) {
    console.error("Failed to cancel reservation:", e);
  }
}
</script>

<template>
  <UserLayout>
    <div class="space-y-6">
      <h1 class="text-xl font-bold text-zinc-900 sm:text-2xl">내 예약</h1>

      <p v-if="isLoading" class="text-zinc-500">불러오는 중...</p>

      <Card v-else-if="reservations.length === 0">
        <CardContent class="py-12 text-center text-zinc-500">아직 예약한 내역이 없습니다.</CardContent>
      </Card>

      <ul v-else class="space-y-3">
        <li v-for="r in reservations" :key="r.id">
          <Card>
            <CardContent class="p-4 sm:p-6">
              <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span class="text-xs font-medium text-zinc-400">{{ r.reservationNumber }}</span>
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      :class="STATUS_BADGE[r.status]"
                    >
                      {{ STATUS_LABEL[r.status] }}
                    </span>
                  </div>
                  <h2 class="text-base font-bold text-zinc-900 sm:text-lg">{{ r.productName }}</h2>
                  <p class="text-sm text-zinc-500">
                    픽업 {{ new Date(r.slotStartAt).toLocaleString("ko-KR") }} · 수량 {{ r.quantity }} ·
                    {{ formatPrice(r.totalPrice) }}
                  </p>
                  <p v-if="r.requirements" class="text-xs text-zinc-400">요청: {{ r.requirements }}</p>
                  <p v-if="paymentsByReservation[r.id]" class="text-xs text-purple-600">
                    결제 #{{ paymentsByReservation[r.id]!.id }} · {{ paymentsByReservation[r.id]!.status }}
                    <template v-if="paymentsByReservation[r.id]!.paidAt">
                      · {{ new Date(paymentsByReservation[r.id]!.paidAt!).toLocaleString() }}
                    </template>
                  </p>
                </div>
                <div class="flex shrink-0 flex-wrap gap-2">
                  <Button v-if="r.status === 'CONFIRMED'" class="flex-1 sm:flex-none" @click="handlePay(r.id)">
                    결제하기
                  </Button>
                  <Button
                    v-if="r.status === 'REQUESTED' || r.status === 'CONFIRMED'"
                    variant="outline"
                    class="flex-1 text-red-600 hover:bg-red-50 sm:flex-none"
                    @click="handleCancel(r.id)"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </li>
      </ul>
    </div>
  </UserLayout>
</template>
