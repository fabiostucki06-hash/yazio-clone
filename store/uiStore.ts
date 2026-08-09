import { create } from 'zustand';

import type { FoodItem, MealType } from '@/types';

interface UiState {
  pendingFoodItem: FoodItem | null;
  pendingMealType: MealType;
  setPendingSelection: (foodItem: FoodItem, mealType: MealType) => void;
  clearPendingSelection: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  pendingFoodItem: null,
  pendingMealType: 'breakfast',

  setPendingSelection: (foodItem, mealType) => set({ pendingFoodItem: foodItem, pendingMealType: mealType }),
  clearPendingSelection: () => set({ pendingFoodItem: null }),
}));
