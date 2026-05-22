import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Product } from "~/api/types";

export interface CartItem extends Product {
  quantity: number;
}

const CART_KEY = "cart";

// 장바구니 — 상태를 localStorage 에 동기화.
export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  function persist() {
    localStorage.setItem(CART_KEY, JSON.stringify(items.value));
  }

  // 초기화: localStorage 에서 장바구니 불러오기. init.client 플러그인에서 1회 호출.
  function init() {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        items.value = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }

  function addItem(product: Product, quantity: number) {
    const existing = items.value.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.value.push({ ...product, quantity });
    }
    persist();
  }

  function removeItem(productId: number) {
    items.value = items.value.filter((i) => i.id !== productId);
    persist();
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const item = items.value.find((i) => i.id === productId);
    if (item) item.quantity = quantity;
    persist();
  }

  function clearCart() {
    items.value = [];
    persist();
  }

  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0));
  const totalPrice = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0));

  return { items, init, addItem, removeItem, updateQuantity, clearCart, totalCount, totalPrice };
});
