import { create } from 'zustand';

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (incoming) => {
    set((state) => {
      const existing = state.items.find((item) => item.itemId === incoming.itemId);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.itemId === incoming.itemId
              ? { ...item, quantity: item.quantity + incoming.quantity }
              : item,
          ),
        };
      }
      return { items: [...state.items, incoming] };
    });
  },
  removeItem: (itemId) => {
    set((state) => ({ items: state.items.filter((item) => item.itemId !== itemId) }));
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      return get().removeItem(itemId);
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.itemId === itemId ? { ...item, quantity } : item,
      ),
    }));
  },
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
}));
