import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { FoodApiError, getFoodByBarcode } from '@/services/foodApi';
import { useUiStore } from '@/store/uiStore';
import type { MealType } from '@/types';

export default function BarcodeScannerScreen() {
  const params = useLocalSearchParams<{ mealType: MealType }>();
  const mealType = params.mealType ?? 'breakfast';
  const setPendingSelection = useUiStore((state) => state.setPendingSelection);

  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const item = await getFoodByBarcode(data);
      setPendingSelection(item, mealType);
      router.replace('/log-quantity');
    } catch (err) {
      setError(err instanceof FoodApiError ? err.message : 'Produkt konnte nicht geladen werden.');
      setLoading(false);
      scannedRef.current = false;
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-6 pt-4">
        <Text className="text-lg font-bold tracking-tight text-white">Barcode scannen</Text>
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-150 ease-in-out active:scale-95 active:opacity-80"
          onPress={() => router.back()}
        >
          <X color="#ffffff" size={18} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {!permission ? (
          <ActivityIndicator color="#10b981" />
        ) : !permission.granted ? (
          <View className="items-center gap-4">
            <Text className="text-center text-sm text-white/80">
              Kamera-Zugriff wird benötigt, um Barcodes zu scannen.
            </Text>
            <Button label="Zugriff erlauben" onPress={requestPermission} />
          </View>
        ) : (
          <View className="aspect-square w-full overflow-hidden rounded-[28px] border border-white/20">
            <CameraView
              className="flex-1"
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
              }}
              onBarcodeScanned={loading ? undefined : handleBarcodeScanned}
            />
          </View>
        )}

        {loading && (
          <View className="absolute inset-0 items-center justify-center bg-black/50 backdrop-blur-md">
            <ActivityIndicator color="#10b981" size="large" />
          </View>
        )}
      </View>

      {error && (
        <View className="gap-3 px-6 pb-8">
          <Text className="text-center text-sm text-red-400">{error}</Text>
          <Button label="Erneut versuchen" variant="secondary" onPress={() => setError(null)} />
        </View>
      )}
    </SafeAreaView>
  );
}
