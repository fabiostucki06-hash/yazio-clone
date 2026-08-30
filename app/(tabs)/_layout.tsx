import { BookOpen, ChartColumn, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

const ACTIVE_COLOR = '#10b981';

function TabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  return (
    <View
      className={`items-center justify-center rounded-full px-4 py-1.5 transition-colors duration-200 ease-in-out ${
        focused ? 'bg-emerald-500/10' : 'bg-transparent'
      }`}
    >
      {children}
    </View>
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        tabBarShowLabel: true,
        tabBarBackground: () => (
          <View
            className="flex-1 overflow-hidden rounded-[28px] border border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70"
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 68,
          paddingTop: 8,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          shadowColor: '#0f172a',
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tagebuch',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <BookOpen color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="statistik"
        options={{
          title: 'Statistik',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <ChartColumn color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <User color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}
