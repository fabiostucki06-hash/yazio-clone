import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useDiaryStore, todayKey } from '@/store/diaryStore';
import { useUiStore } from '@/store/uiStore';
import type { MealType } from '@/types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snacks',
};

export default function LogQuantityScreen() {
  const foodItem = useUiStore((state) => state.pendingFoodItem);
  const mealType = useUiStore((state) => state.pendingMealType);
  const clearPendingSelection = useUiStore((state) => state.clearPendingSelection);
  const addEntry = useDiaryStore((state) => state.addEntry);

  const isGramBased = foodItem?.servingUnit === 'g';
  const [amount, setAmount] = useState(isGramBased ? String(foodItem?.servingSize ?? 100) : '1');

  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const validAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  const servings = foodItem
    ? isGramBased
      ? validAmount / foodItem.servingSize
      : validAmount
    : 0;

  const computed = useMemo(() => {
    if (!foodItem) return { kcal: 0, carbs: 0, protein: 0, fat: 0 };
    return {
      kcal: foodItem.caloriesPerServing * servings,
      carbs: foodItem.macrosPerServing.carbs * servings,
      protein: foodItem.macrosPerServing.protein * servings,
      fat: foodItem.macrosPerServing.fat * servings,
    };
  }, [foodItem, servings]);

  function handleClose() {
    clearPendingSelection();
    router.dismissAll();
  }

  function handleAdd() {
    if (!foodItem || servings <= 0) return;
    addEntry(todayKey(), foodItem, mealType, servings);
    clearPendingSelection();
    router.dismissAll();
  }

  if (!foodItem) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 dark:bg-background-dark">
        <Text className="text-sm text-slate-400">Kein Lebensmittel ausgewählt.</Text>
        <Button label="Schließen" variant="secondary" onPress={handleClose} className="mt-4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-background-dark">
      <View className="flex-row items-center justify-between px-6 pt-4">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-bold tracking-tight text-slate-900 dark:text-white" numberOfLines={1}>
            {foodItem.name}
          </Text>
          <Text className="text-xs text-slate-400">{MEAL_LABELS[mealType]}</Text>
        </View>
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full border border-slate-200/50 bg-slate-100/60 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
          onPress={handleClose}
        >
          <X color="#64748b" size={18} />
        </Pressable>
      </View>

      <View className="gap-6 px-6 pt-6">
        <TextField
          label={isGramBased ? 'Menge in Gramm' : `Anzahl ${foodItem.servingUnit}`}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          suffix={isGramBased ? 'g' : foodItem.servingUnit}
          autoFocus
        />

        <Card className="gap-3">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Nährwerte</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600 dark:text-slate-300">Kalorien</Text>
            <Text className="text-base font-bold text-slate-900 dark:text-white">
              {Math.round(computed.kcal)} kcal
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600 dark:text-slate-300">Kohlenhydrate</Text>
            <Text className="text-sm text-slate-900 dark:text-white">{Math.round(computed.carbs)} g</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600 dark:text-slate-300">Eiweiß</Text>
            <Text className="text-sm text-slate-900 dark:text-white">{Math.round(computed.protein)} g</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600 dark:text-slate-300">Fett</Text>
            <Text className="text-sm text-slate-900 dark:text-white">{Math.round(computed.fat)} g</Text>
          </View>
        </Card>

        <Button label="Hinzufügen" onPress={handleAdd} disabled={servings <= 0} />
      </View>
    </SafeAreaView>
  );
}
