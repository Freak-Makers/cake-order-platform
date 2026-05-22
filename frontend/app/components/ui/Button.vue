<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "~/utils/format";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
  }>(),
  { variant: "primary", size: "md" },
);

const attrs = useAttrs();

const variants = {
  primary: "bg-pink-500 text-white hover:bg-pink-600",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
  outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50",
  ghost: "bg-transparent hover:bg-zinc-100",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2",
  lg: "h-12 px-8 text-lg",
};

const classes = computed(() =>
  cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 disabled:pointer-events-none disabled:opacity-50",
    variants[props.variant],
    sizes[props.size],
    attrs.class as string,
  ),
);
</script>

<template>
  <button v-bind="{ ...$attrs, class: undefined }" :class="classes">
    <slot />
  </button>
</template>
