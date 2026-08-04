import { Coffee, Cookie, Droplet, Egg, Moon, Plus, UtensilsCrossed, Wheat } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import type { FoodItem, MealEntry, MealType } from '@/types';

interface IconProps {
  color?: string;
  size?: number;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_TYPE_META: Record<MealType, { label: string; Icon: ComponentType<IconProps> }> = {
  breakfast: { label: 'Frühstück', Icon: Coffee },
  lunch: { label: 'Mittagessen', Icon: UtensilsCrossed },
  dinner: { label: 'Abendessen', Icon: Moon },
  snack: { label: 'Snacks', Icon: Cookie },
};

const ACCENT = '#10b981';

const RING_SIZE = 176;
const RING_STROKE = 16;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CENTER = RING_SIZE / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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

const entriesByMealType: Record<MealType, MealEntry[]> = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: [],
};
for (const entry of todaysEntries) {
  entriesByMealType[entry.mealType].push(entry);
}

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
const ringDashOffset = RING_CIRCUMFERENCE * (1 - caloriePct / 100);

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

function MealCard({ mealType }: { mealType: MealType }) {
  const { label, Icon } = MEAL_TYPE_META[mealType];
  const entries = entriesByMealType[mealType];
  const kcal = entries.reduce((sum, entry) => sum + entry.foodItem.caloriesPerServing * entry.servings, 0);

  return (
    <View className="gap-3 rounded-2xl bg-white p-4 shadow-md dark:bg-slate-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <Icon color={ACCENT} size={18} />
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-900 dark:text-white">{label}</Text>
            <Text className="text-xs text-slate-400">
              {entries.length > 0 ? `${kcal} kcal` : 'Noch keine Einträge'}
            </Text>
          </View>
        </View>
        <Pressable className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
          <Plus color="#ffffff" size={16} />
        </Pressable>
      </View>

      {entries.length > 0 && (
        <View className="gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          {entries.map((entry) => (
            <View key={entry.id} className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-600 dark:text-slate-300">{entry.foodItem.name}</Text>
              <Text className="text-sm text-slate-400">
                {entry.foodItem.caloriesPerServing * entry.servings} kcal
              </Text>
            </View>
          ))}
        </View>
      )}
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
    <SafeAreaView className="relative flex-1 bg-slate-50 dark:bg-background-dark">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-6 pt-4 pb-12">
        <View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Tagebuch</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">{today}</Text>
        </View>

        <View className="items-center gap-4 rounded-3xl bg-white p-6 shadow-md dark:bg-slate-800">
          <View className="items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                stroke="#e2e8f0"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                stroke={ACCENT}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={`${RING_CIRCUMFERENCE}, ${RING_CIRCUMFERENCE}`}
                strokeDashoffset={ringDashOffset}
                fill="none"
                rotation="-90"
                origin={`${RING_CENTER}, ${RING_CENTER}`}
              />
            </Svg>
            <View className="absolute items-center justify-center">
              <Text className="text-3xl font-bold text-slate-900 dark:text-white">{totalCalories}</Text>
              <Text className="text-xs text-slate-400">von {DAILY_CALORIE_GOAL} kcal</Text>
            </View>
          </View>

          <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {remainingCalories} kcal übrig
          </Text>

          <View className="w-full flex-row gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
            <MacroRow icon={<Wheat color="#3b82f6" size={14} />} label="Carbs" grams={totalMacros.carbs} goalGrams={DAILY_MACRO_GOAL.carbs} color="#3b82f6" />
            <MacroRow icon={<Egg color="#ef4444" size={14} />} label="Protein" grams={totalMacros.protein} goalGrams={DAILY_MACRO_GOAL.protein} color="#ef4444" />
            <MacroRow icon={<Droplet color="#f59e0b" size={14} />} label="Fett" grams={totalMacros.fat} goalGrams={DAILY_MACRO_GOAL.fat} color="#f59e0b" />
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Mahlzeiten</Text>
          {MEAL_TYPES.map((mealType) => (
            <MealCard key={mealType} mealType={mealType} />
          ))}
        </View>
      </ScrollView>

      <Text className="absolute bottom-4 left-4 rounded-md bg-slate-50/90 px-1.5 py-0.5 text-[10px] text-slate-400 dark:bg-background-dark/90">
        Zuletzt aktualisiert: {getLastUpdatedLabel()} Uhr
      </Text>
    </SafeAreaView>
  );
}
