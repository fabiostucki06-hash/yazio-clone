import { Droplet, Egg, Ruler, Scale, Target, Wheat } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { User } from '@/types';

const mockUser: User = {
  id: 'u1',
  name: 'Max Mustermann',
  email: 'max.mustermann@example.com',
  dailyCalorieGoal: 2200,
  dailyMacroGoal: { carbs: 220, protein: 165, fat: 73 },
  weightKg: 78,
  heightCm: 180,
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-slate-800">
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="text-sm text-slate-500 dark:text-slate-400">{label}</Text>
      </View>
      <Text className="text-sm font-semibold text-slate-900 dark:text-white">{value}</Text>
    </View>
  );
}

export default function ProfilScreen() {
  const initial = mockUser.name.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 gap-6 px-6 pt-4">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">Profil</Text>

        <View className="items-center gap-3 rounded-2xl bg-white py-6 dark:bg-slate-800">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Text className="text-2xl font-bold text-white">{initial}</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-semibold text-slate-900 dark:text-white">
              {mockUser.name}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">{mockUser.email}</Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Ziele</Text>
          <InfoRow
            icon={<Target color="#22c55e" size={18} />}
            label="Tagesziel Kalorien"
            value={`${mockUser.dailyCalorieGoal} kcal`}
          />
          <InfoRow
            icon={<Wheat color="#3b82f6" size={18} />}
            label="Carbs"
            value={`${mockUser.dailyMacroGoal.carbs} g`}
          />
          <InfoRow
            icon={<Egg color="#ef4444" size={18} />}
            label="Protein"
            value={`${mockUser.dailyMacroGoal.protein} g`}
          />
          <InfoRow
            icon={<Droplet color="#f59e0b" size={18} />}
            label="Fett"
            value={`${mockUser.dailyMacroGoal.fat} g`}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Körperdaten</Text>
          <InfoRow
            icon={<Scale color="#64748b" size={18} />}
            label="Gewicht"
            value={mockUser.weightKg ? `${mockUser.weightKg} kg` : '—'}
          />
          <InfoRow
            icon={<Ruler color="#64748b" size={18} />}
            label="Größe"
            value={mockUser.heightCm ? `${mockUser.heightCm} cm` : '—'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
