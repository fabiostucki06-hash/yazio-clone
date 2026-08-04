import { Flame } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getLastUpdatedLabel(): string {
  if (process.env.EXPO_PUBLIC_BUILD_TIME) {
    return process.env.EXPO_PUBLIC_BUILD_TIME;
  }

  return new Date().toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomeScreen() {
  return (
    <SafeAreaView className="relative flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Flame color="#ffffff" size={32} />
        </View>
        <Text className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          YAZIO Klon
        </Text>
        <Text className="text-center text-base text-slate-500 dark:text-slate-400">
          Ernährungs- und Fitness-Tracker
        </Text>
      </View>
      <Text className="absolute bottom-4 left-4 text-xs text-slate-400 opacity-75">
        Zuletzt aktualisiert: {getLastUpdatedLabel()} Uhr
      </Text>
    </SafeAreaView>
  );
}
