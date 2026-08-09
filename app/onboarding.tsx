import { router } from 'expo-router';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTIVITY_OPTIONS, ChipGroup, GENDER_OPTIONS, GOAL_OPTIONS } from '@/components/features/ProfileOptions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useUserStore } from '@/store/userStore';
import type { ActivityLevel, Gender, Goal } from '@/utils/nutritionCalculator';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = ['account', 'goal', 'body'] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingScreen() {
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const updateProfile = useUserStore((state) => state.updateProfile);

  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const isAccountValid = trimmedName.length > 0 && EMAIL_PATTERN.test(trimmedEmail);

  const parsedAge = Number.parseInt(age, 10);
  const parsedHeight = Number.parseFloat(heightCm.replace(',', '.'));
  const parsedWeight = Number.parseFloat(weightKg.replace(',', '.'));
  const isBodyValid =
    Number.isFinite(parsedAge) && parsedAge > 0 && Number.isFinite(parsedHeight) && parsedHeight > 0 && Number.isFinite(parsedWeight) && parsedWeight > 0;

  const isStepValid = step === 'account' ? isAccountValid : step === 'goal' ? true : isBodyValid;

  function handleBack() {
    if (stepIndex === 0) return;
    setStepIndex((index) => index - 1);
  }

  function handleNext() {
    if (!isStepValid) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }

    completeOnboarding(trimmedName, trimmedEmail);
    updateProfile({ age: parsedAge, gender, heightCm: parsedHeight, weightKg: parsedWeight, activityLevel, goal });
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center gap-8 px-6 py-8" keyboardShouldPersistTaps="handled">
          <View className="items-center gap-4">
            <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <Sparkles color="#ffffff" size={32} />
            </View>
            <View className="flex-row gap-2">
              {STEPS.map((s, index) => (
                <View
                  key={s}
                  className={`h-1.5 w-8 rounded-full ${index <= stepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                />
              ))}
            </View>
          </View>

          {step === 'account' && (
            <Card className="gap-4">
              <View className="items-center gap-1">
                <Text className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Willkommen</Text>
                <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Erstelle dein Profil, damit dein Fortschritt gespeichert wird.
                </Text>
              </View>
              <TextField label="Name" placeholder="Max Mustermann" value={name} onChangeText={setName} autoCapitalize="words" />
              <TextField
                label="E-Mail-Adresse"
                placeholder="max@beispiel.de"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </Card>
          )}

          {step === 'goal' && (
            <Card className="gap-4">
              <View className="items-center gap-1">
                <Text className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dein Ziel</Text>
                <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Damit berechnen wir deinen Kalorien- und Makrobedarf.
                </Text>
              </View>
              <ChipGroup options={GOAL_OPTIONS} selected={goal} onSelect={setGoal} />
            </Card>
          )}

          {step === 'body' && (
            <Card className="gap-4">
              <View className="items-center gap-1">
                <Text className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Körperdaten</Text>
                <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Für die Berechnung deines Tagesbedarfs (Mifflin-St-Jeor).
                </Text>
              </View>
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
            </Card>
          )}

          <Text className="text-center text-xs text-slate-400">
            Du kannst diese Angaben jederzeit im Profil unter Einstellungen ändern.
          </Text>

          <View className="flex-row gap-3">
            {stepIndex > 0 && (
              <Pressable
                onPress={handleBack}
                className="h-[54px] w-[54px] items-center justify-center rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
              >
                <ChevronLeft color="#64748b" size={20} />
              </Pressable>
            )}
            <Button
              label={stepIndex < STEPS.length - 1 ? 'Weiter' : "Los geht's"}
              onPress={handleNext}
              disabled={!isStepValid}
              className="flex-1"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
