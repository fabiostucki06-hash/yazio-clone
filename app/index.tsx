import { Flame } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
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
    </SafeAreaView>
  );
}
