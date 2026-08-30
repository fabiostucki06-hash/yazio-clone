import { router, useLocalSearchParams } from 'expo-router';
import { Barcode, Check, Plus, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { normalizeSearchText, searchLocalFoods } from '@/data/foodDatabase';
import { FoodApiError, FoodApiUnavailableError, searchFood } from '@/services/foodApi';
import { useDiaryStore, todayKey } from '@/store/diaryStore';
import { useUiStore } from '@/store/uiStore';
import type { FoodItem, MealType } from '@/types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snacks',
  drinks: 'Getränke',
};

const DEBOUNCE_MS = 350;

interface Notice {
  message: string;
  severity: 'warning' | 'error';
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

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
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customFat, setCustomFat] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const trimmed = query.trim();
    if (!trimmed) {
      requestIdRef.current += 1;
      setResults([]);
      setNotice(null);
      setLoading(false);
      return;
    }

    const localMatches = searchLocalFoods(trimmed);
    setResults(localMatches);
    setNotice(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const remoteItems = await searchFood(trimmed, controller.signal);
        if (requestIdRef.current !== requestId) return;

        const seenNames = new Set(localMatches.map((item) => normalizeSearchText(item.name)));
        const merged = [...localMatches];
        for (const item of remoteItems) {
          const key = normalizeSearchText(item.name);
          if (seenNames.has(key)) continue;
          seenNames.add(key);
          merged.push(item);
        }
        setResults(merged);
        setNotice(null);
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        if (err instanceof FoodApiUnavailableError) {
          setNotice({ message: err.message, severity: 'warning' });
        } else {
          setNotice({
            message: err instanceof FoodApiError ? err.message : 'Unbekannter Fehler bei der Suche.',
            severity: 'error',
          });
        }
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => () => abortRef.current?.abort(), []);

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

  function handleOpenCustomForm() {
    setCustomName(query.trim());
    setCustomKcal('');
    setCustomCarbs('');
    setCustomProtein('');
    setCustomFat('');
    setShowCustomForm(true);
  }

  function handleCustomFoodContinue() {
    const trimmedName = customName.trim();
    if (!trimmedName) return;

    const foodItem: FoodItem = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      caloriesPerServing: parseNumber(customKcal, 0),
      macrosPerServing: {
        carbs: parseNumber(customCarbs, 0),
        protein: parseNumber(customProtein, 0),
        fat: parseNumber(customFat, 0),
      },
      micronutrientsPerServing: { fiber: 0, sugar: 0, sodium: 0, vitaminC: 0 },
      servingSize: 100,
      servingUnit: 'g',
    };

    setShowCustomForm(false);
    handleSelect(foodItem);
  }

  const cartTotalKcal = cart.reduce((sum, item) => sum + item.foodItem.caloriesPerServing * item.servings, 0);
  const showEmptyState = !loading && query.trim().length > 0 && results.length === 0;

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
            onChangeText={(text) => {
              setQuery(text);
              setShowCustomForm(false);
            }}
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

      {notice && (
        <Text className={`px-6 pt-4 text-sm ${notice.severity === 'error' ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
          {notice.message}
        </Text>
      )}

      <FlatList
        className="flex-1 px-6 pt-4"
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerClassName={cart.length > 0 ? 'gap-2 pb-28' : 'gap-2 pb-12'}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          showEmptyState ? (
            <View className="items-center gap-4 pt-8">
              <Text className="text-center text-sm text-slate-400">Keine Lebensmittel gefunden</Text>
              {!showCustomForm && (
                <Pressable
                  className="flex-row items-center gap-2 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 active:opacity-80"
                  onPress={handleOpenCustomForm}
                >
                  <Plus color="#10b981" size={16} />
                  <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Eigenes Lebensmittel hinzufügen
                  </Text>
                </Pressable>
              )}
              {showCustomForm && (
                <Card className="w-full gap-4">
                  <TextField label="Name" value={customName} onChangeText={setCustomName} placeholder="z. B. Omas Kuchen" autoFocus />
                  <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Nährwerte pro 100g</Text>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <TextField label="Kcal" keyboardType="decimal-pad" value={customKcal} onChangeText={setCustomKcal} />
                    </View>
                    <View className="flex-1">
                      <TextField label="Carbs" keyboardType="decimal-pad" value={customCarbs} onChangeText={setCustomCarbs} suffix="g" />
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <TextField label="Protein" keyboardType="decimal-pad" value={customProtein} onChangeText={setCustomProtein} suffix="g" />
                    </View>
                    <View className="flex-1">
                      <TextField label="Fett" keyboardType="decimal-pad" value={customFat} onChangeText={setCustomFat} suffix="g" />
                    </View>
                  </View>
                  <Button label="Weiter" onPress={handleCustomFoodContinue} disabled={!customName.trim()} />
                </Card>
              )}
            </View>
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
