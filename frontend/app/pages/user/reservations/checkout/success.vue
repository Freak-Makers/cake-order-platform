<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { confirmPayment } from "~/api/payment.api";

// 결제 성공 후 reservations 로 자동 이동까지 잠깐 노출하는 시간(ms).
const REDIRECT_DELAY_MS = 1500;

const route = useRoute();
const router = useRouter();
const done = ref(false);
let called = false;

onMounted(async () => {
  if (called) return;
  called = true;

  const paymentKey = route.query.paymentKey as string | undefined;
  const orderId = route.query.orderId as string | undefined;
  const amount = route.query.amount as string | undefined;

  if (!paymentKey || !orderId || !amount) {
    router.replace("/user/reservations");
    return;
  }

  try {
    await confirmPayment({ paymentKey, orderId, amount: Number(amount) });
    done.value = true;
    // 잠깐 "결제 완료" 노출 후 자동 이동.
    setTimeout(() => router.replace("/user/reservations"), REDIRECT_DELAY_MS);
  } catch (e) {
    // 토스트(api/fetch.ts)가 이미 에러를 알림. 페이지는 멈추지 않고 reservations 로.
    console.error("Confirm failed:", e);
    router.replace("/user/reservations");
  }
});
</script>

<template>
  <UserLayout>
    <div class="mx-auto max-w-xl space-y-6 text-center">
      <template v-if="done">
        <h1 class="text-2xl font-bold text-pink-600">결제가 완료되었습니다 🎉</h1>
        <p class="text-zinc-500">예약 내역 페이지로 이동합니다...</p>
      </template>
      <template v-else>
        <h1 class="text-2xl font-bold">결제 승인 중...</h1>
        <p class="text-zinc-500">잠시만 기다려 주세요.</p>
      </template>
    </div>
  </UserLayout>
</template>
