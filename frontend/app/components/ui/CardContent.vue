<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "~/utils/format";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const classes = computed(() => cn("p-6 pt-0", attrs.class as string));
</script>

<template>
  <div v-bind="{ ...$attrs, class: undefined }" :class="classes">
    <slot />
  </div>
</template>
