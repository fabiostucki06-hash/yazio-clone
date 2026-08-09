import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FastingPlan, FastingPlanId, FastingSession } from '@/types';

export const FASTING_PLANS: FastingPlan[] = [
  { id: '16:8', label: '16:8', fastingHours: 16, eatingHours: 8 },
  { id: '14:10', label: '14:10', fastingHours: 14, eatingHours: 10 },
  { id: '5:2', label: '5:2', fastingHours: 24, eatingHours: 24 },
];

interface FastingState {
  selectedPlanId: FastingPlanId;
  session: FastingSession | null;
  selectPlan: (planId: FastingPlanId) => void;
  startFasting: () => void;
  startEating: () => void;
  stopSession: () => void;
}

export const useFastingStore = create<FastingState>()(
  persist(
    (set) => ({
      selectedPlanId: '16:8',
      session: null,

      selectPlan: (planId) => set({ selectedPlanId: planId }),

      startFasting: () =>
        set((state) => ({
          session: { planId: state.selectedPlanId, startedAt: new Date().toISOString(), isFasting: true },
        })),

      startEating: () =>
        set((state) => ({
          session: { planId: state.selectedPlanId, startedAt: new Date().toISOString(), isFasting: false },
        })),

      stopSession: () => set({ session: null }),
    }),
    {
      name: 'yazio-fasting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
