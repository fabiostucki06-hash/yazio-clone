import '@/global.css';

import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-food" options={{ presentation: 'modal' }} />
      <Stack.Screen name="barcode-scanner" options={{ presentation: 'modal' }} />
      <Stack.Screen name="log-quantity" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
