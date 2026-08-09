import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { NutrientKey, User, WeightEntry } from '@/types';
import {
  calculateBMR,
  calculateDailyTargets,
  calculateMacros,
  calculateTDEE,
  DEFAULT_VISIBLE_NUTRIENTS,
  type ActivityLevel,
  type Gender,
  type Goal,
} from '@/utils/nutritionCalculator';

function makeId(): string {
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

const defaultUser: User = {
  id: 'u1',
  name: 'Max Mustermann',
  email: 'max.mustermann@example.com',
  dailyCalorieGoal: 2200,
  dailyMacroGoal: { carbs: 220, protein: 165, fat: 73 },
  weightKg: 78,
  heightCm: 180,
  age: 30,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
  waterGoalMl: 2500,
  visibleNutrients: DEFAULT_VISIBLE_NUTRIENTS,
};

export interface ProfileInput {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

interface UserState {
  user: User;
  weightHistory: WeightEntry[];
  hasOnboarded: boolean;
  completeOnboarding: (name: string, email: string) => void;
  updateAccount: (input: { name: string; email: string }) => void;
  updateProfile: (input: ProfileInput) => void;
  setWaterGoal: (ml: number) => void;
  addWeightEntry: (weightKg: number, date?: string) => void;
  toggleNutrientVisibility: (key: NutrientKey) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      weightHistory: [{ id: makeId(), date: new Date().toISOString().slice(0, 10), weightKg: defaultUser.weightKg ?? 78 }],
      hasOnboarded: false,

      completeOnboarding: (name, email) => {
        set((state) => ({
          user: { ...state.user, name: name.trim(), email: email.trim() },
          hasOnboarded: true,
        }));
      },

      updateAccount: (input) => {
        set((state) => ({
          user: { ...state.user, name: input.name.trim(), email: input.email.trim() },
        }));
      },

      updateProfile: (input) => {
        const bmr = calculateBMR({
          age: input.age,
          gender: input.gender,
          weightKg: input.weightKg,
          heightCm: input.heightCm,
        });
        const tdee = calculateTDEE(bmr, input.activityLevel);
        const dailyCalorieGoal = calculateDailyTargets(tdee, input.goal);
        const dailyMacroGoal = calculateMacros(dailyCalorieGoal);

        set((state) => ({
          user: {
            ...state.user,
            age: input.age,
            gender: input.gender,
            heightCm: input.heightCm,
            weightKg: input.weightKg,
            activityLevel: input.activityLevel,
            goal: input.goal,
            dailyCalorieGoal,
            dailyMacroGoal,
          },
        }));

        const today = new Date().toISOString().slice(0, 10);
        const history = get().weightHistory;
        const hasToday = history.some((entry) => entry.date === today);
        if (!hasToday) {
          get().addWeightEntry(input.weightKg, today);
        }
      },

      setWaterGoal: (ml) => {
        set((state) => ({ user: { ...state.user, waterGoalMl: ml } }));
      },

      toggleNutrientVisibility: (key) => {
        set((state) => ({
          user: {
            ...state.user,
            visibleNutrients: {
              ...state.user.visibleNutrients,
              [key]: !state.user.visibleNutrients[key],
            },
          },
        }));
      },

      addWeightEntry: (weightKg, date) => {
        const entryDate = date ?? new Date().toISOString().slice(0, 10);
        set((state) => {
          const withoutSameDay = state.weightHistory.filter((entry) => entry.date !== entryDate);
          const nextHistory = [...withoutSameDay, { id: makeId(), date: entryDate, weightKg }].sort(
            (a, b) => a.date.localeCompare(b.date),
          );
          return {
            weightHistory: nextHistory,
            user: { ...state.user, weightKg },
          };
        });
      },
    }),
    {
      name: 'yazio-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as UserState;
        return {
          ...state,
          user: { ...defaultUser, ...state?.user, visibleNutrients: state?.user?.visibleNutrients ?? DEFAULT_VISIBLE_NUTRIENTS },
          // Users persisted before onboarding existed already have a profile, so don't force them through it.
          hasOnboarded: version >= 3 ? (state?.hasOnboarded ?? false) : true,
        };
      },
    },
  ),
);
