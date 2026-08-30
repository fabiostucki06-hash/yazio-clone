import '@/global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { useThemeSync } from '@/hooks/useThemeSync';
import { useSyncStore } from '@/store/syncStore';

export default function RootLayout() {
  const init = useSyncStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  useAutoUpdate();
  useThemeSync();

  const stack = (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="add-food" options={{ presentation: 'modal' }} />
        <Stack.Screen name="barcode-scanner" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log-quantity" options={{ presentation: 'modal' }} />
        <Stack.Screen name="analyze-food" options={{ presentation: 'modal' }} />
        <Stack.Screen name="meal-detail" options={{ presentation: 'modal' }} />
      </Stack>
    </ErrorBoundary>
  );

  if (Platform.OS !== 'web') return stack;

  // Below the `md` breakpoint, keep the narrow phone-frame look. At `md` and
  // above, widen into a desktop dashboard capped at a sane max width.
  return (
    <View className="flex-1 items-center bg-slate-100 dark:bg-slate-950">
      <View className="w-full max-w-[480px] flex-1 md:max-w-7xl">{stack}</View>
    </View>
  );
}
