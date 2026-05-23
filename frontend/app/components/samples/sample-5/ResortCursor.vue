<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

// 큰 cursor follower — interactive 요소 hover 시 텍스트로 변형.
const x = ref(-100);
const y = ref(-100);
const visible = ref(false);
const hoveringInteractive = ref(false);
const hoverLabel = ref("");

let raf: number | null = null;
let targetX = -100;
let targetY = -100;

function onMove(e: MouseEvent) {
  targetX = e.clientX;
  targetY = e.clientY;
  if (!visible.value) visible.value = true;

  const target = e.target as HTMLElement | null;
  if (!target) return;
  const interactive = target.closest("a, button, [data-cursor]") as HTMLElement | null;
  if (interactive) {
    hoveringInteractive.value = true;
    hoverLabel.value = interactive.dataset.cursor ?? "";
  } else {
    hoveringInteractive.value = false;
    hoverLabel.value = "";
  }
}

function onLeave() {
  visible.value = false;
}

function tick() {
  // 부드러운 lerp.
  x.value += (targetX - x.value) * 0.18;
  y.value += (targetY - y.value) * 0.18;
  raf = requestAnimationFrame(tick);
}

onMounted(() => {
  // 터치 디바이스에서는 cursor follower 비활성화.
  if (window.matchMedia("(pointer: coarse)").matches) return;
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseleave", onLeave);
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMove);
  window.removeEventListener("mouseleave", onLeave);
  if (raf) cancelAnimationFrame(raf);
});
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none fixed left-0 top-0 z-[60] hidden lg:block"
    :class="visible ? 'opacity-100' : 'opacity-0'"
    style="transition: opacity 300ms"
  >
    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference transition-[width,height,padding] duration-300"
      :class="hoveringInteractive ? 'flex h-20 w-20 items-center justify-center px-3' : 'h-3 w-3'"
      :style="{ transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)` }"
    >
      <span
        v-if="hoveringInteractive && hoverLabel"
        class="text-center font-serif text-[10px] uppercase tracking-[0.2em] text-black"
      >
        {{ hoverLabel }}
      </span>
    </div>
  </div>
</template>
