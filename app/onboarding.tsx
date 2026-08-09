import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useUserStore } from '@/store/userStore';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingScreen() {
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const isFormValid = trimmedName.length > 0 && EMAIL_PATTERN.test(trimmedEmail);

  function handleSubmit() {
    if (!isFormValid) return;
    completeOnboarding(trimmedName, trimmedEmail);
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-center gap-8 px-6">
          <View className="items-center gap-4">
            <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <Sparkles color="#ffffff" size={32} />
            </View>
            <View className="items-center gap-1">
              <Text className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Willkommen</Text>
              <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                Erstelle dein Profil, damit dein Fortschritt sicher auf diesem Gerät gespeichert wird.
              </Text>
            </View>
          </View>

          <Card className="gap-4">
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
            <Button label="Los geht's" onPress={handleSubmit} disabled={!isFormValid} className="mt-2" />
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
