import { create } from 'zustand';

import type { FoodItem, MealType } from '@/types';

export interface CartItem {
  id: string;
  foodItem: FoodItem;
  servings: number;
}

function makeCartItemId(): string {
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

interface UiState {
  pendingFoodItem: FoodItem | null;
  pendingMealType: MealType;
  cart: CartItem[];
  setPendingSelection: (foodItem: FoodItem, mealType: MealType) => void;
  clearPendingSelection: () => void;
  addToCart: (foodItem: FoodItem, servings: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  pendingFoodItem: null,
  pendingMealType: 'breakfast',
  cart: [],

  setPendingSelection: (foodItem, mealType) => set({ pendingFoodItem: foodItem, pendingMealType: mealType }),
  clearPendingSelection: () => set({ pendingFoodItem: null }),

  addToCart: (foodItem, servings) =>
    set((state) => ({
      cart: [...state.cart, { id: makeCartItemId(), foodItem, servings }],
    })),
  removeFromCart: (cartItemId) =>
    set((state) => ({ cart: state.cart.filter((item) => item.id !== cartItemId) })),
  clearCart: () => set({ cart: [] }),
}));
