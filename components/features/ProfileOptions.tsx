import { Pressable, Text, View } from 'react-native';

import type { ActivityLevel, Gender, Goal } from '@/utils/nutritionCalculator';

export const GOAL_OPTIONS: { id: Goal; label: string }[] = [
  { id: 'weight_loss', label: 'Abnehmen' },
  { id: 'maintain', label: 'Halten' },
  { id: 'muscle_gain', label: 'Muskelaufbau' },
];

export const GENDER_OPTIONS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Männlich' },
  { id: 'female', label: 'Weiblich' },
];

export const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string }[] = [
  { id: 'sedentary', label: 'Sitzend' },
  { id: 'light', label: 'Leicht aktiv' },
  { id: 'moderate', label: 'Moderat aktiv' },
  { id: 'active', label: 'Sehr aktiv' },
];

export const THEME_OPTIONS: { id: 'light' | 'dark' | 'system'; label: string }[] = [
  { id: 'light', label: 'Hell' },
  { id: 'dark', label: 'Dunkel' },
  { id: 'system', label: 'System' },
];

export function ChipGroup<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { id: T; label: string }[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = option.id === selected;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            className={`rounded-full border px-4 py-2 backdrop-blur-md active:opacity-80 ${
              isSelected
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : 'border-white/60 bg-white/70 dark:border-white/10 dark:bg-white/5'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
