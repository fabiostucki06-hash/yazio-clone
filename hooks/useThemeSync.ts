import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';

import { useThemeStore } from '@/store/themeStore';

export function useThemeSync() {
  const themePreference = useThemeStore((state) => state.themePreference);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(themePreference);
  }, [themePreference, setColorScheme]);
}
