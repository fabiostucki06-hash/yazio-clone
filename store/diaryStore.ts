import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { DrinkEntry, DrinkType, FoodItem, MealEntry, MealType } from '@/types';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function makeId(): string {
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

const EMPTY_ENTRIES: MealEntry[] = [];
const EMPTY_DRINKS: DrinkEntry[] = [];

interface DiaryState {
  entriesByDate: Record<string, MealEntry[]>;
  drinkEntriesByDate: Record<string, DrinkEntry[]>;
  addEntry: (date: string, foodItem: FoodItem, mealType: MealType, servings: number) => void;
  removeEntry: (date: string, entryId: string) => void;
  addDrink: (date: string, type: DrinkType, ml: number) => void;
  removeDrink: (date: string, entryId: string) => void;
  getEntriesForDate: (date: string) => MealEntry[];
  getDrinksForDate: (date: string) => DrinkEntry[];
  getTotalWaterMlForDate: (date: string) => number;
}

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      entriesByDate: {},
      drinkEntriesByDate: {},

      addEntry: (date, foodItem, mealType, servings) => {
        const entry: MealEntry = {
          id: makeId(),
          foodItem,
          mealType,
          servings,
          loggedAt: new Date().toISOString(),
        };
        set((state) => ({
          entriesByDate: {
            ...state.entriesByDate,
            [date]: [...(state.entriesByDate[date] ?? []), entry],
          },
        }));
      },

      removeEntry: (date, entryId) => {
        set((state) => ({
          entriesByDate: {
            ...state.entriesByDate,
            [date]: (state.entriesByDate[date] ?? []).filter((entry) => entry.id !== entryId),
          },
        }));
      },

      addDrink: (date, type, ml) => {
        const entry: DrinkEntry = {
          id: makeId(),
          type,
          ml,
          loggedAt: new Date().toISOString(),
        };
        set((state) => ({
          drinkEntriesByDate: {
            ...state.drinkEntriesByDate,
            [date]: [...(state.drinkEntriesByDate[date] ?? []), entry],
          },
        }));
      },

      removeDrink: (date, entryId) => {
        set((state) => ({
          drinkEntriesByDate: {
            ...state.drinkEntriesByDate,
            [date]: (state.drinkEntriesByDate[date] ?? []).filter((entry) => entry.id !== entryId),
          },
        }));
      },

      getEntriesForDate: (date) => get().entriesByDate[date] ?? EMPTY_ENTRIES,
      getDrinksForDate: (date) => get().drinkEntriesByDate[date] ?? EMPTY_DRINKS,
      getTotalWaterMlForDate: (date) =>
        (get().drinkEntriesByDate[date] ?? EMPTY_DRINKS).reduce((sum, entry) => sum + entry.ml, 0),
    }),
    {
      name: 'yazio-diary-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { entriesByDate?: Record<string, MealEntry[]> } | undefined;
        return {
          entriesByDate: state?.entriesByDate ?? {},
          drinkEntriesByDate: {},
        };
      },
    },
  ),
);

export { todayKey };
