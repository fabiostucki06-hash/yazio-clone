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

const EMPTY_ENTRIES: MealEntry[] = [];

interface DiaryState {
  entriesByDate: Record<string, MealEntry[]>;
  addEntry: (date: string, foodItem: FoodItem, mealType: MealType, servings: number) => void;
  removeEntry: (date: string, entryId: string) => void;
  getEntriesForDate: (date: string) => MealEntry[];
}

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      entriesByDate: {},

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

      getEntriesForDate: (date) => get().entriesByDate[date] ?? EMPTY_ENTRIES,
    }),
    {
      name: 'yazio-diary-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as { entriesByDate?: Record<string, MealEntry[]> } | undefined;
        return {
          entriesByDate: state?.entriesByDate ?? {},
        };
      },
    },
  ),
);

export { todayKey };
