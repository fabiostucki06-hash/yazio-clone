import type { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-black/20 ${className}`}
    >
      {children}
    </View>
  );
}
