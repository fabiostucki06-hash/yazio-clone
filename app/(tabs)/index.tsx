import { router } from 'expo-router';
import { Coffee, Cookie, Droplet, Egg, Moon, Plus, UtensilsCrossed, Wheat } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/ui/ProgressRing';
import { useDiaryStore, todayKey } from '@/store/diaryStore';
import { useUserStore } from '@/store/userStore';
import type { MealEntry, MealType } from '@/types';

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
const WATER_QUICK_ADD_ML = 250;
const EMPTY_ENTRIES: MealEntry[] = [];

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
  const pct = goalGrams > 0 ? Math.min(Math.round((grams / goalGrams) * 100), 100) : 0;

  return (
    <View className="flex-1 gap-2">
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</Text>
      </View>
      <Text className="text-sm font-semibold text-slate-900 dark:text-white">
        {Math.round(grams)}g <Text className="text-xs font-normal text-slate-400">/ {goalGrams}g</Text>
      </Text>
      <View className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <View className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

function MealCard({ mealType, entries }: { mealType: MealType; entries: MealEntry[] }) {
  const { label, Icon } = MEAL_TYPE_META[mealType];
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
              {entries.length > 0 ? `${Math.round(kcal)} kcal` : 'Noch keine Einträge'}
            </Text>
          </View>
        </View>
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
          onPress={() => router.push({ pathname: '/add-food', params: { mealType } })}
        >
          <Plus color="#ffffff" size={16} />
        </Pressable>
      </View>

      {entries.length > 0 && (
        <View className="gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          {entries.map((entry) => (
            <View key={entry.id} className="flex-row items-center justify-between">
              <Text className="flex-1 text-sm text-slate-600 dark:text-slate-300" numberOfLines={1}>
                {entry.foodItem.name}
              </Text>
              <Text className="text-sm text-slate-400">
                {Math.round(entry.foodItem.caloriesPerServing * entry.servings)} kcal
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function WaterTracker() {
  const date = todayKey();
  const waterMl = useDiaryStore((state) => state.getWaterForDate(date));
  const addWater = useDiaryStore((state) => state.addWater);
  const waterGoalMl = useUserStore((state) => state.user.waterGoalMl ?? 2000);
  const pct = waterGoalMl > 0 ? Math.min(waterMl / waterGoalMl, 1) : 0;
  const liters = (waterMl / 1000).toFixed(2);
  const goalLiters = (waterGoalMl / 1000).toFixed(1);

  return (
    <View className="gap-3 rounded-2xl bg-white p-4 shadow-md dark:bg-slate-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-500/10">
            <Droplet color="#0ea5e9" size={18} />
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-900 dark:text-white">Wasser</Text>
            <Text className="text-xs text-slate-400">
              {liters} L von {goalLiters} L
            </Text>
          </View>
        </View>
        <Pressable
          className="flex-row items-center gap-1 rounded-full bg-sky-500 px-3 py-1.5"
          onPress={() => addWater(date, WATER_QUICK_ADD_ML)}
        >
          <Plus color="#ffffff" size={14} />
          <Text className="text-xs font-semibold text-white">{WATER_QUICK_ADD_ML}ml</Text>
        </Pressable>
      </View>
      <View className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <View className="h-1.5 rounded-full bg-sky-500" style={{ width: `${pct * 100}%` }} />
      </View>
    </View>
  );
}

export default function DiaryScreen() {
  const date = todayKey();
  const entries = useDiaryStore((state) => state.entriesByDate[date] ?? EMPTY_ENTRIES);
  const user = useUserStore((state) => state.user);

  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const entriesByMealType: Record<MealType, MealEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const entry of entries) {
    entriesByMealType[entry.mealType].push(entry);
  }

  const totalCalories = entries.reduce((sum, entry) => sum + entry.foodItem.caloriesPerServing * entry.servings, 0);
  const totalMacros = entries.reduce(
    (acc, entry) => ({
      carbs: acc.carbs + entry.foodItem.macrosPerServing.carbs * entry.servings,
      protein: acc.protein + entry.foodItem.macrosPerServing.protein * entry.servings,
      fat: acc.fat + entry.foodItem.macrosPerServing.fat * entry.servings,
    }),
    { carbs: 0, protein: 0, fat: 0 },
  );

  const remainingCalories = Math.round(Math.max(user.dailyCalorieGoal - totalCalories, 0));
  const caloriePct = user.dailyCalorieGoal > 0 ? totalCalories / user.dailyCalorieGoal : 0;

  return (
    <SafeAreaView className="relative flex-1 bg-slate-50 dark:bg-background-dark">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-6 pt-4 pb-12">
        <View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Tagebuch</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">{today}</Text>
        </View>

        <View className="items-center gap-4 rounded-3xl bg-white p-6 shadow-md dark:bg-slate-800">
          <ProgressRing size={RING_SIZE} strokeWidth={RING_STROKE} progress={caloriePct} color={ACCENT}>
            <Text className="text-3xl font-bold text-slate-900 dark:text-white">{Math.round(totalCalories)}</Text>
            <Text className="text-xs text-slate-400">von {user.dailyCalorieGoal} kcal</Text>
          </ProgressRing>

          <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {remainingCalories} kcal übrig
          </Text>

          <View className="w-full flex-row gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
            <MacroRow
              icon={<Wheat color="#3b82f6" size={14} />}
              label="Carbs"
              grams={totalMacros.carbs}
              goalGrams={user.dailyMacroGoal.carbs}
              color="#3b82f6"
            />
            <MacroRow
              icon={<Egg color="#ef4444" size={14} />}
              label="Protein"
              grams={totalMacros.protein}
              goalGrams={user.dailyMacroGoal.protein}
              color="#ef4444"
            />
            <MacroRow
              icon={<Droplet color="#f59e0b" size={14} />}
              label="Fett"
              grams={totalMacros.fat}
              goalGrams={user.dailyMacroGoal.fat}
              color="#f59e0b"
            />
          </View>
        </View>

        <WaterTracker />

        <View className="gap-3">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Mahlzeiten</Text>
          {MEAL_TYPES.map((mealType) => (
            <MealCard key={mealType} mealType={mealType} entries={entriesByMealType[mealType]} />
          ))}
        </View>
      </ScrollView>

      <Text className="absolute bottom-4 left-4 rounded-md bg-slate-50/90 px-1.5 py-0.5 text-[10px] text-slate-400 dark:bg-background-dark/90">
        Zuletzt aktualisiert: {getLastUpdatedLabel()} Uhr
      </Text>
    </SafeAreaView>
  );
}
