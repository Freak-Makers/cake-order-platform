// 페이지 하단 중앙에 떠 있는 비차단(non-blocking) 토스트.
// Vue 외부(예: api/fetch.ts)에서도 호출되므로 vanilla DOM 으로 구현.
// window 가 없으면 no-op.

export type ToastVariant = "error" | "info" | "success";

const CONTAINER_ID = "__app_toast_container";
const DEFAULT_DURATION = 4000;

const VARIANT_COLORS: Record<ToastVariant, { bg: string; fg: string; border: string }> = {
  error: { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca" },
  info: { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe" },
  success: { bg: "#f0fdf4", fg: "#15803d", border: "#bbf7d0" },
};

function ensureContainer(): HTMLElement | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  let container = document.getElementById(CONTAINER_ID);
  if (container) return container;

  container = document.createElement("div");
  container.id = CONTAINER_ID;
  Object.assign(container.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "9999",
    display: "flex",
    flexDirection: "column-reverse", // 새 토스트가 아래쪽에 쌓이고 위로 밀려 올라가는 느낌
    gap: "8px",
    alignItems: "center",
    pointerEvents: "none", // 컨테이너는 클릭 통과, 각 토스트만 클릭 가능
  });
  document.body.appendChild(container);
  return container;
}

export function showToast(
  message: string,
  opts: { duration?: number; variant?: ToastVariant } = {},
): void {
  const container = ensureContainer();
  if (!container) return;

  const duration = opts.duration ?? DEFAULT_DURATION;
  const variant = opts.variant ?? "error";
  const c = VARIANT_COLORS[variant];

  const toast = document.createElement("div");
  toast.textContent = message;
  toast.setAttribute("role", "alert");
  Object.assign(toast.style, {
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: c.bg,
    color: c.fg,
    border: `1px solid ${c.border}`,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    maxWidth: "min(90vw, 480px)",
    minWidth: "240px",
    textAlign: "center",
    cursor: "pointer",
    pointerEvents: "auto",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity 200ms ease, transform 200ms ease",
  });

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 200);
  };

  toast.addEventListener("click", remove);
  container.appendChild(toast);

  // 다음 프레임에서 transition 적용 (slide-in)
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(remove, duration);
}
