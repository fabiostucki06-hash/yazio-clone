import '@/global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { useThemeSync } from '@/hooks/useThemeSync';
import { useSyncStore } from '@/store/syncStore';

// On wide desktop browsers, cap the app to a phone-sized column instead of
// stretching a mobile layout edge-to-edge. No-op on native, where the app
// already fills the device screen.
const WEB_MAX_WIDTH = 480;

export default function RootLayout() {
  const init = useSyncStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  useAutoUpdate();
  useThemeSync();

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="add-food" options={{ presentation: 'modal' }} />
      <Stack.Screen name="barcode-scanner" options={{ presentation: 'modal' }} />
      <Stack.Screen name="log-quantity" options={{ presentation: 'modal' }} />
      <Stack.Screen name="analyze-food" options={{ presentation: 'modal' }} />
      <Stack.Screen name="meal-detail" options={{ presentation: 'modal' }} />
    </Stack>
  );

  if (Platform.OS !== 'web') return stack;

  return (
    <View className="flex-1 items-center bg-slate-100 dark:bg-slate-950">
      <View style={{ width: '100%', maxWidth: WEB_MAX_WIDTH, flex: 1 }}>{stack}</View>
    </View>
  );
}
