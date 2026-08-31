import { useWindowDimensions } from 'react-native';

// Matches Tailwind's default `lg:` breakpoint so JS-driven layout swaps (the
// tab bar becoming a sidebar) line up with the className-driven ones. Below
// this, tablets and phones share the collapsible bottom nav bar.
export const DESKTOP_BREAKPOINT = 1024;

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= DESKTOP_BREAKPOINT;
}
