import '@/global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { useSyncStore } from '@/store/syncStore';

export default function RootLayout() {
  const init = useSyncStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="add-food" options={{ presentation: 'modal' }} />
      <Stack.Screen name="barcode-scanner" options={{ presentation: 'modal' }} />
      <Stack.Screen name="log-quantity" options={{ presentation: 'modal' }} />
      <Stack.Screen name="analyze-food" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
