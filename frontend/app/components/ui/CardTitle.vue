<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "~/utils/format";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const classes = computed(() => cn("text-lg font-semibold", attrs.class as string));
</script>

<template>
  <h3 v-bind="{ ...$attrs, class: undefined }" :class="classes">
    <slot />
  </h3>
</template>
