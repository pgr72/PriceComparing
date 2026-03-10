export interface LocalCartItem {
  goodId: string;
  goodName: string;
  goodUnit: string;
  goodCategory: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'pricecompare_cart';

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function setLocalCart(items: LocalCartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function addToLocalCart(item: LocalCartItem): LocalCartItem[] {
  const cart = getLocalCart();
  const existingIndex = cart.findIndex(i => i.goodId === item.goodId);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity = item.quantity;
  } else {
    cart.push(item);
  }
  setLocalCart(cart);
  return cart;
}

export function removeFromLocalCart(goodId: string): LocalCartItem[] {
  const cart = getLocalCart().filter(i => i.goodId !== goodId);
  setLocalCart(cart);
  return cart;
}

export function updateLocalCartQuantity(goodId: string, quantity: number): LocalCartItem[] {
  if (quantity < 1) return removeFromLocalCart(goodId);
  const cart = getLocalCart();
  const item = cart.find(i => i.goodId === goodId);
  if (item) item.quantity = quantity;
  setLocalCart(cart);
  return cart;
}

export function clearLocalCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
}
