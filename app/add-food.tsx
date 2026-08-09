import { router, useLocalSearchParams } from 'expo-router';
import { Barcode, Check, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodApiError, searchFood } from '@/services/foodApi';
import { useDiaryStore, todayKey } from '@/store/diaryStore';
import { useUiStore } from '@/store/uiStore';
import type { FoodItem, MealType } from '@/types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snacks',
};

const DEBOUNCE_MS = 400;

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{ mealType: MealType }>();
  const mealType = params.mealType ?? 'breakfast';
  const setPendingSelection = useUiStore((state) => state.setPendingSelection);
  const cart = useUiStore((state) => state.cart);
  const removeFromCart = useUiStore((state) => state.removeFromCart);
  const clearCart = useUiStore((state) => state.clearCart);
  const addEntry = useDiaryStore((state) => state.addEntry);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await searchFood(trimmed);
        setResults(items);
        setError(null);
      } catch (err) {
        setError(err instanceof FoodApiError ? err.message : 'Unbekannter Fehler bei der Suche.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(item: FoodItem) {
    setPendingSelection(item, mealType);
    router.push('/log-quantity');
  }

  function handleClose() {
    clearCart();
    router.back();
  }

  function handleFinish() {
    for (const item of cart) {
      addEntry(todayKey(), item.foodItem, mealType, item.servings);
    }
    clearCart();
    router.back();
  }

  const cartTotalKcal = cart.reduce((sum, item) => sum + item.foodItem.caloriesPerServing * item.servings, 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-background-dark">
      <View className="flex-row items-center justify-between px-6 pt-4">
        <View>
          <Text className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Lebensmittel hinzufügen</Text>
          <Text className="text-xs text-slate-400">{MEAL_LABELS[mealType]}</Text>
        </View>
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full border border-slate-200/50 bg-slate-100/60 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
          onPress={handleClose}
        >
          <X color="#64748b" size={18} />
        </Pressable>
      </View>

      {cart.length > 0 && (
        <View className="gap-2 px-6 pt-4">
          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Ausgewählt ({cart.length})
          </Text>
          <View className="gap-2">
            {cart.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-2.5 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-medium text-slate-900 dark:text-white" numberOfLines={1}>
                    {item.foodItem.name}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {Math.round(item.foodItem.caloriesPerServing * item.servings)} kcal
                  </Text>
                </View>
                <Pressable
                  className="h-7 w-7 items-center justify-center rounded-full bg-slate-100/60 active:opacity-80 dark:bg-white/5"
                  onPress={() => removeFromCart(item.id)}
                >
                  <X color="#64748b" size={14} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="gap-3 px-6 pt-4">
        <View className="flex-row items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <Search color="#94a3b8" size={18} />
          <TextInput
            className="flex-1 text-base text-slate-900 dark:text-white"
            placeholder="Lebensmittel suchen..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {loading && <ActivityIndicator size="small" color="#10b981" />}
        </View>

        <Pressable
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 shadow-lg shadow-emerald-500/25 active:opacity-90 active:bg-emerald-600"
          onPress={() => router.push({ pathname: '/barcode-scanner', params: { mealType } })}
        >
          <Barcode color="#ffffff" size={18} />
          <Text className="text-base font-semibold text-white">Barcode scannen</Text>
        </Pressable>
      </View>

      {error && (
        <Text className="px-6 pt-4 text-sm text-red-500">{error}</Text>
      )}

      <FlatList
        className="flex-1 px-6 pt-4"
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerClassName={cart.length > 0 ? 'gap-2 pb-28' : 'gap-2 pb-12'}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading && query.trim().length > 0 && !error ? (
            <Text className="pt-8 text-center text-sm text-slate-400">Keine Ergebnisse gefunden.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            className="flex-row items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-md shadow-slate-900/5 backdrop-blur-xl active:opacity-80 dark:border-white/10 dark:bg-slate-900/60"
            onPress={() => handleSelect(item)}
          >
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-slate-900 dark:text-white" numberOfLines={1}>
                {item.name}
              </Text>
              {item.brand && (
                <Text className="text-xs text-slate-400" numberOfLines={1}>
                  {item.brand}
                </Text>
              )}
            </View>
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              {item.caloriesPerServing} kcal / {item.servingSize}{item.servingUnit}
            </Text>
          </Pressable>
        )}
      />

      {cart.length > 0 && (
        <View className="absolute inset-x-0 bottom-0 border-t border-white/60 bg-white/80 px-6 pb-8 pt-3 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
          <Pressable
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 shadow-lg shadow-emerald-500/25 active:opacity-90 active:bg-emerald-600"
            onPress={handleFinish}
          >
            <Check color="#ffffff" size={18} />
            <Text className="text-base font-semibold text-white">
              Fertig · {cart.length} {cart.length === 1 ? 'Eintrag' : 'Einträge'} · {Math.round(cartTotalKcal)} kcal
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
