import { Droplet, Egg, Plus, Scale, Target, Wheat } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloudSyncCard } from '@/components/features/CloudSyncCard';
import { NUTRIENT_META, NUTRIENT_ORDER } from '@/components/features/nutrientMeta';
import { ACTIVITY_OPTIONS, ChipGroup, GENDER_OPTIONS, GOAL_OPTIONS } from '@/components/features/ProfileOptions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/ui/LineChart';
import { TextField } from '@/components/ui/TextField';
import { useUserStore } from '@/store/userStore';
import type { ActivityLevel, Gender, Goal } from '@/utils/nutritionCalculator';

function GoalInputRow({
  icon,
  label,
  value,
  onChangeText,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix: string;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="text-sm text-slate-500 dark:text-slate-400">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <TextInput
          className="w-16 text-right text-sm font-semibold text-slate-900 dark:text-white"
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
        />
        <Text className="text-sm text-slate-400">{suffix}</Text>
      </View>
    </View>
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfilScreen() {
  const user = useUserStore((state) => state.user);
  const weightHistory = useUserStore((state) => state.weightHistory);
  const updateAccount = useUserStore((state) => state.updateAccount);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const updateGoals = useUserStore((state) => state.updateGoals);
  const addWeightEntry = useUserStore((state) => state.addWeightEntry);
  const toggleNutrientVisibility = useUserStore((state) => state.toggleNutrientVisibility);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [age, setAge] = useState(String(user.age ?? 30));
  const [gender, setGender] = useState<Gender>(user.gender ?? 'male');
  const [heightCm, setHeightCm] = useState(String(user.heightCm ?? 180));
  const [weightKg, setWeightKg] = useState(String(user.weightKg ?? 78));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<Goal>(user.goal ?? 'maintain');
  const [newWeight, setNewWeight] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(String(user.dailyCalorieGoal));
  const [carbsGoal, setCarbsGoal] = useState(String(user.dailyMacroGoal.carbs));
  const [proteinGoal, setProteinGoal] = useState(String(user.dailyMacroGoal.protein));
  const [fatGoal, setFatGoal] = useState(String(user.dailyMacroGoal.fat));

  useEffect(() => {
    setCalorieGoal(String(user.dailyCalorieGoal));
    setCarbsGoal(String(user.dailyMacroGoal.carbs));
    setProteinGoal(String(user.dailyMacroGoal.protein));
    setFatGoal(String(user.dailyMacroGoal.fat));
  }, [user.dailyCalorieGoal, user.dailyMacroGoal.carbs, user.dailyMacroGoal.protein, user.dailyMacroGoal.fat]);

  // Recompute the calorie total only in response to an actual macro edit, not on
  // mount/external sync, since the stored macros don't perfectly round-trip to the
  // stored calorie goal (each macro is rounded independently).
  function recalcCalorieGoal(nextCarbs: string, nextProtein: string, nextFat: string) {
    const c = Number.parseFloat(nextCarbs.replace(',', '.'));
    const p = Number.parseFloat(nextProtein.replace(',', '.'));
    const f = Number.parseFloat(nextFat.replace(',', '.'));
    if (Number.isFinite(c) && Number.isFinite(p) && Number.isFinite(f)) {
      setCalorieGoal(String(Math.round(c * 4 + p * 4 + f * 9)));
    }
  }

  function handleCarbsChange(text: string) {
    setCarbsGoal(text);
    recalcCalorieGoal(text, proteinGoal, fatGoal);
  }

  function handleProteinChange(text: string) {
    setProteinGoal(text);
    recalcCalorieGoal(carbsGoal, text, fatGoal);
  }

  function handleFatChange(text: string) {
    setFatGoal(text);
    recalcCalorieGoal(carbsGoal, proteinGoal, text);
  }

  const initial = user.name.charAt(0).toUpperCase();

  const parsedAge = Number.parseInt(age, 10);
  const parsedHeight = Number.parseFloat(heightCm.replace(',', '.'));
  const parsedWeight = Number.parseFloat(weightKg.replace(',', '.'));
  const isFormValid =
    Number.isFinite(parsedAge) && parsedAge > 0 && Number.isFinite(parsedHeight) && parsedHeight > 0 && Number.isFinite(parsedWeight) && parsedWeight > 0;

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const isAccountValid = trimmedName.length > 0 && EMAIL_PATTERN.test(trimmedEmail);
  const isAccountDirty = trimmedName !== user.name || trimmedEmail !== user.email;

  const parsedCalorieGoal = Number.parseFloat(calorieGoal.replace(',', '.'));
  const parsedCarbsGoal = Number.parseFloat(carbsGoal.replace(',', '.'));
  const parsedProteinGoal = Number.parseFloat(proteinGoal.replace(',', '.'));
  const parsedFatGoal = Number.parseFloat(fatGoal.replace(',', '.'));
  const isGoalsFormValid =
    Number.isFinite(parsedCalorieGoal) &&
    parsedCalorieGoal > 0 &&
    Number.isFinite(parsedCarbsGoal) &&
    parsedCarbsGoal > 0 &&
    Number.isFinite(parsedProteinGoal) &&
    parsedProteinGoal > 0 &&
    Number.isFinite(parsedFatGoal) &&
    parsedFatGoal > 0;

  function handleSaveProfile() {
    if (!isFormValid) return;
    updateProfile({ age: parsedAge, gender, heightCm: parsedHeight, weightKg: parsedWeight, activityLevel, goal });
  }

  function handleSaveGoals() {
    if (!isGoalsFormValid) return;
    updateGoals({
      dailyCalorieGoal: Math.round(parsedCalorieGoal),
      dailyMacroGoal: { carbs: parsedCarbsGoal, protein: parsedProteinGoal, fat: parsedFatGoal },
    });
  }

  function handleSaveAccount() {
    if (!isAccountValid) return;
    updateAccount({ name: trimmedName, email: trimmedEmail });
  }

  function handleAddWeight() {
    const parsed = Number.parseFloat(newWeight.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    addWeightEntry(parsed);
    setWeightKg(String(parsed));
    setNewWeight('');
  }

  const chartPoints = weightHistory.map((entry) => entry.weightKg);
  const firstDate = weightHistory[0]?.date;
  const lastDate = weightHistory[weightHistory.length - 1]?.date;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-6 pt-4 pb-32">
        <Text className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profil</Text>

        <View className="items-center gap-3 rounded-[28px] border border-white/60 bg-white/70 py-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <Text className="text-2xl font-bold text-white">{initial || '?'}</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{user.name || 'Ohne Namen'}</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">{user.email || 'Keine E-Mail hinterlegt'}</Text>
          </View>
        </View>

        <Card className="gap-4">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Konto</Text>
          <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Max Mustermann" />
          <TextField
            label="E-Mail-Adresse"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="max@beispiel.de"
          />
          <Button
            label="Konto speichern"
            variant="secondary"
            onPress={handleSaveAccount}
            disabled={!isAccountValid || !isAccountDirty}
          />
        </Card>

        <CloudSyncCard />

        <View className="gap-2">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Ziele</Text>
          <GoalInputRow icon={<Target color="#10b981" size={18} />} label="Tagesziel Kalorien" value={calorieGoal} onChangeText={setCalorieGoal} suffix="kcal" />
          <GoalInputRow icon={<Wheat color="#3b82f6" size={18} />} label="Carbs" value={carbsGoal} onChangeText={handleCarbsChange} suffix="g" />
          <GoalInputRow icon={<Egg color="#ef4444" size={18} />} label="Protein" value={proteinGoal} onChangeText={handleProteinChange} suffix="g" />
          <GoalInputRow icon={<Droplet color="#f59e0b" size={18} />} label="Fett" value={fatGoal} onChangeText={handleFatChange} suffix="g" />
          <Button label="Ziele speichern" onPress={handleSaveGoals} disabled={!isGoalsFormValid} className="mt-1" />
        </View>

        <Card className="gap-4">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Ziel wählen</Text>
          <ChipGroup options={GOAL_OPTIONS} selected={goal} onSelect={setGoal} />

          <Text className="pt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Körperdaten</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField label="Alter" keyboardType="number-pad" value={age} onChangeText={setAge} suffix="Jahre" />
            </View>
            <View className="flex-1">
              <TextField label="Größe" keyboardType="decimal-pad" value={heightCm} onChangeText={setHeightCm} suffix="cm" />
            </View>
          </View>
          <TextField label="Gewicht" keyboardType="decimal-pad" value={weightKg} onChangeText={setWeightKg} suffix="kg" />

          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Geschlecht</Text>
          <ChipGroup options={GENDER_OPTIONS} selected={gender} onSelect={setGender} />

          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Aktivitätslevel</Text>
          <ChipGroup options={ACTIVITY_OPTIONS} selected={activityLevel} onSelect={setActivityLevel} />

          <Button label="BMR/TDEE berechnen & speichern" onPress={handleSaveProfile} disabled={!isFormValid} className="mt-2" />
        </Card>

        <Card className="gap-1">
          <Text className="pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Sichtbare Nährstoffe</Text>
          {NUTRIENT_ORDER.map((key, index) => {
            const { label, Icon, color } = NUTRIENT_META[key];
            const isVisible = user.visibleNutrients[key];
            return (
              <View
                key={key}
                className={`flex-row items-center justify-between py-3 ${
                  index > 0 ? 'border-t border-slate-200/50 dark:border-white/10' : ''
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <Icon color={color} size={18} />
                  <Text className="text-sm text-slate-700 dark:text-slate-200">{label}</Text>
                </View>
                <Switch
                  value={isVisible}
                  onValueChange={() => toggleNutrientVisibility(key)}
                  trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                  thumbColor="#ffffff"
                />
              </View>
            );
          })}
        </Card>

        <Card className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100/70 dark:bg-white/5">
              <Scale color="#64748b" size={18} />
            </View>
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Gewichtsverlauf</Text>
          </View>

          <LineChart points={chartPoints} firstLabel={firstDate} lastLabel={lastDate} color="#10b981" />

          <View className="flex-row items-end gap-3">
            <View className="flex-1">
              <TextField
                label="Neues Gewicht"
                keyboardType="decimal-pad"
                value={newWeight}
                onChangeText={setNewWeight}
                suffix="kg"
                placeholder={String(user.weightKg ?? '')}
              />
            </View>
            <Pressable
              onPress={handleAddWeight}
              className="h-[50px] w-[50px] items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 active:opacity-90 active:bg-emerald-600"
            >
              <Plus color="#ffffff" size={20} />
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
