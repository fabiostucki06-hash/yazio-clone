import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Plus, Trash2, X } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useDiaryStore, todayKey } from '@/store/diaryStore';
import type { MealEntry, MealType } from '@/types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snacks',
  drinks: 'Getränke',
};

// Must be a stable reference: a fresh `[]` literal returned from the zustand
// selector on every call (when there's nothing logged for `date` yet) makes
// useSyncExternalStore see a "new" value on every render and loop forever.
const EMPTY_ENTRIES: MealEntry[] = [];

function formatAmount(entry: MealEntry): string {
  const { foodItem, servings } = entry;
  if (foodItem.servingUnit === 'g') {
    return `${Math.round(foodItem.servingSize * servings)} g`;
  }
  const count = Math.round(servings * 100) / 100;
  return `${count} ${foodItem.servingUnit}`;
}

export default function MealDetailScreen() {
  const params = useLocalSearchParams<{ mealType: MealType }>();
  const mealType = params.mealType ?? 'breakfast';
  const date = todayKey();
  const entries = useDiaryStore((state) => state.entriesByDate[date] ?? EMPTY_ENTRIES).filter(
    (entry) => entry.mealType === mealType,
  );
  const removeEntry = useDiaryStore((state) => state.removeEntry);

  const totalKcal = entries.reduce((sum, entry) => sum + entry.foodItem.caloriesPerServing * entry.servings, 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-background-dark">
      <View className="flex-row items-center justify-between px-6 pt-4">
        <View>
          <Text className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {MEAL_LABELS[mealType]}
          </Text>
          <Text className="text-xs text-slate-400">
            {entries.length > 0 ? `${Math.round(totalKcal)} kcal insgesamt` : 'Noch keine Einträge'}
          </Text>
        </View>
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full border border-slate-200/50 bg-slate-100/60 backdrop-blur-md transition-all duration-150 ease-in-out active:scale-95 active:opacity-80 dark:border-slate-800/60 dark:bg-white/5"
          onPress={() => router.back()}
        >
          <X color="#64748b" size={18} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" contentContainerClassName="gap-2 pb-6">
        {entries.length === 0 ? (
          <Text className="pt-8 text-center text-sm text-slate-400">
            Für {MEAL_LABELS[mealType]} wurde heute noch nichts eingetragen.
          </Text>
        ) : (
          entries.map((entry) => (
            <View
              key={entry.id}
              className="flex-row items-center justify-between rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60"
            >
              <View className="flex-1 pr-3">
                <Text className="text-sm font-semibold text-slate-900 dark:text-white" numberOfLines={1}>
                  {entry.foodItem.name}
                </Text>
                <Text className="text-xs text-slate-400">
                  {formatAmount(entry)} · {Math.round(entry.foodItem.caloriesPerServing * entry.servings)} kcal
                </Text>
              </View>
              <Pressable
                className="h-8 w-8 items-center justify-center rounded-full bg-red-500/10 active:opacity-80"
                onPress={() => removeEntry(date, entry.id)}
              >
                <Trash2 color="#ef4444" size={16} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <View className="gap-3 px-6 pb-8 pt-3">
        <View className="flex-row gap-3">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/70 shadow-md shadow-slate-900/5 backdrop-blur-xl active:opacity-80 dark:border-slate-800/60 dark:bg-slate-900/60"
            onPress={() => router.push({ pathname: '/analyze-food', params: { mealType } })}
          >
            <Camera color="#10b981" size={20} />
          </Pressable>
          <Button
            label="Lebensmittel hinzufügen"
            icon={<Plus color="#ffffff" size={18} />}
            onPress={() => router.push({ pathname: '/add-food', params: { mealType } })}
            className="flex-1"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
