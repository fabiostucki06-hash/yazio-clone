import { router } from 'expo-router';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTIVITY_OPTIONS, ChipGroup, GENDER_OPTIONS, GOAL_OPTIONS } from '@/components/features/ProfileOptions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { pushSnapshot } from '@/services/cloudSync';
import { useSyncStore } from '@/store/syncStore';
import { useUserStore } from '@/store/userStore';
import type { ActivityLevel, Gender, Goal } from '@/utils/nutritionCalculator';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = ['account', 'goal', 'body'] as const;
type Step = (typeof STEPS)[number];
type AuthMode = 'signUp' | 'login';

export default function OnboardingScreen() {
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const signUp = useSyncStore((state) => state.signUp);
  const signIn = useSyncStore((state) => state.signIn);

  const [mode, setMode] = useState<AuthMode>('signUp');
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [completingProfile, setCompletingProfile] = useState(false);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const isEmailValid = EMAIL_PATTERN.test(trimmedEmail);
  const isAccountValid =
    mode === 'signUp' ? trimmedName.length > 0 && isEmailValid && password.length >= 6 : isEmailValid && password.length >= 6;

  const parsedAge = Number.parseInt(age, 10);
  const parsedHeight = Number.parseFloat(heightCm.replace(',', '.'));
  const parsedWeight = Number.parseFloat(weightKg.replace(',', '.'));
  const isBodyValid =
    Number.isFinite(parsedAge) && parsedAge > 0 && Number.isFinite(parsedHeight) && parsedHeight > 0 && Number.isFinite(parsedWeight) && parsedWeight > 0;

  const isStepValid =
    step === 'account' ? isAccountValid : step === 'goal' ? (completingProfile ? trimmedName.length > 0 : true) : isBodyValid;

  function selectMode(nextMode: AuthMode) {
    setMode(nextMode);
    setFormError(null);
    setConfirmationSent(false);
  }

  function handleBack() {
    if (stepIndex < 2) return;
    setStepIndex((index) => index - 1);
  }

  async function handleAccountSubmit() {
    if (!isAccountValid || submitting) return;
    setSubmitting(true);
    setFormError(null);
    setConfirmationSent(false);
    try {
      if (mode === 'login') {
        await signIn(trimmedEmail, password);
        if (useUserStore.getState().hasOnboarded) {
          router.replace('/(tabs)');
        } else {
          // Account exists but never finished the profile setup (e.g. an earlier
          // sign-up was interrupted before completing this wizard) — continue it
          // now instead of dropping the user into the app with placeholder data.
          setCompletingProfile(true);
          setStepIndex(1);
        }
        return;
      }

      const { needsEmailConfirmation } = await signUp(trimmedEmail, password);
      if (needsEmailConfirmation) {
        setConfirmationSent(true);
        setMode('login');
        return;
      }
      setStepIndex(1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFinish() {
    if (!isBodyValid) return;
    completeOnboarding(trimmedName, trimmedEmail);
    updateProfile({ age: parsedAge, gender, heightCm: parsedHeight, weightKg: parsedWeight, activityLevel, goal });

    const session = useSyncStore.getState().session;
    if (session) pushSnapshot(session.user.id).catch(() => {});

    router.replace('/(tabs)');
  }

  function handleNext() {
    if (!isStepValid) return;
    if (step === 'account') {
      handleAccountSubmit();
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }
    handleFinish();
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center gap-8 px-6 py-8" keyboardShouldPersistTaps="handled">
          <View className="items-center gap-4">
            <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <Sparkles color="#ffffff" size={32} />
            </View>
            <Text className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Coach imi</Text>
            {!(step === 'account' && mode === 'login') && (
              <View className="flex-row gap-2">
                {STEPS.map((s, index) => (
                  <View
                    key={s}
                    className={`h-1.5 w-8 rounded-full ${index <= stepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  />
                ))}
              </View>
            )}
          </View>

          {step === 'account' && (
            <Card className="gap-4">
              <View className="items-center gap-1">
                <Text className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {mode === 'signUp' ? 'Konto erstellen' : 'Willkommen zurück bei Coach imi'}
                </Text>
                <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                  {mode === 'signUp'
                    ? 'Erstelle ein Konto, damit dein Fortschritt in der Cloud gespeichert wird.'
                    : 'Melde dich mit deinem bestehenden Konto an.'}
                </Text>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => selectMode('signUp')}
                  className={`flex-1 items-center rounded-full border px-4 py-2 ${
                    mode === 'signUp' ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-white/60 bg-white/70 dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${mode === 'signUp' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    Registrieren
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => selectMode('login')}
                  className={`flex-1 items-center rounded-full border px-4 py-2 ${
                    mode === 'login' ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-white/60 bg-white/70 dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${mode === 'login' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    Anmelden
                  </Text>
                </Pressable>
              </View>

              {mode === 'signUp' && (
                <TextField label="Name" placeholder="Max Mustermann" value={name} onChangeText={setName} autoCapitalize="words" />
              )}
              <TextField
                label="E-Mail-Adresse"
                placeholder="max@beispiel.de"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              <TextField label="Passwort" placeholder="Mind. 6 Zeichen" value={password} onChangeText={setPassword} secureTextEntry />

              {formError && <Text className="text-xs text-red-500">{formError}</Text>}
              {confirmationSent && (
                <Text className="text-xs text-emerald-600 dark:text-emerald-400">
                  Bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben, und melde dich anschließend an.
                </Text>
              )}
            </Card>
          )}

          {step === 'goal' && (
            <Card className="gap-4">
              <View className="items-center gap-1">
                <Text className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {completingProfile ? 'Profil vervollständigen' : 'Dein Ziel'}
                </Text>
                <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                  {completingProfile
                    ? 'Dein Konto hat noch keine Profildaten. Bitte gib sie einmalig ein.'
                    : 'Damit berechnen wir deinen Kalorien- und Makrobedarf.'}
                </Text>
              </View>
              {completingProfile && (
                <TextField label="Name" placeholder="Max Mustermann" value={name} onChangeText={setName} autoCapitalize="words" />
              )}
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
            {stepIndex >= 2 && (
              <Pressable
                onPress={handleBack}
                className="h-[54px] w-[54px] items-center justify-center rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
              >
                <ChevronLeft color="#64748b" size={20} />
              </Pressable>
            )}
            <Button
              label={step === 'account' ? (mode === 'signUp' ? 'Konto erstellen' : 'Anmelden') : stepIndex < STEPS.length - 1 ? 'Weiter' : "Los geht's"}
              onPress={handleNext}
              disabled={!isStepValid || submitting}
              loading={submitting}
              className="flex-1"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
