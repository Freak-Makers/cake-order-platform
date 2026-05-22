<script setup lang="ts">
import { computed } from "vue";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-vue-next";
import { cn } from "~/utils/format";
import type { AdminReservationsSort, AdminReservationsDirection } from "~/api/reservation.api";

const props = withDefaults(
  defineProps<{
    field: AdminReservationsSort;
    label: string;
    sortBy: AdminReservationsSort;
    sortDir: AdminReservationsDirection;
    align?: "left" | "right";
  }>(),
  { align: "left" },
);
const emit = defineEmits<{ sort: [field: AdminReservationsSort] }>();

const active = computed(() => props.sortBy === props.field);
const icon = computed(() => (active.value ? (props.sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown));
</script>

<template>
  <th :class="cn('px-6 py-4 font-medium', align === 'right' && 'text-right')">
    <button
      type="button"
      :class="cn('inline-flex items-center gap-1 transition-colors', active ? 'text-zinc-900' : 'hover:text-zinc-700')"
      @click="emit('sort', field)"
    >
      {{ label }}
      <component :is="icon" :size="12" :class="cn(!active && 'opacity-40')" />
    </button>
  </th>
</template>
