import { useWindowDimensions } from 'react-native';

// Matches Tailwind's default `md:` breakpoint so JS-driven layout swaps (the
// tab bar becoming a sidebar) line up with the className-driven ones.
export const DESKTOP_BREAKPOINT = 768;

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= DESKTOP_BREAKPOINT;
}
