import { Droplet, Egg, Flame, Wheat } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { FoodItem, MealEntry, MealType } from '@/types';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snack',
};

const DAILY_CALORIE_GOAL = 2200;
const DAILY_MACRO_GOAL = { carbs: 220, protein: 165, fat: 73 };

const porridge: FoodItem = {
  id: 'f1',
  name: 'Haferflocken mit Beeren',
  caloriesPerServing: 420,
  macrosPerServing: { carbs: 58, protein: 16, fat: 12 },
  servingSize: 1,
  servingUnit: 'Portion',
};

const chickenBowl: FoodItem = {
  id: 'f2',
  name: 'Hähnchen-Reis-Bowl',
  caloriesPerServing: 610,
  macrosPerServing: { carbs: 70, protein: 42, fat: 15 },
  servingSize: 1,
  servingUnit: 'Portion',
};

const almonds: FoodItem = {
  id: 'f3',
  name: 'Mandeln',
  caloriesPerServing: 170,
  macrosPerServing: { carbs: 6, protein: 6, fat: 15 },
  servingSize: 30,
  servingUnit: 'g',
};

const todaysEntries: MealEntry[] = [
  { id: 'e1', foodItem: porridge, mealType: 'breakfast', servings: 1, loggedAt: new Date().toISOString() },
  { id: 'e2', foodItem: chickenBowl, mealType: 'lunch', servings: 1, loggedAt: new Date().toISOString() },
  { id: 'e3', foodItem: almonds, mealType: 'snack', servings: 1, loggedAt: new Date().toISOString() },
];

const totalCalories = todaysEntries.reduce(
  (sum, entry) => sum + entry.foodItem.caloriesPerServing * entry.servings,
  0,
);

const totalMacros = todaysEntries.reduce(
  (acc, entry) => ({
    carbs: acc.carbs + entry.foodItem.macrosPerServing.carbs * entry.servings,
    protein: acc.protein + entry.foodItem.macrosPerServing.protein * entry.servings,
    fat: acc.fat + entry.foodItem.macrosPerServing.fat * entry.servings,
  }),
  { carbs: 0, protein: 0, fat: 0 },
);

const remainingCalories = Math.max(DAILY_CALORIE_GOAL - totalCalories, 0);
const caloriePct = Math.min(Math.round((totalCalories / DAILY_CALORIE_GOAL) * 100), 100);

function getLastUpdatedLabel(): string {
  if (process.env.EXPO_PUBLIC_BUILD_TIME) {
    return process.env.EXPO_PUBLIC_BUILD_TIME;
  }

  return new Date().toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MacroRow({
  icon,
  label,
  grams,
  goalGrams,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  grams: number;
  goalGrams: number;
  color: string;
}) {
  const pct = Math.min(Math.round((grams / goalGrams) * 100), 100);

  return (
    <View className="flex-1 gap-2">
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</Text>
      </View>
      <Text className="text-sm font-semibold text-slate-900 dark:text-white">
        {grams}g <Text className="text-xs font-normal text-slate-400">/ {goalGrams}g</Text>
      </Text>
      <View className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <View className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

export default function DiaryScreen() {
  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <SafeAreaView className="relative flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 gap-6 px-6 pt-4">
        <View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Tagebuch</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">{today}</Text>
        </View>

        <View className="gap-4 rounded-2xl bg-white p-5 dark:bg-slate-800">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Flame color="#22c55e" size={20} />
              </View>
              <View>
                <Text className="text-xs text-slate-500 dark:text-slate-400">Kalorien heute</Text>
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                  {totalCalories} <Text className="text-sm font-normal text-slate-400">/ {DAILY_CALORIE_GOAL} kcal</Text>
                </Text>
              </View>
            </View>
            <Text className="text-sm font-medium text-primary">{remainingCalories} kcal übrig</Text>
          </View>
          <View className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
            <View className="h-2 rounded-full bg-primary" style={{ width: `${caloriePct}%` }} />
          </View>

          <View className="flex-row gap-4 pt-2">
            <MacroRow icon={<Wheat color="#3b82f6" size={14} />} label="Carbs" grams={totalMacros.carbs} goalGrams={DAILY_MACRO_GOAL.carbs} color="#3b82f6" />
            <MacroRow icon={<Egg color="#ef4444" size={14} />} label="Protein" grams={totalMacros.protein} goalGrams={DAILY_MACRO_GOAL.protein} color="#ef4444" />
            <MacroRow icon={<Droplet color="#f59e0b" size={14} />} label="Fett" grams={totalMacros.fat} goalGrams={DAILY_MACRO_GOAL.fat} color="#f59e0b" />
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Mahlzeiten</Text>
          {todaysEntries.map((entry) => (
            <View
              key={entry.id}
              className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-slate-800"
            >
              <View>
                <Text className="text-xs text-slate-400">{MEAL_TYPE_LABELS[entry.mealType]}</Text>
                <Text className="text-sm font-medium text-slate-900 dark:text-white">
                  {entry.foodItem.name}
                </Text>
              </View>
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {entry.foodItem.caloriesPerServing * entry.servings} kcal
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text className="absolute bottom-4 left-4 text-xs text-slate-400 opacity-75">
        Zuletzt aktualisiert: {getLastUpdatedLabel()} Uhr
      </Text>
    </SafeAreaView>
  );
}
