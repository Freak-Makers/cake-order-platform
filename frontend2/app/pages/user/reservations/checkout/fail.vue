<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { failPayment } from "~/api/payment.api";

const route = useRoute();
const router = useRouter();

const code = route.query.code as string | undefined;
const message = route.query.message as string | undefined;
const orderId = route.query.orderId as string | undefined;
const reservationIdStr = route.query.reservationId as string | undefined;
const reservationId = reservationIdStr ? Number(reservationIdStr) : null;

let recorded = false;

onMounted(() => {
  if (recorded) return;
  if (!reservationId || !code || !message) return;
  recorded = true;

  // 백엔드 감사 로그용. 실패해도 토스트가 사용자에게 알림 — 페이지엔 별도 UI 표시 안 함.
  failPayment({
    reservationId,
    paymentKey: null,
    orderId: orderId ?? null,
    code,
    message,
  }).catch((e) => {
    console.error("Failed to record payment failure:", e);
  });
});
</script>

<template>
  <UserLayout>
    <div class="mx-auto max-w-xl space-y-6 text-center">
      <h1 class="text-xl font-bold text-red-600 sm:text-2xl">결제가 취소되었거나 실패했습니다</h1>
      <div class="space-y-1 rounded-lg bg-red-50 p-4 text-left text-sm text-red-700">
        <p v-if="code"><span class="font-medium">code</span>: {{ code }}</p>
        <p v-if="message"><span class="font-medium">message</span>: {{ message }}</p>
        <p v-if="orderId"><span class="font-medium">orderId</span>: {{ orderId }}</p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          v-if="reservationId"
          class="w-full bg-pink-500 hover:bg-pink-600 sm:flex-1"
          @click="router.push(`/user/reservations/${reservationId}/checkout`)"
        >
          다시 결제하기
        </Button>
        <Button variant="outline" class="w-full sm:flex-1" @click="router.push('/user/reservations')">
          내 예약으로 돌아가기
        </Button>
      </div>
    </div>
  </UserLayout>
</template>
