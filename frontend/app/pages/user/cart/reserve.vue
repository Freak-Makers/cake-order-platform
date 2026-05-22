<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { getAvailableSlots, createReservation } from "~/api/reservation.api";
import type { ReservationSlot } from "~/api/types";
import { useCartStore } from "~/stores/cart";

// 카트 항목 1건당 입력 상태. key 는 productId.
interface ItemForm {
  slotId: number | null;
  requirements: string;
}

const router = useRouter();
const cart = useCartStore();

const slots = ref<ReservationSlot[]>([]);
const slotsLoaded = ref(false);
const forms = ref<Record<number, ItemForm>>({});
const isSubmitting = ref(false);
// 카트는 localStorage 에서 비동기 복원되므로 초기 빈 상태 ↔ 실제 빈 상태 구분용 가드.
const cartReady = ref(false);

let cartTimer: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  cartTimer = setTimeout(() => {
    cartReady.value = true;
  }, 100);

  getAvailableSlots()
    .then((s) => {
      slots.value = s;
      slotsLoaded.value = true;
    })
    .catch(() => {
      // 토스트는 api/fetch.ts 가 책임. 페이지는 슬롯 0개 상태로 둠.
      slotsLoaded.value = true;
    });
});
onBeforeUnmount(() => clearTimeout(cartTimer));

// 카트 항목이 변할 때 폼 동기화 (새 항목은 빈 폼으로, 사라진 항목은 제거)
watch(
  () => cart.items,
  (items) => {
    const next: Record<number, ItemForm> = {};
    for (const item of items) {
      next[item.id] = forms.value[item.id] ?? { slotId: null, requirements: "" };
    }
    forms.value = next;
  },
  { immediate: true, deep: true },
);

// 다른 항목이 이미 선택한 슬롯 ID — UI 에서 disabled 처리
function usedSlotIdsExcluding(excludeProductId: number): Set<number> {
  const used = new Set<number>();
  for (const item of cart.items) {
    if (item.id === excludeProductId) continue;
    const sid = forms.value[item.id]?.slotId;
    if (sid != null) used.add(sid);
  }
  return used;
}

const allSlotPicked = computed(
  () => cart.items.length > 0 && cart.items.every((it) => forms.value[it.id]?.slotId != null),
);

function updateForm(productId: number, patch: Partial<ItemForm>) {
  forms.value = {
    ...forms.value,
    [productId]: { ...(forms.value[productId] ?? { slotId: null, requirements: "" }), ...patch },
  };
}

function onSlotChange(productId: number, e: Event) {
  const v = (e.target as HTMLSelectElement).value;
  updateForm(productId, { slotId: v ? Number(v) : null });
}

async function handleSubmit() {
  if (!allSlotPicked.value || isSubmitting.value) return;
  isSubmitting.value = true;
  const succeededProductIds: number[] = [];
  try {
    // 순차 호출 — 중간 실패 시 그 시점에서 중단. 성공한 건은 카트에서 제거.
    for (const item of cart.items) {
      const f = forms.value[item.id];
      if (!f?.slotId) continue;
      await createReservation({
        productId: item.id,
        slotId: f.slotId,
        quantity: item.quantity,
        requirements: f.requirements.trim() || null,
      });
      succeededProductIds.push(item.id);
    }
    cart.clearCart();
    router.replace("/user/reservations");
  } catch (e) {
    // 토스트는 글로벌(api/fetch.ts)이 띄움. 페이지는 부분 성공 정리만.
    console.error("Reservation creation failed mid-way:", e);
    for (const pid of succeededProductIds) cart.removeItem(pid);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <UserLayout>
    <p v-if="!cartReady" class="text-zinc-500">불러오는 중...</p>

    <div v-else-if="cart.items.length === 0" class="mx-auto max-w-xl space-y-4 text-center">
      <h1 class="text-2xl font-bold text-zinc-900">장바구니가 비어 있습니다</h1>
      <p class="text-sm text-zinc-500">상품을 담으신 뒤 다시 시도해주세요.</p>
      <Button class="bg-pink-500 hover:bg-pink-600" @click="router.push('/user/products')">
        상품 보러 가기
      </Button>
    </div>

    <div v-else class="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 class="text-xl font-bold text-zinc-900 sm:text-2xl">예약 작성</h1>
        <p class="mt-1 text-sm text-zinc-500">
          장바구니의 각 상품에 픽업 슬롯을 선택해주세요. 한 슬롯은 한 예약에만 배정됩니다.
        </p>
      </div>

      <div
        v-if="slotsLoaded && slots.length === 0"
        class="space-y-3 rounded-lg bg-amber-50 p-6 text-center text-sm text-amber-800"
      >
        <p>현재 예약 가능한 시간이 없습니다.</p>
        <Button variant="outline" @click="router.push('/user/products')">상품으로 돌아가기</Button>
      </div>

      <template v-else>
        <div
          v-for="item in cart.items"
          :key="item.id"
          class="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6"
        >
          <div class="flex gap-4">
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              <img :src="item.imageUrl" :alt="item.name" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1">
              <h2 class="font-bold text-zinc-900">{{ item.name }}</h2>
              <p class="mt-1 text-sm text-zinc-500">
                {{ item.quantity }}개 · {{ (item.price * item.quantity).toLocaleString() }}원
              </p>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-700">
              픽업 슬롯 <span class="text-red-500">*</span>
            </label>
            <select
              :value="forms[item.id]?.slotId ?? ''"
              :disabled="!slotsLoaded || isSubmitting"
              class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              @change="onSlotChange(item.id, $event)"
            >
              <option value="">{{ slotsLoaded ? "슬롯 선택..." : "불러오는 중..." }}</option>
              <option
                v-for="s in slots"
                :key="s.id"
                :value="s.id"
                :disabled="usedSlotIdsExcluding(item.id).has(s.id)"
              >
                {{ new Date(s.startAt).toLocaleString("ko-KR") }}
                {{ usedSlotIdsExcluding(item.id).has(s.id) ? " (다른 항목에서 선택됨)" : "" }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-700">요구사항 (선택)</label>
            <textarea
              :value="forms[item.id]?.requirements ?? ''"
              :disabled="isSubmitting"
              placeholder="알러지, 메시지 등"
              :rows="2"
              class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              @input="updateForm(item.id, { requirements: ($event.target as HTMLTextAreaElement).value })"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            :disabled="isSubmitting"
            class="w-full sm:flex-1"
            @click="router.push('/user/products')"
          >
            상품 더 보기
          </Button>
          <Button
            :disabled="!allSlotPicked || isSubmitting"
            class="w-full bg-pink-500 hover:bg-pink-600 sm:flex-[2]"
            @click="handleSubmit"
          >
            {{ isSubmitting ? "예약 신청 중..." : `${cart.items.length}건 예약 신청` }}
          </Button>
        </div>
      </template>
    </div>
  </UserLayout>
</template>
