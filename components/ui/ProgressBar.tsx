import { View } from 'react-native';

interface ProgressBarProps {
  progress: number;
  color: string;
  trackClassName?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  color,
  trackClassName = 'bg-slate-200 dark:bg-slate-700',
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View className={`h-1.5 w-full overflow-hidden rounded-full ${trackClassName} ${className}`}>
      <View className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </View>
  );
}
