import { BookOpen, ChartColumn, Timer, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';

const ACTIVE_COLOR = '#10b981';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        tabBarStyle: {
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tagebuch',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="fasten"
        options={{
          title: 'Fasten',
          tabBarIcon: ({ color, size }) => <Timer color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="statistik"
        options={{
          title: 'Statistik',
          tabBarIcon: ({ color, size }) => <ChartColumn color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
