import { Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable } from 'react-native';

import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle({ className }: { className?: string }) {
  const { colorScheme } = useColorScheme();
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={() => setThemePreference(isDark ? 'light' : 'dark')}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
      className={`h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5 ${className ?? ''}`}
    >
      {isDark ? <Sun color="#f59e0b" size={18} /> : <Moon color="#475569" size={18} />}
    </Pressable>
  );
}
