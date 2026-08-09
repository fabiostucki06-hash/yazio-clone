import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Check, ImagePlus, RotateCcw, Sparkles, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { analyzeFoodPhoto, type VisionAnalysisResult } from '@/services/visionFoodApi';
import { useDiaryStore, todayKey } from '@/store/diaryStore';
import type { FoodItem, MealType } from '@/types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snacks',
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  base64: true,
  quality: 0.5,
  allowsEditing: true,
  aspect: [4, 3],
};

function parseNumber(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export default function AnalyzeFoodScreen() {
  const params = useLocalSearchParams<{ mealType: MealType }>();
  const mealType = params.mealType ?? 'breakfast';
  const addEntry = useDiaryStore((state) => state.addEntry);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);

  const [name, setName] = useState('');
  const [grams, setGrams] = useState('');
  const [kcalPer100g, setKcalPer100g] = useState('');
  const [carbsPer100g, setCarbsPer100g] = useState('');
  const [proteinPer100g, setProteinPer100g] = useState('');
  const [fatPer100g, setFatPer100g] = useState('');

  async function runAnalysis(picked: ImagePicker.ImagePickerAsset) {
    setImageUri(picked.uri);
    setResult(null);
    setPickerError(null);

    if (!picked.base64) {
      setPickerError('Foto konnte nicht gelesen werden. Bitte erneut versuchen.');
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await analyzeFoodPhoto(picked.base64);
      setResult(analysis);
      setName(analysis.name);
      setGrams(String(Math.round(analysis.estimatedGrams)));
      setKcalPer100g(String(Math.round(analysis.caloriesPer100g)));
      setCarbsPer100g(String(Math.round(analysis.macrosPer100g.carbs)));
      setProteinPer100g(String(Math.round(analysis.macrosPer100g.protein)));
      setFatPer100g(String(Math.round(analysis.macrosPer100g.fat)));
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPickerError('Kamera-Zugriff wurde nicht erlaubt.');
      return;
    }
    const picked = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!picked.canceled && picked.assets[0]) {
      await runAnalysis(picked.assets[0]);
    }
  }

  async function handlePickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPickerError('Zugriff auf die Fotomediathek wurde nicht erlaubt.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!picked.canceled && picked.assets[0]) {
      await runAnalysis(picked.assets[0]);
    }
  }

  function handleReset() {
    setImageUri(null);
    setResult(null);
    setPickerError(null);
  }

  function handleClose() {
    router.dismissAll();
  }

  const parsedGrams = parseNumber(grams, 0);
  const totals = useMemo(
    () => ({
      kcal: (parseNumber(kcalPer100g, 0) * parsedGrams) / 100,
      carbs: (parseNumber(carbsPer100g, 0) * parsedGrams) / 100,
      protein: (parseNumber(proteinPer100g, 0) * parsedGrams) / 100,
      fat: (parseNumber(fatPer100g, 0) * parsedGrams) / 100,
    }),
    [kcalPer100g, carbsPer100g, proteinPer100g, fatPer100g, parsedGrams],
  );

  function handleSave() {
    if (!result || parsedGrams <= 0) return;

    const foodItem: FoodItem = {
      id: `vision-${Date.now()}`,
      name: name.trim() || result.name,
      caloriesPerServing: parseNumber(kcalPer100g, 0),
      macrosPerServing: {
        carbs: parseNumber(carbsPer100g, 0),
        protein: parseNumber(proteinPer100g, 0),
        fat: parseNumber(fatPer100g, 0),
      },
      micronutrientsPerServing: result.micronutrientsPer100g,
      servingSize: 100,
      servingUnit: 'g',
    };

    addEntry(todayKey(), foodItem, mealType, parsedGrams / 100);
    router.dismissAll();
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-background-dark">
      <View className="flex-row items-center justify-between px-6 pt-4">
        <View>
          <Text className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">KI-Foto-Analyse</Text>
          <Text className="text-xs text-slate-400">{MEAL_LABELS[mealType]}</Text>
        </View>
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full border border-slate-200/50 bg-slate-100/60 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
          onPress={handleClose}
        >
          <X color="#64748b" size={18} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-6 pt-4 pb-12">
        {!imageUri ? (
          <View className="gap-3">
            <Pressable
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 shadow-lg shadow-emerald-500/25 active:opacity-90 active:bg-emerald-600"
              onPress={handleTakePhoto}
            >
              <Camera color="#ffffff" size={18} />
              <Text className="text-base font-semibold text-white">Foto aufnehmen</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-md shadow-slate-900/5 backdrop-blur-xl active:opacity-80 dark:border-white/10 dark:bg-slate-900/60"
              onPress={handlePickFromLibrary}
            >
              <ImagePlus color="#10b981" size={18} />
              <Text className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                Aus Galerie wählen
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3">
            <View className="aspect-[4/3] w-full overflow-hidden rounded-[28px] border border-white/60 bg-slate-200 dark:border-white/10">
              <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
            </View>
            <Pressable
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2.5 shadow-md shadow-slate-900/5 backdrop-blur-xl active:opacity-80 dark:border-white/10 dark:bg-slate-900/60"
              onPress={handleReset}
            >
              <RotateCcw color="#64748b" size={16} />
              <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">Anderes Foto wählen</Text>
            </Pressable>
          </View>
        )}

        {pickerError && <Text className="text-sm text-red-500">{pickerError}</Text>}

        {analyzing && (
          <View className="items-center gap-3 rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <ActivityIndicator color="#10b981" size="large" />
            <Text className="text-sm text-slate-500 dark:text-slate-400">Mahlzeit wird analysiert...</Text>
          </View>
        )}

        {result && !analyzing && (
          <>
            <View className="gap-3 rounded-[28px] border border-white/20 bg-emerald-500/90 p-4 shadow-2xl shadow-emerald-500/30 backdrop-blur-xl">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                  <Sparkles color="#ffffff" size={16} />
                </View>
                <Text className="flex-1 text-sm font-semibold text-white">
                  {result.source === 'ai'
                    ? 'KI-Erkennung abgeschlossen'
                    : 'Keine KI verfügbar – Schätzwerte zum Anpassen'}
                </Text>
              </View>
            </View>

            <Card className="gap-4">
              <TextField label="Name" value={name} onChangeText={setName} />
              <TextField
                label="Menge"
                keyboardType="decimal-pad"
                value={grams}
                onChangeText={setGrams}
                suffix="g"
              />

              <Text className="pt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Nährwerte pro 100g (bearbeitbar)
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextField label="Kcal" keyboardType="decimal-pad" value={kcalPer100g} onChangeText={setKcalPer100g} />
                </View>
                <View className="flex-1">
                  <TextField label="Carbs" keyboardType="decimal-pad" value={carbsPer100g} onChangeText={setCarbsPer100g} suffix="g" />
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextField label="Protein" keyboardType="decimal-pad" value={proteinPer100g} onChangeText={setProteinPer100g} suffix="g" />
                </View>
                <View className="flex-1">
                  <TextField label="Fett" keyboardType="decimal-pad" value={fatPer100g} onChangeText={setFatPer100g} suffix="g" />
                </View>
              </View>
            </Card>

            <Card className="gap-2">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Gesamt für {parsedGrams > 0 ? Math.round(parsedGrams) : 0}g
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 dark:text-slate-300">Kalorien</Text>
                <Text className="text-base font-bold text-slate-900 dark:text-white">
                  {Math.round(totals.kcal)} kcal
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 dark:text-slate-300">Kohlenhydrate</Text>
                <Text className="text-sm text-slate-900 dark:text-white">{Math.round(totals.carbs)} g</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 dark:text-slate-300">Eiweiß</Text>
                <Text className="text-sm text-slate-900 dark:text-white">{Math.round(totals.protein)} g</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 dark:text-slate-300">Fett</Text>
                <Text className="text-sm text-slate-900 dark:text-white">{Math.round(totals.fat)} g</Text>
              </View>
            </Card>

            <Button
              label="Ins Tagebuch speichern"
              icon={<Check color="#ffffff" size={18} />}
              onPress={handleSave}
              disabled={parsedGrams <= 0}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
