import type { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View
      className={`rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20 ${className}`}
    >
      {children}
    </View>
  );
}
