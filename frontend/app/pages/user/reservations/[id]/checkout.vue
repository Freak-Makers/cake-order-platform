<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { CreditCard } from "lucide-vue-next";
import { preparePayment } from "~/api/payment.api";
import type { PaymentPrepareResponse } from "~/api/types";
import { formatPrice } from "~/utils/format";

const route = useRoute();
const router = useRouter();
const reservationId = Number(route.params.id);

const prepare = ref<PaymentPrepareResponse | null>(null);
const error = ref<string | null>(null);
const widgetReady = ref(false);
const isRequesting = ref(false);

let widgets: TossPaymentsWidgets | null = null;

onMounted(async () => {
  if (!reservationId) return;

  try {
    prepare.value = await preparePayment(reservationId);
  } catch (e) {
    // 토스트(api/fetch.ts)가 이미 에러를 알림. 페이지는 멈추지 않고 reservations 로.
    console.error("Failed to prepare payment:", e);
    router.replace("/user/reservations");
    return;
  }

  try {
    const tossPayments = await loadTossPayments(prepare.value.clientKey);
    const w = tossPayments.widgets({ customerKey: prepare.value.customerKey });
    await w.setAmount({ currency: "KRW", value: prepare.value.amount });
    // Toss 공식 예제는 순차 await — 병렬은 SDK 내부 상태 경쟁으로 실패할 수 있음.
    await w.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" });
    await w.renderAgreement({ selector: "#agreement" });
    widgets = w;
    widgetReady.value = true;
  } catch (e) {
    console.error("Failed to render Toss widgets:", e);
    const err = e as { code?: string; name?: string; message?: string };
    const tag = err.code ?? err.name ?? "Unknown";
    const msg = err.message ?? "";
    error.value = `결제 위젯을 불러오지 못했습니다. (${tag}: ${msg})`;
  }
});

function reloadPage() {
  window.location.reload();
}

async function handlePay() {
  if (!prepare.value || !widgets || isRequesting.value) return;
  isRequesting.value = true;
  try {
    // Redirect 방식: 성공 시 successUrl, 실패 시 failUrl 로 이동. 정상 흐름에선 이 줄 이후 미실행.
    await widgets.requestPayment({
      orderId: prepare.value.orderId,
      orderName: prepare.value.orderName,
      customerName: prepare.value.customerName,
      successUrl: prepare.value.successUrl,
      failUrl: prepare.value.failUrl,
    });
  } catch (e) {
    console.error("requestPayment failed:", e);
    isRequesting.value = false;
  }
}
</script>

<template>
  <UserLayout>
    <div class="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 class="text-xl font-bold text-zinc-900 sm:text-2xl">결제하기</h1>
        <p class="mt-1 text-sm text-zinc-500">
          토스페이먼츠 결제위젯에서 결제수단을 선택하고 결제를 진행하세요.
        </p>
      </div>

      <div v-if="error" class="space-y-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        <p>{{ error }}</p>
        <div class="flex gap-2">
          <Button class="bg-pink-500 hover:bg-pink-600" @click="reloadPage">
            다시 시도
          </Button>
          <Button variant="outline" @click="router.push('/user/reservations')">
            내 예약으로 돌아가기
          </Button>
        </div>
      </div>

      <div v-if="prepare" class="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <p class="text-sm text-zinc-500">{{ prepare.orderName }}</p>
        <p class="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">{{ formatPrice(prepare.amount) }}</p>
        <div class="mt-4 space-y-1 text-xs text-zinc-400">
          <p>주문번호: <span class="font-mono">{{ prepare.orderId }}</span></p>
          <p>고객: {{ prepare.customerName }}</p>
        </div>
      </div>
      <p v-else-if="!error" class="text-zinc-500">결제 정보를 불러오는 중...</p>

      <p v-if="prepare && !widgetReady && !error" class="text-sm text-zinc-500">
        결제 위젯을 불러오는 중...
      </p>

      <!-- Toss 결제수단/약관 위젯 마운트 포인트. SDK 가 채워 넣음. -->
      <div id="payment-method" class="min-h-[200px]" />
      <div id="agreement" />

      <div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          variant="outline"
          class="w-full sm:flex-1"
          :disabled="isRequesting"
          @click="router.push('/user/reservations')"
        >
          취소
        </Button>
        <Button
          :disabled="!widgetReady || isRequesting"
          class="w-full gap-2 bg-pink-500 hover:bg-pink-600 sm:flex-[2]"
          @click="handlePay"
        >
          <CreditCard :size="16" />
          {{ isRequesting ? "결제창 이동 중..." : "결제하기" }}
        </Button>
      </div>
    </div>
  </UserLayout>
</template>
