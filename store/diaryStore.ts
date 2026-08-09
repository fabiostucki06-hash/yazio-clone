import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FoodItem, MealEntry, MealType } from '@/types';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function makeId(): string {
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

interface DiaryState {
  entriesByDate: Record<string, MealEntry[]>;
  waterMlByDate: Record<string, number>;
  addEntry: (date: string, foodItem: FoodItem, mealType: MealType, servings: number) => void;
  removeEntry: (date: string, entryId: string) => void;
  addWater: (date: string, ml: number) => void;
  getEntriesForDate: (date: string) => MealEntry[];
  getWaterForDate: (date: string) => number;
}

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      entriesByDate: {},
      waterMlByDate: {},

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

      addWater: (date, ml) => {
        set((state) => ({
          waterMlByDate: {
            ...state.waterMlByDate,
            [date]: Math.max((state.waterMlByDate[date] ?? 0) + ml, 0),
          },
        }));
      },

      getEntriesForDate: (date) => get().entriesByDate[date] ?? [],
      getWaterForDate: (date) => get().waterMlByDate[date] ?? 0,
    }),
    {
      name: 'yazio-diary-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export { todayKey };
