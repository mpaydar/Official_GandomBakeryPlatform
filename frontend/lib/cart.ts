export type CartItem = {
  itemType: string;
  name: string;
  quantity: number;
};

const KEY = "gandom_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((i) => i.itemType === item.itemType);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(KEY);
}
